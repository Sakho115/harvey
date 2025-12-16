import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  Shield,
  Leaf,
  Users,
  Fingerprint,
  AlertTriangle,
  Radio,
  Activity,
  Clock,
  Filter,
  Download,
  RefreshCw
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ActivityLog {
  id: string;
  agentId: string;
  agentName: string;
  action: string;
  type: 'alert' | 'status' | 'action' | 'warning';
  timestamp: Date;
  details?: string;
}

const agentIcons: Record<string, React.ElementType> = {
  'fraud-001': Shield,
  'env-001': Leaf,
  'crowd-001': Users,
  'identity-001': Fingerprint,
  'anomaly-001': AlertTriangle,
  'emergency-001': Radio,
};

const mockActivityLogs: ActivityLog[] = [
  { id: '1', agentId: 'fraud-001', agentName: 'Fraud Agent', action: 'Flagged suspicious transaction', type: 'alert', timestamp: new Date(Date.now() - 5 * 60000), details: 'Transaction ID: TXN-4892' },
  { id: '2', agentId: 'env-001', agentName: 'Environmental Agent', action: 'Sent air quality warning', type: 'warning', timestamp: new Date(Date.now() - 12 * 60000), details: 'AQI Level: 156' },
  { id: '3', agentId: 'crowd-001', agentName: 'Crowd Safety Agent', action: 'Detected crowd density spike', type: 'alert', timestamp: new Date(Date.now() - 18 * 60000), details: 'Zone B3 - 450 people' },
  { id: '4', agentId: 'fraud-001', agentName: 'Fraud Agent', action: 'Blocked unauthorized access', type: 'action', timestamp: new Date(Date.now() - 25 * 60000), details: 'IP: 192.168.*.* blocked' },
  { id: '5', agentId: 'anomaly-001', agentName: 'Anomaly Detection', action: 'Filtered spam messages', type: 'action', timestamp: new Date(Date.now() - 32 * 60000), details: '23 messages blocked' },
  { id: '6', agentId: 'emergency-001', agentName: 'Emergency Signal Agent', action: 'Escalated SOS signal', type: 'alert', timestamp: new Date(Date.now() - 45 * 60000), details: 'Priority: Critical' },
  { id: '7', agentId: 'env-001', agentName: 'Environmental Agent', action: 'Temperature normalized', type: 'status', timestamp: new Date(Date.now() - 58 * 60000), details: 'Server Room A' },
  { id: '8', agentId: 'identity-001', agentName: 'Identity Agent', action: 'Verified 45 identities', type: 'status', timestamp: new Date(Date.now() - 72 * 60000), details: 'Batch verification complete' },
  { id: '9', agentId: 'fraud-001', agentName: 'Fraud Agent', action: 'Detected invoice anomaly', type: 'alert', timestamp: new Date(Date.now() - 85 * 60000), details: 'Invoice #INV-7823' },
  { id: '10', agentId: 'crowd-001', agentName: 'Crowd Safety Agent', action: 'Flow analysis complete', type: 'status', timestamp: new Date(Date.now() - 95 * 60000), details: 'All zones normal' },
  { id: '11', agentId: 'anomaly-001', agentName: 'Anomaly Detection', action: 'Bot attack prevented', type: 'action', timestamp: new Date(Date.now() - 110 * 60000), details: '156 requests blocked' },
  { id: '12', agentId: 'env-001', agentName: 'Environmental Agent', action: 'Seismic activity detected', type: 'warning', timestamp: new Date(Date.now() - 125 * 60000), details: 'Magnitude: 2.1' },
];

const agentSummary = [
  { id: 'fraud-001', name: 'Fraud Agent', alertsToday: 12, actionsToday: 8 },
  { id: 'env-001', name: 'Environmental Agent', alertsToday: 5, actionsToday: 3 },
  { id: 'crowd-001', name: 'Crowd Safety Agent', alertsToday: 3, actionsToday: 2 },
  { id: 'identity-001', name: 'Identity Agent', alertsToday: 0, actionsToday: 45 },
  { id: 'anomaly-001', name: 'Anomaly Detection', alertsToday: 8, actionsToday: 179 },
  { id: 'emergency-001', name: 'Emergency Signal Agent', alertsToday: 1, actionsToday: 1 },
];

