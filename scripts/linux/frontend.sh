#!/bin/bash

echo "Starting frontend development server for Linux..."

# Navigate to frontend directory
cd frontend

# Ensure dependencies are installed
echo "Checking dependencies..."
npm install

# Ensure Tailwind CSS is installed
echo "Checking Tailwind CSS..."
npm install tailwindcss postcss autoprefixer

# Start the development server
echo "Starting Next.js development server..."
npx next dev
