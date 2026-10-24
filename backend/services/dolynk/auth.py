"""
DoLynk Cloud Authentication Service (<80 lines).
Handles HMAC-SHA512 signature computation and token caching.
"""
import os
import time
import uuid
import hmac
import hashlib
import requests
from typing import Optional, Tuple

class DoLynkAuthManager:
    """Manages DoLynk Cloud appAccessToken authentication and signature generation."""

    def __init__(self, app_key: str, app_secret: str, product_id: str, api_host: str):
        self.app_key = app_key
        self.app_secret = app_secret
        self.product_id = product_id
        self.api_host = api_host
        self._cached_token: Optional[str] = None
        self._token_expires_at: float = 0.0

    def calc_signature(self, token: Optional[str] = None) -> Tuple[str, str, str]:
        """Calculates HMAC-SHA512 uppercase hex signature per DoLynk specification."""
        timestamp = str(int(time.time() * 1000))
        nonce = uuid.uuid4().hex
        str_to_sign = f"{self.app_key}{token or ''}{timestamp}{nonce}"
        sign = hmac.new(
            self.app_secret.encode("utf-8"),
            str_to_sign.encode("utf-8"),
            hashlib.sha512
        ).hexdigest().upper()
        return sign, timestamp, nonce

    def get_token(self, force_refresh: bool = False) -> str:
        """Retrieves or refreshes a valid DoLynk Cloud appAccessToken with 1-hr pre-expiry buffer."""
        now = time.time()
        if not force_refresh and self._cached_token and now < self._token_expires_at:
            return self._cached_token

        sign, timestamp, nonce = self.calc_signature(token=None)
        headers = {
            "Version": "v1",
            "AccessKey": self.app_key,
            "Timestamp": timestamp,
            "Nonce": nonce,
            "Sign": sign,
            "Sign-Type": "simple",
            "ProductId": self.product_id,
            "X-TraceId-Header": uuid.uuid4().hex,
            "Content-Type": "application/json",
            "Accept-Language": "en-US"
        }
        url = f"{self.api_host}/open-api/api-base/auth/getAppAccessToken"
        try:
            resp = requests.post(url, headers=headers, json={}, timeout=8)
            data = resp.json()
            if data.get("success") and "data" in data and "appAccessToken" in data["data"]:
                token = data["data"]["appAccessToken"]
                validity = float(data["data"].get("validitySeconds", 604800))
                self._cached_token = token
                self._token_expires_at = now + max(60.0, validity - 3600.0)
                return token
            error_code = data.get("code", "UNKNOWN")
            error_msg = data.get("msg", "Unknown error")
            raise RuntimeError(f"DoLynk Cloud auth failed: [{error_code}] {error_msg}")
        except requests.exceptions.RequestException as e:
            raise ConnectionError(f"DoLynk Cloud gateway unreachable ({self.api_host}): {e}")

    @property
    def is_authenticated(self) -> bool:
        return bool(self._cached_token and time.time() < self._token_expires_at)
