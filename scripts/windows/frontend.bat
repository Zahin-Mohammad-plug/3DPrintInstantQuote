@echo off
echo Starting frontend development server for Windows...

cd frontend

echo Checking dependencies (using --legacy-peer-deps)...
call npm install --legacy-peer-deps

REM The explicit tailwind install might be redundant if it's in package.json, but keep for now
echo Checking Tailwind CSS (using --legacy-peer-deps)...
call npm install tailwindcss postcss autoprefixer --legacy-peer-deps

echo Starting Next.js development server...
call npx next dev
