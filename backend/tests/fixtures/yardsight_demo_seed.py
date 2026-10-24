"""
YardSight AI (GodownOS) - Standalone Demo & Test Fixture Seeder
[MOVED TO TEMP - NEVER AUTO-SEEDED IN PRODUCTION DATABASE]

Usage:
    python temp/dummy_seeds/yardsight_demo_seed.py
"""

import sys
import os
sys.path.insert(0, os.path.abspath("yardsight/backend"))

from datetime import datetime, timedelta
from database import engine, SessionLocal, Base
from models import (
    Tenant, User, Truck, CCTVCamera, LeakEvent, EWayBill, AuditLog,
    BusinessProfile, ProductionLine, ProductionLog, EnergyMeterReading
)

from tests.fixtures.camera_fixtures import seed_enterprise_cameras


def seed_enterprise_data(db=None):
    should_close = False
    if db is None:
        db = SessionLocal()
        should_close = True
    try:
        now = datetime.utcnow()
        seed_enterprise_cameras(db)

        # Sample Business Profile
        if not db.query(BusinessProfile).first():
            biz = BusinessProfile(
                id="biz_demo_01",
                tenant_id="TENANT-AMZN-BLR1",
                company_name="Apex Packaging & Forging Ltd",
                industry_sector="Corrugated Packaging",
                primary_products="Heavy-Duty Export Shipping Cartons",
                daily_capacity_target=5000.0,
                electricity_tariff_per_kwh=8.50,
                currency="INR",
                currency_symbol="₹",
                benchmark_sec_kwh_per_unit=0.09,
                rated_cycle_seconds=1.2,
                ai_research_summary="Demo AI research profile."
            )
            db.add(biz)

        # Amazon BLR1 Trucks (4 trucks)
        amzn_trucks = [
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
        for trk in amzn_trucks:
            if not db.query(Truck).filter(Truck.id == trk.id).first():
                db.add(trk)

        # Flipkart Bhiwandi Trucks (3 trucks)
        fk_trucks = [
            Truck(
                id="TRK-FK-101",
                tenant_id="TENANT-FK-BHW1",
                plate_number="MH-04-CP-8812",
                country="IN",
                carrier_name="Safexpress Logistics",
                driver_name="Pramod Shinde",
                driver_phone="+91-98765-22001",
                dock_number="Dock 01",
                status="AT_DOCK",
                arrival_time=now - timedelta(minutes=30),
                dwell_minutes=30,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="20 Pallets (Consumer Durables)"
            ),
            Truck(
                id="TRK-FK-102",
                tenant_id="TENANT-FK-BHW1",
                plate_number="MH-14-GH-9012",
                country="IN",
                carrier_name="Gati-KWE Express",
                driver_name="Ashok Gawande",
                driver_phone="+91-98765-22002",
                dock_number="Dock 04",
                status="INBOUND",
                arrival_time=now - timedelta(minutes=15),
                dwell_minutes=15,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="15 Pallets (Kitchenware & Electronics)"
            ),
            Truck(
                id="TRK-FK-103",
                tenant_id="TENANT-FK-BHW1",
                plate_number="GJ-06-TT-4411",
                country="IN",
                carrier_name="Safexpress Logistics",
                driver_name="Mahesh Solanki",
                driver_phone="+91-98765-22003",
                dock_number="Dock 03",
                status="DETENTION",
                arrival_time=now - timedelta(minutes=150),
                dwell_minutes=150,
                free_time_minutes=120,
                detention_charge=1100.0,
                cargo_desc="32 Pallets (Home Decor & Furniture)"
            )
        ]
        for trk in fk_trucks:
            if not db.query(Truck).filter(Truck.id == trk.id).first():
                db.add(trk)

        # DFW Intermodal Trucks (4 trucks)
        dfw_trucks = [
            Truck(
                id="TRK-US-201",
                tenant_id="TENANT-US-DFW",
                plate_number="TX-49-B219",
                country="US",
                carrier_name="Swift Transportation US",
                driver_name="John Miller",
                driver_phone="+1-214-555-0101",
                dock_number="Bay 04",
                status="AT_DOCK",
                arrival_time=now - timedelta(minutes=40),
                dwell_minutes=40,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="26 Pallets (Industrial Automotive Equipment)"
            ),
            Truck(
                id="TRK-US-202",
                tenant_id="TENANT-US-DFW",
                plate_number="OH-88-K902",
                country="US",
                carrier_name="Schneider National Intermodal",
                driver_name="David Clark",
                driver_phone="+1-214-555-0102",
                dock_number="Bay 10",
                status="INBOUND",
                arrival_time=now - timedelta(minutes=18),
                dwell_minutes=18,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="32 Pallets (Cross-Dock BNSF Container Freight)"
            ),
            Truck(
                id="TRK-US-203",
                tenant_id="TENANT-US-DFW",
                plate_number="CA-12-Z718",
                country="US",
                carrier_name="J.B. Hunt Dedicated",
                driver_name="Robert Vance",
                driver_phone="+1-214-555-0103",
                dock_number="Bay 02",
                status="DETENTION",
                arrival_time=now - timedelta(minutes=160),
                dwell_minutes=160,
                free_time_minutes=120,
                detention_charge=50.0,
                cargo_desc="18 Pallets (Cold-Chain Refrigerated Meat)"
            ),
            Truck(
                id="TRK-US-204",
                tenant_id="TENANT-US-DFW",
                plate_number="IL-99-R411",
                country="US",
                carrier_name="Swift Transportation US",
                driver_name="Michael Scott",
                driver_phone="+1-214-555-0104",
                dock_number="Bay 14",
                status="CLEARED",
                arrival_time=now - timedelta(minutes=90),
                departure_time=now - timedelta(minutes=20),
                dwell_minutes=70,
                free_time_minutes=120,
                detention_charge=0.0,
                cargo_desc="40 Pallets (Consumer Paper Products)"
            )
        ]
        for trk in dfw_trucks:
            if not db.query(Truck).filter(Truck.id == trk.id).first():
                db.add(trk)

        # Sample Leak
        if not db.query(LeakEvent).filter(LeakEvent.id == "LEAK-2026-001").first():
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

        # Sample E-Way Bills
        if not db.query(EWayBill).filter(EWayBill.id == "EWB-REC-01").first():
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

        if not db.query(EWayBill).filter(EWayBill.id == "BOL-DFW-01").first():
            bol = EWayBill(
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
            )
            db.add(bol)

        # Sample Audit Log
        if not db.query(AuditLog).filter(AuditLog.id == "AUD-001").first():
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
    except Exception as e:
        db.rollback()
        print(f"[DEMO SEED ERROR] {e}")
    finally:
        if should_close:
            db.close()

if __name__ == "__main__":
    seed_enterprise_data()
