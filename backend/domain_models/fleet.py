"""
Truck and EWayBill ORM Models for yard fleet logistics and freight manifest.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


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
        dwell = self.dwell_minutes or 0
        free = self.free_time_minutes or 120
        is_det = self.status == "DETENTION" or dwell > free
        return {
            "id": self.id,
            "truck_id": self.id,
            "plate_number": self.plate_number,
            "country": self.country,
            "carrier_name": self.carrier_name,
            "driver_name": self.driver_name,
            "driver_phone": self.driver_phone,
            "dock_number": self.dock_number,
            "assigned_bay": self.dock_number,
            "status": "DETENTION" if is_det else self.status,
            "arrival_time": self.arrival_time.isoformat() if self.arrival_time else None,
            "departure_time": self.departure_time.isoformat() if self.departure_time else None,
            "dwell_minutes": dwell,
            "is_detention": is_det,
            "detention_minutes": max(0, dwell - free) if is_det else 0,
            "free_time_minutes": free,
            "detention_charge": self.detention_charge or 0.0,
            "accrued_detention_fee_usd": self.detention_charge or 0.0,
            "hours_formatted": f"{dwell // 60}h {dwell % 60}m",
            "cargo_desc": self.cargo_desc,
            "cargo_items": self.cargo_desc,
            "manifest_bol": self.eway_bill_id or f"BOL-{self.id}",
            "eway_bill_id": self.eway_bill_id,
            "tenant_id": self.tenant_id
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
