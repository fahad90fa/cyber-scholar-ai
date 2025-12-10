# Vercel Deployment - Quick Start

Deploy your entire CyberScholar AI app (frontend + backend) on Vercel with just a few clicks!

## What's New?

✅ **Frontend** - React/Vite (Vercel static hosting)  
✅ **Backend** - FastAPI (Vercel serverless functions in `/api`)  
✅ **Same Domain** - No CORS issues (both on same Vercel URL)  
✅ **One Click Deploy** - From GitHub

## Quick Setup (5 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Setup for Vercel deployment"
git push origin main
```

### 2. Go to Vercel
- Visit [vercel.com](https://vercel.com)
- Click "Add New Project"
- Select your `cyber-scholar-ai` repo
- Click "Import"

### 3. Add Environment Variables
Vercel will ask for environment variables before deployment.

**Copy these and paste into Vercel:**

```
VITE_SUPABASE_PROJECT_ID=nixiiarwumhbivyqysws
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5peGlpYXJ3dW1oYml2eXF5c3dzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ5NDgxNjAsImV4cCI6MjA4MDUyNDE2MH0.V29VSVhH3tTDoDlANzG7xV68-Kt0-b1exE-zSVUxzVY
VITE_SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
VITE_ADMIN_PASSWORD=fahad123@fa
VITE_ADMIN_TOKEN=sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a
VITE_GOOGLE_MAPS_API_KEY=your_key_here
GOOGLE_API_KEY=your_key_here
SECRET_KEY=your_secret_key_here
SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
SUPABASE_SERVICE_KEY=your_service_key
SUPABASE_JWT_SECRET=your_jwt_secret
ADMIN_PASSWORD=fahad123@fa
DATABASE_URL=sqlite:///./cyber_scholar.db
CHROMA_PERSIST_DIR=./chroma_data
UPLOAD_DIR=./uploads
ENVIRONMENT=production
ALLOWED_ORIGINS=https://cyber-scholar-ai.vercel.app
```

### 4. Deploy
Click the "Deploy" button - Vercel will automatically:
- Build your React frontend
- Set up Python serverless backend
- Configure routing

### 5. Test
Once deployed, visit:
- **Frontend**: `https://cyber-scholar-ai.vercel.app`
- **API Docs**: `https://cyber-scholar-ai.vercel.app/api/docs`
- **Health Check**: `https://cyber-scholar-ai.vercel.app/api/v1/health`

## File Structure (What Changed)

```
cyber-scholar-ai/
├── api/
│   └── index.py                    ← NEW: Vercel entry point
├── backend/
│   ├── app/
│   │   ├── main.py                 (unchanged)
│   │   └── config.py               (updated: ALLOWED_ORIGINS)
│   └── requirements.txt
├── src/                            (unchanged: React frontend)
├── vercel.json                     (updated: serverless config)
└── .env                            (updated: /api paths)
```

## How It Works

1. Request comes to Vercel
2. Check the path:
   - `/api/*` → Routed to Python serverless function (`api/index.py`)
   - All other paths → Routed to React frontend (`dist/index.html`)
3. Frontend makes requests to `/api` (same domain, no CORS issues)

## Troubleshooting

### "Backend not found"
- Check Vercel deployment logs
- Verify all environment variables are set
- Try redeploying

### "API returns 500 error"
- Check `/api/docs` for error messages
- Verify `DATABASE_URL` is set correctly
- Check backend logs in Vercel dashboard

### "Database errors"
- SQLite works but data is ephemeral (lost on cold starts)
- **Better solution**: Use Supabase PostgreSQL instead
- Update `DATABASE_URL` to PostgreSQL connection string

### "File upload not working"
- Serverless functions have limited disk space
- **Better solution**: Use Supabase Storage
- Update file handling code

## Advanced Setup

See `VERCEL_DEPLOYMENT.md` for:
- Using Supabase PostgreSQL instead of SQLite
- Configuring Supabase Storage for uploads
- Setting up custom domain
- Monitoring and analytics

## Local Development

Run both frontend and backend locally:
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## Need Help?

Read the full guide: `VERCEL_DEPLOYMENT.md`

