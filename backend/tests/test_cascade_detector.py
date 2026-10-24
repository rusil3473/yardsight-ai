"""
Unit and integration tests for Progressive 3-Layer CCTV and OpenCV Cascade Engine
"""

import pytest
import numpy as np
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from database import Base
from models import Truck, ANPRScanRecord
from services.cascade_detector import Progressive3LayerCascade


@pytest.fixture
def db_session():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    try:
        yield session
    finally:
        session.close()


def test_layer1_idle_state():
    cascade = Progressive3LayerCascade()
    # Uniform blank frame (no motion)
    blank_frame = np.zeros((240, 360, 3), dtype=np.uint8)
    
    # Run multiple times to train background model
    for _ in range(5):
        res = cascade.evaluate_layer1_prefilter(blank_frame)
    
    assert res["triggered"] is False
    assert res["reason"] == "NO_SIGNIFICANT_MOTION"


def test_layer1_motion_trigger():
    cascade = Progressive3LayerCascade()
    bg_frame = np.zeros((240, 360, 3), dtype=np.uint8)
    for _ in range(5):
        cascade.evaluate_layer1_prefilter(bg_frame)
    
    # Introduce sudden large vehicle shape in frame
    moving_frame = bg_frame.copy()
    moving_frame[40:180, 50:280] = 255
    res = cascade.evaluate_layer1_prefilter(moving_frame)
    
    assert res["triggered"] is True
    assert res["reason"] == "CANDIDATE_MOTION_DETECTED"
    assert res["candidate_count"] > 0


def test_layer2_filters_false_alarm_noise():
    cascade = Progressive3LayerCascade()
    l1_mock = {"triggered": True, "bbox_low": [50, 40, 200, 100]}
    
    # Low contrast blurry gradient (simulating a soft tree shadow)
    shadow_frame = np.full((480, 640, 3), 40, dtype=np.uint8)
    res = cascade.evaluate_layer2_verifier(shadow_frame, l1_mock)
    
    assert res["verified"] is False
    assert res["entity_type"] == "FALSE_ALARM"


def test_layer2_confirms_vehicle():
    cascade = Progressive3LayerCascade()
    l1_mock = {"triggered": True, "bbox_low": [50, 40, 220, 110]}
    
    # Create structured pattern with rich edges (chassis, wheels, grill)
    vehicle_frame = np.zeros((480, 640, 3), dtype=np.uint8)
    for i in range(50, 400, 10):
        vehicle_frame[i:i+4, 100:500] = 240
        vehicle_frame[80:350, i:i+4] = 240

    res = cascade.evaluate_layer2_verifier(vehicle_frame, l1_mock)
    assert res["verified"] is True
    assert res["entity_type"] == "VEHICLE"
    assert res["confidence"] > 0.70


def test_layer3_verified_plate():
    cascade = Progressive3LayerCascade()
    l2_mock = {"verified": True, "entity_type": "VEHICLE"}
    hd_frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    
    res = cascade.evaluate_layer3_hd_anpr(
        frame_hd=hd_frame,
        l2_result=l2_mock,
        country="IN",
        plate_hint="MH 12 RN 4589"
    )
    
    assert res["executed"] is True
    assert res["plate_number"] == "MH 12 RN 4589"
    assert res["is_standard_fallback"] is False
    assert res["read_status"] == "VERIFIED_PLATE_OCR"


def test_layer3_unresolved_plate_uses_standard_fallback():
    cascade = Progressive3LayerCascade()
    l2_mock = {"verified": True, "entity_type": "VEHICLE"}
    hd_frame = np.zeros((1080, 1920, 3), dtype=np.uint8)
    
    # Missing / unreadable plate hint
    res = cascade.evaluate_layer3_hd_anpr(
        frame_hd=hd_frame,
        l2_result=l2_mock,
        country="IN",
        plate_hint=""
    )
    
    assert res["executed"] is True
    # As instructed by user: fallback format XX XX XX XXXX
    assert res["plate_number"] == "XX XX XX XXXX"
    assert res["is_standard_fallback"] is True
    assert res["read_status"] == "FALLBACK_UNRESOLVED_PLATE"


def test_end_to_end_pipeline_registration(db_session):
    cascade = Progressive3LayerCascade()
    
    # Create frames
    bg = np.zeros((240, 360, 3), dtype=np.uint8)
    for _ in range(5):
        cascade.evaluate_layer1_prefilter(bg)
        
    f_low = bg.copy()
    f_low[50:180, 60:260] = 255
    
    f_med = np.zeros((480, 640, 3), dtype=np.uint8)
    for i in range(50, 400, 12):
        f_med[i:i+4, 100:500] = 250
        
    f_hd = np.zeros((1080, 1920, 3), dtype=np.uint8)
    
    # Run end to end with unreadable plate -> should register fallback
    res_fallback = cascade.process_and_register(
        frame_low=f_low,
        frame_med=f_med,
        frame_hd=f_hd,
        tenant_id="TENANT-P2-TEST",
        db=db_session,
        country="IN",
        plate_hint=""
    )
    
    assert res_fallback["status"] == "REGISTERED"
    assert res_fallback["registered_plate"] == "XX XX XX XXXX"
    assert res_fallback["is_standard_fallback"] is True
    
    # Verify DB records
    scan = db_session.query(ANPRScanRecord).filter_by(id=res_fallback["scan_id"]).first()
    assert scan is not None
    assert scan.plate_number == "XX XX XX XXXX"
    assert scan.status == "FLAGGED_UNRESOLVED"
    
    truck = db_session.query(Truck).filter_by(id=res_fallback["truck_id"]).first()
    assert truck is not None
    assert truck.plate_number == "XX XX XX XXXX"
