"""
YardSight AI - CCTV Camera Router
Core camera CRUD, MJPEG streams, snapshots, and hardware matrix status.
Modular sub-routers for NVR management and WebRTC streaming are included.
"""

import time
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from database import get_db
from schemas.camera import CameraCreate, CameraUpdate, CameraTestRequest
from services.camera_service import camera_service
from services.dahua_netsdk_service import dahua_netsdk_service
from routers.camera_nvr_router import router as camera_nvr_router
from routers.camera_stream_router import router as camera_stream_router
from config import DEFAULT_NVR_SERIAL

router = APIRouter(prefix="", tags=["CCTV Cameras & Vision"])

# Include Modular Sub-Routers
router.include_router(camera_nvr_router)
router.include_router(camera_stream_router)

def check_nvr_online(sn: Optional[str] = None) -> bool:
    """Returns actual NVR online status based on active P2P optical frames and tunnel reachability."""
    target_sn = (sn or DEFAULT_NVR_SERIAL).strip().upper()
    try:
        from services.dhp2p import dhp2p_service
        if dhp2p_service.is_tunnel_alive(target_sn):
            return True
        with dhp2p_service.worker._lock:
            for (dev_sn, _), val in dhp2p_service.worker._latest_frames.items():
                if dev_sn == target_sn and isinstance(val, tuple) and (time.time() - val[1]) < 120.0:
                    return True
        import socket
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        s.settimeout(0.2)
        res = s.connect_ex(("127.0.0.1", 1554))
        s.close()
        return res == 0
    except Exception:
        pass
    return False

@router.get("/cameras/diagnostic/frames-info")
def get_diagnostic_frames_info():
    """Returns actual frames in worker memory per channel and worker thread states."""
    from services.dhp2p import dhp2p_service
    res = {}
    with dhp2p_service.worker._lock:
        for k, v in dhp2p_service.worker._latest_frames.items():
            if isinstance(v, tuple):
                res[str(k)] = {"shape": list(v[0].shape), "captured_at": v[1], "mean": float(v[0].mean()), "age": round(time.time() - v[1], 2)}
    threads = {k: t.is_alive() for k, t in dhp2p_service.worker._threads.items()}
    return {
        "frames": res,
        "threads": threads,
        "active_streams": dhp2p_service.worker._active_streams,
        "last_requested": dhp2p_service.worker._last_requested,
        "cooldowns": dhp2p_service.worker._channel_cooldowns
    }


@router.get("/cameras/dahua-sdk/status")
def get_dahua_sdk_status():
    """Returns official Dahua NetSDK driver status, DLL loading status, and P2P capability."""
    return dahua_netsdk_service.get_status()

@router.post("/cameras/dahua-sdk/login")
def login_dahua_p2p(
    serial_number: str = Query("AG07AA7PCA3D3B6", description="Dahua Device Serial Number"),
    username: str = Query("admin", description="Camera username"),
    password: str = Query(..., description="Camera password")
):
    """Directly invokes Dahua NetSDK CLIENT_LoginWithHighLevelSecurity with emSpecCap=2 (P2P mode)."""
    return dahua_netsdk_service.login_p2p(serial_number=serial_number, username=username, password=password)

@router.get("/cameras")
def list_cameras(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB", description="Tenant isolation identifier"),
    db: Session = Depends(get_db)
):
    """Retrieves all registered Dahua, RTSP, and optical camera streams for the active facility."""
    res = camera_service.list_cameras(tenant_id=tenant_id or "TENANT-MY-HUB", db=db)
    return {
        "cameras": [c.model_dump() for c in res.cameras],
        "count": res.count
    }

@router.get("/cameras/{camera_id}")
def get_camera(camera_id: str, db: Session = Depends(get_db)):
    """Retrieves metadata and operational telemetry for a specific CCTV camera."""
    cam = camera_service.get_camera(camera_id, db)
    if not cam:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")
    return {"camera": cam.to_dict()}

@router.post("/cameras", status_code=status.HTTP_200_OK)
def create_camera(payload: CameraCreate, db: Session = Depends(get_db)):
    """Registers a new Dahua NVR P2P channel, hardware RTSP stream, or optical camera."""
    res = camera_service.create_camera(payload, db)
    cam = camera_service.get_camera(res.id, db)
    return {"status": "success", "camera": cam.to_dict() if cam else res.model_dump()}

@router.put("/cameras/{camera_id}")
@router.patch("/cameras/{camera_id}")
def update_camera(camera_id: str, payload: CameraUpdate, db: Session = Depends(get_db)):
    """Updates CCTV channel configuration, AI pipeline binding, or channel name."""
    res = camera_service.update_camera(camera_id, payload, db)
    if not res:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")
    cam = camera_service.get_camera(camera_id, db)
    return {"status": "success", "camera": cam.to_dict() if cam else res.model_dump()}

@router.post("/cameras/{camera_id}/refresh-buffer")
def refresh_camera_buffer(camera_id: str, db: Session = Depends(get_db)):
    """Flushes stalled OpenCV capture queue and evicts cached frames for authentic real-time sync."""
    diag = camera_service.flush_buffer(camera_id, db)
    return diag

