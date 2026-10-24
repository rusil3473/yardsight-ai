"""
Production and Energy ORM Models for SME intelligence and telemetry.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


class BusinessProfile(Base):
    __tablename__ = "business_profiles"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), ForeignKey("tenants.id"), nullable=False, index=True)
    company_name = Column(String(128), nullable=False)
    industry_sector = Column(String(64), nullable=False)
    primary_products = Column(String(256), nullable=False)
    daily_capacity_target = Column(Float, nullable=False, default=5000.0)
    electricity_tariff_per_kwh = Column(Float, default=8.50)
    currency = Column(String(16), default="INR")
    currency_symbol = Column(String(8), default="₹")
    ai_research_summary = Column(Text, default="")
    benchmark_sec_kwh_per_unit = Column(Float, default=0.25)
    rated_cycle_seconds = Column(Float, default=4.5)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    tenant = relationship("Tenant", back_populates="business_profiles")
    production_lines = relationship("ProductionLine", back_populates="business", cascade="all, delete-orphan")
    energy_readings = relationship("EnergyMeterReading", back_populates="business", cascade="all, delete-orphan")
    corrections = relationship("UserCorrectionMemory", back_populates="business", cascade="all, delete-orphan")
    context_summaries = relationship("ContextMemorySummary", back_populates="business", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "company_name": self.company_name,
            "industry_sector": self.industry_sector,
            "primary_products": self.primary_products,
            "daily_capacity_target": self.daily_capacity_target,
            "electricity_tariff_per_kwh": self.electricity_tariff_per_kwh,
            "currency": self.currency,
            "currency_symbol": self.currency_symbol,
            "ai_research_summary": self.ai_research_summary,
            "benchmark_sec_kwh_per_unit": self.benchmark_sec_kwh_per_unit,
            "rated_cycle_seconds": self.rated_cycle_seconds,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }


class ProductionLine(Base):
    __tablename__ = "production_lines"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("business_profiles.id"), nullable=False, index=True)
    line_name = Column(String(128), nullable=False)
    camera_id = Column(String(64), nullable=False)
    tripwire_x1 = Column(Integer, default=100)
    tripwire_y1 = Column(Integer, default=300)
    tripwire_x2 = Column(Integer, default=500)
    tripwire_y2 = Column(Integer, default=300)
    direction = Column(String(32), default="LEFT_TO_RIGHT")
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    business = relationship("BusinessProfile", back_populates="production_lines")
    logs = relationship("ProductionLog", back_populates="line", cascade="all, delete-orphan")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "line_name": self.line_name,
            "camera_id": self.camera_id,
            "tripwire": {
                "x1": self.tripwire_x1,
                "y1": self.tripwire_y1,
                "x2": self.tripwire_x2,
                "y2": self.tripwire_y2,
                "direction": self.direction
            },
            "is_active": self.is_active,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class ProductionLog(Base):
    __tablename__ = "production_logs"

    id = Column(String(64), primary_key=True, index=True)
    line_id = Column(String(64), ForeignKey("production_lines.id"), nullable=False, index=True)
    log_date = Column(String(32), nullable=False, index=True)  # YYYY-MM-DD
    shift_name = Column(String(32), default="SHIFT_A")
    actual_units_counted = Column(Integer, default=0)
    estimated_units = Column(Integer, default=0)
    confidence_pct = Column(Float, default=98.5)
    user_adjusted_units = Column(Integer, nullable=True)
    adjustment_reason = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    line = relationship("ProductionLine", back_populates="logs")

    @property
    def final_effective_units(self):
        if self.user_adjusted_units is not None:
            return self.user_adjusted_units
        return self.estimated_units if self.estimated_units > 0 else self.actual_units_counted

    def to_dict(self):
        return {
            "id": self.id,
            "line_id": self.line_id,
            "log_date": self.log_date,
            "shift_name": self.shift_name,
            "actual_units_counted": self.actual_units_counted,
            "estimated_units": self.estimated_units,
            "confidence_pct": self.confidence_pct,
            "user_adjusted_units": self.user_adjusted_units,
            "final_effective_units": self.final_effective_units,
            "adjustment_reason": self.adjustment_reason,
            "created_at": self.created_at.isoformat() if self.created_at else None,
        }


class EnergyMeterReading(Base):
    __tablename__ = "energy_meter_readings"

    id = Column(String(64), primary_key=True, index=True)
    business_id = Column(String(64), ForeignKey("business_profiles.id"), nullable=False, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    cumulative_kwh = Column(Float, nullable=False)
    delta_kwh = Column(Float, nullable=False)
    units_produced_in_window = Column(Integer, default=0)
    units_per_kwh = Column(Float, default=0.0)
    kwh_per_unit = Column(Float, default=0.0)
    cost_in_window = Column(Float, default=0.0)
    is_anomaly = Column(Boolean, default=False)
    anomaly_details = Column(String(256), default="")

    # Relationships
    business = relationship("BusinessProfile", back_populates="energy_readings")

    def to_dict(self):
        return {
            "id": self.id,
            "business_id": self.business_id,
            "timestamp": self.timestamp.isoformat() if self.timestamp else None,
            "cumulative_kwh": self.cumulative_kwh,
            "delta_kwh": self.delta_kwh,
            "units_produced_in_window": self.units_produced_in_window,
            "units_per_kwh": self.units_per_kwh,
            "kwh_per_unit": self.kwh_per_unit,
            "cost_in_window": self.cost_in_window,
            "is_anomaly": self.is_anomaly,
            "anomaly_details": self.anomaly_details,
        }
