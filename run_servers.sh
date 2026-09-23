#!/usr/bin/env bash
# YardSight AI - Launch Script for Vite (Frontend) and Uvicorn (Backend)
set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="${SCRIPT_DIR}/backend"
FRONTEND_DIR="${SCRIPT_DIR}/frontend"

# Fallback if run from parent repo
if [ ! -d "$BACKEND_DIR" ]; then
  BACKEND_DIR="${SCRIPT_DIR}/yardsight/backend"
  FRONTEND_DIR="${SCRIPT_DIR}/yardsight/frontend"
fi

echo "=========================================="
echo " Starting YardSight AI Development Servers"
echo "=========================================="

cleanup() {
  echo ""
  echo "Stopping servers..."
  kill $(jobs -p) 2>/dev/null || true
  exit 0
}

trap cleanup SIGINT SIGTERM EXIT

echo "[1/2] Launching FastAPI / Uvicorn Backend on http://127.0.0.1:8001..."
cd "$BACKEND_DIR"
python -m uvicorn app:app --host 127.0.0.1 --port 8001 --reload &
BACKEND_PID=$!

echo "[2/2] Launching Vite Frontend on http://localhost:5174..."
cd "$FRONTEND_DIR"
npm run dev -- --port 5174 --host &
FRONTEND_PID=$!

echo "=========================================="
echo "  Backend Running:  http://127.0.0.1:8001"
echo "  Frontend Running: http://localhost:5174"
echo "  Press Ctrl+C to terminate both servers."
echo "=========================================="

wait
