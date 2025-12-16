import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { RiskScoreBar } from '@/components/ui/RiskScoreBar';
import { AgentModal } from '@/components/dashboard/AgentModal';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Bot,
  Shield,
  Leaf,
  Users,
  Fingerprint,
  AlertTriangle,
  Radio,
  Plus,
  Activity,
  Cpu,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

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

const initialAgents: AgentData[] = [
  {
    id: 'fraud-001',
    name: 'Fraud Agent',
    description: 'AI-powered financial transaction monitoring for suspicious activity patterns.',
    icon: Shield,
    active: true,
    health: 'healthy',
    metrics: { accuracy: 97.5, responseTime: 45, cpuUsage: 32, alertsToday: 12 },
    specialty: ['Invoice anomalies', 'Payment irregularities', 'Identity fraud'],
  },
  {
    id: 'env-001',
    name: 'Environmental Agent',
    description: 'Real-time environmental sensor data analysis for hazard detection.',
    icon: Leaf,
    active: true,
    health: 'healthy',
    metrics: { accuracy: 94.2, responseTime: 120, cpuUsage: 28, alertsToday: 5 },
    specialty: ['Air quality', 'Seismic activity', 'Flooding risk'],
  },
  {
    id: 'crowd-001',
    name: 'Crowd Safety Agent',
    description: 'Crowd density and behavior analysis for public safety.',
    icon: Users,
    active: true,
    health: 'warning',
    metrics: { accuracy: 91.8, responseTime: 200, cpuUsage: 45, alertsToday: 3 },
    specialty: ['Crowd density', 'Panic detection', 'Flow analysis'],
  },
  {
    id: 'identity-001',
    name: 'Identity Agent',
    description: 'Identity verification and authentication monitoring.',
    icon: Fingerprint,
    active: false,
    health: 'healthy',
    metrics: { accuracy: 99.1, responseTime: 80, cpuUsage: 18, alertsToday: 0 },
    specialty: ['Biometric verification', 'Document fraud', 'Access control'],
  },
  {
    id: 'anomaly-001',
    name: 'Anomaly Detection',
    description: 'Spam and anomaly detection across communication channels.',
    icon: AlertTriangle,
    active: true,
    health: 'healthy',
    metrics: { accuracy: 96.3, responseTime: 30, cpuUsage: 22, alertsToday: 8 },
    specialty: ['Spam filtering', 'Bot detection', 'Pattern analysis'],
  },
  {
    id: 'emergency-001',
    name: 'Emergency Signal Agent',
    description: 'Emergency signal detection and response coordination.',
    icon: Radio,
    active: true,
    health: 'critical',
    metrics: { accuracy: 99.8, responseTime: 15, cpuUsage: 55, alertsToday: 1 },
    specialty: ['SOS detection', 'Priority escalation', 'Multi-channel monitoring'],
  },
];

const healthColors = {
  healthy: 'bg-alert-safe',
  warning: 'bg-alert-medium',
  critical: 'bg-alert-high',
};

