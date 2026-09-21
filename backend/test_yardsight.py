"""
Automated unit test suite for YardSight AI (GodownOS) OpenCV 5 and physical AI pipelines.
"""

import pytest
import numpy as np
from anpr_homography import anpr_engine
from leak_detector import leak_detector
from dock_cycle_tracker import dock_tracker
from eway_bill_engine import eway_engine
from mcp_server import mcp_server

def test_anpr_homography():
    corners = np.float32([[220, 180], [430, 205], [415, 270], [210, 240]])
    dummy_img = np.zeros((360, 640, 3), dtype=np.uint8)
    unwarped, matrix = anpr_engine.unwarp_plate(dummy_img, corners)
    
    assert unwarped.shape == (120, 400, 3)
    assert matrix.shape == (3, 3)
    
    # Test enhancement
    enhanced = anpr_engine.enhance_plate(unwarped)
    assert enhanced.shape == (120, 400)
    assert enhanced.dtype == np.uint8

def test_cctv_simulation():
    res = anpr_engine.simulate_cctv_frame("MH-12-RN-4819", "IN")
    assert res["confidence"] > 0.9
    assert res["plate_number"] == "MH-12-RN-4819"
    assert res["raw_cctv_b64"].startswith("data:image/jpeg;base64,")
    assert res["unwarped_plate_b64"].startswith("data:image/jpeg;base64,")

def test_leak_detector():
    leak_data = leak_detector.simulate_leak_cctv(0.7)
    metrics = leak_data["metrics"]
    assert metrics["wet_pixels"] > 0
    assert metrics["estimated_surface_area_sqm"] > 0
    assert "CRITICAL" in metrics["severity"] or "WARNING" in metrics["severity"]
    assert leak_data["leak_rate_liters_per_hour"] > 0

def test_dock_dwell_tracker():
    dwells = dock_tracker.get_yard_dwell_metrics()
    assert len(dwells) >= 2
    
    # Check that truck TRK-9041 is flagged for detention (> 120 mins)
    trk_9041 = next(t for t in dwells if t["truck_id"] == "TRK-9041")
    assert trk_9041["is_detention"] is True
    assert trk_9041["detention_minutes"] > 0
    assert trk_9041["accrued_detention_fee_usd"] > 0

def test_eway_bill_generation():
    ewb = eway_engine.generate_gst_eway_bill(
        vehicle_number="MH-12-RN-4819",
        transporter_name="Tata Logistics Express",
        cargo_description="Cement & FMCG Goods"
    )
    assert ewb["type"] == "GST_EWAY_BILL"
    assert ewb["eway_bill_number"].startswith("1912")
    assert ewb["digital_signature"].startswith("GSTIN-SIG-")

def test_us_ebol_generation():
    bol = eway_engine.generate_us_ebol(
        truck_plate="TX-49-B219",
        carrier_name="Swift Transportation US",
        cargo_description="General Freight"
    )
    assert bol["type"] == "US_ELECTRONIC_BOL"
    assert bol["bol_number"].startswith("BOL-US-")
    assert bol["fmcsa_status"] == "VERIFIED_COMPLIANT"

def test_mcp_server_tools():
    tools = mcp_server.list_tools()
    assert len(tools) == 5
    tool_names = [t["name"] for t in tools]
    assert "get_yard_overview" in tool_names
    assert "analyze_gate_anpr" in tool_names
    assert "check_roof_leakage" in tool_names
    
    # Test tool invocation
    overview = mcp_server.call_tool("get_yard_overview", {})
    assert "active_trucks_in_yard" in overview
    assert "detention_alerts" in overview
