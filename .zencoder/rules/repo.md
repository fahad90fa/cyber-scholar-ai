---
description: Repository Information Overview
alwaysApply: true
---

# CyberScholar AI - Repository Information Overview

## Summary
CyberScholar AI is an AI-powered cybersecurity educational platform featuring an intelligent chatbot assistant. The application combines a modern React frontend with a Python FastAPI backend and Supabase for backend services. It provides learning modules, document training, AI chat, and subscription-based token management for ethical hacking and cybersecurity education.

## Repository Structure

### Main Components
- **Frontend (React)**: `/src/` - Web application built with React 18, TypeScript, Vite, and shadcn/ui
- **Backend (Python)**: `/backend/` - FastAPI server for chat, training, modules, auth, and subscriptions
- **Backend-as-a-Service**: `/supabase/` - Edge functions and database migrations using Supabase
- **Docker**: `docker-compose.yml` - Containerization for backend services

### Directory Organization
- `/src/` - React components, pages, hooks, context, utilities, and services
- `/backend/app/` - FastAPI application with routes, database models, AI engine, and training
- `/supabase/functions/` - TypeScript edge functions (chat, admin, security)
- `/supabase/migrations/` - SQL migrations for database schema and RLS policies
- `/public/` - Static assets
- `/dist/` - Production build output

## Frontend - React Application

### Language & Runtime
**Language**: TypeScript (v5.8.3)  
**Runtime**: Node.js (ES modules)  
**Build System**: Vite (v5.4.19)  
**Package Manager**: npm  
**React Version**: v18.3.1

### Dependencies
**Core UI Framework**:
- react, react-dom, react-router-dom v6.30.1
- shadcn/ui (via Radix UI components)
- tailwindcss v3.4.17 with animations

**State Management & Data**:
- @tanstack/react-query v5.83.0 (data fetching and caching)
- zustand v5.0.9 (state management)
- @supabase/supabase-js v2.86.2 (backend)

**Forms & Validation**:
- react-hook-form v7.61.1
- zod v3.25.76 (schema validation)

**Additional Libraries**:
- framer-motion v12.23.25 (animations)
- recharts v2.15.4 (charts)
- react-markdown v10.1.0 (markdown rendering)
- lucide-react v0.462.0 (icons)
- sonner v1.7.4 (toasts)

**Dev Dependencies**:
- ESLint v9.32.0 with TypeScript support
- @vitejs/plugin-react-swc v3.11.0
- supabase CLI v2.65.6

### Build & Installation
```bash
npm install
npm run dev          # Start development server (port 8080)
npm run build        # Production build
npm run build:dev    # Development build
npm run lint         # Run ESLint
npm run preview      # Preview production build
```

### Entry Points
- **HTML Entry**: `index.html` - Main HTML file with React root element
- **React Entry**: `src/main.tsx` - Renders App component to DOM
- **App Root**: `src/App.tsx` - Sets up providers, routing, and context
- **Router**: `src/router.tsx` - Defines all application routes
- **Pages**: `src/pages/*.tsx` - 15+ pages (Chat, Modules, Training, Dashboard, Auth, Onboarding, etc.)

### Testing
No formal test framework detected (no Jest, Vitest, or test files found). Application relies on manual testing and ESLint for code quality.

## Backend - Python FastAPI Application

### Language & Runtime
**Language**: Python (v3.x)  
**Web Framework**: FastAPI v0.115.0  
**ASGI Server**: Uvicorn v0.31.0  
**Build System**: pip (venv-based)

### Dependencies
**Core Framework**:
- fastapi v0.115.0
- uvicorn v0.31.0
- pydantic v2.9.2 (data validation)

**Database & ORM**:
- sqlalchemy v2.0.36

**Authentication & Security**:
- python-jose[cryptography] v3.3.0 (JWT)
- passlib v1.7.4 (password hashing)
- bcrypt v3.2.2
- email-validator v2.2.0

**AI & Document Processing**:
- google-generativeai v0.8.4 (Gemini API)
- pypdf v4.3.1 (PDF parsing)
- aiofiles v24.1.0 (async file operations)

**Utilities**:
- python-dotenv v1.0.1 (environment variables)
- pydantic-settings v2.3.1
- requests v2.32.0
- python-multipart v0.0.7

