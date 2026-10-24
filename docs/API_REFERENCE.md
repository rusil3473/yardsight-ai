# YardSight AI — Enterprise API Reference Manual

**API Version:** v1.0.0 (FastAPI Standards Compliant)  
**Base REST URL:** `http://127.0.0.1:8001/api`  
**Base WebSocket URL:** `ws://127.0.0.1:8001/api`  
**WebRTC Gateway:** `http://127.0.0.1:1984` (Signaling) / UDP `8555` (Media)

---

## 1. Global Request Headers & Authentication

All API endpoints enforce multi-tenant isolation and optional RBAC authorization:

| Header Name | Type | Description | Default |
| :--- | :--- | :--- | :--- |
| `X-Tenant-ID` | String | Organization tenant context | `TENANT-MY-HUB` |
| `Authorization` | String | Bearer JWT token (`Bearer <token>`) | Optional in dev |
| `Content-Type` | String | MIME type for payload serialization | `application/json` |

---

## 2. Camera & Video Streaming Endpoints

### 2.1 List Configured Cameras
`GET /cameras`

Retrieves all camera feeds provisioned for the current tenant.

**Query Parameters:**
- `tenant_id` *(string, optional)*: Filter by tenant ID (defaults to active tenant).

**Response (200 OK):**
```json
{
  "total": 32,
  "cameras": [
    {
      "id": "CAM-01",
      "name": "Gate 01 Inbound ANPR & Optical Inspection",
      "stream_type": "DMSS",
      "location": "Inbound Gate 01 - South Portal",
      "status": "ONLINE",
      "fps": 30,
      "resolution": "1080p (1920x1080)",
      "stream_url": "rtsp://127.0.0.1:1554/cam/realmonitor?channel=1&subtype=1",
      "ai_pipeline": "ANPR_OCR",
      "dmss_serial": "BE124E0PCA95532",
      "dmss_channel": 1
    }
  ]
}
```

---

### 2.2 Register New Camera
`POST /cameras`

Registers a new RTSP, DMSS, or WebRTC camera stream.

**Request Body:**
```json
{
  "name": "Gate North Two-Wheeler Lane",
  "location": "Weighbridge North Zone",
  "stream_type": "RTSP",
  "stream_url": "rtsp://admin:pass@192.168.1.108:554/cam/realmonitor?channel=1&subtype=0",
  "ai_pipeline": "ANPR_OCR",
  "resolution": "1080p (1920x1080)",
  "fps": 30,
  "tenant_id": "TENANT-MY-HUB"
}
```

**Response (201 Created):** Returns the persisted `CameraFeed` object with assigned `id`.

---

### 2.3 Rename Camera Channel
`PATCH /cameras/{camera_id}`

Renames a camera channel. The new name is persisted in SQLite and immediately propagated.

**Path Parameters:**
- `camera_id` *(string)*: Camera identifier (e.g., `CAM-01`).

