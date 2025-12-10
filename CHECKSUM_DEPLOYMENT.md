# SHA-256 Checksum Implementation - Deployment Guide

## Database Migration

Run Supabase migration:
```bash
cd supabase
supabase migration up
```

## Backend Setup

1. Python hashlib is built-in (no install needed)
2. New files:
   - `backend/app/utils/checksum.py` - SHA256 utility
3. Modified routes:
   - `backend/app/api/routes/training.py` - upload + verify endpoints
4. Modified models:
   - `backend/app/models.py` - TrainingDocument schema

## Edge Function Deployment

```bash
supabase functions deploy process-document
```

## Frontend Build

```bash
npm run build
npm run lint
```

## API Endpoints

### Verify Document Integrity
```
GET /api/v1/training/documents/{source_name}/verify
Response:
{
  "verified": bool,
  "status": "ok|mismatch|unknown|file_missing|error",
  "message": "string",
  "checksum": "first_16_chars..."
}
```

## Verification Flow

1. **On Upload**: SHA256 computed, stored in DB + vector metadata
2. **On Verify Request**: Recompute SHA256, compare with stored
3. **On Mismatch**: Log to security_events (severity: critical)
4. **UI Display**: Show checksum preview + verification status icon

## Security Events

Failed verifications logged to `security_events` table:
- Accessible only to owning user (RLS)
- Contains: expected vs computed checksum
- Admin can query: `SELECT * FROM security_events WHERE severity = 'critical'`

## Legacy Documents

Docs without checksum show "Unknown" status.
New uploads always get checksum.
