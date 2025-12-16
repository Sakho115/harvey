export type AlertLevel = 'high' | 'medium' | 'safe';

export interface Alert {
  id: string;
  agentId: string;
  agentName: string;
  type: string;
  location: string;
  coordinates: [number, number];
  level: AlertLevel;
  riskScore: number;
  timestamp: Date;
  description: string;
  acknowledged: boolean;
}

export interface Agent {
  id: string;
  name: string;
  type: 'fraud' | 'environmental';
  description: string;
  specialty: string;
  status: 'active' | 'inactive';
  totalAlerts: number;
  currentRiskScore: number;
  lastAlert: Date;
}

export const agents: Agent[] = [
  {
    id: 'fraud-001',
    name: 'Fraud Detection Agent',
    type: 'fraud',
    description: 'AI-powered agent monitoring financial transactions for suspicious activity patterns.',
    specialty: 'Invoice anomalies, payment irregularities, identity fraud',
    status: 'active',
    totalAlerts: 47,
    currentRiskScore: 78,
    lastAlert: new Date(Date.now() - 1000 * 60 * 5),
  },
  {
    id: 'env-001',
    name: 'Environmental Monitor',
    type: 'environmental',
    description: 'Real-time environmental sensor data analysis for hazard detection.',
    specialty: 'Air quality, seismic activity, flooding risk',
    status: 'active',
    totalAlerts: 23,
    currentRiskScore: 45,
    lastAlert: new Date(Date.now() - 1000 * 60 * 30),
  },
];

export const mockAlerts: Alert[] = [
  {
    id: 'alert-001',
    agentId: 'fraud-001',
    agentName: 'Fraud Detection Agent',
    type: 'Suspicious Transaction',
    location: 'Downtown Financial District',
    coordinates: [40.7128, -74.006],
    level: 'high',
    riskScore: 92,
    timestamp: new Date(Date.now() - 1000 * 60 * 2),
    description: 'Multiple high-value transactions detected from new vendor account.',
    acknowledged: false,
  },
  {
    id: 'alert-002',
    agentId: 'env-001',
    agentName: 'Environmental Monitor',
    type: 'Air Quality Warning',
    location: 'Industrial Zone East',
    coordinates: [40.7282, -73.9942],
    level: 'medium',
    riskScore: 67,
    timestamp: new Date(Date.now() - 1000 * 60 * 15),
    description: 'PM2.5 levels elevated above threshold in sector 7.',
    acknowledged: false,
  },
  {
    id: 'alert-003',
    agentId: 'fraud-001',
    agentName: 'Fraud Detection Agent',
    type: 'Invoice Anomaly',
    location: 'Midtown Business Center',
    coordinates: [40.7549, -73.984],
    level: 'high',
    riskScore: 85,
    timestamp: new Date(Date.now() - 1000 * 60 * 45),
    description: 'Duplicate invoice pattern detected across multiple departments.',
    acknowledged: true,
  },
  {
    id: 'alert-004',
    agentId: 'env-001',
    agentName: 'Environmental Monitor',
    type: 'Flood Risk',
    location: 'Riverside Park Area',
    coordinates: [40.8016, -73.9712],
    level: 'safe',
    riskScore: 25,
    timestamp: new Date(Date.now() - 1000 * 60 * 120),
    description: 'Water levels normalized after previous warning.',
    acknowledged: true,
  },
  {
    id: 'alert-005',
    agentId: 'fraud-001',
    agentName: 'Fraud Detection Agent',
    type: 'Identity Verification Failed',
    location: 'Upper East Side Branch',
    coordinates: [40.7736, -73.9566],
    level: 'medium',
    riskScore: 58,
    timestamp: new Date(Date.now() - 1000 * 60 * 180),
    description: 'Multiple failed verification attempts on high-value account.',
    acknowledged: false,
  },
  {
    id: 'alert-006',
    agentId: 'env-001',
    agentName: 'Environmental Monitor',
    type: 'Seismic Activity',
    location: 'Northern Suburbs',
    coordinates: [40.8448, -73.8648],
    level: 'safe',
    riskScore: 12,
    timestamp: new Date(Date.now() - 1000 * 60 * 240),
    description: 'Minor tremor detected, no action required.',
    acknowledged: true,
  },
];

export const historicalData = [
  { date: 'Mon', fraud: 12, environmental: 5 },
  { date: 'Tue', fraud: 8, environmental: 9 },
  { date: 'Wed', fraud: 15, environmental: 4 },
  { date: 'Thu', fraud: 6, environmental: 11 },
  { date: 'Fri', fraud: 10, environmental: 7 },
  { date: 'Sat', fraud: 4, environmental: 3 },
  { date: 'Sun', fraud: 7, environmental: 6 },
];

export const riskTrends = [
  { hour: '00:00', riskScore: 45 },
  { hour: '04:00', riskScore: 32 },
  { hour: '08:00', riskScore: 58 },
  { hour: '12:00', riskScore: 72 },
  { hour: '16:00', riskScore: 85 },
  { hour: '20:00', riskScore: 63 },
  { hour: '24:00', riskScore: 48 },
];
