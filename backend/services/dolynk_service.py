"""
YardSight AI - Dahua DoLynk Cloud Service (<25 lines).
Re-exports clean decoupled implementation from services.dolynk.
"""
from services.dolynk import DoLynkCloudService, dolynk_service

__all__ = ["DoLynkCloudService", "dolynk_service"]
