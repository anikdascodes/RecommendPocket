#!/bin/bash

# Replace with your actual Vercel URL
VERCEL_URL="https://recommend-pocket-62f6.vercel.app"

echo "Testing AudioVibe Deployment on Vercel"
echo "====================================="
echo ""

# Test 1: Check if API is accessible
echo "1. Testing API root endpoint..."
curl -s "$VERCEL_URL/api" | jq '.' || echo "Failed to access API"
echo ""

# Test 2: Check health endpoint
echo "2. Testing health endpoint..."
curl -s "$VERCEL_URL/api/health" | jq '.' || echo "Failed to access health endpoint"
echo ""

# Test 3: Check content endpoint
echo "3. Testing content endpoint..."
curl -s "$VERCEL_URL/api/content" | head -c 200
echo "..."
echo ""

# Test 4: Test preferences endpoint with sample data
echo "4. Testing preferences endpoint..."
curl -s -X POST "$VERCEL_URL/api/preferences" \
  -H "Content-Type: application/json" \
  -d '{
    "genres": ["romance", "thriller"],
    "duration": "medium",
    "completedOnboarding": true
  }' | jq '.' || echo "Failed to save preferences"
echo ""

# Test 5: Test recommendations endpoint
echo "5. Testing recommendations endpoint..."
curl -s -X POST "$VERCEL_URL/api/recommendations" \
  -H "Content-Type: application/json" \
  -d '{
    "preferences": {
      "genres": ["romance", "thriller"],
      "duration": "medium"
    }
  }' | head -c 500
echo "..."
echo ""

echo "====================================="
echo "Testing complete!"
echo ""
echo "Next steps:"
echo "1. Open $VERCEL_URL in your browser"
echo "2. Complete the onboarding flow"
echo "3. Check if recommendations are generated"
echo "4. Test search and filtering features" 