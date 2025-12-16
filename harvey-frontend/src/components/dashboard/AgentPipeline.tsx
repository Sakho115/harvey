import {
  Check,
  Clock,
  FileSearch,
  Brain,
  AlertTriangle,
  Shield,
  Briefcase,
  UserCheck,
  Cpu,
} from "lucide-react";

type PipelineStatus = "IDLE" | "PROCESSING" | "COMPLETED";

interface AgentPipelineProps {
  status: PipelineStatus;
}

interface Stage {
  id: string;
  name: string;
  status: "pending" | "processing" | "completed";
  findings?: string;
}

const AGENT_ORDER: Omit<Stage, "status">[] = [
  { id: "document", name: "Document Agent" },
  { id: "data", name: "Data Intelligence Agent" },
  { id: "risk", name: "Risk Assessment Agent" },
  { id: "compliance", name: "Compliance Agent" },
  { id: "case", name: "Case Agent" },
  { id: "supervisor", name: "Supervisor Agent" },
];

const getAgentIcon = (id: string) => {
  const icons: Record<string, React.ElementType> = {
    document: FileSearch,
    data: Brain,
    risk: AlertTriangle,
    compliance: Shield,
    case: Briefcase,
    supervisor: UserCheck,
  };
  return icons[id] || Cpu;
};

const buildPipeline = (status: PipelineStatus): Stage[] => {
  if (status === "IDLE") {
    return AGENT_ORDER.map(agent => ({
      ...agent,
      status: "pending",
    }));
  }

  if (status === "PROCESSING") {
    return AGENT_ORDER.map((agent, index) => {
      if (index < 2) {
        return {
          ...agent,
          status: "completed",
          findings:
            agent.id === "document"
              ? "Documents ingested & parsed"
              : "Data normalized & structured",
        };
      }

      if (index === 2) {
        return {
          ...agent,
          status: "processing",
          findings: "Evaluating valuation & stamp duty risk",
        };
      }

      return { ...agent, status: "pending" };
    });
  }

  // COMPLETED
  return [
    {
      id: "document",
      name: "Document Agent",
      status: "completed",
      findings: "Sale deed & receipts extracted",
    },
    {
      id: "data",
      name: "Data Intelligence Agent",
      status: "completed",
      findings: "Metrics & anomalies calculated",
    },
    {
      id: "risk",
      name: "Risk Assessment Agent",
      status: "completed",
      findings: "Risk level assigned",
    },
    {
      id: "compliance",
      name: "Compliance Agent",
      status: "completed",
      findings: "Legal compliance evaluated",
    },
    {
      id: "case",
      name: "Case Agent",
      status: "completed",
      findings: "Case file created",
    },
    {
      id: "supervisor",
      name: "Supervisor Agent",
      status: "completed",
      findings: "Officer explanation generated",
    },
  ];
};

const getStyles = (status: Stage["status"]) => {
  switch (status) {
    case "completed":
      return {
        bg: "bg-emerald-500/10",
        border: "border-emerald-500/30",
        text: "text-emerald-400",
      };
    case "processing":
      return {
        bg: "bg-blue-500/10",
        border: "border-blue-500/30",
        text: "text-blue-400",
      };
    default:
      return {
        bg: "bg-muted/20",
        border: "border-border/30",
        text: "text-muted-foreground",
      };
  }
};

export const AgentPipeline = ({ status }: AgentPipelineProps) => {
  const stages = buildPipeline(status);

  return (
    <div className="tech-card">
      <div className="px-4 py-3 border-b border-border/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Cpu className="w-4 h-4 text-primary" />
          <h3 className="font-mono text-sm font-semibold">
            AGENT_PIPELINE
          </h3>
        </div>
        <span className="text-[10px] font-mono text-primary">
          {status}
        </span>
      </div>

      <div className="p-4 space-y-2">
        {stages.map((stage, index) => {
          const Icon = getAgentIcon(stage.id);
          const styles = getStyles(stage.status);

          return (
            <div key={stage.id} className="relative">
              {index < stages.length - 1 && (
                <div className="absolute left-[18px] top-9 h-4 w-px bg-primary/20" />
              )}

              <div
                className={`flex items-start gap-3 p-2.5 rounded border ${styles.bg} ${styles.border}`}
              >
                <div
                  className={`w-8 h-8 rounded flex items-center justify-center border ${styles.border}`}
                >
                  <Icon className={`w-4 h-4 ${styles.text}`} />
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs">
                      {stage.name}
                    </span>

                    {stage.status === "completed" && (
                      <Check className="w-3 h-3 text-emerald-400" />
                    )}
                    {stage.status === "processing" && (
                      <Clock className="w-3 h-3 text-blue-400 animate-pulse" />
                    )}
                  </div>

                  {stage.findings && (
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {stage.findings}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

