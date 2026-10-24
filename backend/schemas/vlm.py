"""
YardSight AI - Vision-Language Model (VLM) Pydantic Schemas
Supports Nebius AI Studio (OpenAI-compatible) and deterministic spatial reasoning.
"""

from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

class VlmChatRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="Natural language spatial or incident query")
    camera_id: Optional[str] = Field("cam-01", description="Target camera identifier (e.g. cam-01, cam-02)")
    image_b64: Optional[str] = Field(None, description="Optional raw base64 JPEG snapshot for multimodal VLM analysis")
    api_key: Optional[str] = Field(None, description="Optional user-provided Nebius API key for dynamic evaluation")
    context: Optional[Dict[str, Any]] = Field(default_factory=dict, description="Active yard context (activePlates, openSpills, hazards)")

class VlmChatResponse(BaseModel):
    id: str = Field(..., description="Unique message ID")
    role: str = Field("assistant", description="Message author role")
    content: str = Field(..., description="Generated VLM analysis text")
    timestamp: str = Field(..., description="UTC ISO timestamp")
    model: str = Field(..., description="Model identifier used for inference")
    referenced_camera_id: Optional[str] = Field(None, description="Camera referenced in the analysis")
    spatial_detections: Optional[List[Dict[str, Any]]] = Field(None, description="Detected spatial bounding boxes or hazard points")
    latency_ms: float = Field(..., description="Inference latency in milliseconds")
