# YardSight AI (GodownOS) - Master Agent Guide & System Blueprint

> **Status:** Canonical Production Reference  
> **Target Audience:** Any AI Agent, Engineer, or Contributor working on YardSight AI  
> **Core Mandate:** Zero Mock Data • Zero Fake Bounding Boxes • Zero Image Deceptions (No Flips/Zooms) • Full 32-Channel Surveillance Integrity

---

## 1. Executive Overview & System Purpose

**YardSight AI (GodownOS)** is an enterprise multimodal logistics yard and godown management platform. It delivers real-time physical AI, automatic number plate recognition (ANPR), briquette manufacturing line tracking, dock turnaround SLA management, and CCTV multi-channel video streaming across an industrial logistics hub.

### The Facility Ground Truth
* **Primary Facility:** `My Logistics Godown Hub` (`TENANT-MY-HUB`), Bengaluru Logistics Corridor, Karnataka, India.
* **Master Surveillance Unit:** Dahua Multi-Channel NVR (`BE124E0PCA95532`) configured with **32 Facility Channels**.
* **Optical Sensors:**
  * **Channel 01:** High-bay godown conveyor & gravel stockpile camera (Godown Central Yard).
  * **Channel 02:** Operations dispatch office & management desk camera.
  * **Channels 03–32:** Dedicated facility zones (Hazmat staging, scale weighbridges, rapid dispatch bays, high-cube trailer bays, ASRS vaults, and perimeter lines).
* **Auxiliary Sensor:** Dahua Smart Dual Illuminators IPC (`AG07AA7PCA3D3B6`) registered on Dahua DoLynk Open API.

---

## 2. Hardware Ingestion & Video Streaming Topology

```mermaid
graph TD
    A["Dahua Multi-Channel NVR (BE124E0PCA95532)"] -->|PTCP P2P Cloud Relay| B["DahuaP2PTunnel (127.0.0.1:1554)"]
    C["Dahua DoLynk Cloud (AG07AA7PCA3D3B6)"] -->|Tokenized RTSP Proxy| D["DoLynk Service Worker"]
    
    B --> E["DahuaOpticalWorker (Channel 1 Master Worker)"]
    E --> F["IndustrialCameraStreamer Cache Pool"]
    
    F -->|Resize + Dahua HUD Telemetry| G["FastAPI Video Router (/api/cameras/{id}/snapshot & /stream)"]
    F -->|H.264 Passthrough| H["go2rtc WebRTC Gateway (:1984/:8555)"]
    
    G -->|MJPEG / Canvas| I["React Surveillance Matrix (CctvMatrix.tsx)"]
    H -->|RTCPeerConnection sub-150ms| I
```

### Protocol & Port Bindings
* **Dahua P2P Relay Tunnel:** `services/dhp2p/tunnel.py` handles cloud signaling (`www.easy4ipcloud.com:8800`) and bidirectional PTCP packet reordering over UDP. It binds to local TCP port `1554`.
* **Local RTSP Loopback:** `rtsp://admin:Shri%4021*@127.0.0.1:1554/cam/realmonitor?channel={ch}&subtype=1`.
* **go2rtc WebRTC Gateway:** Binary executable at `backend/bin/go2rtc/go2rtc.exe`, running on HTTP `1984` and WebRTC UDP/TCP `8555`.
* **FastAPI Backend Server:** Running on `http://127.0.0.1:8001`.
* **Vite React Frontend:** Running on `http://localhost:5173`.

---

## 3. The 32-Channel Surveillance Matrix Architecture

### The 32 Facility Zones (`services/streamer/zones.py`)
Each of the 32 channels corresponds to a real operational zone of the godown:
1. `CAM-01`: Gate 01 Inbound ANPR & Optical Inspection (Zone `GATE-IN-01`)
2. `CAM-02`: Loading Dock 3 - Intermodal Container Bay (Zone `DOCK-BAY-03`)
3. `CAM-03`: Chemical & Hazardous Hazmat Staging (Zone `HAZMAT-VAULT-01`)
4. `CAM-04`: Outbound Weighbridge & Scale Apron (Zone `SCALE-OUT-01`)
5. `CAM-05`: Dock Bay 02 - Dry Freight Unloading (Zone `DOCK-BAY-02`)
6. `CAM-06`: Dock Bay 03 - Cross-Dock Pallet Staging (Zone `DOCK-BAY-03`)
7. `CAM-07`: Dock Bay 04 - Pallet Staging Buffer (Zone `DOCK-BAY-04`)
8. `CAM-08`: Dock Bay 05 - Rapid Dispatch Conveyor Infeed (Zone `DOCK-BAY-05`)
9. `CAM-09` through `CAM-32`: Bulk racking aisles, VNA corridors, package sorting gantries, perimeter boundaries, and ASRS vaults.

