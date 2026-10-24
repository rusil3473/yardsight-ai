"""
YardSight AI - Dahua P2P Relay Tunnel & RTSP Bridge
Provides an asynchronous TCP-over-UDP relay bridge for Dahua NVRs/IP cameras
via Dahua's Easy4IP cloud infrastructure (P2P + Relay fallback).
Enables local RTSP consumption (OpenCV/FFmpeg) at rtsp://127.0.0.1:1554/...
"""

import asyncio
import base64
import datetime
import hashlib
import hmac
import json
import logging
import random
import socket
import struct
import sys
import time
from typing import Dict, Optional, Tuple
import xmltodict
from cryptography.hazmat.backends import default_backend
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("DahuaP2PBridge")

# Dahua Cloud Constants
MAIN_SERVER = "www.easy4ipcloud.com"
MAIN_PORT = 8800
CLOUD_USER = "cba1b29e32cb17aa46b8ff9e73c7f40b"
CLOUD_KEY = "996103384cdf19179e19243e959bbf8b"
INFO_KEY = b"kRjmsUB&ezmdGLL67H#$ojw@XflcaIaf"
INFO_IV = b"MydvJw*Iw1w&i^kk"
IV = b"2z52*lk9o6HRyJrf"


from services.dhp2p.helpers import (
    get_auth,
    get_dec,
    get_device_info,
    get_enc,
    get_key,
    get_nonce,
    CLOUDS,
    DEFAULT_CLOUD,
)


from services.dhp2p.protocol import SyncUDP, PTCPProtocol



