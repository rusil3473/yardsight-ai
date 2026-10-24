"""
YardSight AI - Roof Leak & Physical Actuator Service Layer
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models import AuditLog
from leak_detector import leak_detector
from schemas.leak import LeakStatusResponse, ActuatorRequest, ActuatorResponse, LeakMetrics

class LeakService:
    """Service encapsulating roof moisture computer vision, leak progression, and actuator commands."""

    @staticmethod
    def get_status(intensity: float) -> LeakStatusResponse:
        leak_data = leak_detector.simulate_leak_cctv(intensity)
        raw_m = leak_data["metrics"]
        
        sqm = float(raw_m.get("estimated_surface_area_sqm", 0.0))
        action = "DISPATCH_SUMP_PUMP" if sqm > 2.0 else "INSPECT_BAY" if sqm > 0.5 else "NOMINAL"
        velocity = round(intensity * 12.5, 1)

        metrics = LeakMetrics(
            wet_pixels=int(raw_m.get("wet_pixels", 0)),
            estimated_surface_area_sqm=sqm,
            expansion_velocity_cm_per_min=float(raw_m.get("expansion_velocity_cm_per_min", velocity)),
            severity=str(raw_m.get("severity", "NOMINAL")),
            action_required=str(raw_m.get("action_required", action))
        )

        return LeakStatusResponse(
            status="ACTIVE_SCAN",
            rain_intensity=intensity,
            wet_area_sqm=sqm,
            leak_rate_liters_per_hour=float(leak_data.get("leak_rate_liters_per_hour", round(sqm * 12.5, 1))),
            leak_severity=str(raw_m.get("severity", "NOMINAL")),
            action_dispatched=action,
            metrics=metrics,
            cctv_frame_b64=leak_data.get("cctv_frame_b64")
        )


    @staticmethod
    def trigger_pump(req: ActuatorRequest, db: Session) -> ActuatorResponse:
        pump_id = req.pump_id or "PUMP-NORTH-01"
        log = AuditLog(
            action="ACTUATOR_PUMP_TRIGGERED",
            target=f"Bay {req.bay_id} - {pump_id}",
            actor=req.initiated_by or "YardSight AI Actuator Engine",
            details=f"Autonomous flood pump engaged for bay {req.bay_id} due to concrete puddle threshold breach."
        )
        db.add(log)
        db.commit()

        return ActuatorResponse(
            status="SUCCESS",
            action="SUMP_PUMP_ACTIVATED",
            target=f"{pump_id} @ {req.bay_id}",
            message=f"Actuator command sent: {pump_id} energized at 1200 RPM for {req.bay_id}.",
            timestamp=datetime.utcnow().isoformat()
        )

    @staticmethod
    def trigger_forklift_divert(req: ActuatorRequest, db: Session) -> ActuatorResponse:
        divert = req.divert_zone or "DRY-ZONE-B"
        log = AuditLog(
            action="ACTUATOR_FORKLIFT_DIVERT",
            target=f"Bay {req.bay_id} -> {divert}",
            actor=req.initiated_by or "YardSight AI Safety Interlock",
            details=f"Automated pallet forklift traffic rerouted from {req.bay_id} to {divert} to protect moisture-sensitive dry goods."
        )
        db.add(log)
        db.commit()

        return ActuatorResponse(
            status="SUCCESS",
            action="FORKLIFT_FLEET_REROUTED",
            target=f"Fleet redirected to {divert}",
            message=f"Safety interlock engaged: Inbound forklifts rerouted away from {req.bay_id} to {divert}.",
            timestamp=datetime.utcnow().isoformat()
        )

leak_service = LeakService()
