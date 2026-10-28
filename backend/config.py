"""
YardSight AI - Centralized Backend Configuration & Environment Settings
Handles all defaults and allows overrides via standard environment variables.
"""
import os
from typing import List

# Dahua NVR Credentials & Serial
DEFAULT_NVR_SERIAL: str = os.getenv("DAHUA_NVR_SERIAL", "BE124E0PCA95532")
DEFAULT_NVR_USERNAME: str = os.getenv("DAHUA_NVR_USERNAME", "admin")
DEFAULT_NVR_PASSWORD: str = os.getenv("DAHUA_NVR_PASSWORD", "Shri@21*")
DEFAULT_NVR_HOST: str = os.getenv("DAHUA_NVR_HOST", "")
DEFAULT_NVR_PORT: int = int(os.getenv("DAHUA_NVR_PORT", "554"))
DEFAULT_NVR_CHANNELS: int = int(os.getenv("DAHUA_NVR_CHANNELS", "32"))

# Streaming & Gateway Ports
GO2RTC_API_URL: str = os.getenv("GO2RTC_API_URL", "http://127.0.0.1:1984")
GO2RTC_WEBRTC_PORT: int = int(os.getenv("GO2RTC_WEBRTC_PORT", "8555"))
RTSP_TUNNEL_PORT: int = int(os.getenv("RTSP_TUNNEL_PORT", "1554"))
DEFAULT_RTSP_TUNNEL_PORT: int = RTSP_TUNNEL_PORT

# Concurrency & Performance
DHP2P_MAX_CONCURRENT_STREAMS: int = int(os.getenv("DHP2P_MAX_CONCURRENT_STREAMS", "32"))

# Host & Server
BACKEND_HOST: str = os.getenv("BACKEND_HOST", "0.0.0.0")
BACKEND_PORT: int = int(os.getenv("BACKEND_PORT", "8001"))
CORS_ORIGINS: List[str] = [orig.strip() for orig in os.getenv("CORS_ORIGINS", "*").split(",") if orig.strip()]
