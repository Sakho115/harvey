import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Brain,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

interface SupervisorExplanationProps {
  caseId: string;
  flagReason: string;
  reasoning: string;
  nextSteps: string[];
  confidenceScore: number;
}

export const SupervisorExplanation = ({
  caseId,
  flagReason,
  reasoning,
  nextSteps,
  confidenceScore,
}: SupervisorExplanationProps) => {
  const isLowRisk = confidenceScore < 90;

  return (
    <Card className="tech-card">
      <CardHeader className="pb-3 border-b border-border/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            <CardTitle className="text-sm font-mono">
              SUPERVISOR_EXPLANATION
            </CardTitle>
          </div>
          <Badge
            variant="outline"
            className="text-[10px] font-mono text-muted-foreground"
          >
            OFFICER_VIEW
          </Badge>
        </div>

        <p className="text-xs text-muted-foreground font-mono mt-1">
          Case Reference:{" "}
          <span className="text-primary">{caseId}</span>
        </p>
      </CardHeader>

      <CardContent className="space-y-5 pt-4">
        {/* WHY CASE EXISTS */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            {isLowRisk ? (
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            )}
            <span className="text-xs font-mono text-foreground uppercase">
              CASE_SUMMARY
            </span>
          </div>
          <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
            {flagReason}
          </p>
        </div>

        {/* REASONING */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-primary" />
            <span className="text-xs font-mono text-foreground uppercase">
              DECISION_RATIONALE
            </span>
          </div>
          <p className="text-sm text-muted-foreground pl-6 leading-relaxed">
            {reasoning}
          </p>
        </div>

        {/* NEXT STEPS */}
        <div className="space-y-2">
          <span className="text-xs font-mono text-foreground uppercase">
            RECOMMENDED_ACTIONS
          </span>
          <div className="space-y-2 pl-2">
            {nextSteps.map((step, index) => (
              <div
                key={index}
                className="flex items-start gap-2 text-sm text-muted-foreground"
              >
                <ArrowRight className="w-3.5 h-3.5 mt-0.5 text-primary/70" />
                <span>{step}</span>
              </div>
            ))}
          </div>
        </div>

        {/* CONFIDENCE */}
        <div className="pt-3 border-t border-border/30 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-mono text-muted-foreground">
              CONFIDENCE_SCORE
            </span>
            <span className="text-xs font-mono text-foreground">
              {confidenceScore}%
            </span>
          </div>

          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                confidenceScore >= 90
                  ? "bg-emerald-500"
                  : confidenceScore >= 70
                  ? "bg-amber-500"
                  : "bg-blue-500"
              }`}
              style={{ width: `${confidenceScore}%` }}
            />
          </div>
        </div>

        {/* DISCLAIMER */}
        <p className="text-[10px] text-muted-foreground/70 italic pt-2 font-mono">
          This automated explanation supports administrative review.
          Final authority rests with the designated government officer.
        </p>
      </CardContent>
    </Card>
  );
};

