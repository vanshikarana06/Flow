@echo off
title FLOW - Cloudflare Quick Tunnel for Ollama Models
echo ==============================================================================
echo  FLOW Model Gateway: Cloudflare Quick Tunnel
echo ==============================================================================
echo.
echo Checking cloudflared installation...

where cloudflared >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] cloudflared CLI is not found on your system PATH!
    echo.
    echo Please install cloudflared using winget or direct download:
    echo   winget install Cloudflare.cloudflared
    echo.
    pause
    exit /b 1
)

echo [OK] cloudflared found!
echo Starting HTTPS Quick Tunnel to Ollama (http://localhost:11434)...
echo.
echo Look for the public URL ending with: .trycloudflare.com
echo Copy that URL into your Render backend environment as:
echo   OLLAMA_API_BASE=https://xxxx-xxxx.trycloudflare.com
echo ==============================================================================
echo.

cloudflared tunnel --url http://localhost:11434
pause

