import uuid
from datetime import datetime, timezone, timedelta
from typing import Optional, Dict, Any
import jwt
from fastapi import HTTPException, status
from app.core.config import get_settings

settings = get_settings()

def create_supabase_jwt(
    user_id: uuid.UUID,
    email: str,
    expires_delta: Optional[timedelta] = None,
    aud: str = "authenticated",
    role: str = "authenticated",
) -> str:
    """
    Creates a JWT matching Supabase Auth claim format for local auth and integration tests.
    """
    now = datetime.now(timezone.utc)
    if expires_delta:
        expire = now + expires_delta
    else:
        expire = now + timedelta(hours=1)

    payload = {
        "sub": str(user_id),
        "email": email,
        "aud": aud,
        "role": role,
        "iss": f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1",
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
    }
    return jwt.encode(payload, settings.SUPABASE_JWT_SECRET, algorithm="HS256")

def decode_supabase_jwt(token: str) -> Dict[str, Any]:
    """
    Validates and decodes a Supabase JWT.
    Enforces exp, aud, iss, and sub claims.
    """
    try:
        expected_iss = f"{settings.SUPABASE_URL.rstrip('/')}/auth/v1"
        payload = jwt.decode(
            token,
            settings.SUPABASE_JWT_SECRET,
            algorithms=["HS256"],
            options={
                "verify_signature": True,
                "verify_exp": True,
                "verify_aud": False,  # Custom aud validation below
                "verify_iss": False,  # Custom iss validation below
            },
        )

        # 1. Validate Expiration (exp)
        exp = payload.get("exp")
        if not exp:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT missing required 'exp' claim",
            )
        if datetime.fromtimestamp(exp, tz=timezone.utc) < datetime.now(timezone.utc):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
            )

        # 2. Validate Subject (sub)
        sub = payload.get("sub")
        if not sub:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT missing required 'sub' claim",
            )
        try:
            uuid.UUID(str(sub))
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT 'sub' claim is not a valid UUID",
            )

        # 3. Validate Audience (aud)
        aud = payload.get("aud")
        if not aud or aud != "authenticated":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid JWT 'aud' claim: expected 'authenticated', got '{aud}'",
            )

        # 4. Validate Issuer (iss)
        iss = payload.get("iss")
        if not iss:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="JWT missing required 'iss' claim",
            )
        # Accept either configured supabase URL auth endpoint or generic 'supabase'
        valid_issuers = {expected_iss, "supabase", "https://example.supabase.co/auth/v1"}
        if iss not in valid_issuers and not iss.endswith("/auth/v1"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid JWT 'iss' claim: '{iss}'",
            )

        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired",
        )
    except jwt.InvalidTokenError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
        )
