import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ArrowLeft, ArrowRight, Route, Target, Plus, Check, AlertCircle } from 'lucide-react';
import { GrowthDomainSelection } from '@/components/growth/onboarding/GrowthDomainSelection';
import { LifeWheelVisualization } from './LifeWheelVisualization';
import { LifeDomain, LifeWheelAssessment } from '@/types/growth-program';
import { supabase } from '@/integrations/supabase/client';

interface ProgressiveJourneyAssessmentProps {
  onComplete: (assessmentData: LifeWheelAssessment[]) => void;
  onBack: () => void;
}

interface DomainInterdependency {
  from_domain: string;
  to_domain: string;
  relationship_type: string;
  strength: number;
}

const JOURNEY_STEPS = [
  {
    id: 'priority',
    title: 'Priority Selection',
    description: 'Choose your primary focus domain'
  },
  {
    id: 'assessment',
    title: 'Initial Assessment',
    description: 'Rate your chosen domain'
  },
  {
    id: 'relationships',
    title: 'Relationship Discovery',
    description: 'Explore connected domains'
  },
  {
    id: 'expansion',
    title: 'Smart Expansion',
    description: 'Add related assessments'
  },
  {
    id: 'completion',
    title: 'Journey Complete',
    description: 'Finalize your assessment'
  }
];

const DOMAIN_LABELS: Record<string, string> = {
  wellbeing: 'Wellbeing',
  energy: 'Energy & Vitality',
  career: 'Career & Purpose',
  relationships: 'Relationships',
  finances: 'Financial Health',
  health: 'Physical Health',
  personal_growth: 'Personal Growth'
};

