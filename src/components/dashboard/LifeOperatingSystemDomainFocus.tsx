import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { GrowthDomainSelection } from '@/components/growth/onboarding/GrowthDomainSelection';
import { LifeWheelAssessment as AssessmentComponent } from '@/components/assessment/LifeWheelAssessment';
import { LifeDomain } from '@/types/growth-program';

interface LifeOperatingSystemDomainFocusProps {
  onBack: () => void;
  onComplete: (assessmentData: any[]) => void;
}

export function LifeOperatingSystemDomainFocus({ onBack, onComplete }: LifeOperatingSystemDomainFocusProps) {
  const [selectedDomains, setSelectedDomains] = useState<LifeDomain[]>([]);
  const [showAssessment, setShowAssessment] = useState(false);

  const handleDomainSelect = (domain: LifeDomain) => {
    setSelectedDomains(prev => {
      if (prev.includes(domain)) {
        return prev.filter(d => d !== domain);
      } else if (prev.length < 3) {
        return [...prev, domain];
      } else {
        // Replace the first selected domain if already at limit
        return [prev[1], prev[2], domain];
      }
    });
  };

  const handleProceedToAssessment = () => {
    if (selectedDomains.length > 0) {
      setShowAssessment(true);
    }
  };

  const handleAssessmentComplete = (assessmentData: any[]) => {
    // Filter assessment data to only include selected domains
    const filteredData = assessmentData.filter(item => 
      selectedDomains.includes(item.domain as LifeDomain)
    );
    onComplete(filteredData);
  };

  if (showAssessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="container mx-auto py-6 px-4 max-w-4xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowAssessment(false)}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Domain Selection
            </Button>
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-2">Quick Focus Assessment</h2>
              <p className="text-muted-foreground">
                Rate your selected domains: {selectedDomains.map(d => d.replace('_', ' ')).join(', ')}
              </p>
            </div>
          </div>

          <AssessmentComponent
            onComplete={handleAssessmentComplete}
            onCancel={() => setShowAssessment(false)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      <div className="container mx-auto py-6 px-4 max-w-6xl">
        
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={onBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment Options
          </Button>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-2">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Choose Your Focus Areas</h2>
            <p className="text-muted-foreground">
              Select 1-3 life domains you want to focus on (selected: {selectedDomains.length}/3)
            </p>
          </div>

          <GrowthDomainSelection
            onDomainSelect={handleDomainSelect}
            selectedDomain={selectedDomains[selectedDomains.length - 1] || null}
          />

          {/* Selected Domains Display */}
          {selectedDomains.length > 0 && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg">
              <h4 className="font-medium mb-2">Selected Focus Areas:</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {selectedDomains.map(domain => (
                  <span 
                    key={domain}
                    className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium capitalize"
                  >
                    {domain.replace('_', ' ')}
                  </span>
                ))}
              </div>
              
              <Button 
                onClick={handleProceedToAssessment}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
              >
                Proceed to Assessment
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}