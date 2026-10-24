"""
Dahua NetSDK C-Library Manager & P2P Client (<95 lines).
Loads dhnetsdk.dll and invokes CLIENT_LoginWithHighLevelSecurity for P2P connection.
"""
import os
import sys
import ctypes
from ctypes import sizeof, byref, c_void_p, c_int
from typing import Dict, Any, Optional
from .structures import (
    NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY,
    NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY,
    EM_LOGIN_SPEC_CAP_P2P
)

class DahuaNetSDKManager:
    """Manages the official Dahua C-SDK lifecycle and P2P sessions."""

    def __init__(self):
        self.dll = None
        self.is_loaded = False
        self.last_error: Optional[str] = None
        self._load_sdk()

    def _find_sdk_dll(self) -> Optional[str]:
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        paths = [
            os.path.join(backend_dir, "netsdk_bin", "dhnetsdk.dll"),
            os.path.join(backend_dir, "dhnetsdk.dll"),
            "C:\\Program Files\\Dahua\\dhnetsdk.dll",
            "dhnetsdk.dll"
        ]
        for p in paths:
            if os.path.exists(p):
                return p
        return None

    def _load_sdk(self):
        dll_path = self._find_sdk_dll()
        if not dll_path:
            self.last_error = "dhnetsdk.dll not found in backend/netsdk_bin/."
            return
        try:
            if sys.platform == "win32" and hasattr(os, "add_dll_directory"):
                os.add_dll_directory(os.path.dirname(os.path.abspath(dll_path)))
            self.dll = ctypes.windll.LoadLibrary(dll_path) if sys.platform == "win32" else ctypes.cdll.LoadLibrary(dll_path)
            self.dll.CLIENT_Init.argtypes = [c_void_p, c_void_p]
            self.dll.CLIENT_Init.restype = c_int
            if self.dll.CLIENT_Init(None, None):
                self.is_loaded = True
            else:
                self.last_error = "CLIENT_Init failed."
        except Exception as e:
            self.last_error = f"Error loading NetSDK: {e}"

    def login_p2p(self, serial_number: str, username: str = "admin", password: str = "Shri@21*") -> Dict[str, Any]:
        """Executes programmatic P2P login via Dahua NetSDK."""
        if not self.is_loaded or not self.dll:
            return {
                "success": False, "sdk_loaded": False, "login_id": 0, "serial_number": serial_number,
                "message": self.last_error or "NetSDK DLL not found.",
                "guide_url": "https://partner.dahuatech.com/"
            }
        st_in = NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY()
        st_in.dwSize = sizeof(NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY)
        st_in.szIP = serial_number.encode("utf-8")
        st_in.nPort = 0
        st_in.szUserName = username.encode("utf-8")
        st_in.szPassword = password.encode("utf-8")
        st_in.emSpecCap = EM_LOGIN_SPEC_CAP_P2P
        st_out = NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY()
        st_out.dwSize = sizeof(NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY)

        login_id = self.dll.CLIENT_LoginWithHighLevelSecurity(byref(st_in), byref(st_out))
        if login_id != 0:
            return {"success": True, "login_id": login_id, "serial_number": serial_number}
        err_code = self.dll.CLIENT_GetLastError() if hasattr(self.dll, "CLIENT_GetLastError") else -1
        return {"success": False, "error_code": err_code, "serial_number": serial_number}
