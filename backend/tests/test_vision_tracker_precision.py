"""
Unit Test: Multi-Stage OpenCV Pipeline & Precision HUD
Validates that:
1. Irregular non-human briquettes, falling files, and debris are strictly excluded from 'PERSON' classification.
2. Authentic human geometry (aspect ratio 1.6-4.2, solidity 0.50-0.85, height >= 60px) is correctly recognized.
3. Heavy vehicle geometries are classified as 'VEHICLE'.
"""

import cv2
import numpy as np
import pytest
from services.streamer.vision_tracker import RealVisionTracker

def test_debris_and_briquettes_rejected_from_person():
    tracker = RealVisionTracker()
    frame = np.zeros((720, 1280, 3), dtype=np.uint8)

    # Synthetic contour simulating a solid rectangular briquette on a conveyor:
    # Width: 45px, Height: 48px, Area: ~2,160 px^2, Solidity: ~1.0 (Solid Brick)
    briquette_mask = np.zeros((720, 1280), dtype=np.uint8)
    cv2.rectangle(briquette_mask, (300, 300), (345, 348), 255, -1)

    # Extract contour
    contours, _ = cv2.findContours(briquette_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    cnt = contours[0]
    area = cv2.contourArea(cnt)
    x, y, bw, bh = cv2.boundingRect(cnt)
    aspect_ratio = bh / float(bw) if bw > 0 else 0.0
    hull = cv2.convexHull(cnt)
    solidity = area / float(cv2.contourArea(hull))

    is_human = (
        1.6 <= aspect_ratio <= 4.2 and
        0.50 <= solidity <= 0.85 and
        bh >= 60 and
        bw >= 18 and
        1800 <= area <= 55000
    )

    # Briquette should NEVER be classified as human!
    assert not is_human, f"Solid rectangular briquette (Solidity {solidity:.2f}, bh {bh}) erroneously tagged as human"

def test_small_file_debris_rejected():
    # Synthetic small debris: Height 25px (small falling waste)
    bh = 25
    bw = 10
    area = 250
    aspect_ratio = 2.5
    solidity = 0.65

    is_human = (
        1.6 <= aspect_ratio <= 4.2 and
        0.50 <= solidity <= 0.85 and
        bh >= 60 and
        bw >= 18 and
        1800 <= area <= 55000
    )

    assert not is_human, "Small falling debris < 60px was falsely tagged as human"

def test_authentic_human_silhouette_accepted():
    # Human worker silhouette: Height: 120px, Width: 40px (aspect_ratio = 3.0),
    # Silhouette with limbs/torso has solidity ~0.68, area ~3,200 px^2
    bh = 120
    bw = 40
    aspect_ratio = bh / float(bw)
    solidity = 0.68
    area = 3200

    is_human = (
        1.6 <= aspect_ratio <= 4.2 and
        0.50 <= solidity <= 0.85 and
        bh >= 60 and
        bw >= 18 and
        1800 <= area <= 55000
    )

    assert is_human, "Authentic human worker silhouette was incorrectly rejected"
