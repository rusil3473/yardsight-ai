"""
YardSight AI - Services Package
"""

from services.auth_service import auth_service, AuthService
from services.camera_service import camera_service, CameraService
from services.truck_service import truck_service, TruckService
from services.leak_service import leak_service, LeakService
from services.anpr_service import anpr_service, ANPRService
from services.document_service import document_service, DocumentService
from services.dispatch_service import dispatch_service, DispatchService
from services.tenant_service import tenant_service, TenantService
from services.mcp_service import mcp_service, McpService
from services.scale_service import scale_service, ScaleService
from services.admin_service import admin_service, AdminService
from services.dolynk_service import dolynk_service, DoLynkCloudService

__all__ = [
    "auth_service", "AuthService",
    "camera_service", "CameraService",
    "truck_service", "TruckService",
    "leak_service", "LeakService",
    "anpr_service", "ANPRService",
    "document_service", "DocumentService",
    "dispatch_service", "DispatchService",
    "tenant_service", "TenantService",
    "mcp_service", "McpService",
    "scale_service", "ScaleService",
    "admin_service", "AdminService",
    "dolynk_service", "DoLynkCloudService"
]

