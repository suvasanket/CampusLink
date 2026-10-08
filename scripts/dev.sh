#!/usr/bin/env bash

# CampusLink — Unified Single-Command Development Runner
# Starts both FastAPI Backend (port 8000) and Vite Frontend (port 5173) concurrently
# Cleanly terminates all child processes upon pressing Ctrl+C

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$DIR"

# Colors for terminal output
BOLD="\033[1m"
CYAN="\033[36m"
GREEN="\033[32m"
YELLOW="\033[33m"
BLUE="\033[34m"
RESET="\033[0m"

echo -e "${CYAN}${BOLD}"
echo "=========================================================="
echo "         🚀 CAMPUSLINK PLACEMENT INTELLIGENCE             "
echo "=========================================================="
echo -e "${RESET}"

# 1. Environment Verification
if [ ! -d "backend/venv" ]; then
    echo -e "${YELLOW}⚡ Virtual environment not detected. Initializing backend/venv...${RESET}"
    python3 -m venv backend/venv
    backend/venv/bin/pip install --upgrade pip
    backend/venv/bin/pip install -r backend/requirements.txt
fi

if [ ! -d "frontend/node_modules" ]; then
    echo -e "${YELLOW}⚡ Node modules not detected. Running npm install in frontend/...${RESET}"
    npm install --prefix frontend
fi

# 2. Free up ports if already bound
free_port() {
    local port=$1
    local pids=$(lsof -ti :$port 2>/dev/null || true)
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}⚠️  Port $port in use by PID(s): $pids. Releasing port...${RESET}"
        kill -9 $pids 2>/dev/null || true
        sleep 0.5
    fi
}

free_port 8000
free_port 5173

# 3. Clean Process Teardown Trap
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Shutting down CampusLink services...${RESET}"
    if [ -n "$BACKEND_PID" ]; then
        kill "$BACKEND_PID" 2>/dev/null || true
    fi
    if [ -n "$FRONTEND_PID" ]; then
        kill "$FRONTEND_PID" 2>/dev/null || true
    fi
    wait 2>/dev/null || true
    echo -e "${GREEN}✓ All services stopped cleanly. Goodbye!${RESET}"
    exit 0
}

trap cleanup INT TERM EXIT

echo -e "${BLUE}${BOLD}[1/2] Launching Backend API Engine (FastAPI + SQLAlchemy)...${RESET}"
backend/venv/bin/uvicorn app.main:app --app-dir backend --host 0.0.0.0 --port 8000 --reload &
BACKEND_PID=$!

echo -e "${CYAN}${BOLD}[2/2] Launching Frontend Portal Application (React + Vite)...${RESET}"
npm run dev --prefix frontend &
FRONTEND_PID=$!

# Wait briefly for startup
sleep 1.5

echo ""
echo -e "${GREEN}${BOLD}✓ CampusLink is running live!${RESET}"
echo -e "  ${BOLD}• Web Application (3 Portals):${RESET} ${CYAN}http://localhost:5173${RESET}"
echo -e "  ${BOLD}• Backend REST API Engine:${RESET}     ${CYAN}http://localhost:8000${RESET}"
echo -e "  ${BOLD}• Swagger Interactive Docs:${RESET}    ${CYAN}http://localhost:8000/docs${RESET}"
echo -e "  ${BOLD}• System Health Probe:${RESET}         ${CYAN}http://localhost:8000/health${RESET}"
echo ""
echo -e "${YELLOW}Press [Ctrl+C] at any time to stop all services.${RESET}"
echo "----------------------------------------------------------"

# Keep runner alive and wait for child processes
wait
