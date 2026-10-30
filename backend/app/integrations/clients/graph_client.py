import httpx
from typing import Dict, Any, Optional

class MicrosoftGraphClient:
    BASE_URL = "https://graph.microsoft.com/v1.0"

    def __init__(self, access_token: str):
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=20.0,
        )

    async def get(self, endpoint: str, params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        return await self.client.get(endpoint, params=params)

    async def post(self, endpoint: str, json: Dict[str, Any]) -> httpx.Response:
        return await self.client.post(endpoint, json=json)

    async def patch(self, endpoint: str, json: Dict[str, Any]) -> httpx.Response:
        return await self.client.patch(endpoint, json=json)

    async def delete(self, endpoint: str) -> httpx.Response:
        return await self.client.delete(endpoint)

    async def close(self):
        await self.client.aclose()
