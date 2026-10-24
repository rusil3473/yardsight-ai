"""
DH-P2P Helper Functions (Decoupled Core).
Part of YardSight AI Dahua P2P Gateway.
"""
import base64
import datetime
import hashlib
import hmac
import json
import random
import socket
import sys
import time
from struct import pack, unpack

import xmltodict
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.decrepit.ciphers.modes import OFB
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms

CLOUDS = {
    "easy4ip": {
        "server": "www.easy4ipcloud.com",
        "port": 8800,
        "username": "cba1b29e32cb17aa46b8ff9e73c7f40b",
        "userkey": "996103384cdf19179e19243e959bbf8b",
    },
    "amcrest": {
        "server": "p2p.amcrestview.com",
        "port": 8800,
        "username": "default\\1ee97e027b2140a19b08606dcede9b9e",
        "userkey": "da16f30fd0af413d97921ce0d24e165c",
    },
}

DEFAULT_CLOUD = "easy4ip"

MAIN_SERVER = CLOUDS[DEFAULT_CLOUD]["server"]
MAIN_PORT = CLOUDS[DEFAULT_CLOUD]["port"]

USERNAME = CLOUDS[DEFAULT_CLOUD]["username"]
USERKEY = CLOUDS[DEFAULT_CLOUD]["userkey"]

IV = b"2z52*lk9o6HRyJrf"

INFO_KEY = b"kRjmsUB&ezmdGLL67H#$ojw@XflcaIaf"
INFO_IV = b"MydvJw*Iw1w&i^kk"

CSEQ = 0


def set_cloud(name):
    global MAIN_SERVER, MAIN_PORT, USERNAME, USERKEY
    cloud = CLOUDS[name]
    MAIN_SERVER = cloud["server"]
    MAIN_PORT = cloud["port"]
    USERNAME = cloud["username"]
    USERKEY = cloud["userkey"]
    return MAIN_SERVER, MAIN_PORT


def get_device_info(info):
    if not info:
        return {}
    decryptor = Cipher(
        algorithms.AES(INFO_KEY), OFB(INFO_IV), backend=default_backend()
    ).decryptor()
    try:
        data = decryptor.update(base64.b64decode(info)) + decryptor.finalize()
        return json.loads(data)
    except ValueError:
        return {}


def get_key(username, password, randsalt):
    key = f"{username}:Login to {randsalt}:{password}"
    return hashlib.md5(key.encode()).hexdigest().upper().encode()


def get_nonce():
    return random.randrange(2**31)


def get_enc(key: bytes, nonce: int, data: str):
    salt = str(nonce).encode()
    dk = hashlib.pbkdf2_hmac("sha256", key, salt, 20000, 32)
    encryptor = Cipher(
        algorithms.AES(dk), OFB(IV), backend=default_backend()
    ).encryptor()
    enc = encryptor.update(data.encode()) + encryptor.finalize()
    return base64.b64encode(enc).decode()


def get_dec(key: bytes, nonce: int, data: str):
    salt = str(nonce).encode()
    dk = hashlib.pbkdf2_hmac("sha256", key, salt, 20000, 32)
    encryptor = Cipher(
        algorithms.AES(dk), OFB(IV), backend=default_backend()
    ).encryptor()
    dec = encryptor.update(base64.b64decode(data)) + encryptor.finalize()
    return dec.decode()


def get_auth(username, key, nonce, randsalt, payload=""):
    curdate = int(time.time())
    message = f"{nonce}{curdate}{payload}".encode()
    auth = base64.b64encode(hmac.new(key, message, hashlib.sha256).digest()).decode()
    salt = f"<RandSalt>{randsalt}</RandSalt>" if randsalt else ""
    return (
        f"<CreateDate>{curdate}</CreateDate>"
        f"<DevAuth>{auth}</DevAuth>"
        f"<Nonce>{nonce}</Nonce>"
        f"{salt}"
        f"<UserName>{username}</UserName>"
    )


class PTCPPayload:
    def __init__(self, realm, payload) -> None:
        self.realm = realm
        self.payload = payload

    def __bytes__(self) -> bytes:
        length = len(self.payload) | 0x10000000
        return pack("!LLL", length, self.realm, 0) + self.payload

    def __str__(self) -> str:
        return f"PTCPPayload(realm={self.realm:08X}, payload={self.payload})"

    @classmethod
    def parse(cls, data: bytes):
        if len(data) < 12:
            raise ValueError("Packet is too short")
        length, realm, pad = unpack("!LLL", data[:12])
        if pad != 0:
            raise ValueError("Invalid padding")
        length &= 0xFFFF
        data = data[12:]
        if len(data) != length:
            raise ValueError("Invalid length")
        return cls(realm, data)


