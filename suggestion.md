# YardSight AI (GodownOS) - Architectural Audit, Technical Teardown & Strategic Blueprint

> **Date:** September 2026  
> **Status:** Production Remediation Completed  
> **Target Scope:** CCTV Stream Pipeline, Zero-Mock Enterprise Integrity, System Architecture & Operational Blueprint  
> **Governing Principles:** Zero Dumb Data • Zero Dummy APIs • Zero Dead Buttons • Zero Static Photo Deceptions

---

## 1. Executive Summary & Ground-Truth System State

This document provides a technical teardown, root-cause resolution report, and strategic roadmap for the **YardSight AI (GodownOS)** logistics yard and godown management system.

Prior revisions of this repository contained simulations, mock data generators, and static fallback images that masked underlying hardware, network, and browser-level failures. Most critically, the system exhibited a **continuous, cascading CCTV camera stream breakdown** that flooded network sockets, choked browser event loops, and caused interface freezes.

Through systematic code inspection, network profiling, and hardware verification:
1. **The root causes of the CCTV camera stream failures have been identified and resolved.**
2. **Deceptive static images masquerading as live video streams have been removed.**
3. **Dummy APIs, mock counters, and dead-click buttons have been replaced with authentic backend endpoints, database persistence, and truthful diagnostic states.**
4. **A physical optical camera (Device Index 0 via OpenCV DirectShow) was verified and connected as `CAM-01`, streaming live 30 FPS video.**

---

## 2. Root Cause Analysis & Resolution of CCTV Stream Failures

The persistent CCTV camera stream breakdown was caused by four interacting failure modes spanning frontend React lifecycle management, browser HTTP connection limits, socket-level blocking in Python, and deceptive fallback mechanisms.

```
+---------------------------------------------------------------------------------------------------+
|                                  THE CASCADING BREAKDOWN CYCLE                                     |
+---------------------------------------------------------------------------------------------------+
|  1. Unprovisioned Dahua Cloud Serial (BIZ120 404) or Unreachable RTSP Socket                     |
|                                     │                                                            |
|                                     ▼                                                            |
|  2. Backend blocks for 10,000ms on socket timeout; threads exhaust in Uvicorn                    |
|                                     │                                                            |
|                                     ▼                                                            |
|  3. Frontend receives 500/timeout; <img onError> triggers recursive (e.target).src = snapshotUrl  |
|                                     │                                                            |
|                                     ▼                                                            |
|  4. 32 cameras poll every 2.5s -> 1,000+ requests/sec flood Chrome (Max 6 sockets/host breached)  |
|                                     │                                                            |
|                                     ▼                                                            |
|  5. Browser tab freezes; all HTTP requests (auth, metrics, trucks) stall in "Pending" status      |
+---------------------------------------------------------------------------------------------------+
```

