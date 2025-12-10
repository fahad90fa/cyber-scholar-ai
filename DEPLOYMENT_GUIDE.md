# Deployment Guide: Frontend + Backend

This project has a separate frontend (React/Vite) and backend (FastAPI/Python). They need to be deployed separately.

## Architecture

- **Frontend**: Vercel (serverless)
- **Backend**: Railway, Render, or similar (Python-compatible)
- **Database**: Supabase (already cloud-hosted)

---

## Part 1: Deploy Backend to Railway

### Step 1: Create Railway Account
1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. Click "New Project"

### Step 2: Deploy Repository
1. Select "Deploy from GitHub repo"
2. Authorize GitHub
3. Select `cyber-scholar-ai` repo
4. Choose the branch (main)

### Step 3: Configure Environment
Railway auto-detects Python. Add these variables:

In Vercel dashboard → Project Settings → Environment Variables:
```
PYTHONUNBUFFERED=1
GOOGLE_API_KEY=your_key_here
DATABASE_URL=your_db_url
```

Copy all from `backend/.env`:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_ADMIN_PASSWORD`
- etc.

### Step 4: Deploy
Railway auto-deploys when you push to GitHub. Wait 5-10 minutes.

### Step 5: Get Backend URL
Railway gives you: `https://your-app-xxxxx.railway.app`

Test: `https://your-app-xxxxx.railway.app/docs`

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub

### Step 2: Create Project
1. Click "Add New Project"
2. Select `cyber-scholar-ai` repo
3. Vercel auto-detects Vite

### Step 3: Set Environment Variables
Click "Environment Variables" and add:

```
VITE_API_URL=https://your-app-xxxxx.railway.app
VITE_BACKEND_URL=https://your-app-xxxxx.railway.app
VITE_SUPABASE_PROJECT_ID=nixiiarwumhbivyqysws
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
VITE_ADMIN_PASSWORD=fahad123@fa
VITE_ADMIN_TOKEN=sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

### Step 4: Deploy
Click "Deploy" - takes 2-3 minutes

---

## Troubleshooting

### Backend Error on Vercel
**Problem**: `Error: Backend not running`
**Cause**: Backend is running on Vercel, which only hosts frontend
**Solution**: Deploy backend to Railway/Render (see Part 1)

### CORS Errors
Add to backend `app/main.py`:
```python
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-vercel-url.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### API Connection Issues
1. Check `VITE_API_URL` is set correctly in Vercel
2. Test backend: `curl https://your-backend.railway.app/docs`
3. Check browser console for 404 errors

---

## Local Development

Run both simultaneously:
```bash
npm run dev
```

This starts:
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

---

## File Changes Made

- `.env.production` - Production environment variables
- `vercel.json` - Vercel configuration
- `package.json` - Scripts for concurrent development

---

## Summary

| Service | Where | URL |
|---------|-------|-----|
| Frontend | Vercel | https://your-app.vercel.app |
| Backend | Railway | https://your-app-xxxxx.railway.app |
| Database | Supabase | Cloud-hosted |

