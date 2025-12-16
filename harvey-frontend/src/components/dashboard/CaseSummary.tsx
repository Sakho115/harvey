import { Badge } from "@/components/ui/badge";
import {
  FileText,
  AlertCircle,
  Database,
  Calendar,
  ShieldAlert,
} from "lucide-react";
import { format } from "date-fns";

interface CaseSummaryProps {
  caseData: {
    case_id: string;
    case_type: string;
    status: string;
    priority: string;
    compliance_status: string;
    risk_level: string;
    risk_flags: string[];
    violated_rules: string[];
    summary_metrics: {
      avg_property_value?: number;
      avg_circle_rate?: number;
      aggregate_undervaluation_ratio?: number;
    };
    non_compliant_transactions: any[];
    created_at: string;
    last_updated: string;
  };
}

const badgeStyle = (value: string) => {
  const map: Record<string, string> = {
    COMPLIANT: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    ILLEGAL: "bg-red-500/10 text-red-400 border-red-500/30",
    LOW: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    MEDIUM: "bg-amber-500/10 text-amber-400 border-amber-500/30",
    HIGH: "bg-orange-500/10 text-orange-400 border-orange-500/30",
    CRITICAL: "bg-red-500/10 text-red-400 border-red-500/30",
    OPEN: "bg-blue-500/10 text-blue-400 border-blue-500/30",
  };

  return map[value] || "bg-muted/10 text-muted-foreground border-border/30";
};

export const CaseSummary = ({ caseData }: CaseSummaryProps) => {
  return (
    <div className="tech-card">
      {/* Header */}
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-primary" />
          <h3 className="font-semibold font-mono text-sm">CASE_SUMMARY</h3>
        </div>
        <FileText className="w-4 h-4 text-muted-foreground" />
      </div>

      <div className="p-4 space-y-3">
        {/* Case ID */}
        <Row label="CASE_ID" value={caseData.case_id} highlight />

        {/* Case Type */}
        <Row label="CASE_TYPE" value={caseData.case_type} />

        {/* Status */}
        <Row
          label="STATUS"
          badge={
            <Badge
              variant="outline"
              className={`text-xs font-mono ${badgeStyle(caseData.status)}`}
            >
              {caseData.status}
            </Badge>
          }
        />

        {/* Compliance */}
        <Row
          label="COMPLIANCE"
          badge={
            <Badge
              variant="outline"
              className={`text-xs font-mono ${badgeStyle(
                caseData.compliance_status
              )}`}
            >
              {caseData.compliance_status}
            </Badge>
          }
        />

        {/* Risk Level */}
        <Row
          label="RISK_LEVEL"
          badge={
            <Badge
              variant="outline"
              className={`text-xs font-mono ${badgeStyle(
                caseData.risk_level
              )}`}
            >
              {caseData.risk_level}
            </Badge>
          }
        />

        {/* Priority */}
        <Row label="PRIORITY" value={caseData.priority} />

        {/* Dates */}
        <Row
          label="CREATED_AT"
          value={format(new Date(caseData.created_at), "dd-MM-yyyy HH:mm")}
          icon={<Calendar className="w-3 h-3" />}
        />
        <Row
          label="LAST_UPDATED"
          value={format(new Date(caseData.last_updated), "dd-MM-yyyy HH:mm")}
          icon={<Calendar className="w-3 h-3" />}
        />

        {/* Metrics */}
        <div className="bg-muted/10 border border-border/30 rounded p-3 space-y-2">
          <p className="text-[10px] font-mono text-primary uppercase tracking-wider">
            SUMMARY_METRICS
          </p>

          <Metric
            label="AVG_PROPERTY_VALUE"
            value={caseData.summary_metrics.avg_property_value}
          />
          <Metric
            label="AVG_CIRCLE_RATE"
            value={caseData.summary_metrics.avg_circle_rate}
          />

          {caseData.summary_metrics.aggregate_undervaluation_ratio !==
            undefined && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/20">
              <AlertCircle className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono text-amber-400">
                {(caseData.summary_metrics.aggregate_undervaluation_ratio * 100).toFixed(
                  1
                )}
                % AGGREGATE_UNDERVALUATION
              </span>
            </div>
          )}
        </div>

        {/* Violations */}
        {caseData.violated_rules.length > 0 && (
          <div className="bg-red-500/5 border border-red-500/20 rounded p-3">
            <p className="text-[10px] font-mono text-red-400 uppercase tracking-wider mb-1 flex items-center gap-1">
              <ShieldAlert className="w-3 h-3" />
              VIOLATED_RULES
            </p>
            <ul className="list-disc list-inside text-xs text-red-300 space-y-1">
              {caseData.violated_rules.map((rule, i) => (
                <li key={i}>{rule}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

/* ------------------ helpers ------------------ */

const Row = ({
  label,
  value,
  badge,
  icon,
  highlight,
}: {
  label: string;
  value?: string;
  badge?: React.ReactNode;
  icon?: React.ReactNode;
  highlight?: boolean;
}) => (
  <div className="flex items-center justify-between py-2 border-b border-border/20">
    <span className="text-xs font-mono text-muted-foreground flex items-center gap-1">
      {icon}
      {label}
    </span>
    {badge ? (
      badge
    ) : (
      <span
        className={`font-mono text-sm ${
          highlight ? "text-primary" : "text-foreground"
        }`}
      >
        {value}
      </span>
    )}
  </div>
);

const Metric = ({
  label,
  value,
}: {
  label: string;
  value?: number;
}) => (
  <div className="flex justify-between text-xs font-mono">
    <span className="text-muted-foreground">{label}</span>
    <span className="text-foreground">
      {value !== undefined ? `₹${value.toLocaleString()}` : "—"}
    </span>
  </div>
);

