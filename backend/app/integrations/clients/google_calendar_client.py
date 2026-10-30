import httpx
from typing import Dict, Any, Optional

class GoogleCalendarClient:
    BASE_URL = "https://www.googleapis.com/calendar/v3"

    def __init__(self, access_token: str):
        self.client = httpx.AsyncClient(
            base_url=self.BASE_URL,
            headers={
                "Authorization": f"Bearer {access_token}",
                "Content-Type": "application/json",
            },
            timeout=20.0,
        )

    async def list_events(self, calendar_id: str = "primary", params: Optional[Dict[str, Any]] = None) -> httpx.Response:
        return await self.client.get(f"/calendars/{calendar_id}/events", params=params)

    async def insert_event(self, event_data: Dict[str, Any], calendar_id: str = "primary") -> httpx.Response:
        return await self.client.post(f"/calendars/{calendar_id}/events", json=event_data)

    async def patch_event(self, event_id: str, event_data: Dict[str, Any], calendar_id: str = "primary") -> httpx.Response:
        return await self.client.patch(f"/calendars/{calendar_id}/events/{event_id}", json=event_data)

    async def close(self):
        await self.client.aclose()

