# backend > main.py
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from collections import defaultdict

app = FastAPI()

# Room registry: { roomId: [websocket, ...] }
rooms: dict[str, list[WebSocket]] = defaultdict(list)


@app.websocket("/ws/{room_id}")
async def websocket_endpoint(websocket: WebSocket, room_id: str):
    await websocket.accept()
    rooms[room_id].append(websocket)
    print(f" Client joined room: {room_id}  (peers in room: {len(rooms[room_id])})")

    try:
        while True:
            data = await websocket.receive_text()

            # Relay only to other peers in the same room
            for peer in rooms[room_id]:
                if peer != websocket:
                    await peer.send_text(data)

    except WebSocketDisconnect:
        rooms[room_id].remove(websocket)
        print(f" Client left room: {room_id}  (peers remaining: {len(rooms[room_id])})")

        
        for peer in rooms[room_id]:
            await peer.send_text('{"type":"peer-left"}')

        # Clean up empty rooms
        if not rooms[room_id]:
            del rooms[room_id]
            print(f"Room {room_id} removed (empty)")