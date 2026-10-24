"""
YardSight AI - Dahua NetSDK Official Python Service (<20 lines).
Re-exports clean decoupled implementation from services.netsdk.
"""
from services.netsdk import (
    DahuaNetSDKManager,
    dahua_netsdk_service,
    NET_DEVICEINFO_Ex,
    NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY,
    NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY,
    NET_IN_REALPLAY,
    NET_OUT_REALPLAY
)

__all__ = [
    "DahuaNetSDKManager",
    "dahua_netsdk_service",
    "NET_DEVICEINFO_Ex",
    "NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY",
    "NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY",
    "NET_IN_REALPLAY",
    "NET_OUT_REALPLAY"
]
