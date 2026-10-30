import json
import logging
import re
from typing import Dict, Any, Optional, List, Type, TypeVar
import httpx
from pydantic import BaseModel
from app.core.config import get_settings

logger = logging.getLogger("flow.ai.litellm")
T = TypeVar("T", bound=BaseModel)

class LiteLLMProvider:
    """
    Production-grade LiteLLM client for FLOW OS.
    Connects to LiteLLM Proxy (OpenAI-compatible) and handles:
    - Chat completions with temperature and token controls
    - Structured JSON generation with Pydantic validation
    - Robust retry logic with exponential backoff
    - Configurable timeouts
    """

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        settings = get_settings()
        self.base_url = (base_url or settings.LITELLM_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.LITELLM_API_KEY
        self.model = model or settings.LITELLM_MODEL
        self.timeout = timeout_seconds or (settings.LITELLM_TIMEOUT_MS / 1000.0)
        self.max_retries = max_retries or settings.LITELLM_MAX_RETRIES

    def _get_headers(self) -> Dict[str, str]:
        headers = {
            "Content-Type": "application/json",
        }
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"
        return headers

    def _extract_json_text(self, raw_text: str) -> str:
        """
        Cleans markdown code fences (```json ... ```) from LLM output.
        """
        text = raw_text.strip()
        # Extract from ```json ... ``` or ``` ... ```
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            return match.group(1).strip()
        # Or look for outermost { ... }
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        return text

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
        max_tokens: int = 2048,
        response_format: Optional[Dict[str, str]] = None,
    ) -> Dict[str, Any]:
        """
        Calls LiteLLM /chat/completions endpoint with retries.
        """
        endpoint = f"{self.base_url}/chat/completions"
        if not endpoint.startswith("http"):
            endpoint = f"http://{endpoint}"

        payload: Dict[str, Any] = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }
        if response_format:
            payload["response_format"] = response_format

        headers = self._get_headers()
        last_exception = None

        for attempt in range(1, self.max_retries + 1):
            try:
                async with httpx.AsyncClient(timeout=self.timeout) as client:
                    response = await client.post(endpoint, json=payload, headers=headers)
                    if response.status_code == 200:
                        return response.json()
                    
                    logger.warning(
                        f"LiteLLM attempt {attempt}/{self.max_retries} returned HTTP {response.status_code}: {response.text[:200]}"
                    )
            except Exception as e:
                last_exception = e
                logger.warning(f"LiteLLM attempt {attempt}/{self.max_retries} failed: {type(e).__name__} {e}")

        raise RuntimeError(f"LiteLLM chat_completion failed after {self.max_retries} attempts: {last_exception}")

    async def generate(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
        max_tokens: int = 2048,
    ) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        data = await self.chat_completion(messages, temperature=temperature, max_tokens=max_tokens)
        return data["choices"][0]["message"]["content"]

    async def generate_structured(
        self,
        prompt: str,
        schema_cls: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Forces JSON generation and parses the result into a typed Pydantic model.
        """
        json_instruction = (
            f"\nYou MUST respond with ONLY a valid JSON object strictly matching this schema:\n"
            f"{json.dumps(schema_cls.model_json_schema(), indent=2)}\n"
            f"Do not include any conversational text outside the JSON."
        )
        full_system_prompt = (system_prompt or "") + json_instruction

        messages = [
            {"role": "system", "content": full_system_prompt.strip()},
            {"role": "user", "content": prompt},
        ]

        data = await self.chat_completion(
            messages,
            temperature=temperature,
            response_format={"type": "json_object"},
        )
        raw_content = data["choices"][0]["message"]["content"]
        clean_json_str = self._extract_json_text(raw_content)

        parsed_dict = json.loads(clean_json_str)
        return schema_cls.model_validate(parsed_dict)
