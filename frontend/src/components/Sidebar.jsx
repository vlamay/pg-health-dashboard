import { LayoutGrid, AlertTriangle, Database, Activity, BarChart2, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import PulseDot from './PulseDot';

export default function Sidebar({
  activeSection,
  onSectionChange,
  connectionStatus,
  issueCount = 0,
  collapsed = false,
  onToggle = () => {}
}) {
  const navItems = [
    { id: 'overview', icon: LayoutGrid, label: 'Overview' },
    { id: 'issues', icon: AlertTriangle, label: 'Active Issues' },
    { id: 'health', icon: Database, label: 'Database Health' },
    { id: 'performance', icon: Activity, label: 'Performance' },
    { id: 'monitoring', icon: BarChart2, label: 'Monitoring' }
  ];

  const getStatusColor = () => {
    switch (connectionStatus) {
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

  const getStatusText = () => {
    return connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1);
  };

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.div
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="hidden md:flex fixed left-0 top-0 h-screen flex-col border-r border-white/[0.09]"
        style={{ backgroundColor: '#111113' }}
      >
      {/* Logo Section */}
      <div className={`pt-6 ${collapsed ? 'px-3' : 'px-6'} pb-8`}>
        <div className={`flex items-center ${collapsed ? 'justify-center' : 'gap-3'}`}>
          <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center flex-shrink-0">
            <Database className="w-5 h-5" style={{ color: '#3ECF8E' }} />
          </div>
          {!collapsed && (
            <>
              <div className="flex-1">
                <h1 className="text-sm font-bold text-white">PG Monitor</h1>
                <p className="text-xs text-white/40">PostgreSQL</p>
              </div>
              <button
                onClick={() => onToggle(!collapsed)}
                aria-label="Toggle sidebar"
                className="p-1 hover:bg-white/[0.05] rounded transition-colors"
              >
                <ChevronLeft className="w-4 h-4 text-white/60" />
              </button>
            </>
          )}
          {collapsed && (
            <button
              onClick={() => onToggle(!collapsed)}
              aria-label="Toggle sidebar"
              className="absolute right-1 top-6 p-1 hover:bg-white/[0.05] rounded transition-colors"
            >
              <ChevronRight className="w-4 h-4 text-white/60" />
            </button>
          )}
        </div>
      </div>

      {/* Navigation Section */}
      <div className={`flex-1 ${collapsed ? 'px-1.5' : 'px-3'} space-y-2`}>
        {!collapsed && (
          <p className="text-xs font-semibold text-white/30 px-3 py-2 uppercase tracking-wider">Navigation</p>
        )}
        <AnimatePresence mode="wait">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`nav-item ${collapsed ? 'w-full flex justify-center' : 'w-full text-left'} relative`}
                title={collapsed ? item.label : undefined}
              >
                {isActive && !collapsed && (
                  <motion.span
                    layoutId="sidebar-active"
                    className="absolute inset-0 rounded-lg bg-white/[0.08]"
                    style={{ borderLeft: '2px solid #3ECF8E' }}
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
                {isActive && collapsed && (
                  <div
                    className="absolute inset-0 rounded-lg bg-white/[0.08]"
                    style={{ borderLeft: '2px solid #3ECF8E' }}
                  />
                )}
                <Icon className="w-4 h-4 flex-shrink-0 relative z-10" />
                {!collapsed && (
                  <>
                    <span className="text-sm relative z-10">{item.label}</span>
                    {item.id === 'issues' && issueCount > 0 && (
                      <span className="ml-auto text-xs font-mono bg-red-500/20 text-red-400 rounded px-1.5 py-0.5 relative z-10">
                        {issueCount}
                      </span>
                    )}
                  </>
                )}
              </button>
            );
          })}
        </AnimatePresence>
      </div>

        {/* Status Footer */}
        <div className={`${collapsed ? 'px-3' : 'px-6'} py-6 border-t border-white/[0.09]`}>
          {collapsed ? (
            <div className="flex justify-center">
              <PulseDot color={getStatusColor()} size="sm" />
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <PulseDot color={getStatusColor()} size="sm" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white/80 truncate">{getStatusText()}</p>
                <p className="text-xs text-white/40 capitalize">{connectionStatus}</p>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 border-t border-white/[0.09] flex items-center justify-around px-2" style={{ backgroundColor: '#111113' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeSection === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className="flex flex-col items-center justify-center gap-1 py-2 px-3 rounded-lg transition-colors"
              style={{
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                color: isActive ? '#3ECF8E' : 'rgba(255, 255, 255, 0.6)'
              }}
              title={item.label}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium truncate">{item.label.split(' ')[0]}</span>
              {item.id === 'issues' && issueCount > 0 && (
                <span className="absolute top-1 right-1 text-xs font-mono bg-red-500/80 text-white rounded-full w-5 h-5 flex items-center justify-center">
                  {issueCount}
                </span>
              )}
            </button>
          );
        })}
      </nav>
    </>
  );
}
