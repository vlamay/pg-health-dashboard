"""Database connection pool management."""
from psycopg2.pool import ThreadedConnectionPool
from psycopg2.extras import RealDictCursor
from typing import Optional, List, Dict, Any


_pool: Optional[ThreadedConnectionPool] = None


def init_pool(dsn: str, minconn: int = 2, maxconn: int = 10) -> None:
    """Initialize the connection pool at startup."""
    global _pool
    _pool = ThreadedConnectionPool(minconn, maxconn, dsn)


def close_pool() -> None:
    """Close the connection pool at shutdown."""
    global _pool
    if _pool:
        _pool.closeall()
        _pool = None


def get_conn():
    """Context manager to get a connection from the pool."""
    if _pool is None:
        raise RuntimeError("Connection pool not initialized. Call init_pool() first.")

    conn = _pool.getconn()
    try:
        yield conn
    finally:
        _pool.putconn(conn)


def fetch_all(sql: str, params: tuple = ()) -> List[Dict[str, Any]]:
    """Execute a query and return all results as list of dicts."""
    if _pool is None:
        raise RuntimeError("Connection pool not initialized. Call init_pool() first.")

    conn = _pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchall()
    finally:
        _pool.putconn(conn)


def fetch_one(sql: str, params: tuple = ()) -> Optional[Dict[str, Any]]:
    """Execute a query and return first result as dict."""
    if _pool is None:
        raise RuntimeError("Connection pool not initialized. Call init_pool() first.")

    conn = _pool.getconn()
    try:
        with conn.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(sql, params)
            return cur.fetchone()
    finally:
        _pool.putconn(conn)
