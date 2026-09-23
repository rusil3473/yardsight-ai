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
        json={"truck_id": "TRK-9041", "doc_type": "GST_EWAY_BILL"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert resp_ok.status_code == 200
    assert resp_ok.json()["authorized_role"] == "corporate_admin"

def test_database_persistence():
    # 1. Verify health endpoint reports SQLite WAL persistence
    health_resp = client.get("/api/health")
    assert health_resp.status_code == 200
    db_info = health_resp.json()["database"]
    assert "SQLite" in db_info["engine"]
    assert db_info["stats"]["tenants"] >= 3
    assert db_info["stats"]["users"] >= 3

    # 2. Test profile update persistence
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    update_resp = client.put(
        "/api/user/profile",
        json={"name": "Vikramaditya Singhania (VP)", "email": "admin@yardsight.corp", "phone": "+91-99999-88888"},
        headers={"Authorization": f"Bearer {admin_token}"}
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["user"]["name"] == "Vikramaditya Singhania (VP)"

    # 3. Test document list from SQLite
    docs_resp = client.get("/api/documents/list")
    assert docs_resp.status_code == 200
    docs = docs_resp.json()["documents"]
    assert len(docs) >= 1

def test_cameras_crud_and_dmss():
    admin_user = ENTERPRISE_USERS["admin@yardsight.corp"]
    admin_token = create_access_token(admin_user)
    headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Multi-tenant cameras dynamic isolation
    amzn_cams = client.get("/api/cameras?tenant_id=TENANT-AMZN-BLR1").json()
    initial_count = amzn_cams["count"]
    assert initial_count >= 4
    assert any("Gate North" in c["name"] for c in amzn_cams["cameras"])

    fk_cams = client.get("/api/cameras?tenant_id=TENANT-FK-BHW1").json()
    assert fk_cams["count"] == 3
    assert any("Bhiwandi Gate 1" in c["name"] for c in fk_cams["cameras"])

    dfw_cams = client.get("/api/cameras?tenant_id=TENANT-US-DFW").json()
    assert dfw_cams["count"] == 8
    assert any("Intermodal" in c["name"] for c in dfw_cams["cameras"])

    # 2. Test Stream Connection (Dahua DMSS)
    test_stream_resp = client.post(
        "/api/cameras/test-stream",
        json={"stream_type": "DMSS", "dmss_serial": "DH-98410291-BLR", "dmss_channel": 2}
    )
    assert test_stream_resp.status_code == 200
    assert test_stream_resp.json()["connected"] is True
    assert test_stream_resp.json()["p2p_status"] == "ONLINE"

    # 3. Add new DMSS Camera
    new_cam_payload = {
        "name": "Bay 09 DMSS Dahua PTZ",
        "tenant_id": "TENANT-AMZN-BLR1",
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

    # Verify count increased by 1
    amzn_after_add = client.get("/api/cameras?tenant_id=TENANT-AMZN-BLR1").json()
    assert amzn_after_add["count"] == initial_count + 1

    # 4. Update Camera
    update_resp = client.put(
        f"/api/cameras/{cam_id}",
        json={"name": "Bay 09 DMSS PTZ (Updated)", "status": "ONLINE", "fps": 60},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["camera"]["name"] == "Bay 09 DMSS PTZ (Updated)"
    assert update_resp.json()["camera"]["fps"] == 60

    # 5. Delete Camera
    del_resp = client.delete(f"/api/cameras/{cam_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json()["deleted_camera_id"] == cam_id

    # Verify count restored to initial_count
    amzn_after_del = client.get("/api/cameras?tenant_id=TENANT-AMZN-BLR1").json()
    assert amzn_after_del["count"] == initial_count

def test_multi_facility_trucks_and_documents_crud():
    token = create_access_token(ENTERPRISE_USERS["admin@yardsight.corp"])
    headers = {"Authorization": f"Bearer {token}"}

    # 1. Multi-facility trucks dynamic isolation
    amzn_trucks = client.get("/api/dwell/trucks?tenant_id=TENANT-AMZN-BLR1").json()
    assert len(amzn_trucks) >= 4
    assert any("Tata Logistics" in t["carrier_name"] for t in amzn_trucks)

    fk_trucks = client.get("/api/dwell/trucks?tenant_id=TENANT-FK-BHW1").json()
    assert len(fk_trucks) >= 3
    assert any("Gati-KWE" in t["carrier_name"] or "Safexpress" in t["carrier_name"] for t in fk_trucks)

    dfw_trucks = client.get("/api/dwell/trucks?tenant_id=TENANT-US-DFW").json()
    assert len(dfw_trucks) >= 4
    assert any("Swift Transportation" in t["carrier_name"] or "Schneider" in t["carrier_name"] for t in dfw_trucks)

    # 2. Add / Check-in new truck
    new_truck_payload = {
        "plate_number": "KA-51-MM-8844",
        "carrier_name": "FedEx Express Surface",
        "driver_name": "Anil Kumar",
        "driver_phone": "+91-98765-99887",
        "dock_number": "Dock 07",
        "status": "INBOUND",
        "cargo_desc": "15 Pallets High-Tech Components",
        "tenant_id": "TENANT-AMZN-BLR1",
        "country": "IN"
    }
    create_resp = client.post("/api/trucks", json=new_truck_payload, headers=headers)
    assert create_resp.status_code == 200
    created_trk = create_resp.json()["truck"]
    assert created_trk["plate_number"] == "KA-51-MM-8844"
    truck_id = created_trk["id"]

    # 3. Update truck
    update_resp = client.put(
        f"/api/trucks/{truck_id}",
        json={"dock_number": "Dock 07 (Active)", "status": "AT_DOCK"},
        headers=headers
    )
    assert update_resp.status_code == 200
    assert update_resp.json()["truck"]["status"] == "AT_DOCK"
    assert update_resp.json()["truck"]["dock_number"] == "Dock 07 (Active)"

    # 4. Generate document for this truck
    doc_resp = client.post(
        "/api/documents/generate",
        json={"truck_id": truck_id, "doc_type": "GST_EWAY_BILL", "tenant_id": "TENANT-AMZN-BLR1"},
        headers=headers
    )
    assert doc_resp.status_code == 200
    doc_data = doc_resp.json()
    assert doc_data["type"] == "GST_EWAY_BILL"

    # 5. List documents filtered by tenant
    doc_list = client.get("/api/documents/list?tenant_id=TENANT-AMZN-BLR1").json()
    assert len(doc_list["documents"]) >= 1
    recent_doc = doc_list["documents"][0]

    # 6. Delete document
    del_doc_resp = client.delete(f"/api/documents/{recent_doc['id']}", headers=headers)
    assert del_doc_resp.status_code == 200

    # 7. Delete truck
    del_truck_resp = client.delete(f"/api/trucks/{truck_id}", headers=headers)
    assert del_truck_resp.status_code == 200

