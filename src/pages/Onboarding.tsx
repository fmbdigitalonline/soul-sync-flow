import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useRegistrationFlow } from '@/contexts/RegistrationFlowContext';
import { useSystemInitialization } from '@/hooks/useSystemInitialization';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, CheckCircle2, AlertCircle, ChevronRight } from 'lucide-react';
import { SoulOrbAvatar } from '@/components/ui/avatar';
import { useLanguage } from '@/contexts/LanguageContext';
import { blueprintService } from '@/services/blueprint-service';
import { GrowthProgramOnboardingModal } from '@/components/growth/onboarding/GrowthProgramOnboardingModal';

export default function Onboarding() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationComplete, setGenerationComplete] = useState(false);
  const [showGrowthModal, setShowGrowthModal] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const { flowState, completeOnboardingFlow, setCurrentStep, isNavigationSafe } = useRegistrationFlow();
  const { phase, isReady, error: systemError } = useSystemInitialization();
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLanguage();

  console.log('🔄 ONBOARDING PAGE: Current state', { 
    user: !!user,
    authLoading,
    flowState,
    phase,
    isReady,
    systemError,
    isGenerating,
    generationComplete
  });

  // Redirect if user is not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      console.log('🔄 ONBOARDING PAGE: No user, redirecting to auth');
      navigate('/auth', { replace: true });
    }
  }, [user, authLoading, navigate]);

  // Check for existing blueprint when system is ready
  useEffect(() => {
    const checkExistingBlueprint = async () => {
      if (!user || !isReady || authLoading) return;

      try {
        console.log('🔄 ONBOARDING PAGE: Checking for existing blueprint');
        setCurrentStep('blueprint-generation');
        
        const result = await blueprintService.getActiveBlueprintData();
        
        if (result.data && !result.error) {
          console.log('🔄 ONBOARDING PAGE: Found existing blueprint, completing onboarding');
          toast({
            title: 'Welcome back!',
            description: 'Your Soul Blueprint is already available.',
          });
          
          completeOnboardingFlow();
          navigate('/blueprint', { replace: true });
        } else {
          console.log('🔄 ONBOARDING PAGE: No existing blueprint, starting generation');
          startBlueprintGeneration();
        }
      } catch (error) {
        console.error('🔄 ONBOARDING PAGE: Error checking blueprint:', error);
        startBlueprintGeneration();
      }
    };

    // Add a small delay to prevent race conditions with system initialization
    const timeoutId = setTimeout(checkExistingBlueprint, 500);
    return () => clearTimeout(timeoutId);
  }, [user, isReady, authLoading]);

  const startBlueprintGeneration = async () => {
    if (!user || isGenerating) return;

    try {
      setIsGenerating(true);
      setCurrentStep('blueprint-generation');
      
      console.log('🔄 ONBOARDING PAGE: Starting blueprint generation');
      
      toast({
        title: 'Creating Your Soul Blueprint',
        description: 'Analyzing your cosmic blueprint... this may take a moment.',
      });

      // Create a basic blueprint data structure
      const basicBlueprintData = {
        user_meta: {
          preferred_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'Soul Seeker',
          email: user.email,
          user_id: user.id,
          full_name: user.user_metadata?.full_name || '',
          birth_date: '1990-01-01',
          birth_time_local: '12:00',
          birth_location: 'Unknown',
          timezone: 'UTC',
          created_at: new Date().toISOString(),
        },
        astrology: {
          sun_sign: 'Unknown',
          moon_sign: 'Unknown', 
          rising_sign: 'Unknown'
        },
        human_design: {
          type: 'Unknown',
          authority: 'Unknown'
        },
        numerology: {
          lifePathNumber: 1,
          expressionNumber: 1
        },
        mbti: {
          type: 'Unknown'
        },
        chinese_zodiac: {
          animal: 'Unknown',
          element: 'Unknown'
        },
        goal_stack: {},
        metadata: {
          calculation_success: true,
          calculation_date: new Date().toISOString(),
          engine: "onboarding_basic_blueprint",
          notes: "Initial blueprint created during onboarding - to be enhanced with user data"
        }
      };

      const result = await blueprintService.saveBlueprintData(basicBlueprintData);
      
      if (result.success) {
        console.log('🔄 ONBOARDING PAGE: Blueprint generation successful');
        
        setGenerationComplete(true);
        toast({
          title: 'Blueprint Created!',
          description: 'Your Soul Blueprint has been successfully generated.',
        });
        
        // Allow user to proceed to complete onboarding
        setTimeout(() => {
          setIsGenerating(false);
        }, 1500);
        
      } else {
        throw new Error(result.error || 'Failed to create blueprint');
      }
      
    } catch (error) {
      console.error('🔄 ONBOARDING PAGE: Blueprint generation failed:', error);
      
      toast({
        title: 'Generation Failed',
        description: 'There was an issue creating your blueprint. Please try again.',
        variant: 'destructive'
      });
      
      setIsGenerating(false);
      setCurrentStep('onboarding');
    }
  };

  const handleCompleteOnboarding = () => {
    console.log('🔄 ONBOARDING PAGE: Completing onboarding flow');
    completeOnboardingFlow();
    navigate('/blueprint', { replace: true });
  };

  const handleGrowthPrograms = () => {
    console.log('🔄 ONBOARDING PAGE: Opening growth programs');
    setShowGrowthModal(true);
  };

  const handleGrowthModalClose = () => {
    setShowGrowthModal(false);
  };

  const handleGrowthComplete = () => {
    setShowGrowthModal(false);
    toast({
      title: 'Growth Program Created!',
      description: 'Your personalized growth journey is ready to begin.',
    });
  };

  // Show loading while auth is being checked
  if (authLoading || phase !== 'ready') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md bg-card shadow-lg border">
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-soul-purple" />
            <p className="text-sm text-muted-foreground text-center">
              {authLoading ? 'Verifying your account...' : `System ${phase}...`}
            </p>
            {systemError && (
              <div className="text-xs text-red-500 text-center">
                {systemError}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show redirect message if navigation is not safe (shouldn't happen in normal flow)
  if (!isNavigationSafe()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md bg-card shadow-lg border">
          <CardContent className="flex flex-col items-center justify-center p-6 space-y-4">
            <AlertCircle className="h-8 w-8 text-yellow-500" />
            <p className="text-sm text-muted-foreground text-center">
              Another onboarding process is already in progress. Please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md bg-card shadow-lg border">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <SoulOrbAvatar size="md" />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">
              {generationComplete ? 'Welcome to SoulSync!' : 'Creating Your Blueprint'}
            </CardTitle>
            <CardDescription>
              {generationComplete 
                ? 'Your personalized Soul Blueprint is ready to explore.'
                : 'Setting up your personalized cosmic profile...'
              }
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Generation Progress */}
          {isGenerating && (
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-12 w-12 animate-spin text-soul-purple" />
              <div className="text-center">
                <p className="text-sm font-medium">Generating your Soul Blueprint</p>
                <p className="text-xs text-muted-foreground">
                  Analyzing cosmic patterns and personality insights...
                </p>
              </div>
            </div>
          )}

          {/* Generation Complete */}
          {generationComplete && !isGenerating && (
            <div className="flex flex-col items-center space-y-4">
              <CheckCircle2 className="h-12 w-12 text-green-500" />
              <div className="text-center">
                <p className="text-sm font-medium text-green-700">Blueprint Created Successfully!</p>
                <p className="text-xs text-muted-foreground">
                  Ready to explore your personalized insights.
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {generationComplete && !isGenerating && (
            <div className="space-y-3">
              <Button 
                className="w-full bg-soul-purple hover:bg-soul-purple/90" 
                onClick={handleCompleteOnboarding}
              >
                Explore My Blueprint
                <ChevronRight className="ml-2 h-4 w-4" />
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={handleGrowthPrograms}
              >
                Create Growth Programs
              </Button>
            </div>
          )}

          {/* Manual retry if generation failed */}
          {!isGenerating && !generationComplete && (
            <div className="text-center">
              <Button 
                variant="outline" 
                onClick={startBlueprintGeneration}
                disabled={isGenerating}
              >
                Try Creating Blueprint Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Growth Programs Modal */}
      <GrowthProgramOnboardingModal
        isOpen={showGrowthModal}
        onClose={handleGrowthModalClose}
        onComplete={handleGrowthComplete}
      />
    </div>
  );
}