class DahuaP2PBridge:
    """Manages the full Dahua P2P/Relay lifecycle and local RTSP TCP proxy server."""
    def __init__(self, serial: str = None, serial_number: str = None, username: str = "admin", password: str = "Shri@21*",
                 local_port: int = 1554, remote_port: int = 554):
        self.serial = serial or serial_number or "AG07AA7PCA3D3B6"
        self.username = username
        self.password = password
        self.local_port = local_port
        self.remote_port = remote_port

        self.agent_host = ""
        self.agent_port = 0
        self.udp_sock: Optional[socket.socket] = None

        # PTCP session state
        self.sent = 0
        self.recv_bytes = 0
        self.count = 0
        self.lmid = 0
        self.rmid = 0

        self.realms: Dict[int, asyncio.Queue] = {}
        self.realm_conn_events: Dict[int, asyncio.Event] = {}
        self.running = False
        self.connected = False

    def connect(self) -> dict:
        """Executes cloud handshake and returns structured connectivity dictionary."""
        ok = self.handshake()
        return {"success": ok, "message": "Dahua P2P Handshake verified" if ok else "Dahua P2P handshake failed"}


    def handshake(self) -> bool:
        """Executes the synchronous Dahua Easy4IP cloud negotiation."""
        try:
            logger.info(f"Connecting to Dahua Cloud {MAIN_SERVER}:{MAIN_PORT} for SN {self.serial}...")
            main_udp = SyncUDP(MAIN_SERVER, MAIN_PORT)
            main_udp.request("/probe/p2psrv")

            # 1. Locate P2P Server for Device
            res = main_udp.request(f"/online/p2psrv/{self.serial}")
            if res.get("code") != 200 or not res.get("data", {}).get("body", {}).get("US"):
                logger.error(f"Device {self.serial} not found or offline in Dahua Cloud.")
                main_udp.close()
                return False

            p2psrv_host, p2psrv_port = res["data"]["body"]["US"].split(":")
            logger.info(f"P2P Server located at {p2psrv_host}:{p2psrv_port}")

            # 2. Probe Device & Retrieve Device Info (Salt)
            dev_udp = SyncUDP(p2psrv_host, int(p2psrv_port))
            dev_udp.request(f"/probe/device/{self.serial}")
            dev_udp.request(f"/info/device/{self.serial}", should_read=False)
            info_res = dev_udp.read()
            dev_udp.close()

            randsalt = ""
            if info_res.get("code", 0) < 300 and info_res.get("data", {}).get("body", {}).get("Info"):
                info_dict = get_device_info(info_res["data"]["body"]["Info"])
                randsalt = info_dict.get("randsalt", "")
                logger.info(f"Device Salt: {randsalt}, Ports: {info_dict}")

            # 3. Request Relay Server & Agent
            res_relay = main_udp.request("/online/relay")
            relay_host, relay_port = res_relay["data"]["body"]["Address"].split(":")

            main_udp.rhost = relay_host
            main_udp.rport = int(relay_port)
            res_agent = main_udp.request("/relay/agent")
            token = res_agent["data"]["body"]["Token"]
            agent_host, agent_port = res_agent["data"]["body"]["Agent"].split(":")
            self.agent_host = agent_host
            self.agent_port = int(agent_port)
            logger.info(f"Relay Agent Allocated: {self.agent_host}:{self.agent_port}")

            # 4. Initiate P2P Channel with Device
            key = get_key(self.username, self.password, randsalt)
            nonce = get_nonce()
            aid = random.randbytes(8)

            device_udp = SyncUDP(MAIN_SERVER, MAIN_PORT)
            laddr = f"127.0.0.1:{device_udp.lport}"
            laddr_enc = get_enc(key, nonce, laddr)
            auth_str = get_auth(self.username, key, nonce, randsalt, laddr_enc)
            body = (
                f"<body>{auth_str}"
                f"<Identify>{' '.join(f'{b:x}' for b in aid)}</Identify>"
                f"<IpEncrptV2>true</IpEncrptV2>"
                f"<LocalAddr>{laddr_enc}</LocalAddr>"
                f"<version>5.0.0</version></body>"
            )
            device_udp.request(f"/device/{self.serial}/p2p-channel", body, should_read=False)

            # 5. Start Relay on Agent
            main_udp.rhost = self.agent_host
            main_udp.rport = self.agent_port
            main_udp.request(f"/relay/start/{token}", "<body><Client>:0</Client></body>")

            # 6. Read Device Channel Confirmation
            dev_chan_res = device_udp.read()
            if dev_chan_res.get("code") == 100:
                dev_chan_res = device_udp.read()
            logger.info(f"Device channel status: {dev_chan_res.get('code')} {dev_chan_res.get('status')}")

            # 7. Bind Relay Channel
            auth_relay = get_auth(self.username, key, nonce, randsalt)
            main_udp.rhost = MAIN_SERVER
            main_udp.rport = MAIN_PORT
            main_udp.request(
                f"/device/{self.serial}/relay-channel",
                f"<body>{auth_relay}<agentAddr>{self.agent_host}:{self.agent_port}</agentAddr></body>",
                should_read=False
            )

            main_udp.close()
            device_udp.close()
            self.connected = True
            logger.info("Dahua P2P Relay Signaling successfully negotiated!")
            return True
        except Exception as e:
            logger.error(f"Handshake failed: {e}", exc_info=True)
            return False

    def send_ptcp(self, body: bytes, pid_override: Optional[int] = None):
        """Constructs and sends a PTCP frame over UDP to the Agent."""
        if not self.udp_sock:
            return
        sent_offset = self.sent
        recv_offset = self.recv_bytes
        if pid_override is not None:
            pid = pid_override
        elif body == b"\x00\x03\x01\x00":
            pid = 0x0002FFFF
        else:
            pid = max(0, 0x0000FFFF - self.count)

        packet = PTCPProtocol.pack(sent_offset, recv_offset, pid, self.lmid, self.rmid, body)
        self.sent += len(body)
        self.lmid += 1
        if len(body) > 0 and body != b"\x00\x03\x01\x00":
            self.count += 1

        self.udp_sock.sendto(packet, (self.agent_host, self.agent_port))

    async def udp_listener_loop(self):
        """Asynchronously receives PTCP frames from Agent and routes them."""
        loop = asyncio.get_running_loop()
        while self.running and self.udp_sock:
            try:
                data = await loop.sock_recv(self.udp_sock, 65535)
                if not data:
                    continue
                _, _, _, lmid, _, body = PTCPProtocol.unpack(data)
                self.recv_bytes += len(body)
                self.rmid = lmid

                # Immediately ACK with empty PTCP frame if payload or status
                if len(body) > 0:
                    self.send_ptcp(b"")

                if len(body) >= 4:
                    msg_type = body[0]
                    if msg_type == 0x12:  # Status
                        realm = struct.unpack("!I", body[4:8])[0]
                        status = body[12:].decode("utf-8", errors="ignore")
                        logger.info(f"[PTCP STATUS] Realm 0x{realm:08x}: {status}")
                        if status == "CONN" and realm in self.realm_conn_events:
                            self.realm_conn_events[realm].set()
                    elif msg_type == 0x10:  # Payload (RTSP / Video bytes)
                        header = struct.unpack("!I", body[:4])[0]
                        length = header & 0xFFFF
                        realm = struct.unpack("!I", body[4:8])[0]
                        payload_data = body[12:12 + length]
                        if realm in self.realms:
                            await self.realms[realm].put(payload_data)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"UDP listener error: {e}")
                await asyncio.sleep(0.05)

    async def heartbeat_loop(self):
        """Sends periodic PTCP heartbeats every 5 seconds to keep relay alive."""
        while self.running:
            try:
                await asyncio.sleep(5.0)
                hb_body = b"\x13" + (b"\x00" * 11)
                self.send_ptcp(hb_body)
            except asyncio.CancelledError:
                break
            except Exception as e:
                logger.warning(f"Heartbeat error: {e}")

    async def handle_tcp_client(self, reader: asyncio.StreamReader, writer: asyncio.StreamWriter):
        """Handles an incoming RTSP client (OpenCV VideoCapture / FFmpeg)."""
        realm = random.randint(0x1000, 0xFFFFFF)
        self.realms[realm] = asyncio.Queue()
        conn_event = asyncio.Event()
        self.realm_conn_events[realm] = conn_event

        logger.info(f"New TCP connection for RTSP. Binding realm 0x{realm:08x} to remote port {self.remote_port}...")
        bind_body = (
            b"\x11\x00\x00\x00"
            + struct.pack("!I", realm)
            + b"\x00\x00\x00\x00"
            + struct.pack("!I", self.remote_port)
            + b"\x7f\x00\x00\x01"
        )
        self.send_ptcp(bind_body)

        try:
            # Wait for Agent to report "CONN"
            await asyncio.wait_for(conn_event.wait(), timeout=8.0)
            logger.info(f"Realm 0x{realm:08x} CONNECTED to Dahua remote NVR!")
        except asyncio.TimeoutError:
            logger.error(f"Timeout waiting for CONN on realm 0x{realm:08x}")
            writer.close()
            await writer.wait_closed()
            return

        async def tcp_to_udp():
            try:
                while self.running:
                    chunk = await reader.read(4096)
                    if not chunk:
                        break
                    # Wrap in PTCP Payload
                    header = (0x10000000 | len(chunk))
                    payload = (
                        struct.pack("!III", header, realm, 0)
                        + chunk
                    )
                    self.send_ptcp(payload)
            except Exception as e:
                logger.warning(f"TCP->UDP error: {e}")
            finally:
                # Send DISC
                disc_body = b"\x12\x00\x00\x00" + struct.pack("!I", realm) + b"\x00\x00\x00\x00" + b"DISC"
                self.send_ptcp(disc_body)

        async def udp_to_tcp():
            try:
                q = self.realms[realm]
                while self.running:
                    data = await q.get()
                    writer.write(data)
                    await writer.drain()
            except Exception as e:
                logger.warning(f"UDP->TCP error: {e}")

        # Run both directions concurrently
        await asyncio.gather(tcp_to_udp(), udp_to_tcp(), return_exceptions=True)
        if realm in self.realms:
            del self.realms[realm]
        if realm in self.realm_conn_events:
            del self.realm_conn_events[realm]
        writer.close()
        await writer.wait_closed()
        logger.info(f"TCP connection closed for realm 0x{realm:08x}")

    async def run(self):
        """Starts the full async bridge."""
        if not self.handshake():
            logger.error("Handshake aborted.")
            return

        self.running = True
        self.udp_sock = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        self.udp_sock.setblocking(False)
        self.udp_sock.bind(("0.0.0.0", 0))

        # Send PTCP Sync
        logger.info("Sending initial PTCP Sync to Agent...")
        self.send_ptcp(b"\x00\x03\x01\x00", pid_override=0x0002FFFF)

        # Start UDP listener & Heartbeat tasks
        asyncio.create_task(self.udp_listener_loop())
        asyncio.create_task(self.heartbeat_loop())

        # Start Local TCP Server on local_port
        self.tcp_server = await asyncio.start_server(
            self.handle_tcp_client, "127.0.0.1", self.local_port
        )
        logger.info(f"============================================================")
        logger.info(f"  DAHUA P2P RTSP TUNNEL ACTIVE")
        logger.info(f"  Local Stream URL: rtsp://127.0.0.1:{self.local_port}/cam/realmonitor?channel=9&subtype=0")
        logger.info(f"  Authenticated Credentials: {self.username} / {self.password}")
        logger.info(f"============================================================")

        async with self.tcp_server:
            await self.tcp_server.serve_forever()

    def stop(self):
        self.running = False
        if self.tcp_server:
            self.tcp_server.close()
        if self.udp_sock:
            try:
                self.udp_sock.close()
            except Exception:
                pass


if __name__ == "__main__":
    bridge = DahuaP2PBridge(
        serial="BE124E0PCA95532",
        username="admin",
        password="Shri@21*",
        local_port=1554,
        remote_port=554,
    )
    try:
        asyncio.run(bridge.run())
    except KeyboardInterrupt:
        bridge.stop()
