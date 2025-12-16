import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  Cpu, 
  Clock, 
  Target, 
  AlertTriangle,
  Activity,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip
} from 'recharts';

interface AgentData {
  id: string;
  name: string;
  description: string;
  icon: React.ElementType;
  active: boolean;
  health: 'healthy' | 'warning' | 'critical';
  metrics: {
    accuracy: number;
    responseTime: number;
    cpuUsage: number;
    alertsToday: number;
  };
  specialty: string[];
}

interface AgentModalProps {
  agent: AgentData | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Mock performance data
const performanceData = [
  { time: '00:00', value: 45 },
  { time: '04:00', value: 32 },
  { time: '08:00', value: 78 },
  { time: '12:00', value: 92 },
  { time: '16:00', value: 65 },
  { time: '20:00', value: 55 },
];

const healthColors = {
  healthy: 'text-alert-safe',
  warning: 'text-alert-medium',
  critical: 'text-alert-high',
};

export function AgentModal({ agent, open, onOpenChange }: AgentModalProps) {
  if (!agent) return null;

  const Icon = agent.icon;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <div className="flex items-center gap-4">
            <div className={cn(
              "p-3 rounded-xl",
              agent.active ? "bg-primary/10" : "bg-muted/50"
            )}>
              <Icon className={cn(
                "w-8 h-8",
                agent.active ? "text-primary" : "text-muted-foreground"
              )} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl">{agent.name}</DialogTitle>
              <p className="text-sm text-muted-foreground mt-1">{agent.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={agent.active ? "default" : "secondary"}>
                {agent.active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge variant="outline" className={healthColors[agent.health]}>
                {agent.health.charAt(0).toUpperCase() + agent.health.slice(1)}
              </Badge>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Specialties */}
          <div>
            <h4 className="text-sm font-medium text-foreground mb-2">Specialties</h4>
            <div className="flex flex-wrap gap-2">
              {agent.specialty.map(spec => (
                <Badge key={spec} variant="secondary">{spec}</Badge>
              ))}
            </div>
          </div>

          <Separator />

          {/* Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Accuracy</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{agent.metrics.accuracy}%</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Response Time</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{agent.metrics.responseTime}ms</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Cpu className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">CPU Usage</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{agent.metrics.cpuUsage}%</p>
            </div>
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">Alerts Today</span>
              </div>
              <p className="text-2xl font-bold text-foreground">{agent.metrics.alertsToday}</p>
            </div>
          </div>

          {/* Performance Bars */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Performance Metrics
            </h4>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Accuracy</span>
                  <span className="font-medium text-foreground">{agent.metrics.accuracy}%</span>
                </div>
                <RiskScoreBar score={agent.metrics.accuracy} size="md" animated />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">CPU Usage</span>
                  <span className="font-medium text-foreground">{agent.metrics.cpuUsage}%</span>
                </div>
                <Progress value={agent.metrics.cpuUsage} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-muted-foreground">Memory Usage</span>
                  <span className="font-medium text-foreground">42%</span>
                </div>
                <Progress value={42} className="h-2" />
              </div>
            </div>
          </div>

          {/* Activity Chart */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-foreground flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Activity (Last 24h)
            </h4>
            <div className="h-32 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={performanceData}>
                  <XAxis 
                    dataKey="time" 
                    tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis hide />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                      fontSize: '12px'
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
