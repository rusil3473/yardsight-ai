"""
YardSight AI - Fleet Dwell & Detention Calculator (<50 lines).
Calculates dynamic dwell turnaround, detention SLA thresholds, and demurrage billing.
"""
from datetime import datetime
from typing import Dict, Any

def compute_truck_dwell(t_dict: Dict[str, Any], arrival_time: datetime, sla_mins: int = 120, country: str = "IN", status: str = "INBOUND") -> Dict[str, Any]:
    if not arrival_time:
        return t_dict
    now = datetime.utcnow()
    elapsed_mins = max(0, int((now - arrival_time).total_seconds() / 60))
    t_dict["dwell_minutes"] = elapsed_mins
    t_dict["dwell_time_mins"] = elapsed_mins
    t_dict["hours_formatted"] = f"{elapsed_mins // 60}h {elapsed_mins % 60}m"

    if elapsed_mins > sla_mins and status not in ["CLEARED", "DEPARTED"]:
        t_dict["status"] = "DETENTION"
        t_dict["is_detention"] = True
        t_dict["detention_minutes"] = elapsed_mins - sla_mins
        hours_over = (elapsed_mins - sla_mins) / 60.0
        rate = 2400.0 if country == "IN" else 75.0
        fee = round(hours_over * rate, 2)
        t_dict["detention_charge"] = fee
        t_dict["detention_fee"] = fee
        t_dict["accrued_detention_fee_usd"] = fee
    return t_dict
