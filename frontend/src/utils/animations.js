// Framer Motion animation variants
// Memoized for performance

export const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1
    }
  }
};

export const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -16,
    transition: {
      duration: 0.2
    }
  }
};

export const alertVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.28,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    x: -20,
    transition: {
      duration: 0.2
    }
  }
};

export const tabVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15
    }
  }
};

export const sectionVariants = {
  hidden: { opacity: 0, y: 8 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.25,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: -8,
    transition: {
      duration: 0.2
    }
  }
};

// Memoized row variants to avoid object recreation
const rowVariantCache = {};

export const getRowVariants = (index = 0) => {
  if (!rowVariantCache[index]) {
    rowVariantCache[index] = {
      hidden: { opacity: 0, x: -12 },
      visible: {
        opacity: 1,
        x: 0,
        transition: {
          duration: 0.35,
          delay: index * 0.05,
          ease: 'easeOut'
        }
      },
      exit: {
        opacity: 0,
        x: -12,
        transition: {
          duration: 0.2
        }
      }
    };
  }
  return rowVariantCache[index];
};

// Legacy export for backward compatibility
export const rowVariants = getRowVariants;
