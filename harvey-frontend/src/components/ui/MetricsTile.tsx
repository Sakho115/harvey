import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface MetricsTileProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  trendUp?: boolean;
  className?: string;
}

export function MetricsTile({ 
  label, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className 
}: MetricsTileProps) {
  return (
    <div className={cn(
      'p-4 rounded-xl bg-card border border-border transition-all duration-200 hover:shadow-md',
      className
    )}>
      <div className="flex items-center justify-between mb-2">
        <Icon className="h-5 w-5 text-muted-foreground" />
        {trend && (
          <span className={cn(
            'text-xs',
            trendUp ? 'text-alert-safe' : 'text-muted-foreground'
          )}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-sm text-muted-foreground">{label}</p>
    </div>
  );
}
