"""
DoLynk Cloud Device & NVR Provisioning Service (<95 lines).
Handles device queries, cloud registration, and multi-channel NVR provisioning.
"""
import uuid
import requests
from typing import Dict, Any, List
from .auth import DoLynkAuthManager

class DoLynkDeviceManager:
    """Manages cloud device binding and NVR channel database provisioning."""

    def __init__(self, auth: DoLynkAuthManager, default_device_sn: str):
        self.auth = auth
        self.default_device_sn = default_device_sn

    def get_device_list(self) -> List[Dict[str, Any]]:
        """Queries registered Dahua devices bound to this DoLynk Cloud Product ID."""
        token = self.auth.get_token()
        sign, timestamp, nonce = self.auth.calc_signature(token=token)
        headers = {
            "Version": "v1", "AccessKey": self.auth.app_key, "Timestamp": timestamp,
            "Nonce": nonce, "Sign": sign, "Sign-Type": "simple",
            "ProductId": self.auth.product_id, "X-TraceId-Header": uuid.uuid4().hex,
            "Content-Type": "application/json", "Accept-Language": "en-US",
            "AppAccessToken": token
        }
        url = f"{self.auth.api_host}/open-api/api-iot/device/getDeviceList"
        try:
            resp = requests.post(url, headers=headers, json={"pageNum": 1, "pageSize": 50}, timeout=8)
            data = resp.json()
            if data.get("success") and "data" in data and "pageData" in data["data"]:
                page_data = data["data"]["pageData"]
                if page_data and len(page_data) > 0:
                    return page_data[0].get("deviceList", [])
            return []
        except Exception as e:
            print(f"[DOLYNK DEVICE LIST ERROR]: {e}")
            return []

    def add_device(self, device_sn: str, password: str = "", category_code: str = "NVR") -> Dict[str, Any]:
        """Registers/binds customer Dahua hardware to cloud pool via official DoLynk Open API."""
        sn_clean = device_sn.strip().upper()
        token = self.auth.get_token()
        sign, timestamp, nonce = self.auth.calc_signature(token=token)
        headers = {
            "Version": "v1", "AccessKey": self.auth.app_key, "Timestamp": timestamp,
            "Nonce": nonce, "Sign": sign, "Sign-Type": "simple",
            "ProductId": self.auth.product_id, "X-TraceId-Header": uuid.uuid4().hex,
            "Content-Type": "application/json", "Accept-Language": "en-US",
            "AppAccessToken": token
        }
        url = f"{self.auth.api_host}/open-api/api-iot/device/addDevice"
        payload = {"deviceId": sn_clean}
        if password:
            payload["devicePassword"] = password

        try:
            resp = requests.post(url, headers=headers, json=payload, timeout=10)
            data = resp.json()
            if data.get("success") or data.get("code") == "200":
                return {
                    "success": True,
                    "code": "200",
                    "device_sn": sn_clean,
                    "category": category_code,
                    "message": f"Successfully registered and bound Dahua {category_code} ({sn_clean}) to DoLynk Cloud gateway!"
                }
            
            code = data.get("code", "UNKNOWN")
            msg = data.get("msg", "Failed to add device")
            resp_data = data.get("data") or {}
            owner = resp_data.get("owner", "")

            if code == "IDV004":
                return {
                    "success": False,
                    "code": "IDV004",
                    "device_sn": sn_clean,
                    "owner": owner,
                    "message": f"Device {sn_clean} is currently bound to DMSS account ({owner or 'user'}). To grant YardSight AI access: 1) In DMSS app, use 'Device Sharing' or 'Entrust', OR 2) In DMSS app go to Me -> Service -> Unbind Devices to unbind it, then retry onboarding.",
                    "instructions": [
                        "In your DMSS mobile app (account " + (owner or "919****586") + "):",
                        "Option A (Share): Tap NVR -> Settings -> Share Device / Entrust -> authorize access.",
                        "Option B (Unbind): Tap Me -> Service -> Unbind Devices -> unbind " + sn_clean + " so it links directly to your DoLynk product."
                    ]
                }

            return {
                "success": False,
                "code": code,
                "device_sn": sn_clean,
                "message": f"DoLynk Cloud error [{code}]: {msg}"
            }
        except Exception as e:
            return {
                "success": False,
                "code": "NETWORK_ERROR",
                "device_sn": sn_clean,
                "message": f"Network exception communicating with DoLynk API: {e}"
            }

    def import_nvr_channels(
        self,
        nvr_sn: str,
        nvr_name: str = "Dahua NVR",
        num_channels: int = 32,
        tenant_id: str = "TENANT-MY-HUB",
        db: Any = None,
        channels: list = None
    ) -> list:
        """Provisions selected zone cameras in SQLite/PostgreSQL mapped to Dahua hardware."""
        from models import CCTVCamera
        from services.streamer.zones import CHANNEL_ZONE_DEFS

        sn_clean = nvr_sn.strip().upper().replace("EOPCA", "E0PCA")
        created = []
        target_channels = channels if channels and len(channels) > 0 else [c + 1 for c in range(num_channels)]
        for ch_num in target_channels:
            cam_id = f"CAM-{sn_clean[-5:]}-CH{ch_num:02d}"
            from services.streamer.zones import get_zone_def
            zone = get_zone_def(ch_num)
            zone_code, default_name, zone_pipeline = zone.zone_code, zone.display_name, zone.ai_pipeline
            ch_name = f"{default_name} (CH{ch_num:02d})"
            location_name = f"Zone {zone_code} - {default_name.split(' - ')[0]}"

            channel_sn = sn_clean
            existing = db.query(CCTVCamera).filter(CCTVCamera.id == cam_id).first()
            if not existing:
                cam = CCTVCamera(
                    id=cam_id, tenant_id=tenant_id, name=ch_name, location=location_name,
                    brand="Dahua", resolution="2560x1440 (4MP / 4K)", fps=30, stream_type="DMSS",
                    stream_url="", ai_pipeline=zone_pipeline, status="ONLINE",
                    dmss_serial=channel_sn, dmss_channel=ch_num, dmss_username="admin"
                )
                db.add(cam)
                created.append(cam)
            else:
                existing.name, existing.location = ch_name, location_name
                existing.dmss_serial, existing.dmss_channel = channel_sn, ch_num
                existing.ai_pipeline, existing.status = zone_pipeline, "ONLINE"
                created.append(existing)

        db.commit()
        return created
