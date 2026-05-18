from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from typing import Optional
from models import LoginRequest, LoginResponse, BehavioralSession, BehaviorData, DeviceData, TransferRequest
from database import get_db
from ml.features import extract_features
from ws import manager
import joblib
import os
import requests
from config import settings

router = APIRouter()

def check_ip_security(ip: str) -> dict:
    """
    Checks if an IP is a VPN, Proxy, or Tor node using ipinfo.io.
    Returns a dict with 'is_secure' (bool) and 'detail' (str).
    """
    if ip in ["127.0.0.1", "localhost", "::1"]:
        return {"is_secure": True, "detail": "Localhost"}

    try:
        # Use ipinfo.io for VPN detection (requires privacy token for full VPN details, 
        # but basic version still gives company/type info)
        token = settings.IPINFO_TOKEN
        url = f"https://ipinfo.io/{ip}/json"
        if token:
            url += f"?token={token}"
        
        response = requests.get(url, timeout=5).json()
        
        # Privacy detection logic (for free tier, we look at 'org' or 'hostname' 
        # as indicators if privacy field is missing)
        is_vpn = False
        reason = "Clean IP"

        privacy = response.get("privacy", {})
        if privacy.get("vpn") or privacy.get("proxy") or privacy.get("tor") or privacy.get("relay"):
            is_vpn = True
            reason = "VPN/Proxy detected"
        
        # Heuristic for free tier (looking for common data center keywords in org)
        org = response.get("org", "").lower()
        if not is_vpn and any(kw in org for kw in ["amazon", "google", "digitalocean", "linode", "m247", "ovh", "hosting", "datacenter"]):
            is_vpn = True
            reason = "Data center/Hosting IP detected"

        if is_vpn:
            return {"is_secure": False, "detail": reason}
        
        return {"is_secure": True, "detail": "Clean IP"}
    except Exception as e:
        print(f"IP Security Check Error: {e}")
        return {"is_secure": True, "detail": "Check failed, defaulting to secure"}

def get_risk_score(behavior_data: dict, device_data: dict, geo_data: dict) -> float:
    base_score = 0.0
    
    country = geo_data.get("country")
    if country and country not in ["United States", "Local"]:
        # Reduced penalty from 85 to 30 so it doesn't trigger MFA by itself
        base_score += 30.0

    if device_data and "HeadlessChrome" in device_data.get("userAgent", ""):
        base_score += 40.0

    if behavior_data:
        features_dict = extract_features(behavior_data)
        
        # 1. Copy-Paste Detection
        if features_dict.get("is_paste") == 1.0:
            print("DEBUG: Copy-paste detected!")
            base_score += 65.0  # Immediately triggers MFA (threshold 60)

        # 2. Speed Anomaly Detection
        avg_dwell = features_dict.get("avg_dwell", 0)
        avg_flight = features_dict.get("avg_flight", 0)
        min_flight = features_dict.get("min_flight", 0)
        
        # Very Fast (Robotic or very fast human)
        # Increased thresholds: humans rarely average below 120ms flight time during passwords
        if (0 < avg_dwell < 60) or (0 < avg_flight < 110) or (0 < min_flight < 50):
            print(f"DEBUG: Fast speed detected! Dwell: {avg_dwell:.2f}, Flight: {avg_flight:.2f}, Min Flight: {min_flight:.2f}")
            base_score += 70.0
            
        # Very Slow (Suspicious)
        if avg_dwell > 500 or avg_flight > 1000:
            print(f"DEBUG: Suspiciously slow speed detected! Dwell: {avg_dwell}, Flight: {avg_flight}")
            base_score += 65.0

        # 3. Machine Learning Anomaly Detection
        if os.path.exists(settings.MODEL_PATH):
            try:
                model = joblib.load(settings.MODEL_PATH)
                # Use the standard 4 features for the model
                ml_features = [
                    features_dict["avg_dwell"],
                    features_dict["avg_flight"],
                    features_dict["avg_mouse_speed"],
                    features_dict["click_count"]
                ]
                score = model.decision_function([ml_features])[0]
                ml_risk = 40 - (score * 100)
                base_score += max(0.0, float(ml_risk))
            except Exception as e:
                print(f"DEBUG: ML Model Error: {e}")

    return max(0.0, min(100.0, base_score))

async def notify_dashboard(alert_data: dict):
    await manager.broadcast(alert_data)


