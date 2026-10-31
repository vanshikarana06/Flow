#!/usr/bin/env bash
# ==============================================================================
# Render Production Entrypoint for FLOW Backend
# ==============================================================================
set -e

echo "=== Starting FLOW Backend on Render ==="
echo "Runtime: Python $(python --version)"
echo "Port: ${PORT:-4000}"

# 1. Run Alembic Database Migrations (Supabase PostgreSQL)
echo "Checking and applying database migrations..."
if alembic upgrade head; then
    echo "[OK] Alembic database migrations up to date."
else
    echo "[WARNING] Alembic upgrade encountered an issue or database is already current. Proceeding to server boot."
fi

# 2. Boot Uvicorn with Production Configuration
echo "Booting FastAPI Uvicorn server on 0.0.0.0:${PORT:-4000}..."
exec uvicorn app.main:app \
    --host 0.0.0.0 \
    --port "${PORT:-4000}" \
    --workers 1 \
    --proxy-headers \
    --forwarded-allow-ips "*" \
    --timeout-keep-alive 75