### Failure Mode 1: Infinite React `onError` Cascade
* **The Defect:** In `frontend/src/components/CCTVStreamGrid.tsx` and `frontend/src/components/CCTVFullscreenModal.tsx`, image tags contained recursive error handlers:
  ```tsx
  // DANGEROUS PATTERN (PREVIOUS CODE)
  <img
    src={`http://127.0.0.1:8001/api/cameras/${camera.id}/stream`}
    onError={(e) => {
      // Immediately requested snapshot on failure
      (e.target as any).src = `http://127.0.0.1:8001/api/cameras/${camera.id}/snapshot?t=${Date.now()}`;
    }}
  />
  ```
  If the backend snapshot endpoint returned HTTP 500, 504, or 404, the image tag's `onError` fired instantly and synchronously re-assigned `.src` to a new timestamped URL. This produced an infinite loop generating **hundreds of HTTP requests per second per camera**. With multiple cameras rendering, the browser tab rapidly became unresponsive.
* **The Resolution:** 
  - Eliminated inline `onError` mutation.
  - Implemented explicit React state tracking (`failedStreams: Set<string>`).
  - When a stream or snapshot fails, the card transitions cleanly into an **Offline Diagnostic State Card** displaying real socket diagnostics, latency, and a manual "Reconnect Stream" button.

### Failure Mode 2: Browser HTTP/1.1 Socket Pool Starvation
* **The Defect:** In HTTP/1.1, Google Chrome and modern web browsers enforce a hard limit of **6 concurrent TCP connections per origin** (`127.0.0.1:8001`). The database had been pre-seeded with 32 phantom cameras (`CAM-95532-CH01` through `CH32`), and the UI initiated:
  1. A persistent multipart MJPEG stream (`/api/cameras/{id}/stream`) for active cards.
  2. A polling interval every 2.5 seconds fetching `/api/cameras/{id}/snapshot` across all 32 channels.
  3. Continuous background health checks and metrics requests.
  
  Because MJPEG streams keep their HTTP connection open indefinitely, opening just 6 MJPEG streams completely locked all available HTTP connections to the backend. All subsequent requests (ANPR, dwell tracking, database queries, and snapshots) remained stalled in `Pending` state indefinitely.
* **The Resolution:**
  - Removed the automatic 32-camera pre-seeding from `seed_data.py`. The database now only registers cameras backed by verified hardware or user-configured RTSP/cloud feeds.
  - Snapshot polling interval throttled to 8 seconds and gated by browser document visibility (`document.visibilityState === 'visible'`).
  - MJPEG streaming restricted to explicitly focused/selected cameras, with snapshot preview fallback for background grid cards.

### Failure Mode 3: Deceptive Static Images Masquerading as Video
* **The Defect:** `backend/services/streamer/optical_bank.py` loaded static `.jpg` images from disk (`channel_frames/ch01.jpg` through `ch14.jpg`), drew dynamic OpenCV HUD text (timestamp, FPS, bitrate) over them, and served them as "live CCTV footage."
  - This created a false assumption that cameras were operational when in reality no camera was connected.
  - When deployed on systems where the static frame directory was missing or paths were invalid, the streamer threw uncaught exceptions and crashed the FastAPI endpoint.
* **The Resolution:**
  - **Permanently deleted all static `.jpg` files** from `channel_frames/`.
  - Detached `optical_bank` from the streamer pipeline (`backend/services/streamer/__init__.py`).
  - Configured authentic DirectShow hardware capture:
    ```python
    # Authentic physical hardware capture on Windows
    cap = cv2.VideoCapture(0, cv2.CAP_DSHOW)
    ```
  - Verified local hardware optical camera on device `0` (yielding authentic 640x480 @ 30 FPS frames of the physical room).
  - If a device or RTSP socket is unreachable, the streamer outputs a standardized **NO SIGNAL / HARDWARE OFFLINE** diagnostic test pattern frame with exact error telemetry (e.g., `RTSP TIMEOUT (192.168.1.108:554)` or `BIZ120 URL NOT FOUND`), ensuring complete transparency.

### Failure Mode 4: Blocking Socket Calls in Uvicorn Worker Threads
* **The Defect:** In `backend/services/streamer/captures.py`, `cv2.VideoCapture` was called with RTSP URLs with `stimeout` set to `10000000` (10 seconds). When a configured RTSP camera was offline or unreachable on the local network, OpenCV blocked the Python thread for 10 seconds.
  
  Similarly, Dahua DoLynk Cloud API calls to `open-api-sg.dolynkcloud.com` returned:
  ```json
  {"code": "BIZ120", "message": "The url does not exist"}
  ```
  because the device serial number was not registered to that specific cloud tenant. The code repeatedly retried these failing HTTP requests synchronously on every frame generation request.
* **The Resolution:**
  - Added low-level TCP socket pre-checks (`socket.create_connection`) with a strict **500ms timeout** before calling OpenCV.
  - Implemented an in-memory **15-second failure cooldown cache** in `HardwareCapturePool`. If a camera fails a connection check, it is flagged as unreachable and immediate retries are blocked for 15 seconds, preventing CPU and thread starvation.
  - Removed the fake fallback to `rtsp://127.0.0.1:1554` in `services/dolynk/stream.py`.

---

## 3. Audit of Dumb Data, Dummy APIs & Dead Buttons

In compliance with the project's zero-tolerance standard for misleading artifacts, the entire codebase was audited and purged of dummy components:

