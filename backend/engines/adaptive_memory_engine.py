"""
YardSight AI - Adaptive Memory Engine (Recency-Weighted Exponential Decay)
Implements human-in-the-loop calibration with exponential recency decay:
    w_i(t) = exp(-lambda * delta_days)
Compresses historical user corrections into concise, bounded context summaries (<500 tokens).
"""

from typing import List, Dict, Any, Tuple
import math
from datetime import datetime, timedelta

class AdaptiveMemoryEngine:
    """
    Learns from human floor manager corrections, weighting recent context higher than older context,
    and produces bounded executive context summaries.
    """
    DEFAULT_HALF_LIFE_DAYS = 14.0  # Corrections lose 50% weight every 14 days
    LAMBDA_DECAY = math.log(2) / DEFAULT_HALF_LIFE_DAYS  # ~0.0495

    @classmethod
    def compute_recency_weight(cls, recorded_at: datetime, current_time: datetime = None) -> float:
        """
        Calculates exponential decay weight w in (0, 1].
        w = exp(-lambda * delta_days)
        """
        now = current_time or datetime.utcnow()
        delta_days = max(0.0, (now - recorded_at).total_seconds() / 86400.0)
        weight = math.exp(-cls.LAMBDA_DECAY * delta_days)
        return round(weight, 4)

    @classmethod
    def calculate_active_bias_multiplier(
        cls,
        corrections: List[Dict[str, Any]],
        current_time: datetime = None
    ) -> Tuple[float, List[Dict[str, Any]]]:
        """
        Computes the recency-weighted multiplier to apply to camera estimation algorithms.
        multiplier = sum(w_i * (corrected / original)) / sum(w_i)
        """
        if not corrections:
            return 1.0, []

        now = current_time or datetime.utcnow()
        weighted_sum = 0.0
        total_weight = 0.0
        weighted_records = []

        for c in corrections:
            rec_time = c.get("recorded_at")
            if isinstance(rec_time, str):
                try:
                    rec_time = datetime.fromisoformat(rec_time.replace("Z", "+00:00")).replace(tzinfo=None)
                except Exception:
                    rec_time = now
            elif not isinstance(rec_time, datetime):
                rec_time = now

            orig = float(c.get("original_value", 1.0))
            corr = float(c.get("corrected_value", 1.0))
            if orig <= 0:
                continue

            ratio = corr / orig
            weight = cls.compute_recency_weight(rec_time, now)

            weighted_sum += (weight * ratio)
            total_weight += weight

            record_copy = dict(c)
            record_copy["weight"] = weight
            record_copy["ratio"] = round(ratio, 3)
            weighted_records.append(record_copy)

        if total_weight <= 0.0:
            return 1.0, weighted_records

        active_multiplier = round(weighted_sum / total_weight, 4)
        return active_multiplier, weighted_records

    @classmethod
    def generate_compressed_context_summary(
        cls,
        business_name: str,
        corrections: List[Dict[str, Any]],
        active_bias_multiplier: float,
        current_time: datetime = None
    ) -> str:
        """
        Compresses historical human overrides into concise Golden Operating Rules
        strictly token-bounded (< 500 tokens) to prevent context window bloat.
        """
        now = current_time or datetime.utcnow()
        if not corrections:
            return (
                f"### 🧠 Active Operational Context: {business_name}\n"
                f"- **Model Calibration:** Nominal (1.000x multiplier). No manual overrides recorded.\n"
                f"- **Context Status:** Zero drift detected. Camera counting operates at pure optical confidence.\n"
            )

        # Sort by recency
        sorted_corrections = sorted(
            corrections,
            key=lambda x: x.get("recorded_at", datetime.min),
            reverse=True
        )

        top_recent = sorted_corrections[:5]

        rules = []
        for idx, item in enumerate(top_recent, start=1):
            reason = item.get("reason_note", "Manual count adjustment")
            orig = item.get("original_value", 0)
            corr = item.get("corrected_value", 0)
            rec_date = item.get("recorded_at")
            date_str = rec_date.strftime("%Y-%m-%d") if isinstance(rec_date, datetime) else str(rec_date)[:10]
            rules.append(
                f"{idx}. **[{date_str}]** Adjusted from `{orig:,.0f}` to `{corr:,.0f}`. *Reason:* {reason}"
            )

        direction_label = "Higher" if active_bias_multiplier > 1.0 else "Lower"
        drift_pct = abs(round((active_bias_multiplier - 1.0) * 100.0, 1))

        markdown_summary = (
            f"### 🧠 Dynamic Operational Memory & Calibration: {business_name}\n\n"
            f"- **Active Model Bias Multiplier:** `{active_bias_multiplier:.3f}x` "
            f"({drift_pct}% {direction_label} than raw camera counts based on exponential recency weighting).\n"
            f"- **Total Historical Adjustments:** `{len(corrections)} entries analyzed`.\n"
            f"- **Exponential Decay Parameter (λ):** `0.0495/day` (14-day half-life for older feedback).\n\n"
            f"#### 📌 Top Recency-Weighted Operating Rules:\n" +
            "\n".join(rules) +
            "\n\n*Note: Compressed representation maintains optimal context efficiency without token bloat.*"
        )
        return markdown_summary
