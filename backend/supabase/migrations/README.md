# Supabase Migrations

This directory contains SQL migrations for the Supabase database setup.

## How to Apply Migrations

### Option 1: Using Supabase CLI
```bash
supabase migration up
```

### Option 2: Manual Application via Supabase Dashboard
1. Go to Supabase Dashboard → SQL Editor
2. Create a new query
3. Copy the entire contents of the migration file
4. Execute the query

## Migrations

### 001_setup_auth_triggers.sql
Sets up the following:
- Creates the `profiles` table if it doesn't exist
- Enables Row Level Security (RLS) on the profiles table
- Creates trigger functions to automatically sync auth.users with profiles table
- Handles email updates automatically
- Creates utility functions for profile management

This migration fixes the following issues:
- **NULL email constraint errors**: Ensures email is always populated from auth.users
- **Missing profile records**: Automatically creates profiles when users sign up
- **Email synchronization**: Updates profile email when auth user email changes

## Important Notes

- These migrations use PostgreSQL and are specific to Supabase
- The triggers ensure data consistency between auth.users and the profiles table
- RLS policies ensure users can only access their own profile data
- Service role key can bypass RLS for backend operations (recommended for backend)
