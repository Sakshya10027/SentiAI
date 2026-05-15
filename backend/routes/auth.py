from fastapi import APIRouter, HTTPException, Depends, Request
from sqlalchemy.orm import Session
from models import LoginRequest, LoginResponse, BehavioralSession
from database import get_db
from ml.features import extract_features
from ws import manager
from config import settings # <--- Import Settings
import joblib
import os
import requests

router = APIRouter()

def get_risk_score(behavior_data: dict, device_data: dict, geo_data: dict) -> float:
    base_score = 0.0
    
    country = geo_data.get("country")
    if country and country not in ["United States", "Local"]:
        base_score += 85.0

    if device_data and "HeadlessChrome" in device_data.get("userAgent", ""):
        base_score += 40.0

    # FIXED: Use path from environment variables
    if os.path.exists(settings.MODEL_PATH) and behavior_data:
        try:
            model = joblib.load(settings.MODEL_PATH)
            features = extract_features(behavior_data)
            score = model.decision_function([features])[0]
            ml_risk = 50 - (score * 100)
            base_score += max(0.0, float(ml_risk))
        except: pass

    return max(0.0, min(100.0, base_score))

async def notify_dashboard(alert_data: dict):
    await manager.broadcast(alert_data)

@router.post("/login", response_model=LoginResponse)
async def login(req_body: LoginRequest, req: Request, db: Session = Depends(get_db)):
    
    # FIXED: Validate against environment variables
    if req_body.username != settings.ADMIN_USER or req_body.password != settings.ADMIN_PASS:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    client_ip = req_body.ip_address or req.client.host
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

    alert_type = "Suspicious Behavior"
    if geo_data.get("country") not in ["United States", "Local"]: alert_type = f"Impossible Travel ({geo_data.get('country')})"
    elif "HeadlessChrome" in device_dict.get("userAgent", ""): alert_type = "Bot Signature Detected"
    elif risk_score > 80: alert_type = "High Risk Anomaly"

    if risk_score > 40:
        await notify_dashboard({
            "user": req_body.username,
            "risk": risk_score,
            "type": alert_type
        })

    if risk_score > 80:
        raise HTTPException(status_code=403, detail=f"High security risk detected. Access blocked.")
    elif risk_score > 40:
        return LoginResponse(status="mfa_required", message="Suspicious behavior detected. Please verify OTP.", token=None)
    
    # FIXED: Issue the secret token from environment variables
    return LoginResponse(status="success", message="Authenticated successfully.", token=settings.JWT_SECRET)