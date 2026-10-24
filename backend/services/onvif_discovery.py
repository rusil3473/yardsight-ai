"""YardSight AI - ONVIF & Local Subnet Camera Discovery Engine (<90 lines)."""
import socket, uuid, re, time
from typing import List, Dict, Any

WS_DISCOVERY_XML = """<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope"
  xmlns:wsa="http://schemas.xmlsoap.org/ws/2004/08/addressing"
  xmlns:d="http://schemas.xmlsoap.org/ws/2005/04/discovery"
  xmlns:dn="http://www.onvif.org/ver10/network/wsdl">
  <soap:Header><wsa:MessageID>urn:uuid:{uuid}</wsa:MessageID><wsa:To>urn:schemas-xmlsoap-org:ws:2005:04:discovery</wsa:To><wsa:Action>http://schemas.xmlsoap.org/ws/2005/04/discovery/Probe</wsa:Action></soap:Header>
  <soap:Body><d:Probe><d:Types>dn:NetworkVideoTransmitter</d:Types></d:Probe></soap:Body>
</soap:Envelope>"""

class ONVIFDiscoveryService:
    def __init__(self, timeout_sec: float = 1.2):
        self.timeout_sec = timeout_sec
        self.multicast_ip = "239.255.255.250"
        self.multicast_port = 3702

    def discover_onvif_devices(self) -> List[Dict[str, Any]]:
        discovered = []
        sock = None
        try:
            sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM, socket.IPPROTO_UDP)
            sock.setsockopt(socket.IPPROTO_IP, socket.IP_MULTICAST_TTL, 2)
            sock.settimeout(self.timeout_sec)
            msg = WS_DISCOVERY_XML.format(uuid=str(uuid.uuid4())).encode("utf-8")
            sock.sendto(msg, (self.multicast_ip, self.multicast_port))
            start_t, seen_ips = time.time(), set()
            while time.time() - start_t < self.timeout_sec:
                try:
                    data, (addr, port) = sock.recvfrom(65535)
                    if addr in seen_ips: continue
                    seen_ips.add(addr)
                    text_data = data.decode("utf-8", errors="ignore")
                    xm = re.search(r"<[a-zA-Z0-9:]*XAddrs>([^<]+)</", text_data)
                    xaddrs = xm.group(1).strip() if xm else f"http://{addr}/onvif/device_service"
                    brand = "Generic ONVIF Camera"
                    for b in ["Dahua", "Hikvision", "Axis", "Hanwha"]:
                        if b.lower() in text_data.lower():
                            brand = f"{b} Technology"
                            break
                    discovered.append({
                        "ip": addr, "port": port, "onvif_url": xaddrs, "brand": brand,
                        "protocol": "ONVIF Profile S",
                        "rtsp_url_hint": f"rtsp://admin:password@{addr}:554/cam/realmonitor?channel=1&subtype=0",
                        "status": "ONLINE"
                    })
                except Exception: break
        except Exception as e:
            print(f"[ONVIF DISCOVERY] Warning: {e}")
        finally:
            if sock: sock.close()
        return discovered

    def scan_common_cctv_ports(self, target_hosts: List[str] = None) -> List[Dict[str, Any]]:
        hosts = target_hosts or ["127.0.0.1", "192.168.1.108", "192.168.1.64"]
        results = []
        for host in hosts:
            for port, name in [(554, "RTSP"), (37777, "Dahua NetSDK"), (80, "ONVIF HTTP")]:
                try:
                    with socket.create_connection((host, port), timeout=0.15):
                        results.append({
                            "host": host, "port": port, "service": name, "reachable": True,
                            "suggested_rtsp": f"rtsp://admin:password@{host}:{port}/stream" if port == 554 else None
                        })
                except Exception: pass
        return results

onvif_discovery = ONVIFDiscoveryService()
