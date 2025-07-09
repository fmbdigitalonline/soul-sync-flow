import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { TrendingUp, Target, AlertTriangle, Lightbulb, ArrowRight } from 'lucide-react';
import { DomainGap, LifeDomain } from '@/types/growth-program';

interface GapAnalysisDashboardProps {
  gaps: DomainGap[];
  onFocusDomain?: (domain: LifeDomain) => void;
  onCreateProgram?: (primaryDomain: LifeDomain, supportingDomains: LifeDomain[]) => void;
  maxGaps?: number;
}

const DOMAIN_LABELS = {
  wellbeing: 'Overall Wellbeing',
  energy: 'Energy & Vitality', 
  career: 'Career & Work',
  relationships: 'Relationships',
  finances: 'Financial Health',
  health: 'Physical Health',
  personal_growth: 'Personal Growth',
  creativity: 'Creativity',
  spirituality: 'Spirituality',
  home_family: 'Home & Family',
  productivity: 'Productivity',
  stress: 'Stress Management'
} as const;

const DOMAIN_ICONS = {
  wellbeing: '🌟',
  energy: '⚡',
  career: '💼',
  relationships: '❤️',
  finances: '💰',
  health: '🏃',
  personal_growth: '🌱',
  creativity: '🎨',
  spirituality: '🙏',
  home_family: '🏠',
  productivity: '📈',
  stress: '😌'
} as const;

export function GapAnalysisDashboard({ 
  gaps, 
  onFocusDomain, 
  onCreateProgram,
  maxGaps = 6 
}: GapAnalysisDashboardProps) {
  const topGaps = gaps.slice(0, maxGaps);
  const primaryGap = topGaps[0];
  const supportingGaps = topGaps.slice(1, 3);

  const getPriorityColor = (score: number) => {
    if (score >= 8) return 'bg-red-500';
    if (score >= 6) return 'bg-amber-500';
    if (score >= 4) return 'bg-blue-500';
    return 'bg-gray-500';
  };

  const getPriorityLabel = (score: number) => {
    if (score >= 8) return 'High Priority';
    if (score >= 6) return 'Medium Priority';
    if (score >= 4) return 'Low Priority';
    return 'Maintain';
  };

  const handleCreateProgram = () => {
    if (onCreateProgram && primaryGap) {
      onCreateProgram(
        primaryGap.domain,
        supportingGaps.map(gap => gap.domain)
      );
    }
  };

  if (!topGaps.length) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h3 className="text-lg font-semibold mb-2">No Gaps Detected</h3>
          <p className="text-muted-foreground">
            Your life wheel looks balanced! Complete an assessment to see your growth opportunities.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Strategic Overview */}
      <Card className="border-2 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            Strategic Growth Focus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-3 gap-4">
            {/* Primary Focus */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Primary Focus</h4>
                <Badge className={getPriorityColor(primaryGap.priority_score)}>
                  {getPriorityLabel(primaryGap.priority_score)}
                </Badge>
              </div>
              
              <div className="bg-muted/50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">
                    {DOMAIN_ICONS[primaryGap.domain as keyof typeof DOMAIN_ICONS]}
                  </span>
                  <div>
                    <h5 className="font-medium">
                      {DOMAIN_LABELS[primaryGap.domain as keyof typeof DOMAIN_LABELS]}
                    </h5>
                    <p className="text-sm text-muted-foreground">
                      Gap: {primaryGap.current_score} → {primaryGap.desired_score} 
                      (+{primaryGap.gap_size} points)
                    </p>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progress Potential</span>
                    <span>{Math.round((primaryGap.gap_size / 10) * 100)}%</span>
                  </div>
                  <Progress 
                    value={Math.round((primaryGap.gap_size / 10) * 100)} 
                    className="h-2"
                  />
                </div>
              </div>
            </div>

            {/* Supporting Areas */}
            <div className="space-y-3">
              <h4 className="font-semibold">Supporting Areas</h4>
              <div className="space-y-2">
                {supportingGaps.map((gap) => (
                  <div key={gap.domain} className="flex items-center gap-2 p-2 bg-muted/30 rounded">
                    <span className="text-lg">
                      {DOMAIN_ICONS[gap.domain as keyof typeof DOMAIN_ICONS]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {DOMAIN_LABELS[gap.domain as keyof typeof DOMAIN_LABELS]}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        +{gap.gap_size} gap
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Button */}
          {onCreateProgram && (
            <Button 
              onClick={handleCreateProgram}
              className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              Create Multi-Domain Program
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          )}
        </CardContent>
      </Card>

      {/* All Gaps Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            All Growth Opportunities
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topGaps.map((gap, index) => (
              <div 
                key={gap.domain}
                className="flex items-center gap-4 p-3 rounded-lg border hover:bg-muted/50 transition-colors cursor-pointer"
                onClick={() => onFocusDomain?.(gap.domain)}
              >
                {/* Priority Indicator */}
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${getPriorityColor(gap.priority_score)}`} />
                  <span className="text-sm font-mono text-muted-foreground">
                    #{index + 1}
                  </span>
                </div>

                {/* Domain Info */}
                <div className="flex items-center gap-3 flex-1">
                  <span className="text-xl">
                    {DOMAIN_ICONS[gap.domain as keyof typeof DOMAIN_ICONS]}
                  </span>
                  <div className="flex-1">
                    <h4 className="font-medium">
                      {DOMAIN_LABELS[gap.domain as keyof typeof DOMAIN_LABELS]}
                    </h4>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>Current: {gap.current_score}/10</span>
                      <span>Desired: {gap.desired_score}/10</span>
                      <span>Gap: +{gap.gap_size}</span>
                    </div>
                  </div>
                </div>

                {/* Metrics */}
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">
                      {gap.priority_score.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Priority</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="font-semibold">
                      {gap.importance_rating}/10
                    </div>
                    <div className="text-muted-foreground">Importance</div>
                  </div>

                  <div className="text-center">
                    <div className="font-semibold">
                      {gap.blueprint_alignment.toFixed(1)}
                    </div>
                    <div className="text-muted-foreground">Alignment</div>
                  </div>
                </div>

                <ArrowRight className="w-4 h-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="w-5 h-5 text-amber-500" />
            Growth Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {primaryGap.interdependency_boost > 2 && (
              <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Synergy Opportunity:</strong> Improving {DOMAIN_LABELS[primaryGap.domain as keyof typeof DOMAIN_LABELS]} 
                  will boost other life areas due to strong interdependencies.
                </div>
              </div>
            )}
            
            {primaryGap.blueprint_alignment > 7 && (
              <div className="flex items-start gap-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-lg">
                <Target className="w-4 h-4 text-green-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Natural Fit:</strong> This focus area aligns well with your personality blueprint 
                  for sustainable growth.
                </div>
              </div>
            )}

            {gaps.filter(g => g.gap_size > 5).length > 3 && (
              <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/20 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5" />
                <div className="text-sm">
                  <strong>Pacing Recommendation:</strong> You have several large gaps. 
                  Focus on 1-2 domains at a time for sustainable progress.
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}