#!/usr/bin/env python3
import os
import sys
from supabase import create_client

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_URL and SUPABASE_SERVICE_KEY environment variables must be set")
    sys.exit(1)

try:
    supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    
    sql = """
    INSERT INTO public.profiles (id, email, full_name)
    SELECT 
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data ->> 'full_name', u.email) as full_name
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
      AND u.deleted_at IS NULL
    ON CONFLICT (id) DO NOTHING;
    """
    
    result = supabase.rpc('exec_sql', {'sql': sql}).execute()
    print(f"✓ Migration executed successfully: {result}")
    
except Exception as e:
    print(f"✗ Error executing migration: {str(e)}")
    print("\nFallback: Please execute this SQL in your Supabase dashboard:")
    print("""
    INSERT INTO public.profiles (id, email, full_name)
    SELECT 
      u.id,
      u.email,
      COALESCE(u.raw_user_meta_data ->> 'full_name', u.email) as full_name
    FROM auth.users u
    LEFT JOIN public.profiles p ON u.id = p.id
    WHERE p.id IS NULL
      AND u.deleted_at IS NULL
    ON CONFLICT (id) DO NOTHING;
    """)
    sys.exit(1)
