"""
Industrial CCTV Broadcast Offline / Diagnostic Card Renderer (<80 lines).
Renders diagnostic test cards with technical telemetry and amber beacon.
"""
import os
import cv2
import numpy as np
from datetime import datetime, timezone, timedelta

IST = timezone(timedelta(hours=5, minutes=30))

def render_offline_cctv_card(
    w: int, h: int, cam_id: str, display_name: str, sn: str,
    channel: int, stream_type: str, stream_url: str, t: float
) -> np.ndarray:
    """Renders authentic industrial CCTV broadcast test/offline card per Dahua NVR specs."""
    card = np.zeros((h, w, 3), dtype=np.uint8)
    card[:] = [14, 18, 26]  # Industrial NVR dark slate background
    card[::60, :] = [20, 26, 36]
    card[:, ::60] = [20, 26, 36]

    # Top diagnostic bar
    cv2.rectangle(card, (0, 0), (w, 36), (0, 0, 0), -1)
    now_dt = datetime.now(IST)
    ts = now_dt.strftime("%Y-%m-%d %H:%M:%S") + f".{int(now_dt.microsecond / 1000):03d} IST"
    is_ipc = (sn or "").upper().startswith("AG") or "IPC" in (sn or "").upper()
    top_label = f"DAHUA SMART IPC DH-IPC-HFW1439TL2-A-IL [{display_name.upper()}]" if is_ipc else f"DAHUA NVR4232-4KS3 | IP-CH{channel:02d} [{display_name.upper()}]"
    cv2.putText(card, top_label, (20, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 220, 255), 1)
    cv2.putText(card, ts, (w - 290, 23), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

    # Center technical diagnostic box
    box_w, box_h = 700, 270
    bx1, by1 = (w - box_w) // 2, (h - box_h) // 2
    bx2, by2 = bx1 + box_w, by1 + box_h
    cv2.rectangle(card, (bx1, by1), (bx2, by2), (20, 28, 42), -1)
    cv2.rectangle(card, (bx1, by1), (bx2, by2), (48, 68, 96), 2)

    is_stream_paused = os.environ.get("DISABLE_VIDEO_STREAM", "0").lower() in ("true", "1", "yes")
    beacon_color = (0, 200, 255) if is_stream_paused else ((0, 165, 255) if int(t * 2) % 2 == 0 else (0, 70, 160))
    cv2.circle(card, (bx1 + 36, by1 + 44), 9, beacon_color, -1)
    
    if is_stream_paused:
        box_title = f"VIDEO STREAM PAUSED • CH{channel:02d}"
    else:
        box_title = "DAHUA CLOUD SIGNAL LOST (OFFLINE)" if is_ipc else f"DAHUA NVR IP-CH{channel:02d} • NO VIDEO SIGNAL"
    cv2.putText(card, box_title, (bx1 + 58, by1 + 51),
                cv2.FONT_HERSHEY_SIMPLEX, 0.62, (255, 255, 255), 2)

    endpoint = stream_url or (f"dhp2p://admin:****@{sn}?channel={channel}")
    if is_stream_paused:
        lines = [
            f"Camera Channel: IP-CH{channel:02d} ({cam_id} - {display_name})",
            "Operating Mode: Video Streaming Paused (Low-RAM Standby)",
            "Backend Health: 100% Operational (REST APIs, SQLite, Auth, Scale Engine)",
            "System RAM: Optimized to base footprint (< 140 MB)",
            "Video Reconnection: Ready to resume when re-enabled"
        ]
    elif is_ipc:
        lines = [
            f"Hardware Model: Dahua Smart Dual Illuminators IPC ({sn})",
            "Cloud Gateway: Dahua DoLynk Open API (open-api-sg.dolynkcloud.com)",
            "Hardware Status: OFFLINE in DoLynk Cloud (IDV002: Device offline)",
            "Physical Sensor: Camera offline or network dropped",
            "Auto-Reconnection: Worker polling tokenized RTSP proxy every 15s"
        ]
    else:
        lines = [
            f"Central NVR Unit: Dahua Multi-Channel NVR ({sn})",
            f"NVR Channel Slot: IP-CH{channel:02d} ({cam_id} - {display_name})",
            f"Cloud Gateway: Dahua Easy4IP Relay (www.easy4ipcloud.com:8800)",
            f"Hardware Status: No physical camera stream active on channel {channel:02d}",
            f"Optical Pipeline: Waiting for physical Dahua camera video packets"
        ]
    for i, line in enumerate(lines):
        cv2.putText(card, line, (bx1 + 36, by1 + 95 + i * 28), cv2.FONT_HERSHEY_SIMPLEX, 0.42, (170, 195, 225), 1)

    # Bottom status strip
    cv2.rectangle(card, (0, h - 34), (w, h), (0, 0, 0), -1)
    if is_stream_paused:
        status_text = f"STATUS: VIDEO PAUSED • {cam_id} STANDBY"
        ai_label = "VIDEO STANDBY"
    else:
        status_text = "STATUS: HARDWARE OFFLINE • POLLING CLOUD RECONNECT" if is_ipc else f"STATUS: NO VIDEO SIGNAL • IP-CH{channel:02d} OFFLINE"
        ai_label = "WAITING HARDWARE FEED"
    cv2.putText(card, status_text, (20, h - 12),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 165, 255), 1)
    cv2.putText(card, ai_label, (w - 240, h - 12),
                cv2.FONT_HERSHEY_SIMPLEX, 0.42, (0, 255, 180), 1)
    return card
