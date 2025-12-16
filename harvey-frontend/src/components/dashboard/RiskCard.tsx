import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Agent, AlertLevel } from '@/data/mockData';
import { Bot, Leaf, ArrowRight, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface RiskCardProps {
  agent: Agent;
  latestAlertLevel: AlertLevel;
  latestAlertType: string;
  latestAlertLocation: string;
}

const getRiskLevel = (score: number): AlertLevel => {
  if (score >= 70) return 'high';
  if (score >= 40) return 'medium';
  return 'safe';
};

export function RiskCard({ agent, latestAlertLevel, latestAlertType, latestAlertLocation }: RiskCardProps) {
  const riskLevel = getRiskLevel(agent.currentRiskScore);
  const AgentIcon = agent.type === 'fraud' ? Bot : Leaf;
  
  const levelStyles = {
    high: 'border-alert-high/50 bg-alert-high/5',
    medium: 'border-alert-medium/50 bg-alert-medium/5',
    safe: 'border-alert-safe/50 bg-alert-safe/5',
  };

  const badgeStyles = {
    high: 'bg-alert-high text-alert-high-foreground',
    medium: 'bg-alert-medium text-alert-medium-foreground',
    safe: 'bg-alert-safe text-alert-safe-foreground',
  };

  const scoreStyles = {
    high: 'text-alert-high',
    medium: 'text-alert-medium',
    safe: 'text-alert-safe',
  };

  return (
    <Link to={`/agent/${agent.id}`}>
      <Card className={cn(
        'group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer',
        levelStyles[riskLevel]
      )}>
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                'p-2 rounded-lg',
                agent.type === 'fraud' ? 'bg-primary/10 text-primary' : 'bg-alert-safe/10 text-alert-safe'
              )}>
                <AgentIcon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground text-sm">{agent.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {agent.status === 'active' ? (
                    <span className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-alert-safe" />
                      Active
                    </span>
                  ) : 'Inactive'}
                </p>
              </div>
            </div>
            <Badge className={cn('text-xs', badgeStyles[latestAlertLevel])}>
              {latestAlertLevel.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Risk Score */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Risk Score</span>
            <span className={cn('text-2xl font-bold', scoreStyles[riskLevel])}>
              {agent.currentRiskScore}%
            </span>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-2 bg-muted/30 rounded-full overflow-hidden">
            <div 
              className={cn('h-full rounded-full transition-all duration-500', {
                'bg-alert-high': riskLevel === 'high',
                'bg-alert-medium': riskLevel === 'medium',
                'bg-alert-safe': riskLevel === 'safe',
              })}
              style={{ width: `${agent.currentRiskScore}%` }}
            />
          </div>

          {/* Latest Alert Info */}
          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Latest Alert</p>
            <p className="text-sm font-medium text-foreground truncate">{latestAlertType}</p>
            <p className="text-xs text-muted-foreground truncate">{latestAlertLocation}</p>
          </div>

          {/* View Details */}
          <div className="flex items-center justify-end text-primary text-sm font-medium group-hover:underline">
            View Details
            <ArrowRight className="h-4 w-4 ml-1 transition-transform group-hover:translate-x-1" />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
