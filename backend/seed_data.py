"""
YardSight AI (GodownOS) - Database Seeder & Schema Initializer
Pre-populates SQLite with enterprise multi-tenant configuration, credentials, fleet, cameras, and compliance logs.
"""

from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import Tenant, User, Truck, CCTVCamera, LeakEvent, EWayBill, AuditLog

def migrate_schema():
    """Ensure newly added columns exist in existing SQLite tables."""
    from sqlalchemy import text
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

def init_db():
    """Creates tables if they don't exist and seeds initial records."""
    migrate_schema()
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if cameras for FK and DFW exist; if not, re-seed cameras
        fk_cam = db.query(CCTVCamera).filter(CCTVCamera.tenant_id == "TENANT-FK-BHW1").first()
        dfw_cam = db.query(CCTVCamera).filter(CCTVCamera.tenant_id == "TENANT-US-DFW").first()
        if not fk_cam or not dfw_cam:
            db.query(CCTVCamera).delete()
            db.commit()
            seed_enterprise_cameras(db)

        # Ensure all 3 tenants have seeded trucks
        fk_trk = db.query(Truck).filter(Truck.tenant_id == "TENANT-FK-BHW1").first()
        dfw_trk = db.query(Truck).filter(Truck.tenant_id == "TENANT-US-DFW").first()
        if not fk_trk or not dfw_trk:
            seed_enterprise_trucks(db)

        # Ensure documents exist across tenants
        fk_doc = db.query(EWayBill).filter(EWayBill.tenant_id == "TENANT-FK-BHW1").first()
        dfw_doc = db.query(EWayBill).filter(EWayBill.tenant_id == "TENANT-US-DFW").first()
        if not fk_doc or not dfw_doc:
            seed_enterprise_documents(db)

        # Check if tenants already seeded
        existing_tenant = db.query(Tenant).first()
        if existing_tenant:
            return  # Already seeded

        print("[DATABASE] Seeding fresh enterprise data into SQLite...")
        seed_enterprise_data(db)
    except Exception as e:
        db.rollback()
        print(f"[DATABASE ERROR] Failed to seed data: {e}")
    finally:
        db.close()

