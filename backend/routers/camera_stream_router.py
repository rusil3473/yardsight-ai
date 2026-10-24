"""
YardSight AI - WebRTC Gateway, WebSocket Streaming & ONVIF Router
"""

import time
import json
import urllib.request
import asyncio
from fastapi import APIRouter, Request, Response, WebSocket, WebSocketDisconnect
from pydantic import BaseModel, Field

from services.camera_service import camera_service
from services.webrtc_service import webrtc_service
from services.onvif_discovery import onvif_discovery
from services.camera_watchdog import camera_watchdog

router = APIRouter(tags=["Camera Streaming & WebRTC"])

@router.get("/cameras/webrtc/status")
def get_webrtc_gateway_status():
    """Returns status of the local go2rtc WebRTC gateway."""
    return webrtc_service.get_status()

@router.get("/cameras/discover/onvif")
def discover_onvif_cameras():
    """Broadcasts WS-Discovery UDP multicast probes to automatically locate ONVIF Profile S/T cameras."""
    onvif_devices = onvif_discovery.discover_onvif_devices()
    port_scans = onvif_discovery.scan_common_cctv_ports()
    return {
        "status": "SUCCESS",
        "onvif_devices_found": len(onvif_devices),
        "devices": onvif_devices,
        "local_network_scans": port_scans,
        "timestamp": time.time()
    }

@router.get("/cameras/health/watchdog")
def get_camera_watchdog_health():
    """Returns real-time health telemetry, frame uptime, and diagnostic ping states."""
    return camera_watchdog.get_health_summary()

class PrivacyModeRequest(BaseModel):
    enabled: bool = Field(..., description="Set true to disable local webcam and show test pattern")

@router.post("/cameras/privacy-mode")
def set_privacy_mode(payload: PrivacyModeRequest):
    """Enables or disables operator privacy mode (blocking local webcam device 0)."""
    camera_watchdog.set_privacy_mode(payload.enabled)
    return {
        "status": "SUCCESS",
        "privacy_mode": payload.enabled,
        "message": "Operator privacy mode ACTIVATED. Local webcam sensor disabled." if payload.enabled else "Operator privacy mode DEACTIVATED. Local optical sensor enabled."
    }

@router.post("/cameras/{camera_id}/webrtc")
async def negotiate_webrtc_stream(camera_id: str, request: Request, subtype: int = 1):
    """
    Exchanges WebRTC SDP Offer/Answer with go2rtc gateway for sub-150ms hardware video playback.
    Dynamically maps camera_id to its specific RTSP/P2P stream channel (preventing channel confusion).
    Supports Low-spec Operator Mode (subtype=1 for 640x360 substream, subtype=0 for 1080p mainstream).
    """
    webrtc_service.ensure_running()
    cam_id = camera_id.upper()
    body_bytes = await request.body()
    sdp_offer = body_bytes.decode("utf-8", errors="ignore")

    from database import SessionLocal
    db = SessionLocal()
    target_stream_url = ""
    ch = 1
    try:
        cam = camera_service.get_camera(cam_id, db)
        if cam:
            ch = cam.dmss_channel if (cam.dmss_channel is not None and cam.dmss_channel > 0) else 1
            target_stream_url = cam.stream_url or ""
        else:
            ch = int(cam_id.split("-")[-1]) if ("-" in cam_id and cam_id.split("-")[-1].isdigit()) else 1
    except Exception:
        ch = 1
    finally:
        db.close()

    if not target_stream_url or not target_stream_url.startswith(("rtsp://", "http://", "https://")):
        target_stream_url = f"rtsp://admin:Shri%4021*@127.0.0.1:1554/cam/realmonitor?channel={ch}&subtype={subtype}#input=rtsp/tcp"

    # Dynamically register camera-specific stream in go2rtc
    specific_stream_name = f"cam_{cam_id.lower()}_sub{subtype}"
    webrtc_service.register_stream(specific_stream_name, target_stream_url)

    streams_to_try = [specific_stream_name]
    try:
        from services.dolynk_service import dolynk_service
        d_url = dolynk_service.stream_mgr.get_live_rtsp_url(dolynk_service.default_device_sn, 0, stream_type=subtype)
        if d_url:
            d_name = f"dolynk_live_sub{subtype}"
            webrtc_service.register_stream(d_name, d_url)
            streams_to_try.append(d_name)
    except Exception:
        pass

    for stream_name in streams_to_try:
        url = f"http://127.0.0.1:1984/api/webrtc?src={stream_name}"
        try:
            req = urllib.request.Request(
                url,
                data=sdp_offer.encode("utf-8"),
                headers={"Content-Type": "application/sdp", "User-Agent": "YardSight"},
                method="POST"
            )
            with urllib.request.urlopen(req, timeout=1.8) as resp:
                answer = resp.read().decode("utf-8")
                if "v=0" in answer:
                    return Response(content=answer, media_type="application/sdp")
        except Exception:
            continue

    fallback_data = json.dumps({
        "available": False,
        "fallback": True,
        "message": f"WebRTC P2P stream in standby for {cam_id} (ch {ch}). Reverting to optical snapshot engine.",
        "camera_id": cam_id
    })
    return Response(content=fallback_data, media_type="application/json", status_code=200)

@router.websocket("/cameras/{camera_id}/ws")
async def camera_websocket_stream(websocket: WebSocket, camera_id: str):
    """
    Dual-plane WebSocket streaming endpoint delivering:
    1. Binary JPEG frames directly to browser canvas/ImageBitmap.
    2. JSON text telemetry packets containing real-time bounding boxes and velocities.
    Offloads synchronous OpenCV work to worker threads to keep async event loop responsive.
    """
    await websocket.accept()
    from database import SessionLocal
    db = SessionLocal()
    frame_count = 0
    cam_id = camera_id.upper()
    try:
        while True:
            frame_bytes = await asyncio.to_thread(camera_service.get_snapshot, cam_id, db)

            if frame_count % 3 == 0:
                dets = camera_service.get_live_telemetry(cam_id)
                telemetry_packet = {
                    "type": "TELEMETRY",
                    "camera_id": cam_id,
                    "detections": dets,
                    "timestamp": time.time()
                }
                await websocket.send_text(json.dumps(telemetry_packet))

            await websocket.send_bytes(frame_bytes)
            frame_count += 1
            await asyncio.sleep(0.04)  # ~25 FPS target
    except WebSocketDisconnect:
        pass
    except Exception:
        pass
    finally:
        db.close()
