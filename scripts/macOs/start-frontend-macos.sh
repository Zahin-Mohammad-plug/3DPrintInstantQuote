#!/bin/bash

echo "🔹 Starting Frontend Development Server on macOS..."

# Navigate to the project root directory
PROJECT_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." &> /dev/null && pwd)

# Navigate to the frontend directory
FRONTEND_DIR="$PROJECT_ROOT/frontend"
if [ ! -d "$FRONTEND_DIR" ]; then
    echo "❌ Frontend directory not found at: $FRONTEND_DIR"
    exit 1
fi
cd "$FRONTEND_DIR" || exit 1
echo "Running frontend commands from: $(pwd)"

# Check for Node.js and npm (assuming install script ran successfully)
if ! command -v node &> /dev/null; then
    echo "❌ Node.js command not found. Please run the install-macos.sh script first."
    exit 1
fi
if ! command -v npm &> /dev/null; then
    echo "❌ npm command not found. Please run the install-macos.sh script first."
    exit 1
fi

# Optional: Ensure dependencies are installed (might have been done by install script)
# echo "Ensuring frontend dependencies are installed..."
# npm install --legacy-peer-deps
# if [ $? -ne 0 ]; then
#     echo "❌ Failed to install frontend dependencies."
#     exit 1
# fi

# Start the Next.js development server
echo "Starting Next.js development server (http://localhost:3000)..."
# Use npm run dev, assuming it's defined in frontend/package.json
npm run dev
# If no 'dev' script exists, use: npx next dev

# Note: This script will occupy the terminal unless run in the background.
# The start-all-macos.sh script will run this sequentially.
# Consider using tools like 'concurrently' or running scripts in separate terminals for parallel execution.

echo "✅ Frontend development server started."