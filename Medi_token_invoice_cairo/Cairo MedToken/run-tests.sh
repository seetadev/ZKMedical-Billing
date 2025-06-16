#!/bin/bash

# MedToken Test Runner Script
# Usage: ./run-tests.sh [options]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Default options
VERBOSE=false
GAS_REPORT=false
SPECIFIC_TEST=""

# Parse command line arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        -v|--verbose)
            VERBOSE=true
            shift
            ;;
        -g|--gas-report)
            GAS_REPORT=true
            shift
            ;;
        -t|--test)
            SPECIFIC_TEST="$2"
            shift 2
            ;;
        -h|--help)
            echo "MedToken Test Runner"
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  -v, --verbose     Run tests with verbose output"
            echo "  -g, --gas-report  Include gas usage report"
            echo "  -t, --test NAME   Run specific test by name"
            echo "  -h, --help        Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo -e "${BLUE}🧪 MedToken Test Suite${NC}"
echo -e "${BLUE}======================${NC}"

# Change to project directory
cd "$(dirname "$0")/.."

# Build command
CMD="snforge test"

if [ "$VERBOSE" = true ]; then
    CMD="$CMD -v"
fi

if [ "$GAS_REPORT" = true ]; then
    CMD="$CMD --gas-report"
fi

if [ -n "$SPECIFIC_TEST" ]; then
    CMD="$CMD $SPECIFIC_TEST"
    echo -e "${YELLOW}Running specific test: $SPECIFIC_TEST${NC}"
else
    echo -e "${YELLOW}Running all tests...${NC}"
fi

echo ""

# Run tests
if eval $CMD; then
    echo ""
    echo -e "${GREEN}✅ All tests passed!${NC}"
    
    # Show test coverage summary
    echo ""
    echo -e "${BLUE}📊 Test Coverage Summary:${NC}"
    echo -e "${GREEN}✅ MedToken: Deployment, transfers, approvals${NC}"
    echo -e "${GREEN}✅ MedInvoice: Deployment, file saving, subscriptions, withdrawals${NC}"
    echo -e "${YELLOW}⚠️  Consider adding: Edge cases, error conditions, user isolation${NC}"
else
    echo ""
    echo -e "${RED}❌ Some tests failed!${NC}"
    exit 1
fi
