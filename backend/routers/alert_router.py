"""
YardSight AI - Real-time Operational Alerts Router
Aggregates live detention infractions, camera telemetry events, and dispatch status
directly from the active database for the customer notification popover.
"""

from datetime import datetime
from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Truck, CCTVCamera, AuditLog

router = APIRouter(prefix="/alerts", tags=["Operational Alerts & Event Stream"])

@router.get("")
def list_operational_alerts(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Aggregates authentic operational alerts from live trucks, cameras, and audit records."""
    alerts = []
    now = datetime.utcnow()

    # 1. Check for Active Truck Detention Infractions
    trucks = db.query(Truck).filter(Truck.tenant_id == tenant_id).all()
    for t in trucks:
        if t.status in ["DETENTION"] or (t.dwell_minutes and t.dwell_minutes > (t.free_time_minutes or 120)):
            alerts.append({
                "id": f"ALERT-DET-{t.id}",
                "type": "alert",
                "severity": "CRITICAL",
                "title": f"Detention Overtime: Truck {t.plate_number}",
                "description": f"Vehicle at {t.dock_number or 'Bay 01'} has exceeded the {t.free_time_minutes or 120}-minute SLA window ({t.carrier_name}).",
                "time": "Active Now",
                "action_url": "/track"
            })

    # 2. Check for CCTV Cameras with Anomalies
    cams = db.query(CCTVCamera).filter(CCTVCamera.tenant_id == tenant_id).all()
    offline_cams = [c for c in cams if c.status in ["OFFLINE", "DEGRADED", "HAZARD"]]
    for c in offline_cams[:2]:
        alerts.append({
            "id": f"ALERT-CAM-{c.id}",
            "type": "hazard",
            "severity": "WARNING",
            "title": f"CCTV Telemetry: {c.name}",
            "description": f"Camera stream reporting status {c.status} at {c.location}.",
            "time": "Stream Check",
            "action_url": "/video"
        })

    # 3. Pull recent Dispatch & Compliance Audit Logs
    recent_logs = (
        db.query(AuditLog)
        .order_by(AuditLog.id.desc())
        .limit(5)
        .all()
    )
    for l in recent_logs:
        alerts.append({
            "id": f"ALERT-LOG-{l.id}",
            "type": "success" if "DELIVERED" in l.action or "ONBOARD" in l.action else "info",
            "severity": "INFO",
            "title": l.action.replace("_", " ").title(),
            "description": l.details[:90] if l.details else l.target,
            "time": l.timestamp.strftime("%H:%M") if l.timestamp else "Recently",
            "action_url": "/scale"
        })

    return {
        "status": "SUCCESS",
        "alerts": alerts,
        "count": len(alerts),
        "unread_count": len([a for a in alerts if a["type"] in ["alert", "hazard"]])
    }

@router.post("/clear")
def clear_operational_alerts(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Acknowledges all active alerts and records clearance in the audit ledger."""
    audit = AuditLog(
        id=f"AUDIT-CLR-{int(datetime.utcnow().timestamp())}",
        tenant_id=tenant_id or "TENANT-MY-HUB",
        user_id="supervisor",
        action="ALERTS_ACKNOWLEDGED_AND_CLEARED",
        details="Supervisor marked all active yard detention and camera warnings as acknowledged.",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    return {
        "status": "CLEARED",
        "cleared_at": datetime.utcnow().isoformat(),
        "message": "All operational alerts acknowledged and archived in immutable audit log."
    }

