import asyncio
import logging
from typing import Callable, Dict, List, Any
from datetime import datetime, timezone
from dataclasses import dataclass, field

logger = logging.getLogger("flow.events")

@dataclass
class DomainEvent:
    name: str
    user_id: str
    payload: Dict[str, Any]
    timestamp: datetime = field(default_factory=lambda: datetime.now(timezone.utc))

class DomainEventEmitter:
    def __init__(self):
        self._listeners: Dict[str, List[Callable[[DomainEvent], Any]]] = {}

    def on(self, event_name: str, handler: Callable[[DomainEvent], Any]):
        if event_name not in self._listeners:
            self._listeners[event_name] = []
        self._listeners[event_name].append(handler)

    async def emit(self, event_name: str, user_id: str, payload: Dict[str, Any]):
        event = DomainEvent(name=event_name, user_id=user_id, payload=payload)
        logger.debug(f"Emitted event: {event_name} for user: {user_id}")
        handlers = self._listeners.get(event_name, [])
        for handler in handlers:
            try:
                if asyncio.iscoroutinefunction(handler):
                    await handler(event)
                else:
                    handler(event)
            except Exception as e:
                logger.error(f"Error executing event handler for {event_name}: {str(e)}")

_event_emitter = DomainEventEmitter()

def get_event_emitter() -> DomainEventEmitter:
    return _event_emitter

