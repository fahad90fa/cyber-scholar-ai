import sys
import os
from pathlib import Path

# Setup path
project_root = Path(__file__).parent.parent
backend_dir = project_root / "backend"
sys.path.insert(0, str(backend_dir))
os.chdir(str(backend_dir))

# Import and expose the FastAPI app for Vercel ASGI
from app.main import app

# Vercel expects either:
# 1. An ASGI app directly (like FastAPI)
# 2. Or export it as 'app' or 'asgi_app'
