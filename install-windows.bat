@echo off
echo Starting Windows Installation...

REM Check for Node.js and npm
echo Checking for Node.js and npm...
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Node.js is not installed or not in PATH. Please install it from https://nodejs.org/
    exit /b 1
)
where npm >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo npm is not installed or not in PATH. This should come with Node.js.
    exit /b 1
)
echo Node.js and npm found.

REM Check for Docker
echo Checking for Docker...
where docker >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker is not installed or not in PATH. Please install Docker Desktop for Windows.
    exit /b 1
)
docker info > nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo Docker Desktop is not running. Please start Docker Desktop.
    exit /b 1
)
echo Docker found and running.

REM Clean potential pnpm lock file and old modules
echo Cleaning up frontend directory...
cd frontend
del pnpm-lock.yaml 2>nul
rmdir /s /q node_modules 2>nul
cd ..

REM Install frontend dependencies
echo Installing frontend dependencies (using --legacy-peer-deps)...
cd frontend
call npm install --legacy-peer-deps
cd ..
if %ERRORLEVEL% NEQ 0 (
    echo Failed to install frontend dependencies. Check npm output above.
    exit /b 1
)
echo Frontend dependencies installed.

REM Build the backend Docker image (optional, but good to do once)
echo Pre-building backend Docker image (this might take a while)...
docker compose build
if %ERRORLEVEL% NEQ 0 (
    echo Failed to build backend Docker image. Check Docker output above.
    exit /b 1
)
echo Backend Docker image built.

echo Installation complete!
echo You can now start the services using:
echo   - start-all-windows.bat
echo   - OR individually: scripts\windows\backend.bat and scripts\windows\frontend.bat
