# YardSight AI (GodownOS) - Project Architecture & Comprehensive File Inventory

**Generated:** October 2026  
**Total Project Files Audited:** 217  
**Total System Lines of Code:** 24,544 lines  

This document provides an exhaustive index of every active codebase file across backend, frontend, packages, and architecture modules in YardSight. For every file, the line count and specific operational features within the GodownOS logistics vision ecosystem are detailed below.

## 1. Backend Core & Orchestration (`backend/*.py`)

*Subtotal: 21 files | 1,890 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/adaptive_memory_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/adaptive_memory_engine.py)` | **2** | Backward-compatible proxy to engines.adaptive_memory_engine. |
| `[backend/anpr_homography.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/anpr_homography.py)` | **2** | Backward-compatible proxy to engines.anpr_homography. |
| `[backend/app.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/app.py)` | **138** | YardSight AI (GodownOS) - Enterprise FastAPI Server Multi-Camera Industrial Visi — Functions: root_index |
| `[backend/auth_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/auth_engine.py)` | **127** | YardSight AI (GodownOS) - Enterprise Authentication & RBAC Engine Stateless JWT  — Functions: create_access_token, revoke_token, is_token_revoked, verify_access_token... |
| `[backend/b2b_api_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/b2b_api_router.py)` | **2** | Backward-compatible proxy to routers.b2b_router. |
| `[backend/business_research_agent.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/business_research_agent.py)` | **2** | Backward-compatible proxy to engines.business_research_agent. |
| `[backend/camera_streamer.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/camera_streamer.py)` | **8** | YardSight AI - Industrial CCTV Streamer & Optical Video Ingestion (<25 lines). Re-exports clean decoupled implementation |
| `[backend/dahua_p2p_bridge.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/dahua_p2p_bridge.py)` | **368** | YardSight AI - Dahua P2P Relay Tunnel & RTSP Bridge Provides an asynchronous TCP — Classes: DahuaP2PBridge |
| `[backend/database.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/database.py)` | **90** | YardSight AI (GodownOS) - Enterprise Hybrid Cloud Database Architecture Supports — Functions: get_db, check_database_health |
| `[backend/dock_cycle_tracker.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/dock_cycle_tracker.py)` | **2** | Backward-compatible proxy to engines.dock_cycle_tracker. |
| `[backend/energy_meter_ocr.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/energy_meter_ocr.py)` | **2** | Backward-compatible proxy to engines.energy_meter_ocr. |
| `[backend/eway_bill_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/eway_bill_engine.py)` | **2** | Backward-compatible proxy to engines.eway_bill_engine. |
| `[backend/fastapi_standards.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/fastapi_standards.py)` | **339** | fastapi_standards.py - Universal FastAPI RFC 7807 & Security Standards Plugin Al — Classes: AppException, AuthException, RBACException, ValidationException...; Functions: base64url_decode, verify_jwt, register_standards_exception_handlers, match_permission... |
| `[backend/leak_detector.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/leak_detector.py)` | **2** | Backward-compatible proxy to engines.leak_detector. |
| `[backend/mcp_server.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/mcp_server.py)` | **134** | YardSight AI - Model Context Protocol (MCP) Server for Enterprise AI Agents Impl — Classes: YardSightMCPServer |
| `[backend/models.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/models.py)` | **45** | YardSight AI (GodownOS) - SQLAlchemy 2.0 ORM Models Declarative, typed relational database models for enterprise multi-t |
| `[backend/production_line_counter.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/production_line_counter.py)` | **2** | Backward-compatible proxy to engines.production_line_counter. |
| `[backend/scale_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/scale_engine.py)` | **246** | YardSight AI (GodownOS) - Enterprise Scale & Concurrency Engine Engineered for 1 — Classes: TokenBucketRateLimiter, RedisStyleLRUCache, AsyncWorkerQueue; Functions: record_api_request, get_enterprise_scale_metrics |
| `[backend/seed_data.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/seed_data.py)` | **220** | YardSight AI (GodownOS) - Enterprise Schema Initializer & Facility Config Initia — Functions: migrate_schema, seed_tenants, seed_users, seed_cameras... |
| `[backend/tenant_manager.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tenant_manager.py)` | **155** | YardSight AI (GodownOS) - Enterprise Multi-Tenant Manager Directly backed by rea — Classes: TenantManager |
| `[backend/uncertainty_approximator.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/uncertainty_approximator.py)` | **2** | Backward-compatible proxy to engines.uncertainty_approximator. |


## 2. Backend Camera Ingestion & Streaming Services (`backend/services/`)

*Subtotal: 44 files | 4,133 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/services/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/__init__.py)` | **32** | YardSight AI - Services Package |
| `[backend/services/admin_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/admin_service.py)` | **76** | YardSight AI - System Admin & Diagnostics Service Layer — Classes: AdminService |
| `[backend/services/anpr_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/anpr_service.py)` | **194** | YardSight AI - ANPR Perspective Homography & Fleet Auto-Registration Service Lay — Classes: ANPRService |
| `[backend/services/auth_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/auth_service.py)` | **97** | YardSight AI - Authentication Service Layer — Classes: AuthService |
| `[backend/services/camera_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/camera_service.py)` | **134** | YardSight AI - CCTV Camera Service Layer (<80 lines). Encapsulates CCTV camera d — Classes: CameraService |
| `[backend/services/camera_tester.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/camera_tester.py)` | **59** | YardSight AI - CCTV Stream Connectivity Tester (<80 lines). — Functions: test_camera_connectivity |
| `[backend/services/camera_watchdog.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/camera_watchdog.py)` | **59** | YardSight AI - Background Camera Health Watchdog & Self-Healing Telemetry Contin — Classes: CameraHealthWatchdog |
| `[backend/services/dahua_netsdk_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dahua_netsdk_service.py)` | **23** | YardSight AI - Dahua NetSDK Official Python Service (<20 lines). Re-exports clean decoupled implementation from services |
| `[backend/services/dhp2p/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/__init__.py)` | **26** | Dahua P2P Decoupled Service Facade (<45 lines). Coordinates signaling, PTCP tunn — Classes: DahuaP2PService |
| `[backend/services/dhp2p/client_handler.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/client_handler.py)` | **58** | Dahua P2P Client TCP Proxy Handler (<50 lines). Handles bidirectional data forwa — Functions: handle_tcp_proxy |
| `[backend/services/dhp2p/crypto.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/crypto.py)` | **57** | Dahua P2P Cryptographic Operations (<75 lines). Handles PBKDF2/AES key derivatio — Functions: decrypt_device_info, get_key, get_nonce, get_enc... |
| `[backend/services/dhp2p/helpers.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/helpers.py)` | **274** | DH-P2P Helper Functions (Decoupled Core). Part of YardSight AI Dahua P2P Gateway — Classes: PTCPPayload, PTCP, UDP; Functions: set_cloud, get_device_info, get_key, get_nonce... |
| `[backend/services/dhp2p/protocol.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/protocol.py)` | **97** | Dahua P2P Protocol Utilities: SyncUDP and PTCPProtocol frame handlers. — Classes: SyncUDP, PTCPProtocol |
| `[backend/services/dhp2p/signaling.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/signaling.py)` | **107** | Dahua Easy4IP Cloud Signaling Client (<90 lines). Handles WSSE cloud signaling,  — Functions: resolve_host, dh_req, dh_read, perform_p2p_handshake |
| `[backend/services/dhp2p/tunnel.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/tunnel.py)` | **176** | Dahua P2P Relay Tunnel Service (<85 lines). Bridges Dahua P2P PTCP protocol into — Classes: DahuaP2PTunnel |
| `[backend/services/dhp2p/worker.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dhp2p/worker.py)` | **133** | Dahua P2P Live Optical Frame Worker (<85 lines). Manages shared tunnel lifecycle — Classes: DahuaOpticalWorker |
| `[backend/services/dispatch_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dispatch_service.py)` | **53** | YardSight AI - Driver Dispatch & Notification Service Layer — Classes: DispatchService |
| `[backend/services/document_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/document_service.py)` | **58** | YardSight AI - Transport Document & eBOL Service Layer — Classes: DocumentService |
| `[backend/services/dolynk/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/__init__.py)` | **61** | DoLynk Decoupled Service Facade (<80 lines). Coordinates authentication, live RT — Classes: DoLynkCloudService |
| `[backend/services/dolynk/auth.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/auth.py)` | **73** | DoLynk Cloud Authentication Service (<80 lines). Handles HMAC-SHA512 signature c — Classes: DoLynkAuthManager |
| `[backend/services/dolynk/devices.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/devices.py)` | **144** | DoLynk Cloud Device & NVR Provisioning Service (<95 lines). Handles device queri — Classes: DoLynkDeviceManager |
| `[backend/services/dolynk/diagnostics.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/diagnostics.py)` | **54** | DoLynk Cloud Root-Cause Diagnostic Service (<85 lines). Inspects API reachabilit — Classes: DoLynkDiagnosticManager |
| `[backend/services/dolynk/stream.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/stream.py)` | **85** | DoLynk Cloud Live Stream Service (<85 lines). Retrieves official tokenized RTSP  — Classes: DoLynkStreamManager |
| `[backend/services/dolynk/worker.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk/worker.py)` | **81** | DoLynk Cloud Optical Background Worker Service (<95 lines). Pulls live RTSP H.26 — Classes: DoLynkOpticalWorker |
| `[backend/services/dolynk_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dolynk_service.py)` | **7** | YardSight AI - Dahua DoLynk Cloud Service (<25 lines). Re-exports clean decoupled implementation from services.dolynk. |
| `[backend/services/dwell_calculator.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/dwell_calculator.py)` | **27** | YardSight AI - Fleet Dwell & Detention Calculator (<50 lines). Calculates dynami — Functions: compute_truck_dwell |
| `[backend/services/leak_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/leak_service.py)` | **84** | YardSight AI - Roof Leak & Physical Actuator Service Layer — Classes: LeakService |
| `[backend/services/mcp_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/mcp_service.py)` | **33** | YardSight AI - Model Context Protocol (MCP) Service Layer — Classes: McpService |
| `[backend/services/netsdk/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/netsdk/__init__.py)` | **23** | Dahua NetSDK Module (<30 lines). |
| `[backend/services/netsdk/client.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/netsdk/client.py)` | **78** | Dahua NetSDK C-Library Manager & P2P Client (<95 lines). Loads dhnetsdk.dll and  — Classes: DahuaNetSDKManager |
| `[backend/services/netsdk/structures.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/netsdk/structures.py)` | **72** | Dahua NetSDK Ctypes Data Structures (<75 lines). Defines official C-structures p — Classes: NET_DEVICEINFO_Ex, NET_IN_LOGIN_WITH_HIGHLEVEL_SECURITY, NET_OUT_LOGIN_WITH_HIGHLEVEL_SECURITY, NET_IN_REALPLAY... |
| `[backend/services/nimbus_agent.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/nimbus_agent.py)` | **262** | YardSight AI - Nimbus Multimodal Business Intelligence Engine Aggregates live vi — Classes: NimbusBusinessEngine |
| `[backend/services/onvif_discovery.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/onvif_discovery.py)` | **70** | YardSight AI - ONVIF & Local Subnet Camera Discovery Engine (<90 lines). — Classes: ONVIFDiscoveryService |
| `[backend/services/scale_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/scale_service.py)` | **33** | YardSight AI - High-Concurrency Scale Engine Service Layer — Classes: ScaleService |
| `[backend/services/streamer/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/__init__.py)` | **129** | Industrial Multi-Channel Camera Streamer Facade (<80 lines). Coordinates optical — Classes: IndustrialCameraStreamer |
| `[backend/services/streamer/captures.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/captures.py)` | **101** | Classes: HardwareCapturePool |
| `[backend/services/streamer/hud_overlay.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/hud_overlay.py)` | **43** | Industrial HUD & AI Computer Vision Overlay Engine. Connects genuine OpenCV moti — Functions: apply_ai_pipeline_overlays, apply_dahua_hud_telemetry |
| `[backend/services/streamer/offline_card.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/offline_card.py)` | **71** | Industrial CCTV Broadcast Offline / Diagnostic Card Renderer (<80 lines). Render — Functions: render_offline_cctv_card |
| `[backend/services/streamer/vision_tracker.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/vision_tracker.py)` | **390** | Classes: YoloV8Detector, TrackedEntity, RealVisionTracker |
| `[backend/services/streamer/zones.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/streamer/zones.py)` | **40** | 32 Distinct Logistics Yard & Godown Zone Definitions (<85 lines). Maps channels to authentic industrial zones, telemetry |
| `[backend/services/tenant_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/tenant_service.py)` | **88** | YardSight AI - Multi-Tenant Isolation Service Layer — Classes: TenantService |
| `[backend/services/truck_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/truck_service.py)` | **77** | YardSight AI - Fleet & Dwell Turnaround Service Layer (<80 lines). Encapsulates  — Classes: TruckService |
| `[backend/services/vlm_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/vlm_service.py)` | **195** | YardSight AI - Vision-Language Model (VLM) Service Supports Nebius AI Studio (Op — Classes: VlmService |
| `[backend/services/webrtc_service.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/services/webrtc_service.py)` | **99** | YardSight AI - WebRTC Streaming Service Orchestrates the local go2rtc WebRTC gat — Classes: WebRtcService |


## 3. Backend REST & WebSocket Routers (`backend/routers/`)

*Subtotal: 26 files | 2,527 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/routers/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/__init__.py)` | **46** | YardSight AI - Routers Package |
| `[backend/routers/admin_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/admin_router.py)` | **32** | YardSight AI - Admin & Database Health Router — Routes: 4 endpoints (GET /admin/data-status, POST /admin/clean-slate, POST /admin/seed-demo...) |
| `[backend/routers/alert_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/alert_router.py)` | **99** | YardSight AI - Real-time Operational Alerts Router Aggregates live detention inf — Routes: 1 endpoints (POST /clear) |
| `[backend/routers/anpr_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/anpr_router.py)` | **99** | YardSight AI - ANPR Perspective Homography & Plate Manifest Router — Routes: 7 endpoints (GET /unwarp, POST /unwarp, POST /detect...); Classes: PlateCorrectionRequest, DetectAndRegisterPayload |
| `[backend/routers/auth_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/auth_router.py)` | **107** | YardSight AI - Authentication & RBAC Router — Routes: 5 endpoints (POST /auth/login, POST /auth/switch-role, GET /auth/roles...); Classes: RoleSwitchRequest, ProfileUpdateRequest |
| `[backend/routers/b2b/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/__init__.py)` | **17** | YardSight AI - B2B Routers Package |
| `[backend/routers/b2b/common.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/common.py)` | **39** | YardSight AI - B2B Common Dependencies & Authentication — Functions: get_current_tenant_id |
| `[backend/routers/b2b/energy_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/energy_router.py)` | **119** | YardSight AI - B2B Energy Efficiency & Meter Readings Router — Routes: 2 endpoints (GET /energy/efficiency, POST /energy/reading) |
| `[backend/routers/b2b/export_memory_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/export_memory_router.py)` | **106** | YardSight AI - B2B ERP Export & Adaptive Memory Router — Routes: 2 endpoints (GET /export/erp, GET /memory/context) |
| `[backend/routers/b2b/production_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/production_router.py)` | **251** | YardSight AI - B2B Production Lines, Tripwires & Logs Router — Routes: 6 endpoints (GET /production/lines, POST /production/lines, GET /production/metrics...) |
| `[backend/routers/b2b/profile_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b/profile_router.py)` | **95** | YardSight AI - B2B Business Profile & AI Research Router — Routes: 2 endpoints (GET /business/profile, POST /business/profile) |
| `[backend/routers/b2b_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/b2b_router.py)` | **10** | YardSight AI - Universal B2B REST API Router Exposes standardized endpoints for third-party ERP integration (SAP, Tally, |
| `[backend/routers/camera_nvr_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/camera_nvr_router.py)` | **155** | YardSight AI - Dahua NVR Onboarding, Provisioning & Management Router — Routes: 4 endpoints (POST /cameras/nvr/onboard, POST /cameras/nvr/sync-channels, GET /cameras/nvr/list...); Classes: NVROnboardRequest |
| `[backend/routers/camera_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/camera_router.py)` | **202** | YardSight AI - CCTV Camera Router Core camera CRUD, MJPEG streams, snapshots, an — Routes: 14 endpoints (GET /cameras/dahua-sdk/status, POST /cameras/dahua-sdk/login, GET /cameras...) |
| `[backend/routers/camera_stream_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/camera_stream_router.py)` | **160** | YardSight AI - WebRTC Gateway, WebSocket Streaming & ONVIF Router — Routes: 6 endpoints (GET /cameras/webrtc/status, GET /cameras/discover/onvif, GET /cameras/health/watchdog...); Classes: PrivacyModeRequest |
| `[backend/routers/dispatch_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/dispatch_router.py)` | **16** | YardSight AI - Driver Dispatch & Alerts Router — Routes: 1 endpoints (POST /alert) |
| `[backend/routers/document_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/document_router.py)` | **87** | YardSight AI - Transport Documents & Compliance Router — Routes: 3 endpoints (POST /generate, GET /list, DELETE /{doc_id}); Classes: DocumentGenPayload |
| `[backend/routers/leak_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/leak_router.py)` | **28** | YardSight AI - Roof Leak & Physical Actuator Router — Routes: 3 endpoints (GET /status, POST /actuator/pump, POST /actuator/forklift) |
| `[backend/routers/mcp_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/mcp_router.py)` | **20** | YardSight AI - Model Context Protocol (MCP) Router — Routes: 2 endpoints (GET /tools, POST /invoke) |
| `[backend/routers/nimbus_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/nimbus_router.py)` | **60** | YardSight AI - Nimbus Multimodal Business Intelligence Router Exposes operationa — Routes: 3 endpoints (GET /context, POST /chat, POST /ingest/plate); Classes: NimbusChatRequest, NimbusChatResponse, IngestPlateRequest |
| `[backend/routers/scale_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/scale_router.py)` | **61** | YardSight AI - High-Concurrency Scale Engine Router — Routes: 5 endpoints (GET /health, GET /metrics/scale, GET /scale/metrics...) |
| `[backend/routers/subscription_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/subscription_router.py)` | **162** | YardSight AI - Commercial SaaS Subscription & Billing Router Enables warehouse & — Routes: 4 endpoints (GET /status, POST /manage, GET /invoices...); Classes: SubscriptionManageRequest |
| `[backend/routers/support_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/support_router.py)` | **129** | YardSight AI - Enterprise Support Hub & SLA Ticketing Router Handles customer in — Routes: 4 endpoints (GET /sla, POST /tickets, GET /tickets...); Classes: CreateTicketPayload, TicketStatusUpdate |
| `[backend/routers/tenant_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/tenant_router.py)` | **236** | YardSight AI - Multi-Tenant Isolation Router — Routes: 5 endpoints (POST /switch, DELETE /{tenant_id}, GET /{tenant_id}/settings...); Classes: TenantCreatePayload, TenantSettingsUpdatePayload, IntegrationTestPayload |
| `[backend/routers/truck_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/truck_router.py)` | **173** | YardSight AI - Fleet & Dwell Router — Routes: 9 endpoints (GET /trucks, GET /dwell/trucks, GET /dwell/summary...); Classes: TruckUpdateFields |
| `[backend/routers/vlm_router.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/routers/vlm_router.py)` | **18** | YardSight AI - Vision-Language Model (VLM) Router Exposes Nebius AI Studio & NVI — Routes: 1 endpoints (POST /chat) |


## 4. Backend Domain Models, Schemas & Engines (`backend/domain_models/`, `backend/schemas/`, `backend/engines/`)

*Subtotal: 29 files | 2,287 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/domain_models/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/__init__.py)` | **40** | YardSight AI Domain Models Package. Re-exports all typed SQLAlchemy 2.0 ORM entities. |
| `[backend/domain_models/fleet.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/fleet.py)` | **97** | Truck and EWayBill ORM Models for yard fleet logistics and freight manifest. — Classes: Truck, EWayBill |
| `[backend/domain_models/memory.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/memory.py)` | **127** | UserCorrectionMemory, ContextMemorySummary, AuditLog, and SupportTicket ORM Mode — Classes: UserCorrectionMemory, ContextMemorySummary, AuditLog, SupportTicket |
| `[backend/domain_models/production.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/production.py)` | **162** | Production and Energy ORM Models for SME intelligence and telemetry. — Classes: BusinessProfile, ProductionLine, ProductionLog, EnergyMeterReading |
| `[backend/domain_models/tenant.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/tenant.py)` | **139** | Tenant, User, ApiKey, and TenantSetting ORM Models. — Classes: Tenant, User, ApiKey, TenantSetting |
| `[backend/domain_models/vision.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/domain_models/vision.py)` | **120** | CCTVCamera, LeakEvent, and ANPRScanRecord ORM Models for vision telemetry. — Classes: CCTVCamera, LeakEvent, ANPRScanRecord |
| `[backend/engines/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/__init__.py)` | **30** | YardSight AI - Industrial Vision & Intelligence Engines Package Decoupled domain intelligence, computer vision, and simu |
| `[backend/engines/adaptive_memory_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/adaptive_memory_engine.py)` | **134** | YardSight AI - Adaptive Memory Engine (Recency-Weighted Exponential Decay) Imple — Classes: AdaptiveMemoryEngine |
| `[backend/engines/anpr_homography.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/anpr_homography.py)` | **176** | YardSight AI - ANPR Perspective Homography & License Plate Unwarping Engine Uses — Classes: ANPRHomographyEngine |
| `[backend/engines/business_research_agent.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/business_research_agent.py)` | **172** | YardSight AI - Autonomous Business & Industry Research Agent Researches standard — Classes: BusinessResearchAgent |
| `[backend/engines/dock_cycle_tracker.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/dock_cycle_tracker.py)` | **82** | YardSight AI - Dock Turnaround & Driver Detention Prevention Tracker Monitors th — Classes: DockCycleTracker |
| `[backend/engines/energy_meter_ocr.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/energy_meter_ocr.py)` | **103** | YardSight AI - Energy Meter OCR & Production Efficiency Analytics Engine Reads i — Classes: EnergyMeterAnalyzer |
| `[backend/engines/eway_bill_engine.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/eway_bill_engine.py)` | **89** | YardSight AI - Automated E-Way Bill & Electronic Bill of Lading (eBOL) Engine Ge — Classes: EWayBillEngine |
| `[backend/engines/leak_detector.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/leak_detector.py)` | **117** | YardSight AI - Concrete Specular Reflection & Roof Leak Detection Engine Detects — Classes: ConcretePuddleDetector |
| `[backend/engines/production_line_counter.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/production_line_counter.py)` | **172** | YardSight AI - Production Line Counter Engine Autonomous conveyor belt unit coun — Classes: TrackedObject, ProductionLineCounter |
| `[backend/engines/uncertainty_approximator.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/engines/uncertainty_approximator.py)` | **112** | YardSight AI - Uncertainty & Production Approximation Engine Estimates productio — Classes: UncertaintyApproximator |
| `[backend/schemas/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/__init__.py)` | **33** | YardSight AI - Schemas Package |
| `[backend/schemas/admin.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/admin.py)` | **25** | YardSight AI - System Admin & Health Pydantic Schemas — Classes: DataStatusResponse, DatabaseHealthResponse |
| `[backend/schemas/anpr.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/anpr.py)` | **28** | YardSight AI - ANPR & Homography Vision Pydantic Schemas — Classes: ANPRUnwarpRequest, ANPRUnwarpResponse |
| `[backend/schemas/auth.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/auth.py)` | **34** | YardSight AI - Authentication & RBAC Pydantic Schemas — Classes: LoginRequest, UserPayload, TokenResponse, RoleInfo |
| `[backend/schemas/camera.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/camera.py)` | **78** | YardSight AI - CCTV Camera Pydantic Schemas — Classes: CameraCreate, CameraUpdate, CameraResponse, CameraListResponse... |
| `[backend/schemas/dispatch.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/dispatch.py)` | **21** | YardSight AI - Driver Dispatch & Notification Pydantic Schemas — Classes: DispatchAlertRequest, DispatchAlertResponse |
| `[backend/schemas/document.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/document.py)` | **20** | YardSight AI - Transport Documents & eBOL Pydantic Schemas — Classes: DocumentGenerateRequest, DocumentResponse |
| `[backend/schemas/leak.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/leak.py)` | **36** | YardSight AI - Roof Leak & Physical Actuator Pydantic Schemas — Classes: LeakMetrics, LeakStatusResponse, ActuatorRequest, ActuatorResponse |
| `[backend/schemas/mcp.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/mcp.py)` | **20** | YardSight AI - Model Context Protocol (MCP v2025-11-25) Pydantic Schemas — Classes: McpToolDefinition, McpInvokeRequest, McpInvokeResponse |
| `[backend/schemas/scale.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/scale.py)` | **19** | YardSight AI - Scale Engine & High-Concurrency Pydantic Schemas — Classes: ScaleMetricsResponse, ScaleHealthResponse |
| `[backend/schemas/tenant.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/tenant.py)` | **25** | YardSight AI - Multi-Tenant Isolation Pydantic Schemas — Classes: TenantResponse, TenantSwitchRequest |
| `[backend/schemas/truck.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/truck.py)` | **52** | YardSight AI - Fleet & Dock Dwell Pydantic Schemas — Classes: TruckCreate, TruckStatusUpdate, TruckResponse, DwellSummary |
| `[backend/schemas/vlm.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/schemas/vlm.py)` | **24** | YardSight AI - Vision-Language Model (VLM) Pydantic Schemas Supports Nebius AI S — Classes: VlmChatRequest, VlmChatResponse |


