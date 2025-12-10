import sys
from pathlib import Path

# Add backend directory to path so imports work
sys.path.insert(0, str(Path(__file__).parent.parent / "backend"))

# Now import the FastAPI app
from app.main import app

# Export the app for Vercel ASGI handler
__all__ = ['app']
