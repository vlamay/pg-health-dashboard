import { CheckCircle, Clock, Copy, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import PulseDot from './PulseDot';
import { rowVariants } from '../utils/animations';

export default function LongestRunningQueries({ queries }) {
  const [expandedPid, setExpandedPid] = useState(null);
  const [copiedPid, setCopiedPid] = useState(null);
  const [killConfirm, setKillConfirm] = useState(null);

  const handleCopy = (text, pid) => {
    navigator.clipboard.writeText(text);
    setCopiedPid(pid);
    setTimeout(() => setCopiedPid(null), 2000);
  };

  const handleKillQuery = (pid) => {
    // In real implementation, this would call an API endpoint
    console.log(`Kill query PID ${pid}`);
    setKillConfirm(null);
    // Could show toast notification here
  };
  const getDurationColor = (secs) => {
    if (secs > 60) return 'text-red-400';
    if (secs > 5) return 'text-amber-400';
    return 'text-emerald-400';
  };

  if (!queries) {
    return (
      <div className="glass-card p-6">
        <h2 className="text-sm font-semibold text-white/80 mb-4">Longest Running Queries</h2>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2">
              <div className="skeleton h-3 w-24" />
              <div className="skeleton h-3 w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const slowQueries = queries.filter((q) => q.duration_s > 5);

  return (
    <div className="glass-card p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-white/60" />
          <h2 className="text-sm font-semibold text-white/80">Longest Running Queries</h2>
        </div>
        {slowQueries.length > 0 && (
          <span className="text-xs font-mono bg-red-500/20 text-red-400 rounded px-2 py-1">
            {slowQueries.length} slow
          </span>
        )}
      </div>

      {queries.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 gap-3">
          <CheckCircle className="w-10 h-10 text-emerald-400/50" />
          <p className="text-white/50 text-sm font-medium">No long-running queries</p>
          <p className="text-white/30 text-xs text-center">All queries completing within expected time</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto scrollbar-thin">
          <AnimatePresence mode="popLayout">
            {queries.map((query, idx) => {
              const durationColor = getDurationColor(query.duration_s);
              const bgColor =
                query.duration_s > 60
                  ? 'bg-red-500/[0.08] border-red-500/[0.20]'
                  : query.duration_s > 5
                    ? 'bg-amber-500/[0.08] border-amber-500/[0.20]'
                    : 'bg-white/[0.02] border-white/[0.08]';

              return (
                <motion.div
                  key={`query-${query.pid}`}
                  variants={rowVariants(idx)}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className={`${bgColor} border rounded-lg p-3`}
                  role="article"
                  aria-label={`Query PID ${query.pid} running for ${query.duration_s.toFixed(1)} seconds`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <PulseDot color="amber" size="sm" />
                      <div className="metric-value text-sm text-white/70">PID {query.pid}</div>
                    </div>
                    <div className={`text-xs font-mono ${durationColor}`}>
                      {query.duration_s.toFixed(1)}s
                    </div>
                  </div>

                  {/* Query Text - Expandable */}
                  <div className="mb-2">
                    {expandedPid === query.pid ? (
                      <div className="text-xs text-white/60 bg-white/[0.02] rounded p-2 font-mono max-h-32 overflow-y-auto scrollbar-thin">
                        {query.query}
                      </div>
                    ) : (
                      <div className="text-xs text-white/60 truncate" title={query.query}>
                        {query.query}
                      </div>
                    )}
                  </div>

                  <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                    <span
                      className={`${
                        query.state === 'idle in transaction'
                          ? 'badge-warning'
                          : query.state === 'active'
                            ? 'badge-info'
                            : 'badge-success'
                      } px-2 py-1 text-xs rounded`}
                    >
                      {query.state}
                    </span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-1">
                    <button
                      onClick={() => handleCopy(query.query, query.pid)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/[0.08] text-white/70 hover:bg-white/[0.12] transition-colors"
                      title="Copy query to clipboard"
                    >
                      {copiedPid === query.pid ? (
                        <>
                          <span>✓</span>
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setExpandedPid(expandedPid === query.pid ? null : query.pid)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-white/[0.08] text-white/70 hover:bg-white/[0.12] transition-colors"
                      title="Expand full query"
                    >
                      <span>{expandedPid === query.pid ? 'Collapse' : 'Expand'}</span>
                    </button>

                    <button
                      onClick={() => setKillConfirm(killConfirm === query.pid ? null : query.pid)}
                      className="flex items-center gap-1 px-2 py-1 text-xs rounded bg-red-500/[0.15] text-red-400 hover:bg-red-500/[0.25] transition-colors"
                      title="Kill this query"
                    >
                      <X className="w-3 h-3" />
                      <span>Kill</span>
                    </button>
                  </div>

                  {/* Kill Confirmation */}
                  {killConfirm === query.pid && (
                    <motion.div
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 p-2 rounded bg-red-500/[0.10] border border-red-500/[0.20] flex items-center gap-2"
                    >
                      <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      <span className="text-xs text-red-300 flex-1">
                        Kill PID {query.pid}?
                      </span>
                      <button
                        onClick={() => handleKillQuery(query.pid)}
                        className="px-2 py-0.5 text-xs rounded bg-red-500/[0.30] text-red-300 hover:bg-red-500/[0.40] transition-colors whitespace-nowrap"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={() => setKillConfirm(null)}
                        className="px-2 py-0.5 text-xs rounded bg-white/[0.10] text-white/60 hover:bg-white/[0.15] transition-colors"
                      >
                        Cancel
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
