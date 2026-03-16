import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, AlertCircle } from 'lucide-react';
import { tabVariants } from '../utils/animations';

export default function VacuumStats({ stats, cacheHit }) {
  const [activeTab, setActiveTab] = useState('vacuum');

  if (!stats) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Vacuum Stats</h2>
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  const getVacuumRowColor = (deadPct) => {
    if (deadPct > 20) return 'bg-red-500/[0.08] border-red-500/[0.20]';
    if (deadPct > 10) return 'bg-amber-500/[0.08] border-amber-500/[0.20]';
    return 'bg-white/[0.02] border-white/[0.08]';
  };

  const getCacheTextColor = (hitPct) => {
    if (hitPct >= 95) return 'text-emerald-300';
    if (hitPct >= 80) return 'text-amber-300';
    return 'text-red-300';
  };

  const getCacheBarColor = (hitPct) => {
    if (hitPct >= 95) return 'bg-emerald-500';
    if (hitPct >= 80) return 'bg-amber-500';
    return 'bg-red-500';
  };

  return (
    <div className="glass-card p-6">
      {/* Pill Tab Switcher */}
      <div
        className="flex gap-2 mb-4 bg-white/[0.02] p-1 rounded-lg w-fit"
        role="tablist"
        aria-label="Vacuum Statistics Tabs"
      >
        <button
          onClick={() => setActiveTab('vacuum')}
          role="tab"
          aria-selected={activeTab === 'vacuum'}
          aria-controls="vacuum-panel"
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            activeTab === 'vacuum'
              ? 'bg-brand text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Vacuum
        </button>
        <button
          onClick={() => setActiveTab('cache')}
          role="tab"
          aria-selected={activeTab === 'cache'}
          aria-controls="cache-panel"
          className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
            activeTab === 'cache'
              ? 'bg-brand text-white'
              : 'text-white/60 hover:text-white/80'
          }`}
        >
          Cache
        </button>
      </div>

      {/* Tab Content with AnimatePresence */}
      <AnimatePresence mode="wait">
        {/* Vacuum Tab */}
        {activeTab === 'vacuum' && (
          <motion.div
            key="vacuum"
            id="vacuum-panel"
            role="tabpanel"
            aria-labelledby="vacuum-tab"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin"
          >
            {stats.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <BarChart3 className="w-10 h-10 text-white/20" />
                <p className="text-white/50 text-sm">No tables need attention</p>
                <p className="text-white/30 text-xs text-center">All tables below dead tuple threshold</p>
              </div>
            ) : (
              stats.slice(0, 10).map((table, idx) => (
                <div
                  key={`vac-${idx}`}
                  className={`border border-l-4 p-3 rounded text-sm ${getVacuumRowColor(table.dead_tuple_pct)}`}
                >
                  <div className="flex items-baseline justify-between gap-2 mb-2">
                    <div className="flex flex-col">
                      <div className="metric-value text-xs text-white/40 font-mono">{table.relname.split('.')[0]}</div>
                      <div className="metric-value text-sm truncate text-white/70 font-medium">{table.relname.split('.')[1] || table.relname}</div>
                    </div>
                    <div className={`metric-value text-xs whitespace-nowrap ${
                      table.dead_tuple_pct > 20 ? 'text-red-300' :
                      table.dead_tuple_pct > 10 ? 'text-amber-300' :
                      'text-emerald-300'
                    }`}>
                      {table.dead_tuple_pct}%
                    </div>
                  </div>
                  <div className="w-full bg-white/[0.03] rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${
                        table.dead_tuple_pct > 20 ? 'bg-red-500' :
                        table.dead_tuple_pct > 10 ? 'bg-amber-500' :
                        'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(table.dead_tuple_pct, 100)}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/40 mt-2">
                    {table.n_dead_tup} dead / {table.n_live_tup} live
                  </div>
                </div>
              ))
            )}
          </motion.div>
        )}

        {/* Cache Tab */}
        {activeTab === 'cache' && (
          <motion.div
            key="cache"
            id="cache-panel"
            role="tabpanel"
            aria-labelledby="cache-tab"
            variants={tabVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin"
          >
            {!cacheHit || cacheHit.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-3">
                <AlertCircle className="w-10 h-10 text-white/20" />
                <p className="text-white/50 text-sm">No cache statistics available</p>
                <p className="text-white/30 text-xs text-center">Waiting for cache hit data</p>
              </div>
            ) : (
              cacheHit.slice(0, 10).map((table, idx) => {
                const hitPct = table.cache_hit_pct || 0;

                return (
                  <div
                    key={`cache-${idx}`}
                    className="bg-white/[0.02] border border-white/[0.08] p-3 rounded text-sm"
                  >
                    <div className="flex items-baseline justify-between gap-2 mb-2">
                      <div className="metric-value text-xs truncate text-white/70">{table.relname}</div>
                      <div className={`metric-value text-xs font-semibold ${getCacheTextColor(hitPct)}`}>
                        {hitPct.toFixed(1)}%
                      </div>
                    </div>
                    <div className="w-full bg-white/[0.03] rounded-full h-1.5 mb-2">
                      <div
                        className={`h-1.5 rounded-full transition-all duration-500 ${getCacheBarColor(hitPct)}`}
                        style={{ width: `${Math.min(hitPct, 100)}%` }}
                      />
                    </div>
                    <div className="text-xs text-white/40">
                      {table.heap_blks_hit} hits / {table.heap_blks_read} misses
                    </div>
                  </div>
                );
              })
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