export function ProgressiveJourneyAssessment({ onComplete, onBack }: ProgressiveJourneyAssessmentProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPrimaryDomain, setSelectedPrimaryDomain] = useState<LifeDomain | null>(null);
  const [assessments, setAssessments] = useState<LifeWheelAssessment[]>([]);
  const [interdependencies, setInterdependencies] = useState<DomainInterdependency[]>([]);
  const [suggestedDomains, setSuggestedDomains] = useState<LifeDomain[]>([]);
  const [completedDomains, setCompletedDomains] = useState<Set<LifeDomain>>(new Set());
  const [loading, setLoading] = useState(false);

  // Load domain interdependencies
  useEffect(() => {
    const loadInterdependencies = async () => {
      try {
        const { data, error } = await supabase
          .from('domain_interdependencies')
          .select('*');
        
        if (error) throw error;
        setInterdependencies(data || []);
      } catch (error) {
        console.error('Error loading interdependencies:', error);
      }
    };

    loadInterdependencies();
  }, []);

  // Calculate suggested domains based on interdependencies
  useEffect(() => {
    if (selectedPrimaryDomain && interdependencies.length > 0) {
      const related = interdependencies
        .filter(dep => 
          dep.from_domain === selectedPrimaryDomain && 
          dep.strength > 0.6 &&
          !completedDomains.has(dep.to_domain as LifeDomain)
        )
        .sort((a, b) => b.strength - a.strength)
        .slice(0, 3)
        .map(dep => dep.to_domain as LifeDomain);
      
      setSuggestedDomains(related);
    }
  }, [selectedPrimaryDomain, interdependencies, completedDomains]);

  const handleDomainSelect = (domain: LifeDomain) => {
    if (currentStep === 0) {
      setSelectedPrimaryDomain(domain);
      setCurrentStep(1);
    }
  };

  const handleDomainAssessment = (domain: LifeDomain, current: number, desired: number, importance: number, notes: string = '') => {
    const assessment = {
      domain,
      current_score: current,
      desired_score: desired,
      importance_rating: importance,
      notes
    } as LifeWheelAssessment;

    setAssessments(prev => [
      ...prev.filter(a => a.domain !== domain),
      assessment
    ]);

    setCompletedDomains(prev => new Set([...prev, domain]));

    // Auto-advance if this is the primary domain
    if (domain === selectedPrimaryDomain && currentStep === 1) {
      setCurrentStep(2);
    }
  };

  const handleAddSuggestedDomain = (domain: LifeDomain) => {
    setCurrentStep(1);
    // Reset to assessment mode for new domain
    setTimeout(() => {
      // This would trigger domain-specific assessment UI
    }, 100);
  };

  const handleCompleteJourney = () => {
    if (assessments.length > 0) {
      onComplete(assessments);
    }
  };

  const progress = ((currentStep + 1) / JOURNEY_STEPS.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        {/* Header */}
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment Options
          </Button>
          
          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-bold">Progressive Journey Assessment</h2>
              <p className="text-muted-foreground">
                Step {currentStep + 1} of {JOURNEY_STEPS.length}: {JOURNEY_STEPS[currentStep].title}
              </p>
            </div>
            
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>{JOURNEY_STEPS[currentStep].description}</span>
                <span>{Math.round(progress)}% complete</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-4 gap-6">
          
          {/* Journey Map */}
          <div className="lg:col-span-1">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <Route className="h-4 w-4" />
                  Journey Map
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {JOURNEY_STEPS.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`p-2 rounded-lg border text-xs ${
                      index === currentStep 
                        ? 'bg-primary text-primary-foreground border-primary' 
                        : index < currentStep 
                          ? 'bg-green-50 text-green-800 border-green-200' 
                          : 'bg-muted text-muted-foreground border-muted'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {index < currentStep ? (
                        <Check className="h-3 w-3" />
                      ) : (
                        <span className="w-3 h-3 rounded-full border flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-medium">{step.title}</div>
                        <div className="text-xs opacity-80">{step.description}</div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {/* Completed Domains */}
                {completedDomains.size > 0 && (
                  <div className="pt-4 border-t">
                    <div className="text-xs font-medium mb-2">Assessed Domains</div>
                    {Array.from(completedDomains).map(domain => (
                      <Badge key={domain} variant="secondary" className="text-xs mb-1 mr-1">
                        {DOMAIN_LABELS[domain]}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            
            {/* Step 0: Priority Selection */}
            {currentStep === 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Choose Your Starting Point
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Select the life domain that feels most important to focus on right now. 
                    We'll then discover related areas through intelligent suggestions.
                  </p>
                </CardHeader>
                <CardContent>
                  <GrowthDomainSelection
                    onDomainSelect={handleDomainSelect}
                    selectedDomain={selectedPrimaryDomain}
                  />
                </CardContent>
              </Card>
            )}

            {/* Step 1: Initial Assessment */}
            {currentStep === 1 && selectedPrimaryDomain && (
              <DomainAssessmentCard
                domain={selectedPrimaryDomain}
                onAssess={handleDomainAssessment}
                existingAssessment={assessments.find(a => a.domain === selectedPrimaryDomain)}
              />
            )}

            {/* Step 2: Relationship Discovery */}
            {currentStep === 2 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Route className="h-5 w-5" />
                    Discover Connections
                  </CardTitle>
                  <p className="text-muted-foreground">
                    Based on your focus on {DOMAIN_LABELS[selectedPrimaryDomain!]}, 
                    here are related areas that could amplify your growth.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Interdependency Visualization */}
                  {assessments.length > 0 && (
                    <div className="text-center">
                      <LifeWheelVisualization
                        assessments={assessments}
                        size={250}
                        interactive={false}
                        showGaps={false}
                      />
                    </div>
                  )}

                  {/* Suggested Domains */}
                  <div>
                    <h4 className="font-semibold mb-3">Recommended Related Areas:</h4>
                    <div className="grid md:grid-cols-3 gap-4">
                      {suggestedDomains.map(domain => {
                        const strength = interdependencies.find(
                          dep => dep.from_domain === selectedPrimaryDomain && dep.to_domain === domain
                        )?.strength || 0;
                        
                        return (
                          <Card key={domain} className="hover:shadow-md transition-shadow cursor-pointer">
                            <CardContent className="p-4">
                              <div className="flex items-center justify-between mb-2">
                                <h5 className="font-medium">{DOMAIN_LABELS[domain]}</h5>
                                <Badge variant="outline">
                                  {Math.round(strength * 100)}% connected
                                </Badge>
                              </div>
                              <p className="text-sm text-muted-foreground mb-3">
                                Closely related to your {DOMAIN_LABELS[selectedPrimaryDomain!].toLowerCase()} goals
                              </p>
                              <Button 
                                size="sm" 
                                className="w-full"
                                onClick={() => handleAddSuggestedDomain(domain)}
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Assess This Area
                              </Button>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(3)}
                    >
                      Skip Suggestions
                    </Button>
                    <Button
                      onClick={() => setCurrentStep(3)}
                      disabled={assessments.length < 2}
                    >
                      Continue with Current Assessment
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Step 3: Smart Expansion */}
            {currentStep === 3 && (
              <Card>
                <CardHeader>
                  <CardTitle>Assessment Summary</CardTitle>
                  <p className="text-muted-foreground">
                    Review your progressive assessment journey
                  </p>
                </CardHeader>
                <CardContent className="space-y-6">
                  
                  {/* Assessment Summary */}
                  <div className="grid md:grid-cols-2 gap-4">
                    {assessments.map(assessment => (
                      <Card key={assessment.domain} className="border-l-4 border-l-primary">
                        <CardContent className="p-4">
                          <h5 className="font-medium">{DOMAIN_LABELS[assessment.domain]}</h5>
                          <div className="mt-2 space-y-1 text-sm">
                            <div className="flex justify-between">
                              <span>Current:</span>
                              <span className="font-medium">{assessment.current_score}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Desired:</span>
                              <span className="font-medium">{assessment.desired_score}/10</span>
                            </div>
                            <div className="flex justify-between">
                              <span>Gap:</span>
                              <span className="font-medium text-amber-600">
                                {assessment.desired_score - assessment.current_score}
                              </span>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  <div className="flex justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentStep(2)}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2" />
                      Add More Domains
                    </Button>
                    <Button
                      onClick={handleCompleteJourney}
                      className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
                    >
                      Complete Progressive Journey
                      <Check className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

// Domain Assessment Component
interface DomainAssessmentCardProps {
  domain: LifeDomain;
  onAssess: (domain: LifeDomain, current: number, desired: number, importance: number, notes: string) => void;
  existingAssessment?: LifeWheelAssessment;
}

function DomainAssessmentCard({ domain, onAssess, existingAssessment }: DomainAssessmentCardProps) {
  const [currentScore, setCurrentScore] = useState(existingAssessment?.current_score || 5);
  const [desiredScore, setDesiredScore] = useState(existingAssessment?.desired_score || 8);
  const [importance, setImportance] = useState(existingAssessment?.importance_rating || 5);
  const [notes, setNotes] = useState(existingAssessment?.notes || '');

  const handleSubmit = () => {
    onAssess(domain, currentScore, desiredScore, importance, notes);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Assess: {DOMAIN_LABELS[domain]}
        </CardTitle>
        <p className="text-muted-foreground">
          Rate your current satisfaction and desired level for this life domain
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        
        {/* Score Sliders */}
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Current Satisfaction: {currentScore}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={currentScore}
              onChange={(e) => setCurrentScore(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Desired Level: {desiredScore}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={desiredScore}
              onChange={(e) => setDesiredScore(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
          
          <div>
            <label className="text-sm font-medium">Importance to You: {importance}/10</label>
            <input
              type="range"
              min="1"
              max="10"
              value={importance}
              onChange={(e) => setImportance(Number(e.target.value))}
              className="w-full mt-1"
            />
          </div>
        </div>

        {/* Gap Indicator */}
        <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span className="font-medium text-amber-800">Growth Opportunity</span>
          </div>
          <p className="text-sm text-amber-700">
            Gap of {desiredScore - currentScore} points • 
            Priority score: {Math.round((desiredScore - currentScore) * importance / 2)}
          </p>
        </div>

        {/* Notes */}
        <div>
          <label className="text-sm font-medium">Notes (optional)</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Any specific thoughts about this life area..."
            className="w-full mt-1 p-2 border rounded-md text-sm"
            rows={3}
          />
        </div>

        <Button 
          onClick={handleSubmit}
          className="w-full bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700"
        >
          <Check className="h-4 w-4 mr-2" />
          Complete Assessment for {DOMAIN_LABELS[domain]}
        </Button>
      </CardContent>
    </Card>
  );
}