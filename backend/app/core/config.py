from functools import lru_cache
from typing import List, Union
import json
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=(".env", "backend/.env", "../.env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    # Application
    APP_NAME: str = "FLOW_BACKEND"
    NODE_ENV: str = "development"
    PORT: int = 4000
    APP_URL: str = "http://localhost:4000"
    FRONTEND_URL: str = "http://localhost:3000"
    CORS_ORIGINS: Union[str, List[str]] = ["http://localhost:3000", "http://127.0.0.1:3000", "https://app.flow.dev"]

    @field_validator("CORS_ORIGINS", mode="after")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str):
            v = v.strip()
            if not v:
                return []
            if v.startswith("[") and v.endswith("]"):
                try:
                    return json.loads(v)
                except Exception:
                    pass
            return [origin.strip() for origin in v.split(",") if origin.strip()]
        return v

    # Database
    DATABASE_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/flow"
    DIRECT_URL: str = "postgresql+asyncpg://postgres:postgres@localhost:5432/flow"
    SUPABASE_URL: str = "https://example.supabase.co"
    SUPABASE_ANON_KEY: str = "anon-key"
    SUPABASE_SERVICE_ROLE_KEY: str = "service-role-key"
    SUPABASE_JWT_SECRET: str = "super-secret-jwt-token-with-minimum-32-characters"
    TOKEN_ENCRYPTION_KEY: str = "0" * 64
    SUPABASE_WEBHOOK_SECRET: str = "whsec_default"

    # Microsoft Graph (Calendars & Tasks)
    MICROSOFT_CLIENT_ID: str = "00000000-0000-0000-0000-000000000000"
    MICROSOFT_CLIENT_SECRET: str = "secret"
    MICROSOFT_TENANT_ID: str = "common"
    MICROSOFT_REDIRECT_URI: str = "https://api.flow.dev/api/v1/auth/callback/microsoft"

    # Google Workspace (Google Calendar)
    GOOGLE_CLIENT_ID: str = "google-client-id"
    GOOGLE_CLIENT_SECRET: str = "google-client-secret"
    GOOGLE_REDIRECT_URI: str = "https://api.flow.dev/api/v1/auth/callback/google"

    # Inbound Email (Resend)
    RESEND_WEBHOOK_SECRET: str = "whsec_resend_default"
    RESEND_API_KEY: str = "re_default_key"

    # Outbound Email (Google Apps Script Webhook)
    APPSCRIPT_WEBHOOK_URL: str = "https://script.google.com/macros/s/default/exec"
    APPSCRIPT_SECRET_KEY: str = "appscript_secret_default"
    APPSCRIPT_SHARED_SECRET: str = ""

    # Local AI & LLM Settings (Direct LiteLLM SDK -> Ollama)
    OLLAMA_API_BASE: str = "http://localhost:11434"
    LITELLM_BASE_URL: str = "http://localhost:11434"
    LITELLM_API_KEY: str = "sk-litellm"
    LITELLM_MODEL: str = "ollama/qwen3:8b"
    LITELLM_EMBEDDING_MODEL: str = "ollama/nomic-embed-text"
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

