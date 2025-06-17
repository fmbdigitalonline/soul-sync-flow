import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "@/lib/framer-motion";
import { Button } from "@/components/ui/button";
import { Onboarding3DScene } from "@/components/ui/onboarding-3d-scene";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { zodiac } from "@/components/ui/zodiac";
import { MBTISelector } from "@/components/blueprint/MBTISelector";
import { GoalSelectionStep } from "@/components/blueprint/GoalSelectionStep";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BlueprintData, blueprintService } from "@/services/blueprint-service"; 
import { useToast } from "@/hooks/use-toast";
import { useOnboarding3D } from "@/hooks/use-onboarding-3d";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useAuth } from "@/contexts/AuthContext";
import { PersonalityFusion } from "@/components/blueprint/PersonalityFusion";
import { useLanguage } from "@/contexts/LanguageContext";

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useSoulOrb();
  const { user, loading: authLoading } = useAuth();
  const { t } = useLanguage();
  
  // Detect development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Use simple navigation instead of 3D navigation for better mobile experience
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Form data state - update personality to store full profile
  const [formData, setFormData] = useState({
    name: "",
    preferredName: "",
    birthDate: "",
    birthTime: "",
    birthLocation: "",
    personality: null as any // Changed to store full personality profile
  });

  // Birth date components state
  const [birthDateComponents, setBirthDateComponents] = useState({
    day: "",
    month: "",
    year: ""
  });
  
  // State variables for blueprint generation
  const [blueprintGenerated, setBlueprintGenerated] = useState(false);
  const [blueprintData, setBlueprintData] = useState<BlueprintData | null>(null);
  
  // Refs to prevent navigation loops
  const navigationTriggeredRef = useRef(false);
  const goalSelectionTriggeredRef = useRef(false);

  // Steps mapping
  const steps = [
    t('onboarding.welcome'),
    t('onboarding.whatsYourName'),
    t('onboarding.whenWereBorn'),
    t('onboarding.whatTimeWereBorn'),
    t('onboarding.whereWereBorn'),
    t('onboarding.tellPersonality'),
    t('onboarding.generatingBlueprint'),
    t('onboarding.choosePath'),
  ];

  // Generate months array with translations
  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  // Generate years array (from 1920 to current year)
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: currentYear - 1919 }, (_, i) => currentYear - i);

  // Navigation functions
  const goToNextStep = () => {
    if (isTransitioning || currentStep >= steps.length - 1) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev + 1);
      setIsTransitioning(false);
    }, 300);
  };

  const goToPrevStep = () => {
    if (isTransitioning || currentStep <= 0) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentStep(prev => prev - 1);
      setIsTransitioning(false);
    }, 300);
  };

  // Update birth date when components change
  useEffect(() => {
    const { day, month, year } = birthDateComponents;
    if (day && month && year) {
      const formattedDate = `${year}-${month}-${day.padStart(2, '0')}`;
      setFormData(prev => ({ ...prev, birthDate: formattedDate }));
    }
  }, [birthDateComponents]);
  
  // Update form data
  const updateFormData = (newData: Partial<typeof formData>) => {
    setFormData(prevData => ({ ...prevData, ...newData }));
  };

  // Update birth date components
  const updateBirthDateComponent = (component: 'day' | 'month' | 'year', value: string) => {
    setBirthDateComponents(prev => ({ ...prev, [component]: value }));
  };

  // Validate birth date
  const isValidBirthDate = () => {
    const { day, month, year } = birthDateComponents;
    if (!day || !month || !year) return false;
    
    const dayNum = parseInt(day);
    const monthNum = parseInt(month);
    const yearNum = parseInt(year);
    
    if (dayNum < 1 || dayNum > 31) return false;
    if (monthNum < 1 || monthNum > 12) return false;
    if (yearNum < 1920 || yearNum > currentYear) return false;
    
    // Check for valid day in month
    const daysInMonth = new Date(yearNum, monthNum, 0).getDate();
    return dayNum <= daysInMonth;
  };
  
  // Handle blueprint generation completion
  const handleBlueprintComplete = (newBlueprint?: BlueprintData) => {
    // Prevent multiple executions
    if (navigationTriggeredRef.current || blueprintGenerated) {
      console.log("Blueprint generation already started, ignoring duplicate completion");
      return;
    }
    
    console.log("Blueprint generation completed with data:", newBlueprint);
    
    navigationTriggeredRef.current = true;
    setBlueprintGenerated(true);
    
    if (newBlueprint) {
      setBlueprintData(newBlueprint);
      console.log("Blueprint data stored in state for goal selection");
    }
    
    toast({
      title: t('blueprint.generated'),
      description: t('blueprint.generatedDesc'),
    });
    
    speak(t('blueprint.generatedDesc'));
    
    setTimeout(() => {
      goToNextStep();
      navigationTriggeredRef.current = false;
    }, 1500);
  };

  // Handle goal selection completion with back navigation support
  const handleGoalSelectionComplete = async (preferences: { 
    primary_goal: string; 
    support_style: number; 
    time_horizon: string 
  }) => {
    // Prevent multiple executions
    if (goalSelectionTriggeredRef.current) {
      console.log("Goal selection already in progress, ignoring duplicate");
      return;
    }
    
    goalSelectionTriggeredRef.current = true;
    console.log("Goal selection completed with preferences:", preferences);
    
    if (isDevelopment) {
      console.log("Development mode detected - handling onboarding completion gracefully");
    }
    
    try {
      console.log("Updating blueprint with coaching preferences...");
      
      const { success, error } = await blueprintService.updateBlueprintRuntimePreferences(preferences);
      
      if (success) {
        console.log("Blueprint updated with coaching preferences successfully");
        toast({
          title: t('goals.welcomeComplete'),
          description: t('goals.welcomeCompleteDesc'),
        });
        
        speak(t('goals.welcomeCompleteDesc'));
        
        // Redirect to home page after onboarding is fully complete
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 2000);
      } else {
        console.error("Error updating blueprint preferences:", error);
        throw new Error(error || "Failed to save your preferences");
      }
    } catch (error) {
      console.error("Error in goal selection completion:", error);
      const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred";
      
      toast({
        title: t('goals.errorSaving'),
        description: errorMessage,
        variant: "destructive",
      });
      
      goalSelectionTriggeredRef.current = false;
      
      if (isDevelopment) {
        console.error("Development debugging - Error details:", {
          error,
          preferences,
          user: user?.id,
          currentStep
        });
      }
    }
  };

  // On first render
  useEffect(() => {
    document.title = "SoulSync - Onboarding";
  }, []);
  
  useEffect(() => {
    if (blueprintGenerated && !navigationTriggeredRef.current) {
      navigationTriggeredRef.current = true;
      console.log("Blueprint generated, preparing to navigate");
      
      setTimeout(() => {
        navigate("/blueprint");
      }, 1500);
    }
  }, [blueprintGenerated, navigate]);

  useEffect(() => {
    if (currentStep === 6 && !authLoading && !user) {
      console.log("User not authenticated, redirecting to auth page");
      toast({
        title: t('onboarding.authRequired'),
        description: t('onboarding.authRequiredDesc'),
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [currentStep, user, authLoading, navigate, toast, t]);

  useEffect(() => {
    const checkExistingBlueprint = async () => {
      try {
        if (!user || authLoading) return;
        
        const { data: existingBlueprint, error } = await blueprintService.getActiveBlueprintData();
        
        if (error) {
          console.log("No existing blueprint found or error fetching:", error);
          return;
        }
        
        if (existingBlueprint && currentStep === 0) {
          if (isDevelopment) {
            console.log("Development mode: Existing blueprint found but allowing onboarding continuation");
            toast({
              title: "Development Mode",
              description: t('onboarding.devMode'),
            });
            return;
          }
          
          console.log("Existing blueprint found, redirecting to home page");
          toast({
            title: t('index.welcomeBackReady'),
            description: t('goals.welcomeCompleteDesc'),
          });
          
          setTimeout(() => {
            navigate("/", { replace: true });
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking for existing blueprint:", error);
        if (isDevelopment) {
          console.error("Development debugging - Blueprint check error:", error);
        }
      }
    };
    
    if (user && !authLoading) {
      const timer = setTimeout(checkExistingBlueprint, 1500);
      return () => clearTimeout(timer);
    }
  }, [user, authLoading, currentStep, navigate, toast, isDevelopment, t]);

  // Render the appropriate content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-4 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-display font-bold">{t('onboarding.welcome')}</h2>
            <p className="text-white/80">
              {t('onboarding.welcomeDesc')}
            </p>
            {isDevelopment && (
              <p className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                {t('onboarding.devMode')}
              </p>
            )}
            <div className="pt-4">
              <Button 
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
                onClick={goToNextStep}
              >
                {t('onboarding.beginJourney')}
              </Button>
            </div>
          </div>
        );
      case 1: // Full Name
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">{t('onboarding.whatsYourName')}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">{t('onboarding.fullName')}</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder={t('onboarding.fullNamePlaceholder')}
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredName">{t('onboarding.preferredName')}</Label>
                <Input
                  id="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => updateFormData({ preferredName: e.target.value })}
                  placeholder={t('onboarding.preferredNamePlaceholder')}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>{t('back')}</Button>
              <Button 
                disabled={!formData.name}
                onClick={goToNextStep}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        );
      case 2: // Birth Date
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">{t('onboarding.whenWereBorn')}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
              <div className="space-y-3">
                <Label>{t('onboarding.birthDate')}</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="day" className="text-sm text-white/70">{t('onboarding.day')}</Label>
                    <Input
                      id="day"
                      type="number"
                      min="1"
                      max="31"
                      value={birthDateComponents.day}
                      onChange={(e) => updateBirthDateComponent('day', e.target.value)}
                      placeholder="DD"
                      className="bg-white/5 border-white/10 text-center"
                    />
                  </div>
                  <div>
                    <Label htmlFor="month" className="text-sm text-white/70">{t('onboarding.month')}</Label>
                    <Select value={birthDateComponents.month} onValueChange={(value) => updateBirthDateComponent('month', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder={t('onboarding.month')} />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map((month) => (
                          <SelectItem key={month.value} value={month.value}>
                            {month.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year" className="text-sm text-white/70">{t('onboarding.year')}</Label>
                    <Select value={birthDateComponents.year} onValueChange={(value) => updateBirthDateComponent('year', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="YYYY" />
                      </SelectTrigger>
                      <SelectContent className="max-h-40 overflow-y-auto">
                        {years.map((year) => (
                          <SelectItem key={year} value={year.toString()}>
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <p className="text-sm text-white/60">
                  {t('onboarding.selectExactDate')}
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>{t('back')}</Button>
              <Button 
                disabled={!isValidBirthDate()}
                onClick={goToNextStep}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        );
      case 3: // Birth Time
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">{t('onboarding.whatTimeWereBorn')}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthTime">{t('onboarding.birthTime')}</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateFormData({ birthTime: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  {t('onboarding.birthTimeDesc')}
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>{t('back')}</Button>
              <Button 
                disabled={!formData.birthTime}
                onClick={goToNextStep}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        );
      case 4: // Birth Location
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">{t('onboarding.whereWereBorn')}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthLocation">{t('onboarding.birthLocation')}</Label>
                <Input
                  id="birthLocation"
                  type="text"
                  value={formData.birthLocation}
                  onChange={(e) => updateFormData({ birthLocation: e.target.value })}
                  placeholder={t('onboarding.birthLocationPlaceholder')}
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  {t('onboarding.birthLocationDesc')}
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>{t('back')}</Button>
              <Button 
                disabled={!formData.birthLocation}
                onClick={goToNextStep}
              >
                {t('continue')}
              </Button>
            </div>
          </div>
        );
      case 5: // Personality
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">{t('onboarding.tellPersonality')}</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <PersonalityFusion 
                value={formData.personality}
                onChange={(value) => updateFormData({ personality: value })}
                onComplete={() => {
                  console.log("PersonalityFusion completed, moving to next step");
                  goToNextStep();
                }}
                seedData={{
                  sunSign: "Aquarius", // This would come from birth data calculation
                  moonSign: "Leo", // These are placeholders - would be calculated from birth data
                  risingSign: "Gemini",
                  humanDesignType: "Projector", // Would come from Human Design calculation
                  lifePath: 7 // Would come from numerology calculation
                }}
              />
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>{t('back')}</Button>
              {/* Remove the continue button since PersonalityFusion handles completion */}
            </div>
          </div>
        );
      case 6: // Generating Blueprint
        if (!user && !authLoading) {
          return (
            <div className="space-y-6 text-center max-w-md mx-auto">
              <h2 className="text-xl font-display font-bold">{t('onboarding.authRequired')}</h2>
              <p className="text-white/80">{t('onboarding.authRequiredDesc')}</p>
              <Button onClick={() => navigate("/auth")} className="bg-soul-purple hover:bg-soul-purple/90">
                {t('auth.signIn')}
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold">{t('onboarding.generatingBlueprint')}</h2>
            <BlueprintGenerator 
              key={`blueprint-generator-${blueprintGenerated ? 'complete' : 'active'}`}
              userProfile={{
                full_name: formData.name || "Anonymous User",
                preferred_name: formData.preferredName || formData.name.split(" ")[0],
                birth_date: formData.birthDate,
                birth_time_local: formData.birthTime,
                birth_location: formData.birthLocation,
                timezone: "AUTO_RESOLVED",
                personality: formData.personality
              }}
              onComplete={handleBlueprintComplete}
              className="mt-4"
            />
          </div>
        );
      case 7: // Goal Selection
        return (
          <div className="fixed inset-0 bg-soul-black">
            <GoalSelectionStep 
              onComplete={handleGoalSelectionComplete}
              onBack={goToPrevStep}
            />
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/20 text-white relative overflow-hidden">
      <div className="absolute top-4 left-0 right-0 px-4 z-10">
        <div className="w-full max-w-md mx-auto flex justify-between mb-1">
          {steps.map((_, index) => (
            <div 
              key={index} 
              className={`w-3 h-3 rounded-full ${
                index < currentStep 
                  ? "bg-white" 
                  : index === currentStep 
                  ? "bg-white/80 animate-pulse" 
                  : "bg-white/30"
              }`}
            ></div>
          ))}
        </div>
        <div className="text-center text-sm text-white/60">
          {t('onboarding.step')} {currentStep + 1} {t('onboarding.of')} {steps.length}: {steps[currentStep]}
        </div>
      </div>

      <div className="flex items-center justify-center min-h-screen px-4 pt-16">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0.5 : 1 }}
          className="w-full max-w-md mx-auto"
        >
          {renderStepContent()}
        </motion.div>
      </div>
    </div>
  );
}
