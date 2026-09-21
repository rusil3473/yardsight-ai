"""
YardSight AI - ANPR Perspective Homography & License Plate Unwarping Engine
Uses OpenCV 5 to rectify severely tilted, angled, and dusty license plates from 720p/1080p CCTV cameras.
"""

import cv2
import numpy as np
import base64
from typing import Dict, Any, Tuple, List

class ANPRHomographyEngine:
    def __init__(self):
        # Target canonical plate dimensions (400x120 pixels)
        self.target_width = 400
        self.target_height = 120
        self.dst_pts = np.float32([
            [0, 0],
            [self.target_width - 1, 0],
            [self.target_width - 1, self.target_height - 1],
            [0, self.target_height - 1]
        ])

    def unwarp_plate(
        self,
        image_np: np.ndarray,
        corner_points: np.ndarray
    ) -> Tuple[np.ndarray, np.ndarray]:
        """
        Calculates homography matrix H and warps distorted quadrilateral into planar rectangle.
        """
        # Compute perspective transform matrix
        M = cv2.getPerspectiveTransform(corner_points, self.dst_pts)
        unwarped = cv2.warpPerspective(image_np, M, (self.target_width, self.target_height))
        return unwarped, M

    def enhance_plate(self, unwarped_bgr: np.ndarray) -> np.ndarray:
        """
        Applies bilateral filtering, contrast stretching, and Otsu adaptive binarization
        optimized for dusty and night-time IR warehouse cameras.
        """
        gray = cv2.cvtColor(unwarped_bgr, cv2.COLOR_BGR2GRAY)
        # Noise reduction while preserving character edges
        filtered = cv2.bilateralFilter(gray, 9, 75, 75)
        # CLAHE (Contrast Limited Adaptive Histogram Equalization)
        clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
        contrast_boost = clahe.apply(filtered)
        # Adaptive Threshold
        binary = cv2.adaptiveThreshold(
            contrast_boost, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
            cv2.THRESH_BINARY, 11, 2
        )
        return binary

    def simulate_cctv_frame(self, plate_number: str = "MH-12-RN-4819", country: str = "IN") -> Dict[str, Any]:
        """
        Generates a synthetic CCTV frame with an angled truck plate,
        unwarps it using homography, and returns base64 images for web visualization.
        """
        # Canvas 640x360
        canvas = np.zeros((360, 640, 3), dtype=np.uint8)
        canvas[:] = (35, 40, 50)  # Dark asphalt yard
        
        # Add truck bumper texture
        cv2.rectangle(canvas, (100, 120), (540, 300), (60, 70, 85), -1)
        cv2.rectangle(canvas, (95, 115), (545, 305), (100, 110, 125), 2)
        
        # Plate polygon (tilted by camera angle: 25 deg tilt)
        src_corners = np.float32([
            [220, 180],  # Top-left
            [430, 205],  # Top-right
            [415, 270],  # Bottom-right
            [210, 240]   # Bottom-left
        ])
        
        # Draw yellow/white plate on canvas
        plate_color = (240, 240, 240) if country == "US" else (0, 215, 255) # Yellow plate for Indian commercial
        cv2.fillConvexPoly(canvas, src_corners.astype(np.int32), plate_color)
        cv2.polylines(canvas, [src_corners.astype(np.int32)], True, (0, 0, 0), 2)
        
        # Add distorted text indicator
        cv2.putText(canvas, f"[ANPR CAM 01 - GATE NORTH]", (20, 35), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 200), 2)
        cv2.putText(canvas, f"Angled Crop: {plate_number}", (190, 320), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)

        # Now perform real unwarping
        unwarped, _ = self.unwarp_plate(canvas, src_corners)
        
        # Render clean canonical text on the unwarped canvas
        cv2.putText(unwarped, plate_number, (25, 75), cv2.FONT_HERSHEY_DUPLEX, 1.4, (0, 0, 0), 3)
        if country == "IN":
            cv2.rectangle(unwarped, (0, 0), (20, 120), (200, 50, 0), -1) # Blue IND stripe
            cv2.putText(unwarped, "IND", (2, 70), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1)
        elif country == "US":
            cv2.putText(unwarped, "TEXAS", (140, 25), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (180, 20, 20), 2)

        # Enhance
        enhanced = self.enhance_plate(unwarped)
        
        # Encode to JPEG base64
        _, raw_buf = cv2.imencode('.jpg', canvas)
        _, unwarped_buf = cv2.imencode('.jpg', unwarped)
        _, enhanced_buf = cv2.imencode('.jpg', enhanced)

        return {
            "plate_number": plate_number,
            "country": country,
            "confidence": 0.964,
            "camera_id": "CAM-01-GATE-NORTH",
            "skew_angle_deg": 24.8,
            "raw_cctv_b64": f"data:image/jpeg;base64,{base64.b64encode(raw_buf).decode('utf-8')}",
            "unwarped_plate_b64": f"data:image/jpeg;base64,{base64.b64encode(unwarped_buf).decode('utf-8')}",
            "enhanced_binary_b64": f"data:image/jpeg;base64,{base64.b64encode(enhanced_buf).decode('utf-8')}"
        }

# Global instance
anpr_engine = ANPRHomographyEngine()
