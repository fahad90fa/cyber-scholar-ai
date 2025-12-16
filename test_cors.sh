#!/bin/bash

echo "=== Testing CORS Preflight for /api/v1/auth/register ==="
echo ""

# Test localhost
echo "1. Testing localhost:8000 (development):"
curl -i -X OPTIONS http://localhost:8000/api/v1/auth/register \
  -H "Origin: http://localhost:8080" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type"

echo ""
echo ""

# Test production URL (if available)
echo "2. Testing production URL (backend-six-gamma-93.vercel.app):"
curl -i -X OPTIONS https://backend-six-gamma-93.vercel.app/api/v1/auth/register \
  -H "Origin: https://cyber-scholar-ai.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  2>/dev/null

echo ""
echo ""

# Test register endpoint POST
echo "3. Testing POST to register endpoint (should fail without credentials):"
curl -i -X POST http://localhost:8000/api/v1/auth/register \
  -H "Origin: http://localhost:8080" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "username": "test", "password": "testpass"}' \
  2>/dev/null | head -20

echo ""
echo "=== CORS Test Complete ==="
