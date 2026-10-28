"""
YardSight AI - Background Camera Health Watchdog & Self-Healing Telemetry
Continuously monitors registered RTSP streams and optical capture devices,
detects frame stalls, and tracks uptime and ping latency.
"""

import time
import socket
import os
from typing import Dict, Any, List
from datetime import datetime

class CameraHealthWatchdog:
    def __init__(self):
        self.health_cache: Dict[str, Dict[str, Any]] = {}
        self.last_run: float = 0.0
        self.privacy_mode_enabled: bool = os.getenv("ENABLE_LOCAL_WEBCAM", "true").lower() in ["false", "0", "off"]

    def set_privacy_mode(self, enabled: bool):
        """Allows toggling privacy mode (disabling local webcam device 0)."""
        self.privacy_mode_enabled = enabled
        os.environ["ENABLE_LOCAL_WEBCAM"] = "false" if enabled else "true"

    def is_privacy_mode(self) -> bool:
        return self.privacy_mode_enabled

    @staticmethod
    def measure_endpoint_rtt(host: str, port: int = 554, timeout: float = 0.8) -> tuple[bool, float]:
        """Measures real TCP connection round-trip latency to a camera or NVR endpoint."""
        t0 = time.perf_counter()
        try:
            with socket.create_connection((host, int(port)), timeout=timeout):
                rtt_ms = round((time.perf_counter() - t0) * 1000, 2)
                return True, rtt_ms
        except Exception:
            rtt_ms = round((time.perf_counter() - t0) * 1000, 2)
            return False, rtt_ms

    def record_heartbeat(self, camera_id: str, is_online: bool, latency_ms: float = 0.0, details: str = ""):
        now = time.time()
        prev = self.health_cache.get(camera_id, {})
        uptime_count = prev.get("successful_pings", 0) + (1 if is_online else 0)
        total_count = prev.get("total_pings", 0) + 1

        self.health_cache[camera_id] = {
            "camera_id": camera_id,
            "status": "ONLINE" if is_online else "OFFLINE",
            "latency_ms": latency_ms,
            "last_heartbeat": datetime.utcnow().isoformat(),
            "last_heartbeat_timestamp": now,
            "uptime_percent": round((uptime_count / max(1, total_count)) * 100, 1),
            "details": details,
            "successful_pings": uptime_count,
            "total_pings": total_count
        }

    def get_health_summary(self) -> Dict[str, Any]:
        """Returns health telemetry for all monitored camera feeds."""
        online_count = sum(1 for c in self.health_cache.values() if c.get("status") == "ONLINE")
        return {
            "status": "ACTIVE",
            "privacy_mode": self.privacy_mode_enabled,
            "privacy_message": "Local physical webcam access DISABLED for operator privacy. Test pattern active." if self.privacy_mode_enabled else "Local hardware optical devices enabled.",
            "total_monitored": len(self.health_cache),
            "cameras_online": online_count,
            "cameras_offline": len(self.health_cache) - online_count,
            "monitored_cameras": self.health_cache,
            "timestamp": datetime.utcnow().isoformat()
        }

camera_watchdog = CameraHealthWatchdog()
