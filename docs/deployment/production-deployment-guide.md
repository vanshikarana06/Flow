# FLOW Production 3-Tier Infrastructure & Deployment Guide

This guide details the complete deployment architecture for hosting FLOW across three coordinated infrastructure tiers:

1. **Model Layer (Ollama / LiteLLM):** Hosted on local GPU or cloud compute and exposed via **Cloudflare Tunnel**.
2. **Backend Services & Workflows:** Hosted as a Python Web Service on **Render**.
3. **Frontend Application:** Hosted as an optimized Next.js 15 application on **Vercel**.

---

## 1. High-Level Architecture Topology

```mermaid
flowchart TD
    subgraph Client["Client Tier"]
        Browser["User Browser / Desktop"]
    end

    subgraph VercelTier["Tier 3: Vercel (Frontend)"]
        NextApp["Next.js 15 App Router\n(flow-frontend.vercel.app)"]
    end

    subgraph RenderTier["Tier 2: Render.com (Backend)"]
        FastAPI["FastAPI / Uvicorn Server\n(flow-backend.onrender.com)"]
        AgentEngine["FLOW Agent Runtime &\nIntent Orchestrator"]
        TrustGate["Zero-Trust Approval Center"]
        Scheduler["APScheduler Background Worker"]
    end

    subgraph ExternalServices["Cloud Persistence & Messaging"]
        SupabaseDB[("Supabase PostgreSQL\n(PgVector + Pooler :6543)")]
        GAS["Google Apps Script Gateway\n(Gmail Webhook + HMAC)"]
    end

    subgraph ModelTier["Tier 1: Cloudflare Tunnel (AI Models)"]
        CFTunnel["Cloudflare Tunnel\n(https://xxx.trycloudflare.com\nor models.yourdomain.com)"]
        OllamaLocal["Ollama Daemon (:11434)\nqwen3:8b & nomic-embed-text"]
    end

    Browser -->|HTTPS| NextApp
    NextApp -->|REST & WS /api/v1| FastAPI
    FastAPI --> AgentEngine
    AgentEngine --> TrustGate
    FastAPI -->|PgVector / SQLAlchemy| SupabaseDB
    TrustGate -->|Dispatched on Approval| GAS
    AgentEngine -->|LiteLLM Provider HTTPS| CFTunnel
    CFTunnel --> OllamaLocal
```

---

## Tier 1: Model Layer via Cloudflare Tunnel

Your AI inference engine (`ollama/qwen3:8b` and embeddings `ollama/nomic-embed-text`) runs on your local GPU workstation or a dedicated GPU VPS (RunPod, Lambda, etc.) and is exposed securely via Cloudflare Tunnel.

### Option A: Free Quick Tunnel (Zero Setup / Instant URL)
1. Verify Ollama is running:
   ```bash
   ollama serve
   ```
2. Pull required models:
   ```bash
   ollama pull qwen3:8b
   ollama pull nomic-embed-text
   ```
3. Start the tunnel:
   - **Windows:** Double-click `infra/cloudflare-tunnel/start-quick-tunnel.bat` or run:
     ```powershell
     powershell -ExecutionPolicy Bypass -File infra/cloudflare-tunnel/start-quick-tunnel.ps1
     ```
   - **Linux / macOS:**
     ```bash
     chmod +x infra/cloudflare-tunnel/start-tunnel.sh
     ./infra/cloudflare-tunnel/start-tunnel.sh
     ```
4. Note your public HTTPS address from the terminal:
   ```text
   https://random-words.trycloudflare.com
   ```

### Option B: Named Tunnel with Custom Domain
1. Log in: `cloudflared tunnel login`
2. Create tunnel: `cloudflared tunnel create flow-models-tunnel`
3. Route DNS: `cloudflared tunnel route dns flow-models-tunnel models.yourdomain.com`
4. Use `infra/cloudflare-tunnel/config.yml.example` to configure:
   ```yaml
   tunnel: <TUNNEL_UUID>
   credentials-file: ~/.cloudflared/<TUNNEL_UUID>.json
   ingress:
     - hostname: models.yourdomain.com
       service: http://localhost:11434
     - service: http_status:404
   ```
5. Run as service: `cloudflared service install && cloudflared service start`

### Tier 1 Environment Variables (`infra/cloudflare-tunnel/.env.models.example`)
```env
OLLAMA_HOST=0.0.0.0:11434
OLLAMA_ORIGINS=*
OLLAMA_KEEP_ALIVE=24h
```

---

## Tier 2: Backend Services on Render

Render hosts the FastAPI application, Agent Orchestration engine, Trust Approval Center, and APScheduler background tasks.

### Step 1: Deploy on Render via Blueprint or Dashboard

#### Method 1: Render Blueprint (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/) -> **Blueprints** -> **New Blueprint Instance**.
2. Connect your Git repository. Render will automatically detect [`render.yaml`](../../render.yaml) at root.
3. Fill in the non-synced secret environment variables when prompted.

