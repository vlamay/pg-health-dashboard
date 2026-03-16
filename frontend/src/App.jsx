import { useWebSocket } from './hooks/useWebSocket';
import { motion } from 'framer-motion';
import { useState, useEffect, useRef } from 'react';
import { useNotification } from './context/NotificationContext';
import { Database, WifiOff } from 'lucide-react';
import Sidebar from './components/Sidebar';
import ClusterOverview from './components/ClusterOverview';
import PulseDot from './components/PulseDot';
import MetricOverview from './components/MetricOverview';
import AlertBanner from './components/AlertBanner';
import ConnectionPool from './components/ConnectionPool';
import BlockingQueries from './components/BlockingQueries';
import ReplicationLag from './components/ReplicationLag';
import VacuumStats from './components/VacuumStats';
import CacheMissLeaders from './components/CacheMissLeaders';
import LongestRunningQueries from './components/LongestRunningQueries';
import LockWaits from './components/LockWaits';
import IndexUsage from './components/IndexUsage';
import GrafanaMonitoring from './components/GrafanaMonitoring';
import QueryExplorer from './components/QueryExplorer';
import WidgetErrorBoundary from './components/WidgetErrorBoundary';
import NotificationContainer from './components/NotificationContainer';
import { containerVariants, cardVariants, sectionVariants } from './utils/animations';

const WS_URL = `ws://${window.location.host}/ws/metrics`;

const sectionTitles = {
  overview: 'Overview',
  issues: 'Active Issues',
  health: 'Database Health',
  performance: 'Performance',
  monitoring: 'Monitoring'
};

// Check if demo mode is active
const isDemoMode = new URLSearchParams(window.location.search).get('demo') === 'true';

