import hmac
import hashlib
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.email.inbound.schemas import InboundEmailPayload

class ResendWebhookHandler:
    def __init__(self):
        self.settings = get_settings()

    def verify_signature(self, payload_bytes: bytes, signature_header: Optional[str]) -> bool:
        """
        Verifies Resend webhook signature using HMAC-SHA256 with RESEND_WEBHOOK_SECRET.
        """
        secret = self.settings.RESEND_WEBHOOK_SECRET
        if not secret or secret == "whsec_resend_default":
            # Permissive in dev/testing mode if secret not configured
            return True
            
        if not signature_header:
            return False

        expected_sig = hmac.new(
            secret.encode("utf-8"),
            msg=payload_bytes,
            digestmod=hashlib.sha256
        ).hexdigest()

        # Handle Svix or hex formats
        return hmac.compare_digest(expected_sig, signature_header)

    def parse_payload(self, raw_json: Dict[str, Any]) -> InboundEmailPayload:
        try:
            return InboundEmailPayload.model_validate(raw_json)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail=f"Malformed Resend inbound email payload: {str(e)}",
            )
