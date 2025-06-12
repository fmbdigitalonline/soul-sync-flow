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

export default function Onboarding() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { speak } = useSoulOrb();
  const { user, loading: authLoading } = useAuth();
  
  // Detect development mode
  const isDevelopment = import.meta.env.DEV;
  
  // Get the onboarding 3D functionality
  const {
    is3DMode,
    currentStep,
    steps,
    showSpeechBubble,
    sceneRef,
    stage,
    speaking,
    interactionStage,
    isTransitioning,
    cardOpacity,
    goToNextStep,
    goToPrevStep,
    handleOrbClick,
    switchToInputStage
  } = useOnboarding3D();

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

  // Generate months array
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
      title: "Blueprint Generated Successfully",
      description: "Your soul blueprint has been created and is ready to explore!",
    });
    
    speak("Your soul blueprint has been generated! Now let's set up your coaching preferences.");
    
    setTimeout(() => {
      goToNextStep();
      navigationTriggeredRef.current = false;
    }, 1500);
  };

  // Handle goal selection completion - MODIFIED to redirect to home page
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
          title: "Welcome to SoulSync!",
          description: "Your Soul Blueprint is complete. Welcome to your personalized journey.",
        });
        
        speak("Perfect! Your Soul Blueprint is complete. Welcome to SoulSync!");
        
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
        title: "Error Saving Preferences",
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
        title: "Authentication Required",
        description: "Please sign in to generate your Soul Blueprint.",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [currentStep, user, authLoading, navigate, toast]);

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
              description: "Existing blueprint found. You can continue with onboarding or go to home page.",
            });
            return;
          }
          
          console.log("Existing blueprint found, redirecting to home page");
          toast({
            title: "Welcome Back!",
            description: "You already have a Soul Blueprint. Welcome to your personalized journey.",
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
  }, [user, authLoading, currentStep, navigate, toast, isDevelopment]);

  // Render the appropriate content based on the current step
  const renderStepContent = () => {
    switch (currentStep) {
      case 0: // Welcome
        return (
          <div className="space-y-4 max-w-md mx-auto text-center">
            <h2 className="text-2xl font-display font-bold">Welcome to SoulSync</h2>
            <p className="text-white/80">
              I'm your personal astrology guide. Let me help you discover your cosmic blueprint.
            </p>
            {isDevelopment && (
              <p className="text-xs text-yellow-400 bg-yellow-900/20 p-2 rounded">
                Dev Mode: Multiple onboarding attempts supported
              </p>
            )}
            <div className="pt-4">
              <Button 
                className="w-full bg-white/10 backdrop-blur-sm border border-white/20 hover:bg-white/20 transition-colors"
                onClick={goToNextStep}
              >
                Begin My Journey
              </Button>
            </div>
          </div>
        );
      case 1: // Full Name
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">What's your name?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateFormData({ name: e.target.value })}
                  placeholder="Enter your full name"
                  className="bg-white/5 border-white/10"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred Name (optional)</Label>
                <Input
                  id="preferredName"
                  type="text"
                  value={formData.preferredName}
                  onChange={(e) => updateFormData({ preferredName: e.target.value })}
                  placeholder="How would you like to be addressed?"
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.name}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 2: // Birth Date
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">When were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20 space-y-4">
              <div className="space-y-3">
                <Label>Birth Date</Label>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <Label htmlFor="day" className="text-sm text-white/70">Day</Label>
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
                    <Label htmlFor="month" className="text-sm text-white/70">Month</Label>
                    <Select value={birthDateComponents.month} onValueChange={(value) => updateBirthDateComponent('month', value)}>
                      <SelectTrigger className="bg-white/5 border-white/10">
                        <SelectValue placeholder="Month" />
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
                    <Label htmlFor="year" className="text-sm text-white/70">Year</Label>
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
                  Select your exact birth date for accurate calculations
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!isValidBirthDate()}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 3: // Birth Time
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">What time were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthTime">Birth Time (Local Time)</Label>
                <Input
                  id="birthTime"
                  type="time"
                  value={formData.birthTime}
                  onChange={(e) => updateFormData({ birthTime: e.target.value })}
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  Enter the local time where you were born - we'll automatically handle timezone conversion
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.birthTime}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 4: // Birth Location
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">Where were you born?</h2>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
              <div className="space-y-2">
                <Label htmlFor="birthLocation">Birth Location</Label>
                <Input
                  id="birthLocation"
                  type="text"
                  value={formData.birthLocation}
                  onChange={(e) => updateFormData({ birthLocation: e.target.value })}
                  placeholder="City, Country (e.g., Paramaribo, Suriname)"
                  className="bg-white/5 border-white/10"
                  required
                />
                <p className="text-sm text-white/60">
                  We'll automatically find the exact coordinates and historical timezone
                </p>
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              <Button 
                disabled={!formData.birthLocation}
                onClick={goToNextStep}
              >
                Continue
              </Button>
            </div>
          </div>
        );
      case 5: // Personality
        return (
          <div className="space-y-4 max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold text-center mb-2">Tell us about your personality</h2>
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
              <Button variant="ghost" onClick={goToPrevStep}>Back</Button>
              {/* Remove the continue button since PersonalityFusion handles completion */}
            </div>
          </div>
        );
      case 6: // Generating Blueprint
        if (!user && !authLoading) {
          return (
            <div className="space-y-6 text-center max-w-md mx-auto">
              <h2 className="text-xl font-display font-bold">Authentication Required</h2>
              <p className="text-white/80">Please sign in to generate your Soul Blueprint.</p>
              <Button onClick={() => navigate("/auth")} className="bg-soul-purple hover:bg-soul-purple/90">
                Sign In
              </Button>
            </div>
          );
        }

        return (
          <div className="space-y-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold">Generating Your Soul Blueprint</h2>
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
          <div className="space-y-6 text-center max-w-md mx-auto">
            <h2 className="text-xl font-display font-bold">Choose Your Path</h2>
            <p className="text-white/80">Let's set up your coaching preferences to personalize your experience.</p>
            <GoalSelectionStep onComplete={handleGoalSelectionComplete} />
            {isDevelopment && (
              <p className="text-xs text-blue-400 bg-blue-900/20 p-2 rounded">
                Dev Mode: Preferences will be stored in goal_stack
              </p>
            )}
          </div>
        );
      default:
        return <div>Unknown step</div>;
    }
  };

  // Determine whether to show speech bubble or form input
  const showInput = interactionStage === 'input' && !isTransitioning;
  const orbAnimation = speaking ? "speaking" : isTransitioning ? "transitioning" : "idle";

  return (
    <div className="min-h-screen bg-gradient-to-b from-soul-black to-soul-purple/20 text-white relative overflow-hidden">
      <Onboarding3DScene
        speaking={speaking}
        stage={stage}
        interactionStage={interactionStage}
        isCalculating={currentStep === 6}
      >
        <div className="absolute top-4 left-0 right-0 px-4">
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
            Step {currentStep + 1} of {steps.length}: {steps[currentStep]}
          </div>
        </div>

        <motion.div
          ref={sceneRef}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="w-full max-w-md mx-auto p-4"
          style={{ 
            pointerEvents: 'auto',
            perspective: '1000px'
          }}
        >
          <motion.div 
            initial={{ opacity: 0 }} 
            animate={{ opacity: cardOpacity }}
            transition={{ duration: 0.3 }}
            className={`${showInput ? 'block' : 'hidden'}`}
          >
            {renderStepContent()}
          </motion.div>
        </motion.div>
      </Onboarding3DScene>
      
      <div 
        className="fixed bottom-10 right-10 cursor-pointer"
        onClick={handleOrbClick}
        aria-label="Toggle orb interaction"
      >
        <div className="w-12 h-12 rounded-full bg-soul-purple/30 flex items-center justify-center">
          <div className="w-8 h-8 rounded-full bg-soul-purple animate-pulse"></div>
        </div>
      </div>
    </div>
  );
}
