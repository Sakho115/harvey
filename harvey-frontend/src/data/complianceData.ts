export type CaseStatus = 'compliant' | 'flagged' | 'under-review' | 'escalated';
export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface ComplianceCase {
  id: string;
  caseType: string;
  status: CaseStatus;
  riskLevel: RiskLevel;
  priority: number;
  recommendedAction: string;
  propertyValue: number;
  declaredValue: number;
  undervaluationPercent: number;
  location: string;
  coordinates: [number, number];
  registrationOffice: string;
  submittedAt: Date;
  documents: DocumentInfo[];
}

export interface DocumentInfo {
  name: string;
  type: 'sale-deed' | 'stamp-duty' | 'registration-extract';
  status: 'received' | 'extracted' | 'processed' | 'verified';
  uploadedAt: Date;
}

export interface AgentPipelineStage {
  id: string;
  name: string;
  status: 'completed' | 'flagged' | 'processing' | 'pending';
  completedAt?: Date;
  findings?: string;
}

export interface RegionalData {
  region: string;
  coordinates: [number, number];
  totalCases: number;
  flaggedCases: number;
  complianceRate: number;
  severity: 'low' | 'medium' | 'high';
}

export const mockComplianceCases: ComplianceCase[] = [
  {
    id: 'CASE-2024-001',
    caseType: 'Property Undervaluation',
    status: 'flagged',
    riskLevel: 'high',
    priority: 1,
    recommendedAction: 'Immediate review required. Request additional valuation documentation.',
    propertyValue: 4500000,
    declaredValue: 2700000,
    undervaluationPercent: 40,
    location: 'Mumbai Sub-Registry Office',
    coordinates: [19.076, 72.8777],
    registrationOffice: 'Andheri West',
    submittedAt: new Date(Date.now() - 1000 * 60 * 30),
    documents: [
      { name: 'Sale_Deed_2024.pdf', type: 'sale-deed', status: 'verified', uploadedAt: new Date() },
      { name: 'Stamp_Duty_Receipt.pdf', type: 'stamp-duty', status: 'verified', uploadedAt: new Date() },
    ],
  },
  {
    id: 'CASE-2024-002',
    caseType: 'Stamp Duty Mismatch',
    status: 'under-review',
    riskLevel: 'medium',
    priority: 2,
    recommendedAction: 'Verify stamp duty calculation against current circle rates.',
    propertyValue: 3200000,
    declaredValue: 2800000,
    undervaluationPercent: 12.5,
    location: 'Pune Registration Office',
    coordinates: [18.5204, 73.8567],
    registrationOffice: 'Kothrud',
    submittedAt: new Date(Date.now() - 1000 * 60 * 120),
    documents: [
      { name: 'Property_Deed.pdf', type: 'sale-deed', status: 'processed', uploadedAt: new Date() },
    ],
  },
  {
    id: 'CASE-2024-003',
    caseType: 'Zero Value Declaration',
    status: 'escalated',
    riskLevel: 'critical',
    priority: 1,
    recommendedAction: 'Escalate to senior officer. Potential fraud indicator.',
    propertyValue: 5800000,
    declaredValue: 0,
    undervaluationPercent: 100,
    location: 'Thane District Office',
    coordinates: [19.2183, 72.9781],
    registrationOffice: 'Thane West',
    submittedAt: new Date(Date.now() - 1000 * 60 * 60),
    documents: [
      { name: 'Deed_Document.pdf', type: 'sale-deed', status: 'extracted', uploadedAt: new Date() },
    ],
  },
  {
    id: 'CASE-2024-004',
    caseType: 'Property Transfer',
    status: 'compliant',
    riskLevel: 'low',
    priority: 3,
    recommendedAction: 'No action required. All documents verified.',
    propertyValue: 2100000,
    declaredValue: 2100000,
    undervaluationPercent: 0,
    location: 'Nashik Registration Office',
    coordinates: [19.9975, 73.7898],
    registrationOffice: 'Nashik City',
    submittedAt: new Date(Date.now() - 1000 * 60 * 180),
    documents: [
      { name: 'Sale_Agreement.pdf', type: 'sale-deed', status: 'verified', uploadedAt: new Date() },
      { name: 'Stamp_Receipt.pdf', type: 'stamp-duty', status: 'verified', uploadedAt: new Date() },
      { name: 'Registration_Extract.pdf', type: 'registration-extract', status: 'verified', uploadedAt: new Date() },
    ],
  },
];

export const agentPipeline: AgentPipelineStage[] = [
  { id: 'doc-agent', name: 'Document Agent', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 25), findings: 'All documents parsed successfully' },
  { id: 'data-agent', name: 'Data Intelligence Agent', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 20), findings: 'Structured data extracted' },
  { id: 'risk-agent', name: 'Risk Assessment Agent', status: 'flagged', completedAt: new Date(Date.now() - 1000 * 60 * 15), findings: '40% undervaluation detected' },
  { id: 'compliance-agent', name: 'Compliance Agent', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 10), findings: 'Policy violations identified' },
  { id: 'case-agent', name: 'Case Agent', status: 'completed', completedAt: new Date(Date.now() - 1000 * 60 * 5), findings: 'Case file generated' },
  { id: 'supervisor', name: 'Supervisor AI', status: 'completed', completedAt: new Date(), findings: 'Review recommended' },
];

export const regionalData: RegionalData[] = [
  { region: 'Mumbai', coordinates: [19.076, 72.8777], totalCases: 45, flaggedCases: 12, complianceRate: 73, severity: 'high' },
  { region: 'Pune', coordinates: [18.5204, 73.8567], totalCases: 32, flaggedCases: 5, complianceRate: 84, severity: 'medium' },
  { region: 'Thane', coordinates: [19.2183, 72.9781], totalCases: 28, flaggedCases: 8, complianceRate: 71, severity: 'high' },
  { region: 'Nashik', coordinates: [19.9975, 73.7898], totalCases: 18, flaggedCases: 2, complianceRate: 89, severity: 'low' },
  { region: 'Nagpur', coordinates: [21.1458, 79.0882], totalCases: 22, flaggedCases: 3, complianceRate: 86, severity: 'low' },
];

export const riskBreakdown = [
  { category: 'Compliant', value: 58, color: 'hsl(var(--alert-safe))' },
  { category: 'Undervaluation', value: 24, color: 'hsl(var(--alert-medium))' },
  { category: 'Stamp Duty Mismatch', value: 12, color: 'hsl(var(--alert-high))' },
  { category: 'Zero/Invalid Value', value: 6, color: 'hsl(var(--destructive))' },
];

export const undervaluationData = [
  { id: 'TXN-001', undervaluation: 15 },
  { id: 'TXN-002', undervaluation: 42 },
  { id: 'TXN-003', undervaluation: 8 },
  { id: 'TXN-004', undervaluation: 55 },
  { id: 'TXN-005', undervaluation: 28 },
  { id: 'TXN-006', undervaluation: 0 },
  { id: 'TXN-007', undervaluation: 35 },
  { id: 'TXN-008', undervaluation: 62 },
];

export const documentIntakeSteps = [
  { label: 'Document received', completed: true },
  { label: 'Text extracted', completed: true },
  { label: 'Structured data generated', completed: true },
  { label: 'Sent to compliance pipeline', completed: false },
];
