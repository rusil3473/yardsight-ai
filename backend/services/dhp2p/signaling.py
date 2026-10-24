"""
Dahua Easy4IP Cloud Signaling Client (<90 lines).
Handles WSSE cloud signaling, relay agent allocation, and P2P channel authorization.
"""
import base64
import datetime
import hashlib
import random
import socket
import xmltodict
from .crypto import get_key, get_nonce, get_enc, get_auth, decrypt_device_info

MAIN_SERVER = "www.easy4ipcloud.com"
MAIN_PORT = 8800
CLOUD_USER = "cba1b29e32cb17aa46b8ff9e73c7f40b"
CLOUD_KEY = "996103384cdf19179e19243e959bbf8b"

_DNS_CACHE = {}

def resolve_host(host: str) -> str:
    if host not in _DNS_CACHE:
        try:
            _DNS_CACHE[host] = socket.gethostbyname(host)
        except Exception:
            return host
    return _DNS_CACHE[host]

def dh_req(sock: socket.socket, host: str, port: int, path: str, body: str = ""):
    """Sends Dahua DHGET/DHPOST request with WSSE UsernameToken."""
    nonce = random.randrange(2**31)
    curdate = datetime.datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")
    pwd = f"{nonce}{curdate}DHP2P:{CLOUD_USER}:{CLOUD_KEY}"
    digest = base64.b64encode(hashlib.sha1(pwd.encode()).digest()).decode()
    method = "DHPOST" if body else "DHGET"
    req = f"{method} {path} HTTP/1.1\r\nCSeq: {random.randint(1,99999)}\r\n"
    req += f'Authorization: WSSE profile="UsernameToken"\r\nX-WSSE: UsernameToken Username="{CLOUD_USER}", PasswordDigest="{digest}", Nonce="{nonce}", Created="{curdate}"\r\n'
    if body:
        req += f"Content-Type: \r\nContent-Length: {len(body)}\r\n\r\n{body}"
    else:
        req += "\r\n"
    sock.sendto(req.encode(), (resolve_host(host), port))

def dh_read(sock: socket.socket) -> dict:
    """Receives and parses Dahua cloud XML response."""
    data, _ = sock.recvfrom(4096)
    parts = data.decode("utf-8", errors="ignore").split("\r\n\r\n", 1)
    headers = parts[0].split("\r\n")
    code = int(headers[0].split(" ", 2)[1])
    body = parts[1] if len(parts) > 1 else ""
    return {"code": code, "data": xmltodict.parse(body) if body.strip() else {}}

def perform_p2p_handshake(serial: str, user: str, pwd: str) -> tuple:
    """Performs full Easy4IP relay handshake and returns (relay_sock, agent_host, agent_port)."""
    s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s.settimeout(6.0)
    s.bind(("0.0.0.0", 0))

    dh_req(s, MAIN_SERVER, MAIN_PORT, "/probe/p2psrv")
    dh_read(s)
    dh_req(s, MAIN_SERVER, MAIN_PORT, f"/online/p2psrv/{serial}")
    res = dh_read(s)
    p2psrv_host, p2psrv_port = res["data"]["body"]["US"].split(":")

    s2 = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    s2.settimeout(6.0)
    s2.bind(("0.0.0.0", 0))
    dh_req(s2, p2psrv_host, int(p2psrv_port), f"/probe/device/{serial}")
    dh_read(s2)
    dh_req(s2, p2psrv_host, int(p2psrv_port), f"/info/device/{serial}")
    info_res = dh_read(s2)
    randsalt = decrypt_device_info(info_res["data"]["body"].get("Info")).get("randsalt", "")
    s2.close()

    dh_req(s, MAIN_SERVER, MAIN_PORT, "/online/relay")
    relay_host, relay_port = dh_read(s)["data"]["body"]["Address"].split(":")

    relay_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    relay_sock.settimeout(6.0)
    relay_sock.bind(("0.0.0.0", 0))

    dh_req(relay_sock, relay_host, int(relay_port), "/relay/agent")
    agent_res = dh_read(relay_sock)
    token = agent_res["data"]["body"]["Token"]
    agent_host, agent_port_str = agent_res["data"]["body"]["Agent"].split(":")
    agent_port = int(agent_port_str)

    key = get_key(user, pwd, randsalt)
    nonce = get_nonce()
    aid = random.randbytes(8)
    laddr_enc = get_enc(key, nonce, f"127.0.0.1:{s.getsockname()[1]}")
    auth_str = get_auth(user, key, nonce, randsalt, laddr_enc)
    body = f"<body>{auth_str}<Identify>{' '.join(f'{b:x}' for b in aid)}</Identify><IpEncrptV2>true</IpEncrptV2><LocalAddr>{laddr_enc}</LocalAddr><version>5.0.0</version></body>"
    dh_req(s, MAIN_SERVER, MAIN_PORT, f"/device/{serial}/p2p-channel", body)

    dh_req(relay_sock, agent_host, agent_port, f"/relay/start/{token}", "<body><Client>:0</Client></body>")
    dh_read(relay_sock)

    chan_res = dh_read(s)
    if chan_res["code"] == 100:
        chan_res = dh_read(s)
    s.close()

    auth_relay = get_auth(user, key, get_nonce(), randsalt)
    dh_req(relay_sock, MAIN_SERVER, MAIN_PORT, f"/device/{serial}/relay-channel", f"<body>{auth_relay}<agentAddr>{agent_host}:{agent_port}</agentAddr></body>")
    dh_read(relay_sock)

    return relay_sock, agent_host, agent_port
