#!/usr/bin/env bash
# ==============================================================================
# FLOW Model Gateway: Cloudflare Tunnel for Linux / GPU Host
# ==============================================================================
set -e

echo "=============================================================================="
echo " FLOW Model Gateway: Cloudflare Tunnel for Ollama"
echo "=============================================================================="

if ! command -v cloudflared &> /dev/null; then
    echo "[!] cloudflared not found. Installing..."
    if [ -f /etc/debian_version ]; then
        curl -fsSL https://pkg.cloudflare.com/cloudflare-main.gpg | sudo tee /usr/share/keyrings/cloudflare-main.gpg >/dev/null
        echo 'deb [signed-by=/usr/share/keyrings/cloudflare-main.gpg] https://pkg.cloudflare.com/cloudflared jammy main' | sudo tee /etc/apt/sources.list.d/cloudflared.list
        sudo apt-get update && sudo apt-get install -y cloudflared
    elif [ -f /etc/arch-release ]; then
        sudo pacman -S --noconfirm cloudflared
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        brew install cloudflared
    else
        echo "[ERROR] Unsupported OS. Please download cloudflared manually: https://github.com/cloudflare/cloudflared/releases"
        exit 1
    fi
fi

echo "[OK] cloudflared is installed: $(cloudflared --version)"
echo "Starting Cloudflare Quick Tunnel to local Ollama on port 11434..."
echo "Copy the .trycloudflare.com URL and set OLLAMA_API_BASE on Render."
echo "=============================================================================="

cloudflared tunnel --url http://localhost:11434

