import hmac
import hashlib
import json
from typing import Dict, Any, Optional
import httpx
from app.core.config import get_settings
from app.email.outbound.schemas import OutboundEmailRequest, AppsScriptDeliveryResponse

class GoogleAppsScriptClient:
    def __init__(self):
        self.settings = get_settings()

    def _get_secret(self) -> str:
        return self.settings.APPSCRIPT_SHARED_SECRET or self.settings.APPSCRIPT_SECRET_KEY

    def _sign_payload(self, payload_dict: Dict[str, Any]) -> str:
        secret = self._get_secret().encode("utf-8")
        payload_bytes = json.dumps(payload_dict, sort_keys=True).encode("utf-8")
        return hmac.new(secret, payload_bytes, hashlib.sha256).hexdigest()

    async def send_email(self, request: OutboundEmailRequest) -> AppsScriptDeliveryResponse:
        url = self.settings.APPSCRIPT_WEBHOOK_URL
        payload = request.model_dump()
        payload["secret"] = self._get_secret()
        payload["to"] = payload.get("recipient_to")
        payload["body"] = payload.get("body_plain")
        signature = self._sign_payload(payload)
        payload["signature"] = signature

        headers = {
            "Content-Type": "application/json",
            "X-FLOW-Signature": signature,
        }

        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            response = await client.post(url, json=payload, headers=headers)
            
            if response.status_code != 200:
                return AppsScriptDeliveryResponse(
                    success=False,
                    flow_idempotency_key=request.idempotency_key,
                    timestamp=str(response.headers.get("date", "")),
                    error=f"Apps Script HTTP {response.status_code}: {response.text[:200]}",
                )

            data = response.json()
            return AppsScriptDeliveryResponse.model_validate(data)

