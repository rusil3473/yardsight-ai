import os
import cv2
import numpy as np
import subprocess

FFMPEG = r"G:\python3_10\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
BRAG_ASSETS = r"C:\Users\Rusil\.gemini\config\skills\brag\skills\brag\assets"
MUSIC_TRACK = os.path.join(BRAG_ASSETS, "music", "happy-beats-business-moves-vol-10-by-ende-dot-app.mp3")
SFX_DIR = os.path.join(BRAG_ASSETS, "sfx")

WORK_DIR = "brag-output/work"
OUTPUT_DIR = "brag-output"
os.makedirs(WORK_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

WIDTH, HEIGHT = 1920, 1080
FPS = 30
TOTAL_DURATION = 24.0
TOTAL_FRAMES = int(TOTAL_DURATION * FPS)

print("1. Loading raw video walkthrough...")
walkthrough_path = "demo_video/yardsight_demo_walkthrough.webm"
cap = cv2.VideoCapture(walkthrough_path)
walk_fps = cap.get(cv2.CAP_PROP_FPS) or 25.0

def get_clip_frame(target_sec):
    cap.set(cv2.CAP_PROP_POS_MSEC, target_sec * 1000.0)
    ret, frame = cap.read()
    if ret and frame is not None:
        return cv2.resize(frame, (WIDTH, HEIGHT))
    return np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)

# Timeline Mapping (in seconds):
# 0.0 - 1.5: Hook Intro Card ("YARDSIGHT AI: GODOWNOS")
# 1.5 - 4.5: CCTV Matrix (Multi-RTSP 32 Channels) -> walk sec 11.0 to 14.0
# 4.5 - 9.5: OpenCV 4.10 Homography ANPR -> walk sec 20.0 to 25.0
# 9.5 - 14.5: Concrete Specular Hydrocarbon Leak -> walk sec 50.0 to 55.0
# 14.5 - 19.5: Nimbus AI & Dispatch -> walk sec 30.0 to 35.0
# 19.5 - 24.0: Outro & Certification -> walk sec 84.0 to 88.0

print("2. Generating video frames with cyber-industrial motion graphics...")

fourcc = cv2.VideoWriter_fourcc(*'mp4v')
temp_video = os.path.join(WORK_DIR, "raw_visuals.mp4")
out = cv2.VideoWriter(temp_video, fourcc, FPS, (WIDTH, HEIGHT))

font_main = cv2.FONT_HERSHEY_DUPLEX
font_mono = cv2.FONT_HERSHEY_SIMPLEX

