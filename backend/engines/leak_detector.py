"""
YardSight AI - Concrete Specular Reflection & Roof Leak Detection Engine
Detects water leaks in rented godowns and warehouses by analyzing specular glare peaks,
diffuse albedo drop (dark-patch creation on dry concrete), and temporal expansion rates.
"""

import cv2
import numpy as np
import base64
from typing import Dict, Any

class ConcretePuddleDetector:
    def __init__(self):
        self.pixel_to_sqm_ratio = 0.0025  # 1 pixel = 0.0025 sq meters (~5cm x 5cm)

    def analyze_puddle_frame(
        self,
        current_frame: np.ndarray,
        baseline_dry_frame: np.ndarray
    ) -> Dict[str, Any]:
        """
        Detects wet concrete expansion and overhead light specular reflections.
        """
        gray_curr = cv2.cvtColor(current_frame, cv2.COLOR_BGR2GRAY)
        gray_base = cv2.cvtColor(baseline_dry_frame, cv2.COLOR_BGR2GRAY)

        # 1. Diffuse Albedo Drop: Dry concrete turns dark grey when wet
        # Difference = Base - Curr (where Base was bright dry concrete and Curr is dark wet)
        albedo_diff = cv2.subtract(gray_base, gray_curr)
        _, wet_mask = cv2.threshold(albedo_diff, 40, 255, cv2.THRESH_BINARY)

        # Morphological opening to clean small camera sensor noise
        kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
        wet_mask = cv2.morphologyEx(wet_mask, cv2.MORPH_OPEN, kernel)
        wet_mask = cv2.morphologyEx(wet_mask, cv2.MORPH_DILATE, kernel)

        # 2. Specular Glare Detection: Overhead light reflection off water surface
        _, specular_mask = cv2.threshold(gray_curr, 235, 255, cv2.THRESH_BINARY)
        # Specular reflection must intersect or be adjacent to wet boundary
        specular_in_puddle = cv2.bitwise_and(specular_mask, cv2.dilate(wet_mask, kernel, iterations=3))

        # 3. Contour analysis & Area calculation
        contours, _ = cv2.findContours(wet_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        total_wet_pixels = cv2.countNonZero(wet_mask)
        specular_glare_peaks = cv2.countNonZero(specular_in_puddle)

        estimated_sqm = round(total_wet_pixels * self.pixel_to_sqm_ratio, 2)
        severity = "CRITICAL (Active Roof Leak)" if estimated_sqm > 3.0 else "WARNING (Seepage Detected)" if estimated_sqm > 0.5 else "NORMAL"

        return {
            "wet_pixels": total_wet_pixels,
            "estimated_surface_area_sqm": estimated_sqm,
            "specular_peaks_count": specular_glare_peaks,
            "severity": severity,
            "contours_count": len(contours)
        }

    def simulate_leak_cctv(self, leak_intensity: float = 0.65) -> Dict[str, Any]:
        """
        Generates synthetic CCTV footage of an interior godown floor with bags of grain/cement
        and an expanding water puddle reflecting overhead bay lights.
        """
        height, width = 360, 640
        dry_floor = np.zeros((height, width, 3), dtype=np.uint8)
        dry_floor[:] = (125, 130, 138)  # Light grey dry concrete floor

        # Add concrete floor cracks and texture
        noise = np.random.normal(0, 8, (height, width, 3)).astype(np.int16)
        dry_floor = np.clip(dry_floor.astype(np.int16) + noise, 0, 255).astype(np.uint8)

        # Draw pallet stacks of cement/grain on sides
        cv2.rectangle(dry_floor, (20, 40), (160, 320), (50, 70, 110), -1)
        cv2.rectangle(dry_floor, (480, 40), (620, 320), (50, 70, 110), -1)
        cv2.putText(dry_floor, "CEMENT STACK A", (25, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)
        cv2.putText(dry_floor, "GRAIN STACK B", (485, 80), cv2.FONT_HERSHEY_SIMPLEX, 0.45, (255, 255, 255), 1)

        # Wet frame
        wet_frame = dry_floor.copy()
        
        # Draw dark wet concrete puddle in center
        center = (320, 200)
        axes = (int(90 * leak_intensity), int(55 * leak_intensity))
        cv2.ellipse(wet_frame, center, axes, 15, 0, 360, (55, 60, 68), -1) # Dark wet concrete
        # Inner deeper puddle
        cv2.ellipse(wet_frame, center, (int(axes[0]*0.7), int(axes[1]*0.7)), 15, 0, 360, (40, 45, 52), -1)

        # Specular highlight: reflection of overhead light tube
        light_pos = (315, 195)
        cv2.ellipse(wet_frame, light_pos, (int(axes[0]*0.25), int(axes[1]*0.15)), 15, 0, 360, (250, 250, 255), -1)

        # Annotations on frame
        cv2.putText(wet_frame, "[CAM 04 - INTERIOR GODOWN BAY 2]", (20, 30), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 220, 255), 2)
        cv2.putText(wet_frame, "WATER LEAK DETECTION: ACTIVE", (20, 340), cv2.FONT_HERSHEY_SIMPLEX, 0.55, (0, 0, 255), 2)

        # Run detection
        metrics = self.analyze_puddle_frame(wet_frame, dry_floor)

        # Create overlaid visual analysis mask
        vis = wet_frame.copy()
        cv2.ellipse(vis, center, axes, 15, 0, 360, (0, 0, 255), 2) # Red alert contour
        cv2.putText(vis, f"Area: {metrics['estimated_surface_area_sqm']} sq.m | {metrics['severity']}",
                    (center[0] - 110, center[1] + 75), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 2)

        _, raw_buf = cv2.imencode('.jpg', wet_frame)
        _, vis_buf = cv2.imencode('.jpg', vis)

        return {
            "camera_id": "CAM-04-GODOWN-INTERIOR",
            "metrics": metrics,
            "leak_rate_liters_per_hour": round(metrics["estimated_surface_area_sqm"] * 12.5, 1),
            "threatened_inventory": "350 Bags of UltraTech Cement (Valued at $2,800 USD / ₹2,35,000 INR)",
            "cctv_frame_b64": f"data:image/jpeg;base64,{base64.b64encode(raw_buf).decode('utf-8')}",
            "analysis_overlay_b64": f"data:image/jpeg;base64,{base64.b64encode(vis_buf).decode('utf-8')}"
        }

# Global instance
leak_detector = ConcretePuddleDetector()
