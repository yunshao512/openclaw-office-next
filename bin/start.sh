#!/bin/bash

# OpenClaw Office Next - Start Script
# Usage: ./bin/start.sh [options]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
CONFIG_FILE="$PROJECT_DIR/conf/config.json"

# Default values
SERVER_PORT=3001
FRONTEND_PORT=8088
LOG_DIR="$PROJECT_DIR/logs"

# Parse config if exists
if [ -f "$CONFIG_FILE" ]; then
    # Simple JSON parsing (requires jq)
    if command -v jq &> /dev/null; then
        SERVER_PORT=$(jq -r '.server.port // 3001' "$CONFIG_FILE")
        LOG_DIR=$(jq -r '.logging.dir // "./logs"' "$CONFIG_FILE")
    fi
fi

# Parse command line args
while [[ $# -gt 0 ]]; do
    case $1 in
        --server-port)
            SERVER_PORT="$2"
            shift 2
            ;;
        --frontend-port)
            FRONTEND_PORT="$2"
            shift 2
            ;;
        --log-dir)
            LOG_DIR="$2"
            shift 2
            ;;
        -h|--help)
            echo "Usage: $0 [options]"
            echo ""
            echo "Options:"
            echo "  --server-port PORT     Image server port (default: $SERVER_PORT)"
            echo "  --frontend-port PORT   Frontend port (default: $FRONTEND_PORT)"
            echo "  --log-dir DIR          Log directory (default: $LOG_DIR)"
            echo "  -h, --help             Show this help message"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

echo "=========================================="
echo "  Starting OpenClaw Office Next"
echo "=========================================="
echo ""
echo "Configuration:"
echo "  Server Port:    $SERVER_PORT"
echo "  Frontend Port:  $FRONTEND_PORT"
echo "  Log Directory:  $LOG_DIR"
echo "  Project Dir:    $PROJECT_DIR"
echo ""

# Create log directory
mkdir -p "$LOG_DIR"

cd "$PROJECT_DIR"

# Check if already running
if [ -f "$PROJECT_DIR/.server.pid" ]; then
    OLD_PID=$(cat "$PROJECT_DIR/.server.pid")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Warning: Server already running (PID: $OLD_PID)"
        echo "Use './bin/stop.sh' to stop it first"
        exit 1
    fi
fi

if [ -f "$PROJECT_DIR/.frontend.pid" ]; then
    OLD_PID=$(cat "$PROJECT_DIR/.frontend.pid")
    if kill -0 "$OLD_PID" 2>/dev/null; then
        echo "Warning: Frontend already running (PID: $OLD_PID)"
        echo "Use './bin/stop.sh' to stop it first"
        exit 1
    fi
fi

# Start image server
echo "[1/2] Starting image server..."
PORT=$SERVER_PORT npx tsx scripts/agent-image-server.ts > "$LOG_DIR/server.log" 2>&1 &
SERVER_PID=$!
echo $SERVER_PID > "$PROJECT_DIR/.server.pid"
echo "  ✓ Server started (PID: $SERVER_PID)"

# Wait for server to be ready
sleep 2

# Start frontend
echo "[2/2] Starting frontend..."
PORT=$FRONTEND_PORT npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!
echo $FRONTEND_PID > "$PROJECT_DIR/.frontend.pid"
echo "  ✓ Frontend started (PID: $FRONTEND_PID)"

echo ""
echo "=========================================="
echo "  ✓ All services started successfully!"
echo "=========================================="
echo ""
echo "Access the application at:"
echo "  http://localhost:$FRONTEND_PORT"
echo ""
echo "Log files:"
echo "  Server:   $LOG_DIR/server.log"
echo "  Frontend: $LOG_DIR/frontend.log"
echo ""
echo "To stop the services, run:"
echo "  ./bin/stop.sh"
