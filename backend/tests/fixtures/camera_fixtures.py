"""
Enterprise CCTV Camera Fixtures for Demo & Testing Environments.
Seeds multi-tenant cameras for Amazon BLR1, Flipkart Bhiwandi, and DFW Intermodal.
"""

from models import CCTVCamera


def seed_enterprise_cameras(db):
    """Seeds multi-tenant CCTV cameras for Amazon BLR1, Flipkart Bhiwandi, and DFW Intermodal."""
    cameras = [
        # --- TENANT-AMZN-BLR1 (4 Cameras) ---
        CCTVCamera(
            id="cam-01-gate-inbound",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 01 - Gate North ANPR",
            stream_type="RTSP",
            location="North Perimeter Gate 1",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.101:554/cam/realmonitor?channel=1&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-02-gate-outbound",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 02 - Bay 01 Loading Dock",
            stream_type="DMSS",
            location="Dock Bay West",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.102:554/cam/realmonitor?channel=2&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-03-dock-apron",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 03 - Bay 03 Loading Dock",
            stream_type="DMSS",
            location="Dock Bay East",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.103:554/cam/realmonitor?channel=3&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-04-roof-leak",
            tenant_id="TENANT-AMZN-BLR1",
            name="CAM 04 - Interior Godown Floor",
            stream_type="RTSP",
            location="Godown Sector 4 Ceiling",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.1.104:554/cam/realmonitor?channel=4&subtype=0",
            dmss_serial="DH-98410291-BLR",
            dmss_channel=4,
            dmss_username="admin",
            ai_pipeline="ROOF_LEAK",
            brand="DAHUA_DMSS"
        ),

        # --- TENANT-FK-BHW1 (3 Cameras) ---
        CCTVCamera(
            id="cam-fk-01-gate",
            tenant_id="TENANT-FK-BHW1",
            name="CAM FK-01 - Bhiwandi Gate 1 ANPR",
            stream_type="RTSP",
            location="South Gate Entrance",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.2.101:554/stream1",
            dmss_serial="DH-77112233-FK",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-fk-02-dock",
            tenant_id="TENANT-FK-BHW1",
            name="CAM FK-02 - High-Bay Cross-Dock",
            stream_type="DMSS",
            location="Cross-Dock Bay 04",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.2.102:554/stream1",
            dmss_serial="DH-77112233-FK",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-fk-03-dispatch",
            tenant_id="TENANT-FK-BHW1",
            name="CAM FK-03 - Outbound Staging",
            stream_type="DMSS",
            location="Outbound Sorting Hub",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@192.168.2.103:554/stream1",
            dmss_serial="DH-77112233-FK",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),

        # --- TENANT-US-DFW (8 Cameras) ---
        CCTVCamera(
            id="cam-dfw-01-gate-in",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-01 - Intermodal Gate North Inbound",
            stream_type="RTSP",
            location="Gate North Booth 1",
            status="ONLINE",
            fps=30,
            resolution="4K Ultra-HD",
            stream_url="rtsp://admin:admin123@10.0.1.10:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=1,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-02-gate-out",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-02 - Intermodal Gate North Outbound",
            stream_type="RTSP",
            location="Gate North Booth 2",
            status="ONLINE",
            fps=30,
            resolution="4K Ultra-HD",
            stream_url="rtsp://admin:admin123@10.0.1.11:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=2,
            dmss_username="admin",
            ai_pipeline="ANPR_OCR",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-03-bay-01",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-03 - Intermodal Dock Apron 01-04",
            stream_type="DMSS",
            location="Dock West Wing",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.12:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=3,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-04-bay-05",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-04 - Intermodal Dock Apron 05-08",
            stream_type="DMSS",
            location="Dock West Wing",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.13:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=4,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-05-bay-09",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-05 - Intermodal Dock Apron 09-12",
            stream_type="DMSS",
            location="Dock East Wing",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.14:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=5,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-06-bay-13",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-06 - Intermodal Dock Apron 13-16",
            stream_type="DMSS",
            location="Dock East Wing",
            status="ONLINE",
            fps=30,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.15:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=6,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-07-rail",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-07 - Intermodal Rail Spur & Well-Cars",
            stream_type="DMSS",
            location="Rail Terminal Spur 1",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.16:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=7,
            dmss_username="admin",
            ai_pipeline="DOCK_CYCLE",
            brand="DAHUA_DMSS"
        ),
        CCTVCamera(
            id="cam-dfw-08-roof",
            tenant_id="TENANT-US-DFW",
            name="CAM DFW-08 - Intermodal Mega-Shed Specular Roof",
            stream_type="RTSP",
            location="Mega-Shed High Bay Ceiling",
            status="ONLINE",
            fps=25,
            resolution="1080p",
            stream_url="rtsp://admin:admin123@10.0.1.17:554/live",
            dmss_serial="DH-US-8849201-DFW",
            dmss_channel=8,
            dmss_username="admin",
            ai_pipeline="ROOF_LEAK",
            brand="DAHUA_DMSS"
        )
    ]
    for c in cameras:
        if not db.query(CCTVCamera).filter(CCTVCamera.id == c.id).first():
            db.add(c)
    db.commit()
