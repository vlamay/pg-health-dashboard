import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, Zap, Server, AlertTriangle } from 'lucide-react';
import { containerVariants, cardVariants } from '../utils/animations';
import WidgetSkeleton from './WidgetSkeleton';

export default function ClusterOverview({ data }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!data?.active_connections) return;

    setHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          active: data.active_connections.active || 0
        }
      ];
      // Keep last 30 points for sparkline
      return newHistory.slice(-30);
    });
  }, [data]);

  if (!data) {
    return <WidgetSkeleton lines={4} />;
  }

  const connections = data.active_connections?.active || 0;
  const blocking = data.blocking_queries?.length || 0;
  const cacheHit = data.cache_hit_ratio?.length
    ? Math.round(data.cache_hit_ratio.reduce((sum, t) => sum + (t.cache_hit_pct || 0), 0) / data.cache_hit_ratio.length)
    : 0;
  const deadTuples = data.vacuum_stats?.filter((t) => t.dead_tuple_pct > 10).length || 0;
  const lockWaits = data.lock_waits?.length || 0;
  const replicationLag = Math.max(...(data.replication_lag?.map(r => r.replay_lag_s || 0) || [0])) || 0;
  const connectionPoolUtilization = data.active_connections?.utilization_pct || 0;

  // Calculate Health Score (0-100)
  const calculateHealthScore = () => {
    let score = 100;
    score -= blocking * 5; // Blocking queries penalty
    score -= lockWaits * 3; // Lock waits penalty
    score -= (100 - cacheHit) * 0.3; // Cache hit ratio penalty
    score -= deadTuples * 2; // Dead tuples penalty
    if (connectionPoolUtilization > 80) score -= 1;
    if (replicationLag > 5) score -= 4; // Replication lag penalty

    return Math.max(0, Math.min(100, Math.round(score)));
  };

  const healthScore = calculateHealthScore();

  const getHealthColor = (score) => {
    if (score >= 80) return { bg: '#10b981', text: '#6ee7b7' }; // green
    if (score >= 60) return { bg: '#f59e0b', text: '#fbbf24' }; // amber
    if (score >= 40) return { bg: '#ef5350', text: '#ff8a80' }; // red-orange
    return { bg: '#ef4444', text: '#ff5c5c' }; // red
  };

  const getChipColor = (label, value) => {
    if (label === 'Blocking' && value > 0) return '#ef4444';  // red
    if (label === 'Cache Hit' && parseInt(value) < 90) return '#f59e0b'; // amber
    if (label === 'Dead Tables' && value > 0) return '#f59e0b'; // amber
    return '#3ECF8E'; // brand green
  };

  const statChips = [
    { icon: Activity, label: 'Connections', value: connections },
    { icon: AlertTriangle, label: 'Blocking', value: blocking },
    { icon: Zap, label: 'Cache Hit', value: `${cacheHit}%` },
    { icon: Server, label: 'Dead Tables', value: deadTuples }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="glass-card p-8"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1">
          <h2 className="text-xl font-bold text-white mb-1">Cluster Overview</h2>
          <p className="text-sm text-white/50">pghealth · PostgreSQL 16 · Connected</p>
        </div>
        <div className="text-right flex flex-col items-end gap-4">
          <div>
            <p className="text-xs text-white/40 mb-1">Uptime</p>
            <p className="text-lg font-mono font-semibold text-white">Live</p>
          </div>
          <div className="flex flex-col items-end">
            <p className="text-xs text-white/40 mb-1">Health Score</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-mono font-bold" style={{ color: getHealthColor(healthScore).text }}>
                {healthScore}
              </p>
              <div className="text-xs text-white/60 whitespace-nowrap">
                / 100
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stat Chips */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4 mb-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {statChips.map((chip, idx) => {
          const Icon = chip.icon;
          const chipColor = getChipColor(chip.label, chip.value);
          return (
            <motion.div
              key={idx}
              variants={cardVariants}
              className="flex items-center gap-3 px-4 py-3 rounded-lg bg-white/[0.02] border border-white/[0.06]"
            >
              <Icon className="w-3 md:w-4 h-3 md:h-4 flex-shrink-0" style={{ color: chipColor }} />
              <div className="min-w-0">
                <p className="text-xs text-white/50 truncate hidden md:block">{chip.label}</p>
                <p className="font-mono font-semibold text-white text-xs md:text-sm">{chip.value}</p>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* Sparkline Chart */}
      {history.length > 1 && (
        <div className="h-24">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2DD4BF" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#2DD4BF" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="time" stroke="transparent" style={{ fontSize: '10px' }} />
              <YAxis stroke="transparent" style={{ fontSize: '10px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(38, 38, 42, 0.95)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px'
                }}
                labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                cursor={false}
              />
              <Area
                type="monotone"
                dataKey="active"
                stroke="#3ECF8E"
                strokeWidth={2}
                fill="url(#tealGradient)"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </motion.div>
  );
}
