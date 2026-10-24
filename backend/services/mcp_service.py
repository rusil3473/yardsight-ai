"""
YardSight AI - Model Context Protocol (MCP) Service Layer
"""

from typing import Dict, Any, List
from mcp_server import mcp_server
from schemas.mcp import McpInvokeRequest, McpInvokeResponse, McpToolDefinition

class McpService:
    """Service encapsulating Model Context Protocol (MCP v2025-11-25) agent tool routing."""

    @staticmethod
    def list_tools() -> List[McpToolDefinition]:
        raw_tools = mcp_server.list_tools()
        return [
            McpToolDefinition(
                name=t["name"],
                description=t["description"],
                inputSchema=t.get("inputSchema", {})
            )
            for t in raw_tools
        ]

    @staticmethod
    def invoke(req: McpInvokeRequest) -> McpInvokeResponse:
        res = mcp_server.call_tool(req.tool_name, req.arguments)
        return McpInvokeResponse(
            status="SUCCESS" if "error" not in res else "ERROR",
            tool=req.tool_name,
            result=res
        )

mcp_service = McpService()
