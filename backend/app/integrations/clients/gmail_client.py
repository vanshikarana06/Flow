import httpx
from typing import Dict, Any, Optional

class GmailClient:
    BASE_URL = "https://gmail.googleapis.com/gmail/v1/users/me"

    def __init__(self, access_token: str):
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=20.0,
        )

    async def get_messages(self, params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        return await self.client.get("/messages", params=params)

    async def send_message(self, raw_message: str) -> httpx.Response:
        return await self.client.post("/messages/send", json={"raw": raw_message})

    async def close(self):
        await self.client.aclose()