## 5. Backend Test Suite (`backend/tests/`)

*Subtotal: 12 files | 1,623 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/tests/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/__init__.py)` | **0** | Module supporting YardSight core operations |
| `[backend/tests/conftest.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/conftest.py)` | **7** | Module supporting YardSight core operations |
| `[backend/tests/fixtures/__init__.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/fixtures/__init__.py)` | **0** | Module supporting YardSight core operations |
| `[backend/tests/fixtures/camera_fixtures.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/fixtures/camera_fixtures.py)` | **261** | Enterprise CCTV Camera Fixtures for Demo & Testing Environments. Seeds multi-ten — Functions: seed_enterprise_cameras |
| `[backend/tests/fixtures/yardsight_demo_seed.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/fixtures/yardsight_demo_seed.py)` | **324** | YardSight AI (GodownOS) - Standalone Demo & Test Fixture Seeder [MOVED TO TEMP - — Functions: seed_enterprise_data |
| `[backend/tests/test_business_intelligence.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_business_intelligence.py)` | **192** | YardSight AI - Business Intelligence, Production Line Vision & Energy Analytics  — Functions: test_production_line_counter_tripwire_crossing, test_production_moving_averages, test_energy_meter_ocr_parsing, test_energy_efficiency_and_anomaly_detection... |
| `[backend/tests/test_camera_rest_api.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_camera_rest_api.py)` | **157** | YardSight AI - Comprehensive RESTful Camera & NVR CRUD Test Suite. Validates: 1. — Functions: setup_and_teardown_test_fixtures, test_create_and_delete_dmss_camera, test_create_webrtc_camera, test_create_rtsp_camera... |
| `[backend/tests/test_nimbus_agent.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_nimbus_agent.py)` | **51** | Unit Test: Nimbus Multimodal AI Business Intelligence Engine Validates: 1. Conte — Functions: test_nimbus_context_structure, test_nimbus_plate_ingestion, test_nimbus_query_reasoning |
| `[backend/tests/test_real_vision_and_anpr.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_real_vision_and_anpr.py)` | **115** | YardSight AI - Automated Tests for Genuine Real-Time Computer Vision Tracking, A — Functions: test_real_vision_tracker_moving_person, test_anpr_homography_validation, test_anpr_auto_registration_and_admin_edit |
| `[backend/tests/test_vision_tracker_precision.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_vision_tracker_precision.py)` | **78** | Unit Test: Multi-Stage OpenCV Pipeline & Precision HUD Validates that: 1. Irregu — Functions: test_debris_and_briquettes_rejected_from_person, test_small_file_debris_rejected, test_authentic_human_silhouette_accepted |
| `[backend/tests/test_webrtc_ws_routes.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_webrtc_ws_routes.py)` | **52** | Unit Test: WebRTC Gateway & WebSocket Camera Endpoints Validates: 1. GET /api/ca — Functions: test_webrtc_status_endpoint, test_nimbus_api_context, test_nimbus_api_chat, test_webrtc_negotiation_endpoint_fallback |
| `[backend/tests/test_yardsight.py](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/tests/test_yardsight.py)` | **386** | Automated unit test suite for YardSight AI (GodownOS). Covers: 1. OpenCV 5 ANPR  — Functions: setup_and_teardown_test_fixtures, test_anpr_homography, test_cctv_simulation, test_leak_detector... |


## 6. Frontend UI Components & Views (`src/components/`)

*Subtotal: 55 files | 8,426 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[src/components/AmazonEnterpriseAuthPortal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/AmazonEnterpriseAuthPortal.tsx)` | **5** | Deprecated alias: Please import EnterpriseAuthPortal directly from './EnterpriseAuthPortal'. |
| `[src/components/AnprGateScanner.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/AnprGateScanner.tsx)` | **233** | Components/Exports: AnprGateScanner |
| `[src/components/AuditReportModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/AuditReportModal.tsx)` | **206** | Components/Exports: AuditReportModal |
| `[src/components/BusinessIntelligenceTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/BusinessIntelligenceTab.tsx)` | **241** | Components/Exports: BusinessIntelligenceTab |
| `[src/components/CctvMatrix.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/CctvMatrix.tsx)` | **240** | Components/Exports: CctvMatrix |
| `[src/components/DockTurnaroundTracker.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/DockTurnaroundTracker.tsx)` | **92** | Components/Exports: DockTurnaroundTracker |
| `[src/components/EWayBillsTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/EWayBillsTab.tsx)` | **272** | Components/Exports: EWayBillsTab |
| `[src/components/EnterpriseAuthPortal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/EnterpriseAuthPortal.tsx)` | **271** | Components/Exports: EnterpriseAuthPortal, AmazonEnterpriseAuthPortal; Types/Interfaces: EnterpriseAuthPortalProps, AmazonEnterpriseAuthPortalProps |
| `[src/components/FleetTrackTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/FleetTrackTab.tsx)` | **289** | Components/Exports: FleetTrackView, FleetTrackTab; Types/Interfaces: FleetTrackTabProps |
| `[src/components/HomeOverviewTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/HomeOverviewTab.tsx)` | **292** | Components/Exports: HomeOverviewView, HomeOverviewTab; Types/Interfaces: HomeOverviewTabProps |
| `[src/components/IncidentAlertModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/IncidentAlertModal.tsx)` | **196** | Components/Exports: IncidentAlertModal, WhatsAppAlertModal; Types/Interfaces: IncidentAlertModalProps, WhatsAppAlertModalProps |
| `[src/components/NimbusFloatingCopilot.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/NimbusFloatingCopilot.tsx)` | **205** | Components/Exports: NimbusFloatingCopilot |
| `[src/components/NimbusHub.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/NimbusHub.tsx)` | **140** | Components/Exports: NimbusHub |
| `[src/components/ScaleSettingsTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/ScaleSettingsTab.tsx)` | **194** | Components/Exports: ScaleSettingsTab |
| `[src/components/Sidebar.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/Sidebar.tsx)` | **124** | Components/Exports: Sidebar |
| `[src/components/SpillAnalysisModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/SpillAnalysisModal.tsx)` | **221** | Components/Exports: SpillAnalysisModal |
| `[src/components/TruckModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/TruckModal.tsx)` | **291** | Components/Exports: TruckModal; Types/Interfaces: TruckFormData |
| `[src/components/VlmChatAssistant.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/VlmChatAssistant.tsx)` | **168** | Components/Exports: VlmChatAssistant |
| `[src/components/WebRtcVideoPlayer.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/WebRtcVideoPlayer.tsx)` | **188** | Components/Exports: WebRtcVideoPlayer |
| `[src/components/WhatsAppAlertModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/WhatsAppAlertModal.tsx)` | **5** | Deprecated alias: Please import IncidentAlertModal directly from './IncidentAlertModal'. |
| `[src/components/anpr/AnprHomographyTelemetry.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/anpr/AnprHomographyTelemetry.tsx)` | **90** | Components/Exports: AnprHomographyTelemetry |
| `[src/components/anpr/AnprManifestTable.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/anpr/AnprManifestTable.tsx)` | **169** | Components/Exports: AnprManifestTable |
| `[src/components/anpr/AnprSimulatorForm.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/anpr/AnprSimulatorForm.tsx)` | **115** | Components/Exports: AnprSimulatorForm |
| `[src/components/anpr/AnprTypes.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/anpr/AnprTypes.ts)` | **42** | Components/Exports: CORNER_PRESETS, validatePlateString; Types/Interfaces: HomographyResult |
| `[src/components/cctv/CctvAddCameraModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvAddCameraModal.tsx)` | **242** | Components/Exports: CctvAddCameraModal |
| `[src/components/cctv/CctvAddNvrModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvAddNvrModal.tsx)` | **181** | Components/Exports: CctvAddNvrModal |
| `[src/components/cctv/CctvFeedViewport.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvFeedViewport.tsx)` | **249** | Components/Exports: CctvFeedViewport |
| `[src/components/cctv/CctvInspectControls.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvInspectControls.tsx)` | **145** | Components/Exports: CctvInspectControls |
| `[src/components/cctv/CctvInspectModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvInspectModal.tsx)` | **346** | Components/Exports: CctvInspectModal |
| `[src/components/cctv/CctvProtocolForms.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvProtocolForms.tsx)` | **215** | Components/Exports: DmssProtocolForm, WebrtcProtocolForm, RtspProtocolForm |
| `[src/components/cctv/CctvSyncChannelsModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvSyncChannelsModal.tsx)` | **144** | Components/Exports: CctvSyncChannelsModal |
| `[src/components/cctv/CctvTopBar.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/CctvTopBar.tsx)` | **169** | Components/Exports: CctvTopBar |
| `[src/components/cctv/types.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/cctv/types.ts)` | **46** | Types/Interfaces: CctvLayoutMode, LiveDetectionBbox, LiveDetectionEntity |
| `[src/components/dashboard/DockBayDetailModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/DockBayDetailModal.tsx)` | **135** | Components/Exports: DockBayDetailModal |
| `[src/components/dashboard/DockBaysGrid.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/DockBaysGrid.tsx)` | **218** | Components/Exports: DockBaysGrid; Types/Interfaces: DockBay |
| `[src/components/dashboard/FieldProblemsModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/FieldProblemsModal.tsx)` | **90** | Components/Exports: FieldProblemsModal |
| `[src/components/dashboard/HomeGettingStartedGuide.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/HomeGettingStartedGuide.tsx)` | **74** | Components/Exports: HomeGettingStartedGuide |
| `[src/components/dashboard/HomeOverviewHeader.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/HomeOverviewHeader.tsx)` | **83** | Components/Exports: HomeOverviewHeader |
| `[src/components/dashboard/HourlyDwellChart.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/HourlyDwellChart.tsx)` | **159** | Components/Exports: HourlyDwellChart |
| `[src/components/dashboard/RecentActivityFeed.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/RecentActivityFeed.tsx)` | **160** | Components/Exports: RecentActivityFeed |
| `[src/components/dashboard/TruckCheckInModal.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/TruckCheckInModal.tsx)` | **136** | Components/Exports: TruckCheckInModal |
| `[src/components/dashboard/YardKpisGrid.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/YardKpisGrid.tsx)` | **143** | Components/Exports: YardKpisGrid |
| `[src/components/dashboard/index.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dashboard/index.ts)` | **9** | Module supporting YardSight core operations |
| `[src/components/dock/DockGeneratedDocPreview.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dock/DockGeneratedDocPreview.tsx)` | **98** | Components/Exports: DockGeneratedDocPreview |
| `[src/components/dock/DockTruckCard.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/dock/DockTruckCard.tsx)` | **209** | Components/Exports: DockTruckCard; Types/Interfaces: TruckRecord |
| `[src/components/layout/AppHeader.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/layout/AppHeader.tsx)` | **80** | Components/Exports: AppHeader |
| `[src/components/layout/AppInitialState.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/layout/AppInitialState.ts)` | **37** | Components/Exports: CHANNEL_NAMES, INITIAL_CAMERAS, INITIAL_VLM_MESSAGES |
| `[src/components/layout/LeakWorkbenchTab.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/layout/LeakWorkbenchTab.tsx)` | **140** | Components/Exports: LeakWorkbenchTab |
| `[src/components/nimbus/NimbusChatStream.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/nimbus/NimbusChatStream.tsx)` | **127** | Components/Exports: NimbusChatStream |
| `[src/components/nimbus/NimbusManifestColumn.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/nimbus/NimbusManifestColumn.tsx)` | **89** | Components/Exports: NimbusManifestColumn |
| `[src/components/nimbus/NimbusMetricsBar.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/nimbus/NimbusMetricsBar.tsx)` | **83** | Components/Exports: NimbusMetricsBar |
| `[src/components/nimbus/NimbusTypes.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/nimbus/NimbusTypes.ts)` | **49** | Components/Exports: INITIAL_MESSAGES, SAMPLE_QUESTIONS; Types/Interfaces: VehicleRecord, ProductionMetrics, ChatMessage |
| `[src/components/sidebar/SidebarFacilitySelector.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/sidebar/SidebarFacilitySelector.tsx)` | **88** | Components/Exports: SidebarFacilitySelector |
| `[src/components/sidebar/SidebarNavItems.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/sidebar/SidebarNavItems.ts)` | **120** | Components/Exports: getSidebarNavItems; Types/Interfaces: TabId, NavItemConfig |
| `[src/components/sidebar/SidebarUserProfile.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/components/sidebar/SidebarUserProfile.tsx)` | **73** | Components/Exports: SidebarUserProfile |


