@echo off
echo Starting PrusaSlicer Docker container on Windows...

REM Check if Docker is installed
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH
    echo Please install Docker Desktop for Windows
    exit /b 1
)

REM Stop and remove existing container if it exists
echo Stopping any existing containers...
docker stop prusa-slicer-container 2>nul
docker rm prusa-slicer-container 2>nul

REM Build and start the container with verbose output
echo Building and starting container with verbose output...
docker compose up --build -d

REM Check if container started successfully
docker ps -q -f name=prusa-slicer-container >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    echo Container started successfully!
    echo ---------------------
    echo Container information:
    echo   - Name: prusa-slicer-container
    echo   - API: http://localhost:5000
    echo   - To enter container: docker exec -it prusa-slicer-container bash
    echo   - To view logs: docker logs -f prusa-slicer-container
    
    REM Show logs for debugging
    echo ---------------------
    echo Container logs:
    docker logs prusa-slicer-container
) else (
    echo Container failed to start
    echo ---------------------
    echo Build logs:
    docker compose logs
)

echo ---------------------
echo To start the frontend, run: windows-frontend.bat
