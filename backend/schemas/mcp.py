"""
YardSight AI - Model Context Protocol (MCP v2025-11-25) Pydantic Schemas
"""

from typing import Dict, Any, List, Optional
from pydantic import BaseModel, Field

class McpToolDefinition(BaseModel):
    name: str
    description: str
    inputSchema: Dict[str, Any] = Field(default_factory=dict)

class McpInvokeRequest(BaseModel):
    tool_name: str = Field(..., description="Name of MCP tool to invoke")
    arguments: Dict[str, Any] = Field(default_factory=dict, description="Input parameters for tool")

class McpInvokeResponse(BaseModel):
    status: str
    tool: str
    result: Any
