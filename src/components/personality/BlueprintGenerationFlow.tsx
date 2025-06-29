import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Loader2, Sparkles, Brain } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { PersonalityTestStepper } from './PersonalityTestStepper';
import { personalityVectorService } from '@/services/personality-vector-service';
import { toast } from 'sonner';

interface BlueprintGenerationFlowProps {
  onComplete: () => void;
}

export const BlueprintGenerationFlow: React.FC<BlueprintGenerationFlowProps> = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [vfpGraphGenerated, setVfpGraphGenerated] = useState(false);
  const [blueprintData, setBlueprintData] = useState<any>(null);
  const { user } = useAuth();

  const steps = [
    { title: 'Personality Assessment', description: 'Complete personality tests' },
    { title: 'Blueprint Generation', description: 'Creating your unique blueprint' },
    { title: 'VFP-Graph Intelligence', description: 'Generating 128D personality vector' },
    { title: 'Complete', description: 'Your blueprint is ready!' }
  ];

  const handleTestComplete = async (testResults: any) => {
    if (!user) return;

    try {
      setIsGenerating(true);
      setCurrentStep(1);

      console.log('🎭 Starting blueprint generation with VFP-Graph integration...');

      // Generate blueprint data
      const blueprint = {
        cognitiveTemperamental: {
          mbtiType: testResults.mbti || 'ENFP',
          // ... other cognitive data
        },
        energyDecisionStrategy: {
          gates: testResults.humanDesign?.gates || [1, 15, 31, 43],
          // ... other energy data
        },
        publicArchetype: {
          sunSign: testResults.astrology?.sunSign || 'Leo',
          moonSign: testResults.astrology?.moonSign || 'Gemini',
          ascendant: testResults.astrology?.ascendant || 'Libra',
          // ... other archetype data
        },
        coreValuesNarrative: {
          lifePath: testResults.numerology?.lifePath || 7,
          // ... other values data
        }
      };

      // Save blueprint to database
      const { error: blueprintError } = await supabase
        .from('user_blueprints')
        .insert({
          user_id: user.id,
          blueprint: blueprint,
          is_active: true
        });

      if (blueprintError) throw blueprintError;

      setBlueprintData(blueprint);
      setCurrentStep(2);

      console.log('✅ Blueprint saved, now generating VFP-Graph vector...');

      // Generate VFP-Graph 128D personality vector
      try {
        const vector = await personalityVectorService.getVector(user.id);
        
        if (vector && vector.length === 128) {
          console.log('✅ VFP-Graph 128D vector generated successfully');
          setVfpGraphGenerated(true);
          
          // Get personality summary
          const summary = await personalityVectorService.getPersonaSummary(user.id);
          console.log('🧠 VFP-Graph personality summary:', summary);
          
          toast.success('VFP-Graph intelligence activated! 🧠✨');
        } else {
          console.warn('⚠️ VFP-Graph vector generation incomplete');
          toast.warning('Blueprint created, but VFP-Graph is still initializing');
        }
      } catch (vfpError) {
        console.error('❌ VFP-Graph generation error:', vfpError);
        toast.warning('Blueprint created successfully. VFP-Graph will be available shortly.');
      }

      setCurrentStep(3);
      setGenerationComplete(true);

      console.log('🎉 Blueprint generation flow complete with VFP-Graph integration');

    } catch (error) {
      console.error('❌ Blueprint generation error:', error);
      toast.error('Error generating blueprint. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleComplete = () => {
    onComplete();
  };

  if (generationComplete) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
            <CheckCircle className="h-8 w-8 text-green-600" />
          </div>
          <CardTitle className="text-2xl text-green-700">Blueprint Complete!</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="text-center space-y-2">
            <p className="text-lg">Your personalized blueprint has been created</p>
            
            {/* VFP-Graph Status Display */}
            <div className="bg-gradient-to-r from-soul-purple/10 to-soul-teal/10 border border-soul-purple/20 rounded-lg p-4 mt-4">
              <div className="flex items-center justify-center gap-2 mb-2">
                {vfpGraphGenerated ? (
                  <>
                    <Brain className="h-5 w-5 text-soul-purple" />
                    <span className="font-medium text-soul-purple">VFP-Graph Intelligence Activated</span>
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  </>
                ) : (
                  <>
                    <Loader2 className="h-5 w-5 text-soul-purple animate-spin" />
                    <span className="font-medium text-soul-purple">VFP-Graph Initializing</span>
                  </>
                )}
              </div>
              <p className="text-sm text-center text-muted-foreground">
                {vfpGraphGenerated 
                  ? '128-dimensional personality vector ready for enhanced AI coaching'
                  : 'Your 128D personality intelligence will be ready shortly'
                }
              </p>
            </div>
            
            <p className="text-muted-foreground mt-4">
              You now have access to personalized AI coaching that understands your unique personality
            </p>
          </div>

          <Button onClick={handleComplete} className="w-full" size="lg">
            Continue to Dashboard
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (currentStep === 0) {
    return (
      <PersonalityTestStepper
        onComplete={handleTestComplete}
        onSkip={() => {
          // Generate basic blueprint for skip case
          handleTestComplete({
            mbti: 'ENFP',
            humanDesign: { gates: [1, 15, 31, 43] },
            astrology: { sunSign: 'Leo', moonSign: 'Gemini', ascendant: 'Libra' },
            numerology: { lifePath: 7 }
          });
        }}
      />
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 p-3 bg-soul-purple/10 rounded-full w-fit">
          {currentStep === 1 ? (
            <Sparkles className="h-8 w-8 text-soul-purple animate-pulse" />
          ) : currentStep === 2 ? (
            <Brain className="h-8 w-8 text-soul-purple animate-pulse" />
          ) : (
            <Loader2 className="h-8 w-8 text-soul-purple animate-spin" />
          )}
        </div>
        <CardTitle className="text-2xl">
          {currentStep === 1 && 'Generating Your Blueprint'}
          {currentStep === 2 && 'Creating VFP-Graph Intelligence'}
          {currentStep === 3 && 'Finalizing Setup'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progress Steps */}
        <div className="space-y-4">
          {steps.map((step, index) => (
            <div key={index} className="flex items-center space-x-3">
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${
                index < currentStep 
                  ? 'bg-green-500 text-white' 
                  : index === currentStep 
                    ? 'bg-soul-purple text-white' 
                    : 'bg-gray-200 text-gray-500'
              }`}>
                {index < currentStep ? (
                  <CheckCircle className="h-4 w-4" />
                ) : index === currentStep ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <span className="text-xs">{index + 1}</span>
                )}
              </div>
              <div className="flex-1">
                <p className={`font-medium ${
                  index <= currentStep ? 'text-gray-900' : 'text-gray-500'
                }`}>
                  {step.title}
                </p>
                <p className="text-sm text-gray-500">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <Progress value={(currentStep / (steps.length - 1)) * 100} className="w-full" />
          <p className="text-sm text-center text-muted-foreground">
            {currentStep === 1 && 'Creating your unique personality blueprint...'}
            {currentStep === 2 && 'Generating 128-dimensional VFP-Graph vector for enhanced AI coaching...'}
            {currentStep === 3 && 'Setting up your personalized experience...'}
          </p>
        </div>

        {/* Special VFP-Graph Info */}
        {currentStep === 2 && (
          <div className="bg-gradient-to-r from-soul-purple/5 to-soul-teal/5 border border-soul-purple/20 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Brain className="h-5 w-5 text-soul-purple" />
              <span className="font-medium text-soul-purple">VFP-Graph Technology</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Creating your 128-dimensional personality vector by fusing MBTI, Human Design, and Astrology data. 
              This enables the most personalized AI coaching experience possible.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
