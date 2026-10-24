"""
YardSight AI - Schemas Package
"""

from schemas.auth import LoginRequest, TokenResponse, UserPayload, RoleInfo
from schemas.camera import (
    CameraCreate, CameraUpdate, CameraResponse, CameraListResponse,
    CameraTestRequest, CameraTestResponse
)
from schemas.truck import TruckCreate, TruckStatusUpdate, TruckResponse, DwellSummary
from schemas.leak import LeakStatusResponse, ActuatorRequest, ActuatorResponse, LeakMetrics
from schemas.anpr import ANPRUnwarpResponse
from schemas.document import DocumentGenerateRequest, DocumentResponse
from schemas.dispatch import DispatchAlertRequest, DispatchAlertResponse
from schemas.tenant import TenantResponse, TenantSwitchRequest
from schemas.mcp import McpInvokeRequest, McpInvokeResponse, McpToolDefinition
from schemas.scale import ScaleMetricsResponse, ScaleHealthResponse
from schemas.admin import DataStatusResponse, DatabaseHealthResponse

__all__ = [
    "LoginRequest", "TokenResponse", "UserPayload", "RoleInfo",
    "CameraCreate", "CameraUpdate", "CameraResponse", "CameraListResponse",
    "CameraTestRequest", "CameraTestResponse",
    "TruckCreate", "TruckStatusUpdate", "TruckResponse", "DwellSummary",
    "LeakStatusResponse", "ActuatorRequest", "ActuatorResponse", "LeakMetrics",
    "ANPRUnwarpResponse",
    "DocumentGenerateRequest", "DocumentResponse",
    "DispatchAlertRequest", "DispatchAlertResponse",
    "TenantResponse", "TenantSwitchRequest",
    "McpInvokeRequest", "McpInvokeResponse", "McpToolDefinition",
    "ScaleMetricsResponse", "ScaleHealthResponse",
    "DataStatusResponse", "DatabaseHealthResponse"
]
