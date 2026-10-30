import hashlib
import json
from typing import Any, Dict

class ProofHasher:
    @staticmethod
    def generate_hash(payload: Dict[str, Any]) -> str:
        serialized = json.dumps(payload, sort_keys=True, default=str)
        return f"sha256:{hashlib.sha256(serialized.encode('utf-8')).hexdigest()}"
