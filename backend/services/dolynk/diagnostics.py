"""
DoLynk Cloud Root-Cause Diagnostic Service (<85 lines).
Inspects API reachability, authentication tokens, RTSP feeds, and hardware status.
"""
import time
from typing import Dict, Any
from .auth import DoLynkAuthManager
from .stream import DoLynkStreamManager
from .worker import DoLynkOpticalWorker

class DoLynkDiagnosticManager:
    """Provides granular, single-read root-cause diagnostic telemetry for Dahua hardware."""

    def __init__(self, auth: DoLynkAuthManager, stream: DoLynkStreamManager, worker: DoLynkOpticalWorker):
        self.auth = auth
        self.stream = stream
        self.worker = worker

    def diagnose_camera(self, device_sn: str, channel_id: int = 0) -> Dict[str, Any]:
        """Pinpoints root cause of video signal status for a specific camera channel."""
        start = time.time()
        diag: Dict[str, Any] = {
            "device_sn": device_sn,
            "channel_id": channel_id,
            "auth_ok": False,
            "rtsp_url_retrieved": False,
            "optical_frame_buffered": False,
            "root_cause": "UNKNOWN"
        }
        try:
            token = self.auth.get_token()
            diag["auth_ok"] = bool(token)
        except Exception as e:
            diag["root_cause"] = f"AUTH_ERROR: {e}"
            return diag

        rtsp_url = self.stream.get_live_rtsp_url(device_sn, channel_id)
        if rtsp_url:
            diag["rtsp_url_retrieved"] = True
            diag["rtsp_endpoint"] = rtsp_url[:45] + "..."
        else:
            diag["root_cause"] = "CLOUD_BINDING_MISMATCH: Device not registered under DoLynk Product ID or offline in DMSS."
            return diag

        frame = self.worker.get_latest_frame(device_sn)
        if frame is not None:
            diag["optical_frame_buffered"] = True
            diag["resolution"] = f"{frame.shape[1]}x{frame.shape[0]}"
            diag["root_cause"] = "NONE (STREAM_ACTIVE_AND_HEALTHY)"
        else:
            diag["root_cause"] = "WAITING_FOR_OPEN_CV_INGEST: RTSP URL valid, worker acquiring frame."

        diag["diagnostic_latency_ms"] = round((time.time() - start) * 1000, 2)
        return diag
