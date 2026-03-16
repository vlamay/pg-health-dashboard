import { ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseDot from './PulseDot';

export default function LockWaits({ waits }) {
  const getWaitTimeColor = (secs) => {
    if (secs > 10) return 'text-red-300';
    if (secs > 3) return 'text-amber-300';
    return 'text-emerald-300';
  };

  if (!waits) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Lock Waits</h2>
        <div className="space-y-2">
          {[0, 1, 2].map((i) => (
            <div key={i} className="skeleton h-8 w-full rounded" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-semibold text-white/80">Lock Waits</h2>
        {waits.length > 0 && (
          <span className="text-xs font-mono bg-amber-500/20 text-amber-400 rounded px-2 py-1">
            {waits.length} waiting
          </span>
        )}
      </div>

      {waits.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <ShieldCheck className="w-10 h-10 text-emerald-400/50" />
          <p className="text-white/50 text-sm font-medium">No lock waits</p>
          <p className="text-white/30 text-xs text-center">Database has no blocked queries</p>
        </div>
      ) : (
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-sm" role="table" aria-label="Lock waits queue">
            <thead>
              <tr className="border-b border-white/[0.08]">
                <th className="text-left py-2 px-2 section-header" scope="col">
                  Waiting PID
                </th>
                <th className="text-left py-2 px-2 section-header" scope="col">
                  Blocking PID
                </th>
                <th className="text-left py-2 px-2 section-header" scope="col">
                  Relation
                </th>
                <th className="text-right py-2 px-2 section-header" scope="col">
                  Wait Time
                </th>
                <th className="text-left py-2 px-2 section-header" scope="col">
                  Query
                </th>
              </tr>
            </thead>
            <tbody>
              <AnimatePresence mode="popLayout">
                {waits.map((wait, idx) => (
                  <motion.tr
                    key={`lock-wait-${wait.pid}`}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ delay: idx * 0.05 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="py-2 px-2 metric-value text-xs">
                      <div className="flex items-center gap-2">
                        <PulseDot color="amber" size="sm" />
                        <span className="text-white/70 font-mono">{wait.pid}</span>
                      </div>
                    </td>
                    <td className="py-2 px-2 metric-value text-xs text-red-300 font-mono">
                      {wait.blocking_pid}
                    </td>
                    <td className="py-2 px-2 text-xs text-white/50 truncate max-w-[120px]" title={wait.relation}>
                      {wait.relation.replace('public.', '')}
                    </td>
                    <td className={`py-2 px-2 text-right metric-value text-xs font-mono ${getWaitTimeColor(wait.wait_duration_s)}`}>
                      {wait.wait_duration_s.toFixed(1)}s
                    </td>
                    <td className="py-2 px-2 text-xs text-white/60 truncate max-w-[200px]" title={wait.query}>
                      {wait.query}
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
