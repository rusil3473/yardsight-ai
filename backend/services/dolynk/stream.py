"""
DoLynk Cloud Live Stream Service (<85 lines).
Retrieves official tokenized RTSP video stream URLs per Dahua device/channel.
"""
import time
import uuid
import requests
from typing import Optional, Dict, Tuple
from .auth import DoLynkAuthManager

class DoLynkStreamManager:
    """Manages RTSP live stream URLs with caching and root-cause diagnostics."""

    def __init__(self, auth: DoLynkAuthManager):
        self.auth = auth
        self._rtsp_cache: Dict[str, Tuple[str, float]] = {}

    def get_live_rtsp_url(self, device_sn: str, channel_id: int = 0, stream_type: int = 1) -> Optional[str]:
        """Fetches authentic tokenized RTSP stream URL for a Dahua device."""
        cache_key = f"{device_sn}:{channel_id}:{stream_type}"
        now = time.time()
        if cache_key in self._rtsp_cache:
            url, expires_at = self._rtsp_cache[cache_key]
            if now < expires_at:
                return url

        token = self.auth.get_token()
        sign, timestamp, nonce = self.auth.calc_signature(token=token)
        headers = {
            "Version": "v1",
            "AccessKey": self.auth.app_key,
            "Timestamp": timestamp,
            "Nonce": nonce,
            "Sign": sign,
            "Sign-Type": "simple",
            "ProductId": self.auth.product_id,
            "X-TraceId-Header": uuid.uuid4().hex,
            "Content-Type": "application/json",
            "Accept-Language": "en-US",
            "AppAccessToken": token
        }
        url = f"{self.auth.api_host}/open-api/api-aiot/device/getStreamUrl"
        payload = {
            "deviceId": device_sn,
            "channelId": str(channel_id),
            "streamType": 0 if stream_type == 1 else stream_type
        }
        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=8)
            resp_data = resp.json()
            if resp_data.get("success") and "data" in resp_data and resp_data["data"]:
                rtsp_url = (
                    resp_data["data"].get("url")
                    or resp_data["data"].get("streamUrl")
                    or resp_data["data"].get("rtspUrl")
                )
                if rtsp_url:
                    self._rtsp_cache[cache_key] = (rtsp_url, now + 1800.0)
                    return rtsp_url

            # Fallback to createDeviceStreamUrl endpoint
            url_fallback = f"{self.auth.api_host}/open-api/api-iot/device/createDeviceStreamUrl"
            payload_fallback = {
                "deviceId": device_sn,
                "channelId": str(channel_id),
                "businessType": "real",
                "encryptMode": 0
            }
            resp2 = requests.post(url_fallback, headers=headers, json=payload_fallback, timeout=8)
            resp2_data = resp2.json()
            if resp2_data.get("success") and "data" in resp2_data and resp2_data["data"]:
                rtsp_url = resp2_data["data"].get("url")
                if rtsp_url:
                    self._rtsp_cache[cache_key] = (rtsp_url, now + 1800.0)
                    return rtsp_url

            # Root-cause diagnostic logging
            err_code = resp_data.get("code", "UNKNOWN")
            err_msg = resp_data.get("msg", "Unknown error")
            print(f"[DOLYNK STREAM DIAGNOSTIC] {device_sn}:ch{channel_id} -> [{err_code}] {err_msg}")
            return None
        except Exception as e:
            print(f"[DOLYNK STREAM ERROR] Failed contacting DoLynk stream endpoint for {device_sn}: {e}")
            return None

