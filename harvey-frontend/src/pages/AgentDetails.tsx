import { useParams, Link } from 'react-router-dom';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { agents, mockAlerts, historicalData, riskTrends } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  ArrowLeft, 
  Bot, 
  Leaf, 
  Activity,
  AlertTriangle,
  Clock,
  MapPin,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

const AgentDetails = () => {
  const { id } = useParams<{ id: string }>();
  const agent = agents.find(a => a.id === id);
  const agentAlerts = mockAlerts.filter(a => a.agentId === id);

  if (!agent) {
    return (
      <DashboardLayout>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-xl font-semibold text-foreground mb-2">Agent Not Found</h2>
          <p className="text-muted-foreground mb-4">The agent you're looking for doesn't exist.</p>
          <Link to="/">
            <Button>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const AgentIcon = agent.type === 'fraud' ? Bot : Leaf;
  const levelStyles = {
    high: 'bg-alert-high text-alert-high-foreground',
    medium: 'bg-alert-medium text-alert-medium-foreground',
    safe: 'bg-alert-safe text-alert-safe-foreground',
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Back Button */}
        <Link to="/">
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>

        {/* Agent Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className={cn(
              'p-4 rounded-xl',
              agent.type === 'fraud' ? 'bg-primary/10 text-primary' : 'bg-alert-safe/10 text-alert-safe'
            )}>
              <AgentIcon className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-foreground">{agent.name}</h1>
              <p className="text-muted-foreground">{agent.description}</p>
            </div>
          </div>
          <Badge variant="outline" className="w-fit flex items-center gap-2 px-3 py-1.5">
            <Activity className={cn('h-4 w-4', agent.status === 'active' ? 'text-alert-safe' : 'text-muted')} />
            {agent.status === 'active' ? 'Active' : 'Inactive'}
          </Badge>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Risk Score</span>
              </div>
              <p className={cn(
                'text-3xl font-bold',
                agent.currentRiskScore >= 70 ? 'text-alert-high' :
                agent.currentRiskScore >= 40 ? 'text-alert-medium' : 'text-alert-safe'
              )}>
                {agent.currentRiskScore}%
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm">Total Alerts</span>
              </div>
              <p className="text-3xl font-bold text-foreground">{agent.totalAlerts}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Clock className="h-4 w-4" />
                <span className="text-sm">Last Alert</span>
              </div>
              <p className="text-lg font-semibold text-foreground">
                {formatDistanceToNow(agent.lastAlert, { addSuffix: true })}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <MapPin className="h-4 w-4" />
                <span className="text-sm">Specialty</span>
              </div>
              <p className="text-sm font-medium text-foreground truncate">{agent.specialty}</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Risk Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Risk Score Trend (24h)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={riskTrends}>
                    <defs>
                      <linearGradient id="riskGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="hour" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="riskScore" 
                      stroke="hsl(var(--primary))" 
                      fill="url(#riskGradient)" 
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alert Distribution Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Weekly Alert Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={historicalData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar 
                      dataKey={agent.type === 'fraud' ? 'fraud' : 'environmental'} 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Alert History Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Alert History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Risk Score</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="text-sm">
                        {format(alert.timestamp, 'MMM d, HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{alert.type}</TableCell>
                      <TableCell className="text-muted-foreground">{alert.location}</TableCell>
                      <TableCell>
                        <span className={cn(
                          'font-semibold',
                          alert.riskScore >= 70 ? 'text-alert-high' :
                          alert.riskScore >= 40 ? 'text-alert-medium' : 'text-alert-safe'
                        )}>
                          {alert.riskScore}%
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge className={cn('text-xs', levelStyles[alert.level])}>
                          {alert.level.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default AgentDetails;
