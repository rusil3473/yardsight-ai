"""
YardSight AI - B2B Routers Package
"""

from fastapi import APIRouter
from routers.b2b.profile_router import router as profile_router
from routers.b2b.production_router import router as production_router
from routers.b2b.energy_router import router as energy_router
from routers.b2b.export_memory_router import router as export_memory_router

router = APIRouter(tags=["B2B Universal Integration"])
router.include_router(profile_router)
router.include_router(production_router)
router.include_router(energy_router)
router.include_router(export_memory_router)

__all__ = ["router"]
