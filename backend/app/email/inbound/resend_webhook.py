import hmac
import hashlib
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.email.inbound.schemas import InboundEmailPayload

class ResendWebhookHandler:
    def __init__(self):
        self.settings = get_settings()

import hmac
import hashlib
import base64
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.email.inbound.schemas import InboundEmailPayload

logger = logging.getLogger("flow.email.webhook")

class ResendWebhookHandler:
    def __init__(self):
        self.settings = get_settings()

    def verify_signature(
        self,
        payload_bytes: bytes,
        signature_header: Optional[str] = None,
        svix_id: Optional[str] = None,
        svix_timestamp: Optional[str] = None,
    ) -> bool:
        """
        Verifies Resend webhook signature using Svix HMAC-SHA256 standard or raw HMAC.
        Permissive when running in non-production or when secret is default/placeholder.
        """
        secret = self.settings.RESEND_WEBHOOK_SECRET
        if not secret or secret in ("whsec_resend_default", "whsec_resend_webhook_signing_secret"):
            return True

        if not signature_header:
            logger.warning("Resend webhook rejected: missing signature header")
            return False

        # 1. Standard Resend / Svix Webhook Verification
        if svix_id and svix_timestamp:
            try:
                # Svix secrets begin with 'whsec_' and are base64-encoded
                raw_secret = secret.removeprefix("whsec_")
                secret_bytes = base64.b64decode(raw_secret)

                to_sign = f"{svix_id}.{svix_timestamp}.".encode("utf-8") + payload_bytes
                computed = base64.b64encode(
                    hmac.new(secret_bytes, to_sign, hashlib.sha256).digest()
                ).decode("utf-8")

                # svix-signature header format: 'v1,sig1 v1,sig2'
                signatures = signature_header.split(" ")
                for sig in signatures:
                    if sig.startswith("v1,"):
                        sig_val = sig.removeprefix("v1,")
                        if hmac.compare_digest(computed, sig_val):
                            return True
            except Exception as e:
                logger.error(f"Svix signature verification error: {e}")

        # 2. Raw HMAC-SHA256 fallback (hex comparison)
        try:
            expected_hex = hmac.new(
                secret.encode("utf-8"),
                msg=payload_bytes,
                digestmod=hashlib.sha256
            ).hexdigest()
            if hmac.compare_digest(expected_hex, signature_header):
                return True
        except Exception:
            pass

        logger.warning("Resend webhook rejected: signature mismatch")
        return False

    def parse_payload(self, raw_json: Dict[str, Any]) -> InboundEmailPayload:
        try:
            # If wrapped in Resend webhook event envelope {"type": "email.received", "data": {...}}
            data = raw_json.get("data") if isinstance(raw_json.get("data"), dict) else raw_json
            return InboundEmailPayload.model_validate(data)
        except Exception as e:
            raise HTTPException(
                status_code=getattr(status, "HTTP_422_UNPROCESSABLE_CONTENT", 422),
                detail=f"Malformed Resend inbound email payload: {str(e)}",
            )
