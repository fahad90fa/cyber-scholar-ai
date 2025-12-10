# Deploy Frontend + Backend to Vercel

This guide explains how to deploy both the React frontend and Python backend on a single Vercel project.

## Architecture

- **Frontend**: React/Vite (deployed as static assets)
- **Backend**: FastAPI (deployed as serverless functions in `/api`)
- **Database**: Supabase (cloud-hosted)
- **Files**: Supabase Storage

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Setup for Vercel deployment with both frontend and backend"
git push origin main
```

## Step 2: Connect to Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Add New Project"
3. Import your `cyber-scholar-ai` GitHub repo
4. Vercel auto-detects it's a monorepo with frontend + backend

## Step 3: Set Environment Variables

In Vercel Dashboard → Project Settings → Environment Variables, add:

**Frontend Variables:**
```
VITE_SUPABASE_PROJECT_ID=nixiiarwumhbivyqysws
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_SUPABASE_URL=https://nixiiarwumhbivyqysws.supabase.co
VITE_ADMIN_PASSWORD=fahad123@fa
VITE_ADMIN_TOKEN=sbp_cd39323b2d417629762f7a2ce1969d0407f4fd7a
VITE_GOOGLE_MAPS_API_KEY=your_key_here
```

**Backend Variables (for `/api` serverless functions):**
```
GOOGLE_API_KEY=your_key_here
SECRET_KEY=your_secret_key
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

## Step 4: Deploy

Click "Deploy" - Vercel will:
1. Build frontend with `npm run build` → outputs to `dist/`
2. Deploy Python backend from `api/index.py` as serverless functions
3. Route `/api/*` calls to Python backend
4. Route other paths to React frontend

## Step 5: Test

- Frontend: `https://cyber-scholar-ai.vercel.app`
- API Health: `https://cyber-scholar-ai.vercel.app/api/v1/health`
- API Docs: `https://cyber-scholar-ai.vercel.app/api/docs`

## Local Development

Run both locally:
```bash
npm run dev
```

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`

## File Structure

```
cyber-scholar-ai/
├── api/
│   └── index.py                 # Vercel serverless entry point
├── backend/
│   ├── app/
│   │   ├── main.py             # FastAPI app
│   │   ├── config.py
│   │   ├── models.py
│   │   └── api/
│   │       └── routes/         # API endpoints
│   └── requirements.txt
├── src/                        # React frontend
│   ├── components/
│   ├── pages/
│   └── ...
├── dist/                       # Build output (auto-created)
├── vercel.json                 # Vercel config
├── package.json
└── vite.config.ts
```

## How It Works

1. **Vercel receives request**
2. **Check route:**
   - `/api/*` → Python serverless function
   - `/*` → React frontend (served from `dist/`)
3. **Frontend makes request to `/api`**
   - Browser automatically uses same domain
   - Request goes to serverless function
   - No CORS issues (same origin)

## Troubleshooting

### "Backend error"
- Check `/api/docs` is accessible
- Verify environment variables are set
- Check Vercel deployment logs

### Database errors
- SQLite works but data is ephemeral (lost on cold start)
- **Recommended**: Use Supabase PostgreSQL instead
- Update `DATABASE_URL` to Supabase connection string

### File upload errors
- Serverless functions have limited disk space
- **Recommended**: Use Supabase Storage instead of local `/uploads`
- Update file handling code to use Supabase SDK

### CORS errors (shouldn't happen)
- Both frontend and backend on same Vercel domain
- If still getting errors, check backend CORS config in `backend/app/main.py`

## Production Checklist

- [ ] All environment variables set in Vercel
- [ ] Database configured (Supabase)
- [ ] File storage configured (Supabase Storage)
- [ ] Google Maps API key set
- [ ] Supabase API keys configured
- [ ] Admin password updated
- [ ] Frontend and backend tested locally with `npm run dev`
- [ ] Deployment successful with no errors

## Next Steps

1. **Optimize database**: Migrate from SQLite to Supabase PostgreSQL
2. **Optimize storage**: Use Supabase Storage for file uploads
3. **Monitor**: Set up Vercel monitoring and analytics
4. **Custom domain**: Add your domain in Vercel settings

