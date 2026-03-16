/**
 * Mock data generator for dashboard demonstration
 * Simulates realistic PostgreSQL health monitoring data
 */

export function generateMockData() {
  const now = new Date();

  return {
    cluster_name: 'pghealth',
    version: 'PostgreSQL 16',
    timestamp: now.toISOString(),

    // Active connections
    active_connections: {
      active: 42,
      idle: 18,
      max_connections: 100,
      utilization_pct: 42,
      history: generateConnectionHistory()
    },

    // Blocking queries (occasional lock contention)
    blocking_queries: [
      {
        blocker_pid: 1024,
        blocker_query: 'UPDATE users SET last_login = NOW() WHERE id = $1',
        blocker_duration_s: 12.5,
        victim_pids: [1025, 1026]
      },
      {
        blocker_pid: 1027,
        blocker_query: 'DELETE FROM old_logs WHERE created_at < NOW() - INTERVAL \'90 days\'',
        blocker_duration_s: 45.8,
        victim_pids: [1028]
      }
    ],

    // Vacuum statistics
    vacuum_stats: [
      { relname: 'public.users', dead_tuple_pct: 8.2, n_dead_tup: 1523, n_live_tup: 18450 },
      { relname: 'public.orders', dead_tuple_pct: 15.7, n_dead_tup: 3421, n_live_tup: 21789 },
      { relname: 'public.products', dead_tuple_pct: 3.1, n_dead_tup: 234, n_live_tup: 7543 },
      { relname: 'public.transactions', dead_tuple_pct: 22.4, n_dead_tup: 8932, n_live_tup: 39876 },
      { relname: 'public.analytics_logs', dead_tuple_pct: 45.6, n_dead_tup: 156234, n_live_tup: 187543 },
      { relname: 'public.sessions', dead_tuple_pct: 12.3, n_dead_tup: 4521, n_live_tup: 36789 },
      { relname: 'public.audit_trail', dead_tuple_pct: 31.8, n_dead_tup: 45632, n_live_tup: 94231 }
    ],

    // Cache hit ratio (critical metric)
    cache_hit_ratio: [
      { relname: 'public.users', cache_hit_pct: 94.5, heap_blks_hit: 45231, heap_blks_read: 2543 },
      { relname: 'public.orders', cache_hit_pct: 87.3, heap_blks_hit: 38912, heap_blks_read: 5234 },
      { relname: 'public.products', cache_hit_pct: 92.1, heap_blks_hit: 21543, heap_blks_read: 1876 },
      { relname: 'public.transactions', cache_hit_pct: 68.4, heap_blks_hit: 34521, heap_blks_read: 16234 },
      { relname: 'public.analytics_logs', cache_hit_pct: 45.2, heap_blks_hit: 45123, heap_blks_read: 54321 },
      { relname: 'public.sessions', cache_hit_pct: 91.8, heap_blks_hit: 76543, heap_blks_read: 6543 },
      { relname: 'public.audit_trail', cache_hit_pct: 73.6, heap_blks_hit: 28934, heap_blks_read: 10876 },
      { relname: 'public.temp_staging', cache_hit_pct: 52.3, heap_blks_hit: 12345, heap_blks_read: 11234 }
    ],

    // Replication lag
    replication_lag: [
      {
        client_addr: '192.168.1.51',
        state: 'streaming',
        replay_lag_bytes: 2048576,
        replay_lag_s: 1.2
      },
      {
        client_addr: '192.168.1.52',
        state: 'streaming',
        replay_lag_bytes: 3145728,
        replay_lag_s: 2.8
      },
      {
        client_addr: '192.168.1.53',
        state: 'catchup',
        replay_lag_bytes: 15728640,
        replay_lag_s: 12.4
      }
    ],

    // Alerts
    alerts: [
      {
        id: 'alert-1',
        severity: 'warning',
        category: 'High Dead Tuple Percentage',
        message: 'analytics_logs: 45.6% dead tuples - consider running VACUUM',
        value: 45.6,
        threshold: 20,
        timestamp: new Date(now.getTime() - 5 * 60000).toISOString()
      },
      {
        id: 'alert-2',
        severity: 'info',
        category: 'Replication Catchup',
        message: '192.168.1.53 is catching up (12.4s lag)',
        value: 12.4,
        threshold: 10,
        timestamp: new Date(now.getTime() - 2 * 60000).toISOString()
      }
    ],

    // Longest running queries
    longest_running_queries: [
      { pid: 2001, query: 'SELECT * FROM analytics_logs WHERE created_at > $1 GROUP BY user_id', duration_s: 142.3, state: 'active' },
      { pid: 2002, query: 'UPDATE orders SET status = $1 WHERE id IN (SELECT id FROM ...)', duration_s: 38.7, state: 'active' },
      { pid: 2003, query: 'VACUUM ANALYZE public.transactions', duration_s: 22.1, state: 'active' },
      { pid: 2004, query: 'SELECT count(*) FROM audit_trail WHERE actor_id = $1', duration_s: 4.2, state: 'idle in transaction' },
      { pid: 2005, query: 'EXPLAIN ANALYZE SELECT * FROM sessions JOIN users ON ...', duration_s: 1.8, state: 'active' }
    ],

    // Lock waits
    lock_waits: [
      { pid: 3001, query: 'UPDATE users SET email = $1 WHERE id = $2', wait_duration_s: 8.4, blocking_pid: 1024, relation: 'public.users' },
      { pid: 3002, query: 'DELETE FROM sessions WHERE expires_at < NOW()', wait_duration_s: 3.1, blocking_pid: 1024, relation: 'public.sessions' },
      { pid: 3003, query: 'INSERT INTO audit_trail VALUES ($1, $2, $3)', wait_duration_s: 15.9, blocking_pid: 1027, relation: 'public.audit_trail' }
    ],

    // Index usage
    index_usage: [
      { schemaname: 'public', tablename: 'users', indexname: 'users_pkey', idx_scan: 48231, idx_tup_read: 48231, idx_tup_fetch: 47890 },
      { schemaname: 'public', tablename: 'orders', indexname: 'orders_user_id_idx', idx_scan: 23145, idx_tup_read: 89234, idx_tup_fetch: 88901 },
      { schemaname: 'public', tablename: 'sessions', indexname: 'sessions_token_idx', idx_scan: 134, idx_tup_read: 134, idx_tup_fetch: 0 },
      { schemaname: 'public', tablename: 'analytics_logs', indexname: 'analytics_logs_created_idx', idx_scan: 12, idx_tup_read: 450321, idx_tup_fetch: 12 },
      { schemaname: 'public', tablename: 'products', indexname: 'products_sku_idx', idx_scan: 0, idx_tup_read: 0, idx_tup_fetch: 0 },
      { schemaname: 'public', tablename: 'transactions', indexname: 'transactions_account_idx', idx_scan: 5621, idx_tup_read: 16234, idx_tup_fetch: 16100 }
    ]
  };
}

