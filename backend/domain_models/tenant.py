"""
Tenant, User, ApiKey, and TenantSetting ORM Models.
"""

import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(String(64), primary_key=True, index=True)
    name = Column(String(128), nullable=False)
    organization = Column(String(128), nullable=False)
    location = Column(String(128), nullable=False)
    active_docks = Column(Integer, default=12)
    cameras_online = Column(Integer, default=4)
    free_time_hours = Column(Float, default=2.0)
    sla_target_turnaround_mins = Column(Integer, default=60)
    detention_rate_per_hour = Column(Float, default=2400.0)
    currency = Column(String(16), default="INR")
    currency_symbol = Column(String(8), default="₹")
    default_market = Column(String(32), default="IN_GST")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = relationship("User", back_populates="tenant", cascade="all, delete-orphan")
    trucks = relationship("Truck", back_populates="tenant", cascade="all, delete-orphan")
    cameras = relationship("CCTVCamera", back_populates="tenant", cascade="all, delete-orphan")
    eway_bills = relationship("EWayBill", back_populates="tenant", cascade="all, delete-orphan")
    business_profiles = relationship("BusinessProfile", back_populates="tenant", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "tenant_id": self.id,
            "name": self.name,
            "organization": self.organization,
            "location": self.location,
            "active_docks": self.active_docks,
            "cameras_online": self.cameras_online,
            "free_time_hours": self.free_time_hours,
            "sla_target_turnaround_mins": self.sla_target_turnaround_mins,
            "detention_rate_per_hour": self.detention_rate_per_hour,
            "currency": self.currency,
            "currency_symbol": self.currency_symbol,
            "default_market": self.default_market,
        }


class User(Base):
    __tablename__ = "users"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False)
    email = Column(String(128), unique=True, index=True, nullable=False)
    hashed_password = Column(String(256), nullable=False)
    full_name = Column(String(128), nullable=False)
    role = Column(String(64), nullable=False)  # corporate_admin, yard_master, security_guard
    role_label = Column(String(128), nullable=False)
    phone = Column(String(32), default="+91-98765-43210")
    department = Column(String(64), default="Logistics Operations")
    avatar_url = Column(String(512), default="")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="users")

    def to_dict(self):
        permissions_map = {
            "corporate_admin": ["read_all", "write_all", "dispatch", "export_compliance", "configure_sla", "manage_tenants"],
            "yard_master": ["read_all", "write_dock", "dispatch", "export_compliance"],
            "security_guard": ["read_gate", "verify_anpr", "raise_barrier"]
        }
        return {
            "id": self.id,
            "email": self.email,
            "name": self.full_name,
            "role": self.role,
            "role_label": self.role_label,
            "tenant_id": self.tenant_id,
            "phone": self.phone,
            "department": self.department,
            "avatar": self.avatar_url,
            "permissions": permissions_map.get(self.role, ["read_gate"])
        }


class ApiKey(Base):
    __tablename__ = "api_keys"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False, index=True)
    key_prefix = Column(String(16), nullable=False)
    key_hash = Column(String(256), nullable=False, unique=True)
    name = Column(String(128), default="Default ERP Key")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "key_prefix": self.key_prefix,
            "name": self.name,
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class TenantSetting(Base):
    __tablename__ = "tenant_settings"

    tenant_id = Column(String(64), ForeignKey("tenants.id"), primary_key=True, index=True)
    whatsapp_gate_clearance = Column(Boolean, default=True)
    detention_escalation = Column(Boolean, default=True)
    roof_leak_alerts = Column(Boolean, default=True)
    eway_bill_expiry = Column(Boolean, default=False)
    integrations_config = Column(Text, default="{}")
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        cfg = {}
        try:
            cfg = json.loads(self.integrations_config) if self.integrations_config else {}
        except Exception:
            cfg = {}
        return {
            "tenant_id": self.tenant_id,
            "whatsapp_gate_clearance": self.whatsapp_gate_clearance,
            "detention_escalation": self.detention_escalation,
            "roof_leak_alerts": self.roof_leak_alerts,
            "eway_bill_expiry": self.eway_bill_expiry,
            "integrations": cfg,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