**Request Body:**
```json
{
  "name": "Gate 01 Inbound ANPR & Optical Inspection"
}
```

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "message": "Camera CAM-01 renamed to 'Gate 01 Inbound ANPR & Optical Inspection'",
  "camera": {
    "id": "CAM-01",
    "name": "Gate 01 Inbound ANPR & Optical Inspection"
  }
}
```

---

### 2.4 Flush Hardware Buffer (Lag Fix)
`POST /cameras/{camera_id}/refresh-buffer`

Releases the underlying OpenCV VideoCapture socket handle in `HardwareCapturePool`, dropping queued FFmpeg socket frames in **<15ms** and resynchronizing playback directly to the real-time edge.

**Path Parameters:**
- `camera_id` *(string)*: Camera identifier (e.g., `CAM-01`).

**Response (200 OK):**
```json
{
  "status": "BUFFER_FLUSHED",
  "camera_id": "CAM-01",
  "frames_dropped": 12,
  "latency_ms": 8.5,
  "message": "Hardware video buffer for CAM-01 flushed and synchronized to real-time edge.",
  "timestamp": 1792072925.904
}
```

---

### 2.5 WebRTC SDP Signaling Negotiation
`POST /cameras/{camera_id}/webrtc`

Exchanges WebRTC SDP Offer/Answer packets with the `go2rtc` gateway for sub-150ms video delivery over UDP.

**Query Parameters:**
- `subtype` *(integer, optional)*: Stream quality selector:
  - `1`: Dahua Substream (640×360 H.264) for matrix overview.
  - `0`: Dahua Mainstream (1080p H.264) for deep inspect modal.

**Request Headers:**
- `Content-Type: application/sdp`

**Request Body:** WebRTC Client SDP Offer (`v=0\r\no=- ...`).

**Response (200 OK):**
- `Content-Type: application/sdp`
- Body: WebRTC Server SDP Answer (`v=0\r\no=go2rtc ...`).

---

### 2.6 Dual-Plane WebSocket Video & Telemetry
`WS /cameras/{camera_id}/ws`

Dual-plane streaming endpoint delivering:
1. **Binary Frames**: Raw JPEG images streamed directly to `<canvas>` or `ImageBitmap`.
2. **JSON Telemetry Packets**: Interleaved every 3 frames (~8 Hz) containing bounding boxes, velocities, and labels.

**Sample JSON Telemetry Message:**
```json
{
  "type": "TELEMETRY",
  "camera_id": "CAM-01",
  "timestamp": 1792072925.12,
  "detections": [
    {
      "id": "TRK-101",
      "track_id": 101,
      "label": "MOTORCYCLE",
      "state": "MOVING",
      "velocity": 3.8,
      "confidence": 0.94,
      "bbox": { "x": 34.2, "y": 48.1, "w": 18.5, "h": 26.4 }
    }
  ]
}
```

---

### 2.7 Hardware Matrix Status
`GET /cameras/matrix/status`

Returns real-time connectivity status for all facility matrix cameras and Dahua master NVR.

**Response (200 OK):**
```json
{
  "nvr_online": true,
  "nvr_serial": "BE124E0PCA95532",
  "total_channels": 32,
  "cameras": {
    "CAM-01": {
      "camera_id": "CAM-01",
      "name": "Gate 01 Inbound ANPR & Optical Inspection",
      "device_sn": "BE124E0PCA95532",
      "channel": 1,
      "online": true,
      "status": "ONLINE"
    }
  }
}
```

---

## 3. NVR Provisioning & Auto-Discovery

### 3.1 Synchronize Multiplexed NVR Channels
`POST /cameras/nvr/sync-channels`

Provisions or updates multiplexed camera channels directly from the NVR serial number.

**Query Parameters:**
- `serial_number` *(string)*: Hardware serial number (e.g., `BE124E0PCA95532`).
- `total_channels` *(integer)*: Channel count (8, 16, 32, or 48).
- `nvr_name` *(string, optional)*: Human-friendly name.

**Response (200 OK):**
```json
{
  "status": "SUCCESS",
  "nvr_serial": "BE124E0PCA95532",
  "total_channels": 32,
  "message": "Auto-synchronized 32 multiplexed video channels for Dahua NVR BE124E0PCA95532."
}
```

---

## 4. Nimbus Autonomous Intelligence API

### 4.1 Get Operational Context & ANPR Manifest
`GET /nimbus/context`

Fetches real-time multimodal intelligence context including logged vehicles and production metrics.

**Response (200 OK):**
```json
{
  "facility": "Godown Operations Hub",
  "vehicles": [
    {
      "plate": "MH 14 DV 3105",
      "carrier": "Verified Yard Logistics Commercial Carrier",
      "vehicle_type": "Commercial Freight Carrier",
      "gate": "Gate 01 Inbound",
      "direction": "INBOUND",
      "timestamp": "07:16 PM IST",
      "status": "AUTHORIZED",
      "cargo": "Commercial Biomass / Godown Raw Material",
      "confidence": 0.98,
      "hsrp_verified": true
    }
  ],
  "production": {
    "facility_name": "Biomass Compaction Line 01",
    "units_per_minute": 48.5,
    "total_briquettes_today": 3460,
    "extruder_power_kw": 38.4,
    "die_temp_c": 68.2,
    "debris_rejected_count": 142
  }
}
```

---

### 4.2 Query Nimbus Copilot
`POST /nimbus/query`

Submits an operational natural-language query to the reasoning engine.

**Request Body:**
```json
{
  "prompt": "Which license plates arrived today and are there any safety hazards?",
  "camera_id": "CAM-01"
}
```

**Response (200 OK):**
```json
{
  "role": "assistant",
  "content": "**Nimbus Gate Logistics & Safety Audit:**\n• 9 commercial carriers logged at Gate 01/02.\n• Zero safety perimeter breaches observed.\n• Briquette line running at 48.5 UPM.",
  "referenced_camera_id": "CAM-01",
  "timestamp": "2026-10-15T19:32:00+05:30",
  "confidence": 0.98
}
```
