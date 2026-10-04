@echo off
title Push GDG Event Platform to GitHub
color 0a
echo ===================================================
echo     Pushing GDG Event Platform to GitHub
echo     Target: https://github.com/humangds-hash/gdgoc_fiem-event-platform
echo ===================================================
echo.
cd /d C:\Users\User\GDG

echo 1. Verifying Git remote...
git remote set-url origin https://github.com/humangds-hash/gdgoc_fiem-event-platform.git
git branch -M main

echo.
echo 2. Pushing all files to branch 'main'...
echo (If a GitHub sign-in window opens, click "Sign in with your browser")
echo.
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ===================================================
    echo [SUCCESS] Code is live on GitHub!
    echo URL: https://github.com/humangds-hash/gdgoc_fiem-event-platform
    echo Next step: Deploy to Vercel (https://vercel.com)
    echo ===================================================
) else (
    echo.
    echo [ERROR] Push failed or was canceled.
)

pause
