#!/bin/bash

# Feature Testing Script
# Tests newsletter signup, reminders, and API endpoints

set -e

BASE_URL="${BASE_URL:-https://custodyclarity.com/}"
CRON_SECRET="${REMINDERS_CRON_SECRET:-{REMINDERS_CRON_SECRET}}"

echo "🧪 Testing Custody Clarity Features"
echo "===================================="
echo "Base URL: $BASE_URL"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
  local name=$1
  local method=$2
  local url=$3
  local data=$4
  local expected_status=$5

  echo -n "Testing $name... "

  if [ -n "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$data")
  else
    response=$(curl -s -w "\n%{http_code}" -X "$method" "$url" \
      -H "Content-Type: application/json")
  fi

  http_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | sed '$d')

  if [ "$http_code" -eq "$expected_status" ]; then
    echo -e "${GREEN}✓ PASSED${NC} (HTTP $http_code)"
    ((PASSED++))
    return 0
  else
    echo -e "${RED}✗ FAILED${NC} (Expected $expected_status, got $http_code)"
    echo "  Response: $body"
    ((FAILED++))
    return 1
  fi
}

# Test 1: Newsletter Signup
echo "📧 Newsletter Signup Tests"
echo "---------------------------"

test_endpoint \
  "Newsletter signup (valid email)" \
  "POST" \
  "$BASE_URL/api/newsletter/subscribe" \
  '{"email":"test@example.com"}' \
  200

test_endpoint \
  "Newsletter signup (invalid email)" \
  "POST" \
  "$BASE_URL/api/newsletter/subscribe" \
  '{"email":"invalid-email"}' \
  400

test_endpoint \
  "Newsletter signup (missing email)" \
  "POST" \
  "$BASE_URL/api/newsletter/subscribe" \
  '{}' \
  400

# Test 2: Reminder Scheduling
echo ""
echo "⏰ Court Reminder Tests"
echo "------------------------"

FUTURE_DATE=$(date -u -v+1H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "+1 hour" +%Y-%m-%dT%H:%M:%SZ)

test_endpoint \
  "Schedule reminder (valid)" \
  "POST" \
  "$BASE_URL/api/reminders/schedule" \
  "{\"email\":\"test@example.com\",\"reminderDate\":\"$FUTURE_DATE\",\"summary\":\"Test Reminder\"}" \
  200

test_endpoint \
  "Schedule reminder (invalid email)" \
  "POST" \
  "$BASE_URL/api/reminders/schedule" \
  "{\"email\":\"invalid\",\"reminderDate\":\"$FUTURE_DATE\",\"summary\":\"Test\"}" \
  400

PAST_DATE=$(date -u -v-1H +%Y-%m-%dT%H:%M:%SZ 2>/dev/null || date -u -d "-1 hour" +%Y-%m-%dT%H:%M:%SZ)

test_endpoint \
  "Schedule reminder (past date)" \
  "POST" \
  "$BASE_URL/api/reminders/schedule" \
  "{\"email\":\"test@example.com\",\"reminderDate\":\"$PAST_DATE\",\"summary\":\"Test\"}" \
  400

# Test 3: Reminder Sending (requires auth)
echo ""
echo "📬 Reminder Sending Tests"
echo "--------------------------"

test_endpoint \
  "Send reminders (with auth)" \
  "POST" \
  "$BASE_URL/api/reminders/send" \
  "" \
  200

test_endpoint \
  "Send reminders (without auth)" \
  "POST" \
  "$BASE_URL/api/reminders/send" \
  "" \
  401

# Summary
echo ""
echo "===================================="
echo "📊 Test Summary"
echo "===================================="
echo -e "${GREEN}Passed: $PASSED${NC}"
echo -e "${RED}Failed: $FAILED${NC}"

if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}✅ All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}❌ Some tests failed${NC}"
  exit 1
fi

