"""
YardSight AI - Dahua NVR Onboarding, Provisioning & Management Router
"""

from typing import Optional, Dict, Any, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel, Field

from database import get_db
from models import CCTVCamera
from services.dolynk_service import dolynk_service

router = APIRouter(tags=["Dahua NVR Management"])

class NVROnboardRequest(BaseModel):
    nvr_name: str = Field("Godown Main NVR", description="Human-friendly name for NVR")
    serial_number: str = Field("BE124E0PCA95532", description="Dahua NVR Hardware Serial Number")
    device_username: str = Field("admin", description="NVR device admin username")
    device_password: str = Field("admin123", description="NVR device safety password")
    total_channels: int = Field(32, description="Total channels to import (e.g. 4, 8, 16, 32)")
    channels: Optional[List[int]] = Field(None, description="Specific channels to import, e.g. [1, 2, 3... 14]")
    tenant_id: str = Field("TENANT-MY-HUB", description="Tenant isolation identifier")

@router.post("/cameras/nvr/onboard")
def onboard_nvr(payload: NVROnboardRequest, db: Session = Depends(get_db)):
    """Automated customer NVR onboarding: binds NVR to DoLynk Cloud via API and imports all camera channels."""
    from models import Tenant
    active_tenant_id = payload.tenant_id
    if not db.query(Tenant).filter(Tenant.id == active_tenant_id).first():
        primary = db.query(Tenant).first()
        active_tenant_id = primary.id if primary else "TENANT-MY-HUB"

    bind_result = dolynk_service.add_device(
        device_sn=payload.serial_number,
        password=payload.device_password,
        category_code="NVR"
    )

    imported = dolynk_service.import_nvr_channels(
        nvr_sn=payload.serial_number,
        nvr_name=payload.nvr_name,
        num_channels=payload.total_channels,
        tenant_id=active_tenant_id,
        db=db,
        channels=payload.channels
    )

    bind_ok = bind_result.get("success", False)
    status_str = "SUCCESS" if bind_ok else ("PENDING_AUTHORIZATION" if bind_result.get("code") == "IDV004" else "FAILED")
    msg = bind_result.get("message") or f"Successfully onboarded NVR {payload.serial_number} and imported {len(imported)} channels into YardSight AI."
    return {
        "success": bind_ok,
        "status": status_str,
        "cloud_binding": bind_result,
        "imported_channels": len(imported),
        "channels": [c.to_dict() for c in imported],
        "message": msg
    }

