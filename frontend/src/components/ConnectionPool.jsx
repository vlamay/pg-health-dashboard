import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useEffect, useState } from 'react';
import PulseDot from './PulseDot';

export default function ConnectionPool({ data }) {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    if (!data) return;

    setHistory((prev) => {
      const newHistory = [
        ...prev,
        {
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          utilization: data.utilization_pct,
          active: data.active
        }
      ];
      // Keep last 60 points
      return newHistory.slice(-60);
    });
  }, [data]);

  if (!data) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Connection Pool</h2>
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  const utilization = data.utilization_pct || 0;
  const getChartColor = () => {
    if (utilization > 90) return '#ef4444';
    if (utilization > 75) return '#f59e0b';
    return '#10b981';
  };

  const getChartGradient = () => {
    if (utilization > 90) return 'url(#colorCritical)';
    if (utilization > 75) return 'url(#colorWarning)';
    return 'url(#colorSuccess)';
  };

  const getStatusColor = () => {
    if (utilization > 90) return 'red';
    if (utilization > 75) return 'amber';
    return 'green';
  };

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h2 className="text-sm font-semibold text-white/80">Connection Pool</h2>
          <PulseDot color={getStatusColor()} size="sm" />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex items-baseline gap-4 mb-2">
          <div className="metric-value text-3xl">{data.active}</div>
          <div className="text-white/60 text-sm">/ {data.max_connections}</div>
          <div className={`metric-value text-xl ${
            utilization > 90 ? 'text-red-300' : utilization > 75 ? 'text-amber-300' : 'text-emerald-300'
          }`}>
            {utilization.toFixed(1)}%
          </div>
        </div>
        <div className="w-full bg-white/[0.03] rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-500 ${
              utilization > 90 ? 'bg-red-500' : utilization > 75 ? 'bg-amber-500' : 'bg-emerald-500'
            }`}
            style={{ width: `${Math.min(utilization, 100)}%` }}
          />
        </div>
      </div>

      {history.length > 1 && (
        <div className="h-64">
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
                dataKey="utilization"
                stroke={getChartColor()}
                strokeWidth={2}
                fillOpacity={1}
                fill={getChartGradient()}
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
