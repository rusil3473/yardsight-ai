"""
YardSight AI - B2B Production Lines, Tripwires & Logs Router
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import date
import uuid

from database import get_db
from models import (
    BusinessProfile, ProductionLine, ProductionLog,
    UserCorrectionMemory, ContextMemorySummary
)
from engines.production_line_counter import ProductionLineCounter
from engines.uncertainty_approximator import UncertaintyApproximator
from engines.adaptive_memory_engine import AdaptiveMemoryEngine
from routers.b2b.common import get_current_tenant_id

router = APIRouter()

@router.get("/production/lines")
def list_production_lines(
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """List all registered conveyor lines and tripwire geometries."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {"status": "SUCCESS", "lines": []}
    lines = db.query(ProductionLine).filter(ProductionLine.business_id == profile.id).all()
    return {"status": "SUCCESS", "lines": [l.to_dict() for l in lines]}

@router.post("/production/lines")
def register_production_line(
    payload: Dict[str, Any],
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """Registers a camera-monitored conveyor line with virtual tripwire coordinates."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        raise HTTPException(status_code=400, detail="Must create a business profile first.")

    line = ProductionLine(
        id=f"line_{uuid.uuid4().hex[:10]}",
        business_id=profile.id,
        line_name=payload.get("line_name", "Main Conveyor Line 1"),
        camera_id=payload.get("camera_id", "cam_01"),
        tripwire_x1=int(payload.get("tripwire_x1", 100)),
        tripwire_y1=int(payload.get("tripwire_y1", 300)),
        tripwire_x2=int(payload.get("tripwire_x2", 500)),
        tripwire_y2=int(payload.get("tripwire_y2", 300)),
        direction=payload.get("direction", "LEFT_TO_RIGHT"),
        is_active=bool(payload.get("is_active", True))
    )
    db.add(line)
    db.commit()
    db.refresh(line)
    return {"status": "SUCCESS", "data": line.to_dict()}

@router.get("/production/metrics")
def get_production_metrics(
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Returns real-time and historical operational throughput.
    """
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {
            "status": "NOT_CONFIGURED",
            "current_upm": 0.0,
            "today_output": 0,
            "moving_avg_7d": 0.0,
            "moving_avg_30d": 0.0
        }

    lines = db.query(ProductionLine).filter(ProductionLine.business_id == profile.id).all()
    line_ids = [l.id for l in lines]

    today_str = date.today().isoformat()
    today_logs = db.query(ProductionLog).filter(
        ProductionLog.line_id.in_(line_ids),
        ProductionLog.log_date == today_str
    ).all() if line_ids else []

    today_total = sum(l.final_effective_units for l in today_logs)

    all_logs = db.query(ProductionLog).filter(
        ProductionLog.line_id.in_(line_ids)
    ).all() if line_ids else []

    moving_averages = ProductionLineCounter.calculate_historical_moving_averages([l.to_dict() for l in all_logs])

    summary = db.query(ContextMemorySummary).filter(
        ContextMemorySummary.business_id == profile.id
    ).order_by(ContextMemorySummary.generated_at.desc()).first()
    active_multiplier = summary.active_bias_multiplier if summary else 1.0

    capacity_target = max(1.0, profile.daily_capacity_target)
    utilization_pct = round((today_total / capacity_target) * 100.0, 1)

    return {
        "status": "SUCCESS",
        "company_name": profile.company_name,
        "today_date": today_str,
        "today_output": today_total,
        "daily_capacity_target": profile.daily_capacity_target,
        "capacity_utilization_pct": utilization_pct,
        "moving_avg_7d": moving_averages.get("7_day_avg", 0.0),
        "moving_avg_30d": moving_averages.get("30_day_avg", 0.0),
        "total_days_recorded": moving_averages.get("total_recorded_days", 0),
        "active_model_bias_multiplier": active_multiplier,
        "lines_count": len(lines)
    }

@router.get("/production/logs")
def get_production_logs(
    tenant_id: str = Depends(get_current_tenant_id),
    limit: int = Query(30, ge=1, le=365),
    db: Session = Depends(get_db)
):
    """Day-by-day historical production records."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {"status": "SUCCESS", "logs": []}

    lines = db.query(ProductionLine).filter(ProductionLine.business_id == profile.id).all()
    line_ids = [l.id for l in lines]
    if not line_ids:
        return {"status": "SUCCESS", "logs": []}

    logs = db.query(ProductionLog).filter(
        ProductionLog.line_id.in_(line_ids)
    ).order_by(ProductionLog.log_date.desc()).limit(limit).all()

    return {"status": "SUCCESS", "logs": [l.to_dict() for l in logs]}

@router.post("/production/logs")
def record_production_log(
    payload: Dict[str, Any],
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Ingests production log for a shift/day, evaluating confidence and statistical bounds.
    """
    line_id = payload.get("line_id")
    actual_counted = int(payload.get("actual_units_counted", 0))
    degraded_mins = float(payload.get("degraded_minutes", 0.0))
    visual_q = float(payload.get("visual_quality_q", 1.0))
    historical_upm = float(payload.get("historical_upm", 12.0))

    est_results = UncertaintyApproximator.estimate_production_with_bounds(
        actual_counted=actual_counted,
        historical_upm=historical_upm,
        degraded_duration_minutes=degraded_mins,
        visual_quality_q=visual_q
    )

    log_entry = ProductionLog(
        id=f"plog_{uuid.uuid4().hex[:12]}",
        line_id=line_id,
        log_date=payload.get("log_date", date.today().isoformat()),
        shift_name=payload.get("shift_name", "SHIFT_A"),
        actual_units_counted=actual_counted,
        estimated_units=est_results["final_count"],
        confidence_pct=est_results["confidence_pct"],
        adjustment_reason=est_results["badge_label"] if est_results["is_estimated"] else None
    )
    db.add(log_entry)
    db.commit()
    db.refresh(log_entry)
    return {"status": "SUCCESS", "data": log_entry.to_dict(), "estimation_details": est_results}

@router.post("/production/override")
def human_override_production(
    payload: Dict[str, Any],
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Business Owner override endpoint with exponential recency decay.
    """
    log_id = payload.get("log_id")
    corrected_units = int(payload.get("corrected_units", 0))
    reason = payload.get("reason", "Business owner manual verification")

    log_entry = db.query(ProductionLog).filter(ProductionLog.id == log_id).first()
    if not log_entry:
        raise HTTPException(status_code=404, detail="Production log record not found.")

    original_units = log_entry.final_effective_units
    log_entry.user_adjusted_units = corrected_units
    log_entry.adjustment_reason = reason

    line = db.query(ProductionLine).filter(ProductionLine.id == log_entry.line_id).first()
    business_id = line.business_id if line else None

    multiplier = 1.0
    if business_id:
        delta_pct = round(((corrected_units - original_units) / max(1, original_units)) * 100.0, 2)
        correction_rec = UserCorrectionMemory(
            id=f"corr_{uuid.uuid4().hex[:12]}",
            business_id=business_id,
            metric_type="PRODUCTION",
            reference_id=log_id,
            original_value=float(original_units),
            corrected_value=float(corrected_units),
            delta_pct=delta_pct,
            reason_note=reason,
            decay_lambda=AdaptiveMemoryEngine.LAMBDA_DECAY
        )
        db.add(correction_rec)
        db.flush()

        all_corrections = db.query(UserCorrectionMemory).filter(
            UserCorrectionMemory.business_id == business_id
        ).all()

        multiplier, _ = AdaptiveMemoryEngine.calculate_active_bias_multiplier(
            [c.to_dict() for c in all_corrections]
        )

        profile = db.query(BusinessProfile).filter(BusinessProfile.id == business_id).first()
        summary_md = AdaptiveMemoryEngine.generate_compressed_context_summary(
            business_name=profile.company_name if profile else "Plant",
            corrections=[c.to_dict() for c in all_corrections],
            active_bias_multiplier=multiplier
        )

        context_summary = ContextMemorySummary(
            id=f"ctx_{uuid.uuid4().hex[:12]}",
            business_id=business_id,
            summary_markdown=summary_md,
            active_bias_multiplier=multiplier,
            total_corrections_analyzed=len(all_corrections)
        )
        db.add(context_summary)

    db.commit()
    db.refresh(log_entry)
    return {
        "status": "SUCCESS",
        "message": "Human-in-the-loop override recorded and adaptive context recalibrated.",
        "log": log_entry.to_dict(),
        "active_bias_multiplier": multiplier
    }
