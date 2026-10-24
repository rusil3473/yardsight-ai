"""
YardSight AI - CCTV Camera Pydantic Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class CameraCreate(BaseModel):
    id: Optional[str] = Field(None, description="Unique camera identifier (auto-generated if empty)")
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant isolation identifier")
    name: str = Field(..., min_length=2, max_length=128, description="Camera display name")
    location: str = Field(..., min_length=2, max_length=128, description="Physical yard location")
    brand: Optional[str] = Field("Dahua", description="Hardware vendor")
    resolution: Optional[str] = Field("2560x1440 (4MP)", description="Native sensor resolution")
    fps: Optional[int] = Field(30, ge=1, le=120, description="Frames per second")
    stream_type: str = Field("DMSS", description="Streaming protocol: DMSS, RTSP, HLS, or SIMULATED")
    stream_url: Optional[str] = Field(None, description="Direct RTSP, HTTP, or device index URL")
    ai_pipeline: Optional[str] = Field("ANPR_OCR", description="AI Vision Pipeline: ANPR_OCR, ROOF_LEAK, DOCK_SAFETY, GENERAL_MONITORING")
    status: Optional[str] = Field("ONLINE", description="Operational status: ONLINE, OFFLINE, DEGRADED, HAZARD")
    dmss_serial: Optional[str] = Field("AG07AA7PCA3D3B6", description="Dahua P2P Cloud Serial Number")
    dmss_channel: Optional[int] = Field(0, ge=0, le=128, description="NVR/DVR video channel index")
    dmss_username: Optional[str] = Field("admin", description="NVR login username")
    dmss_password: Optional[str] = Field(None, description="NVR login password")

class CameraUpdate(BaseModel):
    name: Optional[str] = None
    location: Optional[str] = None
    brand: Optional[str] = None
    resolution: Optional[str] = None
    fps: Optional[int] = None
    stream_type: Optional[str] = None
    stream_url: Optional[str] = None
    ai_pipeline: Optional[str] = None
    status: Optional[str] = None
    dmss_serial: Optional[str] = None
    dmss_channel: Optional[int] = None
    dmss_username: Optional[str] = None
    dmss_password: Optional[str] = None

class CameraResponse(BaseModel):
    id: str
    tenant_id: str
    name: str
    location: str
    brand: str
    resolution: str
    fps: int
    stream_type: str
    stream_url: Optional[str] = None
    ai_pipeline: str
    status: str
    dmss_serial: Optional[str] = None
    dmss_channel: Optional[int] = None
    dmss_username: Optional[str] = None
    last_heartbeat: Optional[datetime] = None
    created_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class CameraListResponse(BaseModel):
    cameras: List[CameraResponse]
    count: int

class CameraTestRequest(BaseModel):
    stream_type: str = Field("DMSS", description="DMSS, RTSP, or HLS")
    stream_url: Optional[str] = None
    dmss_serial: Optional[str] = "AG07AA7PCA3D3B6"
    dmss_channel: Optional[int] = 9
    dmss_username: Optional[str] = "admin"
    dmss_password: Optional[str] = "Shri@21*"

class CameraTestResponse(BaseModel):
    status: str
    reachable: bool
    latency_ms: float
    message: str
    technical_details: Optional[dict] = None
