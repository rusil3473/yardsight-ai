"""
Dahua P2P Protocol Utilities: SyncUDP and PTCPProtocol frame handlers.
"""

import base64
import datetime
import hashlib
import random
import socket
import struct
from typing import Optional, Tuple
import xmltodict

CLOUD_USER = "cba1b29e32cb17aa46b8ff9e73c7f40b"
CLOUD_KEY = "996103384cdf19179e19243e959bbf8b"


class SyncUDP:
    """Helper for initial synchronous Dahua HTTP/DH signaling calls."""
    def __init__(self, host: str, port: int, timeout: float = 6.0):
        self.sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.sock.settimeout(timeout)
        self.sock.bind(("0.0.0.0", 0))
        self.rhost = host
        self.rport = port
        self.cseq = 0

    @property
    def lport(self) -> int:
        return self.sock.getsockname()[1]

    def request(self, path: str, body: str = "", auth: bool = True, should_read: bool = True) -> Optional[dict]:
        self.cseq += 1
        nonce = random.randrange(2**31)
        curdate = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        pwd = f"{nonce}{curdate}DHP2P:{CLOUD_USER}:{CLOUD_KEY}"
        digest = base64.b64encode(hashlib.sha1(pwd.encode()).digest()).decode()

        method = "DHPOST" if body else "DHGET"
        req = f"{method} {path} HTTP/1.1\r\nCSeq: {self.cseq}\r\n"
        if auth:
            req += (
                f'Authorization: WSSE profile="UsernameToken"\r\n'
                f'X-WSSE: UsernameToken Username="{CLOUD_USER}", PasswordDigest="{digest}", Nonce="{nonce}", Created="{curdate}"\r\n'
            )
        if body:
            req += f"Content-Type: \r\nContent-Length: {len(body)}\r\n\r\n{body}"
        else:
            req += "\r\n"

        self.sock.sendto(req.encode(), (self.rhost, self.rport))
        if not should_read:
            return None
        return self.read()

    def read(self) -> dict:
        data, _ = self.sock.recvfrom(4096)
        text = data.decode("utf-8", errors="ignore")
        lines = text.split("\r\n")
        parts = lines[0].split(" ")
        code = int(parts[1]) if len(parts) > 1 and parts[1].isdigit() else 0
        status = " ".join(parts[2:]) if len(parts) > 2 else ""

        body_str = ""
        if "\r\n\r\n" in text:
            body_str = text.split("\r\n\r\n", 1)[1]

        parsed_body = None
        if body_str:
            try:
                parsed_body = xmltodict.parse(body_str)
            except Exception:
                parsed_body = {"raw": body_str}

        return {"code": code, "status": status, "data": parsed_body}

    def close(self):
        try:
            self.sock.close()
        except Exception:
            pass


class PTCPProtocol:
    """Encapsulation for PTCP packet construction and parsing."""
    @staticmethod
    def pack(sent: int, recv: int, pid: int, lmid: int, rmid: int, body: bytes) -> bytes:
        return struct.pack("!4sIIIII", b"PTCP", sent, recv, pid, lmid, rmid) + body

    @staticmethod
    def unpack(data: bytes) -> Tuple[int, int, int, int, int, bytes]:
        if len(data) < 24:
            raise ValueError("PTCP packet too short")
        magic, sent, recv, pid, lmid, rmid = struct.unpack("!4sIIIII", data[:24])
        if magic != b"PTCP":
            raise ValueError(f"Invalid magic: {magic}")
        return sent, recv, pid, lmid, rmid, data[24:]
