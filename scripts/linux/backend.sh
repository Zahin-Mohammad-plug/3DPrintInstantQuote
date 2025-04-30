#!/bin/bash

echo "🔹 Starting PrusaSlicer Docker container on Linux..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed or not in PATH"
    echo "Please install Docker using:"
    echo "  sudo apt update && sudo apt install -y docker.io"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose is not installed or not in PATH"
    echo "Please install Docker Compose using:"
    echo "  sudo apt update && sudo apt install -y docker-compose"
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
echo "🔹 To start the frontend, run: ./linux-frontend.sh"
