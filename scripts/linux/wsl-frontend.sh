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
echo "Running Windows batch file..."
cmd.exe /c "cd $FRONTEND_PATH && npm install && npm install tailwindcss postcss autoprefixer && npx next dev"
