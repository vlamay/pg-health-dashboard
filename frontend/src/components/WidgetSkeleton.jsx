import { motion } from 'framer-motion';

export default function WidgetSkeleton({ lines = 3, height = 'h-10' }) {
  const shimmerVariants = {
    shimmer: {
      backgroundPosition: ['200% 0', '-200% 0'],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: 'linear'
      }
    }
  };

  return (
    <div className="glass-card p-6 space-y-4">
      {/* Title skeleton */}
      <motion.div
        className="h-5 bg-gradient-to-r from-white/[0.08] via-white/[0.12] to-white/[0.08] rounded"
        style={{ backgroundSize: '200% 100%' }}
        variants={shimmerVariants}
        animate="shimmer"
      />

      {/* Content skeleton lines */}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, idx) => (
          <motion.div
            key={idx}
            className={`${height} bg-gradient-to-r from-white/[0.06] via-white/[0.10] to-white/[0.06] rounded`}
            style={{ backgroundSize: '200% 100%', animationDelay: `${idx * 0.1}s` }}
            variants={shimmerVariants}
            animate="shimmer"
          />
        ))}
      </div>
    </div>
  );
}
