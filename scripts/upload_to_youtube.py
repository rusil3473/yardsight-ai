"""
YardSight AI - Automated YouTube Authorization & Upload Tool
Nebius x NVIDIA Global AI Hackathon Submission
"""

import os
import sys
import argparse
import time
from pathlib import Path

# Ensure unbuffered output
sys.stdout.reconfigure(line_buffering=True)
sys.stderr.reconfigure(line_buffering=True)

import google.auth.exceptions
from google.auth.transport.requests import Request
from google.oauth2.credentials import Credentials
from google_auth_oauthlib.flow import InstalledAppFlow
import googleapiclient.discovery
import googleapiclient.errors
from googleapiclient.http import MediaFileUpload

SCOPES = ["https://www.googleapis.com/auth/youtube.upload", "https://www.googleapis.com/auth/youtube.readonly"]

SCRIPT_DIR = Path(__file__).resolve().parent
REPO_ROOT = SCRIPT_DIR.parent
WORKSPACE_ROOT = REPO_ROOT.parent

# Search candidate locations for client_secrets.json
CLIENT_SECRETS_CANDIDATES = [
    REPO_ROOT / "client_secrets.json",
    WORKSPACE_ROOT / "client_secrets.json",
    Path(r"c:\Users\Rusil\Desktop\Hackathon\yardsight\client_secrets.json"),
    Path(r"c:\Users\Rusil\Desktop\Hackathon\client_secrets.json"),
]

TOKEN_PATH = REPO_ROOT / "token.json"


def find_client_secrets() -> Path:
    for cand in CLIENT_SECRETS_CANDIDATES:
        if cand.exists() and cand.is_file():
            return cand
    raise FileNotFoundError(
        "Could not find client_secrets.json in expected directories:\n"
        + "\n".join(f" - {p}" for p in CLIENT_SECRETS_CANDIDATES)
    )


def authenticate_youtube(client_secrets_path: Path) -> googleapiclient.discovery.Resource:
    creds = None
    if TOKEN_PATH.exists():
        try:
            creds = Credentials.from_authorized_user_file(str(TOKEN_PATH), SCOPES)
            print(f"[AUTH] Loaded existing token from {TOKEN_PATH}")
        except Exception as e:
            print(f"[AUTH] Warning: Failed to parse existing {TOKEN_PATH}: {e}")
            creds = None

    if not creds or not creds.valid:
        if creds and creds.expired and creds.refresh_token:
            print("[AUTH] Token expired, refreshing via Google OAuth...")
            try:
                creds.refresh(Request())
                print("[AUTH] Token refreshed successfully!")
            except Exception as e:
                print(f"[AUTH] Refresh failed: {e}. Initiating fresh local server authorization...")
                creds = None

        if not creds:
            print(f"[AUTH] Initiating OAuth consent flow with {client_secrets_path}...")
            print("[AUTH] A browser window will now open for you to log into Google and grant YouTube upload permissions.")
            print("[AUTH] If in Testing Mode, click 'Advanced' -> 'Go to yotu-513116 (unsafe)' -> 'Continue'.")
            
            flow = InstalledAppFlow.from_client_secrets_file(str(client_secrets_path), SCOPES)
            auth_url, _ = flow.authorization_url(prompt='consent', access_type='offline')
            print(f"\n============================================================")
            print(f" AUTH URL: {auth_url}")
            print(f"============================================================\n")
            creds = flow.run_local_server(port=0, open_browser=True)

        with open(TOKEN_PATH, "w") as token_file:
            token_file.write(creds.to_json())
            print(f"[AUTH] Successfully saved authorized credentials to {TOKEN_PATH}")

    youtube = googleapiclient.discovery.build("youtube", "v3", credentials=creds)
    
    # Verify authentication by fetching user channel
    try:
        channels_response = youtube.channels().list(mine=True, part="snippet").execute()
        items = channels_response.get("items", [])
        if items:
            channel_title = items[0]["snippet"]["title"]
            print(f"[AUTH] Verified! Authenticated as YouTube Channel: '{channel_title}'")
        else:
            print("[AUTH] Verified! Authenticated with Google Account (no public channel custom name).")
    except Exception as e:
        print(f"[AUTH] Note: Could not fetch channel name ({e}), but OAuth token is valid.")

    return youtube


