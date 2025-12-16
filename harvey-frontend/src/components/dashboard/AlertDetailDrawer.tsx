import { Alert } from '@/data/mockData';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  MapPin, 
  Clock, 
  Bot, 
  CheckCircle, 
  ShieldCheck, 
  Send,
  AlertTriangle,
  FileText,
  Activity
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, CircleMarker } from 'react-leaflet';
import { format, formatDistanceToNow } from 'date-fns';
import { toast } from 'sonner';
import 'leaflet/dist/leaflet.css';

interface AlertDetailDrawerProps {
  alert: Alert | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAcknowledge?: (alertId: string) => void;
  onMarkSafe?: (alertId: string) => void;
}

const timelineEvents = [
  { time: -5, event: 'Initial detection by agent', icon: Bot },
  { time: -3, event: 'Risk assessment completed', icon: Activity },
  { time: -2, event: 'Alert generated', icon: AlertTriangle },
  { time: 0, event: 'Notification sent', icon: Send },
];

export function AlertDetailDrawer({ 
  alert, 
  open, 
  onOpenChange, 
  onAcknowledge, 
  onMarkSafe 
}: AlertDetailDrawerProps) {
  if (!alert) return null;

  const handleAcknowledge = () => {
    onAcknowledge?.(alert.id);
    toast.success('Alert acknowledged', {
      description: 'The alert has been marked as acknowledged.'
    });
  };

  const handleMarkSafe = () => {
    onMarkSafe?.(alert.id);
    toast.success('Alert marked safe', {
      description: 'The alert status has been updated to safe.'
    });
  };

  const handleSendAgent = () => {
    toast.success('Agent dispatched', {
      description: 'A response agent has been sent to the location.',
      icon: <Send className="w-4 h-4" />
    });
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg p-0 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 space-y-6">
            <SheetHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <SheetTitle className="text-xl">{alert.type}</SheetTitle>
                  <p className="text-sm text-muted-foreground">{alert.agentName}</p>
                </div>
                <StatusBadge level={alert.level} size="lg" animated />
              </div>
            </SheetHeader>

            {/* Risk Score */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Risk Score</span>
                <span className="text-2xl font-bold text-foreground">{alert.riskScore}%</span>
              </div>
              <RiskScoreBar score={alert.riskScore} size="lg" animated />
            </div>

            {/* Location Map */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4" />
                Location
              </h4>
              <div className="h-48 rounded-lg overflow-hidden border border-border">
                <MapContainer
                  center={alert.coordinates}
                  zoom={14}
                  className="h-full w-full"
                  zoomControl={false}
                  attributionControl={false}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                  />
                  <Marker position={alert.coordinates} />
                  {/* Radar sweep effect */}
                  <CircleMarker
                    center={alert.coordinates}
                    radius={30}
                    pathOptions={{
                      color: alert.level === 'high' ? 'hsl(0, 84%, 60%)' : 
                             alert.level === 'medium' ? 'hsl(45, 93%, 47%)' : 
                             'hsl(142, 76%, 36%)',
                      fillOpacity: 0.1,
                      weight: 2
                    }}
                  />
                </MapContainer>
              </div>
              <p className="text-sm text-muted-foreground">{alert.location}</p>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Description
              </h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {alert.description}
              </p>

              {/* Metadata */}
              <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
                <div>
                  <p className="text-xs text-muted-foreground">Timestamp</p>
                  <p className="text-sm font-medium text-foreground">
                    {format(alert.timestamp, 'MMM d, yyyy HH:mm:ss')}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Time Ago</p>
                  <p className="text-sm font-medium text-foreground">
                    {formatDistanceToNow(alert.timestamp, { addSuffix: true })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Agent ID</p>
                  <p className="text-sm font-medium text-foreground font-mono">{alert.agentId}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Alert ID</p>
                  <p className="text-sm font-medium text-foreground font-mono">{alert.id}</p>
                </div>
              </div>
            </div>

            <Separator />

            {/* AI Recommendation */}
            <div className="p-4 bg-primary/5 border border-primary/20 rounded-lg space-y-2">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Bot className="w-4 h-4 text-primary" />
                AI Recommended Action
              </h4>
              <p className="text-sm text-muted-foreground">
                {alert.level === 'high' 
                  ? 'Immediate investigation required. Dispatch a response team to verify the alert and take necessary action.'
                  : alert.level === 'medium'
                  ? 'Monitor closely and gather additional data. Consider dispatching an agent if situation escalates.'
                  : 'Continue monitoring. No immediate action required.'}
              </p>
            </div>

            {/* Timeline */}
            <div className="space-y-3">
              <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Event Timeline
              </h4>
              <div className="space-y-3">
                {timelineEvents.map((event, index) => {
                  const Icon = event.icon;
                  const time = new Date(alert.timestamp.getTime() + event.time * 60000);
                  return (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0">
                        <Icon className="w-4 h-4 text-muted-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground">{event.event}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(time, 'HH:mm:ss')}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <Separator />

            {/* Action Buttons */}
            <div className="space-y-3">
              {!alert.acknowledged && (
                <>
                  <Button 
                    className="w-full gap-2" 
                    onClick={handleAcknowledge}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Acknowledge Alert
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full gap-2 text-alert-safe hover:text-alert-safe hover:bg-alert-safe/10"
                    onClick={handleMarkSafe}
                  >
                    <ShieldCheck className="w-4 h-4" />
                    Mark as Safe
                  </Button>
                </>
              )}
              <Button 
                variant="secondary" 
                className="w-full gap-2"
                onClick={handleSendAgent}
              >
                <Send className="w-4 h-4" />
                Send Response Agent
              </Button>
            </div>
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
