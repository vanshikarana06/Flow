import json
import logging
from typing import Dict, Any, Optional, List, Type, TypeVar
import httpx
from pydantic import BaseModel
from app.core.config import get_settings

logger = logging.getLogger("flow.ai.ollama")
T = TypeVar("T", bound=BaseModel)

class OllamaProvider:
    """
    Direct Ollama API Client.
    Communicates directly with local Ollama runtime on http://localhost:11434.
    """

    def __init__(
        self,
        base_url: str = "http://localhost:11434",
        model: Optional[str] = None,
        timeout_seconds: float = 60.0,
    ):
        settings = get_settings()
        self.base_url = base_url.rstrip("/")
        self.model = model or settings.LITELLM_MODEL
        self.timeout = timeout_seconds

    async def chat(
        self,
        messages: List[Dict[str, str]],
        format: Optional[str] = None,
        temperature: float = 0.1,
    ) -> Dict[str, Any]:
        endpoint = f"{self.base_url}/api/chat"
        payload = {
            "model": self.model,
            "messages": messages,
            "stream": False,
            "options": {"temperature": temperature},
        }
        if format:
            payload["format"] = format

        async with httpx.AsyncClient(timeout=self.timeout) as client:
            response = await client.post(endpoint, json=payload)
            response.raise_for_status()
            return response.json()

    async def generate_structured(
        self,
        prompt: str,
        schema_cls: Type[T],
        system_prompt: Optional[str] = None,
    ) -> T:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = await self.chat(messages, format="json")
        raw_content = data["message"]["content"]
        parsed = json.loads(raw_content)
        return schema_cls.model_validate(parsed)
