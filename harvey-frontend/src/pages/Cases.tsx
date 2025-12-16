import { useState, useMemo } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { mockComplianceCases, ComplianceCase, CaseStatus, RiskLevel } from '@/data/complianceData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { DocumentPreview } from '@/components/dashboard/DocumentPreview';
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
  MapPin,
  FileText,
  Eye,
  AlertTriangle,
  Scale,
  Terminal,
  Zap
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const ITEMS_PER_PAGE = 10;

const getStatusBadge = (status: CaseStatus) => {
  const styles: Record<CaseStatus, string> = {
    'compliant': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'flagged': 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    'under-review': 'bg-blue-500/10 text-blue-400 border-blue-500/30',
    'escalated': 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return styles[status];
};

const getRiskBadge = (level: RiskLevel) => {
  const styles: Record<RiskLevel, string> = {
    'low': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    'medium': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
    'high': 'bg-orange-500/10 text-orange-400 border-orange-500/30',
    'critical': 'bg-red-500/10 text-red-400 border-red-500/30',
  };
  return styles[level];
};

const Cases = () => {
  const [cases, setCases] = useState<ComplianceCase[]>(mockComplianceCases);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [riskFilter, setRiskFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('submittedAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCases, setSelectedCases] = useState<string[]>([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewDoc, setPreviewDoc] = useState<string | null>(null);

  const filteredCases = useMemo(() => {
    return cases
      .filter(c => {
        const matchesSearch = 
          c.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.caseType.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.location.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
        const matchesRisk = riskFilter === 'all' || c.riskLevel === riskFilter;
        return matchesSearch && matchesStatus && matchesRisk;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'risk':
            const riskOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
          case 'priority':
            return a.priority - b.priority;
          case 'submittedAt':
          default:
            return b.submittedAt.getTime() - a.submittedAt.getTime();
        }
      });
  }, [cases, searchQuery, statusFilter, riskFilter, sortBy]);

  const totalPages = Math.ceil(filteredCases.length / ITEMS_PER_PAGE);
  const paginatedCases = filteredCases.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedCases(paginatedCases.map(c => c.id));
    } else {
      setSelectedCases([]);
    }
  };

  const handleSelectCase = (caseId: string, checked: boolean) => {
    if (checked) {
      setSelectedCases([...selectedCases, caseId]);
    } else {
      setSelectedCases(selectedCases.filter(id => id !== caseId));
    }
  };

  const handleBulkReview = () => {
    setCases(prev => prev.map(c => 
      selectedCases.includes(c.id) 
        ? { ...c, status: 'under-review' as CaseStatus }
        : c
    ));
    toast.success(`${selectedCases.length} cases moved to review`);
    setSelectedCases([]);
  };

  const handleExport = () => {
    const data = JSON.stringify(filteredCases, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cases-export-${format(new Date(), 'yyyy-MM-dd')}.json`;
    a.click();
    toast.success('Cases exported successfully');
  };

  const handlePreviewDocument = (docName: string) => {
    setPreviewDoc(docName);
    setPreviewOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header with tech styling */}
        <div className="flex flex-col sm:flex-row justify-between gap-4">
          <div className="relative">
            <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
            <div className="flex items-center gap-2 mb-1">
              <Terminal className="w-5 h-5 text-primary" />
              <h1 className="text-2xl font-bold text-foreground font-mono">CASE_REGISTRY</h1>
            </div>
            <p className="text-muted-foreground text-sm font-mono">// Compliance case management system</p>
          </div>
          <div className="flex gap-2">
            {selectedCases.length > 0 && (
              <Button 
                variant="outline" 
                onClick={handleBulkReview}
                className="animate-scale-in border-primary/50 hover:border-primary"
              >
                <Scale className="w-4 h-4 mr-2" />
                Review {selectedCases.length} Cases
              </Button>
            )}
            <Button variant="outline" onClick={handleExport} className="border-border hover:border-primary/50">
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total Cases', value: cases.length, color: 'text-foreground' },
            { label: 'Flagged', value: cases.filter(c => c.status === 'flagged').length, color: 'text-amber-400' },
            { label: 'Escalated', value: cases.filter(c => c.status === 'escalated').length, color: 'text-red-400' },
            { label: 'Compliant', value: cases.filter(c => c.status === 'compliant').length, color: 'text-emerald-400' },
          ].map((stat, i) => (
            <div key={i} className="tech-card p-3 text-center">
              <p className={`text-2xl font-bold font-mono ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-muted-foreground uppercase tracking-wider">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <Card className="tech-card">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/70" />
                <Input
                  placeholder="Search cases by ID, type, location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-background/50 border-border focus:border-primary font-mono text-sm"
                />
              </div>
              <div className="flex flex-wrap gap-2">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-border">
                    <Filter className="w-4 h-4 mr-2 text-primary/70" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="compliant">Compliant</SelectItem>
                    <SelectItem value="flagged">Flagged</SelectItem>
                    <SelectItem value="under-review">Under Review</SelectItem>
                    <SelectItem value="escalated">Escalated</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={riskFilter} onValueChange={setRiskFilter}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-border">
                    <AlertTriangle className="w-4 h-4 mr-2 text-primary/70" />
                    <SelectValue placeholder="Risk" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="all">All Risk</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[140px] bg-background/50 border-border">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-card border-border">
                    <SelectItem value="submittedAt">Date</SelectItem>
                    <SelectItem value="risk">Risk Level</SelectItem>
                    <SelectItem value="priority">Priority</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cases Table */}
        <Card className="tech-card overflow-hidden">
          <CardHeader className="border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <CardTitle className="text-lg font-mono">
                  {filteredCases.length} Cases
                </CardTitle>
              </div>
              <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                LIVE_DATA
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="border-border/50 hover:bg-transparent">
                  <TableHead className="w-12">
                    <Checkbox
                      checked={selectedCases.length === paginatedCases.length && paginatedCases.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">CASE_ID</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">TYPE</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">STATUS</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">RISK</TableHead>
                  <TableHead className="hidden md:table-cell font-mono text-xs text-muted-foreground">LOCATION</TableHead>
                  <TableHead className="hidden lg:table-cell font-mono text-xs text-muted-foreground">UNDERVAL%</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">DOCS</TableHead>
                  <TableHead className="font-mono text-xs text-muted-foreground">DATE</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedCases.map((caseItem, index) => (
                  <TableRow 
                    key={caseItem.id}
                    className="border-border/30 hover:bg-primary/5 transition-colors animate-slide-in-row"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedCases.includes(caseItem.id)}
                        onCheckedChange={(checked) => handleSelectCase(caseItem.id, checked as boolean)}
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-primary">{caseItem.id}</span>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground text-sm">{caseItem.caseType}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize text-xs ${getStatusBadge(caseItem.status)}`}>
                        {caseItem.status.replace('-', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`capitalize text-xs ${getRiskBadge(caseItem.riskLevel)}`}>
                        {caseItem.riskLevel}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <MapPin className="w-3 h-3" />
                        {caseItem.registrationOffice}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell">
                      <span className={`font-mono text-sm ${
                        caseItem.undervaluationPercent >= 50 ? 'text-red-400' :
                        caseItem.undervaluationPercent >= 30 ? 'text-orange-400' :
                        caseItem.undervaluationPercent > 0 ? 'text-yellow-400' : 'text-emerald-400'
                      }`}>
                        {caseItem.undervaluationPercent}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {caseItem.documents.slice(0, 2).map((doc, i) => (
                          <Button
                            key={i}
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0 hover:bg-primary/20"
                            onClick={(e) => {
                              e.stopPropagation();
                              handlePreviewDocument(doc.name);
                            }}
                          >
                            <FileText className="w-4 h-4 text-primary/70" />
                          </Button>
                        ))}
                        {caseItem.documents.length > 2 && (
                          <span className="text-xs text-muted-foreground">+{caseItem.documents.length - 2}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground font-mono">
                        <Clock className="w-3 h-3" />
                        {format(caseItem.submittedAt, 'dd/MM HH:mm')}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {/* Pagination */}
            <div className="flex items-center justify-between p-4 border-t border-border/50 bg-muted/10">
              <p className="text-sm text-muted-foreground font-mono">
                [{((currentPage - 1) * ITEMS_PER_PAGE) + 1}-{Math.min(currentPage * ITEMS_PER_PAGE, filteredCases.length)}] of {filteredCases.length}
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="border-border hover:border-primary/50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <span className="text-sm px-2 font-mono">
                  {currentPage}/{totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="border-border hover:border-primary/50"
                >
                  <ChevronRight className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Document Preview Dialog */}
      <DocumentPreview 
        open={previewOpen} 
        onOpenChange={setPreviewOpen} 
        documentName={previewDoc} 
      />
    </DashboardLayout>
  );
};

export default Cases;
