import { useEffect, useRef } from 'react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';

// Color scheme for Mission Control aesthetic
const COLORS = {
  green: '#00FF94',
  amber: '#FFB800',
  red: '#FF3B5C',
  border: '#1E2535',
  surface: '#141820',
  void: '#08090A',
  textPrimary: '#E8EDF5',
  textDim: '#4A5568',
  textMono: '#7FDBCA',
};

// ============================================================================
// CARD 1: Connection Pool % (Radial Arc)
// ============================================================================
function ConnectionPoolCard({ data, delay }) {
  const poolPct = Math.min(
    ((data?.active_connections?.active || 0) / (data?.active_connections?.max_connections || 100)) * 100,
    100
  );

  const getStatus = (pct) => {
    if (pct > 90) return { label: 'CRITICAL', color: COLORS.red };
    if (pct > 75) return { label: 'WARNING', color: COLORS.amber };
    return { label: 'HEALTHY', color: COLORS.green };
  };

  const status = getStatus(poolPct);

  // SVG arc calculation: semicircle (200°) from left to right
  const arcPath = (pct) => {
    const radius = 40;
    const center = 60;
    const startAngle = 130; // 130° (left side)
    const sweepAngle = (pct / 100) * 200; // up to 200° sweep
    const endAngle = startAngle + sweepAngle;

    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + radius * Math.cos(startRad);
    const y1 = center + radius * Math.sin(startRad);
    const x2 = center + radius * Math.cos(endRad);
    const y2 = center + radius * Math.sin(endRad);

    const largeArc = sweepAngle > 180 ? 1 : 0;

    return `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArc} 1 ${x2} ${y2}`;
  };

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Connection Pool %
      </div>

      <svg width="140" height="100" viewBox="0 0 140 100" className="mx-auto">
        {/* Background arc */}
        <path
          d={arcPath(100)}
          stroke={COLORS.border}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
        {/* Foreground arc */}
        <path
          d={arcPath(poolPct)}
          stroke={status.color}
          strokeWidth="6"
          fill="none"
          strokeLinecap="round"
        />
      </svg>

      <div className="mt-4 text-center flex-1 flex flex-col justify-center">
        <div className="text-3xl font-mono font-bold" style={{ color: status.color }}>
          {poolPct.toFixed(0)}%
        </div>
        <div
          className="text-[10px] uppercase tracking-wider mt-2 px-2 py-1 rounded inline-block mx-auto"
          style={{
            backgroundColor: `${status.color}15`,
            color: status.color,
            border: `1px solid ${status.color}40`,
          }}
        >
          {status.label}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 2: Blocking Queries
// ============================================================================
function BlockingQueriesCard({ data, delay }) {
  const blockingCount = data?.blocking_queries?.length || 0;
  const hasBlockers = blockingCount > 0;
  const firstBlocker = hasBlockers ? data.blocking_queries[0] : null;
  const subLabel = firstBlocker
    ? (firstBlocker.query || `PID ${firstBlocker.pid}`).substring(0, 40)
    : 'None';

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Blocking Queries
      </div>

      <div className="flex items-center gap-6 flex-1 justify-center">
        <div
          className={`w-12 h-12 rounded-full flex items-center justify-center transition-all ${
            hasBlockers ? 'animate-pulse' : ''
          }`}
          style={{
            backgroundColor: hasBlockers ? `${COLORS.red}20` : `${COLORS.green}20`,
            border: `2px solid ${hasBlockers ? COLORS.red : COLORS.green}`,
          }}
        >
          <div
            className="w-4 h-4 rounded-full"
            style={{ backgroundColor: hasBlockers ? COLORS.red : COLORS.green }}
          />
        </div>

        <div className="flex-1">
          <div className="text-3xl font-mono font-bold" style={{ color: hasBlockers ? COLORS.red : COLORS.green }}>
            {blockingCount}
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1 truncate">
            {subLabel}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 3: Dead Tuple Ratio
// ============================================================================
function DeadTupleRatioCard({ data, delay }) {
  const vacuumStats = data?.vacuum_stats || [];
  const worst = vacuumStats.reduce(
    (max, curr) => ((curr.dead_tuple_pct || 0) > (max.dead_tuple_pct || 0) ? curr : max),
    { dead_tuple_pct: 0, table_name: 'N/A' }
  );

  const deadPct = Math.min(worst.dead_tuple_pct || 0, 100);

  const getBarColor = (pct) => {
    if (pct > 20) return COLORS.red;
    if (pct > 5) return COLORS.amber;
    return COLORS.green;
  };

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Dead Tuple Ratio
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {/* Threshold markers */}
        <div className="relative h-6 mb-4">
          <div className="absolute inset-0 bg-[#1E2535] rounded h-full" />
          <div
            className="absolute inset-0 h-full rounded transition-all duration-300"
            style={{
              width: `${deadPct}%`,
              backgroundColor: getBarColor(deadPct),
            }}
          />
          {/* 5% marker */}
          <div
            className="absolute top-0 h-full border-l w-px"
            style={{ left: '5%', borderColor: COLORS.amber }}
          />
          {/* 20% marker */}
          <div
            className="absolute top-0 h-full border-l w-px"
            style={{ left: '20%', borderColor: COLORS.red }}
          />
        </div>

        <div>
          <div className="text-xl font-mono font-bold" style={{ color: getBarColor(deadPct) }}>
            {deadPct.toFixed(1)}%
          </div>
          <div className="text-[11px] text-[#4A5568] mt-1 truncate">
            {(worst.table_name || 'N/A').substring(0, 30)}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 4: Lock Waits (Mini Heatmap)
// ============================================================================
function LockWaitsCard({ data, delay }) {
  const lockCount = data?.lock_waits?.length || 0;
  const totalSquares = 60; // 6×10 grid
  const filledSquares = Math.min(lockCount, totalSquares);
  const squares = Array.from({ length: totalSquares }, (_, i) => i < filledSquares);

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Lock Waits
      </div>

      <div className="flex-1 flex flex-col justify-between">
        {/* Heatmap grid 6 cols × 10 rows */}
        <div className="grid gap-1" style={{ gridTemplateColumns: 'repeat(6, 1fr)' }}>
          {squares.map((filled, i) => (
            <div
              key={i}
              className="aspect-square rounded transition-colors duration-200"
              style={{
                backgroundColor: filled ? COLORS.red : COLORS.border,
              }}
            />
          ))}
        </div>

        <div className="mt-4">
          <div className="text-2xl font-mono font-bold" style={{ color: lockCount > 0 ? COLORS.red : COLORS.green }}>
            {lockCount}
          </div>
          <div className="text-[10px] text-[#4A5568] mt-1">
            {lockCount > 0 ? 'LOCK WAITS DETECTED' : 'No lock waits'}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 5: Longest Query (Timer Display)
// ============================================================================
function LongestQueryCard({ data, delay }) {
  const duration = data?.longest_running_queries?.[0]?.duration_s || 0;
  const state = data?.longest_running_queries?.[0]?.state || 'idle';
  const query = data?.longest_running_queries?.[0]?.query || '';

  const minutes = Math.floor(duration / 60);
  const seconds = Math.floor(duration % 60);

  const getStatusColor = (dur) => {
    if (dur > 60) return COLORS.red;
    if (dur > 5) return COLORS.amber;
    return COLORS.green;
  };

  const statusColor = getStatusColor(duration);

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Longest Query
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="text-center">
          <div
            className="text-4xl font-mono font-bold tracking-wider"
            style={{ color: statusColor }}
          >
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
          </div>
          <div className="text-[10px] uppercase tracking-wider text-[#4A5568] mt-2">
            {state}
          </div>
        </div>

        <div className="text-[11px] text-[#4A5568] truncate">
          {query.substring(0, 35)}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 6: Unused Indexes
// ============================================================================
function UnusedIndexesCard({ data, delay }) {
  const indexUsage = data?.index_usage || [];
  const unused = indexUsage.filter(idx => idx.idx_scan === 0);
  const wasteEstimate = unused.length * 8; // 8 MB per index estimate
  const topThree = unused.slice(0, 3).map(idx => idx.index_name || 'unknown');

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Unused Indexes
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-3xl font-mono font-bold" style={{ color: unused.length > 0 ? COLORS.amber : COLORS.green }}>
            {unused.length}
          </div>
          <div className="text-[10px] text-[#4A5568] mt-1">
            ~{wasteEstimate} MB wasted
          </div>
        </div>

        <div className="space-y-1 text-[10px] text-[#4A5568]">
          {topThree.length > 0 ? (
            topThree.map((name, i) => (
              <div key={i} className="truncate">
                • {name}
              </div>
            ))
          ) : (
            <div>No unused indexes</div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 7: Replication Lag (Sparkline)
// ============================================================================
function ReplicationLagCard({ data, delay }) {
  const lagRef = useRef([]);
  const currentLag = data?.replication_lag?.[0]?.lag_bytes || 0;

  // Update historical data
  useEffect(() => {
    if (currentLag !== undefined) {
      lagRef.current = [...lagRef.current.slice(-19), { value: currentLag }];
    }
  }, [currentLag]);

  const displayValue = currentLag >= 1024
    ? `${(currentLag / 1024).toFixed(1)}kb`
    : `${currentLag}b`;

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Replication Lag
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="h-12 flex-1">
          {lagRef.current.length > 1 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={lagRef.current}>
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={COLORS.textMono}
                  fill={`${COLORS.textMono}15`}
                  isAnimationActive={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-full text-[#4A5568] text-[10px]">
              Collecting data...
            </div>
          )}
        </div>

        <div className="mt-2">
          <div className="text-xl font-mono font-bold text-[#7FDBCA]">
            {displayValue}
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// CARD 8: Vacuum Needed
// ============================================================================
function VacuumNeededCard({ data, delay }) {
  const vacuumStats = (data?.vacuum_stats || [])
    .sort((a, b) => (b.dead_tuple_pct || 0) - (a.dead_tuple_pct || 0));

  const needsVacuum = vacuumStats.filter(t => (t.dead_tuple_pct || 0) > 10);
  const topFour = vacuumStats.slice(0, 4);

  const getVacuumStatus = (pct) => {
    if (pct > 20) return { label: 'CRITICAL', color: COLORS.red };
    if (pct > 10) return { label: 'WARNING', color: COLORS.amber };
    return { label: 'OK', color: COLORS.textDim };
  };

  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border transition-all duration-300 flex flex-col"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="text-[11px] uppercase tracking-widest text-[#7FDBCA] mb-4">
        Vacuum Needed
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div>
          <div className="text-3xl font-mono font-bold" style={{ color: needsVacuum.length > 0 ? COLORS.amber : COLORS.green }}>
            {needsVacuum.length}
          </div>
          <div className="text-[10px] text-[#4A5568] mt-1">
            tables &gt;10% dead tuples
          </div>
        </div>

        <div className="space-y-2 text-[10px]">
          {topFour.map((table, i) => {
            const status = getVacuumStatus(table.dead_tuple_pct || 0);
            return (
              <div key={i} className="flex items-center justify-between">
                <span className="truncate flex-1 text-[#4A5568]">
                  {(table.table_name || 'unknown').substring(0, 20)}
                </span>
                <div className="flex items-center gap-2">
                  <span style={{ color: status.color }}>
                    {(table.dead_tuple_pct || 0).toFixed(0)}%
                  </span>
                  <div
                    className="px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider"
                    style={{
                      backgroundColor: `${status.color}20`,
                      color: status.color,
                      border: `1px solid ${status.color}40`,
                    }}
                  >
                    {status.label}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// SKELETON STATE (Empty/Loading)
// ============================================================================
function SkeletonCard({ delay }) {
  return (
    <div
      className="rounded-lg p-4 min-h-[180px] border animate-pulse"
      style={{
        backgroundColor: COLORS.surface,
        borderColor: COLORS.border,
        animationDelay: `${delay}ms`,
      }}
    >
      <div className="h-4 w-32 bg-[#1E2535] rounded mb-4" />
      <div className="space-y-3 flex-1">
        <div className="h-8 bg-[#1E2535] rounded w-3/4" />
        <div className="h-6 bg-[#1E2535] rounded" />
        <div className="h-4 bg-[#1E2535] rounded w-1/2" />
      </div>
    </div>
  );
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================
export default function GrafanaMonitoring({ data }) {
  const cardDelay = [0, 40, 80, 120, 160, 200, 240, 280];

  const isLoading = !data;
  const isEmpty = data && !data.active_connections;

  if (isLoading || isEmpty) {
    return (
      <div className="space-y-4">
        {/* Header */}
        <div className="mb-6">
          <div
            className="text-[11px] uppercase tracking-widest font-mono"
            style={{ color: COLORS.textMono }}
          >
            MONITORING — REAL-TIME METRICS
          </div>
        </div>

        {/* Skeleton Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
            <SkeletonCard key={i} delay={cardDelay[i]} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Mission Control Header */}
      <div className="mb-6">
        <div
          className="text-[11px] uppercase tracking-widest font-mono"
          style={{ color: COLORS.textMono }}
        >
          MONITORING — REAL-TIME METRICS
        </div>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        <ConnectionPoolCard data={data} delay={cardDelay[0]} />
        <BlockingQueriesCard data={data} delay={cardDelay[1]} />
        <DeadTupleRatioCard data={data} delay={cardDelay[2]} />
        <LockWaitsCard data={data} delay={cardDelay[3]} />
        <LongestQueryCard data={data} delay={cardDelay[4]} />
        <UnusedIndexesCard data={data} delay={cardDelay[5]} />
        <ReplicationLagCard data={data} delay={cardDelay[6]} />
        <VacuumNeededCard data={data} delay={cardDelay[7]} />
      </div>
    </div>
  );
}
