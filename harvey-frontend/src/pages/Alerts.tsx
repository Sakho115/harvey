import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockAlerts, Alert, AlertLevel } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { AlertDetailDrawer } from '@/components/dashboard/AlertDetailDrawer';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Search, 
  Download, 
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Clock,
  MapPin
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const Alerts = () => {
  const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('timestamp');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedAlerts, setSelectedAlerts] = useState<string[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filteredAlerts = useMemo(() => {
    return alerts
      .filter(alert => {
        const matchesSearch = 
          alert.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          alert.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesSeverity = severityFilter === 'all' || alert.level === severityFilter;
        const matchesAgent = agentFilter === 'all' || alert.agentId === agentFilter;
        return matchesSearch && matchesSeverity && matchesAgent;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'severity':
            const severityOrder = { high: 3, medium: 2, safe: 1 };
            return severityOrder[b.level] - severityOrder[a.level];
          case 'timestamp':
          default:
            return b.timestamp.getTime() - a.timestamp.getTime();
        }
      });
  }, [alerts, searchQuery, severityFilter, agentFilter, sortBy]);

  const totalPages = Math.ceil(filteredAlerts.length / ITEMS_PER_PAGE);
  const paginatedAlerts = filteredAlerts.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedAlerts(paginatedAlerts.map(a => a.id));
    } else {
      setSelectedAlerts([]);
    }
  };

  const handleSelectAlert = (alertId: string, checked: boolean) => {
    if (checked) {
      setSelectedAlerts([...selectedAlerts, alertId]);
    } else {
      setSelectedAlerts(selectedAlerts.filter(id => id !== alertId));
    }
  };

  const handleMarkSelectedResolved = () => {
    setAlerts(prev => prev.map(alert => 
      selectedAlerts.includes(alert.id) 
        ? { ...alert, acknowledged: true }
        : alert
    ));
    toast.success(`${selectedAlerts.length} alerts marked as resolved`);
    setSelectedAlerts([]);
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredAlerts, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `alerts-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success('Alerts exported successfully');
  };

  const handleAlertClick = (alert: Alert) => {
    setSelectedAlert(alert);
    setDrawerOpen(true);
  };

  const handleAcknowledge = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, acknowledged: true } : a
    ));
  };

  const handleMarkSafe = (alertId: string) => {
    setAlerts(prev => prev.map(a => 
      a.id === alertId ? { ...a, level: 'safe' as AlertLevel, acknowledged: true } : a
    ));
  };

  const uniqueAgents = [...new Set(alerts.map(a => a.agentId))];

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">All Alerts</h1>
            <p className="text-muted-foreground">Complete alert history and management</p>
          </div>
          <div className="flex gap-2">
            {selectedAlerts.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleMarkSelectedResolved}
                className="animate-scale-in"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Mark {selectedAlerts.length} Resolved
              </Button>
            )}
            <Button variant="outline" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search alerts..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={severityFilter} onValueChange={setSeverityFilter}>
                  <SelectTrigger className="w-[140px]">
                    <Filter className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="Severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Severity</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="safe">Safe</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={agentFilter} onValueChange={setAgentFilter}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Agent" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Agents</SelectItem>
                    {uniqueAgents.map(agentId => (
                      <SelectItem key={agentId} value={agentId}>
                        {alerts.find(a => a.agentId === agentId)?.agentName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="timestamp">Time</SelectItem>
                    <SelectItem value="severity">Severity</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Alerts Table */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">
              {filteredAlerts.length} Alerts Found
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedAlerts.length === paginatedAlerts.length && paginatedAlerts.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead>Alert</TableHead>
                  <TableHead>Severity</TableHead>
                  <TableHead className="hidden md:table-cell">Location</TableHead>
                  <TableHead className="hidden lg:table-cell">Agent</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedAlerts.map((alert, index) => (
                  <TableRow 
                    key={alert.id}
                    className="cursor-pointer hover:bg-accent/50 transition-colors animate-slide-in-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => handleAlertClick(alert)}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedAlerts.includes(alert.id)}
                        onCheckedChange={(checked) => handleSelectAlert(alert.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{alert.type}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">{alert.description}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <StatusBadge level={alert.level} />
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {alert.location}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                      {alert.agentName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        {format(alert.timestamp, 'MMM d, HH:mm')}
                      </div>
                    </TableCell>
                    <TableCell>
                      {alert.acknowledged ? (
                        <span className="text-xs text-alert-safe flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Resolved
                        </span>
                      ) : (
                        <span className="text-xs text-alert-medium">Active</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Showing {((currentPage - 1) * ITEMS_PER_PAGE) + 1} to{' '}
                {Math.min(currentPage * ITEMS_PER_PAGE, filteredAlerts.length)} of{' '}
                {filteredAlerts.length} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2">
                  Page {currentPage} of {totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alert Detail Drawer */}
      <AlertDetailDrawer
        alert={selectedAlert}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        onAcknowledge={handleAcknowledge}
        onMarkSafe={handleMarkSafe}
      />
    </DashboardLayout>
  );
};

export default Alerts;
