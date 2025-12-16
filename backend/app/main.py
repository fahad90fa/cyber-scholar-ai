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

logger.info(f"CORS allowed origins: {allowed_origins}")
logger.info(f"Running in {settings.ENVIRONMENT} mode")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Type", "Authorization"],
    max_age=86400,
)

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
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "detail": "Validation failed",
            "errors": errors
        },
        headers={
            "Access-Control-Allow-Origin": request.headers.get("origin", "*"),
            "Access-Control-Allow-Credentials": "true",
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
