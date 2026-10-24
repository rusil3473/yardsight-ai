"""
YardSight AI - Vision-Language Model (VLM) Router
Exposes Nebius AI Studio & NVIDIA Cosmos multimodal spatial reasoning endpoints.
"""

from fastapi import APIRouter, status
from schemas.vlm import VlmChatRequest, VlmChatResponse
from services.vlm_service import vlm_service

router = APIRouter(prefix="/vlm", tags=["Vision-Language Model (VLM) Spatial Reasoning"])

@router.post("/chat", response_model=VlmChatResponse, status_code=status.HTTP_200_OK)
def chat_with_vlm_agent(req: VlmChatRequest):
    """
    Submits a natural language query and optional camera frame base64 to the
    Nebius AI Studio VLM agent for spatial-temporal warehouse intelligence.
    """
    return vlm_service.process_chat(req)
