#!/bin/bash

echo "Starting frontend development server for WSL..."

# Get the Windows path to the current directory
WINDOWS_PATH=$(wslpath -w "$(pwd)")

# Navigate to frontend directory
cd frontend

# Get the Windows path to the frontend directory
FRONTEND_PATH=$(wslpath -w "$(pwd)")

echo "Windows path: $FRONTEND_PATH"

# Use cmd.exe to run the Windows batch file
echo "Running Windows npm commands with --legacy-peer-deps..."
cmd.exe /c "cd $FRONTEND_PATH && npm install --legacy-peer-deps && npm install tailwindcss postcss autoprefixer --legacy-peer-deps && npx next dev"
