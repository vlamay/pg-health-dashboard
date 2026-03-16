import { motion } from 'framer-motion';
import { useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Search, Copy, X } from 'lucide-react';

export default function QueryExplorer({ queries }) {
  const [sortConfig, setSortConfig] = useState({ key: 'duration_s', direction: 'desc' });
  const [filterState, setFilterState] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // Filter and sort queries
  const filteredQueries = useMemo(() => {
    let result = [...(queries || [])];

    // Filter by state
    if (filterState) {
      result = result.filter(q => q.state === filterState);
    }

    // Filter by search text
    if (searchQuery) {
      const search = searchQuery.toLowerCase();
      result = result.filter(q =>
        (q.query?.toLowerCase() || '').includes(search) ||
        (q.state?.toLowerCase() || '').includes(search) ||
        String(q.pid).includes(search)
      );
    }

    // Sort
    result.sort((a, b) => {
      const aVal = a[sortConfig.key];
      const bVal = b[sortConfig.key];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortConfig.direction === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal || '').toLowerCase();
      const bStr = String(bVal || '').toLowerCase();
      return sortConfig.direction === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return result;
  }, [queries, sortConfig, filterState, searchQuery]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleCopyQuery = (query, pid) => {
    navigator.clipboard.writeText(query || '');
    setCopiedId(pid);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getStateColor = (state) => {
    if (state === 'active') return 'text-emerald-400';
    if (state === 'idle in transaction') return 'text-amber-400';
    if (state?.includes('wait')) return 'text-red-400';
    return 'text-white/60';
  };

  const SortHeader = ({ label, sortKey }) => (
    <button
      onClick={() => handleSort(sortKey)}
      className="flex items-center gap-1 hover:text-white transition-colors"
    >
      <span>{label}</span>
      {sortConfig.key === sortKey && (
        sortConfig.direction === 'asc'
          ? <ChevronUp className="w-4 h-4" />
          : <ChevronDown className="w-4 h-4" />
      )}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-6"
    >
      <h2 className="text-sm font-semibold text-white mb-4">Query Explorer</h2>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-3 mb-4">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search queries, PIDs, states..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm placeholder:text-white/40 focus:outline-none focus:border-white/[0.15]"
          />
        </div>

        <select
          value={filterState}
          onChange={(e) => setFilterState(e.target.value)}
          className="px-3 py-2 rounded-lg bg-white/[0.03] border border-white/[0.08] text-white text-sm focus:outline-none focus:border-white/[0.15]"
        >
          <option value="">All States</option>
          <option value="active">Active</option>
          <option value="idle in transaction">Idle in Transaction</option>
          <option value="idle">Idle</option>
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto scrollbar-thin border border-white/[0.08] rounded-lg">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.02]">
              <th className="px-3 py-3 text-left font-semibold text-white/80 w-12">PID</th>
              <th className="px-3 py-3 text-left font-semibold text-white/80 flex-1">
                <SortHeader label="Query" sortKey="query" />
              </th>
              <th className="px-3 py-3 text-right font-semibold text-white/80 w-20">
                <SortHeader label="Duration" sortKey="duration_s" />
              </th>
              <th className="px-3 py-3 text-left font-semibold text-white/80 w-32">
                <SortHeader label="State" sortKey="state" />
              </th>
              <th className="px-3 py-3 text-center font-semibold text-white/80 w-10">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredQueries.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-3 py-8 text-center text-white/40">
                  No queries found
                </td>
              </tr>
            ) : (
              filteredQueries.map((query, idx) => (
                <motion.tr
                  key={`query-${query.pid}-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02] transition-colors"
                >
                  <td className="px-3 py-2 font-mono text-white/70">{query.pid}</td>
                  <td className="px-3 py-2 text-white/70 truncate" title={query.query}>
                    {query.query}
                  </td>
                  <td className="px-3 py-2 text-right font-mono text-white/70">
                    {query.duration_s.toFixed(1)}s
                  </td>
                  <td className="px-3 py-2">
                    <span className={`text-xs font-medium ${getStateColor(query.state)}`}>
                      {query.state}
                    </span>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <button
                      onClick={() => handleCopyQuery(query.query, query.pid)}
                      className="inline-flex items-center justify-center p-1.5 rounded hover:bg-white/[0.08] transition-colors"
                      title="Copy query"
                    >
                      {copiedId === query.pid ? (
                        <span className="text-xs text-emerald-400">✓</span>
                      ) : (
                        <Copy className="w-3 h-3 text-white/40 hover:text-white/60" />
                      )}
                    </button>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      <div className="mt-4 flex items-center justify-between text-xs text-white/40">
        <span>{filteredQueries.length} of {queries?.length || 0} queries</span>
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="flex items-center gap-1 text-white/60 hover:text-white transition-colors"
          >
            Clear search
            <X className="w-3 h-3" />
          </button>
        )}
      </div>
    </motion.div>
  );
}
