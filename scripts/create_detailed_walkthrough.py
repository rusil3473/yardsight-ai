import asyncio
import os
import json
import time
import subprocess
import shutil
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
        "id": "01_intro",
        "title": "Welcome to YardSight AI",
        "text": "Welcome to YardSight AI, the autonomous Physical AI copilot engineered for high-throughput logistics yards, godown warehouses, and freight terminals. Designed for the Nebius and NVIDIA Global AI Hackathon, YardSight bridges digital intelligence with real-world physical operations.",
    },
    {
        "id": "02_theme_switch",
        "title": "Adaptive Light & Dark Modes",
        "text": "A critical feature of YardSight is our fully adaptive theme intelligence. Built for twenty-four seven logistics centers, operators can switch instantly between our sleek industrial Dark Mode and a crisp, high-contrast Light Mode via the top-right toggle. Notice how every card, telemetry chart, and status indicator automatically recalibrates its contrast and typography for optimal visibility in any lighting environment.",
    },
    {
        "id": "03_command_center",
        "title": "Logistics Command Center & Digital Twin",
        "text": "The Logistics Command Center gives dispatchers real-time visibility over the entire yard. Eight digital twin loading bays track live turnaround times, automatically accruing detention fees when vehicles exceed the sixty-minute SLA threshold, while active gate queues and dwell compliance update continuously.",
    },
    {
        "id": "04_cctv_matrix",
        "title": "8-Channel Surveillance Matrix & OpenCV YOLOv8",
        "text": "Our surveillance matrix streams eight primary Dahua NVR optical channels over peer-to-peer WebRTC with sub-second latency. Embedded OpenCV neural models execute real-time YOLOv8 object detection directly on live optical frames to instantly identify trucks, personnel, and vehicles across all physical yard zones.",
    },
    {
        "id": "05_anpr_gate",
        "title": "OpenCV 4.10 ANPR Gate Scanner",
        "text": "At the access gate, our automated ANPR engine uses four-corner perspective homography to unwarp tilted camera angles, extracting vehicle license plates with OCR in under one hundred milliseconds to automate gate check-ins and driver manifests.",
    },
    {
        "id": "06_fleet_dwell",
        "title": "Fleet Turnaround & Dwell SLA Engine",
        "text": "Our fleet tracking engine monitors container turnarounds in real time. Bay detention clocks trigger automated WhatsApp notifications to freight drivers and transport carrier agencies before penalties accrue.",
    },
    {
        "id": "07_nimbus_ai",
        "title": "Nimbus AI Copilot (Nebius x NVIDIA Nemotron)",
        "text": "Powered by the Nebius Token Factory and NVIDIA Nemotron seventy-B open-source model, the Nimbus AI Copilot performs multimodal spatial reasoning across camera feeds, answering complex logistical queries and flagging yard safety anomalies.",
    },
    {
        "id": "08_leak_physics",
        "title": "Specular Albedo Fluid Leak & Spill Detection",
        "text": "Facility safety is maintained with our physics-informed fluid leak detection. By analyzing specular albedo reflectance on concrete surfaces, YardSight detects roof moisture leaks and chemical spills before cargo damage occurs.",
    },
    {
        "id": "09_compliance_audit",
        "title": "E-Way Bills & Cryptographic Audit Reports",
        "text": "YardSight integrates seamlessly with GST E-Way bill APIs and digital bills of lading, automating statutory tax reconciliation, detention dispute logs, and one-click PDF compliance audit exports.",
    },
    {
        "id": "10_future_scope",
        "title": "Future Scope & Autonomous Roadmap",
        "text": "Looking ahead, our roadmap includes multi-facility edge cluster mesh networking, autonomous drone yard patrol integration, and predictive gate dispatch powered by NVIDIA Cosmos world models. YardSight AI is revolutionizing physical logistics for the global supply chain.",
    }
]

def get_media_duration(file_path):
    cmd = [FFMPEG_EXE, "-i", file_path]
    res = subprocess.run(cmd, stderr=subprocess.PIPE, stdout=subprocess.PIPE, text=True)
    import re
    m = re.search(r"Duration:\s*(\d+):(\d+):(\d+\.\d+)", res.stderr)
    if m:
        h, mn, s = m.groups()
        return int(h) * 3600 + int(mn) * 60 + float(s)
    return 10.0