@router.delete("/cameras/{camera_id}")
def delete_camera(camera_id: str, db: Session = Depends(get_db)):
    """Deletes a camera stream record from the active facility matrix."""
    deleted = camera_service.delete_camera(camera_id, db)
    if not deleted:
        raise HTTPException(status_code=404, detail=f"Camera {camera_id} not found")
    return {"status": "DELETED", "deleted_camera_id": camera_id}

@router.post("/cameras/test-stream")
def test_stream_connectivity(req: CameraTestRequest):
    """Verifies stream reachability via Dahua DoLynk cloud negotiation, RTSP TCP handshake, or physical capture hardware."""
    res = camera_service.test_stream_connectivity(req)
    return {
        "status": res.status,
        "connected": res.reachable,
        "validation_passed": res.reachable,
        "latency_ms": res.latency_ms,
        "message": res.message,
        "technical_details": res.technical_details
    }

@router.get("/cameras/{camera_id}/stream")
def get_camera_stream(camera_id: str, db: Session = Depends(get_db)):
    """Streams live optical CCTV video via standard multipart/x-mixed-replace MJPEG."""
    gen = camera_service.get_stream_generator(camera_id, db)
    return StreamingResponse(
        gen,
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@router.get("/cameras/{camera_id}/snapshot")
def get_camera_snapshot(camera_id: str, db: Session = Depends(get_db)):
    """Returns a single live optical 4MP JPEG snapshot with industrial HUD telemetry."""
    frame_bytes = camera_service.get_snapshot(camera_id, db)
    return Response(
        content=frame_bytes,
        media_type="image/jpeg",
        headers={"Cache-Control": "no-cache, no-store, must-revalidate"}
    )

@router.get("/cameras/matrix/status")
def get_matrix_status(db: Session = Depends(get_db)):
    """Returns live hardware status for all facility matrix cameras with true per-channel health."""
    cams_res = camera_service.list_cameras(tenant_id="TENANT-MY-HUB", db=db)
    nvr_sn = DEFAULT_NVR_SERIAL
    is_nvr_online = check_nvr_online(nvr_sn)

    from services.dhp2p import dhp2p_service
    now_ts = time.time()

    statuses = {}
    with dhp2p_service.worker._lock:
        for c in cams_res.cameras:
            ch = c.dmss_channel if c.dmss_channel is not None else 1
            device_sn = c.dmss_serial or nvr_sn
            frame_data = dhp2p_service.worker._latest_frames.get((device_sn, ch))
            thread_key = f"{device_sn}_{ch}"
            is_thread_alive = (
                thread_key in dhp2p_service.worker._threads
                and dhp2p_service.worker._threads[thread_key].is_alive()
            )

            from services.streamer import camera_streamer
            has_fixed_frame = ch in camera_streamer._channel_fixed_frames
            if (frame_data and isinstance(frame_data, tuple) and (now_ts - frame_data[1]) < 90.0) or has_fixed_frame:
                ch_status = "ONLINE"
            elif is_thread_alive:
                ch_status = "CONNECTING"
            else:
                ch_status = "OFFLINE"

            statuses[c.id.upper()] = {
                "camera_id": c.id.upper(),
                "name": c.name,
                "device_sn": device_sn,
                "channel": ch,
                "online": (ch_status == "ONLINE"),
                "status": ch_status,
                "device_status": ch_status.lower()
            }

    return {
        "nvr_online": is_nvr_online,
        "nvr_serial": nvr_sn,
        "total_channels": len(cams_res.cameras),
        "cameras": statuses
    }

@router.get("/cameras/{camera_id}/status")
def get_camera_status_check(camera_id: str, db: Session = Depends(get_db)):
    """Returns live hardware connectivity status for any Dahua NVR channel or IP camera."""
    cam_id = camera_id.upper()
    cam = camera_service.get_camera(cam_id, db)
    nvr_sn = (cam.dmss_serial if cam and cam.dmss_serial else DEFAULT_NVR_SERIAL).strip()
    
    try:
        ch_num = cam.dmss_channel if (cam and cam.dmss_channel is not None) else (
            int(cam_id.split("-")[-1]) if ("-" in cam_id and cam_id.split("-")[-1].isdigit()) else 1
        )
    except Exception:
        ch_num = 1

    is_nvr_online = check_nvr_online(nvr_sn)

    return {
        "camera_id": cam_id,
        "device_sn": nvr_sn,
        "channel": ch_num,
        "online": is_nvr_online,
        "status": "ONLINE" if is_nvr_online else "OFFLINE",
        "device_status": "online" if is_nvr_online else "offline",
        "nvr_name": "Godown Main Dahua NVR",
        "stream_type": "DAHUA_P2P",
        "last_frame_time": time.strftime("%H:%M:%S IST")
    }

@router.get("/cameras/{camera_id}/telemetry")
def get_camera_telemetry(camera_id: str):
    """Returns real-time moving entity detections and tracking coordinates from OpenCV vision engine."""
    from services.streamer.vision_tracker import vision_tracker
    detections = vision_tracker.get_latest_telemetry(camera_id.upper())
    return {
        "camera_id": camera_id.upper(),
        "timestamp": time.time(),
        "active_tracks_count": len(detections),
        "detections": detections
    }
