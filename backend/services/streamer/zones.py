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
    (f"CH-{ch:02d}", f"Channel {ch:02d}", "ANPR_OCR" if ch == 1 else "ZONE_SURVEILLANCE")
    for ch in range(1, 33)
]

CHANNEL_ZONE_DEFS: List[ZoneDef] = [
    ZoneDef(z[0], z[1], z[2]) for z in RAW_CHANNEL_ZONES
]

def get_zone_def(ch_or_idx: int) -> ZoneDef:
    """Returns typed ZoneDef for channel (1-indexed) or index (0-indexed)."""
    idx = (ch_or_idx - 1) % len(CHANNEL_ZONE_DEFS) if ch_or_idx >= len(CHANNEL_ZONE_DEFS) or ch_or_idx >= 1 else (ch_or_idx % len(CHANNEL_ZONE_DEFS))
    return CHANNEL_ZONE_DEFS[idx]
