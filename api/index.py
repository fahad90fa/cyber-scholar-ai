import sys
import os
from pathlib import Path

# Get the project root directory
project_root = Path(__file__).parent.parent
backend_dir = project_root / "backend"

# Add backend to Python path so 'app' module can be imported
if str(backend_dir) not in sys.path:
    sys.path.insert(0, str(backend_dir))

# Set working directory for database and file operations
os.chdir(str(backend_dir))

# Now import the FastAPI app
try:
    from app.main import app
except ImportError as e:
    from fastapi import FastAPI
    from fastapi.responses import JSONResponse
    
    app = FastAPI()
    
    @app.get("/")
    async def error():
        return JSONResponse({
            "error": f"Failed to load backend: {str(e)}",
            "python_path": sys.path
        }, status_code=500)

# Export the app for Vercel ASGI handler
__all__ = ['app']