#### Method 2: Manual Web Service
1. **New Web Service** -> Select your repo.
2. Settings:
   - **Name:** `flow-backend`
   - **Runtime:** `Python 3` (or `Docker`)
   - **Root Directory:** `backend`
   - **Build Command:** `pip install --upgrade pip && pip install -r requirements.txt`
   - **Start Command:** `chmod +x ./scripts/start-render.sh && ./scripts/start-render.sh`
   - **Health Check Path:** `/health`
   - **Plan:** `Starter` ($7/mo - required for background execution & persistent connections)

### Step 2: Configure Render Environment Variables (`backend/.env.render.example`)

| Variable | Description | Example / Recommended Value |
|---|---|---|
| `NODE_ENV` | Application environment | `production` |
| `APP_NAME` | Backend name identifier | `FLOW_BACKEND` |
| `DATABASE_URL` | Supabase Session/Tx Pooler (:6543) | `postgresql+asyncpg://postgres.[ref]:[pass]@aws-0-ap-northeast-1.pooler.supabase.com:6543/postgres?ssl=require` |
| `DIRECT_URL` | Supabase Direct Connection (:5432) | `postgresql+asyncpg://postgres.[ref]:[pass]@aws-0-ap-northeast-1.pooler.supabase.com:5432/postgres?ssl=require` |
| `SUPABASE_URL` | Supabase Project API URL | `https://[ref].supabase.co` |
| `SUPABASE_ANON_KEY` | Public anonymous key | `eyJhbGci...` |
| `SUPABASE_SERVICE_ROLE_KEY` | Elevated service role key | `eyJhbGci...` |
| `SUPABASE_JWT_SECRET` | 32+ char JWT signature key | `your-supabase-jwt-secret` |
| `TOKEN_ENCRYPTION_KEY` | 64-hex char encryption key | `64-hex-characters` |
| `OLLAMA_API_BASE` | Cloudflare Tunnel URL (Tier 1) | `https://random-words.trycloudflare.com` |
| `LITELLM_BASE_URL` | Cloudflare Tunnel URL (Tier 1) | `https://random-words.trycloudflare.com` |
| `LITELLM_MODEL` | AI inference model | `ollama/qwen3:8b` |
| `LITELLM_EMBEDDING_MODEL` | Vector embedding model | `ollama/nomic-embed-text` |
| `LITELLM_TIMEOUT_MS` | Network timeout for AI inference | `30000` |
| `APPSCRIPT_WEBHOOK_URL` | Google Apps Script deployment URL | `https://script.google.com/macros/s/.../exec` |
| `APPSCRIPT_SECRET_KEY` | HMAC SHA-256 webhook secret | `your-appscript-secret-key` |
| `FRONTEND_URL` | Vercel production frontend URL | `https://flow-frontend.vercel.app` |
| `CORS_ORIGINS` | Allowed origins (JSON array) | `["https://flow-frontend.vercel.app","https://*.vercel.app","http://localhost:3000"]` |

---

## Tier 3: Frontend on Vercel

Vercel hosts the Next.js 15 App Router frontend with static optimization, client state persistence, and responsive UI.

### Step 1: Deploy on Vercel
1. Go to [Vercel Dashboard](https://vercel.com/) -> **Add New Project** -> Import your Git repository.
2. In Project Configuration:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click `Edit` and select `frontend`
   - **Build Command:** `next build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

### Step 2: Configure Vercel Environment Variables (`frontend/.env.vercel.example`)

| Variable | Description | Value |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Public Render backend API URL | `https://flow-backend.onrender.com/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Vercel public URL | `https://flow-frontend.vercel.app` |

---

## Verification & End-to-End Checklist

Once all three tiers are deployed:

1. **Verify Tier 1 (Cloudflare Tunnel to Ollama):**
   ```bash
   curl -s https://<your-tunnel-url>/api/tags
   ```
   *Expected Response:* JSON listing `qwen3:8b` and `nomic-embed-text`.

2. **Verify Tier 2 (Render Backend Health):**
   ```bash
   curl -s https://<your-render-backend>.onrender.com/health
   ```
   *Expected Response:* `{"status": "HEALTHY", "service": "FLOW_BACKEND", ...}`

3. **Verify Tier 3 (Frontend Web App):**
   - Open `https://<your-project>.vercel.app` in your browser.
   - Navigate to `/login`, log in with your credentials.
   - Open the **Copilot Drawer** and submit:
     ```text
     draft a mail that is going to be sended to cometosatyam2@gmail.com add that we have schedule a meating on how to buy groceries tomorrow morning
     ```
   - Verify that:
     1. Agent reasoning displays model inference through Cloudflare Tunnel.
     2. An approval card is staged in the Approval Center (`/approvals`).
     3. Clicking **Authorize & Execute** triggers Google Apps Script email dispatch with real Gmail message ID.

