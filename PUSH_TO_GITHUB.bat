@echo off
title Push GDG Project to GitHub
color 0a
echo ===================================================
echo     Push GDG Event Platform to GitHub
echo ===================================================
echo.
cd /d %~dp0

echo 1. Checking Git status...
git status -s

echo.
set /p REPO_URL="Enter your GitHub Repository URL (e.g. https://github.com/username/gdg-platform.git): "
if "%REPO_URL%"=="" (
    echo [ERROR] No GitHub URL provided. Exiting.
    pause
    exit /b 1
)

echo.
echo 2. Configuring Git and staging files...
git branch -M main
git remote remove origin 2>nul
git remote add origin %REPO_URL%

git add .
git commit -m "Deploy: GDG Event Platform & Check-in System" 2>nul

echo.
echo 3. Pushing code to GitHub (main branch)...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] Your code is live on GitHub!
    echo Next step: Deploy to Vercel (https://vercel.com)
    echo ===================================================
) else (
    echo.
    echo [NOTE] If prompted for credentials, sign in with your GitHub account.
)

pause
