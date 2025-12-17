#!/usr/bin/env python3
import os
import sys
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

backend_env_path = Path(__file__).parent / "backend" / ".env"
load_dotenv(backend_env_path)

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    print("Error: SUPABASE_URL or SUPABASE_SERVICE_KEY not set")
    print(f"Looking for: {backend_env_path}")
    sys.exit(1)

print(f"✓ SUPABASE_URL: {SUPABASE_URL}")
print(f"✓ SUPABASE_SERVICE_KEY: {SUPABASE_SERVICE_KEY[:20]}...")

migration_path = Path(__file__).parent / "supabase/migrations/20250217_fix_mac_rls_comprehensive.sql"

if not migration_path.exists():
    print(f"Error: Migration file not found: {migration_path}")
    sys.exit(1)

migration_sql = migration_path.read_text()
print(f"\n✓ Loaded migration: {migration_path.name}")
print(f"  Size: {len(migration_sql)} bytes")
print()

headers = {
    "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
    "Content-Type": "application/json",
    "apikey": SUPABASE_SERVICE_KEY
}

project_ref = SUPABASE_URL.split("https://")[1].split(".supabase.co")[0]
print(f"✓ Project ref: {project_ref}")

sql_url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
print(f"\nAttempting to apply migration via REST API...")
print("-" * 60)

try:
    payload = {"sql": migration_sql}
    response = requests.post(
        sql_url,
        headers=headers,
        json=payload,
        timeout=30
    )
    
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.text[:500]}")
    
    if response.status_code in [200, 201, 204]:
        print(f"\n✓ Migration applied successfully!")
    else:
        print(f"\n✗ Error applying migration")
        if "pg_query" in response.text.lower():
            print("Note: The REST API doesn't support raw SQL execution.")
            print("\nPlease apply the migration manually:")
            print("-" * 60)
            print(f"Project URL: https://app.supabase.com/project/{project_ref}")
            print("1. Go to SQL Editor")
            print("2. Create new query")
            print("3. Paste the contents of:", migration_path)
            print("4. Run the query")
        
except Exception as e:
    print(f"✗ Error: {e}")
    print("\nPlease apply the migration manually via Supabase dashboard:")
    print("-" * 60)
    print(f"Project URL: https://app.supabase.com/project/{project_ref}")
    print("1. Go to SQL Editor")
    print("2. Create new query")
    print("3. Paste the contents of: supabase/migrations/20250217_fix_mac_rls_comprehensive.sql")
    print("4. Run the query")
