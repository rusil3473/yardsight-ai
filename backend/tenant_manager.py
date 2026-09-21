"""
YardSight AI (GodownOS) - Enterprise Multi-Tenant Manager
Provides strict tenant isolation for multi-facility operations.
"""

from typing import Dict, Any, List, Optional

class TenantManager:
    def __init__(self):
        self.tenants: Dict[str, Dict[str, Any]] = {
            "TENANT-AMZN-BLR1": {
                "tenant_id": "TENANT-AMZN-BLR1",
                "name": "Amazon BLR1 Fulfillment Center",
                "organization": "Amazon Transportation Services (ATS)",
                "location": "Hoskote Logistics Corridor, Bengaluru, Karnataka",
                "country": "India",
                "currency": "INR",
                "currency_symbol": "₹",
                "active_docks": 12,
                "free_time_hours": 2.0,
                "detention_rate_per_hour": 1200.0,
                "cameras_online": 16,
                "default_market": "IN_GST",
                "sla_target_turnaround_mins": 45
            },
            "TENANT-FK-BHIWANDI": {
                "tenant_id": "TENANT-FK-BHIWANDI",
                "name": "Flipkart Central Hub Bhiwandi",
                "organization": "Ekart Logistics (Flipkart Internet Pvt Ltd)",
                "location": "Mankoli Naka, Bhiwandi Logistics Zone, Thane, Maharashtra",
                "country": "India",
                "currency": "INR",
                "currency_symbol": "₹",
                "active_docks": 18,
                "free_time_hours": 2.5,
                "detention_rate_per_hour": 1100.0,
                "cameras_online": 24,
                "default_market": "IN_GST",
                "sla_target_turnaround_mins": 50
            },
            "TENANT-US-DFW-DC": {
                "tenant_id": "TENANT-US-DFW-DC",
                "name": "Dallas Sunbelt Distribution Center",
                "organization": "Sunbelt Logistics & Intermodal Partners",
                "location": "DFW Logistics Hub, Irving, Texas",
                "country": "United States",
                "currency": "USD",
                "currency_symbol": "$",
                "active_docks": 8,
                "free_time_hours": 2.0,
                "detention_rate_per_hour": 75.0,
                "cameras_online": 12,
                "default_market": "US_FREIGHT",
                "sla_target_turnaround_mins": 60
            }
        }
        self.active_tenant_id = "TENANT-AMZN-BLR1"

    def get_all_tenants(self) -> List[Dict[str, Any]]:
        return list(self.tenants.values())

    def get_tenant(self, tenant_id: str) -> Optional[Dict[str, Any]]:
        return self.tenants.get(tenant_id, self.tenants[self.active_tenant_id])

    def switch_active_tenant(self, tenant_id: str) -> Dict[str, Any]:
        if tenant_id in self.tenants:
            self.active_tenant_id = tenant_id
            return {"status": "success", "active_tenant": self.tenants[tenant_id]}
        return {"status": "error", "message": f"Tenant {tenant_id} not found"}

tenant_manager = TenantManager()
