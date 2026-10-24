"""
YardSight AI - Universal B2B REST API Router
Exposes standardized endpoints for third-party ERP integration (SAP, Tally, Zoho, NetSuite, Odoo)
and client applications to ingest/retrieve all business, production, energy, and memory telemetry.
Refactored into modular sub-routers in `routers/b2b/`.
"""

from routers.b2b import router

__all__ = ["router"]