@router.post("/transfer")
async def transfer(req_body: TransferRequest, req: Request):
    client_ip = req_body.ip_address or req.client.host
    # Check for VPN mid-session
    ip_check = check_ip_security(client_ip)
    if not ip_check["is_secure"]:
        await notify_dashboard({
            "user": req_body.username,
            "risk": 100,
            "type": f"VPN Detected Mid-Session: {ip_check['detail']}"
        })
        raise HTTPException(status_code=403, detail="Impossible location detected. Access blocked.")

    behavior_dict = {"typing": [], "mouse": []}
    if req_body.behavior:
        behavior_dict["typing"] = req_body.behavior.model_dump()["typing"] if hasattr(req_body.behavior, 'model_dump') else req_body.behavior.dict()["typing"]
        behavior_dict["mouse"] = req_body.behavior.model_dump()["mouse"] if hasattr(req_body.behavior, 'model_dump') else req_body.behavior.dict()["mouse"]
    
    device_dict = req_body.device.model_dump() if hasattr(req_body.device, 'model_dump') else req_body.device.dict() if req_body.device else {}
    
    risk_score = get_risk_score(behavior_dict, device_dict, {"country": "Local"})
    
    # 1. Large Amount Check (Rule: >= $1000 requires OTP)
    is_large_amount = req_body.amount >= 1000
    
    # 2. Behavioral Checks (Speed Anomaly)
    features = extract_features(behavior_dict)
    avg_dwell = features.get("avg_dwell", 0)
    avg_flight = features.get("avg_flight", 0)
    
    # Robotic/Fast
    is_robotic = (0 < avg_dwell < 60) or (0 < avg_flight < 110)
    # Suspiciously Slow
    is_slow = (avg_dwell > 500) or (avg_flight > 1000)

    if is_robotic or is_slow:
        await notify_dashboard({
            "user": req_body.username,
            "risk": 95,
            "type": "Fraudulent Transfer Attempt (Biometric Anomaly)"
        })
        raise HTTPException(status_code=403, detail="Payment blocked: Suspicious biometric patterns detected.")

    if is_large_amount or risk_score > 60:
        await notify_dashboard({
            "user": req_body.username,
            "risk": risk_score if not is_large_amount else 65,
            "type": "High Value Transfer Verification" if is_large_amount else "Suspicious Transfer Behavior"
        })
        return {"status": "mfa_required", "message": "High-value or unusual transaction. Please verify OTP."}

    return {"status": "success", "message": f"Successfully transferred ${req_body.amount} to {req_body.recipient}"}

@router.post("/login", response_model=LoginResponse)
async def login(req_body: LoginRequest, req: Request, db: Session = Depends(get_db)):
    
    # FIXED: Validate against environment variables
    if req_body.username != settings.ADMIN_USER or req_body.password != settings.ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    client_ip = req_body.ip_address or req.client.host
    
    # VPN/Proxy Check at Login
    ip_check = check_ip_security(client_ip)
    if not ip_check["is_secure"]:
        await notify_dashboard({
            "user": req_body.username,
            "risk": 100,
            "type": f"Login Blocked: {ip_check['detail']}"
        })
        raise HTTPException(status_code=403, detail="Impossible location detected. Access blocked.")

    geo_data = {"country": "Local", "city": "Unknown"}
    if client_ip not in ["127.0.0.1", "localhost"]:
        try:
            res = requests.get(f"http://ip-api.com/json/{client_ip}", timeout=2).json()
            if res.get("status") == "success": geo_data = res
        except: pass

    behavior_dict = {"typing": [], "mouse": []}
    device_dict = req_body.device.model_dump() if hasattr(req_body.device, 'model_dump') else req_body.device.dict() if req_body.device else {}
    
    if req_body.behavior:
        behavior_dict["typing"] = req_body.behavior.model_dump()["typing"] if hasattr(req_body.behavior, 'model_dump') else req_body.behavior.dict()["typing"]
        behavior_dict["mouse"] = req_body.behavior.model_dump()["mouse"] if hasattr(req_body.behavior, 'model_dump') else req_body.behavior.dict()["mouse"]

    risk_score = get_risk_score(behavior_dict, device_dict, geo_data)
    print(f"DEBUG: Login Attempt for {req_body.username} | Risk Score: {risk_score:.2f}")

    alert_type = "Suspicious Behavior"
    if geo_data.get("country") not in ["United States", "Local"]: alert_type = f"Impossible Travel ({geo_data.get('country')})"
    elif "HeadlessChrome" in device_dict.get("userAgent", ""): alert_type = "Bot Signature Detected"
    elif risk_score > 85: alert_type = "High Risk Anomaly"

    if risk_score > 60:
        await notify_dashboard({
            "user": req_body.username,
            "risk": risk_score,
            "type": alert_type
        })

    if risk_score > 85:
        raise HTTPException(status_code=403, detail=f"High security risk detected. Access blocked.")
    elif risk_score > 60:
        return LoginResponse(status="mfa_required", message="Suspicious behavior detected. Please verify OTP.", token=None)
    
    # FIXED: Issue the secret token from environment variables
    return LoginResponse(status="success", message="Authenticated successfully.", token=settings.JWT_SECRET)

@router.get("/verify-session")
async def verify_session(req: Request):
    """
    Continuous session monitoring endpoint.
    Called by frontend to ensure current IP is still secure.
    """
    client_ip = req.client.host
    ip_check = check_ip_security(client_ip)
    
    if not ip_check["is_secure"]:
        return {"status": "blocked", "detail": "Impossible location detected. Access blocked."}
    
    return {"status": "active"}