# Fix MAC Address Bindings RLS Policy Error

## Problem
The `mac_address_bindings` table has RLS (Row-Level Security) policy violations preventing the backend from inserting new MAC address records during user registration. Error:
```
'message': 'new row violates row-level security policy for table "mac_address_bindings"'
```

## Root Cause
The existing RLS policies don't allow the service role to properly insert records into the `mac_address_bindings` table.

## Solution
A comprehensive migration has been created to fix all RLS policies: **`supabase/migrations/20250217_fix_mac_rls_comprehensive.sql`**

## How to Apply the Fix

### Option 1: Using Supabase Dashboard (Recommended)
1. Go to: **https://app.supabase.com/project/nixiiarwumhbivyqysws**
2. Click on **SQL Editor** (left sidebar)
3. Click **New Query**
4. Copy-paste the entire contents of: `supabase/migrations/20250217_fix_mac_rls_comprehensive.sql`
5. Click **Run** to execute the migration

### Option 2: Using Python Script (requires network access)
```bash
cd /path/to/cyber-scholar-ai
source backend/venv/bin/activate
python3 apply_migration.py
```

### Option 3: Using Supabase CLI (if installed)
```bash
supabase db push
```

## What This Migration Does
- Drops all conflicting RLS policies on `mac_address_bindings` and `mac_verification_log` tables
- Creates new, explicit policies:
  - **Service role**: Full access (INSERT, UPDATE, SELECT, DELETE) for backend operations
  - **Authenticated users**: SELECT-only access to their own records

## Verification
After applying the migration, test MAC capture:
1. Create a new user account
2. Log in and trigger any feature that captures MAC address
3. Check that the MAC binding is created successfully

## Files Involved
- **Migration**: `supabase/migrations/20250217_fix_mac_rls_comprehensive.sql` (2.6 KB)
- **Manager**: `backend/app/core/mac_manager.py` (no changes needed)
- **Helper script**: `apply_migration.py` (for automated application)
