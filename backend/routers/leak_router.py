"""
YardSight AI - Roof Leak & Physical Actuator Router
"""

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session
from database import get_db
from schemas.leak import LeakStatusResponse, ActuatorRequest, ActuatorResponse
from services.leak_service import leak_service

router = APIRouter(prefix="/leak", tags=["Roof Moisture & Actuator Safety"])

@router.get("/status", response_model=LeakStatusResponse)
def get_leak_status(
    intensity: float = Query(0.0, ge=0.0, le=1.0, description="Rain intensity (0.0 to 1.0)")
):
    """Simulates or analyzes CCTV frames for specular water reflections and wet concrete albedo drops."""
    return leak_service.get_status(intensity)

@router.post("/actuator/pump", response_model=ActuatorResponse)
def activate_sump_pump(req: ActuatorRequest, db: Session = Depends(get_db)):
    """Triggers autonomous physical flood sump pump for water evacuation."""
    return leak_service.trigger_pump(req, db)

@router.post("/actuator/forklift", response_model=ActuatorResponse)
def divert_forklift_traffic(req: ActuatorRequest, db: Session = Depends(get_db)):
    """Engages safety interlock rerouting forklift traffic away from wet concrete zones."""
    return leak_service.trigger_forklift_divert(req, db)
