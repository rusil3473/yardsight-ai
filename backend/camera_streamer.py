"""
YardSight AI - Industrial CCTV Streamer & Optical Video Ingestion (<25 lines).
Re-exports clean decoupled implementation from services.streamer.
"""
from services.streamer import IndustrialCameraStreamer, camera_streamer
from services.streamer.zones import CHANNEL_ZONE_DEFS

__all__ = ["IndustrialCameraStreamer", "camera_streamer", "CHANNEL_ZONE_DEFS"]
