"""
YardSight AI - Automated Tests for Genuine Real-Time Computer Vision Tracking,
ANPR Homography Unwarping, Database Auto-Registration, and Admin Plate Corrections.
"""

import pytest
import numpy as np
import cv2
from database import SessionLocal
from models import Truck, ANPRScanRecord, AuditLog
from services.streamer.vision_tracker import RealVisionTracker
from anpr_homography import anpr_engine
from services.anpr_service import anpr_service
from schemas.anpr import ANPRUnwarpRequest


def test_real_vision_tracker_moving_person(monkeypatch):
    """
    Verifies that moving physical objects produce dynamically shifting bounding box
    coordinates across frames rather than static mock positions.
    """
    monkeypatch.setenv("DISABLE_CV_AI", "0")
    tracker = RealVisionTracker()
    bg = np.full((720, 1280, 3), 45, dtype=np.uint8)
    
    # Train background model on 5 stationary frames
    for _ in range(5):
        tracker.process_frame(bg.copy(), "CAM-01")

    # Frame 1: Person appears at x=200
    f1 = bg.copy()
    cv2.rectangle(f1, (200, 300), (270, 520), (230, 230, 230), -1)
    dets1 = tracker.process_frame(f1, "CAM-01")

    assert len(dets1) >= 1, "Expected motion detection in frame 1"
    p1 = dets1[0]
    assert p1["label"] == "PERSON", f"Expected PERSON classification, got {p1['label']}"
    initial_x = p1["bbox_pixels"]["x"]
    assert 180 <= initial_x <= 220, f"Expected initial_x around 200, got {initial_x}"

    # Frame 2: Person moves across the yard to x=245 (realistic 45px motion delta at ~25fps)
    f2 = bg.copy()
    cv2.rectangle(f2, (245, 300), (315, 520), (230, 230, 230), -1)
    dets2 = tracker.process_frame(f2, "CAM-01")

    assert len(dets2) >= 1, "Expected motion detection in frame 2"
    p2 = dets2[0]
    moved_x = p2["bbox_pixels"]["x"]
    assert moved_x > initial_x + 30, f"Expected bounding box to move right, got {moved_x} vs {initial_x}"
    assert p2["velocity"] > 3.0, f"Expected velocity > 3.0 px/frame, got {p2['velocity']}"
    assert p2["state"] == "MOVING", f"Expected state MOVING, got {p2['state']}"


def test_anpr_homography_validation():
    """Verifies format validation against Ministry of Road Transport HSRP and US DOT standards."""
    # Valid Indian HSRP
    is_valid_in, desc_in = anpr_engine.validate_plate_format("MH 12 RN 4589", "IN")
    assert is_valid_in is True
    assert "HSRP" in desc_in

    # Invalid Indian plate (missing district code)
    is_valid_inv, _ = anpr_engine.validate_plate_format("M-RN-4589", "IN")
    assert is_valid_inv is False

    # Valid US commercial plate
    is_valid_us, desc_us = anpr_engine.validate_plate_format("TX-942-WKY", "US")
    assert is_valid_us is True
    assert "USDOT" in desc_us


def test_anpr_auto_registration_and_admin_edit():
    """Verifies that detected plates are auto-registered in the DB and can be corrected by admin."""
    db = SessionLocal()
    try:
        test_plate = "MH 12 RN 7788"
        req = ANPRUnwarpRequest(plate_hint=test_plate, country="IN")
        
        # 1. Detect and auto-register
        res = anpr_service.detect_and_register(
            req=req,
            tenant_id="TENANT-MY-HUB",
            db=db,
            carrier_name="Logistics Express Intermodal"
        )
        assert res["status"] == "SUCCESS"
        scan_id = res["scan_record"]["id"]
        assert res["scan_record"]["plate_number"] == test_plate

        # Verify Truck exists in DB
        truck = db.query(Truck).filter(Truck.plate_number == test_plate).first()
        assert truck is not None
        assert truck.status == "INBOUND"

        # 2. Admin edits misread plate to MH 12 RN 7789
        corrected_plate = "MH 12 RN 7789"
        corrected = anpr_service.correct_record(
            record_id=scan_id,
            new_plate=corrected_plate,
            tenant_id="TENANT-MY-HUB",
            db=db,
            admin_user_id="admin-supervisor"
        )
        assert corrected is not None
        assert corrected["plate_number"] == corrected_plate
        assert corrected["is_manually_corrected"] is True
        assert corrected["original_ocr_plate"] == test_plate

        # Verify audit log was created
        audit = db.query(AuditLog).filter(
            AuditLog.action == "ADMIN_CORRECTED_ANPR_PLATE"
        ).order_by(AuditLog.timestamp.desc()).first()
        assert audit is not None
        assert corrected_plate in audit.details
        assert test_plate in audit.details
    finally:
        db.close()
