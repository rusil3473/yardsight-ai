"""
Dahua P2P Decoupled Service Facade (<45 lines).
Coordinates signaling, PTCP tunnel, and background optical frame ingestion.
"""
import os
from typing import Optional
import numpy as np
from .worker import DahuaOpticalWorker

class DahuaP2PService:
    """Facade for Dahua P2P cloud relay video streaming."""

    def __init__(self):
        self.default_serial = os.getenv("DAHUA_DEVICE_SN", "BE124E0PCA95532")
        self.worker = DahuaOpticalWorker(self.default_serial)

    def start_worker(self, serial: Optional[str] = None):
        self.worker.start_worker(serial)

    def get_latest_optical_frame(
        self,
        serial: Optional[str] = None,
        channel: int = 0,
        max_age_seconds: float = 12.0
    ) -> Optional[np.ndarray]:
        sn = serial or self.default_serial
        self.worker.start_worker(sn, channel=channel)
        return self.worker.get_latest_frame(sn, channel=channel, max_age_seconds=max_age_seconds)

dhp2p_service = DahuaP2PService()
__all__ = ["DahuaP2PService", "dhp2p_service"]
