#!/bin/bash

echo "🔹 Starting frontend development server..."

# Detect environment
if grep -q Microsoft /proc/version 2>/dev/null || grep -q WSL /proc/version 2>/dev/null || [ -d /mnt/c ]; then
    echo "Detected WSL environment"
    # Using the moved WSL script
    ./scripts/linux/wsl-frontend.sh
    exit 0
fi

# Check if running on Windows (This check might be less reliable in Git Bash/MSYS)
if [ "$OS" = "Windows_NT" ]; then
    echo "Detected Windows environment (via OS variable)"
    echo "Running Windows batch file..."
    # Assuming windows-frontend.bat was moved and renamed
    cmd.exe /c "scripts\windows\frontend.bat"
    exit 0
fi

# Default to Linux
echo "Detected Linux environment"
# Using the moved Linux script
./scripts/linux/frontend.sh
