"""
YardSight AI - ANPR & Homography Vision Pydantic Schemas
"""

from typing import Optional, List
from pydantic import BaseModel, Field

class ANPRUnwarpRequest(BaseModel):
    plate_hint: Optional[str] = Field("MH 12 RN 4589", description="Expected or OCR recognized license plate string")
    country: Optional[str] = Field("IN", description="Country standard (IN or US)")
    image_b64: Optional[str] = Field(None, description="Optional raw CCTV image to unwarp via homography")
    corner_points: Optional[List[List[float]]] = Field(
        None,
        description="4 corner points [[x1,y1], [x2,y2], [x3,y3], [x4,y4]] defining the plate quadrilateral"
    )

class ANPRUnwarpResponse(BaseModel):
    plate_number: str
    country: str
    confidence_pct: float
    raw_cctv_b64: str
    unwarped_plate_b64: str
    clahe_enhanced_b64: Optional[str] = None
    corners: Optional[List[List[float]]] = None
    homography_matrix: Optional[List[List[float]]] = None
    is_valid_format: bool = True
    format_details: Optional[str] = None
    processing_time_ms: float
