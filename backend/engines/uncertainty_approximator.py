"""
YardSight AI - Uncertainty & Production Approximation Engine
Estimates production quantities when camera vision is occluded, blurred, or degraded.
Computes Gaussian confidence intervals and bounded uncertainty estimates (N ± σ).
"""

from typing import Dict, Any, Optional
import math

class UncertaintyApproximator:
    """
    Approximates production output and confidence bounds under optical occlusion or degraded visibility.
    """
    @staticmethod
    def calculate_visual_quality(
        laplacian_variance: float,
        brightness_mean: float,
        occlusion_fraction: float = 0.0
    ) -> Dict[str, Any]:
        """
        Computes composite visual quality score Q in [0.0, 1.0].
        - laplacian_variance: standard metric for image sharpness (blur < 100 is blurry).
        - brightness_mean: 0-255 grayscale mean (too dark < 40 or too bright > 230 degrades).
        - occlusion_fraction: 0.0 (unobstructed) to 1.0 (completely blocked).
        """
        # Sharpness score (100+ is good)
        blur_score = min(1.0, max(0.0, laplacian_variance / 150.0))

        # Lighting score
        if 50.0 <= brightness_mean <= 210.0:
            lighting_score = 1.0
        elif brightness_mean < 50.0:
            lighting_score = max(0.2, brightness_mean / 50.0)
        else:
            lighting_score = max(0.2, (255.0 - brightness_mean) / 45.0)

        # Visibility factor
        visibility_factor = max(0.0, 1.0 - occlusion_fraction)

        # Composite quality Q
        composite_q = round(0.4 * blur_score + 0.3 * lighting_score + 0.3 * visibility_factor, 3)
        is_degraded = composite_q < 0.75

        return {
            "composite_q": composite_q,
            "is_degraded": is_degraded,
            "blur_score": round(blur_score, 2),
            "lighting_score": round(lighting_score, 2),
            "visibility_factor": round(visibility_factor, 2)
        }

    @classmethod
    def estimate_production_with_bounds(
        cls,
        actual_counted: int,
        historical_upm: float,
        degraded_duration_minutes: float,
        visual_quality_q: float = 1.0,
        historical_upm_std_dev: float = 2.5
    ) -> Dict[str, Any]:
        """
        Calculates estimated production and statistical uncertainty bounds.
        N_est = N_counted + (historical_upm * degraded_duration_minutes)
        margin = z * sigma * sqrt(degraded_duration_minutes)
        """
        if visual_quality_q >= 0.85 and degraded_duration_minutes <= 0.0:
            # Clear footage, direct count is 100% reliable
            return {
                "final_count": actual_counted,
                "is_estimated": False,
                "actual_counted": actual_counted,
                "estimated_addition": 0,
                "confidence_pct": 99.5,
                "uncertainty_margin": 0,
                "lower_bound": actual_counted,
                "upper_bound": actual_counted,
                "badge_label": "Direct Camera Count (High Confidence)"
            }

        # Calculate estimated missing count
        expected_addition = int(round(historical_upm * degraded_duration_minutes))
        estimated_total = actual_counted + expected_addition

        # Statistical 95% confidence margin (z = 1.96)
        # Variance scales with duration of occlusion
        z = 1.96
        margin = int(math.ceil(z * historical_upm_std_dev * math.sqrt(max(1.0, degraded_duration_minutes))))

        # If visual quality is poor, widen the margin
        quality_penalty = (1.0 - visual_quality_q) * 1.5
        margin = int(math.ceil(margin * (1.0 + quality_penalty)))

        lower_bound = max(actual_counted, estimated_total - margin)
        upper_bound = estimated_total + margin

        # Confidence percentage drops with degradation duration and lower Q
        confidence = max(60.0, min(98.0, round(100.0 - (margin / max(1, estimated_total) * 100.0), 1)))

        pct_margin = round((margin / max(1, estimated_total)) * 100.0, 1)
        badge_label = f"Estimated ±{pct_margin}% ({degraded_duration_minutes:.1f}m partial occlusion)"

        return {
            "final_count": estimated_total,
            "is_estimated": True,
            "actual_counted": actual_counted,
            "estimated_addition": expected_addition,
            "confidence_pct": confidence,
            "uncertainty_margin": margin,
            "lower_bound": lower_bound,
            "upper_bound": upper_bound,
            "badge_label": badge_label
        }
