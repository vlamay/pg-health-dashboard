import { motion, AnimatePresence } from 'framer-motion';
import { Server } from 'lucide-react';
import { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import WidgetSkeleton from './WidgetSkeleton';

export default function ReplicationLag({ replicas }) {
  const [history, setHistory] = useState([]);
  useEffect(() => {
    if (!replicas || replicas.length === 0) return;

    const maxLag = Math.max(...replicas.map(r => r.replay_lag_bytes || 0));
    const maxLagSeconds = Math.max(...replicas.map(r => r.replay_lag_s || 0));

    setHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          max_lag_bytes: maxLag,
          max_lag_s: maxLagSeconds
        }
      ];
      return newHistory.slice(-60);
    });
  }, [replicas]);

  const getStateBadge = (state) => {
    if (state === 'streaming') return 'badge-success';
    if (state === 'catchup') return 'badge-warning';
    return 'badge-critical';
  };

  const getLagTimeColor = (secs) => {
    if (!secs) return 'text-white/40';
    if (secs > 10) return 'text-red-300';
    if (secs > 5) return 'text-amber-300';
    return 'text-emerald-300';
  };

  if (!replicas) {
    return <WidgetSkeleton lines={3} />;
  }

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getMaxLagColor = () => {
    if (!replicas || replicas.length === 0) return '#7fdbca';
    const maxLagSeconds = Math.max(...replicas.map(r => r.replay_lag_s || 0));
    if (maxLagSeconds > 10) return '#ef4444';
    if (maxLagSeconds > 5) return '#f59e0b';
    return '#10b981';
  };

  const getChartGradient = () => {
    const maxLag = Math.max(...(replicas?.map(r => r.replay_lag_s || 0) || [0]));
    if (maxLag > 10) return 'url(#colorCritical)';
    if (maxLag > 5) return 'url(#colorWarning)';
    return 'url(#colorSuccess)';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-sm font-semibold text-white/80">Replication Lag</h2>
      </div>

      {replicas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Server className="w-10 h-10 text-white/20" />
          <p className="text-white/50 text-sm">Standalone mode</p>
          <p className="text-white/30 text-xs">No replicas configured</p>
        </div>
      ) : (
        <>
          <div className="mb-6">
            <div className="flex items-baseline gap-3 mb-3">
              <div className="metric-value text-2xl" style={{ color: getMaxLagColor() }}>
                {replicas.length > 0 ? (Math.max(...replicas.map(r => r.replay_lag_s || 0))).toFixed(1) : '0'}s
              </div>
              <div className="text-white/60 text-xs">max lag</div>
              <div className="text-white/40 text-xs">
                {replicas.length > 0 ? `(${formatBytes(Math.max(...replicas.map(r => r.replay_lag_bytes || 0)))})` : ''}
              </div>
            </div>
          </div>

          {history.length > 1 && (
            <div className="h-48 mb-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={history}>
                  <defs>
                    <linearGradient id="colorSuccess" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorWarning" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" style={{ fontSize: '11px' }} />
                  <YAxis stroke="rgba(255,255,255,0.2)" style={{ fontSize: '11px' }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(38, 38, 42, 0.95)',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px'
                    }}
                    labelStyle={{ color: 'rgba(255,255,255,0.8)' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="max_lag_s"
                    stroke={getMaxLagColor()}
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={getChartGradient()}
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}

          <div className="overflow-x-auto scrollbar-thin">
            <table className="w-full text-sm" role="table" aria-label="Replication lag statistics">
              <thead>
                <tr className="border-b border-white/[0.08]">
                  <th className="text-left py-2 px-2 section-header" scope="col">Client</th>
                  <th className="text-left py-2 px-2 section-header" scope="col">State</th>
                  <th className="text-right py-2 px-2 section-header" scope="col">Lag Bytes</th>
                  <th className="text-right py-2 px-2 section-header" scope="col">Lag (s)</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {replicas.map((replica, idx) => (
                    <motion.tr
                      key={`replica-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ delay: idx * 0.05 }}
                      className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                    >
                      <td className="py-2 px-2 metric-value text-xs text-white/70">{replica.client_addr}</td>
                      <td className="py-2 px-2">
                        <span className={`${getStateBadge(replica.state)} px-2 py-1 rounded text-xs font-medium`}>
                          {replica.state}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-right metric-value text-xs text-white/70">
                        {formatBytes(replica.replay_lag_bytes)}
                      </td>
                      <td className={`py-2 px-2 text-right metric-value text-xs font-mono ${getLagTimeColor(replica.replay_lag_s)}`}>
                        {replica.replay_lag_s ? `${replica.replay_lag_s.toFixed(1)}s` : '-'}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
