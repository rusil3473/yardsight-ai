"""
Automated unit test suite for YardSight AI (GodownOS).
Covers:
1. OpenCV 5 ANPR Homography & CCTV unwarping
2. Specular reflection concrete leak detection
3. Dock dwell tracker & $75/hr detention billing
4. GST E-Way Bill & US eBOL generation
5. Amazon Alexa+ Model Context Protocol (MCP v2025-11-25)
6. Enterprise Stateless JWT & RBAC Authorization
7. Token Bucket Rate Limiting (100k capacity) & Redis-Style LRU Cache
8. Multi-Tenant isolation
"""

import pytest
import numpy as np
from fastapi.testclient import TestClient

from app import app
from anpr_homography import anpr_engine
from leak_detector import leak_detector
from dock_cycle_tracker import dock_tracker
from eway_bill_engine import eway_engine
from mcp_server import mcp_server
from auth_engine import create_access_token, verify_access_token, ENTERPRISE_USERS
from scale_engine import rate_limiter, lru_cache, worker_queue, get_enterprise_scale_metrics
from tenant_manager import tenant_manager

client = TestClient(app)

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
    overview = mcp_server.call_tool("get_yard_overview", {})
    assert "active_trucks_in_yard" in overview
    assert "detention_alerts" in overview

# --- Enterprise Scalability & Security Tests ---
def test_jwt_auth_and_rbac():
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    token = create_access_token(admin_user)
    assert token.count('.') == 2
    
    payload = verify_access_token(token)
    assert payload["email"] == "admin@yardsight.corp"
    assert payload["role"] == "corporate_admin"
    assert "all" in payload["permissions"]

def test_rate_limiter_and_scale_telemetry():
    # Verify rate limit headers
    resp = client.get("/api/health")
    assert resp.status_code == 200
    assert "X-RateLimit-Limit" in resp.headers
    assert resp.headers["X-RateLimit-Limit"] == "100000"
    
    # Verify scale metrics endpoint
    metrics_resp = client.get("/api/metrics/scale")
    assert metrics_resp.status_code == 200
    data = metrics_resp.json()
    assert "target_scale_capacity" in data
    assert data["active_simulated_connections"] > 40000

def test_redis_lru_cache():
    lru_cache.set("test_key", {"carrier": "Gati KWE"}, ttl_seconds=60)
    cached = lru_cache.get("test_key")
    assert cached is not None
    assert cached["carrier"] == "Gati KWE"
    
    stats = lru_cache.get_stats()
    assert stats["hits"] > 0

def test_multi_tenant_isolation():
    tenants_resp = client.get("/api/tenants")
    assert tenants_resp.status_code == 200
    tenants = tenants_resp.json()["tenants"]
    assert len(tenants) == 3
    
    # Switch to Dallas DC
    switch_resp = client.post("/api/tenants/switch", json={"tenant_id": "TENANT-US-DFW-DC"})
    assert switch_resp.status_code == 200
    assert switch_resp.json()["active_tenant"]["currency"] == "USD"
    
    # Switch back to Amazon BLR1
    client.post("/api/tenants/switch", json={"tenant_id": "TENANT-AMZN-BLR1"})

def test_rbac_authorization_guard():
    # 1. Login as Security Guard
    guard_user = ENTERPRISE_USERS["guard@yardsight.corp"]
    guard_token = create_access_token(guard_user)
    
    # 2. Try to generate an E-Way Bill as Security Guard (Should be 403 Forbidden)
    resp_forbidden = client.post(
        "/api/documents/generate",
        json={"truck_id": "TRK-8821", "doc_type": "GST_EWAY_BILL"},
        headers={"Authorization": f"Bearer {guard_token}"}
    )
    assert resp_forbidden.status_code == 403
    assert "Access denied" in resp_forbidden.json()["detail"]
    
    # 3. Login as Corporate Admin
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    
    # 4. Generate E-Way Bill as Corporate Admin (Should be 200 OK)
    resp_ok = client.post(
        "/api/documents/generate",
        json={"truck_id": "TRK-8821", "doc_type": "GST_EWAY_BILL"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["authorized_role"] == "corporate_admin"
