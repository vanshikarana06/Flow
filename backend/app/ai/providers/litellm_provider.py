import json
import logging
import re
from typing import Dict, Any, Optional, List, Type, TypeVar
import litellm
from pydantic import BaseModel, ValidationError

from app.core.config import get_settings

# Disable litellm verbose telemetry
litellm.telemetry = False

logger = logging.getLogger("flow.ai.litellm")
T = TypeVar("T", bound=BaseModel)

class LiteLLMProvider:
    """
    Production-grade client utilizing the LiteLLM Python SDK directly.
    Bypasses LiteLLM Proxy to communicate directly with Ollama.

    Features:
    - Direct LiteLLM SDK calls via litellm.acompletion
    - Native support for ollama/qwen3:8b
    - Strict structured JSON schema validation with Pydantic
    - Automatic validation retry loop with model feedback
    - Clean markdown fence and bracket extraction
    """

    def __init__(
        self,
        api_base: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: Optional[float] = None,
        max_retries: Optional[int] = None,
    ):
        settings = get_settings()
        self.api_base = (
            api_base 
            or getattr(settings, "OLLAMA_API_BASE", None) 
            or getattr(settings, "LITELLM_BASE_URL", "http://localhost:11434")
        ).rstrip("/")
        
        # Ensure model is formatted for Ollama if not prefixed
        model_name = model or getattr(settings, "LITELLM_MODEL", "ollama/qwen3:8b")
        if not model_name.startswith("ollama/") and not "/" in model_name:
            model_name = f"ollama/{model_name}"
        self.model = model_name

        self.api_key = (
            getattr(settings, "LITELLM_API_KEY", None) 
            or getattr(settings, "LITELLM_MASTER_KEY", None) 
            or "ollama"
        )
        self.timeout = timeout_seconds or (getattr(settings, "LITELLM_TIMEOUT_MS", 30000) / 1000.0)
        self.max_retries = max_retries or getattr(settings, "LITELLM_MAX_RETRIES", 3)

    def _extract_json_text(self, raw_text: str) -> str:
        """
        Cleans markdown code fences (```json ... ```) and extracts outermost JSON object.
        """
        text = raw_text.strip()
        # 1. Match code block
        match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
        if match:
            text = match.group(1).strip()
        
        # 2. Extract outermost braces
        start = text.find("{")
        end = text.rfind("}")
        if start != -1 and end != -1 and end > start:
            return text[start : end + 1]
        
        # 3. Check for array brackets
        start_arr = text.find("[")
        end_arr = text.rfind("]")
        if start_arr != -1 and end_arr != -1 and end_arr > start_arr:
            return text[start_arr : end_arr + 1]

        return text

    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.1,
        max_tokens: int = 2048,
        format: Optional[str] = None,
    ) -> Dict[str, Any]:
        """
        Executes completion directly via the LiteLLM SDK.
        """
        last_exception = None
        for attempt in range(1, self.max_retries + 1):
            try:
                kwargs: Dict[str, Any] = {
                    "model": self.model,
                    "messages": messages,
                    "api_base": self.api_base,
                    "temperature": temperature,
                    "max_tokens": max_tokens,
                    "timeout": self.timeout,
                }
                if self.api_key:
                    kwargs["api_key"] = self.api_key
                if format:
                    kwargs["format"] = format
                response = await litellm.acompletion(**kwargs)
                return response
            except Exception as e:
                last_exception = e
                logger.warning(
                    f"LiteLLM SDK attempt {attempt}/{self.max_retries} failed for {self.model}: {type(e).__name__}: {e}"
                )

        raise RuntimeError(
            f"LiteLLM SDK completion failed after {self.max_retries} attempts on {self.model}: {last_exception}"
        )

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
        return data.choices[0].message.content

    async def generate_structured(
        self,
        prompt: str,
        schema_cls: Type[T],
        system_prompt: Optional[str] = None,
        temperature: float = 0.1,
    ) -> T:
        """
        Forces JSON generation and parses the result into a typed Pydantic model.
        Includes automatic retry loop with model feedback on malformed JSON or validation errors.
        """
        schema_json = json.dumps(schema_cls.model_json_schema(), indent=2)
        json_instruction = (
            f"\nYou MUST respond with ONLY a valid JSON instance conforming to the following JSON schema:\n"
            f"{schema_json}\n"
            f"IMPORTANT: Generate the concrete JSON data instance, NOT the schema definition itself. "
            f"Do NOT output '$schema', '$defs', or schema metadata. Output ONLY valid JSON containing the populated fields."
        )
        base_system = (system_prompt or "").strip()
        full_system = f"{base_system}\n{json_instruction}".strip()

        conversation = [
            {"role": "system", "content": full_system},
            {"role": "user", "content": prompt},
        ]

        last_error = None
        for attempt in range(1, self.max_retries + 1):
            try:
                resp = await self.chat_completion(
                    conversation,
                    temperature=temperature,
                    format="json",
                )
                raw_text = resp.choices[0].message.content
                clean_json = self._extract_json_text(raw_text)

                parsed_dict = json.loads(clean_json)
                if isinstance(parsed_dict, dict) and ("$schema" in parsed_dict or "$defs" in parsed_dict):
                    raise ValueError("Model returned JSON schema definition instead of an actual data instance.")

                validated_model = schema_cls.model_validate(parsed_dict)
                return validated_model

            except (json.JSONDecodeError, ValidationError, ValueError) as err:
                last_error = err
                logger.warning(
                    f"Structured validation failed on attempt {attempt}/{self.max_retries}: {err}. Retrying with feedback."
                )
                # Feed error back to model for correction in next turn
                conversation.append({"role": "assistant", "content": raw_text if 'raw_text' in locals() else ""})
                conversation.append({
                    "role": "user",
                    "content": f"Your response was not valid data: {err}. Please provide ONLY a valid JSON data instance conforming to the schema (not the schema definition itself)."
                })
            except Exception as e:
                last_error = e
                logger.warning(f"Error during structured generation attempt {attempt}/{self.max_retries}: {e}")

        raise ValueError(
            f"Failed to generate valid structured output matching {schema_cls.__name__} after {self.max_retries} attempts: {last_error}"
        )
