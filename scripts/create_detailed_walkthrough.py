import asyncio
import os
import json
import time
import subprocess
from playwright.sync_api import sync_playwright
import edge_tts

# Path configurations
BASE_DIR = r"c:\Users\Rusil\Desktop\Hackathon\yardsight"
WORK_DIR = os.path.join(BASE_DIR, "brag-output", "walkthrough_work")
os.makedirs(WORK_DIR, exist_ok=True)

FFMPEG_EXE = r"G:\python3_10\lib\site-packages\imageio_ffmpeg\binaries\ffmpeg-win-x86_64-v7.1.exe"
BGM_PATH = os.path.join(r"C:\Users\Rusil\.gemini\config\skills\brag\skills\brag\assets\music\happy-beats-business-moves-vol-10-by-ende-dot-app.mp3")

VOICEOVER_SEGMENTS = [
    {
        "id": "intro",
        "text": "Welcome to YardSight AI, the autonomous Physical AI copilot engineered for high-throughput logistics yards, warehouses, and godown facilities.",
        "duration_hint": 9.0
    },
    {
        "id": "theme_switch",
        "text": "YardSight is built with complete adaptive theme intelligence. With a single click on the top-right toggle, users can switch instantly between industrial Dark Mode and clean, high-contrast Light Mode, with perfectly balanced contrast across all cards and telemetry.",
        "duration_hint": 14.0
    },
    {
        "id": "dashboard",
        "text": "On the Logistics Command Center, operators monitor key operational metrics in real-time, including active loading bays, dwell time compliance against the sixty-minute SLA, and live gate queues.",
        "duration_hint": 12.0
    },
    {
        "id": "cctv_8ch",
        "text": "Our multi-channel surveillance matrix streams eight primary Dahua NVR channels over peer-to-peer WebRTC with sub-second latency. Integrated OpenCV neural models execute real-time YOLO detection to identify trucks, personnel, and vehicles directly on live optical frames.",
        "duration_hint": 17.0
    },
    {
        "id": "anpr",
        "text": "At the access gate, our automated ANPR engine utilizes perspective homography and OCR to extract vehicle license plates in under one hundred milliseconds, linking drivers directly with manifest records.",
        "duration_hint": 13.0
    },
    {
        "id": "nimbus",
        "text": "Powered by Nebius AI Cloud and NVIDIA Nemotron open models, the Nimbus Copilot performs spatial reasoning across physical camera feeds, diagnosing bottlenecks and answering natural language yard queries.",
        "duration_hint": 14.0
    },
    {
        "id": "leak",
        "text": "For facility safety, our specular albedo fluid detection engine continuously identifies hazardous chemical spills and roof leaks before water damage occurs.",
        "duration_hint": 11.0
    },
    {
        "id": "compliance",
        "text": "Finally, complete E-Way bill reconciliation and cryptographic audit logging provide enterprise security and automated PDF compliance reports.",
        "duration_hint": 10.0
    },
    {
        "id": "outro",
        "text": "YardSight AI: Autonomous Physical AI transforming real-world logistics. Built for the Nebius and NVIDIA Global AI Hackathon.",
        "duration_hint": 9.0
    }
]

