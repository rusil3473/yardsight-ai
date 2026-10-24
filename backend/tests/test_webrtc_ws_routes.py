"""
Unit Test: WebRTC Gateway & WebSocket Camera Endpoints
Validates:
1. GET /api/cameras/webrtc/status returns active go2rtc status.
2. GET /api/nimbus/context returns structured operational context.
3. POST /api/nimbus/chat responds with 200 OK and synthesized reasoning.
"""

from fastapi.testclient import TestClient
from app import app

client = TestClient(app)

def test_webrtc_status_endpoint():
    resp = client.get("/api/cameras/webrtc/status")
    assert resp.status_code == 200
    data = resp.json()
    assert "available" in data
    assert "version" in data

def test_nimbus_api_context():
    resp = client.get("/api/nimbus/context")
    assert resp.status_code == 200
    data = resp.json()
    assert "vehicles" in data
    assert "production" in data

def test_nimbus_api_chat():
    resp = client.post("/api/nimbus/chat", json={
        "prompt": "Check briquette production and worker safety",
        "camera_id": "CAM-02"
    })
    assert resp.status_code == 200
    data = resp.json()
    assert "content" in data
    assert data["role"] == "assistant"

def test_webrtc_negotiation_endpoint_fallback():
    """Validates that POST /api/cameras/{id}/webrtc returns 200 with fallback data when stream is in standby."""
    resp = client.post(
        "/api/cameras/CAM-09/webrtc?subtype=0",
        content="v=0\r\no=- 0 0 IN IP4 127.0.0.1\r\ns=-\r\nt=0 0\r\n",
        headers={"Content-Type": "application/sdp"}
    )
    assert resp.status_code == 200
    # Either SDP answer or graceful fallback JSON
    if resp.headers.get("content-type") == "application/json":
        data = resp.json()
        assert data.get("fallback") is True
        assert data.get("camera_id") == "CAM-09"
    else:
        assert "v=0" in resp.text
