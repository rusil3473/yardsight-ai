"""
YardSight AI - Fleet & Dock Dwell Pydantic Schemas
"""

from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, Field, ConfigDict

class TruckCreate(BaseModel):
    plate_number: str = Field(..., min_length=3, max_length=32, description="Vehicle registration plate")
    carrier_name: str = Field("Tata Logistics Express", min_length=2, max_length=128, description="Freight carrier company name")
    driver_name: Optional[str] = Field("Driver", max_length=128, description="Driver full name")
    driver_phone: Optional[str] = Field("+91-98765-43210", max_length=32, description="Driver contact number for SMS/WhatsApp dispatch")
    dock_number: Optional[str] = Field("Bay 01", max_length=32, description="Assigned dock door or bay")
    cargo_type: Optional[str] = Field("Dry Grocery", max_length=64, description="Commodity or cargo type")
    cargo_desc: Optional[str] = Field(None, max_length=128, description="Alternative cargo description field")
    country: Optional[str] = Field("IN", max_length=8, description="Country code (IN, US)")
    status: Optional[str] = Field("INBOUND", description="Initial status: INBOUND, AT_DOCK, DETENTION, CLEARED")
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant isolation identifier")

class TruckStatusUpdate(BaseModel):
    truck_id: str = Field(..., description="Unique truck identifier")
    status: str = Field(..., description="Target status: INBOUND, AT_DOCK, DETENTION, CLEARED")
    dock_number: Optional[str] = Field(None, description="Optional reassigned dock bay")

class TruckResponse(BaseModel):
    id: str
    tenant_id: str
    plate_number: str
    country: str
    carrier_name: str
    driver_name: str
    driver_phone: str
    dock_number: str
    status: str
    dwell_time_mins: int
    sla_limit_mins: int
    detention_fee: float
    cargo_type: str
    manifest_id: Optional[str] = None
    arrived_at: Optional[datetime] = None
    cleared_at: Optional[datetime] = None

    model_config = ConfigDict(from_attributes=True)

class DwellSummary(BaseModel):
    total_trucks: int
    at_dock: int
    inbound: int
    detention_count: int
    total_detention_fees: float
    currency_symbol: str = "₹"
