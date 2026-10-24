"""
YardSight AI - Scale Engine & High-Concurrency Pydantic Schemas
"""

from typing import Dict, Any, Optional
from pydantic import BaseModel

class ScaleMetricsResponse(BaseModel):
    rate_limiter: Dict[str, Any]
    lru_cache: Dict[str, Any]
    worker_queue: Dict[str, Any]
    high_concurrency_ready: bool
    target_capacity: str

class ScaleHealthResponse(BaseModel):
    status: str
    target_capacity: str
    active_tenants: int
    worker_queue_backlog: int
