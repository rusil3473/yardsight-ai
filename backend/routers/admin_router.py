"""
YardSight AI - Admin & Database Health Router
"""

from typing import Dict, Any
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from database import get_db
from schemas.admin import DataStatusResponse, DatabaseHealthResponse
from services.admin_service import admin_service

router = APIRouter(prefix="", tags=["System Administration & Diagnostics"])

@router.get("/admin/data-status", response_model=DataStatusResponse)
def get_data_cleanliness_status(db: Session = Depends(get_db)):
    """Returns database record counts and cleanliness verification."""
    return admin_service.get_data_status(db)

@router.post("/admin/clean-slate")
def reset_to_clean_slate(db: Session = Depends(get_db)):
    """Purges all demo trucks and mock leaks, guaranteeing a pristine production baseline."""
    return admin_service.clean_slate(db)

@router.post("/admin/seed-demo")
def seed_demo_records(db: Session = Depends(get_db)):
    """Populates evaluation demo fleet and compliance documents."""
    return admin_service.seed_demo(db)

@router.get("/health/db", response_model=DatabaseHealthResponse)
def get_db_health():
    """Live database connectivity, latency, dialect, and connection pooling metrics."""
    return admin_service.get_db_health()
