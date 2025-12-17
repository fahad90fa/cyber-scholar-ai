import logging
from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.mac_manager import MACManager

logger = logging.getLogger(__name__)

SENSITIVE_ROUTES = [
    "/api/v1/chat/",
    "/api/v1/training/",
    "/api/v1/subscriptions/",
    "/api/v1/admin/",
]


class MACVerificationMiddleware(BaseHTTPMiddleware):
    """
    Middleware to verify MAC address on sensitive requests.
    Ensures that requests come from the same device that was used during registration/login.
    """

    async def dispatch(self, request: Request, call_next):
        path = request.url.path
        
        if request.method == "OPTIONS":
            return await call_next(request)
        
        is_sensitive = any(path.startswith(route) for route in SENSITIVE_ROUTES)
        
        if not is_sensitive:
            return await call_next(request)
        
        try:
            user_id = getattr(request.state, "user_id", None)
            if not user_id:
                try:
                    from app.security import get_current_user_id
                    user_id = get_current_user_id(request)
                except:
                    return await call_next(request)
            
            if not user_id:
                return await call_next(request)
            
            ip_address = request.client.host if request.client else None
            user_agent = request.headers.get("user-agent")
            
            verification = await MACManager.verify_mac(user_id, ip_address, user_agent)
            
            if not verification.get("verified"):
                logger.warning(
                    f"MAC verification failed for user {user_id} on {path}: {verification.get('reason')}"
                )
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Device verification failed. Please log in again."
                )
            
            request.state.mac_verified = True
            
        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error in MAC verification middleware: {str(e)}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Verification service error"
            )
        
        return await call_next(request)
