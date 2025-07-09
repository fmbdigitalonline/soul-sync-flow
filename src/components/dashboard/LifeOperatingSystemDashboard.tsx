import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { LifeWheelVisualization } from './LifeWheelVisualization';
import { GapAnalysisDashboard } from './GapAnalysisDashboard';
import { LifeWheelAssessment as AssessmentComponent } from '@/components/assessment/LifeWheelAssessment';
import { Target, TrendingUp, Settings, Plus, RefreshCw } from 'lucide-react';
import { useLifeOrchestrator } from '@/hooks/use-life-orchestrator';
import { LifeDomain } from '@/types/growth-program';

interface LifeOperatingSystemDashboardProps {
  onCreateProgram?: (domain: LifeDomain, supportingDomains: LifeDomain[]) => void;
}

export function LifeOperatingSystemDashboard({ onCreateProgram }: LifeOperatingSystemDashboardProps) {
  const {
    needsAssessment,
    assessments,
    gaps,
    orchestratorPlan,
    loading,
    checkAssessmentNeeds,
    completeAssessment,
    generateProgram,
    updateDomainAssessment
  } = useLifeOrchestrator();

  const [showAssessment, setShowAssessment] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('overview');

  React.useEffect(() => {
    checkAssessmentNeeds();
  }, [checkAssessmentNeeds]);

  const handleStartAssessment = () => {
    setShowAssessment(true);
  };

  const handleCompleteAssessment = async (assessmentData: any[]) => {
    await completeAssessment(assessmentData);
    setShowAssessment(false);
  };

  const handleCreateProgram = async (primaryDomain: LifeDomain, supportingDomains: LifeDomain[]) => {
    if (onCreateProgram) {
      onCreateProgram(primaryDomain, supportingDomains);
    } else {
      // Default behavior - generate program
      await generateProgram(primaryDomain);
    }
  };

  const handleDomainClick = (domain: string) => {
    setSelectedDomain(domain);
    // Could open domain detail modal or navigate to domain-specific view
  };

  const handleRefreshAssessment = () => {
    setShowAssessment(true);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading your Life Operating System...</p>
        </CardContent>
      </Card>
    );
  }

  if (needsAssessment) {
    return (
      <div className="space-y-6">
        <Card className="border-2 border-primary/20">
          <CardHeader className="text-center">
            <div className="text-4xl mb-2">🎯</div>
            <CardTitle className="text-2xl">Welcome to Your Life Operating System</CardTitle>
            <p className="text-muted-foreground">
              Let's start by understanding where you are and where you want to go across all areas of your life.
            </p>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="p-4 bg-muted/50 rounded-lg">
                <TrendingUp className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                <h4 className="font-semibold">Gap Analysis</h4>
                <p className="text-sm text-muted-foreground">
                  Identify your biggest growth opportunities
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Target className="w-6 h-6 text-green-500 mx-auto mb-2" />
                <h4 className="font-semibold">Multi-Domain Strategy</h4>
                <p className="text-sm text-muted-foreground">
                  Coordinate growth across connected life areas
                </p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <Settings className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                <h4 className="font-semibold">Blueprint Integration</h4>
                <p className="text-sm text-muted-foreground">
                  Personalized to your unique design
                </p>
              </div>
            </div>

            <Button 
              onClick={handleStartAssessment}
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              Start Life Wheel Assessment
            </Button>
            
            <p className="text-sm text-muted-foreground">
              Takes about 3-5 minutes • 7 key life domains
            </p>
          </CardContent>
        </Card>

        {/* Assessment Modal */}
        <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Life Wheel Assessment</DialogTitle>
            </DialogHeader>
            <AssessmentComponent
              onComplete={handleCompleteAssessment}
              onCancel={() => setShowAssessment(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Life Operating System</h2>
          <p className="text-muted-foreground">
            Your personalized growth dashboard and multi-domain coordinator
          </p>
        </div>
        <Button variant="outline" onClick={handleRefreshAssessment}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Update Assessment
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-500">{gaps.length}</div>
            <div className="text-sm text-muted-foreground">Growth Areas</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-500">
              {gaps.filter(g => g.gap_size > 3).length}
            </div>
            <div className="text-sm text-muted-foreground">High-Impact Gaps</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-500">
              {Math.round(gaps.reduce((sum, gap) => sum + gap.blueprint_alignment, 0) / gaps.length * 10) / 10}
            </div>
            <div className="text-sm text-muted-foreground">Avg Alignment</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-500">
              {orchestratorPlan?.recommended_focus?.length || 0}
            </div>
            <div className="text-sm text-muted-foreground">Focus Areas</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="gaps">Gap Analysis</TabsTrigger>
          <TabsTrigger value="wheel">Life Wheel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Life Wheel Visualization */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="w-5 h-5" />
                  Life Wheel Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="flex justify-center">
                <LifeWheelVisualization
                  assessments={assessments}
                  gaps={gaps}
                  size={280}
                  interactive={true}
                  showGaps={true}
                  onDomainClick={handleDomainClick}
                />
              </CardContent>
            </Card>

            {/* Strategy Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Growth Strategy
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {orchestratorPlan ? (
                  <>
                    <div>
                      <h4 className="font-semibold mb-2">Primary Focus</h4>
                      <Badge className="bg-primary">
                        {orchestratorPlan.multi_domain_strategy.primary_domain.replace('_', ' ')}
                      </Badge>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold mb-2">Supporting Areas</h4>
                      <div className="flex flex-wrap gap-2">
                        {orchestratorPlan.multi_domain_strategy.supporting_domains.map((domain: string) => (
                          <Badge key={domain} variant="secondary">
                            {domain.replace('_', ' ')}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="font-semibold mb-2">Timeline</h4>
                      <p className="text-sm text-muted-foreground">
                        {orchestratorPlan.multi_domain_strategy.timeline_weeks} weeks
                      </p>
                    </div>

                    <Button 
                      onClick={() => handleCreateProgram(
                        orchestratorPlan.multi_domain_strategy.primary_domain,
                        orchestratorPlan.multi_domain_strategy.supporting_domains
                      )}
                      className="w-full"
                    >
                      Launch Growth Program
                    </Button>
                  </>
                ) : (
                  <p className="text-muted-foreground">
                    Complete your assessment to see your personalized growth strategy.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gaps">
          <GapAnalysisDashboard
            gaps={gaps}
            onFocusDomain={handleDomainClick}
            onCreateProgram={handleCreateProgram}
          />
        </TabsContent>

        <TabsContent value="wheel">
          <Card>
            <CardContent className="p-8 flex justify-center">
              <LifeWheelVisualization
                assessments={assessments}
                gaps={gaps}
                size={400}
                interactive={true}
                showGaps={true}
                onDomainClick={handleDomainClick}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Assessment Update Modal */}
      <Dialog open={showAssessment} onOpenChange={setShowAssessment}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update Life Wheel Assessment</DialogTitle>
          </DialogHeader>
          <AssessmentComponent
            onComplete={handleCompleteAssessment}
            onCancel={() => setShowAssessment(false)}
            initialAssessments={assessments.map(a => ({
              domain: a.domain,
              current_score: a.current_score,
              desired_score: a.desired_score,
              importance_rating: a.importance_rating,
              notes: a.notes || ''
            }))}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}