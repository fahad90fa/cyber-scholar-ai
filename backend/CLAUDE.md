# Backend Development Guide

## Key Commands

### Setup
```bash
# Install dependencies
pip install -r requirements.txt

# Set up Supabase migrations
supabase migration up

# Or manually apply via Supabase SQL Editor (see SUPABASE_SETUP.md)
```

### Development
```bash
# Run backend server
python -m uvicorn app.main:app --reload

# Or use the provided script
./start-dev.sh

# Run tests (when available)
pytest
```

### Linting & Type Checking
```bash
# Lint with ruff
ruff check app/

# Format with ruff
ruff format app/

# Type checking with pyright (if installed)
pyright app/
```

### Production
```bash
# Build for Vercel
vercel build

# Deploy to Vercel
vercel deploy --prod
```

## Fixes Applied

### 1. Auth.py (Fixed registration flow)
- **Issue**: NULL email in profiles table
- **Fix**: Enhanced profile creation with fallback mechanism and error logging
- **What changed**:
  - Added `username` field to profile creation
  - Implemented fallback profile creation on registration failures
  - Added profile verification/creation on login to ensure profile exists
  - Better error handling and logging

### 2. Chat Security (Fixed user isolation)
- **Issue**: Using `req.user_id` instead of `current_user.id` - potential security issue
- **Fix**: Validate user ownership before operations
- **What changed**:
  - All endpoints now verify `req.user_id == current_user.id`
  - Use `current_user.id` for Supabase updates instead of `req.user_id`
  - Added 403 Forbidden error for unauthorized access attempts

### 3. Supabase Configuration
- **Issue**: SUPABASE_JWT_SECRET not properly configured
- **Fix**: Created comprehensive setup guide and added configuration validation
- **What changed**:
  - Added SUPABASE_ANON_KEY to config.py
  - Updated supabase_client.py to warn if JWT_SECRET is not set
  - Created .env.example with all required fields
  - Created SUPABASE_SETUP.md with detailed configuration instructions

### 4. Database Triggers
- **Issue**: No automatic profile creation from auth.users
- **Fix**: Created Supabase migration with triggers
- **What changed**:
  - Created profiles table with proper schema
  - Added triggers to sync auth.users with profiles
  - Added RLS policies for security
  - Created utility functions for profile management
  - See: supabase/migrations/001_setup_auth_triggers.sql

## Configuration

### Environment Variables (Required)

```
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_role_key
SUPABASE_ANON_KEY=your_anon_key
SUPABASE_JWT_SECRET=your_jwt_secret (NOT the service key!)
```

See SUPABASE_SETUP.md for detailed instructions on obtaining these values.

## Common Issues

### 401 Invalid Credentials
- Check SUPABASE_JWT_SECRET is correct (from Supabase → Settings → API → JWT Secret)
- Verify user exists in Supabase Auth
- Check Supabase auth settings (email confirmation disabled for development)

### 400 Null Email Error
- Run migrations: `supabase migration up`
- Verify profiles table has email column
- Check that triggers are enabled
- Use fallback profile creation (already implemented)

### Profile Not Syncing
- Migrations automatically sync on registration
- Fallback creation happens on login
- Can manually trigger with ensure_profile_exists() function

## Testing

See SUPABASE_SETUP.md for testing procedures.

## Registration & Validation

### Use Validation Endpoint First
Always validate data before registering:

```bash
# Test validation
curl -X POST http://localhost:8000/api/v1/auth/validate-registration \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Password123!"}'
```

### Then Register
Once validation passes:

```bash
# Register
curl -X POST http://localhost:8000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","username":"testuser","password":"Password123!"}'
```

See TESTING_REGISTRATION.md for detailed test cases.

## Deployment

1. Update environment variables in Vercel
2. Ensure Supabase migrations are applied
3. Deploy: `vercel deploy --prod`

See SUPABASE_SETUP.md for detailed deployment steps.
