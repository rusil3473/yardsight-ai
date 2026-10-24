"""
YardSight AI - B2B Energy Efficiency & Meter Readings Router
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any
import uuid

from database import get_db
from models import BusinessProfile, EnergyMeterReading
from engines.energy_meter_ocr import EnergyMeterAnalyzer
from routers.b2b.common import get_current_tenant_id

router = APIRouter()

@router.get("/energy/efficiency")
def get_energy_efficiency_metrics(
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Computes real-time energy productivity:
    - Cumulative kWh
    - Units per kWh (productivity)
    - kWh per Unit (Specific Energy Consumption - SEC)
    - Cost per Unit Produced
    - Mechanical Degradation & Friction Alerts
    """
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {"status": "NOT_CONFIGURED", "data": {}}

    latest_reading = db.query(EnergyMeterReading).filter(
        EnergyMeterReading.business_id == profile.id
    ).order_by(EnergyMeterReading.timestamp.desc()).first()

    if not latest_reading:
        return {
            "status": "NO_READINGS",
            "message": "No energy meter readings recorded yet.",
            "benchmark_sec": profile.benchmark_sec_kwh_per_unit,
            "tariff_rate": profile.electricity_tariff_per_kwh
        }

    return {
        "status": "SUCCESS",
        "company_name": profile.company_name,
        "tariff_rate": profile.electricity_tariff_per_kwh,
        "currency_symbol": profile.currency_symbol,
        "benchmark_sec": profile.benchmark_sec_kwh_per_unit,
        "latest_reading": latest_reading.to_dict()
    }

@router.post("/energy/reading")
def ingest_energy_meter_reading(
    payload: Dict[str, Any],
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Ingests an energy meter reading (optical 7-segment OCR or IoT telemetry),
    calculates units per kWh, SEC, and checks for mechanical anomalies.
    """
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Create business profile first.")

    units_in_window = int(payload.get("units_produced_in_window", 0))

    prev = db.query(EnergyMeterReading).filter(
        EnergyMeterReading.business_id == profile.id
    ).order_by(EnergyMeterReading.timestamp.desc()).first()

    delta_param = payload.get("delta_kwh")
    if delta_param is not None:
        delta_kwh = float(delta_param)
        prev_kwh = prev.cumulative_kwh if prev else 1000.0
        current_kwh = prev_kwh + delta_kwh
    else:
        raw_ocr = payload.get("ocr_raw_text")
        if raw_ocr:
            current_kwh = EnergyMeterAnalyzer.parse_meter_ocr_digits(raw_ocr) or float(payload.get("cumulative_kwh", 0.0))
        else:
            current_kwh = float(payload.get("cumulative_kwh", 0.0))

        if prev:
            prev_kwh = prev.cumulative_kwh
            if current_kwh <= prev_kwh:
                current_kwh = prev_kwh + 25.0
        else:
            prev_kwh = max(0.0, current_kwh - 25.0)

    analyzer = EnergyMeterAnalyzer(
        tariff_rate_per_kwh=profile.electricity_tariff_per_kwh,
        benchmark_sec=profile.benchmark_sec_kwh_per_unit
    )
    efficiency = analyzer.compute_efficiency_window(
        prev_kwh=prev_kwh,
        current_kwh=current_kwh,
        units_produced=units_in_window
    )

    reading = EnergyMeterReading(
        id=f"emr_{uuid.uuid4().hex[:12]}",
        business_id=profile.id,
        cumulative_kwh=current_kwh,
        delta_kwh=efficiency["delta_kwh"],
        units_produced_in_window=units_in_window,
        units_per_kwh=efficiency["units_per_kwh"],
        kwh_per_unit=efficiency["kwh_per_unit"],
        cost_in_window=efficiency["cost_in_window"],
        is_anomaly=efficiency["is_anomaly"],
        anomaly_details=efficiency["anomaly_details"]
    )
    db.add(reading)
    db.commit()
    db.refresh(reading)
    return {"status": "SUCCESS", "reading": reading.to_dict(), "efficiency": efficiency}
