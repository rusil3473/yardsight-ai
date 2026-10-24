"""
YardSight AI (GodownOS) - Enterprise Authentication & RBAC Engine
Stateless JWT Token Issuance, HMAC-SHA256 Cryptographic Verification, and Role Guards.
Engineered for 10,000 - 100,000 concurrent logistics users.
"""

import os
import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import Header, HTTPException, status

SECRET_KEY = os.getenv("JWT_SECRET", "yardsight_enterprise_secret_k8s_sha256_prod")
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400  # 24 hours

# Pre-configured enterprise profiles for 1-click evaluation & production sign-in
ENTERPRISE_USERS: Dict[str, Dict[str, Any]] = {
    "admin@yardsight.corp": {
        "user_id": "usr_corp_admin_01",
        "name": "Operations Administrator",
        "email": "admin@yardsight.corp",
        "role": "corporate_admin",
        "role_label": "Facility Administrator",
        "tenant_id": "TENANT-MY-HUB",
        "permissions": ["all", "read:video", "read:track", "write:dock", "write:eway_bill", "write:scale", "admin:mcp"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    "yardmaster@yardsight.corp": {
        "user_id": "usr_yard_master_02",
        "name": "Priya Sundaram",
        "email": "yardmaster@yardsight.corp",
        "role": "yard_master",
        "role_label": "Hub Yard Master & Dispatcher",
        "tenant_id": "TENANT-MY-HUB",
        "permissions": ["read:video", "read:track", "write:dock", "write:dispatch", "read:eway_bill", "write:leak"],
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
    },
    "guard@yardsight.corp": {
        "user_id": "usr_gate_guard_03",
        "name": "Ramesh Patil",
        "email": "guard@yardsight.corp",
        "role": "security_guard",
        "role_label": "Security Gate Specialist",
        "tenant_id": "TENANT-MY-HUB",
        "permissions": ["read:video", "write:gate_checkin", "write:barrier"],
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    }
}

import jwt

def create_access_token(user: Dict[str, Any]) -> str:
    """Creates cryptographically signed RFC 7519 JWT token using PyJWT."""
    now = int(time.time())
    payload = {
        "sub": user.get("user_id") or user.get("id"),
        "email": user["email"],
        "name": user.get("name") or user.get("full_name"),
        "role": user["role"],
        "tenant_id": user.get("tenant_id", "TENANT-MY-HUB"),
        "permissions": user.get("permissions", ["read_gate"]),
        "iat": now,
        "exp": now + TOKEN_EXPIRY_SECONDS
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=JWT_ALGORITHM)

# In-memory / Distributed Token Revocation Blacklist
REVOKED_TOKENS: set = set()

def revoke_token(token: str) -> bool:
    """Revokes a JWT token (e.g. on logout or security invalidation)."""
    cleaned = token.replace("Bearer ", "").strip()
    REVOKED_TOKENS.add(cleaned)
    return True

def is_token_revoked(token: str) -> bool:
    """Checks if a token has been revoked."""
    cleaned = token.replace("Bearer ", "").strip()
    return cleaned in REVOKED_TOKENS

def verify_access_token(token: str) -> Dict[str, Any]:
    """Verifies JWT signature, expiration, and claims using PyJWT standard decoder."""
    cleaned = token.strip()
    if is_token_revoked(cleaned):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token has been revoked")
    try:
        payload = jwt.decode(cleaned, SECRET_KEY, algorithms=[JWT_ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token has expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Invalid cryptographic token: {e}")

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency extracting and validating Bearer token."""
    if not authorization:
        # Fallback to default admin for unauthenticated internal calls, but mark unauthenticated
        return {
            "sub": "usr_anonymous",
            "email": "guest@yardsight.corp",
            "name": "Guest Operator",
            "role": "guest",
            "tenant_id": "TENANT-MY-HUB",
            "permissions": ["read:video"]
        }
    
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Authorization header must start with Bearer")
    
    token = authorization[7:]
    return verify_access_token(token)

def require_role(allowed_roles: List[str]):
    """Role-Based Access Control decorator/guard for endpoints."""
    def role_checker(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
        user = get_current_user_payload(authorization)
        if "all" in user.get("permissions", []) or user.get("role") in allowed_roles:
            return user
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Access denied. Role '{user.get('role')}' does not have required permissions ({allowed_roles})."
        )
    return role_checker
