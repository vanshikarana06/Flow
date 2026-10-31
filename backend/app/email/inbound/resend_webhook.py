import hmac
import hashlib
import base64
import logging
from typing import Dict, Any, Optional
from fastapi import HTTPException, status
from app.core.config import get_settings
from app.email.inbound.schemas import InboundEmailPayload

try:
    from svix.webhooks import Webhook, WebhookVerificationError
    HAS_SVIX = True
except ImportError:
    HAS_SVIX = False

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
        headers: Optional[Dict[str, str]] = None,
    ) -> bool:
        """
        Verifies Resend webhook signature using Svix HMAC-SHA256 standard or raw HMAC.
        Permissive when running in non-production or when secret is default/placeholder.
        """
        secret = (self.settings.RESEND_WEBHOOK_SECRET or "").strip()
        if not secret or secret in ("whsec_resend_default", "whsec_resend_webhook_signing_secret"):
            return True

        # Extract headers from dictionary if provided
        norm_headers: Dict[str, str] = {}
        if headers:
            for k, v in headers.items():
                norm_headers[k.lower()] = v

        id_val = svix_id or norm_headers.get("svix-id") or norm_headers.get("webhook-id")
        ts_val = svix_timestamp or norm_headers.get("svix-timestamp") or norm_headers.get("webhook-timestamp")
        sig_val = signature_header or norm_headers.get("svix-signature") or norm_headers.get("webhook-signature")

        if not sig_val:
            logger.warning("Resend webhook rejected: missing signature header")
            return False

        # 1. Official Svix SDK verification
        if HAS_SVIX and id_val and ts_val:
            try:
                verify_headers = {
                    "svix-id": id_val,
                    "svix-timestamp": ts_val,
                    "svix-signature": sig_val,
                }
                wh = Webhook(secret)
                wh.verify(payload_bytes, verify_headers)
                return True
            except Exception as e:
                logger.debug(f"Official Svix verification failed: {e}")

        # 2. Manual Svix HMAC-SHA256 verification
        if id_val and ts_val:
            try:
                raw_secret = secret.removeprefix("whsec_")
                secret_bytes = base64.b64decode(raw_secret)
                to_sign = f"{id_val}.{ts_val}.".encode("utf-8") + payload_bytes
                computed = base64.b64encode(
                    hmac.new(secret_bytes, to_sign, hashlib.sha256).digest()
                ).decode("utf-8")

                signatures = sig_val.split(" ")
                for sig in signatures:
                    if sig.startswith("v1,"):
                        s = sig.removeprefix("v1,")
                        if hmac.compare_digest(computed, s):
                            return True
            except Exception as e:
                logger.error(f"Manual Svix signature verification error: {e}")

        # 3. Raw HMAC-SHA256 fallback (hex comparison)
        try:
            expected_hex = hmac.new(
                secret.encode("utf-8"),
                msg=payload_bytes,
                digestmod=hashlib.sha256
            ).hexdigest()
            if hmac.compare_digest(expected_hex, sig_val):
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
