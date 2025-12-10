import sys
from pathlib import Path

# Add the project root to the path so we can import the backend
sys.path.insert(0, str(Path(__file__).parent.parent))

# Import the FastAPI app from the backend
from backend.app.main import app

# The app is already configured with all routes, middleware, and CORS in backend/app/main.py
