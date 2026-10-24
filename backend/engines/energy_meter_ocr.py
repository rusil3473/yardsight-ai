"""
YardSight AI - Energy Meter OCR & Production Efficiency Analytics Engine
Reads industrial 7-segment / digital kWh meters and computes real-time energy productivity:
- Units per kWh (Energy Productivity)
- kWh per Unit (Specific Energy Consumption - SEC)
- Energy Cost Per Unit
- Mechanical Degradation & Anomaly Detection (Motor bearing wear, idle belt loss)
"""

from typing import Dict, Any, Optional, Tuple, List
import re
from datetime import datetime

class EnergyMeterAnalyzer:
    """
    Computes energy efficiency metrics and detects mechanical degradation from meter readings.
    """
    def __init__(self, tariff_rate_per_kwh: float = 8.50, benchmark_sec: float = 0.25):
        self.tariff_rate = tariff_rate_per_kwh
        self.benchmark_sec = benchmark_sec  # Baseline kWh per unit

    @staticmethod
    def parse_meter_ocr_digits(ocr_raw_text: str) -> Optional[float]:
        """
        Cleans and extracts cumulative kWh value from OCR string (7-segment display or LCD).
        Handles common OCR artifacts (e.g., 'O' -> '0', 'I' -> '1', 'S' -> '5').
        """
        if not ocr_raw_text:
            return None

        cleaned = ocr_raw_text.strip().upper()
        # Common 7-segment OCR character replacements
        replacements = {'O': '0', 'D': '0', 'I': '1', 'L': '1', 'Z': '2', 'S': '5', 'B': '8'}
        for char, repl in replacements.items():
            cleaned = cleaned.replace(char, repl)

        # Match numbers with optional decimal point
        match = re.search(r"(\d+(\.\d+)?)", cleaned)
        if match:
            try:
                return float(match.group(1))
            except ValueError:
                return None
        return None

    def compute_efficiency_window(
        self,
        prev_kwh: float,
        current_kwh: float,
        units_produced: int,
        interval_minutes: float = 60.0
    ) -> Dict[str, Any]:
        """
        Calculates production energy efficiency metrics over an observation window.
        """
        delta_kwh = max(0.0, current_kwh - prev_kwh)
        cost_in_window = round(delta_kwh * self.tariff_rate, 2)

        # Units per kWh
        if delta_kwh > 0.0001:
            units_per_kwh = round(units_produced / delta_kwh, 2)
            kwh_per_unit = round(delta_kwh / max(1, units_produced), 4)
        else:
            units_per_kwh = 0.0
            kwh_per_unit = 0.0

        cost_per_unit = round(kwh_per_unit * self.tariff_rate, 3)

        # Mechanical Anomaly & Degradation Analysis
        is_anomaly = False
        anomaly_details = ""
        severity = "NORMAL"

        if units_produced == 0 and delta_kwh > 1.0:
            # Idling power drain
            is_anomaly = True
            severity = "WARNING"
            anomaly_details = f"Idle Energy Drain: {delta_kwh:.2f} kWh consumed with 0 conveyor units produced."
        elif units_produced > 0 and self.benchmark_sec > 0:
            # Check if SEC exceeded benchmark by more than 15%
            sec_deviation_pct = ((kwh_per_unit - self.benchmark_sec) / self.benchmark_sec) * 100.0
            if sec_deviation_pct > 25.0:
                is_anomaly = True
                severity = "CRITICAL"
                anomaly_details = f"Mechanical Friction Alert: SEC is {sec_deviation_pct:.1f}% above baseline ({kwh_per_unit} vs {self.benchmark_sec} kWh/unit). Check conveyor motor bearings & tension."
            elif sec_deviation_pct > 15.0:
                is_anomaly = True
                severity = "WARNING"
                anomaly_details = f"Elevated Energy Consumption: SEC is {sec_deviation_pct:.1f}% above standard benchmark."

        return {
            "cumulative_kwh": current_kwh,
            "delta_kwh": round(delta_kwh, 3),
            "units_produced": units_produced,
            "units_per_kwh": units_per_kwh,
            "kwh_per_unit": kwh_per_unit,
            "cost_in_window": cost_in_window,
            "cost_per_unit": cost_per_unit,
            "benchmark_sec": self.benchmark_sec,
            "is_anomaly": is_anomaly,
            "severity": severity,
            "anomaly_details": anomaly_details
        }
