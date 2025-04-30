#!/bin/bash

echo "🔹 Checking prerequisites for Linux/WSL..."

# Ensure script has Unix line endings (optional, but good practice)
# Consider running: sudo apt update && sudo apt install dos2unix && dos2unix install-linux.sh *.sh scripts/linux/*.sh

# Check for essential build tools
echo "🔹 Checking for build-essential..."
if ! dpkg -l | grep -q build-essential; then
    echo "❌ build-essential not found! Installing..."
    sudo apt update && sudo apt install -y build-essential
fi

echo "🔹 Checking for Docker..."
if ! command -v docker &> /dev/null; then
    echo "❌ Docker not found! Installing..."
    sudo apt update && sudo apt install -y docker.io
fi

echo "🔹 Checking for Docker Compose..."
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose not found! Installing..."
    sudo apt install -y docker-compose
fi

echo "🔹 Checking for Python3 and venv support..."
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 not found! Installing..."
    sudo apt update && sudo apt install -y python3 python3-pip
fi

# Check for python3-venv package
echo "🔹 Checking for python3-venv package..."
if ! dpkg -l | grep -q python3-venv; then
    echo "❌ python3-venv not found! Installing..."
    sudo apt update && sudo apt install -y python3-venv
fi

# Alternative check for specific Python version
PYTHON_VERSION=$(python3 --version | cut -d' ' -f2 | cut -d'.' -f1-2)
echo "🔹 Detected Python version: $PYTHON_VERSION"
if ! dpkg -l | grep -q python$PYTHON_VERSION-venv; then
    echo "❌ python$PYTHON_VERSION-venv not found! Installing..."
    sudo apt update && sudo apt install -y python$PYTHON_VERSION-venv
fi

echo "🔹 Checking for Node.js and npm..."
NODE_MAJOR=18 # Specify desired major version
if ! command -v node &> /dev/null || ! node -v | grep -q "v$NODE_MAJOR."; then
    echo "❌ Node.js v$NODE_MAJOR not found or incorrect version! Installing/Updating..."
    # Remove potential older versions installed via apt
    sudo apt-get remove -y nodejs npm
    sudo rm -f /etc/apt/sources.list.d/nodesource.list
    # Install NodeSource repository and Node.js
    curl -fsSL https://deb.nodesource.com/setup_${NODE_MAJOR}.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

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

echo "✅ Linux/WSL Installation Complete!"
echo "You can now start the services using:"
echo "   bash start-all-linux.sh"
echo "   OR individually: bash start-backend-linux.sh and bash start-frontend-linux.sh"
