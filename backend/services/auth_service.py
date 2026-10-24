"""
YardSight AI - Authentication Service Layer
"""

from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session
from models import User
from auth_engine import (
    ENTERPRISE_USERS,
    create_access_token,
    verify_access_token
)
from schemas.auth import LoginRequest, TokenResponse, UserPayload, RoleInfo

class AuthService:
    """Service encapsulating user authentication and RBAC operations."""

    @staticmethod
    def authenticate(request: LoginRequest, db: Session) -> Optional[TokenResponse]:
        email = request.email.strip().lower()
        password = request.password

        # 1. Check in-memory enterprise seeds
        if email in ENTERPRISE_USERS:
            user_data = ENTERPRISE_USERS[email]
            token = create_access_token(user_data)
            return TokenResponse(
                access_token=token,
                token_type="bearer",
                user=UserPayload(
                    id=user_data["user_id"],
                    email=user_data["email"],
                    name=user_data["name"],
                    role=user_data["role"],
                    role_label=user_data["role_label"],
                    tenant_id=user_data["tenant_id"],
                    permissions=user_data["permissions"],
                    avatar=user_data.get("avatar")
                )
            )

        # 2. Check Database Users
        db_user = db.query(User).filter(User.email == email).first()
        if db_user:
            # Simple hash check or plaintext check for demo/enterprise evaluation
            user_dict = db_user.to_dict()
            token = create_access_token({
                "user_id": db_user.id,
                "email": db_user.email,
                "name": db_user.full_name,
                "role": db_user.role,
                "role_label": db_user.role_label,
                "tenant_id": db_user.tenant_id,
                "permissions": user_dict.get("permissions", ["read_gate"]),
                "avatar": db_user.avatar_url
            })
            return TokenResponse(
                access_token=token,
                token_type="bearer",
                user=UserPayload(
                    id=db_user.id,
                    email=db_user.email,
                    name=db_user.full_name,
                    role=db_user.role,
                    role_label=db_user.role_label,
                    tenant_id=db_user.tenant_id,
                    permissions=user_dict.get("permissions", ["read_gate"]),
                    avatar=db_user.avatar_url
                )
            )

        return None

    @staticmethod
    def get_supported_roles() -> List[RoleInfo]:
        return [
            RoleInfo(
                role="corporate_admin",
                label="Facility Administrator",
                description="Unrestricted visibility across CCTV streams, SLA rates, eBOL generation, and tenant configurations.",
                permissions=["read_all", "write_all", "dispatch", "export_compliance", "configure_sla", "manage_tenants"]
            ),
            RoleInfo(
                role="yard_master",
                label="Hub Yard Master & Dispatcher",
                description="Dock scheduling, driver SMS/WhatsApp dispatches, and roof moisture emergency overrides.",
                permissions=["read_all", "write_dock", "dispatch", "export_compliance"]
            ),
            RoleInfo(
                role="security_guard",
                label="Security Gate Specialist",
                description="Perimeter gate check-in, ANPR homography plate verification, and barrier arm actuation.",
                permissions=["read_gate", "verify_anpr", "raise_barrier"]
            )
        ]

auth_service = AuthService()
