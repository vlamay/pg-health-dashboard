"""FastAPI application for PostgreSQL health monitoring."""
import asyncio
from contextlib import asynccontextmanager
from datetime import datetime
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from app.config import get_settings
from app.db import init_pool, close_pool
from app.ws import MetricsBroadcaster, poll_loop
from app import metrics, alerts


# Global WebSocket broadcaster
broadcaster = MetricsBroadcaster()

# Task reference for cleanup
poll_task = None


def collect_all() -> dict:
    """Collect all metrics and alerts."""
    return {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'active_connections': metrics.active_connections(),
        'blocking_queries': metrics.blocking_queries(),
        'lock_waits': metrics.lock_waits(),
        'longest_running_queries': metrics.longest_running_query(),
        'replication_lag': metrics.replication_lag(),
        'vacuum_stats': metrics.vacuum_stats(),
        'cache_hit_ratio': metrics.cache_hit_ratio(),
        'index_usage': metrics.index_usage(),
        'alerts': alerts.compute_alerts()
    }


@asynccontextmanager
async def lifespan(app: FastAPI):
    """FastAPI lifespan manager for startup and shutdown."""
    global poll_task

    settings = get_settings()

    # Startup
    print("Starting PostgreSQL health monitor...")
    init_pool(settings.DATABASE_URL)

    # Start background polling
    poll_task = asyncio.create_task(
        poll_loop(settings.METRICS_REFRESH_INTERVAL_S, collect_all, broadcaster)
    )

    yield

    # Shutdown
    print("Shutting down...")
    if poll_task:
        poll_task.cancel()
        try:
            await poll_task
        except asyncio.CancelledError:
            pass
    close_pool()


# Create FastAPI app
app = FastAPI(
    title="PostgreSQL Health Monitor API",
    description="Real-time PostgreSQL internals monitoring",
    version="1.0.0",
    lifespan=lifespan
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
async def health_check():
    """Health check endpoint."""
    return {"status": "ok"}


@app.get("/api/metrics")
async def get_metrics():
    """Get current metrics."""
    return collect_all()


@app.get("/api/alerts")
async def get_alerts():
    """Get current alerts."""
    return {
        'timestamp': datetime.utcnow().isoformat() + 'Z',
        'alerts': alerts.compute_alerts()
    }


@app.websocket("/ws/metrics")
async def websocket_metrics(websocket: WebSocket):
    """WebSocket endpoint for real-time metrics."""
    await broadcaster.connect(websocket)
    try:
        # Keep connection open
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        broadcaster.disconnect(websocket)
    except Exception as e:
        print(f"WebSocket error: {e}")
        broadcaster.disconnect(websocket)


if __name__ == "__main__":
    settings = get_settings()
    uvicorn.run(
        app,
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.RELOAD
    )
