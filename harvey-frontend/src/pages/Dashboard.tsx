import { useState } from "react";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { DocumentIntake } from "@/components/dashboard/DocumentIntake";
import { AgentPipeline } from "@/components/dashboard/AgentPipeline";
import { CaseSummary } from "@/components/dashboard/CaseSummary";
import { SupervisorExplanation } from "@/components/dashboard/SupervisorExplanation";
import { RiskBreakdownChart } from "@/components/dashboard/RiskBreakdownChart";
import { UndervaluationChart } from "@/components/dashboard/UndervaluationChart";
import { ComplianceMap } from "@/components/dashboard/ComplianceMap";
import { Terminal, Activity } from "lucide-react";

type PipelineStatus = "IDLE" | "PROCESSING" | "COMPLETED";

const Dashboard = () => {
  const [caseData, setCaseData] = useState<any | null>(null);
  const [supervisorData, setSupervisorData] = useState<any | null>(null);
  const [pipelineStatus, setPipelineStatus] =
    useState<PipelineStatus>("IDLE");

  const handleAnalysisComplete = (result: any) => {
    /**
     * Expected backend response:
     * {
     *   case: {...},
     *   supervisor: {...}
     * }
     */
    setCaseData(result.case);
    setSupervisorData(result.supervisor);
    setPipelineStatus("COMPLETED");
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        {/* Header */}
        <div className="relative">
          <div className="absolute -left-3 top-0 bottom-0 w-1 bg-gradient-to-b from-primary via-primary/50 to-transparent rounded-full" />
          <div className="flex items-center gap-2 mb-1">
            <Terminal className="w-5 h-5 text-primary" />
            <h1 className="text-2xl font-bold font-mono">
              COMPLIANCE_DASHBOARD
            </h1>
            <span className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono">
              <Activity className="w-3 h-3" />
              LIVE
            </span>
          </div>
          <p className="text-muted-foreground text-sm font-mono">
            // Document-based compliance intelligence
          </p>
        </div>

        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-6">
            <DocumentIntake
              onAnalysisComplete={handleAnalysisComplete}
            />

            <AgentPipeline status={pipelineStatus} />
          </div>

          {/* CENTER COLUMN */}
          <div className="space-y-6">
            {caseData ? (
              <>
                <ComplianceMap caseData={caseData} />

                <div className="grid grid-cols-2 gap-4">
                  <RiskBreakdownChart caseData={caseData} />
                  <UndervaluationChart caseData={caseData} />
                </div>
              </>
            ) : (
              <div className="tech-card p-4 text-xs font-mono text-muted-foreground">
                No spatial or risk data available yet.
              </div>
            )}
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {caseData ? (
              <CaseSummary caseData={caseData} />
            ) : (
              <div className="tech-card p-4 text-xs font-mono text-muted-foreground">
                Awaiting document analysis…
              </div>
            )}

            {supervisorData && (
              <SupervisorExplanation
                caseId={supervisorData.case_id}
                flagReason={supervisorData.case_summary}
                reasoning={supervisorData.decision_rationale}
                nextSteps={supervisorData.recommended_next_steps}
                confidenceScore={Math.round(
                  supervisorData.confidence * 100
                )}
              />
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;

