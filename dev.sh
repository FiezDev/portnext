#!/bin/bash

# ============================================
# Portnext Development Server Script
# ============================================
# - Kills any existing process on port 3000
# - Checks and installs packages if needed
# - Starts the Next.js dev server with Turbopack
# ============================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Port configuration
PORT=${PORT:-3000}

echo -e "${BLUE}╔═══════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║       Portnext Development Server         ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════╝${NC}"
echo ""

# Step 1: Kill existing process on port
echo -e "${YELLOW}[1/3]${NC} Checking for existing processes on port ${PORT}..."

PID=$(lsof -ti :$PORT 2>/dev/null || true)
if [ -n "$PID" ]; then
    echo -e "${RED}  → Found process $PID on port $PORT. Killing...${NC}"
    kill -9 $PID 2>/dev/null || true
    sleep 1
    echo -e "${GREEN}  ✓ Process killed${NC}"
else
    echo -e "${GREEN}  ✓ Port $PORT is free${NC}"
fi

# Step 2: Check packages
echo ""
echo -e "${YELLOW}[2/3]${NC} Checking packages..."

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo -e "${RED}  → node_modules not found. Installing...${NC}"
    bun install
    echo -e "${GREEN}  ✓ Packages installed${NC}"
else
    # Check if bun.lock is newer than node_modules
    if [ "bun.lock" -nt "node_modules" ] 2>/dev/null; then
        echo -e "${YELLOW}  → Lock file changed. Updating packages...${NC}"
        bun install
        echo -e "${GREEN}  ✓ Packages updated${NC}"
    else
        echo -e "${GREEN}  ✓ Packages up to date${NC}"
    fi
fi

# Step 3: Start dev server
echo ""
echo -e "${YELLOW}[3/3]${NC} Starting Next.js dev server with Turbopack..."
echo -e "${BLUE}  → Server will be available at http://localhost:${PORT}${NC}"
echo ""
echo -e "${GREEN}═══════════════════════════════════════════${NC}"
echo ""

exec bun run dev
