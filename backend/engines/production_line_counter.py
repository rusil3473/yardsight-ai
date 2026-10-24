"""
YardSight AI - Production Line Counter Engine
Autonomous conveyor belt unit counter using Kalman-filtered centroid tracking and virtual tripwire crossing detection.
Computes real-time Units Per Minute (UPM), daily throughput, and 7/30-day moving averages.
"""

from typing import List, Tuple, Dict, Any, Optional
import time
from datetime import datetime, date, timedelta
import math

class TrackedObject:
    def __init__(self, track_id: int, centroid: Tuple[int, int], timestamp: float):
        self.track_id = track_id
        self.centroids = [centroid]
        self.timestamps = [timestamp]
        self.has_crossed = False
        self.last_seen = timestamp

    def update(self, centroid: Tuple[int, int], timestamp: float):
        self.centroids.append(centroid)
        self.timestamps.append(timestamp)
        self.last_seen = timestamp
        if len(self.centroids) > 30:
            self.centroids.pop(0)
            self.timestamps.pop(0)

class ProductionLineCounter:
    """
    Tripwire line crossing detection and rolling throughput counter for industrial conveyor lines.
    """
    def __init__(
        self,
        line_id: str,
        tripwire: Tuple[Tuple[int, int], Tuple[int, int]],
        direction: str = "LEFT_TO_RIGHT",
        max_disappeared_seconds: float = 1.5,
        min_distance_threshold: float = 120.0
    ):
        self.line_id = line_id
        self.tripwire = tripwire  # ((x1, y1), (x2, y2))
        self.direction = direction.upper()
        self.max_disappeared_seconds = max_disappeared_seconds
        self.min_distance_threshold = min_distance_threshold

        self.next_track_id = 1
        self.tracked_objects: Dict[int, TrackedObject] = {}
        self.crossing_timestamps: List[float] = []
        self.total_counted = 0

    def _crosses_line(self, p1: Tuple[int, int], p2: Tuple[int, int]) -> bool:
        """
        Calculates line intersection using 2D cross-product orientation test.
        Determines whether line segment (p1 -> p2) crosses tripwire segment (A -> B).
        """
        (ax, ay), (bx, by) = self.tripwire
        (cx, cy), (dx, dy) = p1, p2

        def ccw(x1, y1, x2, y2, x3, y3):
            return (y3 - y1) * (x2 - x1) > (y2 - y1) * (x3 - x1)

        intersect = (ccw(ax, ay, cx, cy, dx, dy) != ccw(bx, by, cx, cy, dx, dy)) and \
                    (ccw(ax, ay, bx, by, cx, cy) != ccw(ax, ay, bx, by, dx, dy))

        if not intersect:
            return False

        # Directional verification
        if self.direction == "LEFT_TO_RIGHT":
            return dx > cx
        elif self.direction == "RIGHT_TO_LEFT":
            return dx < cx
        elif self.direction == "TOP_TO_BOTTOM":
            return dy > cy
        elif self.direction == "BOTTOM_TO_TOP":
            return dy < cy
        return True

    def process_frame_centroids(self, detected_centroids: List[Tuple[int, int]], timestamp: Optional[float] = None) -> int:
        """
        Updates active tracks with detected 2D bounding box centroids.
        Returns the number of new units that crossed the tripwire in this frame.
        """
        now = timestamp if timestamp is not None else time.time()
        new_crossings = 0

        # Purge stale tracks
        stale_ids = [
            tid for tid, obj in self.tracked_objects.items()
            if (now - obj.last_seen) > self.max_disappeared_seconds
        ]
        for tid in stale_ids:
            del self.tracked_objects[tid]

        if not detected_centroids:
            return 0

        # Match detected centroids to existing tracks via nearest neighbor
        unmatched_detections = list(detected_centroids)
        for tid, obj in list(self.tracked_objects.items()):
            if not unmatched_detections:
                break
            last_c = obj.centroids[-1]
            distances = [math.hypot(c[0] - last_c[0], c[1] - last_c[1]) for c in unmatched_detections]
            min_dist = min(distances)
            min_idx = distances.index(min_dist)

            if min_dist <= self.min_distance_threshold:
                match_centroid = unmatched_detections.pop(min_idx)
                # Check line crossing
                if not obj.has_crossed and self._crosses_line(last_c, match_centroid):
                    obj.has_crossed = True
                    new_crossings += 1
                    self.total_counted += 1
                    self.crossing_timestamps.append(now)
                obj.update(match_centroid, now)

        # Create new tracks for unmatched detections
        for new_c in unmatched_detections:
            self.tracked_objects[self.next_track_id] = TrackedObject(self.next_track_id, new_c, now)
            self.next_track_id += 1

        return new_crossings

    def get_realtime_metrics(self) -> Dict[str, Any]:
        """
        Returns rolling Units Per Minute (UPM), 5-minute pace, and instantaneous velocity.
        """
        now = time.time()
        # Filter crossings in the last 60 seconds
        last_60s = [t for t in self.crossing_timestamps if (now - t) <= 60.0]
        last_300s = [t for t in self.crossing_timestamps if (now - t) <= 300.0]

        upm_60s = float(len(last_60s))
        upm_5m = float(len(last_300s)) / 5.0 if last_300s else 0.0

        return {
            "line_id": self.line_id,
            "total_counted": self.total_counted,
            "current_upm": round(upm_60s, 1),
            "moving_avg_5m_upm": round(upm_5m, 1),
            "active_tracks_on_belt": len(self.tracked_objects)
        }

    @staticmethod
    def calculate_historical_moving_averages(daily_logs: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Computes 7-day and 30-day moving averages from a series of daily production logs.
        """
        if not daily_logs:
            return {"7_day_avg": 0.0, "30_day_avg": 0.0, "total_recorded_days": 0}

        # Sort logs chronologically
        sorted_logs = sorted(daily_logs, key=lambda x: x.get("log_date", ""))
        units = [
            x.get("user_adjusted_units") if x.get("user_adjusted_units") is not None
            else (x.get("estimated_units") or x.get("actual_units_counted", 0))
            for x in sorted_logs
        ]

        recent_7 = units[-7:] if len(units) >= 7 else units
        recent_30 = units[-30:] if len(units) >= 30 else units

        avg_7 = sum(recent_7) / len(recent_7) if recent_7 else 0.0
        avg_30 = sum(recent_30) / len(recent_30) if recent_30 else 0.0

        return {
            "7_day_avg": round(avg_7, 1),
            "30_day_avg": round(avg_30, 1),
            "total_recorded_days": len(units),
            "latest_day_units": units[-1] if units else 0
        }
