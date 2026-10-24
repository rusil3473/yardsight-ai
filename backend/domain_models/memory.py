"""
UserCorrectionMemory, ContextMemorySummary, AuditLog, and SupportTicket ORM Models.
"""

import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class UserCorrectionMemory(Base):
    __tablename__ = "user_correction_memory"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("business_profiles.id"), nullable=False, index=True)
    metric_type = Column(String(32), default="PRODUCTION")  # PRODUCTION, ENERGY
    reference_id = Column(String(64), nullable=True)  # line_id or log_id
    original_value = Column(Float, nullable=False)
    corrected_value = Column(Float, nullable=False)
    delta_pct = Column(Float, default=0.0)
    reason_note = Column(Text, nullable=False)
    decay_lambda = Column(Float, default=0.05)  # lambda in w = exp(-lambda * delta_days)
    recorded_at = Column(DateTime, default=datetime.utcnow, index=True)

    # Relationships
    business = relationship("BusinessProfile", back_populates="corrections")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "metric_type": self.metric_type,
            "reference_id": self.reference_id,
            "original_value": self.original_value,
            "corrected_value": self.corrected_value,
            "delta_pct": self.delta_pct,
            "reason_note": self.reason_note,
            "decay_lambda": self.decay_lambda,
            "recorded_at": self.recorded_at.isoformat() if self.recorded_at else None,
        }


class ContextMemorySummary(Base):
    __tablename__ = "context_memory_summaries"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("business_profiles.id"), nullable=False, index=True)
    summary_markdown = Column(Text, nullable=False)
    active_bias_multiplier = Column(Float, default=1.0)
    total_corrections_analyzed = Column(Integer, default=0)
    generated_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    business = relationship("BusinessProfile", back_populates="context_summaries")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "summary_markdown": self.summary_markdown,
            "active_bias_multiplier": self.active_bias_multiplier,
            "total_corrections_analyzed": self.total_corrections_analyzed,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
        }


class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    user_id = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)

    def __init__(self, **kwargs):
        if "id" not in kwargs or not kwargs["id"]:
            kwargs["id"] = f"AUDIT-{uuid.uuid4().hex[:8].upper()}"
        if "tenant_id" not in kwargs or not kwargs["tenant_id"]:
            kwargs["tenant_id"] = "TENANT-MY-HUB"
        if "user_id" not in kwargs:
            kwargs["user_id"] = kwargs.pop("actor", "system")
        elif "actor" in kwargs:
            kwargs.pop("actor")
        if "target" in kwargs:
            target = kwargs.pop("target")
            kwargs["details"] = f"Target: {target} | {kwargs.get('details', '')}".strip()
        super().__init__(**kwargs)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }


class SupportTicket(Base):
    __tablename__ = "support_tickets"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False, index=True)
    user_email = Column(String(128), nullable=False)
    category = Column(String(64), default="HARDWARE_CCTV")  # HARDWARE_CCTV, DISPATCH_GATE, BILLING, INTEGRATION, GENERAL
    subject = Column(String(256), nullable=False)
    urgency = Column(String(32), default="MEDIUM")  # LOW, MEDIUM, HIGH, CRITICAL
    description = Column(Text, nullable=False)
    status = Column(String(32), default="OPEN")  # OPEN, IN_PROGRESS, RESOLVED
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "user_email": self.user_email,
            "category": self.category,
            "subject": self.subject,
            "urgency": self.urgency,
            "description": self.description,
            "status": self.status,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }
