from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import json

# Create a simple FastAPI app for testing
app = FastAPI()

# Add CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"message": "Welcome to CyberScholar AI Backend"}

@app.get("/health")
async def health():
    return {"status": "healthy"}

@app.get("/api/v1/health")
async def health_v1():
    return {"status": "healthy", "version": "v1"}

# Fallback handler for Vercel
async def handle(request):
    return JSONResponse({"error": "Not implemented yet"}, status_code=501)
