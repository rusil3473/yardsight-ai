"""
YardSight AI - Autonomous Business & Industry Research Agent
Researches standard industrial manufacturing benchmarks, Specific Energy Consumption (SEC),
standard cycle times, and operational targets based on business profile inputs.
"""

from typing import Dict, Any
import datetime

# Industrial Domain Benchmarks Knowledge Base
INDUSTRY_BENCHMARKS = {
    "PLASTIC_INJECTION_MOLDING": {
        "sector_label": "Plastic Injection Molding & Extrusion",
        "benchmark_sec": 1.15,  # kWh per kg or 0.18 per piece
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 4.5,
        "standard_loss_allowance_pct": 3.5,
        "maintenance_interval_hours": 350,
        "research_notes": (
            "Standard Specific Energy Consumption (SEC) in injection molding ranges between 0.90 - 1.40 kWh/kg. "
            "Hydraulic clamping systems consume ~60% of total electrical load, while modern servo-electric presses drop SEC to 0.70 kWh/kg. "
            "Primary thermal efficiency depends on barrel insulation jackets and chiller loop delta-T stability."
        )
    },
    "CORRUGATED_PACKAGING": {
        "sector_label": "Corrugated Box & Carton Packaging",
        "benchmark_sec": 0.09,
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 1.2,
        "standard_loss_allowance_pct": 2.0,
        "maintenance_interval_hours": 500,
        "research_notes": (
            "Corrugated packaging facilities operate high-throughput rotary die-cutters and flexo-folder-gluers. "
            "Industry standard electrical intensity is 0.07 - 0.14 kWh per completed cardboard unit. "
            "Steam boilers account for corrugator thermal load, while main electrical power is dominated by paper reel feed vacuum pumps."
        )
    },
    "METAL_FASTENERS": {
        "sector_label": "Cold Forged Fasteners & Hardware",
        "benchmark_sec": 0.38,
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 0.8,
        "standard_loss_allowance_pct": 1.5,
        "maintenance_interval_hours": 250,
        "research_notes": (
            "Cold heading and thread rolling machines typically require 0.30 - 0.55 kWh/kg of finished steel fasteners. "
            "Conveyor tripwire counting monitors batch discharge chutes. "
            "Sudden SEC spikes usually indicate die wear, lack of lubricant flood, or excessive mechanical friction in the flywheel crank."
        )
    },
    "FOOD_BEVERAGE_BOTTLING": {
        "sector_label": "Food & Beverage Bottling / Liquid Filling",
        "benchmark_sec": 0.04,
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 0.3,
        "standard_loss_allowance_pct": 1.0,
        "maintenance_interval_hours": 200,
        "research_notes": (
            "High-speed rotary beverage bottling lines achieve up to 300 - 600 bottles/minute with an electrical intensity of 0.03 - 0.06 kWh per bottle. "
            "Blow-molding compressors and CIP (Clean-in-Place) sanitization motors are primary energy consumers."
        )
    },
    "ELECTRONICS_ASSEMBLY": {
        "sector_label": "Electronics SMT & Board Assembly",
        "benchmark_sec": 0.55,
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 12.0,
        "standard_loss_allowance_pct": 0.8,
        "maintenance_interval_hours": 600,
        "research_notes": (
            "SMT pick-and-place lines followed by reflow soldering ovens consume 0.40 - 0.75 kWh per assembled PCBA unit. "
            "Reflow ovens represent >65% of the thermal and electrical load."
        )
    },
    "TEXTILE_WEAVING": {
        "sector_label": "Textiles, Garment Stitching & Weaving",
        "benchmark_sec": 0.45,
        "sec_unit": "kWh/unit",
        "rated_cycle_seconds": 25.0,
        "standard_loss_allowance_pct": 4.0,
        "maintenance_interval_hours": 400,
        "research_notes": (
            "Weaving air-jet looms and industrial sewing tracks consume an average of 0.35 - 0.60 kWh per finished textile unit. "
            "Compressed air supply for air-jet looms accounts for up to 50% of plant electricity."
        )
    }
}

