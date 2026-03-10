#!/bin/bash

# OpenClaw Office Next - Stop Script
# Usage: ./bin/stop.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"

echo "=========================================="
echo "  Stopping OpenClaw Office Next"
echo "=========================================="
echo ""

cd "$PROJECT_DIR"

# Stop frontend
if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
    PID=$(cat "$PROJECT_DIR/.frontend.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "[1/2] Stopping frontend (PID: $PID)..."
        kill "$PID"
        rm -f "$PROJECT_DIR/.frontend.pid"
        echo "  ✓ Frontend stopped"
    else
        echo "[1/2] Frontend already stopped"
        rm -f "$PROJECT_DIR/.frontend.pid"
    fi
else
    echo "[1/2] No frontend PID file found"
fi

# Stop server
if [ -f "$PROJECT_DIR/.server.pid" ]; then
    PID=$(cat "$PROJECT_DIR/.server.pid")
    if kill -0 "$PID" 2>/dev/null; then
        echo "[2/2] Stopping image server (PID: $PID)..."
        kill "$PID"
        rm -f "$PROJECT_DIR/.server.pid"
        echo "  ✓ Image server stopped"
    else
        echo "[2/2] Image server already stopped"
        rm -f "$PROJECT_DIR/.server.pid"
    fi
else
    echo "[2/2] No server PID file found"
fi

# Also kill any remaining node processes for this project
pkill -f "vite.*openclaw-office-next" 2>/dev/null || true
pkill -f "agent-image-server.*openclaw-office-next" 2>/dev/null || true

echo ""
echo "=========================================="
echo "  ✓ All services stopped"
echo "=========================================="
