from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    # Application
    APP_NAME: str = "FLOW_BACKEND"
    NODE_ENV: str = "production"
    PORT: int = 4000
    APP_URL: str = "https://api.flow.dev"
    FRONTEND_URL: str = "https://app.flow.dev"
    CORS_ORIGINS: List[str] = ["https://app.flow.dev", "http://localhost:3000"]

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/flow"
    DIRECT_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/flow"
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_ANON_KEY: str = "anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "service-role-key"
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-token-with-minimum-32-characters"
    TOKEN_ENCRYPTION_KEY: str = "0" * 64
    SUPABASE_WEBHOOK_SECRET: str = "whsec_default"

    # Microsoft Graph
    MICROSOFT_CLIENT_ID: str = "00000000-0000-0000-0000-000000000000"
    MICROSOFT_CLIENT_SECRET: str = "secret"
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "https://api.flow.dev/api/v1/auth/callback/microsoft"

    # Google Workspace
    GOOGLE_CLIENT_ID: str = "google-client-id"
    GOOGLE_CLIENT_SECRET: str = "google-client-secret"
    GOOGLE_REDIRECT_URI: str = "https://api.flow.dev/api/v1/auth/callback/google"

    # Local AI
    LITELLM_BASE_URL: str = "http://localhost:4000"
    LITELLM_API_KEY: str = "sk-litellm"
    LITELLM_MODEL: str = "qwen2.5:7b-instruct"
    LITELLM_EMBEDDING_MODEL: str = "text-embedding-nomic"
    LITELLM_TIMEOUT_MS: int = 30000
    LITELLM_MAX_RETRIES: int = 3

    # Cloudflare Tunnel
    CF_TUNNEL_SERVICE_TOKEN_ID: str = ""
    CF_TUNNEL_SERVICE_TOKEN_SECRET: str = ""
    CF_TUNNEL_HOSTNAME: str = ""

    # Redis & Throttling
    REDIS_URL: str = "redis://localhost:6379"
    THROTTLE_TTL: int = 60
    THROTTLE_LIMIT: int = 120

@lru_cache()
def get_settings() -> Settings:
    return Settings()