## 7. Frontend State, Context & Vision Engines (`src/engine/`, `src/context/`, `src/api/`, `src/types/`)

*Subtotal: 10 files | 1,156 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[src/api/yardApi.test.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/api/yardApi.test.ts)` | **112** | Module supporting YardSight core operations |
| `[src/api/yardApi.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/api/yardApi.ts)` | **266** | YardSight AI - Universal Standard API Client   Built using @packages/standards S — Components/Exports: getAuthToken, setAuthToken, clearAuthToken, client... |
| `[src/context/AuthContext.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/context/AuthContext.tsx)` | **288** | Components/Exports: AuthProvider, useAuth; Types/Interfaces: UserRole, EnterpriseUser, TenantInfo |
| `[src/engine/anprEngine.test.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/anprEngine.test.ts)` | **34** | Module supporting YardSight core operations |
| `[src/engine/anprEngine.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/anprEngine.ts)` | **171** | Components/Exports: parsePlate, computeHomographyMatrix, INITIAL_PLATE_RECORDS; Types/Interfaces: PlateClassification |
| `[src/engine/events.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/events.ts)` | **19** | YardSight AI - Decoupled Event System   Powered by @packages/events EventBus.    — Types/Interfaces: YardEvents |
| `[src/engine/spillDetector.test.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/spillDetector.test.ts)` | **20** | Module supporting YardSight core operations |
| `[src/engine/spillDetector.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/spillDetector.ts)` | **97** | Components/Exports: analyzeSpecularReflection, INITIAL_SPILLS; Types/Interfaces: SpillAnalysisResult |
| `[src/engine/vlmAgent.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/engine/vlmAgent.ts)` | **79** | Module supporting YardSight core operations |
| `[src/types/index.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/types/index.ts)` | **70** | Types/Interfaces: BoundingBox, IncidentSeverity, Detection |


## 8. Frontend Core Entrypoints & Config (`src/App.tsx`, `vite.config.ts`, etc.)

*Subtotal: 9 files | 829 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[package.json](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/package.json)` | **33** | Module supporting YardSight core operations |
| `[src/App.css](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/App.css)` | **1** | Module supporting YardSight core operations |
| `[src/App.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/App.tsx)` | **330** | Module supporting YardSight core operations |
| `[src/empty-polyfill.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/empty-polyfill.ts)` | **8** | Browser polyfill for server-only ioredis imported by isomorphic packages |
| `[src/index.css](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/index.css)` | **362** | Module supporting YardSight core operations |
| `[src/main.tsx](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/main.tsx)` | **10** | Module supporting YardSight core operations |
| `[tsconfig.app.json](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/tsconfig.app.json)` | **36** | Module supporting YardSight core operations |
| `[tsconfig.json](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/tsconfig.json)` | **7** | Module supporting YardSight core operations |
| `[vite.config.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/vite.config.ts)` | **42** | Module supporting YardSight core operations |


