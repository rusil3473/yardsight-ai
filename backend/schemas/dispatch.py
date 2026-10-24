"""
YardSight AI - Driver Dispatch & Notification Pydantic Schemas
"""

from typing import Optional
from pydantic import BaseModel, Field

class DispatchAlertRequest(BaseModel):
    truck_id: str = Field(..., description="Unique truck identifier")
    phone: Optional[str] = Field("+91-98765-43210", description="Driver mobile number")
    channel: Optional[str] = Field("WHATSAPP", description="WHATSAPP or SMS")
    message: Optional[str] = Field(None, description="Custom dispatch message")
    custom_message: Optional[str] = None

class DispatchAlertResponse(BaseModel):
    status: str
    message: str
    truck_id: str
    phone: str
    channel: str
    timestamp: str
