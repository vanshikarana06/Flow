from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.websocket.connection_manager import get_connection_manager

router = APIRouter(tags=["WebSocket"])

@router.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    manager = get_connection_manager()
    await manager.connect(user_id, websocket)
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming ping / messages
            await websocket.send_json({"type": "PONG", "payload": data})
    except WebSocketDisconnect:
        manager.disconnect(user_id, websocket)

