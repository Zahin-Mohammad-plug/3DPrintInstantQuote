@echo off
echo Starting 3D Print Instant Quote System...

REM Start the backend
echo Starting backend...
call scripts\windows\backend.bat

REM Start the frontend
echo Starting frontend...
call scripts\windows\frontend.bat
