"""
Dahua P2P Cryptographic Operations (<75 lines).
Handles PBKDF2/AES key derivation, salt info decryption, and WSSE dev authentication.
"""
import base64
import hashlib
import hmac
import json
import random
import time
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.decrepit.ciphers.modes import OFB
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms

IV = b"2z52*lk9o6HRyJrf"
INFO_KEY = b"kRjmsUB&ezmdGLL67H#$ojw@XflcaIaf"
INFO_IV = b"MydvJw*Iw1w&i^kk"

def decrypt_device_info(info_b64: str) -> dict:
    """Decrypts AES-OFB encrypted <Info> block from /info/device/{serial}."""
    if not info_b64:
        return {}
    dec = Cipher(algorithms.AES(INFO_KEY), OFB(INFO_IV), backend=default_backend()).decryptor()
    try:
        raw = dec.update(base64.b64decode(info_b64)) + dec.finalize()
        return json.loads(raw)
    except Exception:
        return {}

def get_key(username: str, password: str, randsalt: str) -> bytes:
    """Computes Dahua P2P MD5 auth key."""
    key_str = f"{username}:Login to {randsalt}:{password}"
    return hashlib.md5(key_str.encode()).hexdigest().upper().encode()

def get_nonce() -> int:
    return random.randrange(2**31)

def get_enc(key: bytes, nonce: int, data: str) -> str:
    """Encrypts payload with PBKDF2-derived AES-OFB key."""
    dk = hashlib.pbkdf2_hmac("sha256", key, str(nonce).encode(), 20000, 32)
    enc = Cipher(algorithms.AES(dk), OFB(IV), backend=default_backend()).encryptor()
    cipher = enc.update(data.encode()) + enc.finalize()
    return base64.b64encode(cipher).decode()

def get_auth(username: str, key: bytes, nonce: int, randsalt: str, payload: str = "") -> str:
    """Generates XML DevAuth element with HMAC-SHA256 signature."""
    curdate = int(time.time())
    msg = f"{nonce}{curdate}{payload}".encode()
    auth = base64.b64encode(hmac.new(key, msg, hashlib.sha256).digest()).decode()
    salt = f"<RandSalt>{randsalt}</RandSalt>" if randsalt else ""
    return (
        f"<CreateDate>{curdate}</CreateDate>"
        f"<DevAuth>{auth}</DevAuth>"
        f"<Nonce>{nonce}</Nonce>"
        f"{salt}"
        f"<UserName>{username}</UserName>"
    )
