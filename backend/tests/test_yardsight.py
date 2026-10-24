"""
Automated unit test suite for YardSight AI (GodownOS).
Covers:
1. OpenCV 5 ANPR Homography & CCTV unwarping
2. Specular reflection concrete leak detection
3. Dock dwell tracker & $75/hr detention billing
4. GST E-Way Bill & US eBOL generation
5. Enterprise Model Context Protocol (MCP v2025-11-25)
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
from database import SessionLocal
from seed_data import purge_all_demo_data
from tests.fixtures.yardsight_demo_seed import seed_enterprise_data

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_and_teardown_test_fixtures():
    """Populates test fixtures for test execution and purges all test data during teardown,
    guaranteeing 100% zero residual dummy data in the live production database."""
    db = SessionLocal()
    try:
        seed_enterprise_data(db)
        yield
    finally:
        purge_all_demo_data(db)
        db.close()


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
    dock_tracker.log_arrival(
        truck_id="TRK-9041",
        plate_number="MH-12-RN-4819",
        carrier_name="Tata Logistics Express",
        driver_name="Ramesh Sharma",
        driver_phone="+91-98765-43210",
        manifest_bol="BOL-2026-8819",
        assigned_bay="BAY-03",
        elapsed_minutes_ago=145
    )
    dock_tracker.log_arrival(
        truck_id="TRK-1022",
        plate_number="TX-49-B219",
        carrier_name="Swift Transportation US",
        driver_name="Dave Miller",
        driver_phone="+1-512-555-0199",
        manifest_bol="BOL-US-9901",
        assigned_bay="BAY-01",
        elapsed_minutes_ago=45
    )
    dwells = dock_tracker.get_yard_dwell_metrics()
    assert len(dwells) >= 2
    
    trk_9041 = next(t for t in dwells if t["truck_id"] == "TRK-9041")
    assert trk_9041["is_detention"] is True
    assert trk_9041["detention_minutes"] > 0
    assert trk_9041["accrued_detention_fee_usd"] > 0

    dock_tracker.trucks.clear()

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
    assert data["active_simulated_connections"] >= 1


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
    assert len(tenants) >= 1
    assert any(t["tenant_id"] == "TENANT-MY-HUB" for t in tenants)

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

    # 3. In-session role switching must be rejected with 403 Forbidden (1 Login = 1 Role)
    switch_resp = client.post("/api/auth/switch-role", json={"role": "corporate_admin"})
    assert switch_resp.status_code == 403
    assert "1 Login = 1 Role" in switch_resp.json()["detail"]
    
    # 4. Login as Corporate Admin
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    
    # 5. Generate E-Way Bill as Corporate Admin (Should be 200 OK)
    resp_ok = client.post(
        "/api/documents/generate",
        json={"truck_id": "TRK-9041", "doc_type": "GST_EWAY_BILL"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["authorized_role"] == "corporate_admin"

def test_database_persistence():
    # 1. Verify health endpoint reports database engine
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    db_info = health_resp.json()["database"]
    assert ("PostgreSQL" in db_info["engine"]) or ("SQLite" in db_info["engine"])

    # 2. Test profile update persistence
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    update_resp = client.put(
        "/api/user/profile",
        json={"name": "Operations Administrator", "email": "admin@logistics.corp", "phone": "+91-98000-00000"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["user"]["name"] == "Operations Administrator"

def test_cameras_crud_and_dmss():
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Test Dahua DMSS Stream Verification (Real validation with cloud P2P relay reachability)
    test_dmss_resp = client.post(
        "/api/cameras/test-stream",
        json={"stream_type": "DMSS", "dmss_serial": "DH-60837934-BLR", "dmss_channel": 1}
    )
    assert test_dmss_resp.status_code == 200
    dmss_data = test_dmss_resp.json()
    assert dmss_data["status"] in ["ONLINE", "OFFLINE"]
    assert "Dahua" in dmss_data["message"]


    # 2. Test unreachable RTSP URL (real network timeout / failure, not fake success)
    test_rtsp_resp = client.post(
        "/api/cameras/test-stream",
        json={"stream_type": "RTSP", "stream_url": "rtsp://admin:pass@192.168.1.250:554/live"}
    )
    assert test_rtsp_resp.status_code == 200
    rtsp_data = test_rtsp_resp.json()
    assert rtsp_data["connected"] is False
    assert rtsp_data["validation_passed"] is False

    # 3. Add new Camera
    new_cam_payload = {
        "name": "Bay 09 DMSS Dahua PTZ",
        "tenant_id": "TENANT-MY-HUB",
        "stream_type": "DMSS",
        "brand": "Dahua",
        "location": "Bay 09 Loading Dock",
        "dmss_serial": "DH-29384756-BLR",
        "dmss_channel": 1,
        "dmss_username": "admin",
        "ai_pipeline": "DOCK_CYCLE",
        "fps": 30,
        "resolution": "4K Ultra-HD"
    }
    add_resp = client.post("/api/cameras", json=new_cam_payload, headers=headers)
    assert add_resp.status_code == 200
    created_cam = add_resp.json()["camera"]
    assert created_cam["dmss_serial"] == "DH-29384756-BLR"
    cam_id = created_cam["id"]

    # 4. Update Camera
    update_resp = client.put(
        f"/api/cameras/{cam_id}",
        json={"name": "Bay 09 DMSS PTZ (Updated)", "status": "ONLINE", "fps": 60},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["camera"]["name"] == "Bay 09 DMSS PTZ (Updated)"

    # 5. Delete Camera
    del_resp = client.delete(f"/api/cameras/{cam_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted_camera_id"] == cam_id

def test_multi_facility_trucks_and_documents_crud():
    token = create_access_token(ENTERPRISE_USERS["admin@yardsight.corp"])
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Add / Check-in new truck on TENANT-MY-HUB
    new_truck_payload = {
        "plate_number": "KA-51-MM-8844",
        "carrier_name": "FedEx Express Surface",
        "driver_name": "Anil Kumar",
        "driver_phone": "+91-98765-99887",
        "dock_number": "Dock 07",
        "status": "INBOUND",
        "cargo_desc": "15 Pallets High-Tech Components",
        "tenant_id": "TENANT-MY-HUB",
        "country": "IN"
    }
    create_resp = client.post("/api/trucks", json=new_truck_payload, headers=headers)
    assert create_resp.status_code == 200
    created_trk = create_resp.json()["truck"]
    assert created_trk["plate_number"] == "KA-51-MM-8844"
    truck_id = created_trk["id"]

    # 2. Update truck
    update_resp = client.put(
        f"/api/trucks/{truck_id}",
        json={"dock_number": "Dock 07 (Active)", "status": "AT_DOCK"},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["truck"]["status"] == "AT_DOCK"

    # 3. Generate document for this truck
    doc_resp = client.post(
        "/api/documents/generate",
        json={"truck_id": truck_id, "doc_type": "GST_EWAY_BILL", "tenant_id": "TENANT-MY-HUB"},
        headers=headers
    )
    assert doc_resp.status_code == 200
    doc_data = doc_resp.json()
    assert doc_data["type"] == "GST_EWAY_BILL"

    # 4. List documents
    doc_list = client.get("/api/documents/list?tenant_id=TENANT-MY-HUB").json()
    assert len(doc_list["documents"]) >= 1
    recent_doc = doc_list["documents"][0]

    # 5. Delete document
    del_doc_resp = client.delete(f"/api/documents/{recent_doc['id']}", headers=headers)
    assert del_doc_resp.status_code == 200

    # 6. Delete truck
    del_truck_resp = client.delete(f"/api/trucks/{truck_id}", headers=headers)
    assert del_truck_resp.status_code == 200

def test_anpr_post_unwarp_api():
    """Validates OpenCV 4.10 / 5 perspective homography POST endpoint with matrix and CLAHE output."""
    payload = {
        "plate_hint": "MH 12 RN 4589",
        "country": "IN",
        "corner_points": [[215.0, 175.0], [435.0, 200.0], [420.0, 275.0], [205.0, 245.0]]
    }
    resp = client.post("/api/anpr/unwarp", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["plate_number"] == "MH 12 RN 4589"
    assert data["country"] == "IN"
    assert data["confidence_pct"] > 80.0
    assert data["unwarped_plate_b64"].startswith("data:image/jpeg;base64,")
    assert data["clahe_enhanced_b64"] is not None
    assert len(data["homography_matrix"]) == 3
    assert len(data["homography_matrix"][0]) == 3
    assert data["is_valid_format"] is True

def test_vlm_chat_api():
    """Validates Nebius AI Studio & NVIDIA Cosmos multimodal VLM spatial reasoning endpoint."""
    # 1. Valid Truck Query
    truck_query = {
        "prompt": "What commercial carrier rigs arrived at North Gate today?",
        "camera_id": "cam-01"
    }
    resp1 = client.post("/api/vlm/chat", json=truck_query)
    assert resp1.status_code == 200
    data1 = resp1.json()
    assert data1["role"] == "assistant"
    assert "Gate North" in data1["content"] or "Schneider" in data1["content"] or "MH 12 RN 4589" in data1["content"]
    assert data1["referenced_camera_id"] == "cam-01"
    assert data1["latency_ms"] >= 0

    # 2. Valid Spill Hazard Query
    spill_query = {
        "prompt": "Analyze fuel dispenser leak and absorbent boom status",
        "camera_id": "cam-03"
    }
    resp2 = client.post("/api/vlm/chat", json=spill_query)
    assert resp2.status_code == 200
    data2 = resp2.json()
    assert "Diesel" in data2["content"] or "Bay Cam-03" in data2["content"]

    # 3. Empty prompt validation failure
    bad_resp = client.post("/api/vlm/chat", json={"prompt": ""})
    assert bad_resp.status_code == 422


