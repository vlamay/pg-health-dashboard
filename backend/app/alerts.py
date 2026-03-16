"""Alert computation from metrics."""
from typing import List, Dict, Any
from app.config import get_settings
from app import metrics


def compute_alerts() -> List[Dict[str, Any]]:
    """
    Compute all alerts based on current metrics.

    Returns:
        [
            {
                'id': str,
                'severity': 'critical' | 'warning' | 'info',
                'category': str,
                'message': str,
                'value': str,
                'threshold': str
            }
        ]
    """
    alerts = []
    settings = get_settings()

    # Connection pool utilization alerts
    try:
        conn_metrics = metrics.active_connections()
        util_pct = conn_metrics['utilization_pct']
        active = conn_metrics['active']
        max_conn = conn_metrics['max_connections']

        if util_pct > 90:
            alerts.append({
                'id': 'connection_critical',
                'severity': 'critical',
                'category': 'Connection Pool',
                'message': f'Connection pool {active}/{max_conn} ({util_pct}%) - CRITICAL',
                'value': f'{util_pct}%',
                'threshold': '90%'
            })
        elif util_pct > 75:
            alerts.append({
                'id': 'connection_warning',
                'severity': 'warning',
                'category': 'Connection Pool',
                'message': f'Connection pool {active}/{max_conn} ({util_pct}%) - WARNING',
                'value': f'{util_pct}%',
                'threshold': '75%'
            })
    except Exception:
        pass

    # Blocking queries alerts
    try:
        blockers = metrics.blocking_queries()
        for blocker in blockers:
            alerts.append({
                'id': f"blocking_{blocker['blocker_pid']}",
                'severity': 'critical',
                'category': 'Blocking Query',
                'message': f"PID {blocker['blocker_pid']} blocking {len(blocker['victim_pids'])} queries: {blocker['blocker_query'][:50]}...",
                'value': f"{len(blocker['victim_pids'])} blocked",
                'threshold': '0'
            })
    except Exception:
        pass

    # Lock wait alerts
    try:
        lock_waits = metrics.lock_waits()
        for lock_wait in lock_waits:
            duration_s = float(lock_wait['wait_duration_s'] or 0)
            threshold_ms = settings.ALERT_LOCK_WAIT_THRESHOLD_MS
            if duration_s * 1000 > threshold_ms:
                alerts.append({
                    'id': f"lock_wait_{lock_wait['pid']}",
                    'severity': 'warning',
                    'category': 'Lock Wait',
                    'message': f"PID {lock_wait['pid']} waiting {duration_s:.1f}s on {lock_wait['relation']}",
                    'value': f'{duration_s:.1f}s',
                    'threshold': f'{threshold_ms}ms'
                })
    except Exception:
        pass

    # Long running query alerts
    try:
        long_queries = metrics.longest_running_query()
        threshold_s = settings.ALERT_LONG_QUERY_THRESHOLD_S
        for query in long_queries:
            duration_s = float(query['duration_s'] or 0)
            if duration_s > threshold_s:
                alerts.append({
                    'id': f"long_query_{query['pid']}",
                    'severity': 'warning',
                    'category': 'Long Query',
                    'message': f"PID {query['pid']} running {duration_s:.0f}s: {query['query'][:50]}...",
                    'value': f'{duration_s:.0f}s',
                    'threshold': f'{threshold_s}s'
                })
    except Exception:
        pass

    # Vacuum/dead tuple alerts
    try:
        vac_stats = metrics.vacuum_stats()
        for table in vac_stats:
            dead_pct = float(table['dead_tuple_pct'] or 0)
            if dead_pct > 20:
                alerts.append({
                    'id': f"vacuum_{table['relname']}",
                    'severity': 'warning',
                    'category': 'Dead Tuples',
                    'message': f"{table['relname']}: {dead_pct}% dead tuples - {table['n_dead_tup']} rows",
                    'value': f'{dead_pct}%',
                    'threshold': '20%'
                })
    except Exception:
        pass

    # Cache hit ratio alerts
    try:
        cache_ratios = metrics.cache_hit_ratio()
        for table in cache_ratios:
            hit_pct = float(table['cache_hit_pct'] or 0)
            if hit_pct < 95:
                alerts.append({
                    'id': f"cache_{table['relname']}",
                    'severity': 'info',
                    'category': 'Cache',
                    'message': f"{table['relname']}: {hit_pct}% cache hit ratio",
                    'value': f'{hit_pct}%',
                    'threshold': '95%'
                })
    except Exception:
        pass

    # Sort by severity
    severity_order = {'critical': 0, 'warning': 1, 'info': 2}
    alerts.sort(key=lambda a: severity_order.get(a['severity'], 3))

    return alerts
