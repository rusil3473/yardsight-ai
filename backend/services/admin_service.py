"""
YardSight AI - System Admin & Diagnostics Service Layer
"""

import sys, os
from typing import Dict, Any
from sqlalchemy.orm import Session
from models import Tenant, User, CCTVCamera, Truck, EWayBill, LeakEvent
from database import check_database_health
from seed_data import purge_all_demo_data
from schemas.admin import DataStatusResponse, DatabaseHealthResponse

class AdminService:
    """Service encapsulating database cleanliness, demo seeding, and live diagnostics."""

    @staticmethod
    def get_data_status(db: Session) -> DataStatusResponse:
        f_count = db.query(Tenant).count()
        u_count = db.query(User).count()
        c_count = db.query(CCTVCamera).count()
        t_count = db.query(Truck).count()
        d_count = db.query(EWayBill).count()
        l_count = db.query(LeakEvent).count()

        return DataStatusResponse(
            facilities_count=f_count,
            users_count=u_count,
            cameras_count=c_count,
            trucks_count=t_count,
            documents_count=d_count,
            leaks_count=l_count,
            is_clean=(t_count == 0 and l_count == 0)
        )

    @staticmethod
    def get_db_health() -> DatabaseHealthResponse:
        raw = check_database_health()
        return DatabaseHealthResponse(
            status=raw.get("status", "HEALTHY"),
            engine=raw.get("engine", "sqlite"),
            database=raw.get("database", "yardsight.db"),
            latency_ms=raw.get("latency_ms", 0.5),
            dialect=raw.get("dialect", "sqlite"),
            pool_size=raw.get("pool_size"),
            connections_in_use=raw.get("connections_in_use"),
            wal_mode=raw.get("wal_mode", True)
        )

    @staticmethod
    def clean_slate(db: Session) -> Dict[str, Any]:
        purge_all_demo_data(db)
        return {
            "status": "success",
            "message": "Production clean slate restored. All demo trucks and mock leaks purged.",
            "data_status": AdminService.get_data_status(db).model_dump()
        }

    @staticmethod
    def seed_demo(db: Session) -> Dict[str, Any]:
        _temp_seeds_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "temp", "dummy_seeds"))
        if _temp_seeds_dir not in sys.path:
            sys.path.insert(0, _temp_seeds_dir)
        try:
            from yardsight_demo_seed import seed_enterprise_data
            seed_enterprise_data(db)
            return {
                "status": "success",
                "message": "Enterprise demo fleet, Dahua DMSS cameras, and compliance documents populated."
            }
        except Exception as e:
            return {
                "status": "error",
                "message": f"Could not load external demo seeds: {e}"
            }

admin_service = AdminService()
