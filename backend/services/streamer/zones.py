"""
32 Logistics Yard & Facility Zone Definitions.
Maps channels to industrial facility zones, telemetry tags, and AI pipelines.
Strictly zero synthetic images.
"""
from typing import NamedTuple, List

class ZoneDef(NamedTuple):
    zone_code: str
    display_name: str
    ai_pipeline: str

RAW_CHANNEL_ZONES = [
    ("GATE-01", "Gate 01 Inbound ANPR & Optical Inspection", "ANPR_OCR"),
    ("BAY-01", "Dock Bay 01 - Reefer / Cold Storage Ingress", "DOCK_CYCLE"),
    ("SCALE-01", "Inbound Weighbridge Scale Platform #1 (Gross)", "WEIGHBRIDGE"),
    ("YARD-01", "Yard Marshalling Area - Container Bay Alpha", "ZONE_SURVEILLANCE"),
    ("PERIM-01", "North Perimeter Fence Line (IR Night Vision)", "SECURITY_INTRUSION"),
    ("AISLE-01", "Internal High-Bay Racking Aisle 01 (VNA)", "ZONE_SURVEILLANCE"),
    ("BAY-02", "Dock Bay 02 - Dry Freight Unloading", "DOCK_CYCLE"),
    ("SCALE-02", "Outbound Weighbridge Scale Platform #2 (Tare)", "WEIGHBRIDGE"),
    ("YARD-02", "Yard Marshalling Area - South Trailer Rows", "ZONE_SURVEILLANCE"),
    ("PERIM-02", "East Perimeter Fence Line (IR Night Vision)", "SECURITY_INTRUSION"),
    ("AISLE-02", "Internal High-Bay Racking Aisle 02 (Bulk)", "ZONE_SURVEILLANCE"),
    ("GATE-02", "Gate 02 Outbound Barrier & Egress ANPR", "ANPR_OCR"),
    ("BAY-03", "Dock Bay 03 - Cross-Dock Pallet Staging", "DOCK_CYCLE"),
    ("BAY-04", "Dock Bay 04 - Pallet Staging Buffer", "DOCK_CYCLE"),
    ("YARD-03", "Intermodal Rail Siding Intermodal Depot", "ZONE_SURVEILLANCE"),
    ("PERIM-03", "South Perimeter Security Gate & Barrier", "SECURITY_INTRUSION"),
    ("CORR-01", "Forklift Transit Arterial Corridor North", "FORKLIFT_SAFETY"),
    ("CORR-02", "Forklift Transit Arterial Corridor South", "FORKLIFT_SAFETY"),
    ("BAY-05", "Dock Bay 05 - Rapid Dispatch Conveyor Infeed", "DOCK_CYCLE"),
    ("BAY-06", "Dock Bay 06 - High-Cube Trailer Bay", "DOCK_CYCLE"),
    ("BAY-07", "Dock Bay 07 - Outbound Buffer Staging", "DOCK_CYCLE"),
    ("PERIM-04", "West Perimeter Security Patrol Track", "SECURITY_INTRUSION"),
    ("ROOF-01", "Roof Structural Leak Monitor - Zone A", "ROOF_LEAK"),
    ("ROOF-02", "Roof Structural Leak Monitor - Zone B", "ROOF_LEAK"),
    ("HAZMAT-01", "Hazardous Materials & Chemical Storage Vault", "HAZARD_SAFETY"),
    ("BATT-01", "Battery Charging & MHE Maintenance Depot", "HAZARD_SAFETY"),
    ("ACCESS-01", "Staff & Contractor Turnstiles (Biometric)", "ACCESS_CONTROL"),
    ("FIRE-01", "Emergency Fire Lane & Muster Point", "SAFETY_COMPLIANCE"),
    ("ROOF-03", "Roof Stormwater Drainage Riser Monitor", "ROOF_LEAK"),
    ("FUEL-01", "Diesel Bowser & Yard Fueling Island", "HAZARD_SAFETY"),
    ("RETRN-01", "Returns Quarantine & Quality Inspection", "ZONE_SURVEILLANCE"),
    ("ASRS-01", "Automated Storage & Retrieval (ASRS) Vault", "ZONE_SURVEILLANCE"),
]

CHANNEL_ZONE_DEFS: List[ZoneDef] = [
    ZoneDef(z[0], z[1], z[2]) for z in RAW_CHANNEL_ZONES
]

def get_zone_def(ch_or_idx: int) -> ZoneDef:
    """Returns typed ZoneDef for channel (1-indexed) or index (0-indexed)."""
    idx = (ch_or_idx - 1) % len(CHANNEL_ZONE_DEFS) if ch_or_idx >= len(CHANNEL_ZONE_DEFS) or ch_or_idx >= 1 else (ch_or_idx % len(CHANNEL_ZONE_DEFS))
    return CHANNEL_ZONE_DEFS[idx]
