import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAlerts, historicalData, AlertLevel } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Download, Search, Filter, FileJson, FileText, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';

const Reports = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');

  const filteredAlerts = mockAlerts.filter(alert => {
    const matchesSearch = 
      alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      alert.agentName.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLevel = levelFilter === 'all' || alert.level === levelFilter;
    const matchesAgent = agentFilter === 'all' || alert.agentId === agentFilter;
    return matchesSearch && matchesLevel && matchesAgent;
  });

  const levelStyles = {
    high: 'bg-alert-high text-alert-high-foreground',
    medium: 'bg-alert-medium text-alert-medium-foreground',
    safe: 'bg-alert-safe text-alert-safe-foreground',
  };

  // Alert type distribution for pie chart
  const alertTypeData = [
    { name: 'High', value: mockAlerts.filter(a => a.level === 'high').length, color: 'hsl(var(--alert-high))' },
    { name: 'Medium', value: mockAlerts.filter(a => a.level === 'medium').length, color: 'hsl(var(--alert-medium))' },
    { name: 'Safe', value: mockAlerts.filter(a => a.level === 'safe').length, color: 'hsl(var(--alert-safe))' },
  ];

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Agent', 'Type', 'Location', 'Risk Score', 'Level', 'Status'];
    const rows = filteredAlerts.map(alert => [
      format(alert.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      alert.agentName,
      alert.type,
      alert.location,
      alert.riskScore,
      alert.level,
      alert.acknowledged ? 'Acknowledged' : 'Active'
    ]);
    
    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV report downloaded');
  };

  const handleExportJSON = () => {
    const data = filteredAlerts.map(alert => ({
      timestamp: format(alert.timestamp, 'yyyy-MM-dd HH:mm:ss'),
      agent: alert.agentName,
      type: alert.type,
      location: alert.location,
      riskScore: alert.riskScore,
      level: alert.level,
      status: alert.acknowledged ? 'acknowledged' : 'active',
      description: alert.description
    }));
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-report-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('JSON report downloaded');
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Reports & Logs</h1>
            <p className="text-muted-foreground">View and export alert history and analytics</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleExportCSV}>
              <FileText className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
            <Button variant="outline" onClick={handleExportJSON}>
              <FileJson className="h-4 w-4 mr-2" />
              Export JSON
            </Button>
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Weekly Comparison Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                Weekly Alert Comparison
              </CardTitle>
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
                    <Legend />
                    <Bar dataKey="fraud" name="Fraud" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="environmental" name="Environmental" fill="hsl(var(--alert-safe))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Alert Distribution Pie Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[250px] flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={alertTypeData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {alertTypeData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'hsl(var(--card))', 
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={levelFilter} onValueChange={setLevelFilter}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="safe">Safe</SelectItem>
                </SelectContent>
              </Select>
              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Filter by agent" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Agents</SelectItem>
                  <SelectItem value="fraud-001">Fraud Detection</SelectItem>
                  <SelectItem value="env-001">Environmental Monitor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Alert Logs</CardTitle>
              <Badge variant="secondary">{filteredAlerts.length} records</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Timestamp</TableHead>
                    <TableHead>Agent</TableHead>
                    <TableHead>Alert Type</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Risk</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredAlerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                        {format(alert.timestamp, 'MMM d, yyyy HH:mm')}
                      </TableCell>
                      <TableCell className="font-medium">{alert.agentName}</TableCell>
                      <TableCell>{alert.type}</TableCell>
                      <TableCell className="text-muted-foreground max-w-[200px] truncate">
                        {alert.location}
                      </TableCell>
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
                      <TableCell>
                        <Badge variant={alert.acknowledged ? 'secondary' : 'outline'} className="text-xs">
                          {alert.acknowledged ? 'Acknowledged' : 'Active'}
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

export default Reports;