for frame_idx in range(TOTAL_FRAMES):
    t = frame_idx / FPS

    if t < 1.5:
        # Scene 1: Hook Title Card
        img = np.zeros((HEIGHT, WIDTH, 3), dtype=np.uint8)
        img[:] = (18, 16, 12) # Deep industrial navy
        
        # Grid lines
        for y in range(0, HEIGHT, 60):
            cv2.line(img, (0, y), (WIDTH, y), (30, 26, 20), 1)
        for x in range(0, WIDTH, 60):
            cv2.line(img, (x, 0), (x, HEIGHT), (30, 26, 20), 1)

        # Pulsing HUD Title
        pulse = 0.8 + 0.2 * np.sin(t * 8.0)
        title = "YARDSIGHT .AI"
        cv2.putText(img, title, (WIDTH // 2 - 420, HEIGHT // 2 - 50), font_main, 3.0, (255, 240, 0), 6, cv2.LINE_AA)
        
        sub = "AUTONOMOUS INDUSTRIAL MULTI-CAMERA VISION & LOGISTICS OS"
        cv2.putText(img, sub, (WIDTH // 2 - 580, HEIGHT // 2 + 40), font_mono, 1.0, (0, 240, 255), 2, cv2.LINE_AA)

        badge = "32 LEGACY CCTV CHANNELS • ZERO SERVER GPUS • SUB-100MS P2P"
        cv2.putText(img, badge, (WIDTH // 2 - 490, HEIGHT // 2 + 110), font_mono, 0.85, (52, 211, 153), 2, cv2.LINE_AA)

    elif t < 4.5:
        # Scene 1b: CCTV Matrix
        wt = 10.0 + (t - 1.5)
        img = get_clip_frame(wt)
        # Overlay banner
        cv2.rectangle(img, (0, 0), (WIDTH, 90), (12, 16, 24), -1)
        cv2.putText(img, "SURVEILLANCE MATRIX: DAHUA NVR 32-CHANNEL P2P STREAMING", (50, 58), font_main, 1.4, (0, 240, 255), 3, cv2.LINE_AA)
        cv2.rectangle(img, (WIDTH - 420, 22), (WIDTH - 50, 70), (22, 101, 52), -1)
        cv2.putText(img, "LIVE P2P • 0.01s LATENCY", (WIDTH - 400, 55), font_mono, 0.8, (255, 255, 255), 2, cv2.LINE_AA)

    elif t < 9.5:
        # Scene 2: OpenCV Homography ANPR
        wt = 18.0 + (t - 4.5) * 1.4
        img = get_clip_frame(wt)
        cv2.rectangle(img, (0, 0), (WIDTH, 90), (12, 16, 24), -1)
        cv2.putText(img, "OPENCV 4.10 HOMOGRAPHY ANPR: ACUTE 45 DEGREE PERSPECTIVE RECTIFICATION", (50, 58), font_main, 1.3, (0, 255, 128), 3, cv2.LINE_AA)
        
        # Lower third badge
        cv2.rectangle(img, (50, HEIGHT - 110), (950, HEIGHT - 30), (15, 23, 42), -1)
        cv2.rectangle(img, (50, HEIGHT - 110), (950, HEIGHT - 30), (0, 255, 128), 2)
        cv2.putText(img, "DUAL-MARKET: US COMMERCIAL DOT & INDIA HSRP FLEETS", (70, HEIGHT - 60), font_mono, 0.85, (255, 255, 255), 2, cv2.LINE_AA)

    elif t < 14.5:
        # Scene 3: Concrete Specular Hydrocarbon Leak Detector
        wt = 48.0 + (t - 9.5) * 1.4
        img = get_clip_frame(wt)
        cv2.rectangle(img, (0, 0), (WIDTH, 90), (12, 16, 24), -1)
        cv2.putText(img, "CONCRETE SPECULAR LEAK DETECTOR: DIESEL vs WATER (THIN-FILM INTERFERENCE)", (50, 58), font_main, 1.25, (0, 160, 255), 3, cv2.LINE_AA)
        
        cv2.rectangle(img, (50, HEIGHT - 110), (980, HEIGHT - 30), (15, 23, 42), -1)
        cv2.rectangle(img, (50, HEIGHT - 110), (980, HEIGHT - 30), (0, 160, 255), 2)
        cv2.putText(img, "HAZARDOUS SPILL AUTOMATION: OSHA 1910.120 ABSORBENT BOOM SIZING", (70, HEIGHT - 60), font_mono, 0.8, (255, 255, 255), 2, cv2.LINE_AA)

    elif t < 19.5:
        # Scene 4: Nimbus AI Hub & Dispatch
        wt = 28.0 + (t - 14.5) * 1.4
        img = get_clip_frame(wt)
        cv2.rectangle(img, (0, 0), (WIDTH, 90), (12, 16, 24), -1)
        cv2.putText(img, "NIMBUS MULTIMODAL VLM COPILOT & AUTOMATED WHATSAPP DISPATCH", (50, 58), font_main, 1.3, (255, 200, 0), 3, cv2.LINE_AA)

        cv2.rectangle(img, (50, HEIGHT - 110), (1050, HEIGHT - 30), (15, 23, 42), -1)
        cv2.rectangle(img, (50, HEIGHT - 110), (1050, HEIGHT - 30), (255, 200, 0), 2)
        cv2.putText(img, "NATURAL LANGUAGE REASONING OVER LIVE SPATIAL-TEMPORAL TELEMETRY", (70, HEIGHT - 60), font_mono, 0.8, (255, 255, 255), 2, cv2.LINE_AA)

    else:
        # Scene 5: Outro & Call to Action
        wt = 83.0 + (t - 19.5) * 1.1
        img = get_clip_frame(wt)
        
        # Dark vignette
        overlay = img.copy()
        cv2.rectangle(overlay, (0, 0), (WIDTH, HEIGHT), (10, 14, 20), -1)
        cv2.addWeighted(overlay, 0.7, img, 0.3, 0, img)

        cv2.putText(img, "YARDSIGHT .AI", (WIDTH // 2 - 380, HEIGHT // 2 - 70), font_main, 3.2, (0, 240, 255), 6, cv2.LINE_AA)
        cv2.putText(img, "THE INDUSTRIAL COMPUTER VISION OPERATING SYSTEM", (WIDTH // 2 - 580, HEIGHT // 2 + 15), font_mono, 1.1, (255, 255, 255), 2, cv2.LINE_AA)
        
        cv2.rectangle(img, (WIDTH // 2 - 400, HEIGHT // 2 + 70), (WIDTH // 2 + 400, HEIGHT // 2 + 150), (16, 185, 129), -1)
        cv2.putText(img, "OPEN SOURCE ON GITHUB & DEVPOST", (WIDTH // 2 - 340, HEIGHT // 2 + 122), font_main, 1.2, (15, 23, 42), 3, cv2.LINE_AA)

    out.write(img)

out.release()
cap.release()
print(f"Visuals generated at: {temp_video}")

# 3. Audio Composition using FFmpeg
print("3. Mixing audio (soundtrack + timed SFX cues)...")
sfx_impact1 = os.path.join(SFX_DIR, "impact", "impactPlate_heavy_000.ogg")
sfx_switch = os.path.join(SFX_DIR, "ui", "switch2.ogg")
sfx_bell = os.path.join(SFX_DIR, "impact", "impactBell_heavy_004.ogg")
sfx_dispatch = os.path.join(SFX_DIR, "ui", "switch10.ogg")
sfx_metal = os.path.join(SFX_DIR, "impact", "impactMetal_heavy_000.ogg")

# Filter graph for mixing music with timed sound effects
filter_complex = (
    f"[0:a]atrim=0:24,afade=t=out:st=22.8:d=1.2,volume=0.85[music];"
    f"[1:a]adelay=0|0,volume=1.2[sfx1];"
    f"[2:a]adelay=4500|4500,volume=1.0[sfx2];"
    f"[3:a]adelay=9500|9500,volume=1.0[sfx3];"
    f"[4:a]adelay=14500|14500,volume=1.1[sfx4];"
    f"[5:a]adelay=19500|19500,volume=1.3[sfx5];"
    f"[music][sfx1][sfx2][sfx3][sfx4][sfx5]amix=inputs=6:duration=first:dropout_transition=2[aout]"
)

temp_audio = os.path.join(WORK_DIR, "brag_audio.m4a")
cmd_audio = [
    FFMPEG, "-y",
    "-i", MUSIC_TRACK,
    "-i", sfx_impact1,
    "-i", sfx_switch,
    "-i", sfx_bell,
    "-i", sfx_dispatch,
    "-i", sfx_metal,
    "-filter_complex", filter_complex,
    "-map", "[aout]",
    "-c:a", "aac", "-b:a", "192k",
    temp_audio
]
subprocess.run(cmd_audio, check=True)
print(f"Audio mixed at: {temp_audio}")

# 4. Final Video Assembly
print("4. Assembling final brag.mp4...")
final_video = os.path.join(OUTPUT_DIR, "brag.mp4")
cmd_mux = [
    FFMPEG, "-y",
    "-i", temp_video,
    "-i", temp_audio,
    "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18", "-preset", "fast",
    "-c:a", "copy",
    "-shortest",
    final_video
]
subprocess.run(cmd_mux, check=True)
print(f"SUCCESS: brag.mp4 generated at {final_video}")

# 5. Extract Poster brag.jpg (from settled frame at 3.0s)
print("5. Extracting poster brag.jpg...")
poster_path = os.path.join(OUTPUT_DIR, "brag.jpg")
cmd_poster = [
    FFMPEG, "-y",
    "-ss", "00:00:03.200",
    "-i", final_video,
    "-vframes", "1",
    "-q:v", "2",
    poster_path
]
subprocess.run(cmd_poster, check=True)
print(f"Poster extracted at {poster_path}")

# 6. Generate share-copy.txt
share_copy_path = os.path.join(OUTPUT_DIR, "share-copy.txt")
with open(share_copy_path, "w", encoding="utf-8") as f:
    f.write(
        "We built YardSight AI — an autonomous industrial vision & logistics operating system that transforms "
        "32 legacy Dahua CCTV cameras into a sub-100ms logistics command center with OpenCV 4.10 homography ANPR "
        "and thin-film hydrocarbon leak detection.\n\n"
        "Watch the launch video and check out our open-source codebase on Devpost and GitHub: "
        "https://github.com/rusil3473/yardsight-ai\n"
    )
print(f"Share copy saved at {share_copy_path}")
