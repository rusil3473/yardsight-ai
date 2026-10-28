"""
YardSight AI - Cloud Provider Grant & Compliance Audit Models.
Maintains tenant-isolated cloud authorization records and DPDP-compliant access logs.
Strictly ZERO storage of plaintext customer DMSS passwords.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class CloudProviderGrant(Base):
    __tablename__ = "cloud_provider_grants"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False, index=True)
    provider = Column(String(32), default="DAHUA_DOLYNK", nullable=False)
    provider_device_id = Column(String(64), nullable=False)  # NVR Serial Number
    authorization_state = Column(String(32), default="PENDING", nullable=False)
    # Valid states: PENDING, AUTHORIZED, REVOKED, EXPIRED, UNSUPPORTED, QUOTA_LIMITED, ENTITLEMENT_PENDING
    granted_scopes = Column(Text, default='["live_view:read"]', nullable=False)
    channel_count = Column(Integer, default=32, nullable=False)
    provider_account_ref = Column(String(128), nullable=True)  # Masked owner handle
    encrypted_token_ref = Column(String(256), nullable=True)   # Opaque vault key reference only
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    expires_at = Column(DateTime, nullable=True)
    revoked_at = Column(DateTime, nullable=True)

    audit_logs = relationship("CloudProviderAuditLog", back_populates="grant", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "provider": self.provider,
            "provider_device_id": self.provider_device_id,
            "authorization_state": self.authorization_state,
            "granted_scopes": self.granted_scopes,
            "channel_count": self.channel_count,
            "provider_account_ref": self.provider_account_ref,
            "has_token_ref": bool(self.encrypted_token_ref),
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "expires_at": self.expires_at.isoformat() if self.expires_at else None,
            "revoked_at": self.revoked_at.isoformat() if self.revoked_at else None,
        }


class CloudProviderAuditLog(Base):
    __tablename__ = "cloud_provider_audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False, index=True)
    grant_id = Column(String(64), ForeignKey("cloud_provider_grants.id"), nullable=False, index=True)
    action = Column(String(32), nullable=False)
    # Valid actions: CONNECT_ATTEMPT, OWNER_APPROVED, SCOPE_CHANGED, SOURCE_ACCESSED, TOKEN_REFRESH, REVOKED
    details = Column(Text, nullable=True)
    performed_by = Column(String(64), default="system", nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow, nullable=False)

    grant = relationship("CloudProviderGrant", back_populates="audit_logs")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "grant_id": self.grant_id,
            "action": self.action,
            "details": self.details,
            "performed_by": self.performed_by,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
        }
