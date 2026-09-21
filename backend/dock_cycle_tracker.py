"""
YardSight AI - Dock Turnaround & Driver Detention Prevention Tracker
Monitors the complete truck lifecycle: Gate Arrival -> Dock-In -> Pallet Unloading -> Paperwork -> Departure.
Eliminates detention fee disputes and gate bottlenecks highlighted in r/Truckers and r/logistics.
"""

import time
from typing import Dict, List, Any, Optional

class DockCycleTracker:
    def __init__(self):
        self.trucks: Dict[str, Dict[str, Any]] = {}
        self.detention_threshold_minutes = 120  # Standard 2-hour free time window
        self.detention_rate_per_hour = 75.0      # $75/hr detention fee

        # Populate with realistic trucks currently in yard
        self.log_arrival(
            truck_id="TRK-9041",
            plate_number="MH-12-RN-4819",
            carrier_name="Tata Logistics Express",
            driver_name="Ramesh Sharma",
            driver_phone="+91-98765-43210",
            manifest_bol="BOL-2026-8819",
            assigned_bay="BAY-03",
            elapsed_minutes_ago=145  # Detained for 2h 25m!
        )

        self.log_arrival(
            truck_id="TRK-1022",
            plate_number="TX-49-B219",
            carrier_name="Swift Transportation US",
            driver_name="Dave Miller",
            driver_phone="+1-512-555-0199",
            manifest_bol="BOL-US-9901",
            assigned_bay="BAY-01",
            elapsed_minutes_ago=45   # Normal time (45 mins)
        )

    def log_arrival(
        self,
        truck_id: str,
        plate_number: str,
        carrier_name: str,
        driver_name: str,
        driver_phone: str,
        manifest_bol: str,
        assigned_bay: str,
        elapsed_minutes_ago: int = 0
    ) -> Dict[str, Any]:
        now = int(time.time())
        arrival_ts = now - (elapsed_minutes_ago * 60)

        record = {
            "truck_id": truck_id,
            "plate_number": plate_number,
            "carrier_name": carrier_name,
            "driver_name": driver_name,
            "driver_phone": driver_phone,
            "manifest_bol": manifest_bol,
            "assigned_bay": assigned_bay,
            "arrival_time": arrival_ts,
            "dock_in_time": arrival_ts + 900 if elapsed_minutes_ago > 15 else None,
            "unloading_complete_time": arrival_ts + 3600 if elapsed_minutes_ago > 60 else None,
            "departure_time": None,
            "status": "UNLOADING_COMPLETE" if elapsed_minutes_ago > 60 else "DOCK_UNLOADING" if elapsed_minutes_ago > 15 else "YARD_STAGED",
            "cargo_items": "24 Pallets (Commercial FMCG / Electronics)",
            "cargo_weight_kg": 14200
        }
        self.trucks[truck_id] = record
        return record

    def get_yard_dwell_metrics(self) -> List[Dict[str, Any]]:
        now = int(time.time())
        results = []

        for truck_id, t in self.trucks.items():
            dwell_seconds = now - t["arrival_time"]
            dwell_minutes = int(dwell_seconds / 60)
            
            is_detention = dwell_minutes > self.detention_threshold_minutes
            detention_minutes = max(0, dwell_minutes - self.detention_threshold_minutes)
            accrued_detention_fee = round((detention_minutes / 60.0) * self.detention_rate_per_hour, 2)

            results.append({
                **t,
                "dwell_minutes": dwell_minutes,
                "is_detention": is_detention,
                "detention_minutes": detention_minutes,
                "accrued_detention_fee_usd": accrued_detention_fee,
                "hours_formatted": f"{dwell_minutes // 60}h {dwell_minutes % 60}m"
            })

        return sorted(results, key=lambda x: x["dwell_minutes"], reverse=True)

    def complete_truck_departure(self, truck_id: str) -> Dict[str, Any]:
        if truck_id not in self.trucks:
            raise ValueError(f"Truck {truck_id} not found in yard")
        
        t = self.trucks[truck_id]
        t["departure_time"] = int(time.time())
        t["status"] = "DEPARTED"
        return t

# Global instance
dock_tracker = DockCycleTracker()