def seed_enterprise_cameras(db):
    """Seeds multi-tenant CCTV cameras for Amazon BLR1, Flipkart Bhiwandi, and DFW Intermodal."""
    cameras = [
        # --- TENANT-AMZN-BLR1 (4 Cameras) ---
        CCTVCamera(
            id="cam-01-gate-inbound",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 01 - Gate North ANPR",
            stream_type="RTSP",
            location="North Perimeter Gate 1",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.101:554/cam/realmonitor?channel=1&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-02-gate-outbound",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 02 - Bay 01 Loading Dock",
            stream_type="DMSS",
            location="Dock Bay West",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.102:554/cam/realmonitor?channel=2&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-03-dock-apron",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 03 - Bay 03 Loading Dock",
            stream_type="DMSS",
            location="Dock Bay East",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.103:554/cam/realmonitor?channel=3&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-04-roof-leak",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 04 - Interior Godown Floor",
            stream_type="RTSP",
            location="Godown Sector 4 Ceiling",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.104:554/cam/realmonitor?channel=4&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=4,
            dmss_username="admin",
            ai_pipeline="ROOF_LEAK",
            brand="DAHUA_DMSS"
        ),

        # --- TENANT-FK-BHW1 (3 Cameras) ---
        CCTVCamera(
            id="cam-fk-01-gate",
            tenant_id="TENANT-FK-BHW1",
            name="CAM 01 - Bhiwandi Gate 1 ANPR",
            stream_type="DMSS",
            location="Main Gate Inbound",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:fk1234@10.0.12.10:554/h264/ch1/main",
            dmss_serial="DH-551029-BHW",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-fk-02-apron",
            tenant_id="TENANT-FK-BHW1",
            name="CAM 02 - Flipkart Loading Apron",
            stream_type="RTSP",
            location="Loading Bays 1-4",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:fk1234@10.0.12.11:554/h264/ch2/main",
            dmss_serial="DH-551029-BHW",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="GENERIC_RTSP"
        ),
        CCTVCamera(
            id="cam-fk-03-warehouse",
            tenant_id="TENANT-FK-BHW1",
            name="CAM 03 - Sector 2 High-Bay Storage",
            stream_type="DMSS",
            location="Rack Zone B (High-Value)",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:fk1234@10.0.12.12:554/h264/ch3/main",
            dmss_serial="DH-551029-BHW",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="SECURITY_INTRUSION",
            brand="DAHUA_DMSS"
        ),

        # --- TENANT-US-DFW (8 Cameras) ---
        CCTVCamera(
            id="cam-dfw-01-gate-in",
            tenant_id="TENANT-US-DFW",
            name="CAM 01 - DFW North Inbound Gate",
            stream_type="DMSS",
            location="North Gate 1",
            status="ONLINE",
            fps=30,
            resolution="4K UHD",
            stream_url="rtsp://admin:usdfw2026@172.16.4.10:554/cam/realmonitor?channel=1&subtype=0",
            dmss_serial="DH-771920-DFW",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-02-gate-out",
            tenant_id="TENANT-US-DFW",
            name="CAM 02 - DFW North Outbound Gate",
            stream_type="DMSS",
            location="North Gate 2",
            status="ONLINE",
            fps=30,
            resolution="4K UHD",
            stream_url="rtsp://admin:usdfw2026@172.16.4.11:554/cam/realmonitor?channel=2&subtype=0",
            dmss_serial="DH-771920-DFW",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-03-dock-01",
            tenant_id="TENANT-US-DFW",
            name="CAM 03 - Intermodal Dock 01",
            stream_type="RTSP",
            location="Cross-Dock Bay 01",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:usdfw2026@172.16.4.12:554/axis-media/media.amp",
            dmss_serial="DH-771920-DFW",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="AXIS"
        ),
        CCTVCamera(
            id="cam-dfw-04-dock-02",
            tenant_id="TENANT-US-DFW",
            name="CAM 04 - Intermodal Dock 02",
            stream_type="RTSP",
            location="Cross-Dock Bay 02",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:usdfw2026@172.16.4.13:554/axis-media/media.amp",
            dmss_serial="DH-771920-DFW",
            dmss_channel=4,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="AXIS"
        ),
        CCTVCamera(
            id="cam-dfw-05-dock-03",
            tenant_id="TENANT-US-DFW",
            name="CAM 05 - Intermodal Dock 03",
            stream_type="DMSS",
            location="Cross-Dock Bay 03",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:usdfw2026@172.16.4.14:554/cam/realmonitor?channel=5&subtype=0",
            dmss_serial="DH-771920-DFW",
            dmss_channel=5,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-06-rail-apron",
            tenant_id="TENANT-US-DFW",
            name="CAM 06 - Rail Yard Container Apron",
            stream_type="HLS",
            location="BNSF Rail Siding Track 2",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="https://live-streams.yardsight.corp/hls/dfw-rail-06.m3u8",
            dmss_serial="DH-771920-DFW",
            dmss_channel=6,
            dmss_username="admin",
            ai_pipeline="SECURITY_INTRUSION",
            brand="GENERIC_RTSP"
        ),
        CCTVCamera(
            id="cam-dfw-07-cold-chain",
            tenant_id="TENANT-US-DFW",
            name="CAM 07 - Refrigerated Cold Chain Bay",
            stream_type="DMSS",
            location="Temp Controlled Dock 14",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:usdfw2026@172.16.4.16:554/cam/realmonitor?channel=7&subtype=0",
            dmss_serial="DH-771920-DFW",
            dmss_channel=7,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-08-perimeter",
            tenant_id="TENANT-US-DFW",
            name="CAM 08 - South Perimeter Radar PTZ",
            stream_type="DMSS",
            location="South Fence Perimeter Tower",
            status="ONLINE",
            fps=30,
            resolution="4K UHD",
            stream_url="rtsp://admin:usdfw2026@172.16.4.17:554/cam/realmonitor?channel=8&subtype=0",
            dmss_serial="DH-771920-DFW",
            dmss_channel=8,
            dmss_username="admin",
            ai_pipeline="SECURITY_INTRUSION",
            brand="DAHUA_DMSS"
        )
    ]
    db.add_all(cameras)
    db.commit()

