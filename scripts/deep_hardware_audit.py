import os
import cv2
import numpy as np
import json

VIDEO_PATH = r"c:\Users\Rusil\Desktop\YardSight_Detailed_Walkthrough.mp4"
OUTPUT_DIR = r"c:\Users\Rusil\Desktop\Hackathon\yardsight\brag-output\frame_samples"
os.makedirs(OUTPUT_DIR, exist_ok=True)

cap = cv2.VideoCapture(VIDEO_PATH)
fps = cap.get(cv2.CAP_PROP_FPS)
total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
duration = total_frames / fps

print(f"Video loaded: {duration:.2f}s, {total_frames} frames @ {fps} fps")

# Let's inspect every 2 seconds across the entire 171.84s video
sample_rate_sec = 1.0 # 1 frame per second
timeline = []

sec = 0.0
while sec < duration:
    frame_idx = int(round(sec * fps))
    cap.set(cv2.CAP_PROP_POS_FRAMES, frame_idx)
    ret, frame = cap.read()
    if not ret:
        break

    # Analyze regions of interest
    # 1. Sidebar active tab indicator (x: 0..260)
    # 2. Main header title (y: 0..100, x: 260..900)
    # 3. Viewport contents
    
    # Check for specific scene features
    # Save a frame every 5s for empirical proof
    if int(sec) % 5 == 0 or sec in [65.0, 70.0, 73.0, 77.0, 85.0, 90.0, 130.0, 135.0]:
        sample_path = os.path.join(OUTPUT_DIR, f"sec_{int(sec):03d}.jpg")
        cv2.imwrite(sample_path, frame)

    timeline.append({
        "second": round(sec, 1),
        "frame_idx": frame_idx
    })
    sec += sample_rate_sec

cap.release()
print(f"Sampled {len(timeline)} seconds. Output frames saved to {OUTPUT_DIR}")