/**
 * Generate connection history for sparkline chart
 */
function generateConnectionHistory() {
  const history = [];
  const now = new Date();

  for (let i = 30; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60000); // 1 minute intervals
    const baseCount = 42;
    const variance = Math.sin(i * 0.5) * 8 + Math.random() * 4;

    history.push({
      time: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      active: Math.max(25, Math.round(baseCount + variance)),
      utilization: Math.max(25, Math.round(42 + variance))
    });
  }

  return history;
}

/**
 * Simulate real-time data updates
 * Call this periodically to update the mock data with realistic changes
 */
export function updateMockData(currentData) {
  const updated = JSON.parse(JSON.stringify(currentData));

  // Slightly vary active connections
  const variation = Math.sin(Date.now() / 30000) * 5;
  updated.active_connections.active = Math.max(
    25,
    Math.min(95, Math.round(42 + variation))
  );
  updated.active_connections.utilization_pct = Math.round(
    (updated.active_connections.active / updated.active_connections.max_connections) * 100
  );

  // Rotate blocking queries occasionally
  if (Math.random() > 0.7) {
    updated.blocking_queries = updated.blocking_queries.slice(0, 1);
  }

  // Update cache hit ratio slightly
  updated.cache_hit_ratio = updated.cache_hit_ratio.map((t) => ({
    ...t,
    cache_hit_pct: Math.max(40, Math.min(99, t.cache_hit_pct + (Math.random() - 0.5) * 2))
  }));

  // Update replication lag
  updated.replication_lag = updated.replication_lag.map((r) => ({
    ...r,
    replay_lag_bytes: Math.max(1000000, r.replay_lag_bytes + (Math.random() - 0.5) * 500000),
    replay_lag_s: Math.max(0.5, r.replay_lag_s + (Math.random() - 0.5) * 1)
  }));

  // Update longest running queries durations
  updated.longest_running_queries = updated.longest_running_queries.map((q) => ({
    ...q,
    duration_s: Math.max(0.5, q.duration_s + (Math.random() - 0.5) * 5)
  }));

  // Update lock waits durations
  updated.lock_waits = updated.lock_waits.map((w) => ({
    ...w,
    wait_duration_s: Math.max(0.1, w.wait_duration_s + (Math.random() - 0.5) * 2)
  }));

  // Update index usage scan counts
  updated.index_usage = updated.index_usage.map((idx) => ({
    ...idx,
    idx_scan: Math.max(0, idx.idx_scan + Math.floor((Math.random() - 0.5) * 100))
  }));

  return updated;
}