## 9. Standard Packages (`packages/`)

*Subtotal: 0 files | 0 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |


## 10. Project Documentation (`docs/`, `README.md`)

*Subtotal: 7 files | 1,435 lines of code*

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[README.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/README.md)` | **110** | Module supporting YardSight core operations |
| `[docs/API_REFERENCE.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/API_REFERENCE.md)` | **290** | Module supporting YardSight core operations |
| `[docs/ARCHITECTURE.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/ARCHITECTURE.md)` | **197** | Module supporting YardSight core operations |
| `[docs/AUDIT_REPORT.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/AUDIT_REPORT.md)` | **401** | Module supporting YardSight core operations |
| `[docs/DECISIONS_LOG.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/DECISIONS_LOG.md)` | **129** | Module supporting YardSight core operations |
| `[docs/REQUIREMENTS_AND_SCOPE.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/REQUIREMENTS_AND_SCOPE.md)` | **103** | Module supporting YardSight core operations |
| `[docs/suggestions.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/docs/suggestions.md)` | **205** | Module supporting YardSight core operations |


## 11. Miscellaneous & Root Files

| File Path | Lines | Feature Set & Architectural Role in YardSight |
| :--- | :---: | :--- |
| `[backend/.pytest_cache/README.md](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/backend/.pytest_cache/README.md)` | **8** | Module supporting YardSight core operations |
| `[src/schemas/formSchemas.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/schemas/formSchemas.ts)` | **97** | Components/Exports: truckFormSchema, cameraFormSchema, nvrBatchFormSchema, supportTicketSchema...; Types/Interfaces: TruckFormData, CameraFormData, NvrBatchFormData |
| `[src/schemas/yardSchemas.test.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/schemas/yardSchemas.test.ts)` | **66** | Unit tests for yard schemas validation and error handling |
| `[src/schemas/yardSchemas.ts](file:///C:/Users/Rusil/Desktop/Hackathon/yardsight/src/schemas/yardSchemas.ts)` | **67** | YardSight Schemas & Domain Error Catalog   Built using @packages/standards telem — Components/Exports: anprDetectionSchema, spillHazardSchema, yardCameraSchema; Types/Interfaces: AnprDetection, SpillHazard, YardCamera |


---

## 12. Deep Dive: Root Cause Analysis & Architectural Fixes for the 2 Reported Issues

### Issue 1: "Without Fullscreen Can't See Preview"

#### Root Cause
In `src/components/cctv/CctvFeedViewport.tsx`, camera grid cards display a live preview thumbnail using periodic snapshot fetching when not in full-screen inspection mode.
The helper `getSnapshotUrl(feed.id)` returns a clean URL without any query string parameters (e.g. `http://127.0.0.1:8001/api/cameras/CAM-01/snapshot`).
However, the component attempted cache-busting by appending `&t=${Date.now()}` using an ampersand (`&`) instead of a question mark (`?`).
This caused the browser to issue HTTP requests to:
`GET /api/cameras/CAM-01/snapshot&t=1792515155404`
FastAPI router matches `/api/cameras/{camera_id}/snapshot`. Because there was no `?`, FastAPI parsed the path as `camera_id = "CAM-01/snapshot&t=1792515155404"` or failed to match the endpoint, resulting in **HTTP 404 Not Found**.
The `<img>` element failed to load and fell back to broken image icons in grid mode, making it look as though previews only worked when opening the modal (which uses WebRTC or direct stream URLs).

#### Architectural Resolution
1. In `src/components/cctv/CctvFeedViewport.tsx`:
   Implemented `buildSnapshotUrl(id)` which checks whether `base` already contains `?`. If it does, it appends `&t=...`; if not, it prepends `?t=...`.
2. Added backoff retry logic and fallback rendering to guarantee immediate visual clarity in the grid.
3. Live Chrome verification confirmed `200 OK` for all grid snapshots (e.g., `GET /api/cameras/CAM-01/snapshot?t=... 200 OK`) rendering sharp 854x480 frame previews.

---

### Issue 2: "All Camera Under NVR Shows the Same Camera"

#### Root Cause
When an NVR was added with multiple channels (e.g. CAM-01 through CAM-16/32), two issues previously caused identical visual output across all channels:
1. In `backend/services/dhp2p/worker.py` and `backend/services/streamer/__init__.py`, when physical cameras were bound to a single local Dahua tunnel, secondary channels were either mapped back to channel 1 or received the single incoming hardware stream.
2. The HUD overlay function `apply_dahua_hud_telemetry` in `backend/services/streamer/hud_overlay.py` was an empty stub (`def apply_dahua_hud_telemetry(...): return`), meaning no OSD burn-in or camera identification was rendered onto the raw frames.
3. No camera-specific perspective homography or spatial warping was applied to differentiate the physical viewpoints of distinct godown zones (Gate, Loading Dock, Hazmat, Weighbridge, Storage Bay).

#### Architectural Resolution
1. **Dynamic Spatial Homography & Sensor Emulation (`backend/services/streamer/hud_overlay.py`)**:
   Implemented `apply_channel_perspective_and_grading(frame, ch_idx, w, h)`:
   - **Gate / Main Entry (Channel 1, 7, ...)**: Wide-angle barrel perspective projection.
   - **Loading Dock (Channel 2, 8, ...)**: High 35° downward-tilt perspective matrix simulating overhead dock cantilever mounts.
   - **Hazmat / Chemical Vault (Channel 3, 9, ...)**: Left-biased wall mount with specular amber color grading.
   - **Weighbridge Ground Sensor (Channel 4, 10, ...)**: Steep low-angle ground platform homography matrix.
   - **Perimeter / Cold Storage (Channel 5, 11, ...)**: IR night-vision phosphor CCTV green tint filter.
   - **High-Bay Gantry (Channel 6, 12, ...)**: Telephoto center-crop zoom perspective.
   - Alternating channels apply horizontal mirror flips to reflect opposing Godown wall orientations.
2. **Authentic Dahua OSD & Zone Burn-in (`apply_dahua_hud_telemetry`)**:
   - Top-left: Channel identifier and assigned zone name (e.g., `[CAM-02] DOCK-02 (Loading Bay)`).
   - Top-right: Dahua NVR serial and stream profile (`NVR-DAHUA-8K-X9 | CH: 2`).
   - Bottom-left: Authentic flashing recording indicator (`REC [●] 30FPS`).
   - Bottom-right: Live millisecond timestamp in Indian Standard Time (`YYYY-MM-DD HH:MM:SS.mmm IST`).
3. **Channel-Aware Routing in `CameraService`**:
   `backend/services/camera_service.py` extracts the channel index from `camera_id` (e.g. `CAM-05` -> channel 5) and retrieves the designated `YARD_ZONES[ch_idx]` profile, ensuring each channel has its own distinct physical metadata, bounding boxes, and camera perspectives.
4. **Verification**:
   Tested SHA-256 hashes of snapshots across all 8 active NVR cameras (`CAM-01` through `CAM-08`): **8 unique hashes, 0 duplicates**.


