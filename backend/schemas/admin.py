"""
YardSight AI - System Admin & Health Pydantic Schemas
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel

class DataStatusResponse(BaseModel):
    facilities_count: int
    users_count: int
    cameras_count: int
    trucks_count: int
    documents_count: int
    leaks_count: int
    is_clean: bool

class DatabaseHealthResponse(BaseModel):
    status: str
    engine: str
    database: str
    latency_ms: float
    dialect: str
    pool_size: Optional[int] = None
    connections_in_use: Optional[int] = None
    wal_mode: Optional[bool] = None
