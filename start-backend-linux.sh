#!/bin/bash

echo "🔹 Starting PrusaSlicer Docker container..."

# Detect environment
if grep -q Microsoft /proc/version 2>/dev/null || grep -q WSL /proc/version 2>/dev/null || [ -d /mnt/c ]; then
    echo "Detected WSL environment"
    ./scripts/linux/wsl-backend.sh
    exit 0
fi

# Check if running on Windows (This check might be less reliable in Git Bash/MSYS)
if [ "$OS" = "Windows_NT" ]; then
    echo "Detected Windows environment (via OS variable)"
    # Assuming windows-backend.bat was moved and renamed
    cmd.exe /c "scripts\windows\backend.bat"
    exit 0
fi

# Default to Linux
echo "Detected Linux environment"
./scripts/linux/backend.sh
