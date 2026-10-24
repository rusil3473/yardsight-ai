"""
YardSight AI - Driver Dispatch & Alerts Router
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.dispatch import DispatchAlertRequest, DispatchAlertResponse
from services.dispatch_service import dispatch_service

router = APIRouter(prefix="/dispatch", tags=["Dispatch & Communications"])

@router.post("/alert", response_model=DispatchAlertResponse)
def send_driver_dispatch_alert(req: DispatchAlertRequest, db: Session = Depends(get_db)):
    """Routes automated turn-by-turn dock assignments to driver WhatsApp or SMS."""
    return dispatch_service.send_alert(req, db)
