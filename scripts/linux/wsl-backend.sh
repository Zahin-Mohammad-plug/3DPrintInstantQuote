#!/bin/bash

echo "🔹 Starting PrusaSlicer Docker container on WSL..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "For WSL, you can either:"
    echo "1. Install Docker Desktop for Windows and enable WSL integration"
    echo "2. Install Docker directly in WSL using:"
    echo "   sudo apt update && sudo apt install -y docker.io"
    exit 1
fi

# Check if Docker service is running
if ! docker info &> /dev/null; then
    echo "❌ Docker service is not running"
    echo "If using Docker Desktop, make sure it's running"
    echo "If using Docker in WSL, start the service with:"
    echo "  sudo service docker start"
    exit 1
fi

# Stop and remove existing container if it exists
echo "Stopping any existing containers..."
docker stop prusa-slicer-container 2>/dev/null || true
docker rm prusa-slicer-container 2>/dev/null || true

# Build and start the container with verbose output
echo "Building and starting container with verbose output..."
docker compose up --build -d

# Check if container started successfully
if [ "$(docker ps -q -f name=prusa-slicer-container)" ]; then
    echo "✅ Container started successfully!"
    echo "---------------------"
    echo "📋 Container information:"
    echo "  - Name: prusa-slicer-container"
    echo "  - API: http://localhost:5000"
    echo "  - To enter container: docker exec -it prusa-slicer-container bash"
    echo "  - To view logs: docker logs -f prusa-slicer-container"
    
    # Show logs for debugging
    echo "---------------------"
    echo "📋 Container logs:"
    docker logs prusa-slicer-container
else
    echo "❌ Container failed to start"
    echo "---------------------"
    echo "📋 Build logs:"
    docker compose logs
fi

echo "---------------------"
echo "🔹 For WSL, it's recommended to run the frontend directly on Windows."
echo "Please open a Windows command prompt and run:"
echo "$(wslpath -w "$(pwd)")/windows-frontend.bat"
