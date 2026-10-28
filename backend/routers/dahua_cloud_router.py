"""
YardSight AI - Dahua DoLynk Cloud Share REST Router.
Provides tenant-isolated customer authorization, grant lifecycle, and DPDP compliance audit logs.
Strictly ZERO handling of customer passwords.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from database import get_db
from models import CloudProviderGrant, CloudProviderAuditLog
from services.dahua_cloud_provider import dahua_cloud_provider

router = APIRouter(prefix="/cloud-share", tags=["Dahua Cloud Share & DMSS Delegation"])


class AuthorizeSessionRequest(BaseModel):
    nvr_serial: str = Field(..., description="Dahua NVR serial number (e.g. BE124E0PCA95532)")
    channel_count: int = Field(32, ge=1, le=32, description="Requested camera channel count")
    tenant_id: str = Field("TENANT-MY-HUB", description="Tenant isolation identifier")


class RevokeGrantRequest(BaseModel):
    grant_id: str = Field(..., description="Active grant ID to revoke")
    reason: str = Field("CUSTOMER_REVOKED", description="Reason for revocation")
    tenant_id: str = Field("TENANT-MY-HUB", description="Tenant isolation identifier")


@router.get("/entitlement")
def get_cloud_entitlement():
    """Returns official Dahua DoLynk developer entitlement and commercial approval status."""
    return dahua_cloud_provider.get_entitlement_status()


@router.post("/authorize")
def create_authorization_session(
    payload: AuthorizeSessionRequest,
    db: Session = Depends(get_db)
):
    """
    Initiates customer-owned Dahua DMSS Live View delegation.
    Returns official QR pairing guidance and entitlement information.
    """
    res = dahua_cloud_provider.create_authorization_session(
        tenant_id=payload.tenant_id,
        nvr_serial=payload.nvr_serial,
        channel_count=payload.channel_count,
        performed_by="tenant_admin",
        db=db
    )
    return res


@router.get("/status")
def get_cloud_share_status(
    grant_id: Optional[str] = Query(None, description="Specific grant ID to query"),
    tenant_id: str = Query("TENANT-MY-HUB", description="Tenant isolation identifier"),
    db: Session = Depends(get_db)
):
    """Retrieves current grant authorization state, quota status, and audit trail."""
    target_grant = None
    if grant_id:
        target_grant = db.query(CloudProviderGrant).filter(
            CloudProviderGrant.id == grant_id,
            CloudProviderGrant.tenant_id == tenant_id
        ).first()
    else:
        target_grant = db.query(CloudProviderGrant).filter(
            CloudProviderGrant.tenant_id == tenant_id
        ).order_by(CloudProviderGrant.created_at.desc()).first()

    if not target_grant:
        return {
            "has_grant": False,
            "entitlement_info": dahua_cloud_provider.get_entitlement_status(),
            "message": "No active Dahua Cloud delegation grant configured for this tenant."
        }

    info = dahua_cloud_provider.get_grant_status(tenant_id, target_grant.id, db)
    return {
        "has_grant": True,
        **info
    }


@router.get("/channels")
def list_authorized_channels(
    grant_id: Optional[str] = Query(None, description="Grant ID"),
    tenant_id: str = Query("TENANT-MY-HUB", description="Tenant identifier"),
    db: Session = Depends(get_db)
):
    """Enumerates authorized NVR camera channels for the active grant."""
    target_grant = None
    if grant_id:
        target_grant = db.query(CloudProviderGrant).filter(
            CloudProviderGrant.id == grant_id,
            CloudProviderGrant.tenant_id == tenant_id
        ).first()
    else:
        target_grant = db.query(CloudProviderGrant).filter(
            CloudProviderGrant.tenant_id == tenant_id
        ).order_by(CloudProviderGrant.created_at.desc()).first()

    if not target_grant:
        raise HTTPException(status_code=404, detail="No Dahua Cloud grant found for this tenant")

    return dahua_cloud_provider.discover_authorized_channels(tenant_id, target_grant.id, db)


@router.post("/revoke")
def revoke_cloud_grant(
    payload: RevokeGrantRequest,
    db: Session = Depends(get_db)
):
    """Revokes a customer's Dahua Cloud Live View delegation and invalidates stream tokens."""
    res = dahua_cloud_provider.revoke_grant(
        tenant_id=payload.tenant_id,
        grant_id=payload.grant_id,
        reason=payload.reason,
        performed_by="tenant_admin",
        db=db
    )
    if res.get("status") == "ERROR":
        raise HTTPException(status_code=400, detail=res.get("message", "Revocation failed"))
    return res


@router.get("/audit-logs")
def list_audit_logs(
    tenant_id: str = Query("TENANT-MY-HUB", description="Tenant identifier"),
    limit: int = Query(50, ge=1, le=200),
    db: Session = Depends(get_db)
):
    """Returns statutory DPDP access audit logs for all cloud streaming operations."""
    logs = db.query(CloudProviderAuditLog).filter(
        CloudProviderAuditLog.tenant_id == tenant_id
    ).order_by(CloudProviderAuditLog.timestamp.desc()).limit(limit).all()

    return {
        "tenant_id": tenant_id,
        "total": len(logs),
        "audit_logs": [log.to_dict() for log in logs]
    }