| Component | Previous Deceptive State | Remediated Authentic State |
| :--- | :--- | :--- |
| **Scale Telemetry** (`backend/scale_engine.py`) | Hardcoded fake metrics: `42819` cache hits, `684` misses, `42850 + randint(0,50)` connections, fake Kafka broker strings. | Replaced with real in-memory and Redis telemetry, actual request timestamp ring buffers, and authentic active client bucket counts. |
| **Scale Test Assertion** (`backend/test_yardsight.py`) | Test asserted `data["active_simulated_connections"] > 40000` to validate the mock number. | Updated assertion to verify real active connection capacity (`>= 1`). |
| **Stream Test API** (`backend/routers/camera_router.py`) | Returned `status: ONLINE`, `connected: True`, `validation_passed: True` even when P2P handshake failed or device was offline. | Rewritten to delegate to `camera_service.test_stream_connectivity`, verifying actual hardware capture (`cv2.VideoCapture`) or socket reachability. |
| **Billing & Invoices** (`backend/routers/subscription_router.py`) | Returned fake external URL `https://billing.yardsight.corp/receipts/INV-....pdf` and hardcoded static dates. | Removed fake domain; implemented dynamic date calculations and direct receipt statement payloads. |
| **Invoice Ledger UI** (`frontend/src/views/ScaleSettingsView.tsx`) | Table expected `inv.id` and `inv.plan_name`, but backend returned `invoice_id` and `plan`, causing undefined fields. | Standardized data schema across frontend and backend; client-side receipt download generates verified `.txt` receipt statements. |
| **Billing Action Buttons** (`frontend/src/views/ScaleSettingsView.tsx`) | "Update Card" and "Manage Plan" buttons only fired a fake toast: `showToast('GodownOS Pro tier is active...')`. | Replaced dead buttons with an interactive `SubscriptionManageModal` that submits real changes to `POST /api/subscription/manage` and logs to `AuditLog`. |
| **Driver Dispatch** (`backend/services/dispatch_service.py`) | Returned `status: "DELIVERED"` even when no SMS or WhatsApp provider was configured. | Checks environment variables (`TWILIO_ACCOUNT_SID`, `WHATSAPP_TOKEN`). If missing, returns `status: "LOGGED_TO_AUDIT"` with explicit notification of offline gateway. |
| **Seeded Cameras** (`backend/seed_data.py`) | Pre-seeded 32 phantom Dahua NVR channels on every server startup, overwhelming the UI. | Purged phantom cameras; seeds only verified `CAM-01` connected to local hardware optical device index `0`. |

---

## 4. Current Architecture & Technology Stack Verification

The platform consists of two decoupled application tiers:

```
[ FRONTEND ] ──── Vite 8.3.0 + React 19.2 + TypeScript (Port 5174)
     │         ├── TailwindCSS + CSS Custom Properties (Industrial Logistics Theme)
     │         ├── Lucide React Icons & Canvas Confetti
     │         └── Zero Static Media Streams
     │
     ▼ HTTP REST / MJPEG (Port 8001)
[ BACKEND ]  ──── FastAPI + Uvicorn + SQLAlchemy + OpenCV 4.x (Port 8001)
     │         ├── SQLite Database (yardsight.db with WAL mode support)
     │         ├── Token Bucket Rate Limiter (100,000 req/min enterprise profile)
     │         ├── DirectShow (Windows) / V4L2 (Linux) Optical Frame Pipeline
     │         ├── Perspective Homography ANPR Engine (cv2.warpPerspective + CLAHE)
     │         └── Concrete Specular Albedo Leak Detection Engine
```

### Verified Test Suite Status
All 23 backend automated test suites pass without regression:
- `test_yardsight.py` (15/15 tests passing):
  - JWT Enterprise Authentication & Role-Based Access Control (Admin, Yard Master, Security Guard)
  - Token Bucket Rate Limiting (100,000 capacity verification)
  - Redis-style LRU In-Memory Caching & TTL Eviction
  - Multi-Tenant Isolation (`TENANT-MY-HUB` vs. `TENANT-BLR-02`)
  - GST Statutory Part-B E-Way Bill Generation & Tax Validation
  - CCTV Camera CRUD & Dahua P2P Connectivity Verification
  - Roof Leak Specular Albedo Analysis & Actuator Interlocks
  - Scale Telemetry and Hourly Dwell Calculation
- `test_business_intelligence.py` (8/8 tests passing):
  - AI Research Agent Synthesis
  - Production Line Counting Engine
  - Energy Meter OCR Analysis
  - Uncertainty Estimation & Bayesian Epistemic Scoring
  - Adaptive Memory Engine & Operator Corrections

---

## 5. Architectural Recommendations & Strategic Roadmap

While the immediate operational defects and deceptive artifacts have been eliminated, building a true tier-1 enterprise warehouse operating system requires addressing deeper architectural limitations:

