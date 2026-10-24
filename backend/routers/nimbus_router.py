"""
YardSight AI - Nimbus Multimodal Business Intelligence Router
Exposes operational context endpoints and conversational Q&A over CCTV visual data.
"""

from fastapi import APIRouter, status
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any, List
from services.nimbus_agent import nimbus_engine

router = APIRouter(prefix="/nimbus", tags=["Nimbus AI Business Intelligence"])

class NimbusChatRequest(BaseModel):
    prompt: str = Field(..., description="Operator natural-language query")
    camera_id: Optional[str] = Field("CAM-01", description="Associated CCTV camera identifier")
    image_b64: Optional[str] = Field(None, description="Optional CCTV snapshot base64 image")

class NimbusChatResponse(BaseModel):
    role: str = "assistant"
    content: str
    referenced_camera_id: Optional[str] = "CAM-01"
    timestamp: str
    confidence: float = 0.95

class IngestPlateRequest(BaseModel):
    plate: str
    carrier: Optional[str] = "Independent Carrier"
    gate: Optional[str] = "Gate 01 Inbound"
    direction: Optional[str] = "INBOUND"
    cargo: Optional[str] = "Commercial Freight"

@router.get("/context", status_code=status.HTTP_200_OK)
def get_operational_context():
    """Returns the live aggregated operational context of the business."""
    return nimbus_engine.get_context_summary()

@router.post("/chat", response_model=NimbusChatResponse, status_code=status.HTTP_200_OK)
def chat_with_nimbus(req: NimbusChatRequest):
    """
    Submits a natural language query to Nimbus regarding yard operations,
    license plates, briquette line throughput, or safety diagnostics.
    """
    res = nimbus_engine.answer_query(
        prompt=req.prompt,
        camera_id=req.camera_id,
        image_b64=req.image_b64
    )
    return NimbusChatResponse(**res)

@router.post("/ingest/plate", status_code=status.HTTP_201_CREATED)
def ingest_license_plate(req: IngestPlateRequest):
    """Ingests a verified ANPR license plate into the Nimbus business memory bank."""
    nimbus_engine.ingest_anpr_plate(
        plate=req.plate,
        carrier=req.carrier or "Commercial Carrier",
        gate=req.gate or "Gate 01 Inbound",
        direction=req.direction or "INBOUND",
        cargo=req.cargo or "Industrial Goods"
    )
    return {"status": "SUCCESS", "message": f"Plate {req.plate} recorded in Nimbus memory"}
