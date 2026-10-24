"""
YardSight AI - WebRTC Streaming Service
Orchestrates the local go2rtc WebRTC gateway daemon (go2rtc 1.9.14) for sub-150ms
hardware-accelerated H.264 camera streaming directly to browser <video> tags.
"""

import os
import subprocess
import time
import urllib.request
import urllib.parse
import urllib.error
import json
from typing import Dict, Any, Optional

GO2RTC_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "bin", "go2rtc"))
GO2RTC_EXE = os.path.join(GO2RTC_DIR, "go2rtc.exe")
GO2RTC_CONFIG = os.path.join(GO2RTC_DIR, "go2rtc.yaml")
GO2RTC_API_URL = "http://127.0.0.1:1984"

class WebRtcService:
    def __init__(self):
        self.process: Optional[subprocess.Popen] = None
        self._is_started = False

    def is_healthy(self) -> bool:
        """Checks if go2rtc REST API on port 1984 is responding."""
        try:
            req = urllib.request.Request(f"{GO2RTC_API_URL}/api", headers={"User-Agent": "YardSight"})
            with urllib.request.urlopen(req, timeout=1.0) as resp:
                return resp.status == 200
        except Exception:
            return False

    def ensure_running(self) -> bool:
        """Launches go2rtc daemon if not already running."""
        if os.environ.get("DISABLE_VIDEO_STREAM", "0").lower() in ("true", "1", "yes"):
            return False
        if self.is_healthy():
            self._is_started = True
            return True

        if not os.path.exists(GO2RTC_EXE):
            print(f"[WebRTC Service] Warning: go2rtc executable not found at {GO2RTC_EXE}")
            return False

        try:
            cmd = [GO2RTC_EXE, "-config", GO2RTC_CONFIG]
            self.process = subprocess.Popen(
                cmd,
                cwd=GO2RTC_DIR,
                stdout=subprocess.DEVNULL,
                stderr=subprocess.DEVNULL,
                creationflags=subprocess.CREATE_NO_WINDOW if os.name == 'nt' else 0
            )
            # Give daemon up to 1.5s to bind port 1984
            for _ in range(15):
                time.sleep(0.1)
                if self.is_healthy():
                    print(f"[WebRTC Service] go2rtc daemon online on {GO2RTC_API_URL} (WebRTC port 8555)")
                    self._is_started = True
                    return True
        except Exception as e:
            print(f"[WebRTC Service] Failed to launch go2rtc daemon: {e}")

        return False

    def register_stream(self, stream_name: str, rtsp_url: str) -> bool:
        """Dynamically registers or updates an RTSP source stream in go2rtc."""
        if not self.ensure_running():
            return False
        try:
            url = f"{GO2RTC_API_URL}/api/streams?name={urllib.parse.quote(stream_name)}&src={urllib.parse.quote(rtsp_url)}"
            req = urllib.request.Request(url, method="PUT")
            with urllib.request.urlopen(req, timeout=1.5) as resp:
                return resp.status in (200, 201)
        except Exception as e:
            print(f"[WebRTC Service] Failed registering stream {stream_name}: {e}")
            return False

    def get_status(self) -> Dict[str, Any]:
        """Returns active go2rtc daemon health and stream list."""
        healthy = self.is_healthy()
        streams: Dict[str, Any] = {}
        if healthy:
            try:
                req = urllib.request.Request(f"{GO2RTC_API_URL}/api/streams")
                with urllib.request.urlopen(req, timeout=1.0) as resp:
                    streams = json.loads(resp.read().decode("utf-8"))
            except Exception:
                pass

        return {
            "available": healthy,
            "api_url": GO2RTC_API_URL,
            "webrtc_port": 8555,
            "streams": streams,
            "version": "1.9.14 (go2rtc)"
        }

webrtc_service = WebRtcService()