export default function App() {
  const { data, status, lastUpdated } = useWebSocket(WS_URL);
  const { addNotification } = useNotification();

  // Initialize from URL hash or default
  const [activeSection, setActiveSection] = useState(() => {
    const hash = window.location.hash.slice(1);
    return ['overview', 'issues', 'health', 'performance', 'monitoring'].includes(hash) ? hash : 'overview';
  });

  const [sidebarCollapsed, setSidebarCollapsed] = useState(() =>
    localStorage.getItem('sidebar-collapsed') === 'true'
  );

  // Track previous state to detect new events
  const prevDataRef = useRef(null);

  // Sync active section to URL hash
  useEffect(() => {
    window.location.hash = activeSection;
  }, [activeSection]);

  // Handle browser back/forward buttons
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.slice(1);
      if (['overview', 'issues', 'health', 'performance', 'monitoring'].includes(hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Monitor for critical events
  useEffect(() => {
    if (!data) return;

    const prevData = prevDataRef.current;
    prevDataRef.current = data;

    // New blocking queries
    if (!prevData) return;
    const newBlockingCount = data.blocking_queries?.length || 0;
    const prevBlockingCount = prevData.blocking_queries?.length || 0;

    if (newBlockingCount > prevBlockingCount && newBlockingCount > 0) {
      addNotification(
        `⚠️ ${newBlockingCount} blocking quer${newBlockingCount > 1 ? 'ies' : 'y'} detected`,
        'warning',
        5000
      );
    }

    // New lock waits
    const newLockCount = data.lock_waits?.length || 0;
    const prevLockCount = prevData.lock_waits?.length || 0;

    if (newLockCount > prevLockCount && newLockCount > 0) {
      addNotification(
        `🔒 ${newLockCount} lock wait${newLockCount > 1 ? 's' : ''} detected`,
        'error',
        5000
      );
    }

    // High replication lag
    const maxLag = Math.max(...(data.replication_lag?.map(r => r.replay_lag_s || 0) || [0])) || 0;
    const prevMaxLag = Math.max(...(prevData.replication_lag?.map(r => r.replay_lag_s || 0) || [0])) || 0;

    if (maxLag > 10 && prevMaxLag <= 10) {
      addNotification(
        `⏱️ Replication lag exceeded 10s (${maxLag.toFixed(1)}s)`,
        'error',
        5000
      );
    }

    // High dead tuples
    const badDeadTables = data.vacuum_stats?.filter(t => t.dead_tuple_pct > 30).length || 0;
    const prevBadDeadTables = prevData.vacuum_stats?.filter(t => t.dead_tuple_pct > 30).length || 0;

    if (badDeadTables > prevBadDeadTables && badDeadTables > 0) {
      addNotification(
        `📊 ${badDeadTables} table(s) need vacuum (>30% dead tuples)`,
        'warning',
        5000
      );
    }
  }, [data, addNotification]);

  // Format "time ago" for last update
  const formatTimeAgo = (date) => {
    if (!date) return 'never';
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 5) return 'just now';
    if (seconds < 60) return `${seconds}s ago`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m ago`;
    return 'long ago';
  };

  const handleSidebarToggle = (next) => {
    setSidebarCollapsed(next);
    localStorage.setItem('sidebar-collapsed', String(next));
  };

  const getStatusDot = () => {
    switch (status) {
      case 'open':
        return 'green';
      case 'connecting':
        return 'amber';
      case 'closed':
      case 'error':
        return 'red';
      default:
        return 'blue';
    }
  };

  // Derive metrics for MetricOverview
  const connections = data?.active_connections?.active || 0;
  const blockingCount = data?.blocking_queries?.length || 0;
  const lockWaitCount = data?.lock_waits?.length || 0;
  const issueCount = blockingCount + lockWaitCount;
  const deadTupleTables = data?.vacuum_stats?.filter((t) => t.dead_tuple_pct > 10).length || 0;
  const cacheHitAvg = data?.cache_hit_ratio?.length
    ? Math.round(
        data.cache_hit_ratio.reduce((sum, t) => sum + (t.cache_hit_pct || 0), 0) / data.cache_hit_ratio.length
      )
    : 0;

  const handleSectionChange = (sectionId) => {
    setActiveSection(sectionId);
    // Smooth scroll to section
    setTimeout(() => {
      const sectionElement = document.getElementById(`section-${sectionId}`);
      if (sectionElement) {
        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  };

  const toggleDemoMode = () => {
    const url = new URL(window.location);
    if (isDemoMode) {
      url.searchParams.delete('demo');
    } else {
      url.searchParams.set('demo', 'true');
    }
    window.location.href = url.toString();
  };

  // Global connecting splash when no data yet
  if (!data && status === 'connecting') {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#09090b' }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-white/[0.05] flex items-center justify-center">
            <Database className="w-6 h-6" style={{ color: '#3ECF8E' }} />
          </div>
          <p className="text-white/60 text-sm">Connecting to PostgreSQL monitor…</p>
          <PulseDot color="green" size="md" />
        </div>
      </div>
    );
  }

  // Error/disconnected screen when connection fails with no prior data
  if (!data && (status === 'error' || status === 'closed')) {
    return (
      <div className="flex min-h-screen items-center justify-center" style={{ backgroundColor: '#09090b' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4 text-center max-w-sm"
        >
          <div className="w-14 h-14 rounded-xl bg-red-500/[0.08] border border-red-500/[0.20] flex items-center justify-center">
            <WifiOff className="w-7 h-7 text-red-400" />
          </div>
          <div>
            <h2 className="text-white font-semibold text-lg mb-1">Connection Lost</h2>
            <p className="text-white/50 text-sm">Disconnected from the PostgreSQL monitor.</p>
            <p className="text-white/30 text-xs mt-1">Attempting to reconnect automatically…</p>
          </div>
          <PulseDot color="red" size="md" />
          <button
            onClick={toggleDemoMode}
            className="px-4 py-2 text-sm rounded-lg border border-white/20 text-white/60 hover:text-white/80 transition-colors"
          >
            Switch to Demo Mode
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen" style={{ backgroundColor: '#09090b' }}>
      {/* Sidebar */}
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        connectionStatus={status}
        issueCount={issueCount}
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      {/* Main Content Area */}
      <div className={`flex-1 flex flex-col transition-[margin] duration-300 ${sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'} pb-20 md:pb-0`}>
        {/* Header */}
        <header
          className="sticky top-0 z-50 backdrop-blur-md border-b border-white/[0.09] h-14 font-ibm-mono"
          style={{ backgroundColor: 'rgba(9, 9, 11, 0.85)' }}
        >
          <div className="h-full px-3 md:px-6 flex items-center justify-between">
            <h1 className="text-xs md:text-sm font-semibold text-white uppercase tracking-widest">{sectionTitles[activeSection]}</h1>
            <div className="flex items-center gap-2 md:gap-4">
              {isDemoMode && (
                <div className="px-2 py-1 md:px-3 md:py-1.5 rounded text-xs font-mono bg-blue-500/20 text-blue-300 border border-blue-500/30 transition-all">
                  DEMO
                </div>
              )}
              <button
                onClick={toggleDemoMode}
                className="px-2 py-1 md:px-3 md:py-1.5 text-xs rounded-lg border border-white/20 text-white/60 hover:text-white/80 hover:border-white/40 transition-colors font-mono uppercase tracking-wider hidden md:block"
                title={isDemoMode ? 'Switch to real data' : 'Switch to demo mode'}
              >
                {isDemoMode ? '↻ REAL' : '↻ DEMO'}
              </button>
              <div className="hidden sm:flex items-center gap-2 border-l border-white/[0.09] pl-2 md:pl-4">
                <div className="flex items-center gap-1.5">
                  <PulseDot color={getStatusDot()} size="md" />
                  <span className="text-xs font-mono uppercase tracking-wider text-white/70">
                    ●&nbsp;{status === 'open' ? 'ONLINE' : status === 'connecting' ? 'CONNECTING' : 'OFFLINE'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto px-3 py-4 md:px-6 md:py-8 space-y-4 md:space-y-8 scrollbar-thin">
          {/* Cluster Overview Hero Card */}
          {data && (
            <WidgetErrorBoundary>
              <ClusterOverview data={data} />
            </WidgetErrorBoundary>
          )}

          {/* Section: Overview */}
          <motion.section
            id="section-overview"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
          >
            {data && (
              <WidgetErrorBoundary>
                <MetricOverview
                  connections={connections}
                  blockingCount={blockingCount}
                  deadTupleTables={deadTupleTables}
                  cacheHitAvg={cacheHitAvg}
                />
              </WidgetErrorBoundary>
            )}
          </motion.section>

          {/* Alerts Banner */}
          {data && data.alerts && (
            <WidgetErrorBoundary>
              <AlertBanner alerts={data.alerts} />
            </WidgetErrorBoundary>
          )}

          {/* Section: Active Issues */}
          <motion.section
            id="section-issues"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 md:space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <motion.div variants={cardVariants}>
                  {data && (
                    <WidgetErrorBoundary>
                      <BlockingQueries queries={data.blocking_queries} />
                    </WidgetErrorBoundary>
                  )}
                </motion.div>
                <motion.div variants={cardVariants}>
                  {data && (
                    <WidgetErrorBoundary>
                      <CacheMissLeaders cacheHit={data.cache_hit_ratio} />
                    </WidgetErrorBoundary>
                  )}
                </motion.div>
              </div>
              <motion.div variants={cardVariants}>
                {data && (
                  <WidgetErrorBoundary>
                    <LockWaits waits={data.lock_waits} />
                  </WidgetErrorBoundary>
                )}
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Section: Database Health */}
          <motion.section
            id="section-health"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="grid grid-cols-1 lg:grid-cols-2 gap-4"
            >
              <motion.div variants={cardVariants}>
                {data && (
                  <WidgetErrorBoundary>
                    <VacuumStats stats={data.vacuum_stats} cacheHit={data.cache_hit_ratio} />
                  </WidgetErrorBoundary>
                )}
              </motion.div>
              <motion.div variants={cardVariants}>
                {data && (
                  <WidgetErrorBoundary>
                    <ReplicationLag replicas={data.replication_lag} />
                  </WidgetErrorBoundary>
                )}
              </motion.div>
            </motion.div>
          </motion.section>

          {/* Section: Performance */}
          <motion.section
            id="section-performance"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="space-y-3 md:space-y-4"
            >
              <motion.div variants={cardVariants}>
                {data && (
                  <WidgetErrorBoundary>
                    <ConnectionPool data={data.active_connections} />
                  </WidgetErrorBoundary>
                )}
              </motion.div>

              {/* Query Explorer - Full Width */}
              <motion.div variants={cardVariants}>
                {data && (
                  <WidgetErrorBoundary>
                    <QueryExplorer queries={data.longest_running_queries} />
                  </WidgetErrorBoundary>
                )}
              </motion.div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                <motion.div variants={cardVariants}>
                  {data && (
                    <WidgetErrorBoundary>
                      <LongestRunningQueries queries={data.longest_running_queries} />
                    </WidgetErrorBoundary>
                  )}
                </motion.div>
                <motion.div variants={cardVariants}>
                  {data && (
                    <WidgetErrorBoundary>
                      <IndexUsage indexes={data.index_usage} />
                    </WidgetErrorBoundary>
                  )}
                </motion.div>
              </div>
            </motion.div>
          </motion.section>

          {/* Section: Monitoring */}
          <motion.section
            id="section-monitoring"
            variants={sectionVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.2 }}
          >
            {data && (
              <WidgetErrorBoundary>
                <GrafanaMonitoring data={data} />
              </WidgetErrorBoundary>
            )}
          </motion.section>

          {/* Footer with last update time */}
          <div className="mt-4 md:mt-8 pt-4 border-t border-white/[0.08] text-xs text-white/40 flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div className="hidden md:block">
              {isDemoMode && <span className="badge-warning px-2 py-1 rounded text-xs mr-3">Demo Mode</span>}
              {data && <span>Last update: {formatTimeAgo(lastUpdated)}</span>}
            </div>
            <div className="flex items-center gap-2 text-xs">
              <PulseDot color={getStatusDot()} size="sm" />
              <span className="hidden sm:inline">{status === 'open' ? 'Connected' : status === 'connecting' ? 'Connecting...' : 'Disconnected'}</span>
            </div>
          </div>
        </main>
      </div>

      {/* Notifications */}
      <NotificationContainer />
    </div>
  );
}
