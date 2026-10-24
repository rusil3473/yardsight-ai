"""
DoLynk Decoupled Service Facade (<80 lines).
Coordinates authentication, live RTSP streaming, device management, and background ingestion.
"""
import os
from typing import Optional, Dict, Any, List
from .auth import DoLynkAuthManager
from .stream import DoLynkStreamManager
from .devices import DoLynkDeviceManager
from .worker import DoLynkOpticalWorker
from .diagnostics import DoLynkDiagnosticManager

class DoLynkCloudService:
    """Decoupled facade preserving 100% backward compatibility with clean sub-services."""

    def __init__(self):
        self.app_key = os.getenv("DOLYNK_APP_KEY", "2103726776689319936")
        self.app_secret = os.getenv("DOLYNK_APP_SECRET", "lzxRH4Bprn8svqaeSWJTrfk1LmyZRSSL")
        self.product_id = os.getenv("DOLYNK_PRODUCT_ID", "1053644517")
        self.api_host = os.getenv("DOLYNK_HOST", "https://open-api-sg.dolynkcloud.com")
        self.default_device_sn = os.getenv("DAHUA_DEVICE_SN", "AG07AA7PCA3D3B6")

        self.auth = DoLynkAuthManager(self.app_key, self.app_secret, self.product_id, self.api_host)
        self.stream = DoLynkStreamManager(self.auth)
        self.devices = DoLynkDeviceManager(self.auth, self.default_device_sn)
        self.worker = DoLynkOpticalWorker(self.stream, self.default_device_sn)
        self.diagnostics = DoLynkDiagnosticManager(self.auth, self.stream, self.worker)

    # Delegated methods for backward compatibility
    def get_app_access_token(self, force_refresh: bool = False) -> str:
        return self.auth.get_token(force_refresh=force_refresh)

    def get_live_rtsp_url(self, device_sn: str, channel_id: int = 0) -> Optional[str]:
        return self.stream.get_live_rtsp_url(device_sn, channel_id)

    def get_device_list(self) -> List[Dict[str, Any]]:
        return self.devices.get_device_list()

    def import_nvr_channels(self, nvr_sn: str, nvr_name: str = "Dahua NVR", num_channels: int = 32, tenant_id: str = "TENANT-MY-HUB", db: Any = None, channels: list = None) -> list:
        return self.devices.import_nvr_channels(nvr_sn, nvr_name, num_channels, tenant_id, db, channels)

    def add_device(self, device_sn: str, password: str = "", category_code: str = "NVR") -> Dict[str, Any]:
        return self.devices.add_device(device_sn, password, category_code)

    def start_background_worker(self, device_sn: Optional[str] = None, channel_id: int = 0):
        self.worker.start_worker(device_sn, channel_id)

    def get_latest_optical_frame(self, device_sn: Optional[str] = None, channel_id: int = 0):
        frame = self.worker.get_latest_frame(device_sn)
        if frame is None:
            self.worker.start_worker(device_sn, channel_id)
        return frame

    def diagnose_camera(self, device_sn: str, channel_id: int = 0) -> Dict[str, Any]:
        return self.diagnostics.diagnose_camera(device_sn, channel_id)

    def test_connection(self, device_sn: Optional[str] = None) -> Dict[str, Any]:
        sn = device_sn or self.default_device_sn
        return self.diagnostics.diagnose_camera(sn, 0)

dolynk_service = DoLynkCloudService()
