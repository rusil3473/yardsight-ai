"""
Dahua NetSDK Module (<30 lines).
"""
from .client import DahuaNetSDKManager
from .structures import (
    NET_DEVICEINFO_Ex,
    NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY,
    NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY,
    NET_IN_REALPLAY,
    NET_OUT_REALPLAY
)

dahua_netsdk_service = DahuaNetSDKManager()

__all__ = [
    "DahuaNetSDKManager",
    "dahua_netsdk_service",
    "NET_DEVICEINFO_Ex",
    "NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY",
    "NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY",
    "NET_IN_REALPLAY",
    "NET_OUT_REALPLAY"
]
