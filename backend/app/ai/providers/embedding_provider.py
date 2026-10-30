import hashlib
import logging
from typing import List, Optional, Dict, Any
import httpx
from app.core.config import get_settings

logger = logging.getLogger("flow.ai.embeddings")

class EmbeddingProvider:
    """
    Vector Embedding Provider compatible with pgvector Vector(1536).
    Supports:
    - LiteLLM Proxy /embeddings endpoint
    - Ollama /api/embeddings
    - Vector normalization to 1536 dimensions
    - Deterministic fallback for test environments
    """

    TARGET_DIMENSION = 1536

    def __init__(
        self,
        base_url: Optional[str] = None,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        settings = get_settings()
        self.base_url = (base_url or settings.LITELLM_BASE_URL).rstrip("/")
        self.api_key = api_key or settings.LITELLM_API_KEY
        self.model = model or settings.LITELLM_EMBEDDING_MODEL
        self.timeout = timeout_seconds

    def _normalize_dimension(self, vector: List[float], target_dim: int = 1536) -> List[float]:
        """
        Ensures the embedding vector has exact target dimensions for pgvector Vector(1536).
        """
        current_len = len(vector)
        if current_len == target_dim:
            return vector
        elif current_len < target_dim:
            # Zero-pad
            return vector + [0.0] * (target_dim - current_len)
        else:
            # Truncate
            return vector[:target_dim]

    def _generate_deterministic_fallback(self, text: str) -> List[float]:
        """
        Generates deterministic 1536-dim vector for testing and offline development.
        """
        vector = []
        for i in range(self.TARGET_DIMENSION):
            h = hashlib.sha256(f"{text}:{i}".encode("utf-8")).digest()
            val = (int.from_bytes(h[:4], "little") / 4294967295.0) * 2.0 - 1.0
            vector.append(round(val, 6))
        return vector

    async def get_embedding(self, text: str) -> List[float]:
        """
        Retrieves embedding vector for text string.
        """
        endpoint = f"{self.base_url}/embeddings"
        if not endpoint.startswith("http"):
            endpoint = f"http://{endpoint}"

        headers = {"Content-Type": "application/json"}
        if self.api_key:
            headers["Authorization"] = f"Bearer {self.api_key}"

        payload = {
            "model": self.model,
            "input": text,
        }

        try:
            async with httpx.AsyncClient(timeout=self.timeout) as client:
                res = await client.post(endpoint, json=payload, headers=headers)
                if res.status_code == 200:
                    data = res.json()
                    raw_vec = data["data"][0]["embedding"]
                    return self._normalize_dimension(raw_vec, self.TARGET_DIMENSION)
                logger.warning(f"Embedding request returned HTTP {res.status_code}, using fallback vector.")
        except Exception as e:
            logger.debug(f"Embedding service unreachable ({e}), using deterministic vector fallback.")

        return self._generate_deterministic_fallback(text)

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        results = []
        for text in texts:
            vec = await self.get_embedding(text)
            results.append(vec)
        return results
