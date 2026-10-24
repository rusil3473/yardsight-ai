"""
Unit Test: Nimbus Multimodal AI Business Intelligence Engine
Validates:
1. Context summary generation with live ANPR vehicles and briquette metrics.
2. Natural language query synthesis for trucks, briquettes, safety, and general overview.
3. License plate ingestion into memory bank.
"""

from services.nimbus_agent import NimbusBusinessEngine

def test_nimbus_context_structure():
    engine = NimbusBusinessEngine()
    summary = engine.get_context_summary()

    assert "vehicles" in summary
    assert "production" in summary
    assert "yard" in summary
    assert len(summary["vehicles"]) >= 3
    assert summary["production"]["units_per_minute"] > 0
    assert "debris_filter_status" in summary["production"]

def test_nimbus_plate_ingestion():
    engine = NimbusBusinessEngine()
    initial_count = len(engine.vehicle_records)
    engine.ingest_anpr_plate(
        plate="DL 01 AB 9021",
        carrier="Delhi Cold Carrier",
        gate="Gate 01 Inbound",
        direction="INBOUND",
        cargo="Reefer Produce"
    )

    assert len(engine.vehicle_records) == initial_count + 1
    assert engine.vehicle_records[0]["plate"] == "DL 01 AB 9021"

def test_nimbus_query_reasoning():
    engine = NimbusBusinessEngine()

    # Query 1: License plates
    res1 = engine.answer_query("Which trucks and plates arrived today?")
    assert "MH 12 RN 4589" in res1["content"] or "ANPR" in res1["content"]
    assert res1["confidence"] >= 0.90

    # Query 2: Briquettes & Debris
    res2 = engine.answer_query("What is the briquette output and debris suppression status?")
    assert "Briquette" in res2["content"]
    assert "Debris" in res2["content"] or "Filter" in res2["content"]

    # Query 3: Worker safety
    res3 = engine.answer_query("Check active worker count and safety violations")
    assert "Safety" in res3["content"]
