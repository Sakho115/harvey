import { cn } from '@/lib/utils';
import { AlertLevel } from '@/data/mockData';

interface StatusBadgeProps {
  level: AlertLevel;
  size?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  className?: string;
}

const levelConfig = {
  high: {
    bg: 'bg-alert-high',
    text: 'text-alert-high-foreground',
    label: 'HIGH',
  },
  medium: {
    bg: 'bg-alert-medium',
    text: 'text-alert-medium-foreground',
    label: 'MEDIUM',
  },
  safe: {
    bg: 'bg-alert-safe',
    text: 'text-alert-safe-foreground',
    label: 'SAFE',
  },
};

const sizeConfig = {
  sm: 'text-[10px] px-1.5 py-0.5',
  md: 'text-xs px-2 py-1',
  lg: 'text-sm px-3 py-1.5',
};

export function StatusBadge({ level, size = 'md', animated = false, className }: StatusBadgeProps) {
  const config = levelConfig[level];
  
  return (
    <span 
      className={cn(
        'inline-flex items-center gap-1 font-semibold rounded-full',
        config.bg,
        config.text,
        sizeConfig[size],
        animated && level === 'high' && 'animate-pulse',
        className
      )}
    >
      {animated && level === 'high' && (
        <span className="w-1.5 h-1.5 rounded-full bg-current animate-ping" />
      )}
      {config.label}
    </span>
  );
}
