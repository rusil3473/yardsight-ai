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

PHYSICAL_CHANNELS = list(range(1, 33))
DEFAULT_ACTIVE_CHANNELS = set(PHYSICAL_CHANNELS)

class DahuaOpticalWorker:
    """Daemon worker maintaining authentic live optical frames from Dahua P2P relay."""

    def __init__(self, default_serial: Optional[str] = None):
        self.default_serial = default_serial or os.environ.get("DAHUA_NVR_SERIAL", "BE124E0PCA95532")
        self.active_channels = set(DEFAULT_ACTIVE_CHANNELS)
        self.max_concurrent_streams = int(os.environ.get("DHP2P_MAX_CONCURRENT_STREAMS", "32"))
        self._active_streams: Dict[int, bool] = {}
        self._last_requested: Dict[int, float] = {}
        self._channel_cooldowns: Dict[int, float] = {}
        self._latest_frames: Dict[Tuple[str, int], np.ndarray] = {}
        self._tunnels: Dict[str, DahuaP2PTunnel] = {}
        self._threads: Dict[str, threading.Thread] = {}
        self._lock = threading.Lock()
        self.running = True
        self.local_port = int(os.environ.get("RTSP_TUNNEL_PORT", "1554"))

    def _get_or_start_tunnel(self, serial: str) -> Optional[DahuaP2PTunnel]:
        with self._lock:
            tunnel = self._tunnels.get(serial)
            if tunnel and tunnel.running:
                return tunnel
            try:
                if tunnel:
                    tunnel.stop()
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
        if channel not in self.active_channels:
            return  # Channel has no physical camera connected; prevent tunnel congestion

        now = time.time()
        if now < self._channel_cooldowns.get(channel, 0.0):
            return  # In cooldown after repeated failures

        thread_key = f"{sn}_{channel}"
        with self._lock:
            existing_thread = self._threads.get(thread_key)
            if existing_thread and existing_thread.is_alive():
                return  # Idempotent: already actively ingesting this channel
            t = threading.Thread(target=self._ingest_loop, args=(sn, channel), daemon=True)
            self._threads[thread_key] = t
            t.start()

    def refetch_all_channels(self, serial: Optional[str] = None):
        """Actively triggers background frame ingest workers for physical cameras with staggered startup."""
        def _staggered_startup():
            sn = serial or self.default_serial
            for ch in PHYSICAL_CHANNELS:
                self._channel_cooldowns[ch] = 0.0
                self._last_requested[ch] = time.time()
                self.start_worker(sn, channel=ch)
                time.sleep(0.5)
        threading.Thread(target=_staggered_startup, daemon=True).start()

    def _is_corrupted(self, frame: np.ndarray) -> bool:
        """Detects H.264/H.265 packet loss macroblock tearing without rejecting authentic IR night vision."""
        if frame is None or frame.size == 0:
            return True
        h, w = frame.shape[:2]
        # 1. White saturated staircase artifacts (>90% pure blown-out white)
        sample = frame[::4, ::4]
        white_pixels = np.count_nonzero(np.all(sample > 245, axis=-1))
        if white_pixels / (sample.shape[0] * sample.shape[1]) > 0.90:
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

    def is_tunnel_alive(self, serial: Optional[str] = None) -> bool:
        """Checks if Dahua P2P relay tunnel session is currently running."""
        sn = serial or self.default_serial
        with self._lock:
            tunnel = self._tunnels.get(sn)
            return bool(tunnel and tunnel.running)

    def _ingest_loop(self, serial: str, channel: int):
        consecutive_connect_fails = 0
        # Stagger startup to avoid all channels hitting RTSP bind simultaneously
        time.sleep(0.1 + (channel % 8) * 0.3)
        while self.running:
            # 1. If not requested recently (> 60s), sleep to release RTSP session
            idle_for = time.time() - self._last_requested.get(channel, time.time())
            if idle_for > 60.0:
                time.sleep(1.0)
                continue

            # 2. Concurrency limit: check how many streams are currently active
            with self._lock:
                current_active = sum(1 for ch, act in self._active_streams.items() if act and ch != channel)
                if current_active >= self.max_concurrent_streams:
                    can_connect = False
                else:
                    can_connect = True
                    self._active_streams[channel] = True

            if not can_connect:
                time.sleep(0.5)
                continue

            cap = None
            try:
                tunnel = self._get_or_start_tunnel(serial)
                if not tunnel:
                    time.sleep(2.0)
                    continue

                port = tunnel.local_port
                rtsp_url = f"rtsp://admin:Shri%4021*@127.0.0.1:{port}/cam/realmonitor?channel={channel}&subtype=1"
                os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = (
                    "rtsp_transport;tcp|"
                    "probesize;65536|"
                    "analyzeduration;500000|"
                    "fflags;nobuffer|"
                    "flags;low_delay|"
                    "allowed_media_types;video|"
                    "stimeout;3000000"
                )
                cap = cv2.VideoCapture(rtsp_url, cv2.CAP_FFMPEG)
                cap.set(cv2.CAP_PROP_BUFFERSIZE, 1)
                if not cap.isOpened():
                    consecutive_connect_fails += 1
                    if consecutive_connect_fails >= 3:
                        print(f"[DHP2P WORKER] Channel {channel} failed to connect 3 times. Retrying in 5s.")
                        self._channel_cooldowns[channel] = time.time() + 5.0
                        consecutive_connect_fails = 0
                        time.sleep(5.0)
                    else:
                        time.sleep(2.0)
                    continue

                print(f"[DHP2P WORKER] Live RTSP stream connected for {serial} CH{channel}!")
                consecutive_connect_fails = 0
                consecutive_fails = 0
                while self.running and consecutive_fails < 15:
                    # Release if channel is idle for > 60s
                    if time.time() - self._last_requested.get(channel, time.time()) > 60.0:
                        print(f"[DHP2P WORKER] Channel {channel} idle for >60s. Releasing RTSP session.")
                        break

                    t_frame_start = time.perf_counter()
                    # Drain FFmpeg socket queue to eliminate playback delay
                    ret = cap.grab()
                    if not ret:
                        consecutive_fails += 1
                        time.sleep(0.02)
                        continue

                    ret, frame = cap.retrieve()
                    frame_latency_ms = round((time.perf_counter() - t_frame_start) * 1000, 2)
                    if not ret or frame is None:
                        consecutive_fails += 1
                        continue

                    if not self._is_corrupted(frame):
                        consecutive_fails = 0
                        now_ts = time.time()
                        with self._lock:
                            self._latest_frames[(serial, channel)] = (frame, now_ts)
                        try:
                            from services.camera_watchdog import camera_watchdog
                            camera_watchdog.record_heartbeat(f"CAM-{channel:02d}", True, frame_latency_ms, "Dahua P2P Relay frame received")
                        except Exception:
                            pass
                    else:
                        consecutive_fails += 1
                    time.sleep(0.005)

                if consecutive_fails >= 25:
                    print(f"[DHP2P WORKER] Channel {channel} frame stall detected. Re-initiating RTSP channel capture...")

            except Exception as e:
                print(f"[DHP2P INGEST ERR CH{channel}] {e}")
            finally:
                with self._lock:
                    self._active_streams[channel] = False
                if cap is not None:
                    try: cap.release()
                    except Exception: pass
            time.sleep(0.5)

    def get_latest_frame(self, serial: Optional[str] = None, channel: int = 0, max_age_seconds: float = 3.5) -> Optional[np.ndarray]:
        """Returns the most recent authentic optical frame from memory for this designated channel."""
        sn = serial or self.default_serial
        self._last_requested[channel] = time.time()
        if channel not in self.active_channels:
            return None
        with self._lock:
            data = self._latest_frames.get((sn, channel))
            if data is None:
                return None
            if isinstance(data, tuple):
                frame, ts = data
                if (time.time() - ts) > max_age_seconds:
                    return None  # Stale frame: return None so fresh frame is pulled
                return frame.copy()
            return data.copy()


    def get_any_frame(self, serial: Optional[str] = None, max_age_seconds: float = 300.0) -> Optional[np.ndarray]:
        """Returns the freshest authentic optical frame from any active channel on this device."""
        sn = serial or self.default_serial
        now = time.time()
        best_frame = None
        best_ts = 0.0
        fallback_frame = None
        fallback_ts = 0.0
        with self._lock:
            for (dev_sn, _), val in self._latest_frames.items():
                if dev_sn == sn:
                    if isinstance(val, tuple):
                        frame, ts = val
                        if (now - ts) < max_age_seconds and ts > best_ts:
                            best_frame = frame
                            best_ts = ts
                        if ts > fallback_ts:
                            fallback_frame = frame
                            fallback_ts = ts
                    elif isinstance(val, np.ndarray) and best_frame is None:
                        best_frame = val
            if best_frame is not None:
                return best_frame.copy()
            if fallback_frame is not None:
                return fallback_frame.copy()
        return None
