"""
YardSight AI - ANPR Perspective Homography & Plate Manifest Router
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, Query, HTTPException, status
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session
from database import get_db
from schemas.anpr import ANPRUnwarpRequest, ANPRUnwarpResponse
from services.anpr_service import anpr_service

router = APIRouter(prefix="/anpr", tags=["ANPR & Homography Computer Vision"])

class PlateCorrectionRequest(BaseModel):
    new_plate_number: str = Field(..., description="Admin corrected vehicle license plate string")
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant isolation identifier")
    admin_user_id: Optional[str] = Field("admin-operator", description="Admin user identifier")

class DetectAndRegisterPayload(ANPRUnwarpRequest):
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant isolation identifier")
    gate_id: Optional[str] = Field("Gate 01 Inbound", description="Gate portal identifier")
    carrier_name: Optional[str] = Field("Standard Commercial Carrier", description="Carrier organization")
    driver_name: Optional[str] = Field("Verified Dispatch Operator", description="Operator name")

@router.get("/unwarp", response_model=ANPRUnwarpResponse)
def unwarp_and_read_plate_get(
    plate: str = Query("MH 12 RN 4589", description="Vehicle license plate string"),
    country: str = Query("IN", description="Country code (IN, US)")
):
    """Applies OpenCV perspective homography transformation to rectify tilted oblique gate cameras (GET query)."""
    return anpr_service.unwarp_and_read(plate, country)

@router.post("/unwarp", response_model=ANPRUnwarpResponse, status_code=status.HTTP_200_OK)
def unwarp_and_read_plate_post(req: ANPRUnwarpRequest):
    """
    Applies OpenCV perspective homography transformation given a raw base64 frame,
    4 corner calibration coordinates, or expected plate hint (POST JSON payload).
    """
    return anpr_service.unwarp_with_request(req)

@router.post("/detect", response_model=ANPRUnwarpResponse, status_code=status.HTTP_200_OK)
def detect_and_unwarp_plate(req: ANPRUnwarpRequest):
    """Alias for autonomous detection and homography rectification."""
    return anpr_service.unwarp_with_request(req)

@router.post("/detect-and-register", status_code=status.HTTP_200_OK)
def detect_and_register_plate(payload: DetectAndRegisterPayload, db: Session = Depends(get_db)):
    """
    Executes OpenCV homography unwarping, extracts plate, and automatically registers the vehicle
    into both the ANPR manifest and the active fleet yard database.
    """
    return anpr_service.detect_and_register(
        req=payload,
        tenant_id=payload.tenant_id or "TENANT-MY-HUB",
        db=db,
        gate_id=payload.gate_id or "Gate 01 Inbound",
        carrier_name=payload.carrier_name or "Standard Commercial Carrier",
        driver_name=payload.driver_name or "Verified Dispatch Operator"
    )

@router.get("/records")
def list_anpr_records(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    limit: int = Query(50),
    db: Session = Depends(get_db)
):
    """Retrieves chronological ANPR gate scans with OCR confidence, homography crops, and edit flags."""
    return {
        "status": "SUCCESS",
        "records": anpr_service.list_records(tenant_id=tenant_id or "TENANT-MY-HUB", db=db, limit=limit)
    }

@router.put("/records/{record_id}")
@router.post("/records/{record_id}")
@router.patch("/records/{record_id}")
def correct_anpr_record(
    record_id: str,
    payload: PlateCorrectionRequest,
    db: Session = Depends(get_db)
):
    """
    Allows admin to fix an incorrect OCR reading directly from the gate scanner or manifest table.
    Updates the record, synchronizes the fleet tracker, and logs an audit trail event.
    """
    updated = anpr_service.correct_record(
        record_id=record_id,
        new_plate=payload.new_plate_number,
        tenant_id=payload.tenant_id or "TENANT-MY-HUB",
        db=db,
        admin_user_id=payload.admin_user_id or "admin-operator"
    )
    if not updated:
        raise HTTPException(status_code=404, detail=f"ANPR Scan Record '{record_id}' not found")
    return {
        "status": "SUCCESS",
        "message": f"License plate for scan {record_id} successfully updated to '{payload.new_plate_number.strip().upper()}'.",
        "record": updated
    }


class CascadeEvaluationRequest(BaseModel):
    plate_hint: Optional[str] = Field("MH 12 RN 4589", description="Expected or detected plate hint")
    country: Optional[str] = Field("IN", description="Country standard (IN or US)")
    gate_id: Optional[str] = Field("Gate 01 Inbound", description="Target gate identifier")
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant isolation identifier")
    simulate_motion: Optional[bool] = Field(True, description="Whether Layer 1 detects candidate motion")
    simulate_vehicle: Optional[bool] = Field(True, description="Whether Layer 2 confirms candidate is an authentic vehicle")


@router.post("/cascade-evaluate", status_code=status.HTTP_200_OK)
def evaluate_3layer_cascade(payload: CascadeEvaluationRequest, db: Session = Depends(get_db)):
    """
    Executes the Progressive 3-Layer CCTV & OpenCV Cascade Pipeline:
    - Layer 1 (Sub-Stream 360p): Ambient motion & contour pre-filter (< 1% CPU).
    - Layer 2 (Medium Quality 480p): False alarm elimination filter (rejects shadows/wind/noise).
    - Layer 3 (HD 1080p Main Stream): Precision OpenCV 4.10 Perspective Homography + ANPR OCR.
      Fallback: If plate cannot be clearly read, registers standard placeholder 'XX XX XX XXXX'.
    """
    import numpy as np
    from services.cascade_detector import cascade_engine

    # Construct representative test frames for the 3-layer cascade
    # Layer 1: Low-res 360x240 frame
    f_low = np.zeros((240, 360, 3), dtype=np.uint8)
    if payload.simulate_motion:
        f_low[40:180, 50:280] = 255

    # Layer 2: Medium-res 640x480 frame
    f_med = np.zeros((480, 640, 3), dtype=np.uint8)
    if payload.simulate_vehicle:
        for i in range(50, 400, 10):
            f_med[i:i+4, 100:500] = 240
            f_med[80:350, i:i+4] = 240

    # Layer 3: HD 1920x1080 frame
    f_hd = np.zeros((1080, 1920, 3), dtype=np.uint8)

    result = cascade_engine.process_and_register(
        frame_low=f_low,
        frame_med=f_med,
        frame_hd=f_hd,
        tenant_id=payload.tenant_id or "TENANT-MY-HUB",
        db=db,
        gate_id=payload.gate_id or "Gate 01 Inbound",
        country=payload.country or "IN",
        plate_hint=payload.plate_hint
    )

    return result

