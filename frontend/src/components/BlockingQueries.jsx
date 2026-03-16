import { CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseDot from './PulseDot';
import { rowVariants } from '../utils/animations';

export default function BlockingQueries({ queries }) {
  const getDurationColor = (secs) => {
    if (secs > 60) return 'text-red-400';
    if (secs > 5) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (!queries) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Blocking Queries</h2>
        <div className="text-white/40">Loading...</div>
      </div>
    );
  }

  return (
    <div className="glass-card p-6">
      <h2 className="text-sm font-semibold text-white/80 mb-4">Blocking Queries</h2>

      {queries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400/50" />
          <p className="text-white/50 text-sm font-medium">No blocking queries</p>
          <p className="text-white/30 text-xs text-center">Database is healthy — no lock contention detected</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {queries.map((query, idx) => (
              <motion.div
                key={`blocker-${query.blocker_pid}`}
                variants={rowVariants(idx)}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="bg-red-500/[0.08] border border-red-500/[0.20] rounded-lg p-3"
                role="article"
                aria-label={`Blocking query from PID ${query.blocker_pid} blocking ${query.victim_pids.length} process(es)`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <PulseDot color="red" size="sm" />
                    <div className="metric-value text-sm text-red-300">PID {query.blocker_pid}</div>
                  </div>
                  <div className={`text-xs font-mono ${getDurationColor(query.blocker_duration_s)}`}>{query.blocker_duration_s.toFixed(1)}s</div>
                </div>
                <div
                  className="text-xs text-white/60 mb-2 truncate"
                  title={query.blocker_query}
                >
                  {query.blocker_query}
                </div>
                <div className="flex flex-wrap gap-1">
                  {query.victim_pids.map((pid) => (
                    <span
                      key={`victim-${pid}`}
                      className="badge-critical px-2 py-1 text-xs rounded"
                    >
                      victim: {pid}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
