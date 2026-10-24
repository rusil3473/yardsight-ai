"""
YardSight AI - Comprehensive RESTful Camera & NVR CRUD Test Suite.
Validates:
1. Dynamic Camera Registration (DMSS P2P, WebRTC, RTSP).
2. GET, PATCH, PUT, and DELETE operations for individual cameras.
3. NVR auto-discovery, listing, and bulk NVR deletion.
4. Edge cases & error handling (404 Not Found, 422 Unprocessable Entity).
"""

import pytest
from fastapi.testclient import TestClient
from app import app
from database import SessionLocal
from models import CCTVCamera
from seed_data import purge_all_demo_data
from tests.fixtures.yardsight_demo_seed import seed_enterprise_data

client = TestClient(app)

@pytest.fixture(autouse=True, scope="module")
def setup_and_teardown_test_fixtures():
    db = SessionLocal()
    try:
        seed_enterprise_data(db)
        yield
    finally:
        purge_all_demo_data(db)
        db.close()


def test_create_and_delete_dmss_camera():
    """Validates creating a camera via Dahua DMSS P2P serial number and channel index."""
    payload = {
        "name": "Gate North Two-Wheeler Portal",
        "location": "Facility Zone GATE-N1",
        "stream_type": "DMSS",
        "dmss_serial": "AG07AA7PCA3D3B6",
        "dmss_channel": 3,
        "dmss_username": "admin",
        "dmss_password": "Shri@21*",
        "ai_pipeline": "ANPR_OCR",
        "tenant_id": "TENANT-MY-HUB"
    }
    resp = client.post("/api/cameras", json=payload)
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "success"
    cam = data["camera"]
    cam_id = cam["id"]
    assert cam["dmss_serial"] == "AG07AA7PCA3D3B6"
    assert cam["dmss_channel"] == 3
    assert "1554" in cam["stream_url"] or "realmonitor" in cam["stream_url"]

    # Retrieve camera
    get_resp = client.get(f"/api/cameras/{cam_id}")
    assert get_resp.status_code == 200
    assert get_resp.json()["camera"]["id"] == cam_id

    # Update camera (PATCH)
    patch_resp = client.patch(f"/api/cameras/{cam_id}", json={"name": "Gate North Renamed Lane", "ai_pipeline": "PPE_SAFETY"})
    assert patch_resp.status_code == 200
    assert patch_resp.json()["camera"]["name"] == "Gate North Renamed Lane"
    assert patch_resp.json()["camera"]["ai_pipeline"] == "PPE_SAFETY"

    # Delete camera (DELETE)
    del_resp = client.delete(f"/api/cameras/{cam_id}")
    assert del_resp.status_code == 200
    assert del_resp.json()["status"] == "DELETED"

    # Verify 404 after deletion
    verify_resp = client.get(f"/api/cameras/{cam_id}")
    assert verify_resp.status_code == 404


def test_create_webrtc_camera():
    """Validates registering a low-latency WebRTC stream camera."""
    payload = {
        "name": "Weighbridge WebRTC Low-Latency",
        "location": "Facility Zone WEIGHBRIDGE-01",
        "stream_type": "WEBRTC",
        "stream_url": "http://127.0.0.1:1984/api/webrtc?src=ipc_live",
        "ai_pipeline": "MOTION_TRACKING",
        "tenant_id": "TENANT-MY-HUB"
    }
    resp = client.post("/api/cameras", json=payload)
    assert resp.status_code == 200
    cam = resp.json()["camera"]
    cam_id = cam["id"]
    assert cam["stream_type"] == "WEBRTC"
    assert "ipc_live" in cam["stream_url"]

    # Clean up
    client.delete(f"/api/cameras/{cam_id}")


def test_create_rtsp_camera():
    """Validates registering a direct hardware RTSP camera stream."""
    payload = {
        "name": "Perimeter Wall Thermal RTSP",
        "location": "Facility Zone PERIMETER-EAST",
        "stream_type": "RTSP",
        "stream_url": "rtsp://admin:pass@192.168.1.120:554/cam/realmonitor?channel=1&subtype=1",
        "ai_pipeline": "PERIMETER_BREACH",
        "tenant_id": "TENANT-MY-HUB"
    }
    resp = client.post("/api/cameras", json=payload)
    assert resp.status_code == 200
    cam = resp.json()["camera"]
    cam_id = cam["id"]
    assert cam["stream_type"] == "RTSP"
    assert "192.168.1.120" in cam["stream_url"]

    # Clean up
    client.delete(f"/api/cameras/{cam_id}")


def test_nvr_list_and_bulk_delete():
    """Validates NVR channel grouping and bulk NVR deletion."""
    # 1. Sync 4 channels for a test NVR
    test_sn = "TESTNVR998877"
    sync_resp = client.post(f"/api/cameras/nvr/sync-channels?serial_number={test_sn}&total_channels=4&nvr_name=TestNVR")
    assert sync_resp.status_code == 200
    assert sync_resp.json()["total_channels"] == 4

    # 2. List NVRs and verify test NVR appears
    list_resp = client.get("/api/cameras/nvr/list")
    assert list_resp.status_code == 200
    nvrs = list_resp.json()["nvrs"]
    target = next((n for n in nvrs if n["serial_number"] == test_sn), None)
    assert target is not None
    assert target["channel_count"] == 4

    # 3. Bulk delete NVR and its channels
    del_nvr_resp = client.delete(f"/api/cameras/nvr/{test_sn}")
    assert del_nvr_resp.status_code == 200
    del_data = del_nvr_resp.json()
    assert del_data["status"] == "DELETED"
    assert del_data["deleted_channels_count"] == 4

    # 4. Deleting already-deleted NVR should return 404
    err_resp = client.delete(f"/api/cameras/nvr/{test_sn}")
    assert err_resp.status_code == 404


def test_camera_edge_cases():
    """Validates 404 and 422 HTTP edge cases for camera endpoints."""
    # 1. 404 on non-existent camera GET
    assert client.get("/api/cameras/CAM-NONEXISTENT").status_code == 404

    # 2. 404 on non-existent camera PATCH
    assert client.patch("/api/cameras/CAM-NONEXISTENT", json={"name": "Ghost"}).status_code == 404

    # 3. 404 on non-existent camera DELETE
    assert client.delete("/api/cameras/CAM-NONEXISTENT").status_code == 404

    # 4. 422 on invalid camera creation (missing required fields)
    assert client.post("/api/cameras", json={"invalid_field": 123}).status_code == 422


def test_lightweight_nvr_channel_verification():
    """Validates testing all NVR channels in lightweight mode without OpenCV AI overhead."""
    resp = client.get("/api/cameras/nvr/test-channels?serial_number=BE124E0PCA95532&total_channels=8")
    assert resp.status_code == 200
    data = resp.json()
    assert data["status"] == "SUCCESS"
    assert data["nvr_serial"] == "BE124E0PCA95532"
    assert data["opencv_ai_mode"] == "PAUSED_LIGHTWEIGHT"
    assert data["cpu_ram_impact"] == "ZERO_EXHAUSTION"
    assert len(data["channels"]) == 8
    assert data["channels"][0]["channel"] == 1
    assert "stream_url" in data["channels"][0]
