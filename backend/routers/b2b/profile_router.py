"""
YardSight AI - B2B Business Profile & AI Research Router
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import Dict, Any
from datetime import datetime
import uuid

from database import get_db
from models import BusinessProfile
from engines.business_research_agent import BusinessResearchAgent
from routers.b2b.common import get_current_tenant_id

router = APIRouter()

@router.get("/business/profile")
def get_business_profile(
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """Retrieve the business profile and autonomous AI research intelligence."""
    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        return {
            "status": "NOT_CONFIGURED",
            "message": "Business profile not yet configured. Use POST /api/v1/business/profile to initialize."
        }
    return {"status": "SUCCESS", "data": profile.to_dict()}

@router.post("/business/profile")
def create_or_update_business_profile(
    payload: Dict[str, Any],
    tenant_id: str = Depends(get_current_tenant_id),
    db: Session = Depends(get_db)
):
    """
    Initializes or updates business profile and autonomously executes the AI research agent
    to establish domain SEC benchmarks and rated cycle times.
    """
    company_name = payload.get("company_name", "Industrial Manufacturing Unit")
    industry_sector = payload.get("industry_sector", "General Manufacturing")
    primary_products = payload.get("primary_products", "Standard Assembled Products")
    daily_capacity_target = float(payload.get("daily_capacity_target", 5000.0))
    tariff = float(payload.get("electricity_tariff_per_kwh", 8.50))
    currency = payload.get("currency", "INR")

    # Run Autonomous AI Research Agent
    research = BusinessResearchAgent.research_business_profile(
        company_name=company_name,
        industry_sector=industry_sector,
        primary_products=primary_products,
        daily_capacity_target=daily_capacity_target,
        electricity_tariff_per_kwh=tariff,
        currency=currency
    )

    profile = db.query(BusinessProfile).filter(BusinessProfile.tenant_id == tenant_id).first()
    if not profile:
        profile = BusinessProfile(
            id=f"biz_{uuid.uuid4().hex[:12]}",
            tenant_id=tenant_id,
            company_name=company_name,
            industry_sector=industry_sector,
            primary_products=primary_products,
            daily_capacity_target=daily_capacity_target,
            electricity_tariff_per_kwh=tariff,
            currency=currency,
            currency_symbol="₹" if currency.upper() == "INR" else "$",
            ai_research_summary=research["ai_research_summary"],
            benchmark_sec_kwh_per_unit=research["benchmark_sec_kwh_per_unit"],
            rated_cycle_seconds=research["rated_cycle_seconds"]
        )
        db.add(profile)
    else:
        profile.company_name = company_name
        profile.industry_sector = industry_sector
        profile.primary_products = primary_products
        profile.daily_capacity_target = daily_capacity_target
        profile.electricity_tariff_per_kwh = tariff
        profile.currency = currency
        profile.currency_symbol = "₹" if currency.upper() == "INR" else "$"
        profile.ai_research_summary = research["ai_research_summary"]
        profile.benchmark_sec_kwh_per_unit = research["benchmark_sec_kwh_per_unit"]
        profile.rated_cycle_seconds = research["rated_cycle_seconds"]
        profile.updated_at = datetime.utcnow()

    db.commit()
    db.refresh(profile)
    return {
        "status": "SUCCESS",
        "message": "Business profile updated and AI industry research completed successfully.",
        "data": profile.to_dict()
    }