class BusinessResearchAgent:
    """
    Autonomous agent synthesizing domain operational standards for any manufacturing business.
    """
    @classmethod
    def research_business_profile(
        cls,
        company_name: str,
        industry_sector: str,
        primary_products: str,
        daily_capacity_target: float,
        electricity_tariff_per_kwh: float = 8.50,
        currency: str = "INR"
    ) -> Dict[str, Any]:
        """
        Executes autonomous research and derives operational benchmarks.
        """
        # Normalize industry key
        normalized_key = industry_sector.strip().upper().replace(" ", "_").replace("-", "_")

        matched_data = None
        for key, benchmark in INDUSTRY_BENCHMARKS.items():
            if key in normalized_key or normalized_key in key or any(word in normalized_key for word in key.split("_")):
                matched_data = benchmark
                break

        if not matched_data:
            # General precision manufacturing default
            matched_data = {
                "sector_label": industry_sector,
                "benchmark_sec": 0.25,
                "sec_unit": "kWh/unit",
                "rated_cycle_seconds": 4.0,
                "standard_loss_allowance_pct": 2.5,
                "maintenance_interval_hours": 300,
                "research_notes": (
                    f"General precision manufacturing operational profile for {industry_sector}. "
                    "Empirical SEC averages 0.20 - 0.35 kWh/unit across medium assembly conveyors. "
                    "Continuous tripwire optical tracking establishes real-time plant baseline."
                )
            }

        benchmark_sec = matched_data["benchmark_sec"]
        rated_cycle_seconds = matched_data["rated_cycle_seconds"]

        # Calculate estimated daily metrics
        hours_per_day = 16.0  # Two 8-hour shifts typical
        theoretical_capacity = (hours_per_day * 3600.0) / max(0.5, rated_cycle_seconds)
        estimated_daily_kwh = daily_capacity_target * benchmark_sec
        estimated_daily_energy_cost = estimated_daily_kwh * electricity_tariff_per_kwh

        curr_symbol = "₹" if currency.upper() == "INR" else "$"

        # Generate structured AI research synthesis
        summary_markdown = (
            f"### 🏭 Autonomous Industrial Intelligence Report: {company_name}\n\n"
            f"**Industry Sector:** {matched_data['sector_label']}  \n"
            f"**Analyzed Products:** {primary_products}  \n"
            f"**Research Date:** {datetime.datetime.utcnow().strftime('%B %d, %Y')}  \n\n"
            f"#### 1. Baseline Specific Energy Consumption (SEC)\n"
            f"- **Industry Standard SEC:** `{benchmark_sec} {matched_data['sec_unit']}`  \n"
            f"- **Target Daily Output:** `{daily_capacity_target:,.0f} units/day`  \n"
            f"- **Projected Daily Energy Draw:** `{estimated_daily_kwh:,.1f} kWh`  \n"
            f"- **Estimated Energy Expenditure:** `{curr_symbol}{estimated_daily_energy_cost:,.2f} / day` (at {curr_symbol}{electricity_tariff_per_kwh:.2f}/kWh)  \n\n"
            f"#### 2. Throughput & Cycle Time Benchmarking\n"
            f"- **Rated Nominal Cycle Time:** `{rated_cycle_seconds} seconds/unit` (~{int(60 / rated_cycle_seconds)} UPM)  \n"
            f"- **Normal Loss Allowance:** `{matched_data['standard_loss_allowance_pct']}%` for conveyor transfer and packaging  \n"
            f"- **Maximum Theoretical 2-Shift Yield:** `{int(theoretical_capacity):,} units/day`  \n\n"
            f"#### 3. Operational Research Insights\n"
            f"{matched_data['research_notes']}\n\n"
            f"#### 4. Automated Anomaly Warning Thresholds\n"
            f"- **Warning Alert:** SEC > `{round(benchmark_sec * 1.15, 3)} kWh/unit` (+15% above normal)\n"
            f"- **Critical Alert:** SEC > `{round(benchmark_sec * 1.25, 3)} kWh/unit` (+25% indicates motor mechanical wear or belt slippage)\n"
        )

        return {
            "company_name": company_name,
            "industry_sector": industry_sector,
            "primary_products": primary_products,
            "benchmark_sec_kwh_per_unit": benchmark_sec,
            "rated_cycle_seconds": rated_cycle_seconds,
            "estimated_daily_energy_cost": round(estimated_daily_energy_cost, 2),
            "ai_research_summary": summary_markdown
        }
