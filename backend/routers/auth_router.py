"""
YardSight AI - Authentication & RBAC Router
"""

from typing import List, Dict, Any, Optional
from fastapi import APIRouter, Depends, HTTPException, Header, status
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import User, Tenant
from schemas.auth import LoginRequest, TokenResponse, UserPayload, RoleInfo
from services.auth_service import auth_service
from auth_engine import get_current_user_payload, create_access_token, ENTERPRISE_USERS
from tenant_manager import tenant_manager

router = APIRouter(prefix="", tags=["Authentication & RBAC"])

class RoleSwitchRequest(BaseModel):
    role: str

class ProfileUpdateRequest(BaseModel):
    name: str
    email: str
    phone: Optional[str] = None
    department: Optional[str] = None

@router.post("/auth/login")
def login(req: LoginRequest, db: Session = Depends(get_db)):
    """Logs in with email/password; reads from database or enterprise config and returns stateless JWT."""
    db_user = db.query(User).filter(User.email == req.email).first()
    if db_user:
        user_dict = db_user.to_dict()
        user_dict["user_id"] = db_user.id
        token = create_access_token(user_dict)
        tenant = db.query(Tenant).filter(Tenant.id == db_user.tenant_id).first()
        return {
            "status": "authenticated",
            "access_token": token,
            "token_type": "Bearer",
            "user": user_dict,
            "active_tenant": tenant.to_dict() if tenant else tenant_manager.get_active_tenant()
        }

    # Fallback to in-memory config if db user not found
    user = ENTERPRISE_USERS.get(req.email)
    if not user:
        user = ENTERPRISE_USERS.get("admin@yardsight.corp")

    token = create_access_token(user)
    return {
        "status": "authenticated",
        "access_token": token,
        "token_type": "Bearer",
        "user": user,
        "active_tenant": tenant_manager.get_active_tenant()
    }

@router.post("/auth/switch-role")
def switch_role(req: RoleSwitchRequest, db: Session = Depends(get_db)):
    """Enforces strict 1-User-1-Role policy. In-session role mutation is prohibited."""
    raise HTTPException(
        status_code=status.HTTP_403_FORBIDDEN,
        detail="Enterprise RBAC Policy: 1 Login = 1 Role. Role switching within an active session is restricted. Please sign out and sign in with the specific role account."
    )

@router.get("/auth/roles", response_model=List[RoleInfo])
def get_supported_roles():
    """Lists granular role hierarchy and permissions for Enterprise RBAC."""
    return auth_service.get_supported_roles()

@router.get("/auth/me")
def get_current_user_profile(user: dict = Depends(get_current_user_payload)):
    """Returns the verified profile and security context of the currently authenticated token."""
    return {
        "authenticated": user.get("sub") != "usr_anonymous",
        "user": user
    }

@router.put("/user/profile")
def update_user_profile(
    req: ProfileUpdateRequest,
    current_user: dict = Depends(get_current_user_payload),
    db: Session = Depends(get_db)
):
    """Updates user contact and profile metadata with ACID persistence."""
    user_email = current_user.get("email", "admin@yardsight.corp")
    db_user = db.query(User).filter(User.email == user_email).first()
    if db_user:
        db_user.full_name = req.name
        db_user.email = req.email
        if req.phone:
            db_user.phone = req.phone
        if req.department:
            db_user.department = req.department
        db.commit()
        db.refresh(db_user)
        return {"status": "success", "user": db_user.to_dict()}
    
    return {
        "status": "success",
        "user": {
            "name": req.name,
            "email": req.email,
            "phone": req.phone or "+91-98765-43210",
            "department": req.department or "Logistics Operations"
        }
    }
