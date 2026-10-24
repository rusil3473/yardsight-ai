"""
YardSight AI - Roof Leak & Physical Actuator Pydantic Schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class LeakMetrics(BaseModel):
    wet_pixels: int
    estimated_surface_area_sqm: float
    expansion_velocity_cm_per_min: float
    severity: str
    action_required: str

class LeakStatusResponse(BaseModel):
    status: str
    rain_intensity: float
    wet_area_sqm: float
    leak_rate_liters_per_hour: float
    leak_severity: str
    action_dispatched: str
    metrics: LeakMetrics
    cctv_frame_b64: Optional[str] = None

class ActuatorRequest(BaseModel):
    bay_id: str = Field("BAY-04", description="Affected bay location")
    pump_id: Optional[str] = Field("PUMP-NORTH-01", description="Sump pump identifier")
    divert_zone: Optional[str] = Field("DRY-ZONE-B", description="Safe forklift staging zone")
    initiated_by: Optional[str] = Field("Facility Operations", description="Operator or AI agent name")

class ActuatorResponse(BaseModel):
    status: str
    action: str
    target: str
    message: str
    timestamp: str
