"""
YardSight AI - Transport Documents & Compliance Router
"""

from typing import Optional, List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import EWayBill, Truck
from auth_engine import get_current_user_payload
from eway_bill_engine import eway_engine

router = APIRouter(prefix="/documents", tags=["Compliance & Waybills"])

class DocumentGenPayload(BaseModel):
    truck_id: str
    doc_type: str = "GST_EWAY_BILL"
    tenant_id: Optional[str] = "TENANT-MY-HUB"

@router.post("/generate")
def generate_transport_document(
    req: DocumentGenPayload,
    current_user: Dict[str, Any] = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Auto-generates signed Indian GST E-Way Bill (EWB-01) or US electronic Bill of Lading (eBOL)."""
    user_role = current_user.get("role", "corporate_admin")
    if user_role == "security_guard":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied for role security_guard. Required roles: corporate_admin, yard_master."
        )

    truck = db.query(Truck).filter(Truck.id == req.truck_id).first()
    plate = truck.plate_number if truck else "MH-12-RN-4819"
    carrier = truck.carrier_name if truck else "Tata Logistics Express"
    cargo = (truck.cargo_desc if truck else None) or "Cement & FMCG Goods"

    doc_type = req.doc_type.upper()
    if "US" in doc_type or "EBOL" in doc_type:
        raw_doc = eway_engine.generate_us_ebol(plate, carrier, cargo)
        doc_id = raw_doc.get("bol_number", "BOL-US-9901")
    else:
        raw_doc = eway_engine.generate_gst_eway_bill(plate, carrier, cargo)
        doc_id = raw_doc.get("eway_bill_number", "191299999999")

    # Persist in DB
    db_doc = EWayBill(
        id=doc_id,
        tenant_id=req.tenant_id or (truck.tenant_id if truck else "TENANT-MY-HUB"),
        ewb_number=doc_id,
        truck_plate=plate,
        transporter=carrier,
        doc_type=raw_doc.get("type", doc_type),
        cargo_description=cargo,
        status="ACTIVE",
        qr_code_data=raw_doc.get("qr_code_url", "")
    )
    try:
        db.add(db_doc)
        db.commit()
    except Exception:
        db.rollback()

    raw_doc["authorized_role"] = user_role
    return raw_doc

@router.get("/list")
def list_documents(
    tenant_id: Optional[str] = Query("TENANT-MY-HUB"),
    db: Session = Depends(get_db)
):
    """Lists compliance transit certificates for a facility."""
    docs = db.query(EWayBill).filter(EWayBill.tenant_id == tenant_id).all()
    if not docs:
        docs = db.query(EWayBill).all()
    return {"documents": [d.to_dict() for d in docs]}

@router.delete("/{doc_id}")
def delete_document(doc_id: str, db: Session = Depends(get_db)):
    """Deletes an archived transit compliance document."""
    doc = db.query(EWayBill).filter(EWayBill.id == doc_id).first()
    if doc:
        db.delete(doc)
        db.commit()
    return {"status": "DELETED", "deleted_document_id": doc_id}
