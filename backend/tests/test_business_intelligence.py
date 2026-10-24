"""
YardSight AI - Business Intelligence, Production Line Vision & Energy Analytics Test Suite
Verifies:
1. Virtual Tripwire Centroid Tracking & UPM calculations
2. 7-Segment Energy Meter OCR & SEC Productivity Metrics
3. Statistical Uncertainty Bounds (N ± σ)
4. Autonomous AI Industry Research Engine
5. Recency-Weighted Adaptive Memory & Context Compression
6. Universal B2B REST Endpoints & ERP Interchange
"""

import pytest
from datetime import datetime, date, timedelta
from fastapi.testclient import TestClient

from app import app
from production_line_counter import ProductionLineCounter
from energy_meter_ocr import EnergyMeterAnalyzer
from uncertainty_approximator import UncertaintyApproximator
from business_research_agent import BusinessResearchAgent
from adaptive_memory_engine import AdaptiveMemoryEngine

client = TestClient(app)

# 1. Virtual Tripwire Tracking Tests
def test_production_line_counter_tripwire_crossing():
    # Vertical line at x=300 from y=0 to y=600
    counter = ProductionLineCounter(
        line_id="line_test_01",
        tripwire=((300, 0), (300, 600)),
        direction="LEFT_TO_RIGHT"
    )

    t0 = 1000.0
    # Step 1: Detect object on left side (x=250, y=300)
    c1 = counter.process_frame_centroids([(250, 300)], timestamp=t0)
    assert c1 == 0
    assert counter.total_counted == 0

    # Step 2: Object moves across line to right side (x=350, y=300)
    c2 = counter.process_frame_centroids([(350, 300)], timestamp=t0 + 0.1)
    assert c2 == 1
    assert counter.total_counted == 1

def test_production_moving_averages():
    sample_logs = [
        {"log_date": f"2026-09-{i:02d}", "actual_units_counted": 1000 + i * 10}
        for i in range(1, 15)
    ]
    res = ProductionLineCounter.calculate_historical_moving_averages(sample_logs)
    assert res["total_recorded_days"] == 14
    assert res["7_day_avg"] > 0
    assert res["30_day_avg"] > 0

# 2. Energy Meter OCR & Efficiency Tests
def test_energy_meter_ocr_parsing():
    assert EnergyMeterAnalyzer.parse_meter_ocr_digits("  O124.5 KWH ") == 124.5
    assert EnergyMeterAnalyzer.parse_meter_ocr_digits("5208") == 5208.0
    assert EnergyMeterAnalyzer.parse_meter_ocr_digits("") is None

def test_energy_efficiency_and_anomaly_detection():
    analyzer = EnergyMeterAnalyzer(tariff_rate_per_kwh=8.50, benchmark_sec=0.20)
    
    # Normal operation: 50 kWh consumed for 250 units -> SEC = 0.20 kWh/unit
    res = analyzer.compute_efficiency_window(prev_kwh=100.0, current_kwh=150.0, units_produced=250)
    assert res["delta_kwh"] == 50.0
    assert res["units_per_kwh"] == 5.0
    assert res["kwh_per_unit"] == 0.20
    assert res["is_anomaly"] is False

    # Anomaly: Motor degradation (SEC spikes to 0.35 kWh/unit, +75% over benchmark)
    res_spike = analyzer.compute_efficiency_window(prev_kwh=100.0, current_kwh=135.0, units_produced=100)
    assert res_spike["is_anomaly"] is True
    assert "Mechanical Friction Alert" in res_spike["anomaly_details"]

# 3. Uncertainty Approximator Tests
def test_uncertainty_approximation_occluded():
    # 15 minutes of occlusion, camera blur
    res = UncertaintyApproximator.estimate_production_with_bounds(
        actual_counted=800,
        historical_upm=10.0,
        degraded_duration_minutes=15.0,
        visual_quality_q=0.60
    )
    assert res["is_estimated"] is True
    assert res["estimated_addition"] == 150
    assert res["final_count"] == 950
    assert res["confidence_pct"] < 99.0
    assert res["lower_bound"] < 950 < res["upper_bound"]

