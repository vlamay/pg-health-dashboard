import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';
import { rowVariants } from '../utils/animations';

export default function CacheMissLeaders({ cacheHit }) {
  const getCacheBarColor = (hitPct) => {
    if (hitPct >= 90) return 'bg-emerald-500';
    if (hitPct >= 70) return 'bg-amber-500';
    return 'bg-red-500';
  };

  const getCacheTextColor = (hitPct) => {
    if (hitPct >= 90) return 'text-emerald-300';
    if (hitPct >= 70) return 'text-amber-300';
    return 'text-red-300';
  };

  if (!cacheHit || cacheHit.length === 0) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Cache Miss Leaders</h2>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Zap className="w-10 h-10 text-white/20" />
          <p className="text-white/50 text-sm">No cache data available</p>
          <p className="text-white/30 text-xs text-center">Waiting for cache statistics</p>
        </div>
      </div>
    );
  }

  // Find tables below 90% cache hit ratio, sorted by worst first
  const problemTables = cacheHit
    .filter((table) => table.cache_hit_pct < 90)
    .sort((a, b) => a.cache_hit_pct - b.cache_hit_pct)
    .slice(0, 5);

  const badgeCount = cacheHit.filter((t) => t.cache_hit_pct < 90).length;

  if (problemTables.length === 0) {
    return (
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-white/80">Cache Miss Leaders</h2>
          <span className="text-xs font-mono bg-emerald-500/20 text-emerald-400 rounded px-2 py-1">
            0 tables
          </span>
        </div>
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <Zap className="w-10 h-10 text-emerald-400/50" />
          <p className="text-white/50 text-sm font-medium">Cache performance is excellent</p>
          <p className="text-white/30 text-xs">All tables above 90% cache hit ratio</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/80">Cache Miss Leaders</h2>
        <span className="text-xs font-mono bg-red-500/20 text-red-400 rounded px-2 py-1">
          {badgeCount} tables
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
        <AnimatePresence mode="popLayout">
          {problemTables.map((table, idx) => {
            const hitPct = table.cache_hit_pct || 0;
            return (
              <motion.div
                key={`cache-${table.relname}`}
                variants={rowVariants(idx)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-white/[0.02] border border-white/[0.08] p-3 rounded-lg"
              >
                <div className="flex items-baseline justify-between gap-2 mb-2">
                  <div className="flex flex-col flex-1">
                    <div className="metric-value text-xs text-white/40 font-mono">{table.relname.split('.')[0]}</div>
                    <div className="metric-value text-sm truncate text-white/70 font-medium">{table.relname.split('.')[1] || table.relname}</div>
                  </div>
                  <div className={`metric-value text-xs font-semibold whitespace-nowrap ${getCacheTextColor(hitPct)}`}>
                    {hitPct.toFixed(1)}%
                  </div>
                </div>
                <div className="w-full bg-white/[0.03] rounded-full h-1.5">
                  <div
                    className={`h-1.5 rounded-full transition-all duration-500 ${getCacheBarColor(hitPct)}`}
                    style={{ width: `${Math.min(hitPct, 100)}%` }}
                  />
                </div>
                <div className="text-xs text-white/40 mt-2">
                  {table.heap_blks_hit} hits / {table.heap_blks_read} misses
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
