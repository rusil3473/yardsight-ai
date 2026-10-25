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
    """Manages full-duplex TCP <-> PTCP stream forwarding for an RTSP client with active keepalive."""
    bind_pkt = b"\x11\x00\x00\x00" + struct.pack("!I", realm) + b"\x00\x00\x00\x00" + struct.pack("!I", 554) + b"\x7f\x00\x00\x01"
    connected = False
    for attempt in range(3):
        tx_queue.put((bind_pkt, False))
        if conn_evt.wait(timeout=1.5):
            connected = True
            break
    if not connected:
        try: client.close()
        except Exception: pass
        return

    t0 = time.time()
    session_id = [None]
    last_url = [None]
    client_alive = [True]

    def keepalive_loop():
        cseq = 700
        while running_check() and client_alive[0]:
            time.sleep(8.0)
            if session_id[0] and last_url[0] and client_alive[0]:
                cseq += 1
                base_url = last_url[0].split("/trackID")[0]
                ka = (
                    f"OPTIONS {base_url} RTSP/1.0\r\n"
                    f"CSeq: {cseq}\r\n"
                    f"Session: {session_id[0]}\r\n"
                    f"User-Agent: YardSight-Keepalive\r\n\r\n"
                ).encode()
                tx_queue.put((struct.pack("!III", 0x10000000 | len(ka), realm, 0) + ka, False))

    def reader():
        try:
            client.settimeout(1.0)
            while running_check() and client_alive[0]:
                try:
                    d = client.recv(4096)
                except socket.timeout:
                    continue
                if not d: break
                now = time.time() - t0
                url_m = re.search(rb"[A-Z]+\s+(rtsp://[^\s]+)", d)
                if url_m:
                    last_url[0] = url_m.group(1).decode("utf-8", errors="ignore")
                if d.startswith(b"OPTIONS "):
                    cseq_m = re.search(rb"CSeq:\s*(\d+)", d)
                    cseq = cseq_m.group(1).decode() if cseq_m else "1"
                    resp = f"RTSP/1.0 200 OK\r\nCSeq: {cseq}\r\nPublic: OPTIONS, DESCRIBE, SETUP, TEARDOWN, PLAY, PAUSE\r\n\r\n".encode()
                    client.sendall(resp)
                    if b"Session:" in d or int(cseq) > 1:
                        tx_queue.put((struct.pack("!III", 0x10000000 | len(d), realm, 0) + d, False))
                    continue
                if d.startswith(b"RTSP/1.0 501"):
                    continue
                cmd = d.split(b"\r\n")[0] if b"\r\n" in d else d[:30]
                print(f"[{now:6.2f}s] CLIENT -> DAHUA: {cmd} ({len(d)}B)")
                tx_queue.put((struct.pack("!III", 0x10000000 | len(d), realm, 0) + d, False))
        except Exception: pass
        finally:
            client_alive[0] = False

    def writer():
        try:
            while running_check() and client_alive[0]:
                try:
                    chunk = q.get(timeout=0.2)
                    sess_m = re.search(rb"Session:\s*([^\r\n;]+)", chunk)
                    if sess_m:
                        session_id[0] = sess_m.group(1).decode("utf-8", errors="ignore").strip()
                    if b"SET_PARAMETER " in chunk or b"GET_PARAMETER " in chunk:
                        cseq_m = re.search(rb"CSeq:\s*(\d+)", chunk)
                        cseq = cseq_m.group(1).decode() if cseq_m else "1"
                        resp = f"RTSP/1.0 200 OK\r\nCSeq: {cseq}\r\n\r\n".encode()
                        tx_queue.put((struct.pack("!III", 0x10000000 | len(resp), realm, 0) + resp, False))
                        continue
                    if b"CSeq: 7" in chunk and b"RTSP/1.0 200 OK" in chunk:
                        continue  # Absorb keepalive response from Dahua
                    if b"m=audio" in chunk and b"RTSP/1.0 200 OK" in chunk:
                        idx = chunk.find(b"m=audio")
                        hdr, sdp = chunk[:idx].split(b"\r\n\r\n", 1)
                        lines = [f"Content-Length: {len(sdp)}".encode() if l.startswith(b"Content-Length:") else l for l in hdr.split(b"\r\n")]
                        chunk = b"\r\n".join(lines) + b"\r\n\r\n" + sdp
                    client.sendall(chunk)
                except queue.Empty: continue
        except Exception: pass
        finally:
            client_alive[0] = False

    t_r = threading.Thread(target=reader, daemon=True)
    t_w = threading.Thread(target=writer, daemon=True)
    t_k = threading.Thread(target=keepalive_loop, daemon=True)
    t_r.start(); t_w.start(); t_k.start()
    t_r.join()
    client_alive[0] = False
    tx_queue.put((b"\x12\x00\x00\x00" + struct.pack("!I", realm) + b"\x00\x00\x00\x00" + b"DISC", False))
    try: client.close()
    except Exception: pass