def upload_video(
    youtube: googleapiclient.discovery.Resource,
    video_path: Path,
    poster_path: Path | None,
    privacy_status: str = "public",
) -> str:
    if not video_path.exists():
        raise FileNotFoundError(f"Video file not found at: {video_path}")

    file_size_mb = video_path.stat().st_size / (1024 * 1024)
    print(f"\n============================================================")
    print(f" UPLOADING WALKTHROUGH VIDEO TO YOUTUBE")
    print(f" Video Path: {video_path} ({file_size_mb:.2f} MB)")
    print(f" Privacy:    {privacy_status}")
    print(f"============================================================\n")

    title = "YardSight AI - Autonomous Physical AI Logistics Vision OS | Nebius Global AI Hackathon Demo"
    
    description = (
        "YardSight AI (GodownOS) is an enterprise physical AI vision operating system engineered for high-throughput "
        "commercial logistics depots, chemical warehousing, and intermodal freight terminals.\n\n"
        "Engineered for the Nebius x NVIDIA Global AI Hackathon (Physical AI Track).\n\n"
        "Key Architectural Innovations:\n"
        "1. 32-Channel Industrial Dahua NVR P2P Stream Multiplexing (sub-100ms latency)\n"
        "2. OpenCV 4.10 Perspective Homography ANPR Engine (rectifies steep 30-to-50 degree camera angles)\n"
        "3. Physics-Informed Specular Albedo Hydrocarbon Leak Detection (detects diesel puddles on warehouse concrete)\n"
        "4. Nimbus AI Spatial Reasoning Copilot (Nebius Token Factory x NVIDIA Nemotron 70B)\n"
        "5. Automated Turnaround and Detention SLA Cost Engine (curbing $1.2B demurrage penalties)\n\n"
        "GitHub Repository: https://github.com/rusil3473/yardsight-ai\n"
        "Devpost Submission: Nebius x NVIDIA Global AI Hackathon 2026\n"
        "Track: Physical AI (Autonomous Edge Vision and Facility Intelligence)"
    )

    tags = [
        "YardSight",
        "Physical AI",
        "NVIDIA",
        "Nebius",
        "Nemotron",
        "OpenCV",
        "Computer Vision",
        "ANPR",
        "Logistics AI",
        "Dahua NVR",
        "Supply Chain",
        "Hackathon",
        "Devpost",
    ]

    body = {
        "snippet": {
            "title": title,
            "description": description,
            "tags": tags,
            "categoryId": "28",  # Science & Technology
        },
        "status": {
            "privacyStatus": privacy_status,
            "selfDeclaredMadeForKids": False,
        },
    }

    media = MediaFileUpload(
        str(video_path),
        mimetype="video/mp4",
        chunksize=5 * 1024 * 1024,
        resumable=True,
    )

    request = youtube.videos().insert(
        part=",".join(body.keys()),
        body=body,
        media_body=media,
    )

    print("[UPLOAD] Beginning chunked video upload...")
    response = None
    last_progress = 0
    start_time = time.time()

    while response is None:
        status, response = request.next_chunk()
        if status:
            progress = int(status.progress() * 100)
            if progress != last_progress:
                elapsed = time.time() - start_time
                print(f"  --> Progress: {progress}% uploaded ({elapsed:.1f}s elapsed)")
                last_progress = progress

    video_id = response.get("id")
    video_url = f"https://youtu.be/{video_id}"
    print(f"\n[UPLOAD] Video upload complete! Video ID: {video_id}")
    print(f"[UPLOAD] Watch URL: {video_url}")

    # Set Custom Thumbnail if provided
    if poster_path and poster_path.exists():
        print(f"\n[THUMBNAIL] Uploading custom poster thumbnail from {poster_path}...")
        try:
            youtube.thumbnails().set(
                videoId=video_id,
                media_body=MediaFileUpload(str(poster_path), mimetype="image/jpeg"),
            ).execute()
            print("[THUMBNAIL] Custom poster thumbnail set successfully!")
        except Exception as e:
            print(f"[THUMBNAIL] Warning: Failed to upload custom thumbnail: {e}")
            print("  (Note: Your YouTube account must have verified phone number status for custom thumbnails)")

    print("\n============================================================")
    print(f" YOUTUBE WALKTHROUGH LIVE: {video_url}")
    print("============================================================\n")
    return video_url


def main():
    parser = argparse.ArgumentParser(description="YardSight YouTube Video Uploader")
    parser.add_argument("--auth-only", action="store_true", help="Authorize OAuth and exit without uploading")
    parser.add_argument("--privacy", default="public", choices=["public", "unlisted", "private"], help="Video privacy")
    parser.add_argument("--video", default=r"c:\Users\Rusil\Desktop\YardSight_Detailed_Walkthrough.mp4", help="Video path")
    parser.add_argument("--poster", default=r"c:\Users\Rusil\Desktop\YardSight_Detailed_Poster.jpg", help="Poster path")
    args = parser.parse_args()

    client_secrets = find_client_secrets()
    print(f"[INIT] Using client secrets: {client_secrets}")

    youtube = authenticate_youtube(client_secrets)

    if args.auth_only:
        print("[SUCCESS] OAuth Authorization complete! Token is saved.")
        return

    video_path = Path(args.video)
    poster_path = Path(args.poster) if args.poster else None
    video_url = upload_video(youtube, video_path, poster_path, args.privacy)

    print(f"Video uploaded successfully: {video_url}")


if __name__ == "__main__":
    main()
