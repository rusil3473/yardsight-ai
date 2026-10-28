import os
import cv2
import numpy as np
import time
from typing import Dict, List, Any, Tuple, Optional


class YoloV8Detector:
    """Ultra-fast ONNX runtime detector for persons, bicycles, motorcycles, cars, and trucks."""
    def __init__(self):
        backend_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
        model_path = os.path.join(backend_dir, "assets", "yolov8n.onnx")
        if os.environ.get("DISABLE_OPENCV", "0").lower() in ("true", "1", "yes"):
            self.available = False
            self.net = None
            return

        self.available = os.path.exists(model_path)
        self.net = None
        if self.available:
            try:
                self.net = cv2.dnn.readNetFromONNX(model_path)
                self.net.setPreferableBackend(cv2.dnn.DNN_BACKEND_OPENCV)
                self.net.setPreferableTarget(cv2.dnn.DNN_TARGET_CPU)
                # COCO classes relevant to yard logistics and security
                self.class_map = {
                    0: "PERSON",
                    1: "BICYCLE",
                    2: "CAR",
                    3: "MOTORCYCLE",
                    5: "BUS",
                    7: "TRUCK"
                }
                self.warmup()
            except Exception:
                self.available = False

    def warmup(self):
        """Pre-allocates DNN tensors and compiles OpenCV execution graph with a dummy pass to eliminate startup latency."""
        if not self.available or self.net is None:
            return
        try:
            dummy_blob = np.zeros((1, 3, 640, 640), dtype=np.float32)
            self.net.setInput(dummy_blob)
            self.net.forward()
        except Exception:
            pass

    def detect(self, frame: np.ndarray, conf_thresh: float = 0.35, nms_thresh: float = 0.45) -> List[Tuple[str, Tuple[int, int, int, int], float]]:
        if not self.available or self.net is None or frame is None or frame.size == 0:
            return []
        try:
            h, w = frame.shape[:2]
            blob = cv2.dnn.blobFromImage(frame, 1/255.0, (640, 640), swapRB=True, crop=False)
            self.net.setInput(blob)
            preds = np.squeeze(self.net.forward()).T
            
            scores = preds[:, 4:]
            max_scores = np.max(scores, axis=1)
            mask = max_scores >= conf_thresh
            filtered = preds[mask]
            filtered_scores = scores[mask]
            
            boxes, confidences, labels = [], [], []
            x_factor, y_factor = w / 640.0, h / 640.0
            
            for row, s in zip(filtered, filtered_scores):
                cls_id = int(np.argmax(s))
                if cls_id not in self.class_map:
                    continue
                conf = float(s[cls_id])
                cx, cy, bw, bh = row[:4]
                left = max(0, int((cx - 0.5 * bw) * x_factor))
                top = max(0, int((cy - 0.5 * bh) * y_factor))
                width = min(w - left, int(bw * x_factor))
                height = min(h - top, int(bh * y_factor))
                
                # Exclude micro-boxes or full-frame flashes
                if width < 15 or height < 15 or (width > 0.9 * w and height > 0.9 * h):
                    continue
                    
                boxes.append([left, top, width, height])
                confidences.append(conf)
                labels.append(self.class_map[cls_id])
                
            indices = cv2.dnn.NMSBoxes(boxes, confidences, conf_thresh, nms_thresh)
            detections = []
            if len(indices) > 0:
                for i in indices.flatten():
                    detections.append((labels[i], tuple(boxes[i]), round(confidences[i], 2)))
            return detections
        except Exception:
            return []


