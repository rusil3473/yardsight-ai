"""
YardSight AI - Transport Documents & eBOL Pydantic Schemas
"""

from typing import Optional, Dict, Any
from pydantic import BaseModel, Field

class DocumentGenerateRequest(BaseModel):
    truck_id: str = Field(..., description="Unique truck identifier")
    doc_type: str = Field("GST_EWAY_BILL", description="GST_EWAY_BILL or US_EBOL")
    tenant_id: Optional[str] = Field("TENANT-MY-HUB", description="Tenant ID")

class DocumentResponse(BaseModel):
    document_id: str
    doc_type: str
    truck_id: str
    status: str
    qr_code_b64: Optional[str] = None
    generated_at: str
    document_data: Dict[str, Any]
