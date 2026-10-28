"""
Dahua P2P Relay Tunnel Service (<85 lines).
Bridges Dahua P2P PTCP protocol into a local standard RTSP TCP loopback socket.
"""
import os
import queue, random, socket, struct, threading, time
from typing import Dict, Optional
from .signaling import perform_p2p_handshake
from .client_handler import handle_tcp_proxy

class DahuaP2PTunnel:
    """Manages full-duplex PTCP relay session with a Dahua camera or NVR."""

    def __init__(
        self,
        serial: Optional[str] = None,
        user: Optional[str] = None,
        pwd: Optional[str] = None,
        local_port: Optional[int] = None
    ):
        self.serial = serial or os.environ.get("DAHUA_NVR_SERIAL", "BE124E0PCA95532")
        self.user = user or os.environ.get("DAHUA_NVR_USERNAME", "admin")
        self.pwd = pwd or os.environ.get("DAHUA_NVR_PASSWORD", "Shri@21*")
        self.local_port = local_port or int(os.environ.get("RTSP_TUNNEL_PORT", "1554"))
        self.running, self.relay_sock, self.agent_host, self.agent_port = False, None, None, None
        self.srv = None
        self.last_recv_time = time.time()
        self.sent, self.recv_bytes, self.count, self.lmid, self.rmid = 0, 0, 0, 0, 0
        self.tx_queue = queue.Queue()
        self.realms: Dict[int, queue.Queue] = {}
        self.conn_events: Dict[int, threading.Event] = {}
        self.reorder_buffer: Dict[int, bytes] = {}
        self.last_gap_time = 0.0
        self.tx_lock = threading.Lock()

    def stop(self):
        """Cleanly terminates relay tunnel, closing listening and UDP sockets."""
        self.running = False
        try:
            if self.srv:
                self.srv.close()
                self.srv = None
        except Exception: pass
        try:
            if self.relay_sock:
                self.relay_sock.close()
                self.relay_sock = None
        except Exception: pass
        for evt in list(self.conn_events.values()):
            evt.set()
        self.realms.clear()
        self.conn_events.clear()

    def start(self):
        """Initializes cloud relay handshake, PTCP sync, and background proxy workers."""
        self.relay_sock, self.agent_host, self.agent_port = perform_p2p_handshake(self.serial, self.user, self.pwd)
        try:
            self.relay_sock.setsockopt(socket.SOL_SOCKET, socket.SO_RCVBUF, 4 * 1024 * 1024)
            self.relay_sock.setsockopt(socket.SOL_SOCKET, socket.SO_SNDBUF, 1024 * 1024)
        except Exception:
            pass
        sync_pkt = struct.pack("!4sIIIII", b"PTCP", 0, 0, 0x0002FFFF, 0, 0) + b"\x00\x03\x01\x00"
        self.sent, self.lmid = 4, 1
        self.relay_sock.sendto(sync_pkt, (self.agent_host, self.agent_port))
        data, _ = self.relay_sock.recvfrom(4096)
        _, _, _, _, remote_lmid, _ = struct.unpack("!4sIIIII", data[:24])
        self.recv_bytes, self.rmid, self.running = len(data[24:]), remote_lmid, True
        self.last_recv_time = time.time()

        for target in (self._writer_loop, self._reader_loop, self._heartbeat_loop, self._tcp_server):
            threading.Thread(target=target, daemon=True).start()

    def _heartbeat_loop(self):
        while self.running:
            time.sleep(5.0)
            self.tx_queue.put((b"\x13" + (b"\x00" * 11), False))

    def _send_ptcp(self, body: bytes = b"", is_sync: bool = False):
        try:
            with self.tx_lock:
                pid = 0x0002FFFF if is_sync else ((0x0000FFFF - self.count) & 0xFFFFFFFF)
                pkt = struct.pack("!4sIIIII", b"PTCP", self.sent & 0xFFFFFFFF, self.recv_bytes & 0xFFFFFFFF, pid, self.lmid & 0xFFFFFFFF, self.rmid & 0xFFFFFFFF) + body
                self.sent += len(body)
                self.lmid += 1
                if len(body) > 0 and not is_sync:
                    self.count += 1
                if self.relay_sock:
                    self.relay_sock.sendto(pkt, (self.agent_host, self.agent_port))
        except Exception:
            pass

    def _writer_loop(self):
        while self.running:
            try:
                body, is_sync = self.tx_queue.get(timeout=0.1)
                self._send_ptcp(body, is_sync)
            except queue.Empty:
                continue
            except Exception:
                break

    def _dispatch_body(self, body: bytes):
        cursor = 0
        while cursor + 12 <= len(body):
            msg_type = body[cursor]
            realm = struct.unpack("!I", body[cursor+4:cursor+8])[0]
            if msg_type == 0x12:
                status_chunk = body[cursor+12 : cursor+20]
                if b"CONN" in status_chunk and realm in self.conn_events:
                    self.conn_events[realm].set()
                cursor += 16
            elif msg_type == 0x10:
                length = struct.unpack("!I", body[cursor:cursor+4])[0] & 0xFFFF
                chunk = body[cursor+12 : min(cursor+12+length, len(body))]
                if realm in self.realms:
                    self.realms[realm].put(chunk)
                cursor += max(12 + length, 12)
            elif msg_type == 0x13:
                cursor += 12
            else:
                cursor += 12

    def _reader_loop(self):
        if not self.relay_sock: return
        self.relay_sock.settimeout(0.5)
        while self.running:
            try: data, _ = self.relay_sock.recvfrom(65535)
            except socket.timeout:
                if len(self.realms) > 0 and (time.time() - self.last_recv_time > 60.0):
                    print(f"[TUNNEL SILENCE] No packets from Dahua relay for >60s with active clients. Triggering reconnection.")
                    self.stop()
                    break
                continue
            except socket.error as e:
                if getattr(e, 'winerror', None) == 10054: continue
                break
            except Exception: break
            if len(data) < 24: continue
            try:
                magic, s_seq, s_ack, s_pid, remote_lmid, s_rmid = struct.unpack("!4sIIIII", data[:24])
                body = data[24:]
                self.rmid = remote_lmid
                self.last_recv_time = time.time()
                if len(body) == 0:
                    continue

                # 1. Complete duplicate packet retransmission: discard payload
                if s_seq + len(body) <= self.recv_bytes:
                    self._send_ptcp(b"")
                    continue

                # 2. Out-of-order packet (sequence gap detected)
                if s_seq > self.recv_bytes:
                    if len(self.reorder_buffer) < 256:
                        self.reorder_buffer[s_seq] = body
                    now = time.time()
                    if self.last_gap_time == 0.0:
                        self.last_gap_time = now
                    elif now - self.last_gap_time > 1.0:
                        # Timeout fallback: advance over missing packet to avoid stalls
                        lowest_seq = min(self.reorder_buffer.keys())
                        if lowest_seq > self.recv_bytes:
                            self.recv_bytes = lowest_seq
                            self.last_gap_time = 0.0
                    # Send duplicate ACK requesting missing data
                    self._send_ptcp(b"")
                    continue

                # Reset gap timer on in-order packet
                self.last_gap_time = 0.0

                # 3. In-order packet (s_seq <= self.recv_bytes < s_seq + len(body))
                if s_seq < self.recv_bytes:
                    overlap = self.recv_bytes - s_seq
                    body = body[overlap:]

                # Deliver in-order chunk
                self._dispatch_body(body)
                self.recv_bytes += len(body)

                # Flush any consecutive buffered packets
                while self.recv_bytes in self.reorder_buffer:
                    next_body = self.reorder_buffer.pop(self.recv_bytes)
                    self._dispatch_body(next_body)
                    self.recv_bytes += len(next_body)

                # Acknowledge cumulative contiguous stream
                self._send_ptcp(b"")
            except Exception:
                pass

    def _tcp_server(self):
        try:
            self.srv = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
            self.srv.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
            self.srv.bind(("127.0.0.1", self.local_port))
            self.srv.listen(10)
            self.srv.settimeout(1.0)
            print(f"[TUNNEL TCP] Listening on 127.0.0.1:{self.local_port}")
        except Exception as e:
            print(f"[TUNNEL TCP BIND ERR] {e}")
            return
        while self.running:
            try:
                c, _ = self.srv.accept()
                realm = random.randint(0x1000, 0xFFFFFF)
                q, conn_evt = queue.Queue(), threading.Event()
                self.realms[realm], self.conn_events[realm] = q, conn_evt
                print(f"[TUNNEL TCP] Accepted client! realm=0x{realm:x}")
                threading.Thread(target=self._client_worker, args=(c, realm, q, conn_evt), daemon=True).start()
            except socket.timeout:
                continue
            except Exception:
                break

    def _client_worker(self, client, realm, q, conn_evt):
        handle_tcp_proxy(client, realm, q, self.tx_queue, conn_evt, lambda: self.running)
        self.realms.pop(realm, None)
        self.conn_events.pop(realm, None)
