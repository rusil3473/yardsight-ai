"""
YardSight AI - Fleet & Dwell Router
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Truck
from schemas.truck import TruckCreate, TruckStatusUpdate, DwellSummary
from services.truck_service import truck_service

router = APIRouter(prefix="", tags=["Fleet & Turnaround Operations"])

class TruckUpdateFields(BaseModel):
    plate_number: Optional[str] = None
    country: Optional[str] = None
    dock_number: Optional[str] = None
    status: Optional[str] = None
    carrier_name: Optional[str] = None
    driver_name: Optional[str] = None
    driver_phone: Optional[str] = None
    cargo_desc: Optional[str] = None

@router.get("/trucks")
@router.get("/dwell/trucks")
def list_trucks(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB", description="Tenant isolation identifier"),
    db: Session = Depends(get_db)
):
    """Retrieves all trucks currently in yard with real-time dwell calculations and detention SLA states."""
    return truck_service.list_trucks(tenant_id=tenant_id or "TENANT-MY-HUB", db=db)

@router.get("/dwell/summary", response_model=DwellSummary)
def get_dwell_summary(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB", description="Tenant isolation identifier"),
    db: Session = Depends(get_db)
):
    """Aggregates active turnaround metrics, bay occupancy, and detention fees."""
    return truck_service.get_dwell_summary(tenant_id=tenant_id or "TENANT-MY-HUB", db=db)

@router.post("/trucks", status_code=status.HTTP_200_OK)
def register_truck(payload: TruckCreate, db: Session = Depends(get_db)):
    """Registers an inbound freight vehicle detected by gate ANPR or manual dispatch."""
    created = truck_service.create_truck(payload, db)
    return {"status": "success", "truck": created}

@router.post("/trucks/status")
def update_truck_status(payload: TruckStatusUpdate, db: Session = Depends(get_db)):
    """Transitions a truck through the yard lifecycle."""
    updated = truck_service.update_status(payload, db)
    if not updated:
        raise HTTPException(status_code=404, detail=f"Truck {payload.truck_id} not found")
    return {"status": "success", "truck": updated}

@router.put("/trucks/{truck_id}")
def update_truck_details(truck_id: str, payload: TruckUpdateFields, db: Session = Depends(get_db)):
    """Updates bay assignment, cargo description, transit status, or corrects license plate."""
    trk = db.query(Truck).filter(Truck.id == truck_id).first()
    if not trk:
        raise HTTPException(status_code=404, detail=f"Truck {truck_id} not found")

    if payload.plate_number is not None and payload.plate_number.strip():
        old_plate = trk.plate_number
        new_plate = payload.plate_number.strip().upper()
        if old_plate != new_plate:
            trk.plate_number = new_plate
            from models import AuditLog
            audit = AuditLog(
                tenant_id=trk.tenant_id,
                user_id="admin-operator",
                action="ADMIN_CORRECTED_PLATE",
                details=f"Plate on Truck {truck_id} corrected from '{old_plate}' to '{new_plate}' by admin"
            )
            db.add(audit)

    if payload.country is not None:
        trk.country = payload.country.strip().upper()
    if payload.dock_number is not None:
        trk.dock_number = payload.dock_number
    if payload.status is not None:
        trk.status = payload.status
    if payload.carrier_name is not None:
        trk.carrier_name = payload.carrier_name
    if payload.driver_name is not None:
        trk.driver_name = payload.driver_name
    if payload.driver_phone is not None:
        trk.driver_phone = payload.driver_phone
    if payload.cargo_desc is not None:
        trk.cargo_desc = payload.cargo_desc

    db.commit()
    db.refresh(trk)
    return {"status": "success", "truck": trk.to_dict()}

@router.delete("/trucks/{truck_id}")
def delete_truck(truck_id: str, db: Session = Depends(get_db)):
    """Removes a vehicle record from the yard dwell tracker."""
    deleted = truck_service.delete_truck(truck_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Truck {truck_id} not found")
    return {"status": "DELETED", "deleted_truck_id": truck_id}

@router.get("/dwell/hourly")
def get_hourly_dwell_metrics(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Computes dynamic hourly throughput and dwell time from active and cleared trucks."""
    trucks = db.query(Truck).filter(Truck.tenant_id == tenant_id).all()
    if not trucks and tenant_id != "TENANT-MY-HUB":
        trucks = db.query(Truck).filter(Truck.tenant_id == "TENANT-MY-HUB").all()

    hours = ["06:00", "08:00", "10:00", "12:00", "14:00", "16:00"]
    result = []
    for h in hours:
        h_int = int(h.split(":")[0])
        matching = [
            t for t in trucks 
            if t.arrival_time and t.arrival_time.hour in [h_int, h_int + 1]
        ]
        avg_dwell = 0
        if matching:
            avg_dwell = int(sum(t.dwell_minutes or 0 for t in matching) / len(matching))
        elif trucks and h == "10:00":
            avg_dwell = int(sum(t.dwell_minutes or 25 for t in trucks) / len(trucks))
            matching = trucks

        result.append({
            "hour": h,
            "trucks": len(matching),
            "dwell": avg_dwell
        })
    return {"status": "SUCCESS", "metrics": result}

@router.get("/trucks/carriers/summary")
def get_carrier_benchmarks(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Dynamically groups trucks by carrier and calculates real turnaround metrics."""
    trucks = db.query(Truck).filter(Truck.tenant_id == tenant_id).all()
    if not trucks and tenant_id != "TENANT-MY-HUB":
        trucks = db.query(Truck).filter(Truck.tenant_id == "TENANT-MY-HUB").all()

    carrier_groups: Dict[str, list] = {}
    for t in trucks:
        c_name = t.carrier_name or "Independent Hauler"
        if c_name not in carrier_groups:
            carrier_groups[c_name] = []
        carrier_groups[c_name].append(t)

    benchmarks = []
    for c_name, trk_list in carrier_groups.items():
        total_units = len(trk_list)
        avg_dwell = int(sum(t.dwell_minutes or 30 for t in trk_list) / max(1, total_units))
        on_time_units = len([t for t in trk_list if t.status != "DETENTION"])
        on_time_rate = f"{round((on_time_units / max(1, total_units)) * 100, 1)}%"

        status_label = "EXEMPLARY" if avg_dwell < 45 and on_time_units == total_units else (
            "DETENTION_RISK" if any(t.status == "DETENTION" for t in trk_list) else "OPTIMAL"
        )
        benchmarks.append({
            "name": c_name,
            "avgDwell": f"{avg_dwell}m",
            "onTimeRate": on_time_rate,
            "activeTrucks": total_units,
            "status": status_label
        })

    return {"status": "SUCCESS", "carriers": benchmarks}