### Build & Installation
```bash
# From backend/ directory
./run.sh            # Automated setup and launch script
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Entry Points
- **Main App**: `backend/app/main.py` - FastAPI application initialization, routes, startup events
- **Routes**: `backend/app/api/routes/` - auth, chat, training, modules, subscriptions, admin
- **Database**: `backend/app/database.py` - Database initialization
- **Models**: `backend/app/models.py` - SQLAlchemy data models
- **Configuration**: `backend/app/config.py` - Settings and environment

### API Structure
**Base URL**: http://localhost:8000/  
**API Prefix**: `/api/v1/`  
**Routes**: auth, chat, training, modules, subscriptions, admin  
**Health Check**: GET `/health`  
**API Docs**: `/docs` (Swagger UI)

## Backend-as-a-Service - Supabase

### Configuration
**Project ID**: cyber-scholar-ai  
**Database**: PostgreSQL v17 (local port 54322, shadow 54320)  
**API**: REST API (local port 54321)  
**Configuration File**: `supabase/config.toml`

### Supabase Edge Functions
**Locations**: `supabase/functions/*/index.ts` (TypeScript)

**Functions**:
- `chat` - AI chat message processing with onboarding checks
- `admin-auth` - Admin authentication endpoints
- `admin-users` - User management for admins
- `admin-plans` - Subscription plan management
- `admin-token-packs` - Token pack administration
- `admin-payments` - Payment processing
- `admin-stats` - Analytics and statistics
- `admin-settings` - System settings
- `chat-security` - Chat security features
- `process-document` - Document processing for training

### Database Migrations
**Location**: `supabase/migrations/` (SQL)

**Key Migrations**:
- `20250210_comprehensive_onboarding_fix.sql` - Onboarding system with RLS policies
- `20250209_setup_profiles_auth.sql` - Profile authentication setup
- `20250208_add_chat_security_system.sql` - Chat security features
- `20250109_add_token_pack_confirmation_trigger.sql` - Token pack workflow
- Various schema and constraint fixes

**Database Features**:
- Row-Level Security (RLS) policies for authenticated users
- Service role policies for backend operations
- Realtime subscriptions for profile updates
- Indexes on key columns (id, onboarding_completed, created_at)

## Docker Configuration

**Compose File**: `docker-compose.yml`

**Services**:
1. **python-backend** - FastAPI service (port 8000)
   - Built from: `./python-backend/Dockerfile`
   - Environment: SUPABASE_URL, SUPABASE_SERVICE_KEY, GEMINI_API_KEY, CHROMA_PERSIST_DIR
   - Volumes: `./python-backend/vector_db:/app/vector_db`
   - Network: cyber-network

2. **postgres** - PostgreSQL 15-alpine (port 5432)
   - Environment: POSTGRES_USER, POSTGRES_PASSWORD, POSTGRES_DB
   - Volumes: postgres_data

**Network**: cyber-network (bridge mode)

## Key Technologies Stack

### Frontend Stack
- **UI Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Routing**: React Router v6
- **State/Data**: Zustand + TanStack React Query
- **Forms**: React Hook Form + Zod validation
- **Build**: Vite with SWC compiler
- **Backend Client**: Supabase JS SDK

### Backend Stack
- **API Framework**: FastAPI with Uvicorn
- **Database**: PostgreSQL with SQLAlchemy ORM
- **Authentication**: JWT (python-jose) + bcrypt
- **AI Integration**: Google Generative AI (Gemini)
- **Document Processing**: PyPDF2

### Infrastructure
- **Database & Backend**: Supabase (managed PostgreSQL + Edge Functions)
- **Containerization**: Docker + Docker Compose
- **Hosting**: Configured for Vercel deployment (vercel.json present)

## Configuration Files
- `.env.example` - Environment variables template
- `tailwind.config.ts` - Tailwind CSS configuration
- `tsconfig.json` - TypeScript compiler options with path aliases (@/*)
- `eslint.config.js` - ESLint rules
- `components.json` - shadcn/ui component registry
- `postcss.config.js` - PostCSS configuration
- `vite.config.ts` - Vite build configuration

## Important Notes
- **Onboarding System**: Required completion check before accessing AI features (chat, modules, training)
- **RLS Policies**: Critical for securing user data - profile mutations must pass auth checks
- **Profile Auto-creation**: Profiles created automatically if missing (graceful fallback in useOnboardingStatus hook)
- **Token Management**: Subscription-based token system with monthly resets
- **Security**: Chat input validated at frontend (useChat hook) and backend (chat function)
