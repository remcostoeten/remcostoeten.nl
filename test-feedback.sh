#!/bin/bash

API_BASE="https://backend-thrumming-cloud-5273.fly.dev/api"
TEST_SLUG="test-post"
FINGERPRINT="test-fingerprint-$(date +%s)"

echo "Testing Blog Feedback API..."
echo "============================="
echo ""

# Test 1: Get reactions (should return empty array or existing reactions)
echo "1. Getting reactions for test post..."
curl -s "${API_BASE}/blog/feedback/${TEST_SLUG}/reactions" | jq '.'
echo ""

# Test 2: Submit feedback
echo "2. Submitting feedback..."
curl -s -X POST "${API_BASE}/blog/feedback/${TEST_SLUG}" \
  -H "Content-Type: application/json" \
  -d "{
    \"emoji\": \"🔥\",
    \"fingerprint\": \"${FINGERPRINT}\",
    \"url\": \"http://localhost:3000/posts/${TEST_SLUG}\",
    \"userAgent\": \"Test Script\"
  }" | jq '.'
echo ""

# Test 3: Get reactions again (should show the new vote)
echo "3. Getting reactions again..."
curl -s "${API_BASE}/blog/feedback/${TEST_SLUG}/reactions" | jq '.'
echo ""

# Test 4: Get full feedback stats
echo "4. Getting full feedback stats..."
curl -s "${API_BASE}/blog/feedback/${TEST_SLUG}" | jq '.'
echo ""

# Test 5: Remove vote
echo "5. Removing vote..."
curl -s -X DELETE "${API_BASE}/blog/feedback/${TEST_SLUG}?fingerprint=${FINGERPRINT}" | jq '.'
echo ""

# Test 6: Get reactions after removal
echo "6. Getting reactions after removal..."
curl -s "${API_BASE}/blog/feedback/${TEST_SLUG}/reactions" | jq '.'
echo ""

echo "============================="
echo "Testing complete!"
