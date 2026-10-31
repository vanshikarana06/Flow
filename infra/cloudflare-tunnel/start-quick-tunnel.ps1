# ==============================================================================
# FLOW Model Gateway: Cloudflare Quick Tunnel (PowerShell)
# ==============================================================================

Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host " FLOW Model Gateway: Cloudflare Quick Tunnel for Ollama" -ForegroundColor Cyan
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

$cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue

if (-not $cloudflared) {
    Write-Host "[!] cloudflared CLI was not detected on your PATH." -ForegroundColor Yellow
    Write-Host "Installing cloudflared via winget..." -ForegroundColor White
    winget install --id Cloudflare.cloudflared -e --source winget
    $cloudflared = Get-Command cloudflared -ErrorAction SilentlyContinue
    if (-not $cloudflared) {
        Write-Host "[ERROR] Could not install cloudflared automatically. Download from: https://github.com/cloudflare/cloudflared/releases" -ForegroundColor Red
        return
    }
}

Write-Host "[OK] cloudflared CLI verified: $($cloudflared.Source)" -ForegroundColor Green
Write-Host ""
Write-Host "Verifying local Ollama connectivity on http://localhost:11434..." -ForegroundColor White

try {
    $resp = Invoke-RestMethod -Uri "http://localhost:11434/api/tags" -TimeoutSec 3 -ErrorAction Stop
    $models = $resp.models | ForEach-Object { $_.name }
    Write-Host "[OK] Ollama is active with models: $($models -join ', ')" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Local Ollama on port 11434 is not currently responding." -ForegroundColor Yellow
    Write-Host "Make sure Ollama is running: 'ollama serve' or start the Ollama desktop app." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Starting Cloudflare HTTPS Quick Tunnel..." -ForegroundColor Cyan
Write-Host "Look for the public URL ending in .trycloudflare.com below." -ForegroundColor White
Write-Host "Copy that URL and paste it into your Render Backend Dashboard as OLLAMA_API_BASE" -ForegroundColor White
Write-Host "==============================================================================" -ForegroundColor Cyan
Write-Host ""

& cloudflared tunnel --url http://localhost:11434