def seed_enterprise_trucks(db):
    """Seeds multi-tenant trucks for Amazon BLR1, Flipkart Bhiwandi, and DFW Intermodal."""
    now = datetime.utcnow()
    # Check if FK trucks exist
    if not db.query(Truck).filter(Truck.tenant_id == "TENANT-FK-BHW1").first():
        fk_trucks = [
            Truck(
                id="TRK-FK-101",
                tenant_id="TENANT-FK-BHW1",
                plate_number="MH-04-KF-5521",
                country="IN",
                carrier_name="Gati-KWE Supply Chain",
                driver_name="Santosh Shinde",
                driver_phone="+91-98200-11223",
                dock_number="Dock 01",
                status="AT_DOCK",
                arrival_time=now - timedelta(minutes=38),
                dwell_minutes=38,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="22 Pallets (Consumer Electronics & Smartphones)",
                eway_bill_id="EWB-6620-1192"
            ),
            Truck(
                id="TRK-FK-102",
                tenant_id="TENANT-FK-BHW1",
                plate_number="MH-14-GH-9012",
                country="IN",
                carrier_name="Safexpress Logistics",
                driver_name="Dilip Gaikwad",
                driver_phone="+91-98200-44556",
                dock_number="Dock 03",
                status="DETENTION",
                arrival_time=now - timedelta(minutes=155),
                dwell_minutes=155,
                free_time_minutes=120,
                detention_charge=1283.33,
                cargo_desc="28 Pallets (Festival Big Billion Home Appliances)",
                eway_bill_id="EWB-6620-3341"
            ),
            Truck(
                id="TRK-FK-103",
                tenant_id="TENANT-FK-BHW1",
                plate_number="MH-06-BQ-7744",
                country="IN",
                carrier_name="Mahindra Logistics",
                driver_name="Vinod Sawant",
                driver_phone="+91-98200-77889",
                dock_number="Bay 02",
                status="INBOUND",
                arrival_time=now - timedelta(minutes=18),
                dwell_minutes=18,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="16 Pallets (Fashion & Lifestyle Apparel)",
                eway_bill_id="EWB-6620-9904"
            )
        ]
        db.add_all(fk_trucks)

    # Check if DFW trucks exist
    if not db.query(Truck).filter(Truck.tenant_id == "TENANT-US-DFW").first():
        dfw_trucks = [
            Truck(
                id="TRK-US-401",
                tenant_id="TENANT-US-DFW",
                plate_number="TX-49-B219",
                country="US",
                carrier_name="Swift Transportation US",
                driver_name="Dave Miller",
                driver_phone="+1-512-555-0199",
                dock_number="Dock 01",
                status="AT_DOCK",
                arrival_time=now - timedelta(minutes=45),
                dwell_minutes=45,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="26 Pallets (Industrial Automotive Equipment)",
                eway_bill_id="BOL-US-88019"
            ),
            Truck(
                id="TRK-US-402",
                tenant_id="TENANT-US-DFW",
                plate_number="OH-88-K902",
                country="US",
                carrier_name="Schneider National Intermodal",
                driver_name="Marcus Vance",
                driver_phone="+1-214-555-0142",
                dock_number="Dock 03",
                status="DETENTION",
                arrival_time=now - timedelta(minutes=165),
                dwell_minutes=165,
                free_time_minutes=120,
                detention_charge=56.25,
                cargo_desc="32 Pallets (Cross-Dock BNSF Container Freight)",
                eway_bill_id="BOL-US-99144"
            ),
            Truck(
                id="TRK-US-403",
                tenant_id="TENANT-US-DFW",
                plate_number="AR-12-Z551",
                country="US",
                carrier_name="J.B. Hunt Transport",
                driver_name="Brad Cooper",
                driver_phone="+1-817-555-0188",
                dock_number="Bay 04",
                status="INBOUND",
                arrival_time=now - timedelta(minutes=25),
                dwell_minutes=25,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="20 Pallets (Cold Chain Perishables)",
                eway_bill_id="BOL-US-77210"
            ),
            Truck(
                id="TRK-US-404",
                tenant_id="TENANT-US-DFW",
                plate_number="AZ-73-M338",
                country="US",
                carrier_name="Knight-Swift Logistics",
                driver_name="Sarah Jenkins",
                driver_phone="+1-972-555-0123",
                dock_number="Dock 02",
                status="CLEARED",
                arrival_time=now - timedelta(minutes=70),
                departure_time=now - timedelta(minutes=15),
                dwell_minutes=55,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="24 Pallets (Retail E-Commerce Goods)",
                eway_bill_id="BOL-US-66502"
            )
        ]
        db.add_all(dfw_trucks)

    db.commit()

