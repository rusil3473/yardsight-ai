"""
Dahua P2P Client TCP Proxy Handler (<50 lines).
Handles bidirectional data forwarding between local RTSP client and Dahua realm.
"""
import queue
import socket
import struct
import threading
import time
import re

def handle_tcp_proxy(client: socket.socket, realm: int, q: queue.Queue, tx_queue: queue.Queue, conn_evt: threading.Event, running_check) -> None:
    """Manages full-duplex TCP <-> PTCP stream forwarding for an RTSP client."""
    bind_pkt = b"\x11\x00\x00\x00" + struct.pack("!I", realm) + b"\x00\x00\x00\x00" + struct.pack("!I", 554) + b"\x7f\x00\x00\x01"
    tx_queue.put((bind_pkt, False))
    if not conn_evt.wait(timeout=6.0):
        client.close()
        return

    t0 = time.time()

    def reader():
        try:
            while running_check():
                d = client.recv(4096)
                if not d: break
                now = time.time() - t0
                if d.startswith(b"OPTIONS "):
                    cseq_m = re.search(rb"CSeq:\s*(\d+)", d)
                    cseq = cseq_m.group(1).decode() if cseq_m else "1"
                    resp = f"RTSP/1.0 200 OK\r\nCSeq: {cseq}\r\nPublic: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY, PAUSE\r\n\r\n".encode()
                    print(f"[{now:6.2f}s] LOCAL -> CLIENT: 200 OK for OPTIONS (CSeq {cseq})")
                    client.sendall(resp)
                    continue
                cmd = d.split(b"\r\n")[0] if b"\r\n" in d else d[:30]
                print(f"[{now:6.2f}s] CLIENT -> DAHUA: {cmd} ({len(d)}B)")
                tx_queue.put((struct.pack("!III", 0x10000000 | len(d), realm, 0) + d, False))
        except Exception: pass

    def writer():
        try:
            while running_check():
                try:
                    chunk = q.get(timeout=0.2)
                    if b"m=audio" in chunk and b"RTSP/1.0 200 OK" in chunk:
                        idx = chunk.find(b"m=audio")
                        hdr, sdp = chunk[:idx].split(b"\r\n\r\n", 1)
                        lines = [f"Content-Length: {len(sdp)}".encode() if l.startswith(b"Content-Length:") else l for l in hdr.split(b"\r\n")]
                        chunk = b"\r\n".join(lines) + b"\r\n\r\n" + sdp
                    client.sendall(chunk)
                except queue.Empty: continue
        except Exception: pass

    t_r, t_w = threading.Thread(target=reader, daemon=True), threading.Thread(target=writer, daemon=True)
    t_r.start(); t_w.start()
    t_r.join()
    tx_queue.put((b"\x12\x00\x00\x00" + struct.pack("!I", realm) + b"\x00\x00\x00\x00" + b"DISC", False))
    client.close()