const typeColors: Record<string, string> = {
  alert: 'bg-alert-high/10 text-alert-high border-alert-high/20',
  warning: 'bg-alert-medium/10 text-alert-medium border-alert-medium/20',
  action: 'bg-primary/10 text-primary border-primary/20',
  status: 'bg-alert-safe/10 text-alert-safe border-alert-safe/20',
};

const ActivityLogs = () => {
  const [filterAgent, setFilterAgent] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const filteredLogs = mockActivityLogs.filter(log => {
    const matchesAgent = filterAgent === 'all' || log.agentId === filterAgent;
    const matchesType = filterType === 'all' || log.type === filterType;
    return matchesAgent && matchesType;
  });

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Activity Logs</h1>
            <p className="text-muted-foreground">Multi-agent orchestration timeline</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={cn("w-4 h-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh
            </Button>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Agent Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {agentSummary.map((agent, index) => {
            const Icon = agentIcons[agent.id] || Activity;
            return (
              <Card 
                key={agent.id} 
                className="animate-scale-in cursor-pointer hover:shadow-md transition-shadow"
                style={{ animationDelay: `${index * 50}ms` }}
                onClick={() => setFilterAgent(filterAgent === agent.id ? 'all' : agent.id)}
              >
                <CardContent className="p-3">
                  <div className={cn(
                    "flex items-center gap-2 mb-2",
                    filterAgent === agent.id && "text-primary"
                  )}>
                    <Icon className="w-4 h-4" />
                    <span className="text-xs font-medium truncate">{agent.name.split(' ')[0]}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <div>
                      <p className="text-lg font-bold text-foreground">{agent.alertsToday}</p>
                      <p className="text-muted-foreground">Alerts</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-foreground">{agent.actionsToday}</p>
                      <p className="text-muted-foreground">Actions</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Filters */}
        <div className="flex gap-2">
          <Select value={filterAgent} onValueChange={setFilterAgent}>
            <SelectTrigger className="w-40">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Agent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Agents</SelectItem>
              {agentSummary.map(agent => (
                <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="alert">Alerts</SelectItem>
              <SelectItem value="warning">Warnings</SelectItem>
              <SelectItem value="action">Actions</SelectItem>
              <SelectItem value="status">Status</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Activity Timeline */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Activity Timeline
              <Badge variant="secondary" className="ml-2">{filteredLogs.length} events</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[500px] pr-4">
              <div className="space-y-1">
                {filteredLogs.map((log, index) => {
                  const Icon = agentIcons[log.agentId] || Activity;
                  return (
                    <div 
                      key={log.id} 
                      className="flex items-start gap-4 p-3 rounded-lg hover:bg-muted/50 transition-colors animate-slide-in-row"
                      style={{ animationDelay: `${index * 30}ms` }}
                    >
                      {/* Timeline connector */}
                      <div className="flex flex-col items-center">
                        <div className={cn(
                          "p-2 rounded-full",
                          typeColors[log.type]
                        )}>
                          <Icon className="w-4 h-4" />
                        </div>
                        {index < filteredLogs.length - 1 && (
                          <div className="w-0.5 h-full min-h-[40px] bg-border mt-2" />
                        )}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-foreground">{log.agentName}</span>
                          <Badge variant="outline" className={cn("text-xs", typeColors[log.type])}>
                            {log.type}
                          </Badge>
                        </div>
                        <p className="text-sm text-foreground">{log.action}</p>
                        {log.details && (
                          <p className="text-xs text-muted-foreground mt-1">{log.details}</p>
                        )}
                      </div>

                      {/* Timestamp */}
                      <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                        <Clock className="w-3 h-3" />
                        {formatTime(log.timestamp)}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default ActivityLogs;
