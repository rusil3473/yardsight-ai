"""
YardSight AI - Enterprise Support Hub & SLA Ticketing Router
Handles customer incident reporting, 24/7 NOC escalation, and technical support ticketing.
"""

from datetime import datetime
import uuid
from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import get_db
from models import SupportTicket, AuditLog, Tenant

router = APIRouter(prefix="/support", tags=["Enterprise Support Hub & SLA"])

class CreateTicketPayload(BaseModel):
    tenant_id: Optional[str] = "TENANT-MY-HUB"
    user_email: str = Field(..., example="admin@logistics.corp")
    category: str = Field("HARDWARE_CCTV", example="HARDWARE_CCTV")
    subject: str = Field(..., min_length=3, max_length=256)
    urgency: str = Field("MEDIUM", example="HIGH")
    description: str = Field(..., min_length=5)

class TicketStatusUpdate(BaseModel):
    status: str = Field(..., example="RESOLVED")

@router.get("/sla")
def get_support_sla_matrix():
    """Returns official B2B Enterprise Support Level Agreements & NOC escalation contacts."""
    return {
        "status": "ACTIVE",
        "sla_tiers": [
            {
                "tier": "P1 - Critical",
                "label": "Facility Stoppage / Gate ANPR Outage",
                "first_response": "15 Minutes",
                "resolution_sla": "2 Hours",
                "channel": "Dedicated NOC Phone + WhatsApp Hotline"
            },
            {
                "tier": "P2 - High",
                "label": "Camera Offline / Dwell SLA Anomaly",
                "first_response": "45 Minutes",
                "resolution_sla": "6 Hours",
                "channel": "Direct Priority Ticket + Slack/Teams Channel"
            },
            {
                "tier": "P3 - Standard",
                "label": "E-Way Bill Sync / Portal Inquiries",
                "first_response": "2 Hours",
                "resolution_sla": "24 Hours",
                "channel": "Support Portal & Email"
            }
        ],
        "emergency_hotline": "+91 (080) 4567-9000",
        "noc_email": "noc-escalations@yardsight.corp",
        "coverage": "24x7x365 Continuous Industrial Monitoring"
    }

@router.post("/tickets", status_code=status.HTTP_201_CREATED)
def submit_support_ticket(payload: CreateTicketPayload, db: Session = Depends(get_db)):
    """Submits a new customer issue, assigns a tracking ID, and notifies engineering NOC."""
    tid = payload.tenant_id or "TENANT-MY-HUB"
    ticket_id = f"TICK-{uuid.uuid4().hex[:8].upper()}"

    ticket = SupportTicket(
        id=ticket_id,
        tenant_id=tid,
        user_email=payload.user_email,
        category=payload.category,
        subject=payload.subject,
        urgency=payload.urgency,
        description=payload.description,
        status="OPEN",
        created_at=datetime.utcnow()
    )
    db.add(ticket)

    # Log to immutable audit trail
    audit = AuditLog(
        id=f"AUDIT-TICK-{uuid.uuid4().hex[:6].upper()}",
        tenant_id=tid,
        user_id=payload.user_email,
        action="SUPPORT_TICKET_SUBMITTED",
        details=f"Ticket {ticket_id} ({payload.urgency}): {payload.subject}",
        timestamp=datetime.utcnow()
    )
    db.add(audit)
    db.commit()
    db.refresh(ticket)

    return {
        "status": "SUCCESS",
        "ticket_id": ticket.id,
        "ticket": ticket.to_dict(),
        "message": f"Support ticket #{ticket.id} dispatched to Enterprise Operations. SLA tracking active."
    }

@router.get("/tickets")
def list_support_tickets(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Retrieves all active and historical support tickets for the current warehouse tenant."""
    tickets = (
        db.query(SupportTicket)
        .filter(SupportTicket.tenant_id == tenant_id)
        .order_by(SupportTicket.created_at.desc())
        .all()
    )
    serialized = [t.to_dict() for t in tickets]
    return {
        "status": "SUCCESS",
        "tenant_id": tenant_id,
        "count": len(serialized),
        "tickets": serialized
    }

@router.put("/tickets/{ticket_id}/status")
def update_ticket_status(ticket_id: str, payload: TicketStatusUpdate, db: Session = Depends(get_db)):
    """Updates operational state of an incident ticket."""
    ticket = db.query(SupportTicket).filter(SupportTicket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    
    ticket.status = payload.status
    db.commit()
    return {"status": "SUCCESS", "ticket": ticket.to_dict()}
