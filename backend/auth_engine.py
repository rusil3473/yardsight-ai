"""
YardSight AI (GodownOS) - Enterprise Authentication & RBAC Engine
Stateless JWT Token Issuance, HMAC-SHA256 Cryptographic Verification, and Role Guards.
Engineered for 10,000 - 100,000 concurrent logistics users.
"""

import hmac
import hashlib
import base64
import json
import time
from typing import Dict, Any, List, Optional
from fastapi import Header, HTTPException, status

SECRET_KEY = "yardsight_enterprise_secret_k8s_sha256_prod"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRY_SECONDS = 86400  # 24 hours

# Pre-configured enterprise profiles for 1-click evaluation & production sign-in
ENTERPRISE_USERS: Dict[str, Dict[str, Any]] = {
    "admin@yardsight.corp": {
        "user_id": "usr_corp_admin_01",
        "name": "Vikramaditya Singhania",
        "email": "admin@yardsight.corp",
        "role": "corporate_admin",
        "role_label": "Corporate Operations VP & Admin",
        "tenant_id": "TENANT-AMZN-BLR1",
        "permissions": ["all", "read:video", "read:track", "write:dock", "write:eway_bill", "write:scale", "admin:mcp"],
        "avatar": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80"
    },
    "yardmaster@yardsight.corp": {
        "user_id": "usr_yard_master_02",
        "name": "Priya Sundaram",
        "email": "yardmaster@yardsight.corp",
        "role": "yard_master",
        "role_label": "Hub Yard Master & Dispatcher",
        "tenant_id": "TENANT-AMZN-BLR1",
        "permissions": ["read:video", "read:track", "write:dock", "write:dispatch", "read:eway_bill", "write:leak"],
        "avatar": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=80"
    },
    "guard@yardsight.corp": {
        "user_id": "usr_gate_guard_03",
        "name": "Ramesh Patil",
        "email": "guard@yardsight.corp",
        "role": "security_guard",
        "role_label": "Security Gate Specialist",
        "tenant_id": "TENANT-AMZN-BLR1",
        "permissions": ["read:video", "write:gate_checkin", "write:barrier"],
        "avatar": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80"
    }
}

def _b64_encode(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).decode('utf-8').rstrip('=')

def _b64_decode(data: str) -> bytes:
    padding = '=' * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)

def create_access_token(user: Dict[str, Any]) -> str:
    """Creates cryptographically signed JWT token."""
    header = {"alg": JWT_ALGORITHM, "typ": "JWT"}
    payload = {
        "sub": user["user_id"],
        "email": user["email"],
        "name": user["name"],
        "role": user["role"],
        "tenant_id": user.get("tenant_id", "TENANT-AMZN-BLR1"),
        "permissions": user["permissions"],
        "iat": int(time.time()),
        "exp": int(time.time()) + TOKEN_EXPIRY_SECONDS
    }
    
    encoded_header = _b64_encode(json.dumps(header).encode('utf-8'))
    encoded_payload = _b64_encode(json.dumps(payload).encode('utf-8'))
    signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
    
    signature = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
    encoded_signature = _b64_encode(signature)
    
    return f"{encoded_header}.{encoded_payload}.{encoded_signature}"

def verify_access_token(token: str) -> Dict[str, Any]:
    """Verifies JWT signature, expiration, and returns decoded payload."""
    try:
        parts = token.strip().split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid JWT token structure")
        
        encoded_header, encoded_payload, claimed_signature = parts
        signing_input = f"{encoded_header}.{encoded_payload}".encode('utf-8')
        
        expected_sig = hmac.new(SECRET_KEY.encode('utf-8'), signing_input, hashlib.sha256).digest()
        expected_sig_b64 = _b64_encode(expected_sig)
        
        if not hmac.compare_digest(claimed_signature, expected_sig_b64):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid cryptographic signature")
            
        payload = json.loads(_b64_decode(encoded_payload).decode('utf-8'))
        
        if payload.get("exp", 0) < int(time.time()):
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="JWT token has expired")
            
        return payload
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail=f"Authentication failure: {str(e)}")

def get_current_user_payload(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    """FastAPI dependency extracting and validating Bearer token."""
    if not authorization:
        # Fallback to default admin for unauthenticated internal calls, but mark unauthenticated
        return {
            "sub": "usr_anonymous",
            "email": "guest@yardsight.corp",
            "name": "Guest Operator",
            "role": "guest",
            "tenant_id": "TENANT-AMZN-BLR1",
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
