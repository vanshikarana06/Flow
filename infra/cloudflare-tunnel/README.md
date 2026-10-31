# FLOW Model Layer: Cloudflare Tunnel Integration

This guide explains how to expose your local or cloud GPU Ollama / LiteLLM models to the **Render Backend** securely using **Cloudflare Tunnel**.

---

## Architecture

```
[Local / GPU Host]                      [Cloudflare Edge]              [Render Backend]
Ollama (Port 11434)  <====== Tunnel =====>  https://xxx.trycloudflare.com  <=== REST/LLM === LiteLLM Provider
(or LiteLLM Port 8000)                        (or models.yourdomain.com)                        (onrender.com)
```

**Benefits:**
- **Zero Port Forwarding:** No need to open firewall ports or expose your home IP.
- **Automatic HTTPS:** Free SSL/TLS certificates managed by Cloudflare.
- **End-to-End Encryption:** Tunnel traffic is encrypted directly between your host and Cloudflare.
- **Fast:** HTTP/2 multiplexed connections.

---

## Option A: Instant Free Quick Tunnel (Zero Domain / Setup)

Use this for instant testing or staging without owning a custom domain.

1. **Start Ollama** locally:
   ```powershell
   ollama serve
   ```
   Ensure models are pulled:
   ```powershell
   ollama pull qwen3:8b
   ollama pull nomic-embed-text
   ```

2. **Run Quick Tunnel script**:
   - On Windows: Double-click `infra/cloudflare-tunnel/start-quick-tunnel.bat` or run:
     ```powershell
     powershell -ExecutionPolicy Bypass -File infra/cloudflare-tunnel/start-quick-tunnel.ps1
     ```
   - On Linux / macOS:
     ```bash
     chmod +x infra/cloudflare-tunnel/start-tunnel.sh
     ./infra/cloudflare-tunnel/start-tunnel.sh
     ```

3. **Get Tunnel URL:**
   Cloudflare outputs a public HTTPS address like:
   ```text
   +--------------------------------------------------------------------------------------------+
   |  Your quick Tunnel has been created! Visit it at:                                          |
   |  https://ancient-sample-word.trycloudflare.com                                             |
   +--------------------------------------------------------------------------------------------+
   ```

4. **Add to Render Environment Variables:**
   ```env
   OLLAMA_API_BASE=https://ancient-sample-word.trycloudflare.com
   LITELLM_BASE_URL=https://ancient-sample-word.trycloudflare.com
   ```

---

## Option B: Permanent Named Tunnel (Custom Domain)

Use this for 24/7 production with a permanent URL (e.g. `https://models.yourdomain.com`).

1. **Authenticate Cloudflare CLI:**
   ```bash
   cloudflared tunnel login
   ```
2. **Create the Tunnel:**
   ```bash
   cloudflared tunnel create flow-models-tunnel
   ```
   Note the Tunnel UUID output.

3. **Route DNS:**
   ```bash
   cloudflared tunnel route dns flow-models-tunnel models.yourdomain.com
   ```

4. **Configure `config.yml`:**
   Copy `infra/cloudflare-tunnel/config.yml.example` to `~/.cloudflared/config.yml`, fill in your UUID and hostname (`models.yourdomain.com`).

5. **Run Tunnel as a Service:**
   ```bash
   cloudflared service install
   cloudflared service start
   ```

6. **Add to Render Environment Variables:**
   ```env
   OLLAMA_API_BASE=https://models.yourdomain.com
   LITELLM_BASE_URL=https://models.yourdomain.com
   ```