@router.post("/cameras/nvr/sync-channels")
def sync_nvr_channels(
    serial_number: str = Query("BE124E0PCA95532", description="NVR Hardware Serial Number"),
    total_channels: int = Query(32, description="Total NVR channel count (e.g. 16, 32, 48)"),
    nvr_name: str = Query("Dahua Godown Main NVR", description="Human-friendly NVR name"),
    host: Optional[str] = Query(None, description="LAN IP / Hostname of NVR for direct RTSP"),
    port: Optional[int] = Query(554, description="RTSP port (default 554)"),
    username: Optional[str] = Query("admin", description="NVR username"),
    password: Optional[str] = Query("Shri@21*", description="NVR password"),
    transport: Optional[str] = Query("P2P", description="Preferred transport: LAN_RTSP or P2P"),
    db: Session = Depends(get_db)
):
    """Dynamically provisions or auto-discovers all channels for an NVR without ID collisions."""
    try:
        from services.streamer.zones import get_zone_def
        sn_clean = serial_number.strip().upper()
        is_primary_nvr = (sn_clean == "BE124E0PCA95532")
        sn_suffix = sn_clean[-5:] if len(sn_clean) >= 5 else sn_clean

        synced = []
        for ch in range(1, total_channels + 1):
            cam_id = f"CAM-{ch:02d}" if is_primary_nvr else f"CAM-{sn_suffix}-CH{ch:02d}"
            zone = get_zone_def(ch)
            zone_code, default_name, zone_pipeline = zone.zone_code, zone.display_name, zone.ai_pipeline

            # Direct RTSP URL if host provided, else DMSS/P2P URL
            if host and host.strip():
                h_clean = host.strip()
                p_clean = port or 554
                u_clean = username or "admin"
                pass_part = f":{password}@" if password else "@"
                stream_url = f"rtsp://{u_clean}{pass_part}{h_clean}:{p_clean}/cam/realmonitor?channel={ch}&subtype=1"
                stream_type = "RTSP"
            else:
                stream_url = f"DMSS://{sn_clean}?channel={ch}"
                stream_type = "DMSS"

            existing = db.query(CCTVCamera).filter(CCTVCamera.id == cam_id).first()
            if not existing:
                cam = CCTVCamera(
                    id=cam_id,
                    tenant_id="TENANT-MY-HUB",
                    name=f"{default_name} (CH{ch:02d})",
                    location=f"Facility Zone {zone_code}",
                    brand=f"Dahua NVR IP-CH{ch:02d} ({sn_clean})",
                    resolution="2560x1440 (2.5K Quad HD)" if ch == 1 else "1080p (1920x1080)",
                    fps=30,
                    stream_type=stream_type,
                    stream_url=stream_url,
                    ai_pipeline=zone_pipeline,
                    status="ONLINE",
                    dmss_serial=sn_clean,
                    dmss_channel=ch,
                    dmss_username=username or "admin",
                    dmss_password=password
                )
                db.add(cam)
                synced.append(cam)
            else:
                existing.dmss_serial = sn_clean
                existing.dmss_channel = ch
                existing.stream_type = stream_type
                existing.stream_url = stream_url
                if username:
                    existing.dmss_username = username
                if password:
                    existing.dmss_password = password
                existing.status = "ONLINE"
                synced.append(existing)

        db.commit()
        return {
            "status": "SUCCESS",
            "nvr_serial": sn_clean,
            "total_channels": len(synced),
            "synced_channels": [c.to_dict() for c in synced],
            "message": f"Successfully auto-discovered and mapped {len(synced)} channels for NVR {sn_clean}."
        }
    except Exception as e:
        db.rollback()
        return {
            "status": "ERROR",
            "error_type": type(e).__name__,
            "message": f"Failed syncing NVR channels: {str(e)}"
        }

@router.get("/cameras/nvr/list")
def list_nvrs(db: Session = Depends(get_db)):
    """Lists all detected or registered Dahua NVRs and their active channel counts."""
    cams = db.query(CCTVCamera).all()
    nvrs: Dict[str, Dict[str, Any]] = {}
    for c in cams:
        sn = (c.dmss_serial or "BE124E0PCA95532").strip().upper()
        if sn not in nvrs:
            nvrs[sn] = {
                "serial_number": sn,
                "nvr_name": f"Dahua Godown NVR ({sn})",
                "online": True,
                "channel_count": 0,
                "channels": []
            }
        nvrs[sn]["channels"].append(c.id)
        nvrs[sn]["channel_count"] += 1
    return {"nvrs": list(nvrs.values()), "count": len(nvrs)}

@router.delete("/cameras/nvr/{serial_number}")
def delete_nvr_and_channels(serial_number: str, db: Session = Depends(get_db)):
    """Deletes all camera channels associated with an NVR serial number and flushes associated hardware sockets."""
    sn_clean = serial_number.strip().upper()
    cams = db.query(CCTVCamera).filter(
        (CCTVCamera.dmss_serial == sn_clean) | 
        (CCTVCamera.brand.like(f"%{sn_clean}%"))
    ).all()
    if not cams:
        raise HTTPException(status_code=404, detail=f"No cameras found for NVR serial {serial_number}")
    
    count = len(cams)
    from services.streamer import camera_streamer
    for c in cams:
        camera_streamer.flush_camera_buffer(c.id)
        db.delete(c)
    db.commit()
    return {
        "status": "DELETED",
        "nvr_serial": sn_clean,
        "deleted_channels_count": count,
        "message": f"Successfully deleted NVR {sn_clean} and purged {count} associated camera channels from the facility matrix."
    }
