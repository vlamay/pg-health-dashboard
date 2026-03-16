import { motion } from 'framer-motion';
import { Activity, AlertCircle, Zap, Database } from 'lucide-react';
import PulseDot from './PulseDot';
import { cardVariants, containerVariants } from '../utils/animations';

export default function MetricOverview({ connections, blockingCount, deadTupleTables, cacheHitAvg }) {
  const metrics = [
    {
      label: 'Active Connections',
      value: connections,
      icon: Activity,
      color: 'green',
      status: connections < 50 ? 'success' : connections < 100 ? 'warning' : 'critical'
    },
    {
      label: 'Blocking Queries',
      value: blockingCount,
      icon: AlertCircle,
      color: blockingCount > 0 ? 'red' : 'green',
      status: blockingCount > 0 ? 'critical' : 'success'
    },
    {
      label: 'Dead Tuple Tables',
      value: deadTupleTables,
      icon: Database,
      color: deadTupleTables > 0 ? 'amber' : 'green',
      status: deadTupleTables > 0 ? 'warning' : 'success'
    },
    {
      label: 'Avg Cache Hit %',
      value: cacheHitAvg,
      icon: Zap,
      color: cacheHitAvg >= 90 ? 'green' : cacheHitAvg >= 70 ? 'amber' : 'red',
      status: cacheHitAvg >= 90 ? 'success' : cacheHitAvg >= 70 ? 'warning' : 'critical',
      format: '%'
    }
  ];

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;
        const metricKey = metric.label.toLowerCase().replace(/\s+/g, '-');
        return (
          <motion.div
            key={metricKey}
            variants={cardVariants}
            className="glass-card p-4"
            role="region"
            aria-label={metric.label}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <p className="section-header mb-3">{metric.label}</p>
                <div className="flex items-end gap-2">
                  <p className="metric-value text-2xl font-semibold">{Math.round(metric.value)}{metric.format || ''}</p>
                </div>
              </div>
              <div className="flex flex-col items-center gap-2">
                <Icon className={`w-5 h-5 ${
                  metric.status === 'success' ? 'text-emerald-400' :
                  metric.status === 'warning' ? 'text-amber-400' :
                  'text-red-400'
                }`} />
                <PulseDot color={metric.color} size="sm" />
              </div>
            </div>
            <div className={`mt-4 px-2 py-1 rounded text-xs font-medium w-fit badge-${metric.status}`}>
              {metric.status}
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
