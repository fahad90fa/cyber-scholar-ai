from pydantic_settings import BaseSettings
from functools import lru_cache


class Settings(BaseSettings):
    PROJECT_NAME: str = "CyberScholar AI"
    PROJECT_VERSION: str = "1.0.0"
    API_V1_STR: str = "/api/v1"
    
    GOOGLE_API_KEY: str
    GEMINI_MODEL: str = "gemini-2.5-flash-lite"
    
    DATABASE_URL: str = "sqlite:///./cyber_scholar.db"
    CHROMA_PERSIST_DIR: str = "./chroma_data"
    
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    
    UPLOAD_DIR: str = "./uploads"
    MAX_UPLOAD_SIZE: int = 50 * 1024 * 1024
    
    SUPABASE_URL: str = ""
    SUPABASE_SERVICE_KEY: str = ""
    SUPABASE_JWT_SECRET: str = ""
    ADMIN_PASSWORD: str = "admin123"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"


@lru_cache()
def get_settings():
    return Settings()
