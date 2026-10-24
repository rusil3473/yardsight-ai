"""
YardSight AI (GodownOS) - Enterprise Multi-Tenant Manager
Directly backed by real PostgreSQL database (yardsight_db).
Zero hardcoded mock dictionaries.
"""

from typing import Dict, Any, List, Optional
from database import SessionLocal
from models import Tenant

class TenantManager:
    """
    PostgreSQL-backed Tenant Manager.
    All facilities are queried and persisted directly in the relational PostgreSQL database.
    """
    def __init__(self):
        self.active_tenant_id: str = "TENANT-MY-HUB"

    @property
    def tenants(self) -> Dict[str, Dict[str, Any]]:
        """Dynamic backward-compatible property reading directly from PostgreSQL."""
        return {t["tenant_id"]: t for t in self.get_all_tenants()}

    def get_all_tenants(self, db=None) -> List[Dict[str, Any]]:
        """Fetch all tenant facilities directly from the PostgreSQL database."""
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            records = db.query(Tenant).order_by(Tenant.created_at.asc()).all()
            if not records:
                # Bootstrap the real default customer godown hub in PostgreSQL
                bootstrap_hub = Tenant(
                    id="TENANT-MY-HUB",
                    name="My Logistics Godown Hub",
                    organization="Apex Supply Chain Logistics",
                    location="Bengaluru Logistics Corridor, Karnataka (IN)",
                    active_docks=8,
                    cameras_online=0,
                    free_time_hours=2.0,
                    sla_target_turnaround_mins=60,
                    detention_rate_per_hour=1200.0,
                    currency="INR",
                    currency_symbol="₹",
                    default_market="IN_GST"
                )
                db.add(bootstrap_hub)
                db.commit()
                db.refresh(bootstrap_hub)
                records = [bootstrap_hub]
            return [t.to_dict() for t in records]
        except Exception as e:
            print(f"[TENANT MANAGER DB ERROR] {e}")
            return []
        finally:
            if should_close:
                db.close()

    def get_tenant(self, tenant_id: Optional[str] = None, db=None) -> Optional[Dict[str, Any]]:
        """Fetch a specific tenant facility from PostgreSQL."""
        tid = tenant_id or self.active_tenant_id
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            t = db.query(Tenant).filter(Tenant.id == tid).first()
            if not t and tid != self.active_tenant_id:
                t = db.query(Tenant).filter(Tenant.id == self.active_tenant_id).first()
            if not t:
                # If table empty or id not found, get all (which bootstraps if needed)
                all_t = self.get_all_tenants(db=db)
                return all_t[0] if all_t else None
            return t.to_dict()
        except Exception as e:
            print(f"[TENANT MANAGER DB ERROR] {e}")
            return None
        finally:
            if should_close:
                db.close()

    def get_active_tenant(self, db=None) -> Optional[Dict[str, Any]]:
        """Returns the active tenant facility directly from PostgreSQL."""
        return self.get_tenant(self.active_tenant_id, db=db)

    def switch_active_tenant(self, tenant_id: str, db=None) -> Dict[str, Any]:
        """Switches the active facility after validating against PostgreSQL records."""
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            t = db.query(Tenant).filter(Tenant.id == tenant_id).first()
            if t:
                self.active_tenant_id = t.id
                tenant_dict = t.to_dict()
                return {
                    "status": "success",
                    "active_tenant_id": t.id,
                    "active_tenant": tenant_dict,
                    "tenant": tenant_dict
                }
            return {
                "status": "error",
                "message": f"Tenant '{tenant_id}' not found in PostgreSQL database"
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
        finally:
            if should_close:
                db.close()

    def create_or_update_tenant(self, tenant_data: Dict[str, Any], db=None) -> Dict[str, Any]:
        """Creates or updates a facility record directly in PostgreSQL."""
        should_close = False
        if db is None:
            db = SessionLocal()
            should_close = True
        try:
            tid = tenant_data.get("tenant_id") or tenant_data.get("id") or "TENANT-MY-HUB"
            t = db.query(Tenant).filter(Tenant.id == tid).first()
            if not t:
                t = Tenant(
                    id=tid,
                    name=tenant_data.get("name", "Logistics Hub"),
                    organization=tenant_data.get("organization", "Apex Logistics"),
                    location=tenant_data.get("location", "Bengaluru Logistics Corridor, Karnataka (IN)"),
                    active_docks=tenant_data.get("active_docks", 8),
                    cameras_online=tenant_data.get("cameras_online", 0),
                    free_time_hours=tenant_data.get("free_time_hours", 2.0),
                    sla_target_turnaround_mins=tenant_data.get("sla_target_turnaround_mins", 60),
                    detention_rate_per_hour=tenant_data.get("detention_rate_per_hour", 1200.0),
                    currency=tenant_data.get("currency", "INR"),
                    currency_symbol=tenant_data.get("currency_symbol", "₹"),
                    default_market=tenant_data.get("default_market", "IN_GST")
                )
                db.add(t)
            else:
                for col in ["name", "organization", "location", "active_docks", "cameras_online",
                            "free_time_hours", "sla_target_turnaround_mins", "detention_rate_per_hour",
                            "currency", "currency_symbol", "default_market"]:
                    if col in tenant_data:
                        setattr(t, col, tenant_data[col])
            db.commit()
            db.refresh(t)
            return t.to_dict()
        except Exception as e:
            db.rollback()
            raise e
        finally:
            if should_close:
                db.close()

tenant_manager = TenantManager()