def seed_enterprise_documents(db):
    """Seeds documents for Flipkart Bhiwandi and DFW Intermodal if missing."""
    now = datetime.utcnow()
    # Check FK docs
    if not db.query(EWayBill).filter(EWayBill.tenant_id == "TENANT-FK-BHW1").first():
        fk_docs = [
            EWayBill(
                id="EWB-FK-01",
                tenant_id="TENANT-FK-BHW1",
                ewb_number="6620-1192-4401",
                truck_plate="MH-04-KF-5521",
                transporter="Gati-KWE Supply Chain",
                doc_type="GST_EWAY_BILL",
                cargo_description="22 Pallets (Consumer Electronics & Smartphones)",
                status="ACTIVE",
                qr_code_data="https://ewaybillgst.gov.in/verify/662011924401",
                valid_until=now + timedelta(days=2),
                generated_by_user_id="usr_admin_01",
                generated_at=now - timedelta(hours=2)
            ),
            EWayBill(
                id="EWB-FK-02",
                tenant_id="TENANT-FK-BHW1",
                ewb_number="6620-3341-8890",
                truck_plate="MH-14-GH-9012",
                transporter="Safexpress Logistics",
                doc_type="GST_EWAY_BILL",
                cargo_description="28 Pallets (Festival Big Billion Home Appliances)",
                status="ACTIVE",
                qr_code_data="https://ewaybillgst.gov.in/verify/662033418890",
                valid_until=now + timedelta(days=3),
                generated_by_user_id="usr_admin_01",
                generated_at=now - timedelta(hours=4)
            )
        ]
        db.add_all(fk_docs)

    # Check DFW docs
    if not db.query(EWayBill).filter(EWayBill.tenant_id == "TENANT-US-DFW").first():
        dfw_docs = [
            EWayBill(
                id="BOL-DFW-01",
                tenant_id="TENANT-US-DFW",
                ewb_number="BOL-US-88019",
                truck_plate="TX-49-B219",
                transporter="Swift Transportation US",
                doc_type="US_EBOL",
                cargo_description="26 Pallets (Industrial Automotive Equipment)",
                status="ACTIVE",
                qr_code_data="https://fmcsa.dot.gov/verify/bol-us-88019",
                valid_until=now + timedelta(days=5),
                generated_by_user_id="usr_admin_01",
                generated_at=now - timedelta(hours=1)
            ),
            EWayBill(
                id="BOL-DFW-02",
                tenant_id="TENANT-US-DFW",
                ewb_number="BOL-US-99144",
                truck_plate="OH-88-K902",
                transporter="Schneider National Intermodal",
                doc_type="US_EBOL",
                cargo_description="32 Pallets (Cross-Dock BNSF Container Freight)",
                status="ACTIVE",
                qr_code_data="https://fmcsa.dot.gov/verify/bol-us-99144",
                valid_until=now + timedelta(days=4),
                generated_by_user_id="usr_admin_01",
                generated_at=now - timedelta(hours=3)
            )
        ]
        db.add_all(dfw_docs)

    db.commit()

