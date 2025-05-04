#!/bin/bash

echo "🔹 Starting Backend Docker container on macOS..."

# Navigate to the project root directory (assuming docker-compose.yml is there)
# This goes up two levels from scripts/macOs to the root
PROJECT_ROOT=$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../.." &> /dev/null && pwd)
cd "$PROJECT_ROOT" || exit 1
echo "Running Docker commands from: $(pwd)"

# Check for Docker (Assumes Docker Desktop for Mac is installed and running)
if ! command -v docker &> /dev/null; then
    echo "❌ Docker command not found. Please install Docker Desktop for Mac and ensure it's running."
    exit 1
fi
if ! docker info &> /dev/null; then
    echo "❌ Docker daemon is not running. Please start Docker Desktop."
    exit 1
fi

# Check for Docker Compose (Included with Docker Desktop)
if ! command -v docker compose &> /dev/null; then
    echo "❌ Docker Compose command not found. Ensure Docker Desktop is installed correctly."
    exit 1
fi

# Stop and remove existing container if it exists (optional, good for clean start)
echo "Stopping any existing backend containers..."
docker compose down # Use compose down to handle network/volumes if needed

# Build and start the container(s) defined in docker-compose.yml in detached mode
echo "Building and starting container(s) via Docker Compose..."
docker compose up --build -d

# Check if the primary container (adjust name if needed) started successfully
# Assuming the service name in docker-compose.yml is something like 'backend' or 'prusa-slicer'
# Let's check for the container name often derived from the directory and service name
# This is a guess, adjust '3dprintinstantquote-backend-1' or similar based on `docker ps` output
CONTAINER_NAME_PATTERN="backend" # Adjust this pattern if needed
sleep 5 # Give container a moment to start

if docker ps --filter "status=running" --format '{{.Names}}' | grep -q "$CONTAINER_NAME_PATTERN"; then
    RUNNING_CONTAINER=$(docker ps --filter "status=running" --format '{{.Names}}' | grep "$CONTAINER_NAME_PATTERN" | head -n 1)
    echo "✅ Backend container ($RUNNING_CONTAINER) appears to be running."
    echo "   API might be available at http://localhost:5000 (or configured port)"
    echo "   To view logs: docker compose logs -f"
else
    echo "❌ Backend container failed to start or is not running."
    echo "   Check Docker Compose logs:"
    docker compose logs
    exit 1
fi

echo "✅ Backend startup initiated."