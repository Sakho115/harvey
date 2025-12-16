import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { Alert, AlertLevel } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  CheckCircle, 
  AlertTriangle, 
  Shield, 
  MapPin, 
  Clock,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

interface LiveAlertPanelProps {
  alerts: Alert[];
  onAcknowledge?: (alertId: string) => void;
  onMarkSafe?: (alertId: string) => void;
}

const levelConfig = {
  high: {
    icon: AlertTriangle,
    bgClass: 'bg-alert-high/10 border-alert-high/30',
    textClass: 'text-alert-high',
    badgeClass: 'bg-alert-high text-alert-high-foreground',
  },
  medium: {
    icon: Shield,
    bgClass: 'bg-alert-medium/10 border-alert-medium/30',
    textClass: 'text-alert-medium',
    badgeClass: 'bg-alert-medium text-alert-medium-foreground',
  },
  safe: {
    icon: CheckCircle,
    bgClass: 'bg-alert-safe/10 border-alert-safe/30',
    textClass: 'text-alert-safe',
    badgeClass: 'bg-alert-safe text-alert-safe-foreground',
  },
};

export function LiveAlertPanel({ alerts, onAcknowledge, onMarkSafe }: LiveAlertPanelProps) {
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const handleAcknowledge = (alertId: string) => {
    setLocalAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
    onAcknowledge?.(alertId);
    toast.success('Alert acknowledged');
  };

  const handleMarkSafe = (alertId: string) => {
    setLocalAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, level: 'safe' as AlertLevel, acknowledged: true } : a
    ));
    onMarkSafe?.(alertId);
    toast.success('Alert marked as safe');
  };

  const sortedAlerts = [...localAlerts].sort((a, b) => {
    // Priority: high > medium > safe, then by timestamp
    const levelPriority = { high: 3, medium: 2, safe: 1 };
    if (levelPriority[a.level] !== levelPriority[b.level]) {
      return levelPriority[b.level] - levelPriority[a.level];
    }
    return b.timestamp.getTime() - a.timestamp.getTime();
  });

  const activeCount = localAlerts.filter(a => !a.acknowledged).length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3 flex-shrink-0">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Live Alerts</CardTitle>
          <Badge variant="secondary" className="text-xs">
            {activeCount} Active
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="flex-1 overflow-hidden p-0">
        <ScrollArea className="h-full px-6 pb-6">
          <div className="space-y-3">
            {sortedAlerts.map((alert) => {
              const config = levelConfig[alert.level];
              const Icon = config.icon;

              return (
                <div
                  key={alert.id}
                  className={cn(
                    'relative p-4 rounded-lg border transition-all duration-200',
                    config.bgClass,
                    alert.acknowledged && 'opacity-60'
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className={cn('p-2 rounded-lg bg-card', config.textClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-foreground truncate">
                          {alert.type}
                        </span>
                        <Badge className={cn('text-[10px] px-1.5', config.badgeClass)}>
                          {alert.level.toUpperCase()}
                        </Badge>
                      </div>
                      
                      <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                        {alert.description}
                      </p>
                      
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {alert.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                        </span>
                      </div>

                      {!alert.acknowledged && alert.level !== 'safe' && (
                        <div className="flex items-center gap-2 mt-3">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs"
                            onClick={() => handleAcknowledge(alert.id)}
                          >
                            Acknowledge
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-7 text-xs text-alert-safe hover:text-alert-safe hover:bg-alert-safe/10"
                            onClick={() => handleMarkSafe(alert.id)}
                          >
                            Mark Safe
                          </Button>
                        </div>
                      )}

                      {alert.acknowledged && (
                        <Badge variant="outline" className="mt-3 text-[10px]">
                          <CheckCircle className="h-3 w-3 mr-1" />
                          Acknowledged
                        </Badge>
                      )}
                    </div>

                    <ChevronRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                </div>
              );
            })}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}