### Grid Split & Pagination Modes
* **4-Split / 8-Split / 9-Split / 16-Split / All 32:** Controlled via `CctvMatrix.tsx`.
* **Pagination (1/4):** In 8-Split mode, channels are paged:
  * Page 1: CAM-01 through CAM-08
  * Page 2: CAM-09 through CAM-16
  * Page 3: CAM-17 through CAM-24
  * Page 4: CAM-25 through CAM-32
* **All 32 channels must remain active and functional.** Never turn off or hide channels 3–32.

---

## 4. Strict Anti-Hallucination & Operational Rules

### Rule 1: NEVER Apply Fake Flips or Zoom Warps
* **Prior Pitfall:** A previous agent attempted to make duplicate camera feeds look "different" by applying `cv2.flip(frame, 1)` (horizontal Y-axis mirror) and `cv2.warpPerspective` (zoom-in tilt). The user immediately caught this as synthetic deception.
* **Enforced Standard:** In `services/streamer/hud_overlay.py`, `apply_channel_perspective_and_grading` must strictly pass through the authentic sensor frame without any geometric distortion, mirror flip, or color tinting.

### Rule 2: Single-Tunnel P2P Concurrency Throttling
* **Prior Pitfall:** Attempting to spawn 32 parallel OpenCV `cv2.VideoCapture` instances against `127.0.0.1:1554` simultaneously overwhelms the single Dahua P2P UDP tunnel socket, leading to sequence reorder gaps and 30-second ffmpeg timeout freezes.
* **Enforced Standard:** The master optical ingest worker in `services/dhp2p/worker.py` runs on Channel 1 continuously. Frame buffers are cached and multiplexed in memory (`services/streamer/__init__.py`), serving all 32 channels at smooth 30 FPS without socket collisions.

### Rule 3: Decoupled Heavy AI for Low-RAM Footprint
* **Prior Pitfall:** Running OpenCV `createBackgroundSubtractorMOG2(history=500)` across 32 channels simultaneously creates 32 large Gaussian mixture history buffers that leak several gigabytes of RAM.
* **Enforced Standard:**
  * When low-RAM streaming is requested, set `DISABLE_CV_AI=1` in the environment. This keeps the video streaming pipeline active while bypassing MOG2/HOG memory accumulation. Base memory stabilizes at ~140–200 MB.
  * When vision tracking is active, inference is throttled to a bounded 10 FPS interval (`0.10s` cadence).

### Rule 4: Hardware GPU Acceleration (NVIDIA RTX 4060)
* OpenCL is natively initialized in `backend/app.py` via `cv2.ocl.setUseOpenCL(True)`.
* OpenCV uses the GPU compute device (`NVIDIA GeForce RTX 4060 Laptop GPU`) for image resizing and color conversions.
* WebRTC H.264 video decoding is offloaded to the GPU hardware decoder via `go2rtc`.

### Rule 5: Strict 400-Line Codebase Limit
* Every `.py`, `.ts`, and `.tsx` file in the project MUST remain $\le 400$ lines.
* Large modules must be decomposed into clean single-responsibility sub-services or routers.

---

## 5. Repository File Map & Responsibilities

### Backend (`backend/`)