async def generate_narration_tracks():
    print("Generating voiceover narration tracks using Edge-TTS (en-US-ChristopherNeural)...")
    segment_data = []
    
    for i, seg in enumerate(VOICEOVER_SEGMENTS):
        seg_file = os.path.join(WORK_DIR, f"{seg['id']}.mp3")
        communicate = edge_tts.Communicate(seg["text"], voice="en-US-ChristopherNeural", rate="+2%", pitch="+0Hz")
        await communicate.save(seg_file)
        dur = get_media_duration(seg_file)
        segment_data.append({
            **seg,
            "file": seg_file,
            "duration": dur
        })
        print(f"  [{i+1}/{len(VOICEOVER_SEGMENTS)}] {seg['id']}: {dur:.2f}s - {seg['title']}")
        
    full_audio_path = os.path.join(WORK_DIR, "narration_master.mp3")
    concat_list = os.path.join(WORK_DIR, "audio_concat.txt")
    with open(concat_list, "w", encoding="utf-8") as f:
        for s in segment_data:
            f.write(f"file '{s['file'].replace(chr(92), '/')}'\n")
            
    cmd = [
        FFMPEG_EXE, "-y", "-f", "concat", "-safe", "0",
        "-i", concat_list,
        "-c", "copy",
        full_audio_path
    ]
    subprocess.run(cmd, check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    total_audio_dur = get_media_duration(full_audio_path)
    print(f"\n Master Voiceover Generated: {total_audio_dur:.2f}s ({full_audio_path})")
    return full_audio_path, segment_data, total_audio_dur

def record_synchronized_walkthrough(segment_data, target_total_duration):
    raw_video_dir = os.path.join(WORK_DIR, "sync_browser_record")
    if os.path.exists(raw_video_dir):
        shutil.rmtree(raw_video_dir, ignore_errors=True)
    os.makedirs(raw_video_dir, exist_ok=True)
    
    print(f"\n Starting Synchronized Playwright Recording (Target Duration: {target_total_duration:.2f}s)...")
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
        start_time = time.time()
        
        # 1. Intro - Dashboard (Dark Mode)
        dur_01 = segment_data[0]["duration"]
        print(f"  [1/10] Intro ({dur_01:.1f}s)")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(int(dur_01 * 1000))
        
        # 2. Adaptive Light & Dark Mode
        dur_02 = segment_data[1]["duration"]
        print(f"  [2/10] Adaptive Light & Dark Modes ({dur_02:.1f}s)")
        theme_btn = page.locator("#theme-toggle-button")
        # Click to Light Mode
        theme_btn.click()
        page.wait_for_timeout(2500)
        # Scroll down in Light Mode to show white cards and crisp text
        page.mouse.wheel(0, 350)
        page.wait_for_timeout(int((dur_02 - 7.5) * 500))
        # Scroll up in Light Mode
        page.mouse.wheel(0, -350)
        page.wait_for_timeout(2000)
        # Click back to Dark Mode
        theme_btn.click()
        page.wait_for_timeout(3000)
        
        # 3. Command Center & Digital Twin Bays
        dur_03 = segment_data[2]["duration"]
        print(f"  [3/10] Command Center & Digital Twin ({dur_03:.1f}s)")
        page.mouse.move(300, 260)
        page.wait_for_timeout(2000)
        page.mouse.move(650, 260)
        page.wait_for_timeout(2000)
        page.mouse.wheel(0, 400)
        page.wait_for_timeout(int((dur_03 - 6.0) * 1000))
        page.mouse.wheel(0, -400)
        page.wait_for_timeout(2000)
        
        # 4. CCTV Matrix (8 Channels) & OpenCV YOLOv8
        dur_04 = segment_data[3]["duration"]
        print(f"  [4/10] 8-Channel CCTV Matrix & YOLOv8 ({dur_04:.1f}s)")
        page.locator("aside button:has-text('Live CCTV Matrix')").first.click()
        page.wait_for_timeout(3500)
        inspect_btn = page.locator("button[title*='Inspect'], button:has-text('Inspect')").first
        if inspect_btn.count() > 0:
            inspect_btn.click()
            page.wait_for_timeout(4000)
            close_btn = page.locator("#close-inspect-modal")
            if close_btn.count() > 0:
                close_btn.click()
            else:
                page.keyboard.press("Escape")
            page.wait_for_timeout(1500)
        remaining_04 = max(1.0, dur_04 - 9.0)
        page.wait_for_timeout(int(remaining_04 * 1000))
        
        # 5. OpenCV ANPR Gate Scanner
        dur_05 = segment_data[4]["duration"]
        print(f"  [5/10] OpenCV 4.10 ANPR Gate ({dur_05:.1f}s)")
        page.locator("aside button:has-text('OpenCV 4.10 ANPR')").first.click()
        page.wait_for_timeout(int(dur_05 * 1000))
        
        # 6. Fleet Turnaround & Dwell SLA
        dur_06 = segment_data[5]["duration"]
        print(f"  [6/10] Fleet Dwell SLA Engine ({dur_06:.1f}s)")
        page.locator("aside button:has-text('Fleet & Dock Dwell')").first.click()
        page.wait_for_timeout(int(dur_06 * 1000))
        
        # 7. Nimbus AI Copilot (Nebius x NVIDIA Nemotron)
        dur_07 = segment_data[6]["duration"]
        print(f"  [7/10] Nimbus AI Copilot ({dur_07:.1f}s)")
        page.locator("aside button:has-text('Nimbus AI Hub')").first.click()
        page.wait_for_timeout(int(dur_07 * 1000))
        
        # 8. Specular Albedo Leak & Spill Physics
        dur_08 = segment_data[7]["duration"]
        print(f"  [8/10] Specular Albedo Leak Detection ({dur_08:.1f}s)")
        page.locator("aside button:has-text('Concrete Specular Leaks')").first.click()
        page.wait_for_timeout(int(dur_08 * 1000))
        
        # 9. E-Way Bills & Tax Reconciliation
        dur_09 = segment_data[8]["duration"]
        print(f"  [9/10] E-Way Bills & Audit Reports ({dur_09:.1f}s)")
        page.locator("aside button:has-text('E-Way Bills & eBOL')").first.click()
        page.wait_for_timeout(int(dur_09 * 1000))
        
        # 10. Future Scope & Outro
        dur_10 = segment_data[9]["duration"]
        print(f"  [10/10] Future Scope & Command Center Outro ({dur_10:.1f}s)")
        page.locator("aside button:has-text('Logistics Command')").first.click()
        page.wait_for_timeout(2000)
        # Pad slightly to ensure video covers audio completely
        page.wait_for_timeout(int(max(2.0, dur_10) * 1000) + 2000)
        
        elapsed = time.time() - start_time
        print(f"Playwright recording completed in {elapsed:.2f}s")
        context.close()
        browser.close()
        
    recorded_files = [os.path.join(raw_video_dir, f) for f in os.listdir(raw_video_dir) if f.endswith(".webm")]
    if not recorded_files:
        raise RuntimeError("No recorded video found from Playwright!")
    latest_video = max(recorded_files, key=os.path.getctime)
    return latest_video

def compile_master_video(raw_video_path, audio_path, target_duration):
    desktop_output = r"c:\Users\Rusil\Desktop\YardSight_Detailed_Walkthrough.mp4"
    local_output = os.path.join(BASE_DIR, "brag-output", "YardSight_Detailed_Walkthrough.mp4")
    
    video_dur = get_media_duration(raw_video_path)
    audio_dur = get_media_duration(audio_path)
    print(f"\nFinal Assembly: Video Dur={video_dur:.2f}s, Audio Dur={audio_dur:.2f}s")
    
    # Use exact audio duration as master timeline, loop background music, and fade out at end
    fade_start = max(1.0, audio_dur - 4.0)
    filter_complex = (
        f"[1:a]volume=1.0[voice]; "
        f"[2:a]volume=0.10,afade=t=out:st={fade_start:.1f}:d=4[bgm]; "
        f"[voice][bgm]amix=inputs=2:duration=first:dropout_transition=2[aout]"
    )
    
    cmd = [
        FFMPEG_EXE, "-y",
        "-i", raw_video_path,
        "-i", audio_path,
        "-stream_loop", "-1", "-i", BGM_PATH,
        "-filter_complex", filter_complex,
        "-map", "0:v",
        "-map", "[aout]",
        "-c:v", "libx264",
        "-preset", "medium",
        "-crf", "19",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-t", f"{audio_dur:.2f}",
        desktop_output
    ]
    
    print("Muxing final high-definition master walkthrough with FFmpeg...")
    subprocess.run(cmd, check=True)
    
    shutil.copyfile(desktop_output, local_output)
    
    # Also extract high-res thumbnail poster
    poster_desktop = r"c:\Users\Rusil\Desktop\YardSight_Detailed_Poster.jpg"
    poster_local = os.path.join(BASE_DIR, "brag-output", "YardSight_Detailed_Poster.jpg")
    thumb_cmd = [
        FFMPEG_EXE, "-y",
        "-ss", "00:00:12",
        "-i", desktop_output,
        "-vframes", "1",
        "-q:v", "2",
        poster_desktop
    ]
    subprocess.run(thumb_cmd, check=True)
    shutil.copyfile(poster_desktop, poster_local)
    
    print("\n" + "="*60)
    print(" MASTER WALKTHROUGH RENDERED PERFECTLY!")
    print(f" Master Video: {desktop_output} ({os.path.getsize(desktop_output)/(1024*1024):.2f} MB)")
    print(f" Video Poster: {poster_desktop}")
    print(f" Exact Matched Duration: {audio_dur:.2f}s")
    print("="*60)

if __name__ == "__main__":
    audio_path, segment_data, total_audio_dur = asyncio.run(generate_narration_tracks())
    raw_video = record_synchronized_walkthrough(segment_data, total_audio_dur)
    compile_master_video(raw_video, audio_path, total_audio_dur)
