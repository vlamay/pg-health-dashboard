"""PostgreSQL health metrics queries."""
from typing import List, Dict, Any
from app.db import fetch_all, fetch_one


def active_connections() -> Dict[str, Any]:
    """
    Get current active connections and pool status.

    Returns:
        {
            'active': int,
            'max_connections': int,
            'utilization_pct': float
        }
    """
    sql = """
    SELECT
        COUNT(*) as active,
        (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') as max_connections
    FROM pg_stat_activity
    """
    result = fetch_one(sql)
    if result:
        active = result['active']
        max_conn = result['max_connections']
        utilization_pct = (active / max_conn * 100) if max_conn > 0 else 0
        return {
            'active': active,
            'max_connections': max_conn,
            'utilization_pct': round(utilization_pct, 2)
        }
    return {'active': 0, 'max_connections': 0, 'utilization_pct': 0.0}


def blocking_queries() -> List[Dict[str, Any]]:
    """
    Get currently blocking queries and their victims.

    Returns:
        [
            {
                'blocker_pid': int,
                'blocker_query': str,
                'blocker_duration_s': float,
                'victim_pids': [int]
            }
        ]
    """
    sql = """
    WITH blocking AS (
        SELECT DISTINCT unnest(pg_blocking_pids(pid)) as blocker_pid
        FROM pg_stat_activity
    )
    SELECT
        a.pid as blocker_pid,
        a.query as blocker_query,
        EXTRACT(EPOCH FROM (NOW() - a.query_start)) as blocker_duration_s
    FROM pg_stat_activity a
    WHERE a.pid IN (SELECT blocker_pid FROM blocking)
    """
    blockers = fetch_all(sql)

    # For each blocker, find victim PIDs
    results = []
    for blocker in blockers:
        victims_sql = """
        SELECT pid
        FROM pg_stat_activity
        WHERE %(blocker_pid)s = ANY(pg_blocking_pids(pid))
        """
        victims = fetch_all(victims_sql, {'blocker_pid': blocker['blocker_pid']})
        victim_pids = [v['pid'] for v in victims]

        results.append({
            'blocker_pid': blocker['blocker_pid'],
            'blocker_query': blocker['blocker_query'][:100],  # Truncate for display
            'blocker_duration_s': float(blocker['blocker_duration_s'] or 0),
            'victim_pids': victim_pids
        })

    return results


def lock_waits() -> List[Dict[str, Any]]:
    """
    Get queries waiting on locks.

    Returns:
        [
            {
                'pid': int,
                'query': str,
                'wait_duration_s': float,
                'blocking_pid': int,
                'relation': str
            }
        ]
    """
    sql = """
    SELECT
        a.pid,
        a.query,
        EXTRACT(EPOCH FROM (NOW() - a.query_start)) as wait_duration_s,
        (SELECT b.pid FROM pg_stat_activity b
         WHERE a.pid = ANY(pg_blocking_pids(b.pid)) LIMIT 1) as blocking_pid,
        c.relname as relation
    FROM pg_stat_activity a
    JOIN pg_locks l ON a.pid = l.pid AND l.granted = false
    LEFT JOIN pg_class c ON l.relation = c.oid
    WHERE a.query_start IS NOT NULL
    ORDER BY a.query_start ASC
    """
    return fetch_all(sql)


def longest_running_query() -> List[Dict[str, Any]]:
    """
    Get top 10 longest running queries.

    Returns:
        [
            {
                'pid': int,
                'query': str,
                'duration_s': float,
                'state': str
            }
        ]
    """
    sql = """
    SELECT
        pid,
        query,
        EXTRACT(EPOCH FROM (NOW() - query_start)) as duration_s,
        state
    FROM pg_stat_activity
    WHERE query_start IS NOT NULL
    AND query NOT ILIKE '%%pg_stat_activity%%'
    ORDER BY query_start ASC
    LIMIT 10
    """
    return fetch_all(sql)


def replication_lag() -> List[Dict[str, Any]]:
    """
    Get replication lag for each replica.

    Returns:
        [
            {
                'client_addr': str,
                'state': str,
                'replay_lag_bytes': int,
                'replay_lag_s': float
            }
        ]
    """
    sql = """
    SELECT
        client_addr::text,
        state,
        pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)::bigint as replay_lag_bytes,
        COALESCE(
            EXTRACT(EPOCH FROM (write_lag + flush_lag + replay_lag)),
            0
        ) as replay_lag_s
    FROM pg_stat_replication
    """
    return fetch_all(sql)


def vacuum_stats() -> List[Dict[str, Any]]:
    """
    Get vacuum statistics for tables with most dead tuples.

    Returns:
        [
            {
                'relname': str,
                'n_dead_tup': int,
                'n_live_tup': int,
                'dead_tuple_pct': float,
                'last_vacuum': str
            }
        ]
    """
    sql = """
    SELECT
        schemaname || '.' || relname as relname,
        n_dead_tup,
        n_live_tup,
        ROUND(100.0 * n_dead_tup / NULLIF(n_dead_tup + n_live_tup, 0), 2) as dead_tuple_pct,
        COALESCE(last_vacuum::text, 'never') as last_vacuum
    FROM pg_stat_user_tables
    WHERE n_dead_tup > 0
    ORDER BY n_dead_tup DESC
    LIMIT 20
    """
    return fetch_all(sql)


def cache_hit_ratio() -> List[Dict[str, Any]]:
    """
    Get cache hit ratios for tables.

    Returns:
        [
            {
                'relname': str,
                'cache_hit_pct': float,
                'heap_blks_read': int,
                'heap_blks_hit': int
            }
        ]
    """
    sql = """
    SELECT
        schemaname || '.' || relname as relname,
        ROUND(
            100.0 * heap_blks_hit / NULLIF(heap_blks_hit + heap_blks_read, 0),
            2
        ) as cache_hit_pct,
        heap_blks_read,
        heap_blks_hit
    FROM pg_statio_user_tables
    WHERE heap_blks_read + heap_blks_hit > 0
    ORDER BY heap_blks_read + heap_blks_hit DESC
    LIMIT 20
    """
    return fetch_all(sql)


def index_usage() -> List[Dict[str, Any]]:
    """
    Get index usage statistics.

    Returns:
        [
            {
                'schemaname': str,
                'tablename': str,
                'indexname': str,
                'idx_scan': int,
                'idx_tup_read': int,
                'idx_tup_fetch': int
            }
        ]
    """
    sql = """
    SELECT
        schemaname,
        relname as tablename,
        indexrelname as indexname,
        idx_scan,
        idx_tup_read,
        idx_tup_fetch
    FROM pg_stat_user_indexes
    ORDER BY idx_scan DESC
    LIMIT 20
    """
    return fetch_all(sql)
