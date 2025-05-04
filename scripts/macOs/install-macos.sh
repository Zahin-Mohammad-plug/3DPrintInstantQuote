#!/bin/bash
# This script is experimental and may not work as expected. Use at your own risk.
echo "🔹 Checking prerequisites for macOS..."

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "❌ Homebrew not found. Please install it from https://brew.sh/"
    exit 1
fi

# Update Homebrew
echo "🔹 Updating Homebrew..."
brew update

# Check for Docker (Assumes Docker Desktop for Mac is installed)
echo "🔹 Checking for Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker command not found. Please install Docker Desktop for Mac from https://www.docker.com/products/docker-desktop/ and ensure it's running."
    exit 1
fi
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

# Check for Docker Compose (Included with Docker Desktop)
echo "🔹 Checking for Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose command not found. Ensure Docker Desktop is installed correctly."
    exit 1
fi

# Check for Python 3
echo "🔹 Checking for Python 3..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 not found. Installing via Homebrew..."
    brew install python3
fi
# Ensure pip is available
if ! command -v pip3 &> /dev/null; then
     echo "❌ pip3 not found. Please ensure Python 3 is installed correctly."
     exit 1
fi
# Check venv (usually included, but good practice)
python3 -m venv --help > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "❌ Python 3 venv module seems missing. Reinstalling Python via Homebrew might help."
    brew reinstall python3
fi

# Check for Node.js (e.g., v18)
echo "🔹 Checking for Node.js v18..."
NODE_MAJOR=18
# Check if the correct version is already linked and available
if ! command -v node &> /dev/null || ! node -v | grep -q "v$NODE_MAJOR."; then
    echo "❌ Node.js v$NODE_MAJOR not found or not linked. Attempting installation/linking via Homebrew..."
    # Check if the specific version formula is installed, even if not linked
    if ! brew list node@$NODE_MAJOR &> /dev/null; then
        echo "   Installing node@$NODE_MAJOR..."
        brew install node@$NODE_MAJOR
        if [ $? -ne 0 ]; then
            echo "❌ Failed to install node@$NODE_MAJOR via Homebrew."
            exit 1
        fi
    else
        echo "   node@$NODE_MAJOR is installed, attempting to link..."
    fi

    # Attempt to link the installed version
    brew link --overwrite node@$NODE_MAJOR
    if [ $? -ne 0 ]; then
        echo "❌ Failed to link node@$NODE_MAJOR. Manual linking might be required:"
        echo "   brew link --overwrite node@$NODE_MAJOR"
        echo "   Also ensure /opt/homebrew/bin is in your PATH." # Adjust path if Homebrew installed elsewhere
        exit 1
    fi
    echo "✅ node@$NODE_MAJOR linked."

    # Final check after linking
    if ! command -v node &> /dev/null || ! node -v | grep -q "v$NODE_MAJOR."; then
       echo "❌ Node.js v$NODE_MAJOR still not found in PATH after linking. Check Homebrew setup and PATH configuration."
       exit 1
    fi
fi
echo "✅ Node.js v$NODE_MAJOR found."

# Install frontend dependencies
echo "🔹 Installing frontend dependencies..."
if [ -d "frontend" ]; then
    cd frontend
    echo "Running npm install --legacy-peer-deps in $(pwd)..."
    # Clean potential conflicting lock files/modules first
    rm -f package-lock.json pnpm-lock.yaml
    rm -rf node_modules
    npm install --legacy-peer-deps
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install frontend dependencies. Check npm output above."
        cd ..
        exit 1
    fi
    echo "✅ Frontend dependencies installed."
    cd ..
else
    echo "⚠️ Frontend directory not found! Skipping frontend dependency installation."
fi

# Build backend Docker image (optional pre-build)
echo "🔹 Pre-building backend Docker image (this might take a while)..."
docker compose build
if [ $? -ne 0 ]; then
    echo "❌ Failed to build backend Docker image. Check Docker output above."
    exit 1
fi
echo "✅ Backend Docker image built."

echo "✅ macOS Installation Complete!"
echo "You can now try starting the services using appropriate start scripts (you might need macOS-specific start scripts too)."