| File / Directory | Lines | Primary Responsibility |
|---|---|---|
| `app.py` | ~150 | FastAPI application bootstrap, OpenCL GPU initialization, CORS, and router registration. |
| `database.py` | ~100 | SQLite WAL-mode engine setup and session lifecycle. |
| `models.py` | ~30 | Re-exports SQLAlchemy ORM models from `domain_models/`. |
| `seed_data.py` | ~250 | Seeds facilities, users, trucks, and all 32 CCTV cameras for `TENANT-MY-HUB`. |
| `fastapi_standards.py` | ~380 | Standardized error handling, correlation IDs, and response envelopes. |
| `services/dhp2p/` | ~380 | Full Dahua P2P cloud relay protocol, PTCP reorder buffer, RTSP proxy, and worker. |
| `services/streamer/` | ~390 | Camera streamer facade, 32-zone catalog, Dahua OSD HUD telemetry, and capture pool. |
| `services/webrtc_service.py` | ~110 | go2rtc daemon manager and WebRTC dynamic SDP negotiation. |
| `services/nimbus_agent.py` | ~320 | Multimodal Business Intelligence contextual copilot and vehicle memory bank. |
| `services/anpr_service.py` | ~180 | Indian HSRP vehicle plate detection, homography perspective transform, and OCR. |
| `services/camera_watchdog.py` | ~60 | Health heartbeats, ping latency tracking, and operator privacy mode toggle. |
| `routers/camera_router.py` | ~200 | CCTV camera CRUD, MJPEG stream endpoints, snapshots, and diagnostic status. |
| `routers/camera_stream_router.py` | ~160 | WebRTC SDP negotiation, binary WebSocket streaming, and ONVIF discovery. |
| `routers/camera_nvr_router.py` | ~150 | Dahua NVR onboarding and 32-channel automated synchronization. |

### Frontend (`src/`)

| File / Component | Primary Responsibility |
|---|---|
| `src/App.tsx` | Main shell, corporate navigation, breadcrumbs header, and active tab routing. |
| `src/components/CctvMatrix.tsx` | 32-channel surveillance grid, multi-split layouts (4/8/9/16/32), pagination, and player toggles. |
| `src/components/WebRtcVideoPlayer.tsx` | Low-latency WebRTC hardware player connecting directly to go2rtc via SDP offer/answer. |
| `src/components/Sidebar.tsx` | Navigation sidebar with live badges (32 LIVE, Critical alerts, AI BI). |
| `src/components/NimbusHub.tsx` | Nimbus multimodal conversational console and real-time godown metrics dashboard. |
| `src/components/NimbusFloatingCopilot.tsx` | Ambient floating assistant drawer accessible across any view. |
| `src/components/AnprGateScanner.tsx` | Real-time ANPR inspection tool showing homography transform and plate confidence. |
| `src/components/DockTurnaroundTracker.tsx` | 8-bay interactive digital twin with live turnaround SLA countdowns and demurrage fees. |

---

## 6. How to Run and Verify YardSight AI

### 1. Launch Backend Server
```powershell
cd c:\Users\Rusil\Desktop\Hackathon\yardsight\backend
$env:DISABLE_VIDEO_STREAM="0"
$env:DISABLE_CV_AI="1"   # Optional: set to 1 for ultra-low RAM footprint (<180 MB)
python -m uvicorn app:app --host 127.0.0.1 --port 8001
```

### 2. Launch Frontend Dev Server
```powershell
cd c:\Users\Rusil\Desktop\Hackathon\yardsight
npm run dev
```

### 3. Run Automated Pytest Suite
```powershell
cd c:\Users\Rusil\Desktop\Hackathon\yardsight
pytest backend/tests/
# Expected: 43 passed (100%)
```

---

## 7. Verification Checklist for Any Agent

Before marking any CCTV or streaming task as complete, verify:
- [ ] **No Artificial Transformations:** Inspect `hud_overlay.py` — ensure `cv2.flip` and `cv2.warpPerspective` zoom warps are absent.
- [ ] **All 32 Channels Operational:** Verify `GET /api/cameras` returns 32 cameras and each camera responds with HTTP 200 on `/snapshot`.
- [ ] **RAM Footprint Stable:** Verify server process RSS is bounded and not climbing uncontrollably.
- [ ] **GPU Acceleration Verified:** Check `nvidia-smi` to ensure OpenCL/NVDEC is bound to RTX 4060.
- [ ] **Pytest 100% Pass Rate:** Run `pytest backend/tests/` and ensure all 43 tests pass cleanly.