def seed_enterprise_data(db):
    try:
        # 1. Tenants
        tenants = [
            Tenant(
                id="TENANT-AMZN-BLR1",
                name="Amazon BLR1 Fulfillment Center",
                organization="Amazon Transportation Services",
                location="Bengaluru, Karnataka (IN)",
                active_docks=12,
                cameras_online=4,
                free_time_hours=2.0,
                sla_target_turnaround_mins=60,
                detention_rate_per_hour=2400.0,
                currency="INR",
                currency_symbol="₹",
                default_market="IN_GST"
            ),
            Tenant(
                id="TENANT-FK-BHW1",
                name="Flipkart Western Distribution Center",
                organization="Flipkart Supply Chain",
                location="Bhiwandi, Maharashtra (IN)",
                active_docks=8,
                cameras_online=3,
                free_time_hours=2.0,
                sla_target_turnaround_mins=55,
                detention_rate_per_hour=2200.0,
                currency="INR",
                currency_symbol="₹",
                default_market="IN_GST"
            ),
            Tenant(
                id="TENANT-US-DFW",
                name="DFW Intermodal Super-Hub",
                organization="North American Freight Network",
                location="Dallas-Fort Worth, Texas (US)",
                active_docks=24,
                cameras_online=8,
                free_time_hours=2.0,
                sla_target_turnaround_mins=45,
                detention_rate_per_hour=75.0,
                currency="USD",
                currency_symbol="$",
                default_market="US_FREIGHT"
            )
        ]
        db.add_all(tenants)
        db.commit()

        # 2. Users
        users = [
            User(
                id="usr_admin_01",
                tenant_id="TENANT-AMZN-BLR1",
                email="admin@yardsight.corp",
                hashed_password="argon2_admin_secret",
                full_name="Vikramaditya Singhania",
                role="corporate_admin",
                role_label="Corporate Operations VP & Admin",
                phone="+91-98765-43210",
                department="Corporate Operations",
                avatar_url="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"
            ),
            User(
                id="usr_yard_01",
                tenant_id="TENANT-AMZN-BLR1",
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
                tenant_id="TENANT-AMZN-BLR1",
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
        db.add_all(users)
        db.commit()

        # 3. Trucks
        now = datetime.utcnow()
        trucks = [
            Truck(
                id="TRK-9041",
                tenant_id="TENANT-AMZN-BLR1",
                plate_number="MH-12-RN-4819",
                country="IN",
                carrier_name="Tata Logistics Express",
                driver_name="Harish Verma",
                driver_phone="+91-98765-11001",
                dock_number="Dock 02",
                status="DETENTION",
                arrival_time=now - timedelta(minutes=142),
                dwell_minutes=142,
                free_time_minutes=120,
                detention_charge=880.0,
                cargo_desc="24 Pallets (Commercial FMCG / Electronics)",
                eway_bill_id="EWB-5310-9842"
            ),
            Truck(
                id="TRK-8820",
                tenant_id="TENANT-AMZN-BLR1",
                plate_number="KA-04-AK-2201",
                country="IN",
                carrier_name="BlueDart Surface Prime",
                driver_name="Ramesh Yadav",
                driver_phone="+91-98765-11002",
                dock_number="Dock 05",
                status="AT_DOCK",
                arrival_time=now - timedelta(minutes=45),
                dwell_minutes=45,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="18 Pallets (Apparel & Footwear)",
                eway_bill_id="EWB-5310-9843"
            ),
            Truck(
                id="TRK-7731",
                tenant_id="TENANT-AMZN-BLR1",
                plate_number="DL-01-EE-9912",
                country="IN",
                carrier_name="Delhivery Heavy Freight",
                driver_name="Gurpreet Singh",
                driver_phone="+91-98765-11003",
                dock_number="Bay 01",
                status="INBOUND",
                arrival_time=now - timedelta(minutes=12),
                dwell_minutes=12,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="30 Pallets (Industrial Machinery Parts)",
                eway_bill_id="EWB-5310-9844"
            ),
            Truck(
                id="TRK-6619",
                tenant_id="TENANT-AMZN-BLR1",
                plate_number="MH-43-BB-3310",
                country="IN",
                carrier_name="VRL Logistics Cold Chain",
                driver_name="Sunil Patil",
                driver_phone="+91-98765-11004",
                dock_number="Dock 08",
                status="CLEARED",
                arrival_time=now - timedelta(minutes=68),
                departure_time=now - timedelta(minutes=10),
                dwell_minutes=58,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="14 Pallets (Temperature Controlled Pharma)",
                eway_bill_id="EWB-5310-9840"
            )
        ]
        db.add_all(trucks)
        db.commit()

        # 4. CCTV Cameras (Seeded for all facilities)
        seed_enterprise_cameras(db)

        # 5. Leak Anomaly Event
        leak = LeakEvent(
            id="LEAK-2026-001",
            tenant_id="TENANT-AMZN-BLR1",
            camera_id="cam-04-roof-leak",
            location="Bay C-4 Concrete Slab",
            area_sqm=14.8,
            rate_lph=18.2,
            severity="CRITICAL",
            status="ACTIVE",
            detected_at=now - timedelta(minutes=22)
        )
        db.add(leak)

        # 6. E-Way Bills
        ewb = EWayBill(
            id="EWB-REC-01",
            tenant_id="TENANT-AMZN-BLR1",
            ewb_number="5310-9842-1109",
            truck_plate="MH-12-RN-4819",
            transporter="Tata Logistics Express",
            doc_type="GST_EWAY_BILL",
            cargo_description="24 Pallets (Commercial FMCG / Electronics)",
            status="ACTIVE",
            qr_code_data="https://ewaybillgst.gov.in/verify/531098421109",
            valid_until=now + timedelta(days=2),
            generated_by_user_id="usr_admin_01",
            generated_at=now - timedelta(hours=3)
        )
        db.add(ewb)

        # 7. Audit Log
        audit = AuditLog(
            id="AUD-001",
            tenant_id="TENANT-AMZN-BLR1",
            user_id="usr_admin_01",
            action="SYSTEM_INIT",
            details="Database schema created and initial enterprise state initialized in SQLite WAL mode.",
            timestamp=now
        )
        db.add(audit)
        db.commit()
        print("[DATABASE] Enterprise data successfully seeded into SQLite!")

    except Exception as e:
        db.rollback()
        print(f"[DATABASE ERROR] Failed to seed data: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
