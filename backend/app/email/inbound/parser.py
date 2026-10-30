import re
import email.utils
from typing import Tuple, Optional, Dict, Any
from app.email.inbound.schemas import InboundEmailPayload

class InboundEmailParser:
    @staticmethod
    def parse_sender(sender_raw: str) -> Tuple[Optional[str], str]:
        name, address = email.utils.parseaddr(sender_raw)
        return (name if name else None, address.lower().strip())

    @staticmethod
    def clean_subject(subject: str) -> str:
        # Strip repeated Re:, Fwd:, FW: prefixes
        cleaned = re.sub(r"^\s*((re|fwd|fw)\s*:\s*)+", "", subject, flags=re.IGNORECASE).strip()
        return cleaned if cleaned else subject

    @staticmethod
    def extract_header_references(headers: Optional[Dict[str, Any]]) -> Tuple[Optional[str], Optional[str]]:
        if not headers:
            return None, None
        
        in_reply_to = headers.get("In-Reply-To") or headers.get("in-reply-to")
        references = headers.get("References") or headers.get("references")
        
        if isinstance(references, list):
            references = " ".join(references)
            
        return in_reply_to, references

    @staticmethod
    def extract_snippet(text: Optional[str], max_len: int = 150) -> str:
        if not text:
            return ""
        # Collapse multiple whitespaces
        snippet = " ".join(text.split())
        if len(snippet) > max_len:
            return snippet[:max_len] + "..."
        return snippet

