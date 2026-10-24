"""
YardSight AI (GodownOS) - Enterprise FastAPI Server
Multi-Camera Industrial Vision & Physical AI for Logistics Hubs & Rented Godowns.
Engineered with Service-Oriented Architecture (SOA) and Pydantic v2 validation.
"""

import os
os.environ["OPENCV_FFMPEG_CAPTURE_OPTIONS"] = "rtsp_transport;tcp|allowed_media_types;video|stimeout;4000000"

import json
from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from seed_data import init_db
from scale_engine import rate_limiter
from routers import api_router

# 1. Initialize Database Schema & Core Tables
init_db()

# 1.1 GPU Hardware Acceleration (NVIDIA RTX 4060 OpenCL)
import cv2
if cv2.ocl.haveOpenCL():
    cv2.ocl.setUseOpenCL(True)
    try:
        print(f"[GPU ACCELERATION] OpenCV OpenCL enabled on GPU: {cv2.ocl.Device.getDefault().name()}")
    except Exception:
        pass

# 1.2 Live Video Stream & WebRTC Ingestion (Active) with Heavy AI Vision Paused for Low-RAM
DISABLE_VIDEO_STREAM = os.environ.get("DISABLE_VIDEO_STREAM", "0").lower() in ("true", "1", "yes")
DISABLE_CV_AI = os.environ.get("DISABLE_CV_AI", "1").lower() in ("true", "1", "yes")

if not DISABLE_VIDEO_STREAM:
    from services.dolynk_service import dolynk_service
    dolynk_service.start_background_worker()

    from services.dhp2p import dhp2p_service
    import time
    for ch in [1, 2, 3, 4, 6]:
        dhp2p_service.worker.start_worker("BE124E0PCA95532", channel=ch)
        time.sleep(0.3)

    from services.webrtc_service import webrtc_service
    webrtc_service.ensure_running()

if not DISABLE_CV_AI:
    from services.streamer.vision_tracker import vision_tracker
    vision_tracker.yolo.warmup()
else:
    print("[OPENCV AI] Heavy CV inference (MOG2/HOG/YOLO) paused to optimize RAM. Pure GPU video stream active.")

# 2. Instantiate Production FastAPI Application
app = FastAPI(
    title="YardSight AI (GodownOS) Enterprise API",
    description="Multi-Camera Industrial Vision, Physical AI & 100k Scale Logistics Platform with Service Architecture",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

from fastapi_standards import register_standards_exception_handlers
register_standards_exception_handlers(app)

# 3. High-Concurrency Token-Bucket Rate Limiter Middleware (100k Tier)
@app.middleware("http")
async def rate_limiting_and_scale_middleware(request: Request, call_next):
    client_ip = request.client.host if request.client else "127.0.0.1"
    is_allowed, remaining_tokens, retry_after = rate_limiter.allow_request(client_ip)

    if not is_allowed:
        return Response(
            content='{"error": "Too Many Requests", "message": "Rate limit exceeded for 100k concurrent tier. Please throttle.", "retry_after": ' + str(retry_after) + '}',
            status_code=429,
            media_type="application/json",
            headers={"Retry-After": str(retry_after), "X-RateLimit-Remaining": "0"}
        )

    response = await call_next(request)
    response.headers["X-RateLimit-Limit"] = "100000"
    response.headers["X-RateLimit-Remaining"] = str(remaining_tokens)
    return response

# 3.1 Enterprise Security Headers Middleware
@app.middleware("http")
async def security_headers_middleware(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    return response

# 4. Enterprise Hardened CORS Configuration
ALLOWED_ORIGINS = [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:5175",
    "http://localhost:5176",
    "http://localhost:5177",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
    "http://127.0.0.1:5175",
    "http://127.0.0.1:5176",
    "http://127.0.0.1:5177",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"]
)

# Global Standardized Exception Handler (Eliminates raw 500 crashes)
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    import traceback
    print(f"[YARDSIGHT UNHANDLED ERROR] {request.method} {request.url.path}: {exc}")
    traceback.print_exc()
    return Response(
        content=json.dumps({
            "error": "Internal Server Error",
            "detail": str(exc),
            "path": request.url.path,
            "status_code": 500
        }),
        status_code=500,
        media_type="application/json"
    )

# 5. Mount Modular Service Routers
app.include_router(api_router)
app.include_router(api_router, prefix="/api")
app.include_router(api_router, prefix="/api/v1")

@app.get("/")
def root_index():
    """YardSight AI root health and documentation entrypoint."""
    return {
        "platform": "YardSight AI (GodownOS)",
        "version": "2.0.0",
        "architecture": "Service-Oriented Architecture (SOA) with Pydantic v2",
        "docs": "/docs",
        "status": "OPERATIONAL"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8001)
