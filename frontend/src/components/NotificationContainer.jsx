import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { useNotification } from '../context/NotificationContext';

export default function NotificationContainer() {
  const { notifications, removeNotification } = useNotification();

  const getIcon = (type) => {
    switch (type) {
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      default:
        return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getStyles = (type) => {
    switch (type) {
      case 'error':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/30',
          icon: 'text-red-400',
          text: 'text-red-100'
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/30',
          icon: 'text-amber-400',
          text: 'text-amber-100'
        };
      case 'success':
        return {
          bg: 'bg-emerald-500/10',
          border: 'border-emerald-500/30',
          icon: 'text-emerald-400',
          text: 'text-emerald-100'
        };
      default:
        return {
          bg: 'bg-blue-500/10',
          border: 'border-blue-500/30',
          icon: 'text-blue-400',
          text: 'text-blue-100'
        };
    }
  };

  return (
    <div className="fixed bottom-20 md:bottom-6 right-6 z-50 max-w-sm space-y-3 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {notifications.map(notification => {
          const styles = getStyles(notification.type);
          return (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, y: 20, x: 20 }}
              animate={{ opacity: 1, y: 0, x: 0 }}
              exit={{ opacity: 0, y: 20, x: 20 }}
              transition={{ duration: 0.2 }}
              className={`${styles.bg} ${styles.border} border rounded-lg p-4 flex items-start gap-3 shadow-lg backdrop-blur-sm pointer-events-auto`}
            >
              <div className={`flex-shrink-0 ${styles.icon}`}>
                {getIcon(notification.type)}
              </div>
              <div className="flex-1">
                <p className={`text-sm font-medium ${styles.text}`}>
                  {notification.message}
                </p>
              </div>
              <button
                onClick={() => removeNotification(notification.id)}
                className="flex-shrink-0 text-white/50 hover:text-white transition-colors"
                title="Dismiss"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
