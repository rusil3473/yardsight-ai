"""
DoLynk Cloud Optical Background Worker Service (<95 lines).
Pulls live RTSP H.264/H.265 video frames into an in-memory frame buffer.
"""
import os
import cv2
import time
import threading
import numpy as np
from typing import Dict, Optional, Tuple
from .stream import DoLynkStreamManager

os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|stimeout;10000000"

class DoLynkOpticalWorker:
    """Daemon worker continuously updating latest optical frames from Dahua RTSP feeds."""

    def __init__(self, stream_mgr: DoLynkStreamManager, default_device_sn: str):
        self.stream_mgr = stream_mgr
        self.default_device_sn = default_device_sn
        self._latest_frames: Dict[str, Tuple[np.ndarray, float]] = {}
        self._lock = threading.Lock()
        self._threads: Dict[str, threading.Thread] = {}
        self._stop_events: Dict[str, threading.Event] = {}

    def start_worker(self, device_sn: Optional[str] = None, channel_id: int = 0):
        """Starts a background thread pulling authentic optical video for a device."""
        if os.environ.get("DISABLE_VIDEO_STREAM", "0").lower() in ("true", "1", "yes"):
            return
        sn = device_sn or self.default_device_sn
        if sn in self._threads and self._threads[sn].is_alive():
            return

        stop_evt = threading.Event()
        self._stop_events[sn] = stop_evt
        t = threading.Thread(target=self._worker_loop, args=(sn, channel_id, stop_evt), daemon=True)
        self._threads[sn] = t
        t.start()
        print(f"[DOLYNK WORKER] Optical frame ingest worker launched for {sn}:ch{channel_id}")

    def _worker_loop(self, device_sn: str, channel_id: int, stop_evt: threading.Event):
        """Dedicated connection loop with auto-reconnect."""
        while not stop_evt.is_set():
            rtsp_url = self.stream_mgr.get_live_rtsp_url(device_sn, channel_id)
            if not rtsp_url:
                with self._lock:
                    self._latest_frames.pop(device_sn, None)
                time.sleep(15.0)
                continue

            cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
            if not cap.isOpened():
                print(f"[DOLYNK WORKER CAUSE] OpenCV failed to open RTSP socket: {rtsp_url[:40]}... Backing off 3s.")
                with self._lock:
                    self._latest_frames.pop(device_sn, None)
                time.sleep(3.0)
                continue

            print(f"[DOLYNK WORKER] RTSP stream connected successfully for {device_sn}!")
            while not stop_evt.is_set():
                ret, frame = cap.read()
                if not ret or frame is None:
                    print(f"[DOLYNK WORKER] Stream packet drop on {device_sn}. Reconnecting...")
                    with self._lock:
                        self._latest_frames.pop(device_sn, None)
                    break
                with self._lock:
                    self._latest_frames[device_sn] = (frame, time.time())
                time.sleep(0.015)  # Cap loop rate
            cap.release()
            time.sleep(2.0)

    def get_latest_frame(self, device_sn: Optional[str] = None, max_age_seconds: float = 12.0) -> Optional[np.ndarray]:
        """Returns the most recent decoded optical frame from memory if fresh (< max_age_seconds)."""
        sn = device_sn or self.default_device_sn
        with self._lock:
            data = self._latest_frames.get(sn)
            if data is None:
                return None
            frame, captured_at = data
            if time.time() - captured_at > max_age_seconds:
                return None  # Stale frame: camera dropped or offline
            return frame.copy()
