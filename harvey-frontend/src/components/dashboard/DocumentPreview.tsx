import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  FileText, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCw,
  CheckCircle2,
  AlertTriangle,
  FileSearch,
  Layers
} from 'lucide-react';
import { useState } from 'react';

interface DocumentPreviewProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  documentName: string | null;
}

// Simulated document content
const mockDocumentContent = {
  extractedData: {
    propertyId: 'PROP-2024-MH-45678',
    sellerName: 'Rajesh Kumar Sharma',
    buyerName: 'Priya Anil Patel',
    propertyAddress: 'Flat No. 301, Wing A, Lotus Heights, Andheri West, Mumbai - 400053',
    saleValue: '₹45,00,000',
    stampDutyPaid: '₹2,70,000',
    registrationDate: '15-Dec-2024',
    documentType: 'Sale Deed',
    circleRate: '₹52,00,000',
  },
  validationResults: [
    { field: 'Seller Identity', status: 'verified', confidence: 98 },
    { field: 'Buyer Identity', status: 'verified', confidence: 96 },
    { field: 'Property Title', status: 'verified', confidence: 94 },
    { field: 'Sale Value', status: 'flagged', confidence: 87, issue: 'Below circle rate' },
    { field: 'Stamp Duty', status: 'flagged', confidence: 82, issue: 'Calculated on declared value' },
    { field: 'Encumbrance', status: 'verified', confidence: 99 },
  ],
  ocrConfidence: 94.7,
  pagesProcessed: 12,
};

export const DocumentPreview = ({ open, onOpenChange, documentName }: DocumentPreviewProps) => {
  const [zoom, setZoom] = useState(100);
  const [activeTab, setActiveTab] = useState<'preview' | 'data' | 'validation'>('data');

  if (!documentName) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col bg-card border-border p-0">
        <DialogHeader className="px-6 py-4 border-b border-border/50 bg-muted/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg font-mono">{documentName}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    OCR: {mockDocumentContent.ocrConfidence}%
                  </Badge>
                  <Badge variant="outline" className="text-xs text-muted-foreground">
                    {mockDocumentContent.pagesProcessed} pages
                  </Badge>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomOut className="w-4 h-4" onClick={() => setZoom(z => Math.max(50, z - 25))} />
              </Button>
              <span className="text-xs text-muted-foreground font-mono w-12 text-center">{zoom}%</span>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ZoomIn className="w-4 h-4" onClick={() => setZoom(z => Math.min(200, z + 25))} />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <RotateCw className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" className="ml-2">
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 mt-4">
            {[
              { id: 'data', label: 'Extracted Data', icon: Layers },
              { id: 'validation', label: 'Validation', icon: FileSearch },
              { id: 'preview', label: 'Document Preview', icon: FileText },
            ].map((tab) => (
              <Button
                key={tab.id}
                variant={activeTab === tab.id ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                className={activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}
              >
                <tab.icon className="w-4 h-4 mr-2" />
                {tab.label}
              </Button>
            ))}
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 p-6">
          {activeTab === 'data' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(mockDocumentContent.extractedData).map(([key, value]) => (
                  <div key={key} className="tech-card p-4">
                    <p className="text-xs text-muted-foreground uppercase tracking-wider mb-1 font-mono">
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </p>
                    <p className="text-sm font-medium text-foreground">{value}</p>
                  </div>
                ))}
              </div>

              {/* Anomaly Alert */}
              <div className="tech-card p-4 border-amber-500/30 bg-amber-500/5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-amber-400 mt-0.5" />
                  <div>
                    <p className="font-medium text-amber-400">Valuation Anomaly Detected</p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Declared sale value (₹45,00,000) is 13.5% below the circle rate (₹52,00,000) for this locality.
                      This may indicate potential undervaluation for stamp duty evasion.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'validation' && (
            <div className="space-y-3">
              {mockDocumentContent.validationResults.map((result, index) => (
                <div 
                  key={index} 
                  className={`tech-card p-4 ${
                    result.status === 'flagged' ? 'border-amber-500/30 bg-amber-500/5' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {result.status === 'verified' ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">{result.field}</p>
                        {result.issue && (
                          <p className="text-xs text-amber-400 mt-0.5">{result.issue}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Confidence</p>
                        <p className={`font-mono font-medium ${
                          result.confidence >= 90 ? 'text-emerald-400' : 
                          result.confidence >= 80 ? 'text-amber-400' : 'text-red-400'
                        }`}>
                          {result.confidence}%
                        </p>
                      </div>
                      <Badge 
                        variant="outline" 
                        className={result.status === 'verified' 
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                          : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                        }
                      >
                        {result.status}
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'preview' && (
            <div className="flex items-center justify-center h-[400px] tech-card">
              <div className="text-center">
                <FileText className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
                <p className="text-muted-foreground">Document preview</p>
                <p className="text-xs text-muted-foreground/70 mt-1">
                  PDF rendering would appear here in production
                </p>
              </div>
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
