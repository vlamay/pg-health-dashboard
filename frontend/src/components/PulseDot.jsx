const colorMap = {
  green: {
    solid: 'bg-emerald-500',
    hex: '#10b981',
    label: 'Healthy'
  },
  amber: {
    solid: 'bg-amber-500',
    hex: '#f59e0b',
    label: 'Warning'
  },
  red: {
    solid: 'bg-red-500',
    hex: '#ef4444',
    label: 'Critical'
  },
  blue: {
    solid: 'bg-blue-500',
    hex: '#3b82f6',
    label: 'Info'
  }
};

const sizeMap = {
  sm: {
    outer: 6,
    solid: 'w-1.5 h-1.5'
  },
  md: {
    outer: 8,
    solid: 'w-2 h-2'
  }
};

export default function PulseDot({ color = 'green', size = 'md' }) {
  const colorStyle = colorMap[color] || colorMap.green;
  const sizeStyle = sizeMap[size] || sizeMap.md;
  const outerSize = sizeStyle.outer;

  return (
    <span
      className="relative inline-flex"
      role="status"
      aria-label={`Status: ${colorStyle.label}`}
      aria-live="polite"
      style={{
        width: `${outerSize}px`,
        height: `${outerSize}px`
      }}
    >
      <span
        className={`absolute inline-flex h-full w-full rounded-full animate-ping-slow`}
        style={{
          backgroundColor: colorStyle.hex
        }}
      />
      <span
        className={`relative inline-flex rounded-full ${sizeStyle.solid}`}
        style={{
          backgroundColor: colorStyle.hex
        }}
      />
    </span>
  );
}
