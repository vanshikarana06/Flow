import hashlib
import logging
from typing import List, Optional
import litellm
from app.core.config import get_settings

logger = logging.getLogger("flow.ai.embeddings")

class EmbeddingProvider:
    """
    Vector Embedding Provider compatible with pgvector Vector(1536).
    Uses LiteLLM SDK directly with model: ollama/nomic-embed-text.

    Features:
    - Direct LiteLLM SDK calls via litellm.aembedding
    - Normalization and padding to 1536 dimensions for Supabase pgvector
    - Safe deterministic fallback when service is offline or during testing
    """

    TARGET_DIMENSION = 1536

    def __init__(
        self,
        api_base: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 15.0,
    ):
        settings = get_settings()
        self.api_base = (
            api_base 
            or getattr(settings, "OLLAMA_API_BASE", None) 
            or getattr(settings, "LITELLM_BASE_URL", "http://localhost:11434")
        ).rstrip("/")
        
        raw_model = model or getattr(settings, "LITELLM_EMBEDDING_MODEL", "ollama/nomic-embed-text")
        if not raw_model.startswith("ollama/") and not "/" in raw_model:
            raw_model = f"ollama/{raw_model}"
        self.model = raw_model
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
        Retrieves embedding vector for text string via LiteLLM SDK.
        """
        try:
            resp = await litellm.aembedding(
                model=self.model,
                input=[text],
                api_base=self.api_base,
                timeout=self.timeout,
            )
            raw_vec = resp.data[0]["embedding"]
            return self._normalize_dimension(raw_vec, self.TARGET_DIMENSION)
        except Exception as e:
            logger.debug(f"LiteLLM SDK embedding unreachable for {self.model} ({e}), using deterministic vector fallback.")
            return self._generate_deterministic_fallback(text)

    async def get_embeddings(self, texts: List[str]) -> List[List[float]]:
        try:
            resp = await litellm.aembedding(
                model=self.model,
                input=texts,
                api_base=self.api_base,
                timeout=self.timeout,
            )
            return [
                self._normalize_dimension(item["embedding"], self.TARGET_DIMENSION)
                for item in resp.data
            ]
        except Exception as e:
            logger.debug(f"LiteLLM SDK batch embedding failed ({e}), using deterministic fallback.")
            return [self._generate_deterministic_fallback(t) for t in texts]