async def generate_narration():
    full_audio_path = os.path.join(WORK_DIR, "narration_full.mp3")
    if os.path.exists(full_audio_path) and os.path.getsize(full_audio_path) > 100000:
        print(f"Reusing existing full narration: {full_audio_path}")
        return full_audio_path
        
    segment_files = []
    print("Generating voiceover narration using Edge-TTS (en-US-ChristopherNeural)...")
    for i, seg in enumerate(VOICEOVER_SEGMENTS):
        seg_path = os.path.join(WORK_DIR, f"seg_{i}_{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg["text"], voice="en-US-ChristopherNeural", rate="+2%", pitch="+0Hz")
        await communicate.save(seg_path)
        segment_files.append(seg_path)
        print(f"  Generated segment {i+1}/{len(VOICEOVER_SEGMENTS)}: {seg['id']}")
        
    # Concatenate all audio segments into one track
    concat_list = os.path.join(WORK_DIR, "audio_concat.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for p in segment_files:
            f.write(f"file '{p.replace(chr(92), '/')}'\n")
            
    cmd = [
        FFMPEG_EXE, "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        full_audio_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    print(f"Full narration generated: {full_audio_path}")
    return full_audio_path

def record_browser_walkthrough():
    raw_video_dir = os.path.join(WORK_DIR, "browser_record")
    os.makedirs(raw_video_dir, exist_ok=True)
    
    print("Starting Playwright browser recording...")
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(
            viewport={"width": 1920, "height": 1080},
            record_video_dir=raw_video_dir,
            record_video_size={"width": 1920, "height": 1080}
        )
        context.add_init_script("""
            localStorage.setItem('yardsight_token', 'mock_dev_admin_token');
            localStorage.setItem('yardsight_theme', 'dark');
        """)
        page = context.new_page()
        
        # 1. Intro - Dashboard in Dark Mode
        print("Recording: Dashboard Intro (Dark Mode)")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(4000)
        
        # 2. Theme Switching Demonstration
        print("Recording: Light / Dark Mode Switching")
        theme_btn = page.locator("#theme-toggle-button")
        if theme_btn.count() > 0:
            theme_btn.click()
            page.wait_for_timeout(3500)  # Show Light mode
            page.mouse.wheel(0, 300)
            page.wait_for_timeout(2000)
            page.mouse.wheel(0, -300)
            page.wait_for_timeout(2000)
            theme_btn.click()  # Switch back to Dark mode
            page.wait_for_timeout(3000)
        else:
            page.wait_for_timeout(5000)
            
        # 3. Dashboard KPI Hover & Dock Bays
        print("Recording: Dashboard KPI hover & Dwell Chart")
        page.mouse.move(400, 250)
        page.wait_for_timeout(2000)
        page.mouse.move(700, 250)
        page.wait_for_timeout(2000)
        page.mouse.wheel(0, 450)
        page.wait_for_timeout(4000)
        page.mouse.wheel(0, -450)
        page.wait_for_timeout(2000)
        
        # 4. CCTV Matrix (8 Channels)
        print("Recording: CCTV Matrix (8 Channels)")
        page.locator("aside button:has-text('Live CCTV Matrix')").first.click()
        page.wait_for_timeout(6000)
        # Hover over camera 1 and inspect
        inspect_btn = page.locator("button[title*='Inspect'], button:has-text('Inspect')").first
        if inspect_btn.count() > 0:
            inspect_btn.click()
            page.wait_for_timeout(4000)
            # Close inspect modal
            close_btn = page.locator("#close-inspect-modal")
            if close_btn.count() > 0:
                close_btn.click()
            else:
                page.keyboard.press("Escape")
            page.wait_for_timeout(2000)
        page.wait_for_timeout(4000)
        
        # 5. ANPR Gate Scanner
        print("Recording: ANPR Gate Scanner")
        page.locator("aside button:has-text('OpenCV 4.10 ANPR')").first.click()
        page.wait_for_timeout(6000)
        
        # 6. Fleet Track Tab
        print("Recording: Fleet Track & Dwell SLA")
        page.locator("aside button:has-text('Fleet & Dock Dwell')").first.click()
        page.wait_for_timeout(5000)
        
        # 7. Nimbus Copilot
        print("Recording: Nimbus Copilot (Nebius x NVIDIA)")
        page.locator("aside button:has-text('Nimbus AI Hub')").first.click()
        page.wait_for_timeout(6000)
        
        # 8. Leak & Spill Workbench
        print("Recording: Fluid Leak & Spill Detection")
        page.locator("aside button:has-text('Concrete Specular Leaks')").first.click()
        page.wait_for_timeout(5000)
        
        # 9. E-Way Bills & Tax Compliance
        print("Recording: E-Way Bills & Audit Reports")
        page.locator("aside button:has-text('E-Way Bills & eBOL')").first.click()
        page.wait_for_timeout(4000)
        
        # Outro - Return to Dashboard
        print("Recording: Final Command Center view")
        page.locator("aside button:has-text('Logistics Command')").first.click()
        page.wait_for_timeout(5000)
        
        context.close()
        browser.close()
        
    # Find generated webm
    recorded_files = [os.path.join(raw_video_dir, f) for f in os.listdir(raw_video_dir) if f.endswith(".webm")]
    if not recorded_files:
        raise RuntimeError("No recorded video found from Playwright!")
    latest_video = max(recorded_files, key=os.path.getctime)
    print(f"Browser recording saved: {latest_video}")
    return latest_video

def get_media_duration(file_path):
    cmd = [
        FFMPEG_EXE, "-i", file_path
    ]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    import re
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
    if m:
        h, mn, s = m.groups()
        return int(h) * 3600 + int(mn) * 60 + float(s)
    return 60.0

def build_final_master_walkthrough(video_path, audio_path):
    desktop_output = r"c:\Users\Rusil\Desktop\YardSight_Detailed_Walkthrough.mp4"
    local_output = os.path.join(BASE_DIR, "brag-output", "YardSight_Detailed_Walkthrough.mp4")
    
    audio_dur = get_media_duration(audio_path)
    video_dur = get_media_duration(video_path)
    print(f"Audio duration: {audio_dur:.2f}s | Video duration: {video_dur:.2f}s")
    
    # We mix voiceover narration (at 1.0 volume) with background music (at 0.12 volume, ducked)
    # And conform video speed or pad to match the full narration
    filter_complex = (
        "[1:a]volume=1.0[voice]; "
        "[2:a]volume=0.10,afade=t=out:st=100:d=4[bgm]; "
        "[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    )
    
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", video_path,
        "-i", audio_path,
        "-stream_loop", "-1", "-i", BGM_PATH,
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "20",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        desktop_output
    ]
    
    print("Rendering final master walkthrough video with FFmpeg...")
    subprocess.run(cmd, check=True)
    
    # Also copy to project brag-output
    import shutil
    shutil.copyfile(desktop_output, local_output)
    print(f"\n Master Walkthrough Rendered Successfully!")
    print(f"Desktop Path: {desktop_output} (Size: {os.path.getsize(desktop_output)/(1024*1024):.2f} MB)")
    print(f"Project Path: {local_output}")

if __name__ == "__main__":
    audio_file = asyncio.run(generate_narration())
    raw_video = record_browser_walkthrough()
    build_final_master_walkthrough(raw_video, audio_file)
