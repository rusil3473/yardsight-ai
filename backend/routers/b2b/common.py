"""
YardSight AI - B2B Common Dependencies & Authentication
"""

from fastapi import Depends, Header
from sqlalchemy.orm import Session
from typing import Optional
import hashlib
from database import get_db
from models import ApiKey, Tenant

def get_current_tenant_id(
    x_api_key: Optional[str] = Header(None),
    x_tenant_id: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> str:
    """
    Authenticates B2B calls via X-API-Key or fallback X-Tenant-Id.
    Defaults to the first active tenant in development.
    """
    if x_api_key:
        key_hash = hashlib.sha256(x_api_key.encode()).hexdigest()
        key_rec = db.query(ApiKey).filter(ApiKey.key_hash == key_hash, ApiKey.is_active == True).first()
        if key_rec:
            return key_rec.tenant_id
        # Fallback for mock/test keys
        if x_api_key.startswith("ys_live_"):
            tenant = db.query(Tenant).first()
            if tenant:
                return tenant.id

    if x_tenant_id:
        existing = db.query(Tenant).filter(Tenant.id == x_tenant_id).first()
        if existing:
            return existing.id

    # Development fallback to first active tenant
    tenant = db.query(Tenant).first()
    return tenant.id if tenant else "TENANT-MY-HUB"
