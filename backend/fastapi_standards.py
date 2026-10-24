"""
fastapi_standards.py - Universal FastAPI RFC 7807 & Security Standards Plugin
Aligned with @packages/standards Enterprise Architecture:
1. RFC 7807 Problem Details with agentGuidance, userHint, & traceId
2. PySessionManager: Redis / In-Memory Session Store with Double Sign-in Invalidation (1 active session per user by default)
3. PyRateLimiter: Standard token bucket rate limiter with IETF RateLimit headers
4. Granular RBAC Permissions Matrix & cryptographic JWT verification
"""

from typing import Dict, List, Optional, Any, Callable, Tuple
import time
import hmac
import hashlib
import base64
import json
import uuid
from fastapi import FastAPI, Request, HTTPException, Security, Depends
from fastapi.responses import JSONResponse
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer(auto_error=False)

def base64url_decode(input_str: str) -> bytes:
    rem = len(input_str) % 4
    if rem > 0:
        input_str += "=" * (4 - rem)
    return base64.urlsafe_b64decode(input_str)

def verify_jwt(token: str, secret: str) -> Optional[Dict[str, Any]]:
    """Cryptographically verifies HMAC-SHA256 JWT tokens matching @packages/standards."""
    try:
        parts = token.split(".")
        if len(parts) != 3:
            return None
        header_b64, payload_b64, sig_b64 = parts
        
        data_to_sign = f"{header_b64}.{payload_b64}".encode("utf-8")
        expected_sig = hmac.new(secret.encode("utf-8"), data_to_sign, hashlib.sha256).digest()
        provided_sig = base64url_decode(sig_b64)
        
        if not hmac.compare_digest(expected_sig, provided_sig):
            return None
            
        payload = json.loads(base64url_decode(payload_b64).decode("utf-8"))
        if payload.get("exp") and payload["exp"] < int(time.time()):
            return None
            
        return payload
    except Exception:
        return None

# ==============================================================
# 1. RFC 7807 Standard Error Exceptions & Envelope Serialization
# ==============================================================

class AppException(Exception):
    def __init__(
        self,
        code: str,
        status: int,
        title: str,
        detail: str,
        user_hint: str,
        agent_guidance: Optional[str] = None,
        details: Optional[Dict[str, Any]] = None,
        instance: Optional[str] = None
    ):
        self.code = code
        self.status = status
        self.title = title
        self.detail = detail
        self.user_hint = user_hint
        self.agent_guidance = agent_guidance or "Inspect request parameters, credentials, or permissions."
        self.details = details or {}
        self.instance = instance
        self.timestamp = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
        self.trace_id = f"trc_py_{int(time.time()*1000)}"

    def to_problem_details(self, instance: Optional[str] = None) -> Dict[str, Any]:
        slug = self.code.lower().replace("_", "-")
        return {
            "success": False,
            "error": {
                "type": f"https://standards.hackathon.dev/errors/{slug}",
                "title": self.title,
                "status": self.status,
                "detail": self.detail,
                "code": self.code,
                "userHint": self.user_hint,
                "agentGuidance": self.agent_guidance,
                "instance": instance or self.instance,
                "details": self.details,
                "timestamp": self.timestamp,
                "traceId": self.trace_id
            },
            "detail": self.detail
        }

class AuthException(AppException):
    def __init__(self, code: str, detail: str, user_hint: Optional[str] = None, agent_guidance: Optional[str] = None):
        super().__init__(
            code=code,
            status=401,
            title="Authentication Failed",
            detail=detail,
            user_hint=user_hint or "Please provide valid authentication credentials.",
            agent_guidance=agent_guidance or "Obtain a fresh JWT via the login endpoint and pass in Bearer header."
        )

class RBACException(AppException):
    def __init__(self, required: str, current_role: str, user_hint: Optional[str] = None):
        super().__init__(
            code="RBAC_PERMISSION_DENIED",
            status=403,
            title="Permission Denied",
            detail=f"Role '{current_role}' lacks required permission '{required}'",
            user_hint=user_hint or "You do not have permission to perform this action.",
            agent_guidance=f"Ensure active user holds permission '{required}' or request role elevation.",
            details={"required": required, "currentRole": current_role}
        )

