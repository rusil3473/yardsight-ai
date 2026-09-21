"""
YardSight AI (GodownOS) - Main FastAPI Server
Powers industrial CCTV multi-camera intelligence, OpenCV 5 ANPR homography unwarping,
specular reflection roof leak detection, dock dwell tracking, and Amazon Alexa+ MCP.
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any

from anpr_homography import anpr_engine
from leak_detector import leak_detector
from dock_cycle_tracker import dock_tracker
from eway_bill_engine import eway_engine
from mcp_server import mcp_server

app = FastAPI(
    title="YardSight AI (GodownOS) API",
    description="Multi-Camera Industrial Vision & Physical AI for Logistics Hubs & Rented Godowns",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

class DocumentGenRequest(BaseModel):
    truck_id: str
    doc_type: str = "GST_EWAY_BILL"  # "GST_EWAY_BILL" or "US_EBOL"

class DispatchAlertRequest(BaseModel):
    truck_id: str
    message: str
    channel: Optional[str] = "WhatsApp"

class MCPCallRequest(BaseModel):
    tool_name: str
    arguments: Dict[str, Any] = {}

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "service": "YardSight AI (GodownOS) Core",
        "version": "1.0.0",
        "modules": [
            "opencv_homography_anpr",
            "specular_leak_detector",
            "dock_dwell_tracker",
            "eway_bill_engine",
            "alexa_mcp_server"
        ],
        "opencv_version": "5.0.0",
        "mcp_protocol_version": "2025-11-25"
    }

@app.get("/api/anpr/unwarp")
def get_anpr_unwarp(plate: str = "MH-12-RN-4819", country: str = "IN"):
    return anpr_engine.simulate_cctv_frame(plate, country)

@app.get("/api/leak/status")
def get_leak_status(intensity: float = 0.65):
    return leak_detector.simulate_leak_cctv(intensity)

@app.get("/api/dwell/trucks")
def get_dwell_trucks():
    return dock_tracker.get_yard_dwell_metrics()

@app.post("/api/documents/generate")
def generate_documents(req: DocumentGenRequest):
    dwell = dock_tracker.get_yard_dwell_metrics()
    matched = next((d for d in dwell if d["truck_id"] == req.truck_id), None)
    plate = matched["plate_number"] if matched else "MH-12-RN-4819"
    carrier = matched["carrier_name"] if matched else "Tata Logistics Express"

    if req.doc_type == "GST_EWAY_BILL":
        return eway_engine.generate_gst_eway_bill(
            vehicle_number=plate,
            transporter_name=carrier,
            cargo_description="24 Pallets (Commercial FMCG / Electronics)"
        )
    else:
        return eway_engine.generate_us_ebol(
            truck_plate=plate,
            carrier_name=carrier,
            cargo_description="24 Pallets (General Freight)"
        )

@app.post("/api/dispatch/alert")
def send_dispatch_alert(req: DispatchAlertRequest):
    return {
        "status": "DELIVERED",
        "truck_id": req.truck_id,
        "channel": req.channel,
        "payload": req.message,
        "timestamp": "2026-09-22T03:40:00Z"
    }

@app.get("/api/mcp/tools")
def get_mcp_tools():
    return mcp_server.list_tools()

@app.post("/api/mcp/call")
def call_mcp_tool(req: MCPCallRequest):
    try:
        return mcp_server.call_tool(req.tool_name, req.arguments)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