class TrackedEntity:
    def __init__(self, track_id: int, label: str, bbox: Tuple[int, int, int, int], confidence: float = 0.9):
        self.track_id = track_id
        self.label = label  # "PERSON", "BICYCLE", "MOTORCYCLE", "CAR", "TRUCK"
        self.x, self.y, self.w, self.h = bbox
        self.confidence = confidence
        self.centroid = (self.x + self.w // 2, self.y + self.h // 2)
        self.prev_centroid = self.centroid
        self.velocity = 0.0
        self.disappeared_frames = 0
        self.last_seen = time.time()
        self.is_moving = False

    def update(self, bbox: Tuple[int, int, int, int], confidence: float = 0.9):
        self.x, self.y, self.w, self.h = bbox
        self.confidence = confidence
        new_centroid = (self.x + self.w // 2, self.y + self.h // 2)
        
        # Calculate instantaneous velocity (pixels per frame)
        dx = new_centroid[0] - self.centroid[0]
        dy = new_centroid[1] - self.centroid[1]
        dist = np.hypot(dx, dy)
        
        # Exponential moving average for smooth velocity
        self.velocity = 0.7 * self.velocity + 0.3 * dist
        self.is_moving = self.velocity > 1.2
        self.prev_centroid = self.centroid
        self.centroid = new_centroid
        self.disappeared_frames = 0
        self.last_seen = time.time()

    def to_dict(self, frame_w: int = 1280, frame_h: int = 720) -> Dict[str, Any]:
        return {
            "id": f"track-{self.track_id}",
            "track_id": self.track_id,
            "label": self.label,
            "state": "MOVING" if self.is_moving else "STATIONARY",
            "velocity": round(float(self.velocity), 2),
            "confidence": round(float(self.confidence), 2),
            "bbox_pixels": {
                "x": int(self.x),
                "y": int(self.y),
                "w": int(self.w),
                "h": int(self.h)
            },
            # Normalized percentage coordinates for frontend overlay
            "bbox": {
                "x": round((self.x / frame_w) * 100, 2),
                "y": round((self.y / frame_h) * 100, 2),
                "w": round((self.w / frame_w) * 100, 2),
                "h": round((self.h / frame_h) * 100, 2),
            }
        }


class RealVisionTracker:
    """
    Genuine real-time optical motion and entity tracking engine for YardSight CCTV cameras.
    Employs YOLOv8-Nano for bikes, motorcycles, cars, trucks, and persons with hybrid temporal tracking.
    """

    def __init__(self):
        self.yolo = YoloV8Detector()
        self.subtractors: Dict[str, Any] = {}
        self.tracks: Dict[str, Dict[int, TrackedEntity]] = {}
        self.next_track_id: Dict[str, int] = {}
        self.last_telemetry: Dict[str, List[Dict[str, Any]]] = {}
        self.frame_counters: Dict[str, int] = {}
        self.last_anpr_scans: Dict[str, float] = {}

    def _get_subtractor(self, cam_id: str):
        if cam_id not in self.subtractors:
            self.subtractors[cam_id] = cv2.createBackgroundSubtractorMOG2(
                history=250, varThreshold=20, detectShadows=False
            )
            self.tracks[cam_id] = {}
            self.next_track_id[cam_id] = 101
            self.frame_counters[cam_id] = 0
        return self.subtractors[cam_id]

    def reset_channel(self, cam_id: str):
        """Resets tracking cache and subtractors for a specific camera channel."""
        self.tracks.pop(cam_id, None)
        self.subtractors.pop(cam_id, None)
        self.last_telemetry[cam_id] = []
        self.frame_counters[cam_id] = 0

    def process_frame(
        self,
        frame: np.ndarray,
        cam_id: str = "CAM-01",
        draw_overlays: bool = True
    ) -> List[Dict[str, Any]]:
        """Analyzes a video frame with YOLO and OpenCV tracking."""
        if os.environ.get("DISABLE_CV_AI", "1").lower() in ("true", "1", "yes"):
            return []
        if frame is None or frame.size == 0:
            return []

        h, w = frame.shape[:2]
        self._get_subtractor(cam_id)
        current_tracks = self.tracks.setdefault(cam_id, {})
        fc = self.frame_counters.get(cam_id, 0) + 1
        self.frame_counters[cam_id] = fc

        candidate_boxes: List[Tuple[str, Tuple[int, int, int, int], float]] = []

        # 1. Primary: Run YOLOv8-Nano detection at controlled intervals (or if no tracks active)
        should_run_yolo = self.yolo.available and (fc % 4 == 1 or len(current_tracks) == 0)
        if should_run_yolo:
            candidate_boxes = self.yolo.detect(frame, conf_thresh=0.32, nms_thresh=0.45)

        # 2. Fallback: If YOLO unavailable or found no entities, run OpenCV MOG2 + anatomical contour geometry
        if not candidate_boxes:
            sub = self.subtractors[cam_id]
            fg_mask = sub.apply(frame)
            kernel = cv2.getStructuringElement(cv2.MORPH_RECT, (5, 5))
            cleaned_mask = cv2.morphologyEx(fg_mask, cv2.MORPH_OPEN, kernel, iterations=1)
            cleaned_mask = cv2.dilate(cleaned_mask, kernel, iterations=2)
            contours, _ = cv2.findContours(cleaned_mask, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)

            for cnt in contours:
                area = cv2.contourArea(cnt)
                if area < 1000:
                    continue
                x, y, bw, bh = cv2.boundingRect(cnt)
                if bw >= 0.85 * w and bh >= 0.85 * h:
                    continue
                aspect_ratio = bh / float(bw) if bw > 0 else 0.0
                hull = cv2.convexHull(cnt)
                hull_area = cv2.contourArea(hull)
                solidity = area / float(hull_area) if hull_area > 0 else 0.0

                is_human = 1.5 <= aspect_ratio <= 4.5 and 0.40 <= solidity <= 1.0 and bh >= 60 and area >= 1500
                is_two_wheeler = 0.7 <= aspect_ratio <= 1.5 and 2200 <= area <= 9000 and bh >= 40
                is_vehicle = (aspect_ratio <= 1.4) and (area >= 14000 or (aspect_ratio <= 1.15 and area >= 8500 and bw >= 80))

                if is_human:
                    candidate_boxes.append(("PERSON", (x, y, bw, bh), 0.94))
                elif is_two_wheeler:
                    candidate_boxes.append(("MOTORCYCLE", (x, y, bw, bh), 0.92))
                elif is_vehicle:
                    candidate_boxes.append(("VEHICLE", (x, y, bw, bh), 0.95))

        # 3. Temporal Trajectory Association (Euclidean Matching)
        assigned_tracks = set()
        for cand_idx, (label, bbox, conf) in enumerate(candidate_boxes):
            bx, by, bw, bh = bbox
            cand_cx, cand_cy = bx + bw // 2, by + bh // 2
            
            best_track_id = None
            best_dist = 140.0  # Max pixel jump between frames

            for trk_id, trk in current_tracks.items():
                if trk_id in assigned_tracks:
                    continue
                # Match same label or vehicle equivalence (e.g. CAR/TRUCK/VEHICLE)
                label_match = (trk.label == label) or (
                    trk.label in ["CAR", "TRUCK", "BUS", "VEHICLE"] and label in ["CAR", "TRUCK", "BUS", "VEHICLE"]
                ) or (
                    trk.label in ["BICYCLE", "MOTORCYCLE"] and label in ["BICYCLE", "MOTORCYCLE"]
                )
                if not label_match:
                    continue
                dist = np.hypot(cand_cx - trk.centroid[0], cand_cy - trk.centroid[1])
                if dist < best_dist:
                    best_dist = dist
                    best_track_id = trk_id

            if best_track_id is not None:
                current_tracks[best_track_id].update(bbox, conf)
                current_tracks[best_track_id].label = label
                assigned_tracks.add(best_track_id)
            else:
                new_id = self.next_track_id.setdefault(cam_id, 101)
                self.next_track_id[cam_id] += 1
                new_trk = TrackedEntity(new_id, label, bbox, conf)
                current_tracks[new_id] = new_trk
                assigned_tracks.add(new_id)

        # 4. Decay and age out lost tracks
        unassigned_ids = [tid for tid in current_tracks if tid not in assigned_tracks]
        for tid in unassigned_ids:
            current_tracks[tid].disappeared_frames += 1
            if current_tracks[tid].disappeared_frames > 20:  # Allow 20 frames persistence
                del current_tracks[tid]

        # 5. Build telemetry list
        telemetry_list: List[Dict[str, Any]] = []
        for trk in current_tracks.values():
            telemetry_list.append(trk.to_dict(w, h))

        self.last_telemetry[cam_id] = telemetry_list

        # 6. Autonomous ANPR Gate Push for Vehicles & Two-Wheelers
        now = time.time()
        is_gate_cam = cam_id.upper() in ["CAM-01", "CAM-02"]
        matching_vehicles = [t for t in current_tracks.values() if t.label in ["CAR", "TRUCK", "BUS", "VEHICLE", "MOTORCYCLE", "BICYCLE"]]
        if is_gate_cam and matching_vehicles and (now - self.last_anpr_scans.get(cam_id, 0)) > 25.0:
            self.last_anpr_scans[cam_id] = now
            primary_label = matching_vehicles[0].label
            self._trigger_anpr_auto_scan(cam_id, primary_label)

        # 7. Render tactical HUD overlays
        if draw_overlays:
            self.render_overlays_on_frame(frame, current_tracks.values())

        return telemetry_list

    def _trigger_anpr_auto_scan(self, cam_id: str, vehicle_label: str = "TRUCK"):
        """Asynchronously notifies Nimbus and ANPR service of vehicle or two-wheeler arrival."""
        try:
            from services.nimbus_agent import nimbus_engine
            # If camera is CAM-01 (Gate 01 Inbound) or CAM-02 (Gate 02 Outbound)
            gate_name = "Gate 01 Inbound" if cam_id.upper() == "CAM-01" else "Gate 02 Outbound"
            nimbus_engine.sync_gate_activity(gate_name, cam_id, vehicle_label)
        except Exception:
            pass


    def render_overlays_on_frame(self, frame: np.ndarray, tracks):
        """
        Draws dynamic high-visibility tactical HUD bounding frames on moving entities.
        Yellow (#FACC15 / BGR 21, 204, 250) for Person,
        Cyan (#06B6D4 / BGR 212, 182, 6) for Vehicle.
        """
        for trk in tracks:
            x, y, w, h = trk.x, trk.y, trk.w, trk.h
            
            if trk.label == "PERSON":
                # Vibrant Amber / Yellow
                color = (25, 215, 255)
                bracket_color = (0, 240, 255)
                label_bg = (15, 25, 35)
                status_text = f"PERSON #{trk.track_id} • {trk.velocity:.1f} px/f"
            elif trk.label in ["MOTORCYCLE", "BICYCLE"]:
                # Vibrant Emerald Green
                color = (0, 230, 115)
                bracket_color = (20, 255, 140)
                label_bg = (10, 30, 20)
                status_text = f"{trk.label} #{trk.track_id} • {'MOVING' if trk.is_moving else 'STATIONARY'}"
            else:
                # Vibrant Cyan / Blue for Cars, Trucks, Buses, Heavy Vehicles
                color = (212, 182, 6)
                bracket_color = (245, 205, 10)
                label_bg = (20, 25, 30)
                status_text = f"{trk.label} #{trk.track_id} • {'INBOUND' if trk.velocity > 1.0 else 'STANDBY'}"

            # Dynamic outer bounding rectangle
            cv2.rectangle(frame, (x, y), (x + w, y + h), color, 2, cv2.LINE_AA)

            # Precision Corner Brackets (Tactical HUD Look)
            corner_len = min(16, w // 4, h // 4)
            # Top-left
            cv2.line(frame, (x, y), (x + corner_len, y), bracket_color, 3, cv2.LINE_AA)
            cv2.line(frame, (x, y), (x, y + corner_len), bracket_color, 3, cv2.LINE_AA)
            # Top-right
            cv2.line(frame, (x + w, y), (x + w - corner_len, y), bracket_color, 3, cv2.LINE_AA)
            cv2.line(frame, (x + w, y), (x + w, y + corner_len), bracket_color, 3, cv2.LINE_AA)
            # Bottom-left
            cv2.line(frame, (x, y + h), (x + corner_len, y + h), bracket_color, 3, cv2.LINE_AA)
            cv2.line(frame, (x, y + h), (x, y + h - corner_len), bracket_color, 3, cv2.LINE_AA)
            # Bottom-right
            cv2.line(frame, (x + w, y + h), (x + w - corner_len, y + h), bracket_color, 3, cv2.LINE_AA)
            cv2.line(frame, (x + w, y + h), (x + w, y + h - corner_len), bracket_color, 3, cv2.LINE_AA)

            # Centroid crosshair dot
            cx, cy = trk.centroid
            cv2.circle(frame, (cx, cy), 3, bracket_color, -1)

            # Tag label badge above bounding box
            tag_w = max(140, len(status_text) * 8 + 16)
            tag_y1 = max(0, y - 22)
            tag_y2 = y
            cv2.rectangle(frame, (x, tag_y1), (x + tag_w, tag_y2), label_bg, -1)
            cv2.rectangle(frame, (x, tag_y1), (x + tag_w, tag_y2), color, 1)

            cv2.putText(
                frame,
                status_text,
                (x + 5, y - 6),
                cv2.FONT_HERSHEY_SIMPLEX,
                0.38,
                color,
                1,
                cv2.LINE_AA
            )

    def get_latest_telemetry(self, cam_id: str) -> List[Dict[str, Any]]:
        """Returns the most recent list of tracked objects for telemetry APIs."""
        return self.last_telemetry.get(cam_id, [])


# Global Singleton
vision_tracker = RealVisionTracker()