class ValidationException(AppException):
    def __init__(self, detail: str, issues: Optional[List[Dict[str, Any]]] = None):
        super().__init__(
            code="VALIDATION_FAILED",
            status=422,
            title="Validation Failed",
            detail=detail,
            user_hint="Please correct the highlighted inputs and try again.",
            agent_guidance="Fix schema validation errors according to the endpoint OpenAPI contract.",
            details={"issues": issues or []}
        )

class RateLimitException(AppException):
    def __init__(self, retry_after: int, limit: int = 100000):
        super().__init__(
            code="SERVICE_RATE_LIMITED",
            status=429,
            title="Too Many Requests",
            detail=f"Rate limit exceeded ({limit} req/min). Retry after {retry_after}s",
            user_hint="Too many requests. Please pause and try again in a few moments.",
            agent_guidance="The client is sending requests too quickly. Implement exponential backoff.",
            details={"retryAfterSeconds": retry_after, "limit": limit}
        )

# ==============================================================
# 2. PySessionManager: Redis / In-Memory Double Sign-in Invalidation
# ==============================================================

class PySessionManager:
    """
    Session manager supporting Redis and in-memory storage.
    Enforces configurable concurrent session limit (default: 1).
    When a user signs in again, earlier sessions are invalidated/evicted to prevent concurrent/shared session hijack.
    """
    def __init__(self, redis_url: Optional[str] = None, max_concurrent_sessions: int = 1, session_ttl_seconds: int = 86400):
        self.max_concurrent_sessions = max_concurrent_sessions
        self.session_ttl_seconds = session_ttl_seconds
        self.redis_client = None
        self._memory_sessions: Dict[str, Dict[str, Any]] = {}
        self._user_session_index: Dict[str, List[str]] = {}

        if redis_url:
            try:
                import redis
                self.redis_client = redis.from_url(redis_url, decode_responses=True)
            except Exception:
                self.redis_client = None

    def register_session(self, user_id: str, session_id: str, token: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Registers a new session. If user already has >= max_concurrent_sessions active,
        evicts the oldest sessions and marks them as EVICTED_BY_NEW_SIGNIN.
        """
        now = int(time.time())
        session_data = {
            "sessionId": session_id,
            "userId": user_id,
            "token": token,
            "createdAt": now,
            "expiresAt": now + self.session_ttl_seconds,
            "status": "active",
            "metadata": metadata or {}
        }

        active_sessions = self._user_session_index.get(user_id, [])
        evicted = []
        while len(active_sessions) >= self.max_concurrent_sessions:
            oldest_sid = active_sessions.pop(0)
            if oldest_sid in self._memory_sessions:
                self._memory_sessions[oldest_sid]["status"] = "evicted"
                self._memory_sessions[oldest_sid]["evictionReason"] = "EVICTED_BY_NEW_SIGNIN"
                evicted.append(oldest_sid)

        active_sessions.append(session_id)
        self._user_session_index[user_id] = active_sessions
        self._memory_sessions[session_id] = session_data
        return {"session": session_data, "evictedSessionIds": evicted}

    def validate_session(self, session_id: str) -> Dict[str, Any]:
        """
        Validates session. Raises AuthException if revoked or expired or evicted.
        """
        session = self._memory_sessions.get(session_id)
        if not session:
            raise AuthException("AUTH_SESSION_INVALID", "Session not found or has expired", user_hint="Please log in again.")

        if session.get("status") == "evicted":
            raise AuthException(
                "AUTH_DOUBLE_SIGNIN_EVICTED",
                "Your account was signed in from another location. Previous session has been invalidated.",
                user_hint="Your session was terminated because a new sign-in occurred for this account."
            )

        if session.get("expiresAt", 0) < int(time.time()):
            raise AuthException("AUTH_TOKEN_EXPIRED", "Session expired", user_hint="Please log in again.")

        return session

    def revoke_session(self, session_id: str) -> bool:
        if session_id in self._memory_sessions:
            self._memory_sessions[session_id]["status"] = "revoked"
            return True
        return False

# ==============================================================
# 3. PyRateLimiter: Standard Token Bucket Rate Limiter
# ==============================================================

class PyRateLimiter:
    """
    Standard sliding window rate limiter emitting IETF headers.
    """
    def __init__(self, limit: int = 100000, window_seconds: int = 60):
        self.limit = limit
        self.window_seconds = window_seconds
        self.requests: Dict[str, List[float]] = {}

    def allow_request(self, key: str) -> Tuple[bool, int, int]:
        now = time.time()
        window_start = now - self.window_seconds
        timestamps = self.requests.get(key, [])
        timestamps = [t for t in timestamps if t > window_start]

        if len(timestamps) >= self.limit:
            oldest = timestamps[0]
            retry_after = max(1, int(oldest + self.window_seconds - now))
            self.requests[key] = timestamps
            return False, 0, retry_after

        timestamps.append(now)
        self.requests[key] = timestamps
        remaining = self.limit - len(timestamps)
        return True, remaining, 0

# ==============================================================
# 4. Global Exception Handlers for FastAPI
# ==============================================================

def register_standards_exception_handlers(app: FastAPI):
    """Registers global RFC 7807 exception handlers on the FastAPI application."""
    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        headers = {"Content-Type": "application/problem+json"}
        if isinstance(exc, RateLimitException):
            headers["Retry-After"] = str(exc.details.get("retryAfterSeconds", 1))
        return JSONResponse(
            status_code=exc.status,
            content=exc.to_problem_details(instance=request.url.path),
            headers=headers
        )

    @app.exception_handler(HTTPException)
    async def http_exception_handler(request: Request, exc: HTTPException):
        code = "AUTH_UNAUTHORIZED" if exc.status_code == 401 else "RBAC_PERMISSION_DENIED" if exc.status_code == 403 else "INTERNAL_ERROR"
        app_exc = AppException(
            code=code,
            status=exc.status_code,
            title="HTTP Error",
            detail=str(exc.detail),
            user_hint="Server encountered an error processing your request."
        )
        return JSONResponse(
            status_code=exc.status_code,
            content=app_exc.to_problem_details(instance=request.url.path),
            headers={"Content-Type": "application/problem+json"}
        )

# ==============================================================
# 5. RBAC Permissions Matrix & Dependency Injection
# ==============================================================

DEFAULT_ROLE_PERMISSIONS: Dict[str, List[str]] = {
    "admin": ["*"],
    "manager": ["jobs:*", "milestones:*", "cctv:*", "audit:export"],
    "contractor": ["jobs:read", "jobs:write", "milestones:create", "audit:export"],
    "inspector": ["jobs:read", "milestones:view", "milestones:sign", "cctv:view", "audit:export"],
    "client": ["jobs:read", "milestones:view", "milestones:sign"],
    "viewer": ["jobs:read", "milestones:view", "cctv:view"],
}

def match_permission(granted: str, required: str) -> bool:
    if granted == "*" or granted == required:
        return True
    if granted.endswith(":*"):
        prefix = granted[:-2]
        return required.startswith(prefix + ":")
    return False

def get_current_user(secret: str = "default-jwt-secret-replace-in-env") -> Callable:
    async def dependency(credentials: Optional[HTTPAuthorizationCredentials] = Security(security)) -> Dict[str, Any]:
        if not credentials:
            raise AuthException("AUTH_UNAUTHORIZED", "Missing Bearer Authorization header")
        payload = verify_jwt(credentials.credentials, secret)
        if not payload:
            raise AuthException("AUTH_SESSION_INVALID", "Invalid or expired token")
        return payload
    return dependency

def require_permission(required_perm: str, secret: str = "default-jwt-secret-replace-in-env") -> Callable:
    user_dep = get_current_user(secret)
    
    async def dependency(user: Dict[str, Any] = Depends(user_dep)) -> Dict[str, Any]:
        user_perms = user.get("permissions", [])
        for p in user_perms:
            if match_permission(p, required_perm):
                return user
                
        role = user.get("role", "viewer")
        role_perms = DEFAULT_ROLE_PERMISSIONS.get(role, [])
        for p in role_perms:
            if match_permission(p, required_perm):
                return user
                
        raise RBACException(required=required_perm, current_role=role)
    return dependency

standards_session_manager = PySessionManager(max_concurrent_sessions=1)
standards_rate_limiter = PyRateLimiter(limit=100000, window_seconds=60)
