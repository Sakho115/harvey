import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface RiskScoreBarProps {
  score: number;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  animated?: boolean;
  className?: string;
}

export function RiskScoreBar({ 
  score, 
  size = 'md', 
  showLabel = false, 
  animated = true,
  className 
}: RiskScoreBarProps) {
  const [displayScore, setDisplayScore] = useState(animated ? 0 : score);

  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => {
        setDisplayScore(score);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [score, animated]);

  const getColor = () => {
    if (score >= 70) return 'bg-alert-high';
    if (score >= 40) return 'bg-alert-medium';
    return 'bg-alert-safe';
  };

  const heightConfig = {
    sm: 'h-1',
    md: 'h-2',
    lg: 'h-3',
  };

  return (
    <div className={cn('w-full', className)}>
      {showLabel && (
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Risk Score</span>
          <span className="font-medium text-foreground">{score}%</span>
        </div>
      )}
      <div className={cn('w-full bg-muted/30 rounded-full overflow-hidden', heightConfig[size])}>
        <div
          className={cn(
            'h-full rounded-full transition-all duration-1000 ease-out',
            getColor()
          )}
          style={{ width: `${displayScore}%` }}
        />
      </div>
    </div>
  );
}
