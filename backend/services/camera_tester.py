"""YardSight AI - CCTV Stream Connectivity Tester (<80 lines)."""
import time, socket, cv2, sys
from schemas.camera import CameraTestRequest, CameraTestResponse
from services.dolynk_service import dolynk_service

def test_camera_connectivity(req: CameraTestRequest) -> CameraTestResponse:
    t0 = time.time()
    st = req.stream_type.upper()
    if st in ["LOCAL", "WEBCAM", "USB"] or (req.stream_url and req.stream_url.strip().isdigit()):
        idx = int(req.stream_url.strip()) if (req.stream_url and req.stream_url.strip().isdigit()) else 0
        from services.camera_watchdog import camera_watchdog
        if camera_watchdog.is_privacy_mode():
            return CameraTestResponse(status="ONLINE", reachable=True, latency_ms=1.0,
                message=f"Local video device {idx} in PRIVACY MODE.", technical_details={"privacy_mode": True})
        try:
            cap = cv2.VideoCapture(idx, cv2.CAP_DSHOW if sys.platform == "win32" else 0)
            if cap.isOpened():
                ret, _ = cap.read()
                cap.release()
                if ret:
                    return CameraTestResponse(status="ONLINE", reachable=True, latency_ms=round((time.time() - t0) * 1000, 2),
                        message=f"Local video device {idx} verified online.", technical_details={"device_index": idx})
            cap.release()
        except Exception as e:
            return CameraTestResponse(status="OFFLINE", reachable=False, latency_ms=round((time.time() - t0) * 1000, 2), message=str(e))
        return CameraTestResponse(status="OFFLINE", reachable=False, latency_ms=round((time.time() - t0) * 1000, 2), message="Device busy or not found.")

    if st in ["DMSS", "DOLYNK", "NVR_BATCH"]:
        sn = req.dmss_serial or "BE124E0PCA95532"
        ch = req.dmss_channel or 1
        from services.dhp2p import dhp2p_service
        if sn == "BE124E0PCA95532":
            is_active_ch = ch in dhp2p_service.worker.active_channels
            tunnel_alive = dhp2p_service.is_tunnel_alive(sn)
            status = "ONLINE" if (is_active_ch and tunnel_alive) else "OFFLINE"
            msg = f"Dahua NVR Channel {ch:02d} {'active optical feed' if is_active_ch else 'unpopulated (no physical signal)'}."
            return CameraTestResponse(
                status=status,
                reachable=is_active_ch and tunnel_alive,
                latency_ms=round((time.time() - t0) * 1000, 2),
                message=msg,
                technical_details={"channel": ch, "tunnel_alive": tunnel_alive, "active_channels": list(dhp2p_service.worker.active_channels)}
            )
        dolynk_res = dolynk_service.test_connection(device_sn=sn)
        if dolynk_res.get("success") and dolynk_res.get("optical_frame_buffered"):
            return CameraTestResponse(status="ONLINE", reachable=True, latency_ms=dolynk_res.get("diagnostic_latency_ms", 45.0),
                message=f"Dahua DoLynk Cloud stream active for {sn}.", technical_details=dolynk_res)
        from dahua_p2p_bridge import DahuaP2PBridge
        p2p_res = DahuaP2PBridge(serial_number=sn).connect()
        is_success = bool(p2p_res.get("success"))
        return CameraTestResponse(status="ONLINE" if is_success else "OFFLINE", reachable=is_success,
            latency_ms=round((time.time() - t0) * 1000, 2), message=p2p_res.get("message", f"Status: {is_success}"),
            technical_details={"p2p": p2p_res, "dolynk": dolynk_res})

    if st in ["RTSP", "HLS"]:
        url = (req.stream_url or "").strip()
        latency_ms = round((time.time() - t0) * 1000, 2)
        if not url:
            return CameraTestResponse(status="OFFLINE", reachable=False, latency_ms=latency_ms, message="Stream URL missing.")
        port = 554 if "rtsp" in url.lower() else 80
        host = url.split("@")[-1].split("/")[0] if "@" in url else url.replace("rtsp://", "").replace("http://", "").split("/")[0]
        if ":" in host:
            parts = host.split(":")
            host = parts[0]
            try: port = int(parts[1])
            except Exception: pass
        try:
            with socket.create_connection((host, port), timeout=1.5):
                return CameraTestResponse(status="ONLINE", reachable=True, latency_ms=latency_ms, message=f"Socket {host}:{port} reachable.")
        except Exception as e:
            return CameraTestResponse(status="OFFLINE", reachable=False, latency_ms=latency_ms, message=f"Socket {host}:{port} unreachable ({e}).")

    return CameraTestResponse(status="OFFLINE", reachable=False, latency_ms=0.0, message="Unknown stream type.")
