"""
YardSight AI (GodownOS) - Enterprise Schema Initializer & Facility Config
Initializes SQLite database with enterprise multi-tenant configuration and authentication credentials.
Strictly ZERO dummy data (no fake trucks, no mock leaks, no fake invoices).
"""

from database import engine, SessionLocal, Base
from models import (
    Tenant, User, Truck, CCTVCamera, LeakEvent, EWayBill, AuditLog,
    BusinessProfile, ProductionLine, ProductionLog, EnergyMeterReading,
    UserCorrectionMemory, ContextMemorySummary, SupportTicket, TenantSetting,
    ANPRScanRecord
)

def migrate_schema():
    """Ensure newly added columns exist in existing tables if using SQLite."""
    from sqlalchemy import text
    from database import IS_POSTGRES
    if IS_POSTGRES:
        # In PostgreSQL, create_all handles schema or DDL migrations cleanly
        return
    try:
        with engine.connect() as conn:
            result = conn.execute(text("PRAGMA table_info(cctv_cameras);")).fetchall()
            col_names = [r[1] for r in result]
            if col_names:
                new_cols = [
                    ("stream_url", "TEXT"),
                    ("dmss_serial", "VARCHAR(128)"),
                    ("dmss_channel", "INTEGER DEFAULT 1"),
                    ("dmss_username", "VARCHAR(64) DEFAULT 'admin'"),
                    ("dmss_password", "VARCHAR(128)"),
                    ("ai_pipeline", "VARCHAR(64) DEFAULT 'ANPR_OCR'"),
                    ("brand", "VARCHAR(64) DEFAULT 'Dahua'")
                ]
                for col, col_type in new_cols:
                    if col not in col_names:
                        conn.execute(text(f"ALTER TABLE cctv_cameras ADD COLUMN {col} {col_type};"))
                conn.commit()
    except Exception as e:
        print(f"[MIGRATION NOTE] {e}")

def seed_tenants(db):
    """Initializes customer facility in database if not already created."""
    primary_hub = Tenant(
        id="TENANT-MY-HUB",
        name="My Logistics Godown Hub",
        organization="Apex Supply Chain Logistics",
        location="Bengaluru Logistics Corridor, Karnataka (IN)",
        active_docks=8,
        cameras_online=0,
        free_time_hours=2.0,
        sla_target_turnaround_mins=60,
        detention_rate_per_hour=1200.0,
        currency="INR",
        currency_symbol="₹",
        default_market="IN_GST"
    )
    if not db.query(Tenant).filter(Tenant.id == primary_hub.id).first():
        db.add(primary_hub)
        db.commit()

def seed_users(db):
    """Initializes standard enterprise users and RBAC credentials if not already created."""
    users = [
        User(
            id="usr_admin_01",
            tenant_id="TENANT-MY-HUB",
            email="admin@yardsight.corp",
            hashed_password="argon2_admin_secret",
            full_name="Operations Administrator",
            role="corporate_admin",
            role_label="Facility Administrator",
            phone="+91-98000-00000",
            department="Supply Chain Operations",
            avatar_url="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80"
        ),
        User(
            id="usr_yard_01",
            tenant_id="TENANT-MY-HUB",
            email="yardmaster@yardsight.corp",
            hashed_password="argon2_yard_secret",
            full_name="Rajesh Kumar",
            role="yard_master",
            role_label="Senior Yard Master & Dock Dispatcher",
            phone="+91-98765-43211",
            department="Yard Operations",
            avatar_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80"
        ),
        User(
            id="usr_sec_01",
            tenant_id="TENANT-MY-HUB",
            email="security@yardsight.corp",
            hashed_password="argon2_security_secret",
            full_name="Suresh Patil",
            role="security_guard",
            role_label="Gate Security Officer & ANPR Inspector",
            phone="+91-98765-43212",
            department="Physical Security & Access Control",
            avatar_url="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80"
        )
    ]
    for u in users:
        existing = db.query(User).filter(User.id == u.id).first()
        if not existing:
            db.add(u)
        else:
            existing.full_name = u.full_name
            existing.phone = u.phone
            existing.department = u.department
            existing.tenant_id = u.tenant_id
            existing.role_label = u.role_label
    db.commit()

def seed_cameras(db):
    """Initializes multi-channel Dahua NVR (BE124E0PCA95532) streams for all 32 channels.
    Strictly ZERO fake images. Real hardware devices only.
    """
    from services.streamer.zones import CHANNEL_ZONE_DEFS
    nvr_sn = "BE124E0PCA95532"

    cameras_def = []
    for ch in range(1, 33):
        cam_id = f"CAM-{ch:02d}"
        from services.streamer.zones import get_zone_def
        zone = get_zone_def(ch)
        zone_code, default_name, zone_pipeline = zone.zone_code, zone.display_name, zone.ai_pipeline

        name = f"Channel {ch:02d}"
        location = f"Channel {ch:02d}"
        res = "2560x1440 (2.5K Quad HD)" if ch == 1 else "1080p (1920x1080)"

        cameras_def.append({
            "id": cam_id,
            "name": name,
            "location": location,
            "brand": f"Dahua NVR IP-CH{ch:02d} ({nvr_sn})",
            "resolution": res,
            "fps": 30 if ch != 3 else 25,
            "stream_type": "DMSS",
            "stream_url": f"DMSS://{nvr_sn}?channel={ch}",
            "ai_pipeline": zone_pipeline,
            "status": "ONLINE",
            "dmss_serial": nvr_sn,
            "dmss_channel": ch,
            "dmss_username": "admin",
            "dmss_password": "Shri@21*"
        })

    for cdef in cameras_def:
        cam = CCTVCamera(tenant_id="TENANT-MY-HUB", **cdef)
        existing = db.query(CCTVCamera).filter(CCTVCamera.id == cam.id).first()
        if not existing:
            db.add(cam)
        else:
            for k, v in cdef.items():
                setattr(existing, k, v)
    db.commit()


def purge_all_demo_data(db):
    """Cleans all dummy/mock trucks, leak events, documents, production lines, and business profiles.
    Preserves core facilities (Tenants) and authentication accounts.
    """
    try:
        db.query(ProductionLog).delete()
        db.query(ProductionLine).delete()
        db.query(EnergyMeterReading).delete()
        db.query(UserCorrectionMemory).delete()
        db.query(ContextMemorySummary).delete()
        db.query(BusinessProfile).delete()
        db.query(Truck).delete()
        db.query(LeakEvent).delete()
        db.query(EWayBill).delete()
        db.query(CCTVCamera).delete()
        db.commit()
        print("[DATABASE] Successfully purged all transient demo and dummy records.")
        return True
    except Exception as e:
        db.rollback()
        print(f"[DATABASE ERROR] Failed to purge demo data: {e}")
        return False

def init_db():
    """Creates tables and ensures core enterprise multi-tenant facilities and auth users exist.
    Strictly ZERO dummy data (no fake trucks, no mock leaks, no fake invoices).
    """
    migrate_schema()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        print("[DATABASE] Ensuring core enterprise facilities and authentication records...")
        seed_tenants(db)
        seed_users(db)
        seed_cameras(db)
    except Exception as e:
        db.rollback()
        print(f"[DATABASE ERROR] Failed to initialize core structure: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    init_db()
