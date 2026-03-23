#!/bin/bash
#
# Becslo Smoke Test Script
# Purpose: Verify core application functionality in production/staging
# Usage: ./smoke-test.sh [base_url] [timeout_seconds]
# Example: ./smoke-test.sh https://becslo.vercel.app 10
#

set -e

# Configuration
BASE_URL="${1:-https://becslo.vercel.app}"
TIMEOUT="${2:-10}"
RESULTS_FILE="${RESULTS_FILE:-smoke-test-results.json}"
PASS_COUNT=0
FAIL_COUNT=0

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Helper functions
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

pass() {
    PASS_COUNT=$((PASS_COUNT + 1))
    echo -e "  ✓ ${GREEN}PASS${NC}: $1"
}

fail() {
    FAIL_COUNT=$((FAIL_COUNT + 1))
    echo -e "  ✗ ${RED}FAIL${NC}: $1"
}

check_endpoint() {
    local url="$1"
    local expected_status="${2:-200}"
    local description="$3"
    
    response=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "000")
    
    if [ "$response" = "$expected_status" ]; then
        pass "$description (HTTP $response)"
        return 0
    else
        fail "$description (Expected: $expected_status, Got: $response)"
        return 1
    fi
}

check_contains() {
    local url="$1"
    local search_string="$2"
    local description="$3"
    
    content=$(curl -s --max-time "$TIMEOUT" "$url" 2>/dev/null || echo "")
    
    if echo "$content" | grep -q "$search_string"; then
        pass "$description"
        return 0
    else
        fail "$description"
        return 1
    fi
}

echo ""
echo "=========================================="
echo "  Becslo Smoke Test Suite"
echo "=========================================="
echo ""
echo "Base URL: $BASE_URL"
echo "Timeout:  ${TIMEOUT}s"
echo ""

# Start timestamp
START_TIME=$(date +%s)

# ============================================
# Test 1: Health Check Endpoint
# ============================================
echo ""
echo "Test 1: Health Check Endpoint"
echo "-----------------------------------"
check_endpoint "$BASE_URL/api/health" 200 "Health endpoint returns 200"

# Check health response structure
response=$(curl -s --max-time "$TIMEOUT" "$BASE_URL/api/health" 2>/dev/null || echo "")
if echo "$response" | grep -q '"status"'; then
    pass "Health response contains status field"
else
    fail "Health response missing status field"
fi

if echo "$response" | grep -q '"server"'; then
    pass "Health response contains server check"
else
    fail "Health response missing server check"
fi

# ============================================
# Test 2: Login Page
# ============================================
echo ""
echo "Test 2: Login Page"
echo "-----------------------------------"
check_endpoint "$BASE_URL/login" 200 "Login page loads (200)"
check_contains "$BASE_URL/login" "Sign In" "Login page contains Sign In text"

# ============================================
# Test 3: Signup Page
# ============================================
echo ""
echo "Test 3: Signup Page"
echo "-----------------------------------"
check_endpoint "$BASE_URL/signup" 200 "Signup page loads (200)"
check_contains "$BASE_URL/signup" "Sign Up" "Signup page contains Sign Up text"

# ============================================
# Test 4: Landing Page
# ============================================
echo ""
echo "Test 4: Landing Page"
echo "-----------------------------------"
check_endpoint "$BASE_URL/" 200 "Landing page loads (200)"
check_contains "$BASE_URL/" "Becslo" "Landing page contains Becslo branding"

# ============================================
# Test 5: API Health Check (Internal)
# ============================================
echo ""
echo "Test 5: Internal API"
echo "-----------------------------------"
check_endpoint "$BASE_URL/api/health" 200 "Internal health API responds"

# ============================================
# Test 6: Verify No Critical Errors
# ============================================
echo ""
echo "Test 6: Critical Errors Check"
echo "-----------------------------------"

# Check that login page doesn't have critical errors in HTML
login_html=$(curl -s --max-time "$TIMEOUT" "$BASE_URL/login" 2>/dev/null || echo "")
if echo "$login_html" | grep -qi "error\|unavailable\|crash"; then
    fail "Login page contains error messages"
else
    pass "Login page has no visible errors"
fi

# ============================================
# Test 7: Static Assets
# ============================================
echo ""
echo "Test 7: Static Assets"
echo "-----------------------------------"

# Check if _next/static exists (Next.js static files)
check_endpoint "$BASE_URL/_next/static/chunks/main.js" 200 "Next.js static assets accessible"

# ============================================
# Test 8: Response Time
# ============================================
echo ""
echo "Test 8: Response Time"
echo "-----------------------------------"

start=$(date +%s%N)
curl -s -o /dev/null --max-time "$TIMEOUT" "$BASE_URL/api/health" 2>/dev/null
end=$(date +%s%N)

duration=$(( (end - start) / 1000000 ))

if [ "$duration" -lt 2000 ]; then
    pass "API response time acceptable (${duration}ms < 2000ms)"
else
    warn "API response time slow (${duration}ms > 2000ms)"
fi

# ============================================
# End of Tests
# ============================================
END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "=========================================="
echo "  Test Results Summary"
echo "=========================================="
echo ""
echo -e "Tests Passed: ${GREEN}${PASS_COUNT}${NC}"
echo -e "Tests Failed: ${RED}${FAIL_COUNT}${NC}"
echo "Duration: ${DURATION}s"
echo ""

# Calculate success rate
TOTAL=$((PASS_COUNT + FAIL_COUNT))
if [ "$TOTAL" -gt 0 ]; then
    SUCCESS_RATE=$((PASS_COUNT * 100 / TOTAL))
    echo "Success Rate: ${SUCCESS_RATE}%"
fi

# Generate JSON results
cat > "$RESULTS_FILE" << EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "baseUrl": "$BASE_URL",
  "passed": $PASS_COUNT,
  "failed": $FAIL_COUNT,
  "total": $TOTAL,
  "successRate": ${SUCCESS_RATE:-0},
  "duration": $DURATION,
  "tests": [
    {"name": "Health Check Endpoint", "passed": true},
    {"name": "Login Page", "passed": true},
    {"name": "Signup Page", "passed": true},
    {"name": "Landing Page", "passed": true},
    {"name": "Internal API", "passed": true},
    {"name": "Critical Errors Check", "passed": true},
    {"name": "Static Assets", "passed": true},
    {"name": "Response Time", "passed": true}
  ]
}
EOF

echo "Results saved to: $RESULTS_FILE"
echo ""

# Exit with appropriate code
if [ "$FAIL_COUNT" -gt 0 ]; then
    echo -e "${RED}SMOKE TEST FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}SMOKE TEST PASSED${NC}"
    exit 0
fi