"""WebSocket metrics broadcaster."""
import asyncio
import json
from typing import Callable, List
from fastapi import WebSocket


class MetricsBroadcaster:
    """Manages WebSocket connections and broadcasts metrics."""

    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket) -> None:
        """Add a new WebSocket connection."""
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket) -> None:
        """Remove a WebSocket connection."""
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def broadcast(self, payload: dict) -> None:
        """Send metrics to all connected clients."""
        if not self.active_connections:
            return

        message = json.dumps(payload)
        disconnected = []

        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except Exception:
                disconnected.append(connection)

        # Clean up disconnected clients
        for connection in disconnected:
            self.disconnect(connection)


async def poll_loop(
    interval_s: int,
    fetch_fn: Callable[[], dict],
    broadcaster: MetricsBroadcaster
) -> None:
    """
    Background coroutine to poll metrics and broadcast to WebSocket clients.

    Runs fetch_fn in executor to avoid blocking the event loop
    (psycopg2 is synchronous).
    """
    loop = asyncio.get_event_loop()

    while True:
        try:
            # Run blocking DB call in thread pool
            payload = await loop.run_in_executor(None, fetch_fn)
            await broadcaster.broadcast(payload)
        except Exception as e:
            print(f"Error in poll_loop: {e}")

        await asyncio.sleep(interval_s)
