#!/bin/bash

echo "🔹 Starting 3D Print Instant Quote System on macOS..."

# Determine the directory where the script resides
SCRIPT_DIR=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" &> /dev/null && pwd)

# Start the backend
# Assumes start-backend-macos.sh is in the same directory (SCRIPT_DIR)
echo "Starting backend..."
if [ -f "$SCRIPT_DIR/start-backend-macos.sh" ]; then
    "$SCRIPT_DIR/start-backend-macos.sh"
else
    echo "❌ start-backend-macos.sh not found in $SCRIPT_DIR"
fi

# Start the frontend
# Assumes start-frontend-macos.sh is in the same directory (SCRIPT_DIR)
echo "Starting frontend..."
if [ -f "$SCRIPT_DIR/start-frontend-macos.sh" ]; then
    "$SCRIPT_DIR/start-frontend-macos.sh"
else
    echo "❌ start-frontend-macos.sh not found in $SCRIPT_DIR"
fi

echo "✅ All services initiated (check output above for details)."