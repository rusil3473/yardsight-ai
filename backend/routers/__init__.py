"""
YardSight AI - Routers Package
"""

from fastapi import APIRouter
from routers.auth_router import router as auth_router
from routers.camera_router import router as camera_router
from routers.truck_router import router as truck_router
from routers.leak_router import router as leak_router
from routers.anpr_router import router as anpr_router
from routers.document_router import router as document_router
from routers.dispatch_router import router as dispatch_router
from routers.tenant_router import router as tenant_router
from routers.mcp_router import router as mcp_router
from routers.scale_router import router as scale_router
from routers.admin_router import router as admin_router
from routers.b2b_router import router as b2b_router
from routers.subscription_router import router as subscription_router
from routers.alert_router import router as alert_router
from routers.support_router import router as support_router
from routers.vlm_router import router as vlm_router
from routers.nimbus_router import router as nimbus_router

api_router = APIRouter()

# Register all modular domain routers
api_router.include_router(auth_router)
api_router.include_router(camera_router)
api_router.include_router(truck_router)
api_router.include_router(leak_router)
api_router.include_router(anpr_router)
api_router.include_router(vlm_router)
api_router.include_router(nimbus_router)
api_router.include_router(document_router)
api_router.include_router(dispatch_router)
api_router.include_router(tenant_router)
api_router.include_router(mcp_router)
api_router.include_router(scale_router)
api_router.include_router(admin_router)
api_router.include_router(b2b_router)
api_router.include_router(subscription_router)
api_router.include_router(alert_router)
api_router.include_router(support_router)

__all__ = ["api_router"]

