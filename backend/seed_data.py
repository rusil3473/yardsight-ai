"""
YardSight AI (GodownOS) - Database Seeder & Schema Initializer
Pre-populates SQLite with enterprise multi-tenant configuration, credentials, fleet, cameras, and compliance logs.
"""

from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import Tenant, User, Truck, CCTVCamera, LeakEvent, EWayBill, AuditLog

def init_db():
    """Creates tables if they don't exist and seeds initial records."""
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        # Check if tenants already seeded
        existing_tenant = db.query(Tenant).first()
        if existing_tenant:
            return  # Already seeded

        print("[DATABASE] Seeding fresh enterprise data into SQLite...")

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

        # 4. CCTV Cameras
        cameras = [
            CCTVCamera(
                id="cam-01-gate-inbound",
                tenant_id="TENANT-AMZN-BLR1",
                name="Camera 01: Inbound Gate ANPR",
                stream_type="RTSP",
                location="North Perimeter Gate 1",
                status="ONLINE",
                fps=30,
                resolution="1080p"
            ),
            CCTVCamera(
                id="cam-02-gate-outbound",
                tenant_id="TENANT-AMZN-BLR1",
                name="Camera 02: Outbound Gate ANPR",
                stream_type="RTSP",
                location="North Perimeter Gate 2",
                status="ONLINE",
                fps=30,
                resolution="1080p"
            ),
            CCTVCamera(
                id="cam-03-dock-apron",
                tenant_id="TENANT-AMZN-BLR1",
                name="Camera 03: Loading Docks 01-06",
                stream_type="HLS",
                location="Main Warehouse Apron",
                status="ONLINE",
                fps=30,
                resolution="1080p"
            ),
            CCTVCamera(
                id="cam-04-roof-leak",
                tenant_id="TENANT-AMZN-BLR1",
                name="Camera 04: Bay C-4 Roof & Slab Physical AI",
                stream_type="RTSP",
                location="Godown Sector 4 Ceiling",
                status="ONLINE",
                fps=25,
                resolution="1080p"
            )
        ]
        db.add_all(cameras)
        db.commit()

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