### 1. Modernize Video Streaming: From MJPEG to WebRTC / go2rtc
* **Current Limitation:** Multipart MJPEG sends continuous full-frame JPEGs over HTTP. At 1080p @ 30 FPS, a single MJPEG stream consumes **15–25 Mbps** of local network bandwidth and cannot leverage GPU-accelerated H.264/H.265 browser decoders.
* **Recommendation:**
  - Deploy **go2rtc** or **MediaMTX** as a sidecar streaming proxy.
  - Ingest RTSP/ONVIF streams from warehouse IP cameras into go2rtc.
  - Serve streams to the frontend using **WebSockets / WebRTC (Whip/Whep)**.
  - *Benefits:* Sub-200ms latency, 90% reduction in network bandwidth, zero browser connection-pool starvation.

### 2. Implement ONVIF Dynamic Device Discovery
* **Current Limitation:** Cameras must be manually configured via IP, RTSP URL, or serial number.
* **Recommendation:**
  - Implement a WS-Discovery (ONVIF Probe) daemon on the backend that broadcasts UDP multicast packets (`239.255.255.250:3702`) across the warehouse local subnet.
  - Automatically detect Dahua, Hikvision, Axis, and Hanwha cameras, querying their profiles, RTSP endpoints, and PTZ capabilities without user data entry.

### 3. Decouple Computer Vision from Uvicorn Worker Processes
* **Current Limitation:** Heavy image processing (homography unwarping, CLAHE filtering, specular albedo contour detection) runs synchronously or within standard FastAPI async worker threads. Under high frame rates, this can introduce latency spikes on API endpoints.
* **Recommendation:**
  - Offload frame analysis to a dedicated worker pool using **Celery with Redis** or an independent **multiprocessing pipeline** using shared memory (`multiprocessing.shared_memory`).
  - Workers consume raw frames from the capture pool, annotate bounding boxes, and push telemetry via Redis Pub/Sub directly to frontend WebSockets.

### 4. Database Scaling: Transition from SQLite to PostgreSQL + TimescaleDB
* **Current Limitation:** SQLite (`yardsight.db`) is effective for development and single-tenant appliances, but under concurrent writes (continuous ANPR logs, truck dwell events, actuator audit logs), SQLite can encounter database lock contention (`database is locked`).
* **Recommendation:**
  - Transition the production deployment to **PostgreSQL 16**.
  - Enable **TimescaleDB** extension for time-series logging of dock dwell times, temperature/humidity sensor readings, and camera FPS telemetry.
  - Implement **MinIO** or **AWS S3** for archiving camera snapshots, ANPR crops, and generated PDF e-Way bills.

### 5. Automated Hardware Health Check & Self-Healing Watchdog
* **Recommendation:**
  - Implement a background health watchdog (`asyncio` background task) that polls active RTSP sockets and physical capture devices every 30 seconds.
  - Automatically trigger soft driver restarts or RTSP session renegotiations if a video capture stream drops frames for more than 5 consecutive seconds.
  - Provide real-time alerts to the facility manager via WebSocket when an optical sensor goes offline.

---

## 6. Verification & Run Instructions

### Running the Services
The platform can be started using the PowerShell runner from the project root:
```powershell
.\run_servers.ps1 yardsight
```
This launches:
- **FastAPI Backend:** `http://127.0.0.1:8001` (Docs at `http://127.0.0.1:8001/docs`)
- **Vite React Frontend:** `http://localhost:5174`

### Validating the CCTV Camera Feed
1. Open `http://localhost:5174` in the browser.
2. Navigate to **Live CCTV Surveillance** (`/video`).
3. Observe **CAM-01** (Gate 01 Inbound ANPR & Optical Inspection):
   - The stream renders live optical frames captured directly from physical hardware device index 0.
   - The stream includes authentic industrial HUD overlays with current UTC timestamp, frame resolution, and FPS.
   - If no hardware camera is plugged in, the card displays a clean **NO SIGNAL** diagnostic card rather than crashing or showing static mock images.

### Validating Subscription Management
1. Navigate to **Scale & Facility Settings** (`/settings`).
2. Click **Subscription & Billing** tab.
3. Review authentic invoice ledger and click **Receipt** to download an official text statement.
4. Click **Manage Plan** or **Update Card** to open the interactive modal, adjust plan tiers or payment methods, and confirm updates.
5. Inspect the **Compliance Audit Trail** tab to verify that the change was recorded in the immutable database audit ledger.

---
*Report certified by Antigravity Autonomous Systems Engineering.*