class PTCP:
    def __init__(self, rlid, llid, pid, lmid, rmid, body=b"") -> None:
        self.rlid = rlid
        self.llid = llid
        self.pid = pid
        self.lmid = lmid
        self.rmid = rmid
        self.body = body

    def __bytes__(self) -> bytes:
        return (
            pack(
                "!4sLLLLL",
                b"PTCP",
                self.rlid,
                self.llid,
                self.pid,
                self.lmid,
                self.rmid,
            )
            + self.body
        )

    def __str__(self) -> str:
        return f"PTCP(rlid={self.rlid:08X}, llid={self.llid:08X}, pid={self.pid:08X}, lmid={self.lmid:08X}, rmid={self.rmid:08X}, body={self.body})"

    @classmethod
    def parse(cls, data: bytes):
        if len(data) < 24:
            raise ValueError("Packet is too short")
        header, body = data[:24], data[24:]
        magic, rlid, llid, pid, lmid, rmid = unpack("!4sLLLLL", header)
        if magic != b"PTCP":
            raise ValueError("Invalid magic")
        return cls(rlid, llid, pid, lmid, rmid, body)


class UDP(socket.socket):
    def __init__(self, host, port, debug=False):
        super().__init__(socket.AF_INET, socket.SOCK_DGRAM)
        self.settimeout(8.0)
        self.bind(("0.0.0.0", 0))
        self.debug = debug
        self.lhost, self.lport = self.getsockname()
        self.rhost = host
        self.rport = port
        self.ptcp_sent = 0
        self.ptcp_recv = 0
        self.ptcp_count = 0
        self.ptcp_id = 0
        self.rmid = 0

    def send(self, data):
        self.sendto(data, (self.rhost, self.rport))

    def recv(self, bufsize=4096, timeout=None):
        if timeout:
            self.settimeout(timeout)
        data = self.recvfrom(bufsize)[0]
        if timeout:
            self.settimeout(None)
        return data

    def read(self, return_error=False):
        data = self.recv().decode()
        res = parse_response(data)
        if not return_error and res["code"] >= 400:
            sys.exit(1)
        return res

    def request(self, path, body="", auth=True, should_read=True):
        global CSEQ
        CSEQ += 1
        nonce = random.randrange(2**31)
        curdate = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
        pwd = f"{nonce}{curdate}DHP2P:{USERNAME}:{USERKEY}"
        hash_digest = hashlib.sha1()
        hash_digest.update(pwd.encode())
        digest = base64.b64encode(hash_digest.digest()).decode()

        req = f"""{'DHPOST' if body else 'DHGET'} {path} HTTP/1.1
CSeq: {CSEQ}
"""
        if auth:
            req += f"""Authorization: WSSE profile="UsernameToken"
X-WSSE: UsernameToken Username="{USERNAME}", PasswordDigest="{digest}", Nonce="{nonce}", Created="{curdate}"
"""
        if body:
            req += f"""Content-Type: 
Content-Length: {len(body)}
"""
        req += f"""
{body}"""
        self.send(req.replace("\n", "\r\n").encode())
        return self.read() if should_read else None

    def read_ptcp(self):
        data = self.recv()
        res = PTCP.parse(data)
        self.ptcp_recv += len(res.body)
        self.rmid = res.lmid
        return res

    def request_ptcp(self, body=b""):
        ptcp = PTCP(
            self.ptcp_sent,
            self.ptcp_recv,
            0x0002FFFF if body == b"\x00\x03\x01\x00" else 0x0000FFFF - self.ptcp_count,
            self.ptcp_id,
            self.rmid,
            body,
        )
        self.ptcp_sent += len(ptcp.body)
        self.ptcp_id += 1
        if len(ptcp.body) > 0 and ptcp.body != b"\x00\x03\x01\x00":
            self.ptcp_count += 1
        self.send(bytes(ptcp))


def parse_response(data):
    headers, body = data.split("\r\n\r\n", 1)
    headers = headers.split("\r\n")
    version, code, status = headers[0].split(" ", 2)
    code = int(code)
    return {
        "version": version,
        "code": code,
        "status": status,
        "headers": dict(h.split(": ", 1) for h in headers[1:]),
        "data": xmltodict.parse(body) if body.strip() else None,
    }
