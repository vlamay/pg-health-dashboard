import { TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { rowVariants } from '../utils/animations';

export default function IndexUsage({ indexes }) {
  const getEfficiency = (idx) => {
    if (idx.idx_scan === 0) return 0;
    return idx.idx_tup_read > 0 ? Math.round((idx.idx_tup_fetch / idx.idx_tup_read) * 100) : 100;
  };

  const getEfficiencyColor = (efficiency) => {
    if (efficiency < 50) return 'bg-red-500';
    if (efficiency < 80) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  const getEfficiencyTextColor = (efficiency) => {
    if (efficiency < 50) return 'text-red-300';
    if (efficiency < 80) return 'text-amber-300';
    return 'text-emerald-300';
  };

  if (!indexes) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Index Usage</h2>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="space-y-1.5 mb-3">
            <div className="flex justify-between">
              <div className="skeleton h-3 w-48" />
              <div className="skeleton h-3 w-12" />
            </div>
            <div className="skeleton h-1.5 w-full rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  // Sort: unused first, then by lowest efficiency, then by highest scans
  const sorted = [...indexes].sort((a, b) => {
    const aUnused = a.idx_scan === 0;
    const bUnused = b.idx_scan === 0;
    if (aUnused !== bUnused) return aUnused ? -1 : 1;

    const aEff = getEfficiency(a);
    const bEff = getEfficiency(b);
    if (aEff !== bEff) return aEff - bEff;

    return b.idx_scan - a.idx_scan;
  });

  const unusedCount = sorted.filter((idx) => idx.idx_scan === 0).length;

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-white/60" />
          <h2 className="text-sm font-semibold text-white/80">Index Usage</h2>
        </div>
        {unusedCount > 0 && (
          <span className="text-xs font-mono bg-red-500/20 text-red-400 rounded px-2 py-1">
            {unusedCount} unused
          </span>
        )}
      </div>

      {indexes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <TrendingUp className="w-10 h-10 text-white/20" />
          <p className="text-white/50 text-sm">No index data available</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {sorted.map((idx, rowIdx) => {
              const efficiency = getEfficiency(idx);
              const isUnused = idx.idx_scan === 0;

              return (
                <motion.div
                  key={`index-${idx.schemaname}-${idx.tablename}-${idx.indexname}`}
                  variants={rowVariants(rowIdx)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-white/[0.02] border border-white/[0.08] p-3 rounded-lg"
                >
                  <div className="flex items-baseline justify-between gap-2 mb-1">
                    <div className="metric-value text-xs truncate text-white/70 font-mono flex-1">
                      {idx.indexname}
                    </div>
                    {isUnused ? (
                      <span className="badge-critical px-2 py-0.5 text-xs rounded whitespace-nowrap">
                        unused
                      </span>
                    ) : (
                      <div className={`metric-value text-xs font-semibold whitespace-nowrap ${getEfficiencyTextColor(efficiency)}`}>
                        {efficiency}%
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-white/40 mb-2">{idx.schemaname}.{idx.tablename}</div>
                  <div className="w-full bg-white/[0.03] rounded-full h-1.5 mb-2">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-500 ${getEfficiencyColor(efficiency)}`}
                      style={{ width: `${Math.max(2, Math.min(100, efficiency))}%` }}
                    />
                  </div>
                  <div className="text-xs text-white/40">
                    {idx.idx_scan} scans · {idx.idx_tup_fetch} rows fetched
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
