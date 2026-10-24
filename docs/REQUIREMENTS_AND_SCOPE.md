# YardSight AI — Product Requirements & Scope Document

**Document Version:** 2.4.0  
**Status:** Approved & Implemented  
**Classification:** Enterprise Engineering Specification  
**Product:** YardSight Industrial Vision & Logistics Operating System (GodownOS)

---

## 1. Executive Summary & Product Vision

YardSight AI is an autonomous, edge-optimized computer vision and multimodal logistics intelligence platform designed for commercial freight godowns, manufacturing yards, and biomass compaction plants. 

The platform bridges legacy industrial hardware (Dahua, Hikvision, and ONVIF NVRs) with modern edge AI (YOLOv8-Nano, OpenCV homography ANPR, and Nimbus AI Copilot) to deliver real-time operational transparency, safety perimeter enforcement, and gate logistics automation without requiring expensive server-side GPU clusters or recurring cloud bandwidth costs.

---

## 2. Project Scope

### 2.1 In-Scope Capabilities
- **Multi-Channel CCTV Surveillance**: Real-time monitoring across 4, 8, 9, 16, and 32 Dahua/ONVIF NVR multiplexed IP channels.
- **Ultra-Low Latency Video Streaming**: Sub-150ms video delivery via WebRTC (`go2rtc`), eliminating browser TCP socket exhaustion.
- **Low-Spec Machine Mode**: Adaptive stream switching using Dahua Substreams (`subtype=1`, 640×360) for matrix overviews and 1080p Mainstream (`subtype=0`) for inspect/fullscreen viewports, capping memory consumption under 250 MB and CPU under 5%.
- **Edge AI Vision Tracking**: ONNX CPU runtime inference of YOLOv8-Nano for multi-class detection (Persons, Two-Wheelers, Cars, Trucks, Buses) with optical debris suppression for manufacturing lines.
- **Autonomous ANPR Manifest**: Ingress/egress license plate logging with high-precision homography perspective unwarping and vehicle classification (Heavy Freight Carrier vs. Worker Two-Wheeler).
- **Nimbus Multimodal Business Intelligence**: Contextual natural language Q&A grounded in live yard telemetry, production throughput, scale readings, and gate activity.
- **Dynamic NVR Provisioning & Channel Renaming**: In-app modal onboarding, channel auto-sync, and inline channel renaming persisted in SQLite.
- **Industrial Safety & Environmental Containment**: Virtual tripwire perimeter monitoring, PPE compliance audits, and specular reflection diesel leak detection.

### 2.2 Out-of-Scope (Future Iterations)
- Direct physical control of automated gate boom barriers (relay actuation via Modbus/MQTT is slated for Phase 3).
- On-premise biometric facial recognition (restricted to safeguard operator privacy under statutory compliance).
- Hardware replacement of existing NVRs (YardSight is 100% overlay software compatible with existing Dahua/Hikvision hardware).

---

## 3. Stakeholder & User Personas

| Persona | Role | Key Goals | Platform Touchpoints |
| :--- | :--- | :--- | :--- |
| **Yard Security Operator** | Physical gate security & perimeter oversight | Monitor incoming trucks, log license plates, verify driver credentials, clear stalled camera feeds. | Live CCTV Matrix, ANPR Scanner, Inspect Modal. |
| **Plant Floor Supervisor** | Production & material flow management | Track briquette extrusion rates, suppress false debris alarms, ensure worker safety. | Nimbus Hub, Briquette Line Telemetry, AI HUD. |
| **Logistics Dispatcher** | Freight turnaround & dock allocation | Monitor dwell times, assign loading bays, generate electronic e-Way Bills and US eBOLs. | Fleet & Dock Dwell, E-Way Bills & eBOL Tab. |
| **Executive Auditor** | Corporate governance & ESG compliance | Audit environmental spills, review daily gate manifests, ensure multi-tenant isolation. | Logistics Command, Audit Report Modal, MCP Server. |

---

## 4. Functional Requirements

### FR-01: Multi-Split CCTV Matrix & Layout Switching
- The system MUST support flexible operator layout presets: 4-Split Quad, 8-Split Multi, 9-Split Quad, 16-Split Matrix, and All 32 Channels.
- Layouts with channel counts exceeding the viewport capacity MUST provide paginated navigation with clear `< Prev` and `Next >` controls.
- The grid MUST display live Indian Standard Time (IST) timestamps accurate to the second.

