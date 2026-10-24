"""
YardSight AI - CCTV Camera Service Layer (<80 lines).
Encapsulates CCTV camera database management, testing delegation, and optical streaming.
"""
import time
from typing import Optional, Generator
from sqlalchemy.orm import Session
from models import CCTVCamera
from schemas.camera import (
    CameraCreate, CameraUpdate, CameraResponse, CameraListResponse,
    CameraTestRequest, CameraTestResponse
)
from services.camera_tester import test_camera_connectivity

class CameraService:
    """Service encapsulating CCTV camera database management, testing, and optical streaming."""

    @staticmethod
    def list_cameras(tenant_id: str, db: Session) -> CameraListResponse:
        cams = db.query(CCTVCamera).filter(CCTVCamera.tenant_id == tenant_id).all()
        if not cams:
            cams = db.query(CCTVCamera).all()
        if not cams:
            from routers.camera_nvr_router import sync_nvr_channels
            sync_nvr_channels(serial_number="BE124E0PCA95532", total_channels=32, nvr_name="Dahua Godown Main NVR", db=db)
            cams = db.query(CCTVCamera).all()
        response_list = [CameraResponse.model_validate(c) for c in cams]
        return CameraListResponse(cameras=response_list, count=len(response_list))

    @staticmethod
    def get_camera(camera_id: str, db: Session) -> Optional[CCTVCamera]:
        return db.query(CCTVCamera).filter(
            (CCTVCamera.id == camera_id) | (CCTVCamera.id == camera_id.upper()) | (CCTVCamera.id == camera_id.lower())
        ).first()

    @staticmethod
    def create_camera(payload: CameraCreate, db: Session) -> CameraResponse:
        cam_id = payload.id or f"CAM-{int(time.time()*1000) % 100000:05d}"
        stream_url = payload.stream_url
        if payload.stream_type == "DMSS" and not stream_url:
            ch = payload.dmss_channel if payload.dmss_channel is not None else 1
            sn = (payload.dmss_serial or "BE124E0PCA95532").strip()
            stream_url = f"rtsp://127.0.0.1:1554/cam/realmonitor?channel={ch}&subtype=1"
        elif payload.stream_type == "WEBRTC" and not stream_url:
            stream_url = "http://127.0.0.1:1984/api/webrtc?src=ipc_live"

        brand = payload.brand
        if not brand or brand == "Dahua":
            if payload.stream_type == "DMSS" and payload.dmss_serial:
                brand = f"Dahua P2P ({payload.dmss_serial})"
            elif payload.stream_type == "WEBRTC":
                brand = "WebRTC Go2RTC Gateway"

        new_cam = CCTVCamera(
            id=cam_id, tenant_id=payload.tenant_id or "TENANT-MY-HUB", name=payload.name,
            location=payload.location, brand=brand, resolution=payload.resolution,
            fps=payload.fps, stream_type=payload.stream_type, stream_url=stream_url,
            ai_pipeline=payload.ai_pipeline, status=payload.status, dmss_serial=payload.dmss_serial,
            dmss_channel=payload.dmss_channel, dmss_username=payload.dmss_username, dmss_password=payload.dmss_password
        )
        db.add(new_cam)
        db.commit()
        db.refresh(new_cam)
        return CameraResponse.model_validate(new_cam)

    @staticmethod
    def update_camera(camera_id: str, payload: CameraUpdate, db: Session) -> Optional[CameraResponse]:
        cam = db.query(CCTVCamera).filter(
            (CCTVCamera.id == camera_id) | (CCTVCamera.id == camera_id.upper()) | (CCTVCamera.id == camera_id.lower())
        ).first()
        if not cam: return None
        for key, val in payload.model_dump(exclude_unset=True).items():
            setattr(cam, key, val)
        db.commit()
        db.refresh(cam)
        return CameraResponse.model_validate(cam)

    @staticmethod
    def delete_camera(camera_id: str, db: Session) -> bool:
        cam = db.query(CCTVCamera).filter(
            (CCTVCamera.id == camera_id) | (CCTVCamera.id == camera_id.upper()) | (CCTVCamera.id == camera_id.lower())
        ).first()
        if not cam: return False
        db.delete(cam)
        db.commit()
        return True

    @staticmethod
    def test_stream_connectivity(req: CameraTestRequest) -> CameraTestResponse:
        return test_camera_connectivity(req)

    @staticmethod
    def get_stream_generator(camera_id: str, db: Session) -> Generator[bytes, None, None]:
        from camera_streamer import camera_streamer
        from services.streamer.zones import get_zone_def
        cam = db.query(CCTVCamera).filter(
            (CCTVCamera.id == camera_id) | (CCTVCamera.id == camera_id.upper()) | (CCTVCamera.id == camera_id.lower())
        ).first()
        is_cam01 = camera_id.upper() == "CAM-01"
        ch_num = int(camera_id.split("-")[-1]) if ("-" in camera_id and camera_id.split("-")[-1].isdigit()) else 1
        default_name = get_zone_def(ch_num).display_name
        cam_dict = cam.to_dict() if cam else {
            "id": camera_id.upper(),
            "name": default_name if not is_cam01 else "Gate 01 Inbound ANPR & Optical Inspection",
            "brand": "Dahua",
            "stream_type": "DMSS" if is_cam01 else "RTSP",
            "dmss_serial": "AG07AA7PCA3D3B6" if is_cam01 else "BE124E0PCA95532",
            "dmss_channel": ch_num
        }
        return camera_streamer.mjpeg_stream_generator(cam_dict)

    @staticmethod
    def get_snapshot(camera_id: str, db: Session) -> bytes:
        from camera_streamer import camera_streamer
        from services.streamer.zones import get_zone_def
        cam = db.query(CCTVCamera).filter(
            (CCTVCamera.id == camera_id) | (CCTVCamera.id == camera_id.upper()) | (CCTVCamera.id == camera_id.lower())
        ).first()
        is_cam01 = camera_id.upper() == "CAM-01"
        ch_num = int(camera_id.split("-")[-1]) if ("-" in camera_id and camera_id.split("-")[-1].isdigit()) else 1
        default_name = get_zone_def(ch_num).display_name
        cam_dict = cam.to_dict() if cam else {
            "id": camera_id.upper(),
            "name": default_name if not is_cam01 else "Gate 01 Inbound ANPR & Optical Inspection",
            "brand": "Dahua",
            "stream_type": "DMSS" if is_cam01 else "RTSP",
            "dmss_serial": "AG07AA7PCA3D3B6" if is_cam01 else "BE124E0PCA95532",
            "dmss_channel": ch_num
        }
        return camera_streamer.generate_live_frame(cam_dict)

    @staticmethod
    def get_live_telemetry(camera_id: str) -> list:
        from services.streamer.vision_tracker import vision_tracker
        return vision_tracker.get_latest_telemetry(camera_id.upper())

    @staticmethod
    def flush_buffer(camera_id: str, db: Session) -> dict:
        cam_id = camera_id.upper()
        cam = db.query(CCTVCamera).filter(CCTVCamera.id == cam_id).first()
        url = cam.stream_url if cam else ""
        from services.streamer import camera_streamer
        return camera_streamer.flush_camera_buffer(cam_id, stream_url=url)

camera_service = CameraService()

