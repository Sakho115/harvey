import { useState, useEffect } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(true);
  const [showPulse, setShowPulse] = useState(false);

  // Simulate connection status (for demo purposes)
  useEffect(() => {
    // Actual online/offline detection
    const handleOnline = () => {
      setIsOnline(true);
      setShowPulse(true);
      setTimeout(() => setShowPulse(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowPulse(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Set initial state
    setIsOnline(navigator.onLine);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn(
            "flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium transition-all duration-300",
            isOnline 
              ? "bg-alert-safe/10 text-alert-safe" 
              : "bg-alert-high/10 text-alert-high"
          )}>
            <div className="relative">
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5" />
              ) : (
                <WifiOff className="w-3.5 h-3.5" />
              )}
              {showPulse && (
                <span className={cn(
                  "absolute -inset-1 rounded-full animate-ping",
                  isOnline ? "bg-alert-safe/50" : "bg-alert-high/50"
                )} />
              )}
            </div>
            <span className="hidden sm:inline">
              {isOnline ? 'Online' : 'Offline'}
            </span>
            <span className={cn(
              "w-2 h-2 rounded-full",
              isOnline ? "bg-alert-safe animate-pulse" : "bg-alert-high"
            )} />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOnline ? 'System connected and operational' : 'Connection lost - attempting to reconnect'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
