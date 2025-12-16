import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip, Cell } from 'recharts';
import { undervaluationData } from '@/data/complianceData';

export const UndervaluationChart = () => {
  const getBarColor = (value: number) => {
    if (value >= 50) return 'hsl(var(--destructive))';
    if (value >= 30) return 'hsl(var(--alert-high))';
    if (value > 0) return 'hsl(var(--alert-medium))';
    return 'hsl(var(--alert-safe))';
  };

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold text-foreground">Valuation Anomaly Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={undervaluationData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <XAxis 
                dataKey="id" 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis 
                tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }}
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                unit="%"
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'hsl(var(--card))', 
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => [`${value}%`, 'Undervaluation']}
              />
              <ReferenceLine 
                y={30} 
                stroke="hsl(var(--alert-medium))" 
                strokeDasharray="4 4" 
                label={{ value: '30%', position: 'right', fontSize: 10, fill: 'hsl(var(--alert-medium))' }}
              />
              <ReferenceLine 
                y={50} 
                stroke="hsl(var(--alert-high))" 
                strokeDasharray="4 4"
                label={{ value: '50%', position: 'right', fontSize: 10, fill: 'hsl(var(--alert-high))' }}
              />
              <Bar dataKey="undervaluation" radius={[4, 4, 0, 0]}>
                {undervaluationData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getBarColor(entry.undervaluation)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="text-xs text-muted-foreground mt-2 text-center">
          Transaction undervaluation percentages with 30% and 50% threshold markers
        </p>
      </CardContent>
    </Card>
  );
};
