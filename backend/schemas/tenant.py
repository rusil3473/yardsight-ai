"""
YardSight AI - Multi-Tenant Isolation Pydantic Schemas
"""

from typing import Optional, List
from pydantic import BaseModel, Field, ConfigDict

class TenantResponse(BaseModel):
    tenant_id: str
    name: str
    organization: str
    location: str
    active_docks: int
    cameras_online: int
    free_time_hours: float
    sla_target_turnaround_mins: int
    detention_rate_per_hour: float
    currency: str
    currency_symbol: str
    default_market: str

    model_config = ConfigDict(from_attributes=True)

class TenantSwitchRequest(BaseModel):
    target_tenant_id: str = Field(..., description="Target facility identifier")
