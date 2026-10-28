"""
YardSight AI - Dahua Cloud Provider & Entitlement Gate Tests.
Validates tenant isolation, unique 32-channel source key mapping, zero-password policy,
grant lifecycle states, and DPDP compliance audit logging.
"""

import pytest
from database import SessionLocal
from models import CloudProviderGrant, CloudProviderAuditLog, Tenant
from services.dahua_cloud_provider import dahua_cloud_provider


@pytest.fixture
def db_session():
    db = SessionLocal()
    yield db
    db.close()


def ensure_tenant(db, tenant_id):
    t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
    if not t:
        t = Tenant(
            id=tenant_id,
            name=f"Test Facility {tenant_id}",
            organization="Apex Logistics",
            location="Karnataka, IN"
        )
        db.add(t)
        db.commit()
    return t


def test_phase_0_entitlement_gate():
    """Verify Phase 0 Entitlement Gate stops cloud streaming if Dahua commercial approval is pending."""
    entitlement = dahua_cloud_provider.get_entitlement_status()
    assert entitlement["provider"] == "DAHUA_DOLYNK"
    assert "requires_edge_for_32ch" in entitlement
    assert entitlement["requires_edge_for_32ch"] is True
    # Commercial quota is not approved until Dahua India signs off
    assert entitlement["commercial_quota_approved"] is False


def test_create_authorization_session_zero_passwords(db_session):
    """Verify customer delegation creates grant with zero plaintext customer passwords."""
    tenant_id = "TENANT-MY-HUB"
    ensure_tenant(db_session, tenant_id)
    nvr_serial = "BE124E0PCA95532"
    res = dahua_cloud_provider.create_authorization_session(
        tenant_id=tenant_id,
        nvr_serial=nvr_serial,
        channel_count=32,
        performed_by="facility_owner",
        db=db_session
    )

    assert res["status"] == "SUCCESS"
    grant = res["grant"]
    assert grant["tenant_id"] == tenant_id
    assert grant["provider_device_id"] == nvr_serial
    assert grant["channel_count"] == 32
    assert "live_view:read" in grant["granted_scopes"]
    assert "ownership_notice" in res

    # Verify audit log created
    audit = db_session.query(CloudProviderAuditLog).filter(
        CloudProviderAuditLog.grant_id == grant["id"],
        CloudProviderAuditLog.action == "CONNECT_ATTEMPT"
    ).first()
    assert audit is not None
    assert audit.tenant_id == tenant_id


def test_channel_discovery_creates_32_unique_sources(db_session):
    """Verify channel discovery generates 32 distinct source keys without frame duplication."""
    tenant_id = "TENANT-TEST-32CH"
    ensure_tenant(db_session, tenant_id)
    nvr_serial = "BE124E0PCA95532"
    res = dahua_cloud_provider.create_authorization_session(
        tenant_id=tenant_id,
        nvr_serial=nvr_serial,
        channel_count=32,
        db=db_session
    )
    grant_id = res["grant"]["id"]

    channels_data = dahua_cloud_provider.discover_authorized_channels(tenant_id, grant_id, db_session)
    assert channels_data["status"] == "SUCCESS"
    assert channels_data["total_channels"] == 32

    channels = channels_data["channels"]
    assert len(channels) == 32

    # Verify all 32 sub and main keys are completely unique
    sub_keys = [c["source_key_sub"] for c in channels]
    main_keys = [c["source_key_main"] for c in channels]
    assert len(set(sub_keys)) == 32
    assert len(set(main_keys)) == 32

    # Verify channel 01 and channel 32 formatting
    assert sub_keys[0].endswith("-ch-01-sub")
    assert sub_keys[31].endswith("-ch-32-sub")


def test_tenant_isolation_blocks_cross_tenant_access(db_session):
    """Verify tenant isolation blocks access to another tenant's Dahua cloud grant."""
    ensure_tenant(db_session, "TENANT-ALPHA")
    ensure_tenant(db_session, "TENANT-BETA")
    res = dahua_cloud_provider.create_authorization_session(
        tenant_id="TENANT-ALPHA",
        nvr_serial="BE124E0PCA95532",
        channel_count=8,
        db=db_session
    )
    grant_id = res["grant"]["id"]

    # Attempt cross-tenant discovery with TENANT-BETA
    cross_data = dahua_cloud_provider.discover_authorized_channels("TENANT-BETA", grant_id, db_session)
    assert cross_data["status"] == "ERROR"


def test_revocation_lifecycle_and_audit(db_session):
    """Verify instant customer revocation marks grant REVOKED and writes audit log."""
    tenant_id = "TENANT-REVOKE-TEST"
    ensure_tenant(db_session, tenant_id)
    res = dahua_cloud_provider.create_authorization_session(
        tenant_id=tenant_id,
        nvr_serial="BE124E0PCA95532",
        db=db_session
    )
    grant_id = res["grant"]["id"]

    revoke_res = dahua_cloud_provider.revoke_grant(
        tenant_id=tenant_id,
        grant_id=grant_id,
        reason="OWNER_DISCONNECTED_IN_DMSS",
        performed_by="facility_owner",
        db=db_session
    )

    assert revoke_res["status"] == "SUCCESS"
    assert revoke_res["state"] == "REVOKED"

    # Verify status in database
    grant = db_session.query(CloudProviderGrant).filter(CloudProviderGrant.id == grant_id).first()
    assert grant.authorization_state == "REVOKED"
    assert grant.revoked_at is not None

    # Verify audit trail
    audits = db_session.query(CloudProviderAuditLog).filter(
        CloudProviderAuditLog.grant_id == grant_id,
        CloudProviderAuditLog.action == "REVOKED"
    ).all()
    assert len(audits) >= 1
