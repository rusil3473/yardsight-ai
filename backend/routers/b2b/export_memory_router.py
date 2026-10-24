"""
YardSight AI - B2B ERP Export & Adaptive Memory Router
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from datetime import datetime

from database import get_db
from models import (
    BusinessProfile, ProductionLine, ProductionLog,
    EnergyMeterReading, ContextMemorySummary, UserCorrectionMemory
)
from routers.b2b.common import get_current_tenant_id

router = APIRouter()

@router.get("/export/erp")
def export_erp_interchange_format(
    tenant_id: str = Depends(get_current_tenant_id),
    format_type: str = Query("json", pattern="^(json|tally_xml)$"),
    db: Session = Depends(get_db)
):
    """
    Standardized B2B export for SAP, Tally, Zoho Books, NetSuite, and Odoo.
    Returns production tallies, SEC efficiency, and energy cost allocations.
    """
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        raise HTTPException(status_code=404, detail="Business profile not found.")

    lines = db.query(ProductionLine).filter(ProductionLine.business_id == profile.id).all()
    line_ids = [l.id for l in lines]

    logs = db.query(ProductionLog).filter(
        ProductionLog.line_id.in_(line_ids)
    ).order_by(ProductionLog.log_date.desc()).limit(30).all() if line_ids else []

    readings = db.query(EnergyMeterReading).filter(
        EnergyMeterReading.business_id == profile.id
    ).order_by(EnergyMeterReading.timestamp.desc()).limit(30).all()

    summary = db.query(ContextMemorySummary).filter(
        ContextMemorySummary.business_id == profile.id
    ).order_by(ContextMemorySummary.generated_at.desc()).first()

    interchange_data = {
        "erp_export_version": "1.0.0",
        "generated_at": datetime.utcnow().isoformat(),
        "company": {
            "name": profile.company_name,
            "industry": profile.industry_sector,
            "products": profile.primary_products,
            "currency": profile.currency,
            "tariff_rate": profile.electricity_tariff_per_kwh
        },
        "operational_calibration": {
            "model_bias_multiplier": summary.active_bias_multiplier if summary else 1.0,
            "benchmark_sec": profile.benchmark_sec_kwh_per_unit
        },
        "production_tallies": [l.to_dict() for l in logs],
        "energy_allocations": [r.to_dict() for r in readings]
    }

    if format_type == "tally_xml":
        xml_entries = []
        for l in logs:
            xml_entries.append(
                f"<VOUCHER><DATE>{l.log_date}</DATE><NARRATION>Production output Line {l.line_id}</NARRATION>"
                f"<UNITS>{l.final_effective_units}</UNITS></VOUCHER>"
            )
        tally_xml = (
            f"<ENVELOPE><HEADER><TALLYREQUEST>Import Data</TALLYREQUEST></HEADER>"
            f"<BODY><DATA><TALLYMESSAGE>{''.join(xml_entries)}</TALLYMESSAGE></DATA></BODY></ENVELOPE>"
        )
        return {"status": "SUCCESS", "format": "tally_xml", "xml": tally_xml}

    return {"status": "SUCCESS", "format": "json", "data": interchange_data}

@router.get("/memory/context")
def get_operational_context_memory(
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Retrieves the 360° business context summary with top recency-weighted rules.
    """
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {"status": "NOT_CONFIGURED"}

    summary = db.query(ContextMemorySummary).filter(
        ContextMemorySummary.business_id == profile.id
    ).order_by(ContextMemorySummary.generated_at.desc()).first()

    corrections = db.query(UserCorrectionMemory).filter(
        UserCorrectionMemory.business_id == profile.id
    ).order_by(UserCorrectionMemory.recorded_at.desc()).limit(10).all()

    return {
        "status": "SUCCESS",
        "company_name": profile.company_name,
        "summary_markdown": summary.summary_markdown if summary else "No adjustments recorded.",
        "active_bias_multiplier": summary.active_bias_multiplier if summary else 1.0,
        "recent_corrections": [c.to_dict() for c in corrections]
    }
