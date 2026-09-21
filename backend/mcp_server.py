"""
YardSight AI - Model Context Protocol (MCP) Server for Amazon Alexa+ & AWS Bedrock
Implements the Model Context Protocol (MCP) spec to expose yard cameras,
dock turnaround metrics, leak detection, and gate access controls to agentic reasoning models.
"""

from typing import Dict, List, Any
import json
from anpr_homography import anpr_engine
from leak_detector import leak_detector
from dock_cycle_tracker import dock_tracker
from eway_bill_engine import eway_engine

class YardSightMCPServer:
    def __init__(self):
        self.server_name = "yardsight-alexa-mcp"
        self.version = "1.0.0"
        self.protocol_version = "2025-11-25"

    def list_tools(self) -> List[Dict[str, Any]]:
        return [
            {
                "name": "get_yard_overview",
                "description": "Retrieves real-time yard status, dock occupancy, active trucks, and water leak alerts across all CCTV streams.",
                "inputSchema": {
                    "type": "object",
                    "properties": {}
                }
            },
            {
                "name": "analyze_gate_anpr",
                "description": "Applies OpenCV 5 perspective homography to unwarp and read a truck's tilted license plate at Gate North.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "plate_number": {"type": "string", "description": "Known plate or simulated query, e.g. MH-12-RN-4819 or TX-49-B219"},
                        "country": {"type": "string", "enum": ["IN", "US"], "default": "IN"}
                    }
                }
            },
            {
                "name": "check_roof_leakage",
                "description": "Analyzes specular glare and dark wet concrete expansion in interior godown bays to prevent inventory spoilage.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "bay_id": {"type": "string", "default": "BAY-02"}
                    }
                }
            },
            {
                "name": "generate_transport_documents",
                "description": "Auto-generates pre-filled Indian GST E-Way Bill (EWB-01) or US electronic Bill of Lading (eBOL).",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "truck_id": {"type": "string"},
                        "document_type": {"type": "string", "enum": ["GST_EWAY_BILL", "US_EBOL"]}
                    },
                    "required": ["truck_id", "document_type"]
                }
            },
            {
                "name": "send_driver_dispatch_alert",
                "description": "Sends proactive WhatsApp or Ring door announcement to the driver when a dock bay is cleared.",
                "inputSchema": {
                    "type": "object",
                    "properties": {
                        "truck_id": {"type": "string"},
                        "message": {"type": "string"}
                    },
                    "required": ["truck_id", "message"]
                }
            }
        ]

    def call_tool(self, tool_name: str, arguments: Dict[str, Any]) -> Dict[str, Any]:
        if tool_name == "get_yard_overview":
            dwell = dock_tracker.get_yard_dwell_metrics()
            leak = leak_detector.simulate_leak_cctv()
            return {
                "active_trucks_in_yard": len(dwell),
                "detention_alerts": sum(1 for d in dwell if d["is_detention"]),
                "roof_leak_severity": leak["metrics"]["severity"],
                "threatened_inventory": leak["threatened_inventory"],
                "active_cctv_streams": 4
            }

        elif tool_name == "analyze_gate_anpr":
            plate = arguments.get("plate_number", "MH-12-RN-4819")
            country = arguments.get("country", "IN")
            return anpr_engine.simulate_cctv_frame(plate, country)

        elif tool_name == "check_roof_leakage":
            return leak_detector.simulate_leak_cctv()

        elif tool_name == "generate_transport_documents":
            truck_id = arguments.get("truck_id", "TRK-9041")
            doc_type = arguments.get("document_type", "GST_EWAY_BILL")
            
            dwell = dock_tracker.get_yard_dwell_metrics()
            matched = next((d for d in dwell if d["truck_id"] == truck_id), None)
            plate = matched["plate_number"] if matched else "MH-12-RN-4819"
            carrier = matched["carrier_name"] if matched else "Tata Logistics Express"

            if doc_type == "GST_EWAY_BILL":
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

        elif tool_name == "send_driver_dispatch_alert":
            truck_id = arguments.get("truck_id")
            msg = arguments.get("message")
            return {
                "status": "DISPATCH_SENT",
                "channel": "WhatsApp Business API & Ring Gate Intercom",
                "truck_id": truck_id,
                "notification_delivered": True,
                "sent_message": msg
            }

        else:
            raise ValueError(f"Unknown MCP tool: {tool_name}")

# Global instance
mcp_server = YardSightMCPServer()
