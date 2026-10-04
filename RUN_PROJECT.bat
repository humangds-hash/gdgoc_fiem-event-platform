@echo off
title GDG Event Platform Launcher
color 0b
echo ===================================================
echo     Google Developer Group Event Platform
echo ===================================================
echo.
cd /d "%~dp0"

if not exist node_modules (
    echo [1/2] Installing dependencies for first-time use...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] npm install failed. Please check your internet connection.
        pause
        exit /b %errorlevel%
    )
)

echo [2/2] Starting Next.js Local Server...
echo Website will open at http://localhost:3000
echo Admin Portal at http://localhost:3000/admin
echo.
start http://localhost:3000
call npm run dev
pause
