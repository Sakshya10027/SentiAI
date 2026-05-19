from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from sqlalchemy import Column, Integer, String, JSON
from database import Base

class BehavioralSession(Base):
    __tablename__ = "behavioral_sessions"
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String, index=True)
    typing_data = Column(JSON)
    mouse_data = Column(JSON)
    device_data = Column(JSON)
    geo_data = Column(JSON)

class BehaviorData(BaseModel):
    typing: List[Dict[str, Any]]
    mouse: List[Dict[str, Any]]

class DeviceData(BaseModel):
    userAgent: str
    language: str
    screenResolution: str
    timezone: str
    hardwareConcurrency: int
    os: Optional[str] = "Unknown"
    platform: Optional[str] = "Unknown"
    deviceMemory: Optional[float] = None

class LoginRequest(BaseModel):
    username: str
    password: str
    behavior: Optional[BehaviorData] = None
    device: Optional[DeviceData] = None
    ip_address: Optional[str] = None
    
class LoginResponse(BaseModel):
    status: str
    message: str
    token: Optional[str] = None

class TransferRequest(BaseModel):
    username: str
    recipient: str
    amount: float
    behavior: Optional[BehaviorData] = None
    device: Optional[DeviceData] = None
    ip_address: Optional[str] = None
