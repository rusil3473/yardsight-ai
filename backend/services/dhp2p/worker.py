"""
Dahua P2P Live Optical Frame Worker (<85 lines).
Manages shared tunnel lifecycle and continuously pulls decoded BGR video frames into memory.
"""
import os
import time
import threading
import cv2
import numpy as np
from typing import Dict, Optional, Tuple
from .tunnel import DahuaP2PTunnel

class DahuaOpticalWorker:
    """Daemon worker maintaining authentic live optical frames from Dahua P2P relay."""

    def __init__(self, default_serial: str = "BE124E0PCA95532"):
        self.default_serial = default_serial
        self._latest_frames: Dict[Tuple[str, int], np.ndarray] = {}
        self._tunnels: Dict[str, DahuaP2PTunnel] = {}
        self._threads: Dict[str, threading.Thread] = {}
        self._lock = threading.Lock()
        self.running = True
        self.local_port = 1554

    def _get_or_start_tunnel(self, serial: str) -> Optional[DahuaP2PTunnel]:
        with self._lock:
            tunnel = self._tunnels.get(serial)
            if tunnel and tunnel.running:
                return tunnel
            try:
                port = 1554 if serial == self.default_serial else (1555 + len(self._tunnels))
                tunnel = DahuaP2PTunnel(serial=serial, local_port=port)
                tunnel.start()
                self._tunnels[serial] = tunnel
                return tunnel
            except Exception as e:
                print(f"[DHP2P TUNNEL ERROR] {e}")
                return None

    def start_worker(self, serial: Optional[str] = None, channel: int = 1, port: Optional[int] = None):
        """Starts background frame ingest thread for a camera channel idempotently without blocking other channels."""
        if os.environ.get("DISABLE_VIDEO_STREAM", "0").lower() in ("true", "1", "yes"):
            return
        sn = serial or self.default_serial
        thread_key = f"{sn}_{channel}"
        with self._lock:
            existing_thread = self._threads.get(thread_key)
            if existing_thread and existing_thread.is_alive():
                return  # Idempotent: already actively ingesting this channel
            t = threading.Thread(target=self._ingest_loop, args=(sn, channel), daemon=True)
            self._threads[thread_key] = t
            t.start()

    def _is_corrupted(self, frame: np.ndarray) -> bool:
        """Detects H.264/H.265 packet loss macroblock tearing without rejecting authentic IR night vision."""
        if frame is None or frame.size == 0:
            return True
        h, w = frame.shape[:2]
        # 1. White saturated staircase artifacts (>45% pure blown-out white)
        sample = frame[::4, ::4]
        white_pixels = np.count_nonzero(np.all(sample > 245, axis=-1))
        if white_pixels / (sample.shape[0] * sample.shape[1]) > 0.45:
            return True

        # 2. Synthetic mid-gray macroblock packet loss tearing (pure flat untextured 128,128,128 fill)
        lower_sample = frame[int(h * 0.40)::4, ::4]
        if lower_sample.size > 0:
            # Flat gray drop artifact in FFMPEG is strictly uniform mid-gray with near-zero variance
            is_flat_midgray = (lower_sample[:, :, 0] >= 120) & (lower_sample[:, :, 0] <= 136) & \
                              (lower_sample[:, :, 1] >= 120) & (lower_sample[:, :, 1] <= 136) & \
                              (lower_sample[:, :, 2] >= 120) & (lower_sample[:, :, 2] <= 136)
            flat_ratio = np.count_nonzero(is_flat_midgray) / (lower_sample.shape[0] * lower_sample.shape[1])
            # Authentic night cameras have high contrast/variance (>18 std), synthetic drop blocks have std < 8
            if flat_ratio > 0.65 and float(np.std(lower_sample)) < 12.0:
                return True
        return False

    def _ingest_loop(self, serial: str, channel: int):
        while self.running:
            try:
                tunnel = self._get_or_start_tunnel(serial)
                if not tunnel:
                    time.sleep(3.0)
                    continue

                port = tunnel.local_port
                rtsp_url = f"rtsp://admin:Shri%4021*@127.0.0.1:{port}/cam/realmonitor?channel={channel}&subtype=1"
                os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|probesize;65536|analyzeduration;500000|fflags;nobuffer|flags;low_delay|allowed_media_types;video|stimeout;4000000"
                cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                if not cap.isOpened():
                    time.sleep(15.0 if channel > 1 else 4.0)
                    continue

                print(f"[DHP2P WORKER] Live RTSP stream connected for {serial} CH{channel}!")
                consecutive_fails = 0
                while self.running and consecutive_fails < 100:
                    ret, frame = cap.read()
                    if not ret or frame is None:
                        consecutive_fails += 1
                        time.sleep(0.05)
                        continue

                    if not self._is_corrupted(frame):
                        consecutive_fails = 0
                        now_ts = time.time()
                        with self._lock:
                            self._latest_frames[(serial, channel)] = (frame, now_ts)
                        try:
                            from services.camera_watchdog import camera_watchdog
                            camera_watchdog.record_heartbeat(f"CAM-{channel:02d}", True, 12.0, "Dahua P2P Relay frame received")
                        except Exception:
                            pass
                    else:
                        consecutive_fails += 1
                    time.sleep(0.03)

                cap.release()
            except Exception as e:
                print(f"[DHP2P INGEST ERR CH{channel}] {e}")
            time.sleep(15.0 if channel > 1 else 3.0)

    def get_latest_frame(self, serial: Optional[str] = None, channel: int = 0, max_age_seconds: float = 12.0) -> Optional[np.ndarray]:
        """Returns the most recent authentic optical frame from memory if fresh (< max_age_seconds)."""
        sn = serial or self.default_serial
        with self._lock:
            data = self._latest_frames.get((sn, channel))
            if data is None:
                return None
            if isinstance(data, tuple):
                frame, captured_at = data
                if (time.time() - captured_at) > max_age_seconds:
                    return None  # Stale frame: camera dropped or offline
                return frame.copy()
            return data.copy()
