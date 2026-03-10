#!/bin/bash

# OpenClaw Office Next - Restart Script
# Usage: ./bin/restart.sh [options]

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "=========================================="
echo "  Restarting OpenClaw Office Next"
echo "=========================================="
echo ""

# Stop services
"$SCRIPT_DIR/stop.sh"

# Wait a moment
sleep 2

# Start services with any provided arguments
"$SCRIPT_DIR/start.sh" "$@"