### FR-02: Sub-Second Video Streaming & Socket Decoupling
- The frontend MUST stream video via WebRTC (UDP P2P) or decimated WebSocket streams.
- The system MUST NOT maintain more than one persistent HTTP MJPEG connection per host to prevent Chrome's 6-connection TCP socket pool exhaustion limit.
- Video playback latency MUST remain under 200ms in live streaming mode.

### FR-03: Stalled Buffer Flushing & Zero-Lag Recovery
- The Inspect Modal MUST provide a functional "Refresh Buffer" button.
- When clicked, the backend MUST instantly release the underlying OpenCV VideoCapture socket handle, dump queued FFmpeg packets, and reconnect to the live RTSP edge in <15ms.

### FR-04: Channel Ingestion & Inline Customization
- Operators MUST be able to rename camera channels directly inside the Inspect Modal using an inline text input with Save (`✓`) and Cancel (`✕`) controls.
- Renamed channel labels MUST persist in the SQLite database and propagate across matrix headers without requiring a page reload.

### FR-05: Dynamic Camera & NVR Onboarding
- The CCTV Matrix top bar MUST include permanent "+ Add Camera" and "Connect NVR" action triggers.
- The "Add Camera" modal MUST accept Channel Name, Location/Zone, Stream Type (`RTSP`, `DMSS`, `WEBRTC`), Stream URL, and AI Pipeline.
- The "Connect NVR" modal MUST accept Serial Number, IP Host, Port, Credentials, and Channel Count, auto-provisioning multiplexed channel routes.

### FR-06: Edge AI Multi-Class Object Tracking & Debris Rejection
- The vision pipeline MUST detect Persons, Bicycles, Motorcycles, Cars, and Commercial Trucks.
- Production debris and small biomass conveyor fragments MUST be rejected using geometric solidity and aspect ratio filters ($0.5 \le \text{Solidity} \le 0.85$, $1.6 \le h/w \le 4.2$).
- Color-coded tactical HUD overlays MUST render: Yellow for Persons, Emerald Green for Two-Wheelers, Cyan for Freight Vehicles.

### FR-07: Autonomous ANPR Manifest Logging
- When vehicles or two-wheelers are detected at Gate 01 or Gate 02, the vision tracker MUST autonomously record their arrival in the Live ANPR Manifest.
- Each entry MUST specify License Plate, Vehicle Category (e.g., `Motorcycle / Two-Wheeler`, `Commercial Freight Carrier`), Ingress Gate, Timestamp (IST), and Authorization Status.

### FR-08: Nimbus Multimodal Intelligence Q&A
- The Nimbus copilot MUST answer natural-language operational queries grounded in live yard telemetry, weighbridge gross/tare metrics, briquette line throughput, and vehicle logs.

---

## 5. Non-Functional Requirements (NFR)

### NFR-01: Low-Spec Hardware Performance SLA
- **Matrix Mode**: Idle CPU utilization MUST remain $< 5\%$ on dual-core Intel Celeron / Core i3 machines with 32 active channels configured.
- **Memory Footprint**: Total browser RAM consumption MUST remain $< 250\text{ MB}$.
- **Inspect Mode**: Mainstream 1080p WebRTC stream MUST initialize in $< 350\text{ms}$.

### NFR-02: Zero Synthetic Mock Deception
- All camera feeds, telemetry ticks, and buffer flushing routines MUST operate against real network sockets, live RTSP proxies, and deterministic database records. Mock timers or simulated random latency drops are strictly prohibited.

### NFR-03: Multi-Tenant Data Isolation & Security
- All database queries MUST enforce tenant isolation via `tenant_id` scoping (e.g., `TENANT-MY-HUB`, `TENANT-AMZN-BLR1`).
- Cross-tenant camera stream leakage MUST be blocked at the FastAPI router dependency layer.

### NFR-04: Modularity & Code Maintainability
- Frontend component files MUST adhere to an average size of 300 to 400 lines of code (maximum 500 lines).
- Monolithic structures MUST be decomposed into clear, single-responsibility subcomponents organized under dedicated domain directories.
