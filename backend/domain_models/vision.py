"""
CCTVCamera, LeakEvent, and ANPRScanRecord ORM Models for vision telemetry.
"""

from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from database import Base


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
            "dmss_has_password": bool(self.dmss_password),
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


class ANPRScanRecord(Base):
    __tablename__ = "anpr_scan_records"

    id = Column(String(64), primary_key=True, index=True)
    tenant_id = Column(String(64), nullable=False, default="TENANT-MY-HUB", index=True)
    camera_id = Column(String(64), default="CAM-01")
    plate_number = Column(String(32), index=True, nullable=False)
    original_ocr_plate = Column(String(32), nullable=False)
    is_manually_corrected = Column(Boolean, default=False)
    country = Column(String(8), default="IN")
    confidence_pct = Column(Float, default=98.5)
    gate_id = Column(String(64), default="Gate 01 Inbound")
    status = Column(String(32), default="AUTHORIZED")  # AUTHORIZED, FLAGGED, QUARANTINE
    carrier_name = Column(String(128), default="Standard Commercial Carrier")
    driver_name = Column(String(128), default="Verified Dispatch Operator")
    raw_cctv_b64 = Column(Text, nullable=True)
    unwarped_plate_b64 = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    corrected_at = Column(DateTime, nullable=True)
    corrected_by_user_id = Column(String(64), nullable=True)

    def to_dict(self):
        return {
            "id": self.id,
            "tenant_id": self.tenant_id,
            "camera_id": self.camera_id,
            "plate_number": self.plate_number,
            "original_ocr_plate": self.original_ocr_plate,
            "is_manually_corrected": self.is_manually_corrected,
            "country": self.country,
            "confidence_pct": self.confidence_pct,
            "gate_id": self.gate_id,
            "status": self.status,
            "carrier_name": self.carrier_name,
            "driver_name": self.driver_name,
            "raw_cctv_b64": self.raw_cctv_b64,
            "unwarped_plate_b64": self.unwarped_plate_b64,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "corrected_at": self.corrected_at.isoformat() if self.corrected_at else None,
            "corrected_by_user_id": self.corrected_by_user_id,
        }
