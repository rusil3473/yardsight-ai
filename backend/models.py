"""
YardSight AI (GodownOS) - SQLAlchemy 2.0 ORM Models
Declarative, typed relational database models for enterprise multi-tenancy, users, fleet, cameras, and compliance.
"""

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

class Truck(Base):
    __tablename__ = "trucks"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False)
    plate_number = Column(String(32), index=True, nullable=False)
    country = Column(String(8), default="IN")
    carrier_name = Column(String(128), nullable=False)
    driver_name = Column(String(128), default="Driver")
    driver_phone = Column(String(32), default="+91-98765-00000")
    dock_number = Column(String(32), default="Bay 01")
    status = Column(String(32), default="INBOUND")  # INBOUND, AT_DOCK, DETENTION, CLEARED
    arrival_time = Column(DateTime, default=datetime.utcnow)
    departure_time = Column(DateTime, nullable=True)
    dwell_minutes = Column(Integer, default=0)
    free_time_minutes = Column(Integer, default=120)
    detention_charge = Column(Float, default=0.0)
    cargo_desc = Column(String(256), default="24 Pallets (Standard Freight)")
    eway_bill_id = Column(String(64), nullable=True)

    tenant = relationship("Tenant", back_populates="trucks")

    def to_dict(self):
        return {
            "truck_id": self.id,
            "plate_number": self.plate_number,
            "country": self.country,
            "carrier_name": self.carrier_name,
            "driver_name": self.driver_name,
            "driver_phone": self.driver_phone,
            "dock_number": self.dock_number,
            "status": self.status,
            "arrival_time": self.arrival_time.isoformat() if self.arrival_time else None,
            "departure_time": self.departure_time.isoformat() if self.departure_time else None,
            "dwell_minutes": self.dwell_minutes,
            "free_time_minutes": self.free_time_minutes,
            "detention_charge": self.detention_charge,
            "cargo_desc": self.cargo_desc,
            "eway_bill_id": self.eway_bill_id,
            "tenant_id": self.tenant_id
        }

class CCTVCamera(Base):
    __tablename__ = "cctv_cameras"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False)
    name = Column(String(128), nullable=False)
    stream_type = Column(String(32), default="RTSP")  # RTSP, HLS, WebRTC, DMSS
    location = Column(String(128), nullable=False)
    status = Column(String(32), default="ONLINE")  # ONLINE, OFFLINE, DEGRADED, HAZARD
    fps = Column(Integer, default=30)
    resolution = Column(String(32), default="1080p")
    stream_url = Column(String(512), nullable=True)
    dmss_serial = Column(String(64), nullable=True)  # Dahua DMSS Device Serial Number
    dmss_channel = Column(Integer, default=1)
    dmss_username = Column(String(64), default="admin")
    dmss_password = Column(String(64), nullable=True)
    ai_pipeline = Column(String(64), default="ANPR_OCR")  # ANPR_OCR, DOCK_CYCLE, ROOF_LEAK, SECURITY_INTRUSION
    brand = Column(String(64), default="DAHUA_DMSS")  # DAHUA_DMSS, HIKVISION, AXIS, GENERIC_RTSP, SIMULATED

    tenant = relationship("Tenant", back_populates="cameras")

    def to_dict(self):
        return {
            "id": self.id,
            "camera_id": self.id,
            "name": self.name,
            "stream_type": self.stream_type,
            "location": self.location,
            "status": self.status,
            "fps": self.fps,
            "resolution": self.resolution,
            "stream_url": self.stream_url,
            "dmss_serial": self.dmss_serial,
            "dmss_channel": self.dmss_channel,
            "dmss_username": self.dmss_username,
            "dmss_password": self.dmss_password,
            "ai_pipeline": self.ai_pipeline,
            "brand": self.brand,
            "tenant_id": self.tenant_id
        }

class LeakEvent(Base):
    __tablename__ = "leak_events"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    camera_id = Column(String(64), nullable=False)
    location = Column(String(128), nullable=False)
    area_sqm = Column(Float, default=0.0)
    rate_lph = Column(Float, default=0.0)
    severity = Column(String(32), default="WARNING")  # NORMAL, WARNING, CRITICAL
    status = Column(String(32), default="ACTIVE")  # ACTIVE, INVESTIGATING, RESOLVED
    detected_at = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "event_id": self.id,
            "tenant_id": self.tenant_id,
            "camera_id": self.camera_id,
            "location": self.location,
            "area_sqm": self.area_sqm,
            "rate_lph": self.rate_lph,
            "severity": self.severity,
            "status": self.status,
            "detected_at": self.detected_at.isoformat() if self.detected_at else None
        }

class EWayBill(Base):
    __tablename__ = "eway_bills"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False)
    ewb_number = Column(String(64), unique=True, index=True, nullable=False)
    truck_plate = Column(String(32), nullable=False)
    transporter = Column(String(128), nullable=False)
    doc_type = Column(String(32), default="GST_EWAY_BILL")  # GST_EWAY_BILL, US_EBOL
    cargo_description = Column(String(256), default="Standard Freight")
    status = Column(String(32), default="ACTIVE")
    qr_code_data = Column(Text, default="")
    valid_until = Column(DateTime, default=datetime.utcnow)
    generated_by_user_id = Column(String(64), nullable=True)
    generated_at = Column(DateTime, default=datetime.utcnow)

    tenant = relationship("Tenant", back_populates="eway_bills")

    def to_dict(self):
        return {
            "id": self.id,
            "ewb_number": self.ewb_number,
            "truck_plate": self.truck_plate,
            "transporter": self.transporter,
            "doc_type": self.doc_type,
            "cargo_description": self.cargo_description,
            "status": self.status,
            "qr_code_data": self.qr_code_data,
            "valid_until": self.valid_until.isoformat() if self.valid_until else None,
            "generated_by_user_id": self.generated_by_user_id,
            "generated_at": self.generated_at.isoformat() if self.generated_at else None,
            "tenant_id": self.tenant_id
        }

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, index=True)
    user_id = Column(String(64), nullable=False)
    action = Column(String(128), nullable=False)
    details = Column(Text, default="")
    timestamp = Column(DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "user_id": self.user_id,
            "action": self.action,
            "details": self.details,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None
        }
