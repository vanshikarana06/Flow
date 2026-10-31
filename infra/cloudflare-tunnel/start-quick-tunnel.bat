@echo off
title FLOW - Cloudflare Quick Tunnel for Ollama Models
echo ==============================================================================
echo  FLOW Model Gateway: Cloudflare Quick Tunnel
echo ==============================================================================
echo.
echo Checking cloudflared installation...

where cloudflared >nul 2>nul
if %ERRORLEVEL% EQU 0 (
    set "CLOUDFLARED_BIN=cloudflared"
) else if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
    set "CLOUDFLARED_BIN=C:\Program Files (x86)\cloudflared\cloudflared.exe"
) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
    set "CLOUDFLARED_BIN=C:\Program Files\cloudflared\cloudflared.exe"
) else (
    echo [ERROR] cloudflared CLI is not found on your system PATH!
    echo.
    echo Installing cloudflared via winget now...
    winget install --id Cloudflare.cloudflared -e --source winget --accept-source-agreements --accept-package-agreements
    if exist "C:\Program Files (x86)\cloudflared\cloudflared.exe" (
        set "CLOUDFLARED_BIN=C:\Program Files (x86)\cloudflared\cloudflared.exe"
    ) else if exist "C:\Program Files\cloudflared\cloudflared.exe" (
        set "CLOUDFLARED_BIN=C:\Program Files\cloudflared\cloudflared.exe"
    ) else (
        echo [ERROR] Please restart your terminal or download manually from:
        echo https://github.com/cloudflare/cloudflared/releases
        pause
        exit /b 1
    )
)

echo [OK] Using cloudflared: "%CLOUDFLARED_BIN%"
echo Starting HTTPS Quick Tunnel to Ollama (http://localhost:11434)...
echo.
echo Look for the public URL ending with: .trycloudflare.com
echo Copy that URL into your Render backend environment as:
echo   OLLAMA_API_BASE=https://xxxx-xxxx.trycloudflare.com
echo ==============================================================================
echo.

"%CLOUDFLARED_BIN%" tunnel --url http://localhost:11434
pause

