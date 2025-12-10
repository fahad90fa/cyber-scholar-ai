# CyberScholar AI - Complete Platform Overview

## 🎯 Project Introduction

**CyberScholar AI** is an advanced AI-powered cybersecurity educational platform designed to provide comprehensive learning, training, and practical experience in ethical hacking and cybersecurity concepts. The platform combines modern web technologies with artificial intelligence to deliver an interactive, personalized learning experience for cybersecurity professionals and enthusiasts.

---

## 📋 Table of Contents

1. [Platform Overview](#platform-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Architecture](#architecture)
5. [Core Components](#core-components)
6. [User Features](#user-features)
7. [Subscription System](#subscription-system)
8. [AI Capabilities](#ai-capabilities)
9. [Security Features](#security-features)
10. [Getting Started](#getting-started)
11. [API Documentation](#api-documentation)
12. [Database Schema](#database-schema)

---

## 🚀 Platform Overview

### What is CyberScholar AI?

CyberScholar AI is a **full-stack web application** that serves as a comprehensive cybersecurity learning platform. It offers:

- **AI-Powered Chat Assistant** - Get instant answers to cybersecurity questions
- **Learning Modules** - Structured courses on various cybersecurity topics
- **Document Training** - Upload and train the AI on your custom documents
- **Subscription Management** - Flexible pricing plans with token-based usage
- **Admin Dashboard** - Complete platform management and analytics
- **Chat Security** - Password-protected chat sessions

### Target Users

- Cybersecurity professionals and engineers
- Ethical hackers and penetration testers
- Security researchers
- Students learning cybersecurity
- Organizations conducting security training

---

## ✨ Key Features

### 1. **AI Chat Assistant**
- Real-time responses to cybersecurity questions
- Context-aware answers based on training documents
- Multi-session support for organized conversations
- Token-based usage tracking

### 2. **Learning Modules**
- Structured courses on cybersecurity topics
- Step-by-step lessons and explanations
- Progression tracking
- Interactive content delivery

### 3. **Document Training**
- Upload PDF and text documents
- Automatic chunking and vectorization
- Custom knowledge base creation
- AI learns from your documents

### 4. **Training Chat**
- Chat with AI trained on your documents
- Direct access to custom knowledge
- Source attribution for answers
- Relevance scoring

### 5. **Subscription Plans**
- **Free Tier** - 20 tokens/month
- **Professional** - Higher token limits
- **Enterprise** - Custom solutions
- Token reset on 1st of each month
- Optional token pack purchases

### 6. **Chat Security**
- Password-protected chat sessions
- Lockout mechanism after failed attempts
- Security hints for password recovery
- Activity logging
- Session token management

### 7. **Admin Dashboard**
- User management
- Subscription tracking
- Payment processing
- Statistics and analytics
- Plan and token pack administration
- System settings configuration

---

## 🛠️ Technology Stack

### Frontend (React 18 + TypeScript)

**Core Framework & Routing:**
- `react` (18.3.1) - UI library
- `react-router-dom` (6.30.1) - Client-side routing
- `react-dom` (18.3.1) - DOM rendering

**State Management & Data:**
- `zustand` (5.0.9) - Lightweight state management
- `@tanstack/react-query` (5.83.0) - Server state management and caching
- `@supabase/supabase-js` (2.86.2) - Backend integration

**UI & Styling:**
- `tailwindcss` (3.4.17) - Utility-first CSS
- `shadcn/ui` - Radix UI component library
- `lucide-react` (0.462.0) - Icon library
- `framer-motion` (12.23.25) - Animation library

**Forms & Validation:**
- `react-hook-form` (7.61.1) - Form state management
- `zod` (3.25.76) - Schema validation

**Utilities:**
- `recharts` (2.15.4) - Data visualization
- `react-markdown` (10.1.0) - Markdown rendering
- `sonner` (1.7.4) - Toast notifications

**Build Tools:**
- `vite` (5.4.19) - Build tool and dev server
- `@vitejs/plugin-react-swc` (3.11.0) - SWC compiler for React
- `typescript` (5.8.3) - Type safety

**Development:**
- `eslint` (9.32.0) - Code linting
- `supabase-cli` (2.65.6) - Backend tooling

### Backend (Python FastAPI)

**Core Framework:**
- `fastapi` (0.115.0) - Modern web framework
- `uvicorn` (0.31.0) - ASGI server
- `pydantic` (2.9.2) - Data validation and settings

**Database & ORM:**
- `sqlalchemy` (2.0.36) - SQL toolkit and ORM
- SQLite - Local database (default)

**Authentication & Security:**
- `python-jose[cryptography]` (3.3.0) - JWT tokens
- `passlib` (1.7.4) - Password hashing
- `bcrypt` (3.2.2) - Password encryption
- `email-validator` (2.2.0) - Email validation

**AI & ML:**
- `google-generativeai` (0.8.4) - Gemini API integration
- `chromadb` - Vector database for embeddings
- `pypdf` (4.3.1) - PDF parsing

**File Handling:**
- `aiofiles` (24.1.0) - Async file operations
- `python-multipart` (0.0.7) - Multipart form handling

**Configuration & Utilities:**
- `python-dotenv` (1.0.1) - Environment variables
- `requests` (2.32.0) - HTTP client

### Backend-as-a-Service (Supabase)

**Database:**
- PostgreSQL 17 (Cloud-hosted)
- Row-Level Security (RLS) policies
- Realtime subscriptions

**Edge Functions:**
- TypeScript-based serverless functions
- Chat processing
- Admin operations
- Security features
- Document processing

---

## 🏗️ Architecture

### System Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Frontend (React 18)                      │
│  ├── Pages (Chat, Dashboard, Settings, Admin)             │
│  ├── Components (UI, Forms, Modals, Guards)               │
│  ├── Hooks (State Management, API Calls)                  │
│  └── Services (API Client, Supabase Client)               │
└──────────────────┬──────────────────────────────────────────┘
                   │ HTTPS
┌──────────────────▼──────────────────────────────────────────┐
│                Backend (FastAPI)                            │
│  ├── Auth Routes (Register, Login, Profile)               │
│  ├── Chat Routes (Messages, Sessions)                     │
│  ├── Training Routes (Document Upload, Chunking)          │
│  ├── Module Routes (Lesson Delivery)                      │
│  ├── Subscription Routes (Plans, Tokens)                  │
│  ├── Admin Routes (User Management, Stats)                │
│  └── Security Routes (Chat Security, Passwords)           │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┼──────────┐
        │          │          │
┌───────▼──┐   ┌───▼────┐ ┌──▼────────┐
│ Supabase │   │ SQLite │ │ Chroma DB │
│ (Auth)   │   │ (Local)│ │ (Vectors) │
└──────────┘   └────────┘ └───────────┘
```

### Data Flow

1. **User Authentication**
   - Frontend sends credentials to FastAPI
   - JWT token generated and stored
   - Token used for subsequent API requests

2. **Chat Messages**
   - User sends message from frontend
   - FastAPI validates and sanitizes input
   - Gemini API generates response
   - Response saved to database
   - Frontend displays message

3. **Document Training**
   - User uploads PDF document
   - FastAPI extracts text and chunks content
   - Embeddings generated and stored in Chroma
   - Vector DB used for semantic search

---

## 🧩 Core Components

### Frontend Components Structure

#### Layout Components
- `MainLayout` - Main application layout with sidebar
- `Header` - Top navigation and user menu
- `Sidebar` - Navigation menu

#### Page Components
- **Auth Pages:**
  - `AuthPage` - Login/Register
  
- **Core Pages:**
  - `Dashboard` - Main user dashboard
  - `Index` - Chat interface
  - `ModulePage` - Learning modules
  - `TrainingPage` - Document management
  - `TrainingChatPage` - Chat with documents
  - `SettingsPage` - User settings
  
- **Subscription Pages:**
  - `PricingPage` - Pricing information
  - `CheckoutPage` - Payment processing
  - `SubscriptionDashboardPage` - Subscription management
  - `BuyTokens` - Token purchase
  
- **Admin Pages:**
  - `AdminDashboardPage` - Admin overview
  - `AdminUsersPage` - User management
  - `AdminPaymentsPage` - Payment tracking
  - `AdminSubscriptionsPage` - Subscription management
  - `AdminPlansPage` - Plan management
  - `AdminTokenPacksPage` - Token pack configuration

#### UI Components (shadcn/ui)
- Button, Input, Dialog, Modal
- Card, Badge, Alert
- Form, Select, Checkbox
- Toast notifications
- Sidebar navigation
- Tables for data display

#### Feature Components
- `ChatSecurityGuard` - Protect chat with password
- `ProtectedRoute` - Authentication guard
- `SubscriptionRequired` - Subscription check
- `EnableSecurityModal` - Set chat password
- `ChangePasswordModal` - Change security password

### Backend Routes Structure

```
/api/v1/
├── /auth
│   ├── POST /register - User registration
│   ├── POST /login - User login
│   ├── GET /me - Current user info
│   └── GET /profile - User profile from Supabase
│
├── /chat
│   ├── POST /send-message - Send chat message
│   ├── GET /sessions - List chat sessions
│   └── GET /session/:id - Get session details
│
├── /training
│   ├── POST /upload - Upload training document
│   ├── GET /documents - List documents
│   ├── POST /query - Search documents
│   └── DELETE /document/:id - Delete document
│
├── /modules
│   ├── GET /list - Get all modules
│   ├── GET /:id - Get module details
│   └── POST /:id/complete - Mark module complete
│
├── /subscriptions
│   ├── GET /plans - Get subscription plans
│   ├── GET /user-subscription - User's current plan
│   ├── POST /checkout - Initialize payment
│   └── POST /token-packs - Buy additional tokens
│
├── /chat-security
│   ├── POST /set-password - Enable chat security
│   ├── POST /verify-password - Verify chat password
│   ├── POST /change-password - Change security password
│   ├── POST /disable-security - Disable security
│   └── GET /profile - Get security profile
│
└── /admin
    ├── GET /users - List all users
    ├── GET /users/:id - User details
    ├── POST /users/:id/ban - Ban user
    ├── GET /payments - List payments
    ├── GET /stats - Platform statistics
    └── POST /settings - Update system settings
```

---

## 👥 User Features

### Authentication & Profile
- **Registration** - Email, username, password
- **Login** - Email and password authentication
- **Password Requirements:**
  - Minimum 8 characters
  - Uppercase and lowercase letters
  - Numbers
  - Special characters (!@#$%^&*)
- **Profile Management** - View and update user info

### Chat Features
- **Multi-session chats** - Multiple conversation threads
- **Message history** - Persistent message storage
- **Context awareness** - AI remembers conversation
- **Token tracking** - See tokens used per message
- **Chat security** - Optional password protection
- **Export chats** - Save conversations

### Learning Modules
- **Structured curriculum** - Topic-based learning
- **Progress tracking** - See your advancement
- **Interactive content** - Lessons with examples
- **Assessments** - Self-check quizzes
- **Certificates** - Completion badges

### Document Training
- **PDF upload** - Add PDF documents
- **Text documents** - Plain text files
- **Automatic processing** - Chunking and embedding
- **Knowledge base** - Search uploaded content
- **Custom AI training** - AI learns from your docs
- **Source attribution** - See where answers come from

### Settings & Security
- **Change password** - Update login password
- **Chat security password** - Protect chat sessions
- **Session management** - View active sessions
- **Activity logs** - Security event history
- **Preferences** - Customize appearance/behavior

---

## 💳 Subscription System

### Subscription Tiers

#### Free Tier
- **Cost:** Free
- **Tokens:** 20/month
- **Refresh:** 1st of each month
- **Features:**
  - Limited AI chat
  - Basic modules
  - 1 document training session
  - No priority support

#### Professional
- **Cost:** $9.99/month
- **Tokens:** 100/month
- **Refresh:** 1st of each month
- **Features:**
  - Unlimited chat sessions
  - All modules
  - Unlimited document training
  - Email support
  - Chat security

#### Enterprise
- **Cost:** Custom pricing
- **Tokens:** Custom allocation
- **Features:**
  - Everything in Professional
  - Priority support
  - Custom integrations
  - Dedicated account manager
  - Advanced analytics

### Token System

**What are tokens?**
- Each API call to AI costs tokens
- Different operations cost different amounts:
  - Chat message: 1-5 tokens
  - Document training: 10-20 tokens
  - Complex queries: 2-10 tokens

**Token Management:**
- Monthly allocation resets on 1st
- Bonus tokens from promotions
- Purchase additional token packs
- Track usage in dashboard
- Notifications when running low

### Payment Processing

- **Stripe Integration** - Secure payments
- **Payment methods:** Credit/Debit cards
- **Invoice generation** - Automatic receipts
- **Refund policy** - 30-day money-back guarantee
- **Billing history** - View all transactions

---

## 🤖 AI Capabilities

### Gemini AI Integration

**Model:** Google Gemini 2.5 Flash

**Capabilities:**
- Natural language understanding
- Code explanation and generation
- Security vulnerability analysis
- Best practices recommendations
- Policy and compliance guidance

### Chat Features

1. **Session Management**
   - Multiple concurrent chats
   - Chat titles and descriptions
   - Message indexing
   - Full conversation history

2. **Message Processing**
   - Input validation and sanitization
   - Token counting (estimate before sending)
   - Rate limiting
   - Error handling and recovery

3. **Response Generation**
   - Context-aware responses
   - Code syntax highlighting
   - Markdown formatting
   - Source citations (for trained documents)

### Document Processing

**Pipeline:**
1. **Upload** - User uploads PDF/text
2. **Extraction** - Extract text from document
3. **Chunking** - Split into manageable pieces
4. **Embedding** - Convert to vector embeddings
5. **Storage** - Save to Chroma vector database
6. **Retrieval** - Semantic search during chat

**Supported Formats:**
- PDF files
- Text files (.txt)
- Document size: up to 50MB

---

## 🔒 Security Features

### Authentication Security

- **JWT Tokens** - JSON Web Tokens with expiration
- **Password Hashing** - bcrypt + salt
- **HTTPS Only** - Encrypted connections
- **Session Management** - Secure session tokens
- **Refresh Tokens** - 7-day validity

### Chat Security

**Password Protection:**
- Optional password for chat sessions
- Strong password requirements (same as login)
- Password hints (optional)
- Lockout after failed attempts:
  - 3 attempts: 5-minute lockout
  - 5 attempts: 15-minute lockout

**Session Tokens:**
- Unique token per secure session
- 60-minute expiration
- Invalidated on logout
- Secure storage in browser

### CORS & Cross-Origin

- Whitelist allowed origins
- Support for localhost and production
- Credentials allowed for authenticated requests
- Preflight request handling
- Error responses include CORS headers

### Input Validation

**Frontend:**
- Email validation
- Password strength checking
- Username validation (3-32 chars, alphanumeric + -_)
- HTML sanitization
- File type verification

**Backend:**
- Pydantic schema validation
- Email format verification
- Input length limits
- Special character escaping
- SQL injection prevention (ORM)

### Data Protection

- **Passwords:** Never stored in plain text
- **Tokens:** Stored securely with expiration
- **User Data:** Encrypted in transit
- **API Keys:** Environment variables only
- **Database:** PostgreSQL with RLS policies

### Admin Security

- **Role-Based Access Control** - Admin-only endpoints
- **Admin Authentication** - Separate login system
- **Audit Logging** - Track admin actions
- **IP Whitelisting** - Optional IP restrictions
- **Activity Monitoring** - Suspicious activity alerts

---

## 🎯 Getting Started

### For Users

#### 1. Sign Up
```
1. Go to https://localhost:8080/register
2. Enter email, username, password
3. Password must contain:
   - 8+ characters
   - Uppercase & lowercase
   - Numbers
   - Special characters (!@#$%^&*)
4. Click Register
5. Redirected to Dashboard
```

#### 2. Start Chatting
```
1. Click "AI Chat" on Dashboard
2. Type your cybersecurity question
3. AI responds in real-time
4. Tokens deducted per message
5. View token balance in sidebar
```

#### 3. Upload Documents
```
1. Go to "Training Documents"
2. Click "Upload Document"
3. Select PDF or text file
4. AI processes and learns
5. Chat with trained data
```

#### 4. Learn Modules
```
1. Go to "Learning Modules"
2. Select a topic
3. Follow lessons step-by-step
4. Complete assessments
5. Track progress
```

### For Developers

#### Setup Frontend
```bash
cd /home/fahad/Pictures/cyber-scholar-ai

# Install dependencies
npm install

# Start development server
npm run dev
# Server runs on http://localhost:8080

# Build for production
npm run build

# Run linter
npm run lint
```

#### Setup Backend
```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Set environment variables
cp .env.example .env
# Edit .env with your keys

# Run development server
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

#### Environment Variables Required

**Frontend (.env in root):**
```
VITE_SUPABASE_URL=<your_supabase_url>
VITE_SUPABASE_ANON_KEY=<your_supabase_key>
```

**Backend (.env in backend/):**
```
GOOGLE_API_KEY=<your_gemini_api_key>
SECRET_KEY=<random_secret_key>
SUPABASE_URL=<your_supabase_url>
SUPABASE_SERVICE_KEY=<service_key>
ADMIN_PASSWORD=<admin_password>
ALLOWED_ORIGINS=http://localhost:8080,http://localhost:3000
DATABASE_URL=sqlite:///./cyber_scholar.db
```

---

## 📚 API Documentation

### Authentication Endpoints

#### Register
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "username": "cyberhacker",
  "password": "SecurePass123!"
}

Response: 200 OK
{
  "access_token": "eyJhbGc...",
  "token_type": "bearer",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "cyberhacker",
    "is_active": true,
    "created_at": "2025-12-09T00:00:00"
  }
}
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: 200 OK
(Same as register response)
```

#### Get Current User
```
GET /api/v1/auth/me
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "cyberhacker",
  "is_active": true,
  "created_at": "2025-12-09T00:00:00"
}
```

### Chat Endpoints

#### Send Message
```
POST /api/v1/chat/send-message
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "What is SQL injection?",
  "session_id": "optional-session-uuid"
}

Response: 200 OK
{
  "message": {
    "id": "uuid",
    "role": "user",
    "content": "What is SQL injection?",
    "created_at": "2025-12-09T00:00:00"
  },
  "session_id": "uuid",
  "ai_response": "SQL injection is a code injection technique..."
}
```

#### List Sessions
```
GET /api/v1/chat/sessions
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "title": "SQL Security",
    "created_at": "2025-12-09T00:00:00",
    "updated_at": "2025-12-09T00:00:00",
    "messages": [...]
  }
]
```

### Training Endpoints

#### Upload Document
```
POST /api/v1/training/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

Files:
- file: <pdf_or_txt_file>
- source_name: "My Security Guide"

Response: 200 OK
{
  "success": true,
  "document_id": "uuid",
  "filename": "guide.pdf",
  "chunks": 45,
  "message": "Document processed successfully"
}
```

#### List Documents
```
GET /api/v1/training/documents
Authorization: Bearer <token>

Response: 200 OK
[
  {
    "id": "uuid",
    "filename": "guide.pdf",
    "source_name": "My Security Guide",
    "file_type": "pdf",
    "chunk_count": 45,
    "created_at": "2025-12-09T00:00:00"
  }
]
```

### Subscription Endpoints

#### Get Plans
```
GET /api/v1/subscriptions/plans

Response: 200 OK
[
  {
    "id": "uuid",
    "name": "Free",
    "slug": "free",
    "price": 0,
    "tokens": 20,
    "features": [...]
  },
  {
    "id": "uuid",
    "name": "Professional",
    "slug": "professional",
    "price": 9.99,
    "tokens": 100,
    "features": [...]
  }
]
```

#### Get User Subscription
```
GET /api/v1/subscriptions/user-subscription
Authorization: Bearer <token>

Response: 200 OK
{
  "id": "uuid",
  "plan_name": "Free",
  "status": "active",
  "tokens_total": 20,
  "tokens_used": 5,
  "bonus_tokens": 0,
  "expires_at": "2025-01-01T00:00:00"
}
```

### Chat Security Endpoints

#### Set Password
```
POST /api/v1/chat-security/set-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "ChatPass123!",
  "hint": "My favorite color",
  "user_id": "uuid"
}

Response: 200 OK
{
  "success": true,
  "message": "Chat password set successfully"
}
```

#### Verify Password
```
POST /api/v1/chat-security/verify-password
Authorization: Bearer <token>
Content-Type: application/json

{
  "password": "ChatPass123!",
  "user_id": "uuid"
}

Response: 200 OK
{
  "success": true,
  "message": "Access granted",
  "chatSessionToken": "token",
  "expiresAt": "2025-12-09T01:00:00"
}
```

---

## 🗄️ Database Schema

### PostgreSQL (Supabase) Tables

#### users (from auth)
```sql
- id (UUID, PRIMARY KEY)
- email (VARCHAR, UNIQUE)
- password_hash (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### profiles
```sql
- id (UUID, PRIMARY KEY, FK users.id)
- email (VARCHAR)
- subscription_tier (VARCHAR: 'free', 'professional', 'enterprise')
- subscription_status (VARCHAR: 'active', 'cancelled', 'expired')
- tokens_total (INTEGER)
- tokens_used (INTEGER)
- bonus_tokens (INTEGER)
- chat_security_enabled (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### subscriptions
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FK users.id)
- plan_id (UUID, FK subscription_plans.id)
- plan_name (VARCHAR)
- status (VARCHAR: 'active', 'expired', 'cancelled')
- billing_cycle (VARCHAR: 'monthly', 'yearly')
- tokens_total (INTEGER)
- tokens_used (INTEGER)
- started_at (TIMESTAMP)
- expires_at (TIMESTAMP)
- price_paid (NUMERIC)
- created_at (TIMESTAMP)
```

#### chat_messages (via FastAPI/SQLite)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FK users.id)
- session_id (UUID, FK chat_sessions.id)
- role (VARCHAR: 'user', 'assistant', 'system')
- content (TEXT)
- tokens_used (INTEGER)
- created_at (TIMESTAMP)
```

#### chat_sessions (via FastAPI/SQLite)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FK users.id)
- title (VARCHAR)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### training_documents (via FastAPI/SQLite)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FK users.id)
- filename (VARCHAR)
- source_name (VARCHAR)
- file_type (VARCHAR: 'pdf', 'txt')
- file_path (VARCHAR)
- chunk_count (INTEGER)
- created_at (TIMESTAMP)
```

#### chat_security (via FastAPI/SQLite)
```sql
- id (UUID, PRIMARY KEY)
- user_id (UUID, FK users.id)
- chat_password_hash (VARCHAR)
- chat_password_salt (VARCHAR)
- chat_security_enabled (BOOLEAN)
- chat_security_hint (VARCHAR)
- chat_password_set_at (TIMESTAMP)
- last_chat_access (TIMESTAMP)
- failed_chat_password_attempts (INTEGER)
- chat_locked_until (TIMESTAMP)
- created_at (TIMESTAMP)
```

---

## 📊 Key Metrics & Monitoring

### Performance Metrics

- **API Response Time:** < 500ms average
- **Chat Response Time:** 2-5 seconds (AI processing)
- **Document Upload:** Parallel processing
- **Token Efficiency:** Optimized for cost
- **Database Queries:** Indexed for speed

### User Analytics Tracked

- Active users per day/month
- Chat message volume
- Document uploads and training
- Token consumption patterns
- Module completion rates
- Subscription conversion rates
- Payment success rates
- Error and exception logs

### System Health

- API uptime monitoring
- Database connection pooling
- Memory usage tracking
- CPU utilization
- Error rate monitoring
- Security event logging

---

## 🔄 Deployment

### Production Environment

**Frontend:**
- Deployed on Vercel
- Auto-deployed from git push
- CDN for static assets
- Environment variables managed

**Backend:**
- FastAPI with Uvicorn
- Docker containerization
- Available with docker-compose
- Environment-based configuration

**Database:**
- Supabase PostgreSQL (cloud)
- Automatic backups
- RLS for data security
- Real-time subscriptions

### Docker Setup

```bash
# Run entire stack
docker-compose up -d

# Services:
# - python-backend: Port 8000
# - postgres: Port 5432
# - redis: Optional caching
```

---

## 🚀 Future Roadmap

### Planned Features

1. **Advanced Analytics**
   - Learning progress dashboards
   - Performance metrics
   - Custom reports

2. **Community Features**
   - Discussion forums
   - Knowledge sharing
   - Peer learning

3. **Mobile App**
   - React Native app
   - Offline support
   - Push notifications

4. **Advanced AI**
   - Voice input/output
   - Real-time vulnerability scanning
   - Automated pentesting reports

5. **Integrations**
   - GitHub integration
   - Slack notifications
   - API webhooks

6. **Gamification**
   - Badges and achievements
   - Leaderboards
   - Challenges and competitions

---

## 📞 Support & Contact

### Getting Help

- **Documentation:** Check ABOUT.md and code comments
- **Issues:** Report bugs in GitHub Issues
- **Email:** contact@cyberscholar.ai
- **Discord:** Join our community server
- **Live Chat:** In-app support (coming soon)

### Contributing

- Fork the repository
- Create feature branch
- Submit pull requests
- Follow code style guide
- Write tests for new features

---

## 📄 License

CyberScholar AI is provided as-is for educational purposes. See LICENSE file for details.

---

## ⚠️ Disclaimer

CyberScholar AI provides educational content only. Users are responsible for:
- Using knowledge legally and ethically
- Obtaining proper permissions before security testing
- Following applicable laws and regulations
- Respecting privacy and intellectual property
- Not using for malicious purposes

---

## 🎓 Conclusion

CyberScholar AI represents the future of cybersecurity education - combining cutting-edge AI technology with practical, hands-on learning. Whether you're a beginner learning the basics or an experienced professional sharpening your skills, CyberScholar AI provides the tools, knowledge, and community support you need to excel in cybersecurity.

**Start learning today and become a cybersecurity expert! 🔐**

---

*Last Updated: December 9, 2025*
*Version: 1.0.0*
