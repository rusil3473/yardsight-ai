"""
YardSight AI - Multi-Tenant Isolation Service Layer
"""

from typing import List, Dict, Any, Optional
from sqlalchemy.orm import Session
from models import Tenant
from tenant_manager import tenant_manager
from schemas.tenant import TenantResponse

class TenantService:
    """Service encapsulating multi-facility isolation, configuration, and switching."""

    @staticmethod
    def list_tenants(db: Session) -> List[TenantResponse]:
        db_tenants = db.query(Tenant).all()
        if db_tenants:
            return [TenantResponse.model_validate(t.to_dict()) for t in db_tenants]
        
        # Fallback to in-memory tenant manager
        mem_tenants = tenant_manager.get_all_tenants()
        return [
            TenantResponse(
                tenant_id=t["tenant_id"],
                name=t["name"],
                organization=t["organization"],
                location=t["location"],
                active_docks=t["active_docks"],
                cameras_online=t["cameras_online"],
                free_time_hours=t["free_time_hours"],
                sla_target_turnaround_mins=t["sla_target_turnaround_mins"],
                detention_rate_per_hour=t["detention_rate_per_hour"],
                currency=t["currency"],
                currency_symbol=t["currency_symbol"],
                default_market=t["default_market"]
            )
            for t in mem_tenants
        ]

    @staticmethod
    def get_tenant(tenant_id: str, db: Session) -> Optional[TenantResponse]:
        t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if t:
            return TenantResponse.model_validate(t)
        mem = tenant_manager.get_tenant(tenant_id)
        if mem:
            return TenantResponse(
                tenant_id=mem["tenant_id"],
                name=mem["name"],
                organization=mem["organization"],
                location=mem["location"],
                active_docks=mem["active_docks"],
                cameras_online=mem["cameras_online"],
                free_time_hours=mem["free_time_hours"],
                sla_target_turnaround_mins=mem["sla_target_turnaround_mins"],
                detention_rate_per_hour=mem["detention_rate_per_hour"],
                currency=mem["currency"],
                currency_symbol=mem["currency_symbol"],
                default_market=mem["default_market"]
            )
        return None

    @staticmethod
    def switch_facility(target_id: str, user_id: str, db: Session) -> Optional[Dict[str, Any]]:
        target = db.query(Tenant).filter(Tenant.id == target_id).first()
        if not target and target_id not in tenant_manager.TENANTS:
            return None
        return tenant_manager.switch_tenant(user_id, target_id)

    @staticmethod
    def delete_tenant(tenant_id: str, db: Session) -> bool:
        tenant = db.query(Tenant).filter(Tenant.id == tenant_id).first()
        if not tenant:
            return False
        total_tenants = db.query(Tenant).count()
        if total_tenants <= 1:
            raise ValueError("Cannot delete the primary active facility. At least one facility must exist.")

        from models import CCTVCamera, Truck, EWayBill
        db.query(CCTVCamera).filter(CCTVCamera.tenant_id == tenant_id).delete()
        db.query(Truck).filter(Truck.tenant_id == tenant_id).delete()
        db.query(EWayBill).filter(EWayBill.tenant_id == tenant_id).delete()

        db.delete(tenant)
        db.commit()
        return True

tenant_service = TenantService()