# 4. Autonomous AI Research Agent Tests
def test_business_research_agent():
    research = BusinessResearchAgent.research_business_profile(
        company_name="Apex Moldings Ltd",
        industry_sector="Plastic Injection Molding",
        primary_products="Automotive Dash Trim",
        daily_capacity_target=4000.0,
        electricity_tariff_per_kwh=8.50,
        currency="INR"
    )
    assert research["benchmark_sec_kwh_per_unit"] > 0.5
    assert "Apex Moldings Ltd" in research["ai_research_summary"]
    assert "Plastic Injection Molding" in research["ai_research_summary"]

# 5. Recency-Weighted Adaptive Memory Tests
def test_adaptive_memory_exponential_decay():
    now = datetime(2026, 9, 25, 12, 0, 0)
    # Today's adjustment: weight ~1.0
    w_today = AdaptiveMemoryEngine.compute_recency_weight(now, now)
    assert w_today == 1.0

    # 14 days ago adjustment: weight ~0.50 (half-life)
    w_14d = AdaptiveMemoryEngine.compute_recency_weight(now - timedelta(days=14), now)
    assert 0.48 <= w_14d <= 0.52

    # Multiple corrections: newer correction carries higher weight
    corrections = [
        {"original_value": 1000.0, "corrected_value": 1100.0, "recorded_at": now},  # ratio 1.10, weight 1.0
        {"original_value": 1000.0, "corrected_value": 900.0, "recorded_at": now - timedelta(days=28)}  # ratio 0.90, weight ~0.25
    ]
    bias, _ = AdaptiveMemoryEngine.calculate_active_bias_multiplier(corrections, now)
    assert bias > 1.0  # Recent upward adjustment dominates

# 6. End-to-End Universal B2B API Tests
def test_e2e_b2b_api_workflow():
    headers = {"X-Tenant-Id": "TENANT-AMZN-BLR1"}

    # Step A: Register / Update Business Profile
    biz_resp = client.post("/api/v1/business/profile", json={
        "company_name": "Godrej Interio Hub",
        "industry_sector": "Corrugated Packaging",
        "primary_products": "Heavy Duty Packaging Cartons",
        "daily_capacity_target": 6000.0,
        "electricity_tariff_per_kwh": 7.80,
        "currency": "INR"
    }, headers=headers)
    assert biz_resp.status_code == 200
    biz_data = biz_resp.json()
    assert biz_data["status"] == "SUCCESS"
    assert biz_data["data"]["company_name"] == "Godrej Interio Hub"

    # Step B: Register Production Line
    line_resp = client.post("/api/v1/production/lines", json={
        "line_name": "Corrugator Line Alpha",
        "camera_id": "cam_corrugator_01",
        "tripwire_x1": 150,
        "tripwire_y1": 250,
        "tripwire_x2": 450,
        "tripwire_y2": 250,
        "direction": "LEFT_TO_RIGHT"
    }, headers=headers)
    assert line_resp.status_code == 200
    line_id = line_resp.json()["data"]["id"]

    # Step C: Ingest Production Log
    log_resp = client.post("/api/v1/production/logs", json={
        "line_id": line_id,
        "log_date": "2026-09-25",
        "shift_name": "SHIFT_MORNING",
        "actual_units_counted": 2800,
        "degraded_minutes": 10.0,
        "visual_quality_q": 0.70
    }, headers=headers)
    assert log_resp.status_code == 200
    log_id = log_resp.json()["data"]["id"]

    # Step D: Owner Correction / Override
    override_resp = client.post("/api/v1/production/override", json={
        "log_id": log_id,
        "corrected_units": 3100,
        "reason": "Off-line secondary packaging table added 300 units"
    }, headers=headers)
    assert override_resp.status_code == 200
    assert override_resp.json()["status"] == "SUCCESS"

    # Step E: Ingest Energy Meter Reading & Check Efficiency
    energy_resp = client.post("/api/v1/energy/reading", json={
        "cumulative_kwh": 1420.5,
        "units_produced_in_window": 3100
    }, headers=headers)
    assert energy_resp.status_code == 200
    eff_data = energy_resp.json()["reading"]
    assert eff_data["units_per_kwh"] > 0

    # Step F: Export for ERP (SAP / Tally / Zoho)
    erp_resp = client.get("/api/v1/export/erp?format_type=json", headers=headers)
    assert erp_resp.status_code == 200
    assert "production_tallies" in erp_resp.json()["data"]

    tally_resp = client.get("/api/v1/export/erp?format_type=tally_xml", headers=headers)
    assert tally_resp.status_code == 200
    assert "<TALLYREQUEST>" in tally_resp.json()["xml"]
