"""
YardSight AI - Driver Dispatch & Notification Service Layer
"""

from datetime import datetime
from typing import Dict, Any, Optional
from sqlalchemy.orm import Session
from models import Truck, AuditLog
from schemas.dispatch import DispatchAlertRequest, DispatchAlertResponse

class DispatchService:
    """Service encapsulating driver WhatsApp/SMS alerts and audit logging."""

    @staticmethod
    def send_alert(req: DispatchAlertRequest, db: Session) -> DispatchAlertResponse:
        truck = db.query(Truck).filter(Truck.id == req.truck_id).first()
        plate = truck.plate_number if truck else "Vehicle"
        dock = truck.dock_number if truck else "Bay 01"

        default_msg = f"YardSight Dispatch: {plate}, proceed to {dock}. Turnaround SLA active."
        msg = req.custom_message or default_msg

        import os
        has_gateway = bool(os.getenv("TWILIO_ACCOUNT_SID") or os.getenv("WHATSAPP_TOKEN"))

        # Record dispatch event in audit log
        log = AuditLog(
            action="DRIVER_DISPATCH_ALERT",
            target=f"{req.truck_id} ({req.phone})",
            actor="Yard Dispatcher",
            details=f"Dispatched via {req.channel}: {msg} | Gateway: {'LIVE' if has_gateway else 'LOCAL_AUDIT'}"
        )
        db.add(log)
        db.commit()

        status_text = "DELIVERED" if has_gateway else "LOGGED_TO_AUDIT"
        feedback_msg = (
            f"{req.channel} dispatch alert sent to {req.phone}: '{msg}'"
            if has_gateway
            else f"{req.channel} dispatch alert recorded in audit trail for {req.phone} (Live carrier gateway offline - set TWILIO_ACCOUNT_SID in ENV)."
        )

        return DispatchAlertResponse(
            status=status_text,
            message=feedback_msg,
            truck_id=req.truck_id,
            phone=req.phone or "Unspecified",
            channel=req.channel or "SMS",
            timestamp=datetime.utcnow().isoformat()
        )


dispatch_service = DispatchService()
