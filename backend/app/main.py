from fastapi import FastAPI, status
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.responses import JSONResponse
from app.config import get_settings
from app.database import init_db
from app.core.supabase_client import supabase
from app.api.routes import auth, chat, training, modules, subscriptions, admin, chat_security
from app.security_middleware import RateLimitMiddleware, SecurityHeadersMiddleware, RequestLoggingMiddleware
import logging
from datetime import datetime

settings = get_settings()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

from app.middleware.auth import AuthMiddleware

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="AI-powered Cybersecurity Educational Chatbot",
    docs_url="/docs" if settings.ENVIRONMENT == "development" else None,
    redoc_url="/redoc" if settings.ENVIRONMENT == "development" else None,
    openapi_url="/openapi.json" if settings.ENVIRONMENT == "development" else None,
)

allowed_origins = [origin.strip() for origin in settings.ALLOWED_ORIGINS.split(",")]

if not any(origin.startswith("http://localhost") for origin in allowed_origins):
    allowed_origins.extend([
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:8080",
        "http://localhost:8081",
    ])

# Ensure the frontend URL is in allowed_origins
if "https://cyber-scholar-ai.vercel.app" not in allowed_origins:
    allowed_origins.append("https://cyber-scholar-ai.vercel.app")

logger.info(f"CORS allowed origins: {allowed_origins}")
logger.info(f"Running in {settings.ENVIRONMENT} mode")

cors_config = {
    "allow_origins": allowed_origins,
    "allow_credentials": True,
    "allow_methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    "allow_headers": ["Authorization", "Content-Type", "X-Requested-With", "Accept"],
    "expose_headers": ["Content-Type", "Authorization"],
    "max_age": 86400,
}

app.add_middleware(CORSMiddleware, **cors_config)

# Add AuthMiddleware
app.add_middleware(AuthMiddleware)

if settings.ENVIRONMENT == "production":
    trusted_hosts = [origin.replace("http://", "").replace("https://", "") for origin in allowed_origins]
    trusted_hosts.extend([
        "backend-six-gamma-93.vercel.app",
        "*.vercel.app"
    ])
    logger.info(f"Trusted hosts: {trusted_hosts}")
    app.add_middleware(TrustedHostMiddleware, allowed_hosts=trusted_hosts)

app.add_middleware(RequestLoggingMiddleware)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request, exc):
    errors = []
    for error in exc.errors():
        field = ".".join(str(x) for x in error["loc"][1:]) if len(error["loc"]) > 1 else "unknown"
        msg = error.get("msg", "Invalid value")
        errors.append({
            "field": field,
            "message": msg
        })
    
    origin = request.headers.get("origin", "*")
    allowed = [o for o in allowed_origins if origin.endswith(o.replace("https://", "").replace("http://", ""))]
    cors_origin = origin if allowed or "*" in allowed_origins else "*"
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation failed",
            "errors": errors
        },
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )


@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    origin = request.headers.get("origin", "*")
    allowed = [o for o in allowed_origins if origin.endswith(o.replace("https://", "").replace("http://", ""))]
    cors_origin = origin if allowed or "*" in allowed_origins else "*"
    
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={"detail": "Internal server error"},
        headers={
            "Access-Control-Allow-Origin": cors_origin,
            "Access-Control-Allow-Credentials": "true",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        }
    )


@app.options("/{full_path:path}", include_in_schema=False)
async def preflight_handler(full_path: str):
    return JSONResponse(
        status_code=200,
        content={"status": "ok"},
        headers={
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS, PATCH",
            "Access-Control-Allow-Headers": "Authorization, Content-Type, X-Requested-With, Accept",
            "Access-Control-Max-Age": "86400",
        }
    )


@app.on_event("startup")
async def startup_event():
    try:
        init_db()
        logger.info(f"Application started in {settings.ENVIRONMENT} mode")
    except ValueError as e:
        logger.error(f"Configuration error: {e}")
        if settings.ENVIRONMENT == "production":
            raise
    except Exception as e:
        logger.error(f"Database initialization error: {e}")
        if settings.ENVIRONMENT == "production":
            logger.error("CRITICAL: Failed to initialize database in production. Check DATABASE_URL.")
            raise


app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(chat.router, prefix=settings.API_V1_STR)
app.include_router(training.router, prefix=settings.API_V1_STR)
app.include_router(modules.router, prefix=settings.API_V1_STR)
app.include_router(subscriptions.router, prefix=settings.API_V1_STR)
app.include_router(admin.router, prefix=settings.API_V1_STR)
app.include_router(chat_security.router, prefix=settings.API_V1_STR)


@app.get("/test-db")
def test_db():
    return supabase.from_("profiles").select("id").limit(1).execute()


@app.get("/")
async def root():
    return {
        "message": "Welcome to CyberScholar AI",
        "docs": "/docs",
        "api_version": settings.API_V1_STR
    }


@app.get("/health")
async def health_check():
    from app.database import engine
    from app.core.supabase_client import supabase
    import sqlalchemy
    
    health = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "environment": settings.ENVIRONMENT,
    }
    
    db_status = "unknown"
    try:
        with engine.connect() as conn:
            conn.execute(sqlalchemy.text("SELECT 1"))
        db_status = "connected"
    except Exception as e:
        db_status = f"error: {str(e)[:50]}"
        health["status"] = "degraded"
    
    health["database"] = {
        "status": db_status,
        "url_scheme": settings.DATABASE_URL.split("://")[0] if "://" in settings.DATABASE_URL else "unknown"
    }
    
    supabase_status = "unknown"
    try:
        if supabase and hasattr(supabase, 'auth'):
            supabase_status = "ready"
        else:
            supabase_status = "not_initialized"
            health["status"] = "degraded"
    except Exception as e:
        supabase_status = f"error: {str(e)[:50]}"
        health["status"] = "degraded"
    
    health["supabase"] = {"status": supabase_status}
    
    status_code = 200 if health["status"] == "healthy" else 503
    return JSONResponse(content=health, status_code=status_code)


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
