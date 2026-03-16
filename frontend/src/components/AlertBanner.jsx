import { useState } from 'react';
import { AlertTriangle, AlertCircle, Info, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { alertVariants } from '../utils/animations';

export default function AlertBanner({ alerts }) {
  const [expanded, setExpanded] = useState(false);

  if (!alerts || alerts.length === 0) {
    return null;
  }

  const getAlertClass = (severity) => {
    switch (severity) {
      case 'critical':
        return 'alert-critical';
      case 'warning':
        return 'alert-warning';
      case 'info':
        return 'alert-info';
      default:
        return 'alert-info';
    }
  };

  const getAlertIcon = (severity) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="w-5 h-5 text-red-300" />;
      case 'warning':
        return <AlertCircle className="w-5 h-5 text-amber-300" />;
      case 'info':
        return <Info className="w-5 h-5 text-blue-300" />;
      default:
        return null;
    }
  };

  const visibleAlerts = expanded ? alerts : alerts.slice(0, 3);
  const hiddenCount = alerts.length - 3;

  return (
    <div
      className="border-b border-white/[0.09] sticky top-16 z-40 backdrop-blur-md"
      style={{ backgroundColor: 'rgba(9, 9, 11, 0.85)' }}
      role="region"
      aria-label="Alert notifications"
      aria-live="polite"
      aria-atomic="false"
    >
      <div className="max-w-screen-2xl mx-auto px-6 py-4 space-y-2">
        <AnimatePresence mode="popLayout">
          {visibleAlerts.map((alert) => (
            <motion.div
              key={alert.id || `${alert.category}-${alert.message}`}
              variants={alertVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className={`${getAlertClass(alert.severity)} p-3 rounded-lg flex items-start gap-3`}
              role="alert"
              aria-label={`${alert.severity.toUpperCase()}: ${alert.category || alert.title} - ${alert.message}`}
            >
              {getAlertIcon(alert.severity)}
              <div className="flex-1 text-sm">
                <div className="font-semibold text-white/90">{alert.category || alert.title}</div>
                <div className="text-white/60">{alert.message}</div>
                {alert.value != null && alert.threshold != null && (
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-xs font-mono text-white/40">
                      value: <span className="text-white/70">{alert.value}</span>
                    </span>
                    <span className="text-xs text-white/20">/</span>
                    <span className="text-xs font-mono text-white/40">
                      threshold: <span className="text-white/70">{alert.threshold}</span>
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {hiddenCount > 0 && !expanded && (
          <button
            onClick={() => setExpanded(true)}
            className="w-full text-sm text-white/60 hover:text-white/80 transition-colors py-2 flex items-center justify-center gap-2"
          >
            <span>+{hiddenCount} more alert{hiddenCount > 1 ? 's' : ''}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
        )}

        {expanded && hiddenCount > 0 && (
          <button
            onClick={() => setExpanded(false)}
            className="w-full text-sm text-white/60 hover:text-white/80 transition-colors py-2 flex items-center justify-center gap-2"
          >
            <span>Show less</span>
            <ChevronDown className="w-4 h-4 transform rotate-180" />
          </button>
        )}
      </div>
    </div>
  );
}
