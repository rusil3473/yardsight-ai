"""
YardSight AI - Authentication & RBAC Pydantic Schemas
"""

from typing import List, Optional
from pydantic import BaseModel, Field

class LoginRequest(BaseModel):
    email: str = Field(..., min_length=3, description="Enterprise corporate email address", json_schema_extra={"example": "admin@yardsight.corp"})
    password: Optional[str] = Field("admin123", description="User password", json_schema_extra={"example": "admin123"})
    role: Optional[str] = Field(None, description="Optional role preset")

class UserPayload(BaseModel):
    id: str
    email: str
    name: str
    role: str
    role_label: str
    tenant_id: str
    phone: Optional[str] = None
    department: Optional[str] = None
    avatar: Optional[str] = None
    permissions: List[str] = Field(default_factory=list)

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "Bearer"
    user: UserPayload

class RoleInfo(BaseModel):
    role: str
    label: str
    description: str
    permissions: List[str]
