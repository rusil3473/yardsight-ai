"""
YardSight AI - Model Context Protocol (MCP) Router
"""

from typing import List
from fastapi import APIRouter
from schemas.mcp import McpToolDefinition, McpInvokeRequest, McpInvokeResponse
from services.mcp_service import mcp_service

router = APIRouter(prefix="/mcp", tags=["Model Context Protocol (MCP v2025-11-25)"])

@router.get("/tools", response_model=List[McpToolDefinition])
def list_mcp_agent_tools():
    """Lists standard MCP tool specifications exposed to AI reasoning agents."""
    return mcp_service.list_tools()

@router.post("/invoke", response_model=McpInvokeResponse)
def invoke_mcp_tool(req: McpInvokeRequest):
    """Executes an MCP tool with provided argument schema and returns structured tool results."""
    return mcp_service.invoke(req)
