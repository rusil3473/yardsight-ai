"""
YardSight AI - Fleet & Dwell Turnaround Service Layer (<80 lines).
Encapsulates truck fleet lifecycle, dwell calculation delegation, and detention billing.
"""
import time
from datetime import datetime
from typing import List, Optional, Dict, Any
from sqlalchemy.orm import Session
from models import Truck, Tenant
from schemas.truck import TruckCreate, TruckStatusUpdate, DwellSummary
from services.dwell_calculator import compute_truck_dwell

class TruckService:
    """Service encapsulating truck fleet lifecycle, dwell calculation, and detention billing."""

    @staticmethod
    def list_trucks(tenant_id: str, db: Session) -> List[Dict[str, Any]]:
        trucks = db.query(Truck).filter(Truck.tenant_id == tenant_id).all()
        if not trucks and tenant_id != "TENANT-MY-HUB":
            trucks = db.query(Truck).filter(Truck.tenant_id == "TENANT-MY-HUB").all()
        results = []
        for t in trucks:
            t_dict = t.to_dict()
            results.append(compute_truck_dwell(t_dict, t.arrival_time, t.free_time_minutes or 120, t.country or "IN", t.status))
        return results

    @staticmethod
    def create_truck(payload: TruckCreate, db: Session) -> Dict[str, Any]:
        truck_id = f"TRK-{int(time.time()*1000) % 100000:05d}"
        new_truck = Truck(
            id=truck_id, tenant_id=payload.tenant_id or "TENANT-MY-HUB",
            plate_number=payload.plate_number.upper().strip(), carrier_name=payload.carrier_name,
            driver_name=payload.driver_name or "Driver", driver_phone=payload.driver_phone or "+91-98765-00000",
            dock_number=payload.dock_number or "Bay 01", cargo_desc=payload.cargo_desc or payload.cargo_type or "Standard Freight",
            country=payload.country.upper() if payload.country else "IN", status=payload.status.upper() if payload.status else "INBOUND",
            dwell_minutes=0, free_time_minutes=120, detention_charge=0.0,
            eway_bill_id=f"BOL-{int(time.time()) % 100000:05d}", arrival_time=datetime.utcnow()
        )
        db.add(new_truck)
        db.commit()
        db.refresh(new_truck)
        return new_truck.to_dict()

    @staticmethod
    def update_status(payload: TruckStatusUpdate, db: Session) -> Optional[Dict[str, Any]]:
        truck = db.query(Truck).filter(Truck.id == payload.truck_id).first()
        if not truck: return None
        truck.status = payload.status.upper()
        if payload.dock_number: truck.dock_number = payload.dock_number
        if payload.status.upper() in ["CLEARED", "DEPARTED"]:
            truck.departure_time = datetime.utcnow()
        db.commit()
        db.refresh(truck)
        return truck.to_dict()

    @staticmethod
    def delete_truck(truck_id: str, db: Session) -> bool:
        truck = db.query(Truck).filter(Truck.id == truck_id).first()
        if not truck: return False
        db.delete(truck)
        db.commit()
        return True

    @staticmethod
    def get_dwell_summary(tenant_id: str, db: Session) -> DwellSummary:
        truck_list = TruckService.list_trucks(tenant_id, db)
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        return DwellSummary(
            total_trucks=len(truck_list),
            at_dock=len([t for t in truck_list if t.get("status") == "AT_DOCK"]),
            inbound=len([t for t in truck_list if t.get("status") == "INBOUND"]),
            detention_count=len([t for t in truck_list if t.get("status") == "DETENTION"]),
            total_detention_fees=round(sum(t.get("detention_fee", 0.0) for t in truck_list), 2),
            currency_symbol=tenant.currency_symbol if tenant else "₹"
        )

truck_service = TruckService()
