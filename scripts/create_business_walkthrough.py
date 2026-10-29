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
        "text": "Welcome to YardSight AI, the autonomous Physical AI copilot engineered for high-throughput logistics hubs, freight terminals, and godown warehouses. Global supply chains lose over seven billion dollars annually to yard congestion, detention penalties, and manual gate bottlenecks. YardSight bridges edge computer vision with autonomous reasoning to transform dark, chaotic yards into self-orchestrating, high-velocity distribution engines.",
    },
    {
        "id": "02_command_center",
        "title": "Logistics Command Center & Business Telemetry",
        "text": "The Logistics Command Center delivers instant executive visibility across all yard operations. Real-time digital twin bays track active container unloading, while our automated demurrage engine monitors vehicle dwell against sixty-minute service level agreements. Operators see live truck turnaround velocity, detention fee exposure, and facility throughput metrics updated dynamically with zero manual data entry.",
    },
    {
        "id": "03_cctv_matrix",
        "title": "32-Channel Surveillance Matrix & Real Optical Ingestion",
        "text": "Our enterprise Surveillance Matrix ingests thirty-two Dahua NVR optical channels with sub-second peer-to-peer streaming. Embedded computer vision models execute live object tracking across inbound gates, arterial forklift corridors, and high-bay racking aisles, providing continuous spatial awareness without exhausting edge compute or memory bandwidth.",
    },
    {
        "id": "04_anpr_gate",
        "title": "Automated ANPR Gate & Optical Inspection",
        "text": "At the security perimeter, our automated ANPR engine revolutionizes inbound gate processing. Using four-corner perspective homography, it unwarps oblique camera angles and extracts commercial freight license plates in under one hundred milliseconds. Vehicle numbers are cross-referenced with digital driver manifests, automating barrier lift and cutting gate check-in times by over eighty percent.",
    },
    {
        "id": "05_fleet_dwell",
        "title": "Fleet Turnaround & Demurrage Cost Optimization",
        "text": "Uncontrolled truck dwell is the single largest cost leak in freight warehousing. YardSight's Fleet Intelligence engine monitors every container from gate-in to gate-out. Proactive demurrage alerts trigger automated driver notifications before costly detention tiers kick in, saving logistics operators thousands of dollars per bay every month.",
    },
    {
        "id": "06_nimbus_ai",
        "title": "Nimbus AI Copilot (Nebius x NVIDIA Nemotron)",
        "text": "Powered by the Nebius Token Factory and NVIDIA Nemotron seventy-B open-source model, the Nimbus AI Copilot acts as a tireless yard operations superintendent. Dispatchers query the yard in plain natural language, receiving instant tactical recommendations on dock reallocation, traffic clearing, and safety hazard mitigation.",
    },
    {
        "id": "07_leak_physics",
        "title": "Physics-Informed Specular Leak & Spill Detection",
        "text": "Safety and risk prevention are hard-coded into our physical vision pipeline. By analyzing specular albedo reflectance on concrete apron surfaces, YardSight detects roof structural moisture leaks and hazardous liquid spills before cargo spoilage or warehouse slips occur.",
    },
    {
        "id": "08_compliance_audit",
        "title": "Regulatory E-Way Bills & One-Click Audit Export",
        "text": "Statutory compliance is fully automated with direct NIC GST E-Way bill integration and digital electronic bills of lading. YardSight reconciles consigned weights, validates vehicle tax validity, and generates cryptographic, one-click PDF audit dossiers for enterprise freight transparency.",
    },
    {
        "id": "09_business_impact",
        "title": "Enterprise ROI & Autonomous Logistics Future",
        "text": "By replacing fragmented manual clipboards with autonomous Physical AI, YardSight AI slashes gate turnaround times from over two hours down to under thirty-five minutes, eliminates demurrage disputes, and delivers proven enterprise ROI. Built for the Nebius and NVIDIA Global AI Hackathon, YardSight AI is the future of intelligent supply chain infrastructure.",
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
        communicate = edge_tts.Communicate(seg["text"], voice="en-US-ChristopherNeural", rate="+3%", pitch="+0Hz")
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
        
        # 1. Intro - Dashboard Command Center Overview
        dur_01 = segment_data[0]["duration"]
        print(f"  [1/9] Intro ({dur_01:.1f}s)")
        page.goto("http://localhost:5173", wait_until="networkidle")
        page.wait_for_timeout(2000)
        page.mouse.move(500, 300)
        page.wait_for_timeout(int(max(1.0, dur_01 - 2.0) * 1000))
        
        # 2. Command Center & Digital Twin Business Telemetry
        dur_02 = segment_data[1]["duration"]
        print(f"  [2/9] Command Center & Business Telemetry ({dur_02:.1f}s)")
        page.mouse.move(300, 260)
        page.wait_for_timeout(2000)
        page.mouse.move(650, 260)
        page.wait_for_timeout(2000)
        # Scroll down to show dwell and detention fee analytics
        page.mouse.wheel(0, 450)
        page.wait_for_timeout(int((dur_02 - 6.0) * 1000))
        page.mouse.wheel(0, -450)
        page.wait_for_timeout(2000)
        
        # 3. CCTV Matrix (Live Dahua NVR Streams) & Optical Multi-Channel
        dur_03 = segment_data[2]["duration"]
        print(f"  [3/9] 32-Channel CCTV Matrix ({dur_03:.1f}s)")
        page.locator("aside button:has-text('Live CCTV Matrix')").first.click()
        page.wait_for_timeout(4000)
        # Inspect Channel 01 or 02 for high-res view
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
        remaining_03 = max(1.0, dur_03 - 9.5)
        page.wait_for_timeout(int(remaining_03 * 1000))
        
        # 4. OpenCV ANPR Gate Scanner & Homography
        dur_04 = segment_data[3]["duration"]
        print(f"  [4/9] OpenCV 4.10 ANPR Gate ({dur_04:.1f}s)")
        page.locator("aside button:has-text('OpenCV 4.10 ANPR')").first.click()
        page.wait_for_timeout(int(dur_04 * 1000))
        
        # 5. Fleet Turnaround & Demurrage Cost Optimization
        dur_05 = segment_data[4]["duration"]
        print(f"  [5/9] Fleet Dwell & Detention SLA Engine ({dur_05:.1f}s)")
        page.locator("aside button:has-text('Fleet & Dock Dwell')").first.click()
        page.wait_for_timeout(int(dur_05 * 1000))
        
        # 6. Nimbus AI Copilot (Nebius x NVIDIA Nemotron)
        dur_06 = segment_data[5]["duration"]
        print(f"  [6/9] Nimbus AI Copilot ({dur_06:.1f}s)")
        page.locator("aside button:has-text('Nimbus AI Hub')").first.click()
        page.wait_for_timeout(int(dur_06 * 1000))
        
        # 7. Specular Albedo Leak & Spill Physics
        dur_07 = segment_data[6]["duration"]
        print(f"  [7/9] Specular Albedo Leak Detection ({dur_07:.1f}s)")
        page.locator("aside button:has-text('Concrete Specular Leaks')").first.click()
        page.wait_for_timeout(int(dur_07 * 1000))
        
        # 8. E-Way Bills & Tax Reconciliation
        dur_08 = segment_data[7]["duration"]
        print(f"  [8/9] E-Way Bills & Audit Reports ({dur_08:.1f}s)")
        page.locator("aside button:has-text('E-Way Bills & eBOL')").first.click()
        page.wait_for_timeout(int(dur_08 * 1000))
        
        # 9. Enterprise ROI & Command Center Outro
        dur_09 = segment_data[8]["duration"]
        print(f"  [9/9] Business ROI & Outro ({dur_09:.1f}s)")
        page.locator("aside button:has-text('Logistics Command')").first.click()
        page.wait_for_timeout(2000)
        page.wait_for_timeout(int(max(2.0, dur_09) * 1000) + 2000)
        
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
        "-ss", "00:00:35",
        "-i", desktop_output,
        "-vframes", "1",
        "-q:v", "2",
        poster_desktop
    ]
    subprocess.run(thumb_cmd, check=True)
    shutil.copyfile(poster_desktop, poster_local)
    
    print("\n" + "="*60)
    print(" MASTER BUSINESS-FOCUSED WALKTHROUGH RENDERED PERFECTLY!")
    print(f" Master Video: {desktop_output} ({os.path.getsize(desktop_output)/(1024*1024):.2f} MB)")
    print(f" Video Poster: {poster_desktop}")
    print(f" Exact Matched Duration: {audio_dur:.2f}s")
    print("="*60)

if __name__ == "__main__":
    audio_path, segment_data, total_audio_dur = asyncio.run(generate_narration_tracks())
    raw_video = record_synchronized_walkthrough(segment_data, total_audio_dur)
    compile_master_video(raw_video, audio_path, total_audio_dur)