const Agents = () => {
  const [agents, setAgents] = useState(initialAgents);
  const [selectedAgent, setSelectedAgent] = useState<AgentData | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [addAgentOpen, setAddAgentOpen] = useState(false);

  const handleToggleAgent = (agentId: string) => {
    setAgents(prev => prev.map(agent => {
      if (agent.id === agentId) {
        const newStatus = !agent.active;
        toast.success(`${agent.name} ${newStatus ? 'activated' : 'deactivated'}`);
        return { ...agent, active: newStatus };
      }
      return agent;
    }));
  };

  const handleAgentClick = (agent: AgentData) => {
    setSelectedAgent(agent);
    setModalOpen(true);
  };

  const activeCount = agents.filter(a => a.active).length;
  const healthyCount = agents.filter(a => a.health === 'healthy' && a.active).length;

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Agent Management</h1>
            <p className="text-muted-foreground">Configure and monitor HARVEY modules</p>
          </div>
          <Button onClick={() => setAddAgentOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Add Agent
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Bot className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{agents.length}</p>
                  <p className="text-sm text-muted-foreground">Total Agents</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-alert-safe/10">
                  <Zap className="w-5 h-5 text-alert-safe" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{activeCount}</p>
                  <p className="text-sm text-muted-foreground">Active</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-alert-safe/10">
                  <Activity className="w-5 h-5 text-alert-safe" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">{healthyCount}</p>
                  <p className="text-sm text-muted-foreground">Healthy</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-alert-high/10">
                  <AlertTriangle className="w-5 h-5 text-alert-high" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {agents.filter(a => a.health === 'critical').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Critical</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Agent Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {agents.map((agent, index) => {
            const Icon = agent.icon;
            return (
              <Card 
                key={agent.id}
                className={cn(
                  "relative overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg group animate-scale-in",
                  agent.active && "ring-1 ring-primary/20"
                )}
                style={{ animationDelay: `${index * 100}ms` }}
                onClick={() => handleAgentClick(agent)}
              >
                {/* Active glow effect */}
                {agent.active && (
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                )}
                
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className={cn(
                      "p-3 rounded-xl transition-all duration-300",
                      agent.active 
                        ? "bg-primary/10 group-hover:bg-primary/20" 
                        : "bg-muted/50"
                    )}>
                      <Icon className={cn(
                        "w-6 h-6 transition-colors",
                        agent.active ? "text-primary" : "text-muted-foreground"
                      )} />
                    </div>
                    <div className="flex items-center gap-3" onClick={(e) => e.stopPropagation()}>
                      {/* Health indicator */}
                      <div className="flex items-center gap-1.5">
                        <div className={cn(
                          "w-2 h-2 rounded-full animate-pulse",
                          healthColors[agent.health]
                        )} />
                        <span className="text-xs text-muted-foreground capitalize">{agent.health}</span>
                      </div>
                      <Switch
                        checked={agent.active}
                        onCheckedChange={() => handleToggleAgent(agent.id)}
                        className="data-[state=checked]:bg-primary"
                      />
                    </div>
                  </div>

                  <h3 className="font-semibold text-foreground mb-1">{agent.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
                    {agent.description}
                  </p>

                  {/* Specialty tags */}
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {agent.specialty.slice(0, 2).map(spec => (
                      <Badge key={spec} variant="secondary" className="text-xs">
                        {spec}
                      </Badge>
                    ))}
                    {agent.specialty.length > 2 && (
                      <Badge variant="secondary" className="text-xs">
                        +{agent.specialty.length - 2}
                      </Badge>
                    )}
                  </div>

                  {/* Metrics mini-bars */}
                  {agent.active && (
                    <div className="space-y-2 pt-3 border-t border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Target className="w-3 h-3" />
                          Accuracy
                        </span>
                        <span className="font-medium text-foreground">{agent.metrics.accuracy}%</span>
                      </div>
                      <RiskScoreBar score={agent.metrics.accuracy} size="sm" animated />
                      
                      <div className="flex items-center justify-between text-xs mt-2">
                        <span className="text-muted-foreground flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          Response
                        </span>
                        <span className="font-medium text-foreground">{agent.metrics.responseTime}ms</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Agent Detail Modal */}
      <AgentModal
        agent={selectedAgent}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />

      {/* Add Agent Dialog */}
      <Dialog open={addAgentOpen} onOpenChange={setAddAgentOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Agent</DialogTitle>
            <DialogDescription>
              New agent modules are coming soon. Stay tuned for updates!
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-center py-8">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted/50 flex items-center justify-center mx-auto mb-4">
                <Bot className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-sm text-muted-foreground">
                Custom agent creation coming in v2.0
              </p>
            </div>
          </div>
          <Button onClick={() => setAddAgentOpen(false)} variant="outline">
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </DashboardLayout>
  );
};

export default Agents;
