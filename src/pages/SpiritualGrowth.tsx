import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, BookOpen, Calendar, MessageCircle, Settings, TrendingUp, ArrowLeft, User, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { SpiritualGuideInterface } from "@/components/growth/SpiritualGuideInterface";
import { GrowthProgramInterface } from "@/components/growth/GrowthProgramInterface";
import { TelemetryTracker } from "@/components/growth/TelemetryTracker";
import { MoodTracker } from "@/components/coach/MoodTracker";
import { ReflectionPrompts } from "@/components/coach/ReflectionPrompts";
import { InsightJournal } from "@/components/coach/InsightJournal";
import { WeeklyInsights } from "@/components/coach/WeeklyInsights";
import { LifeOperatingSystemDashboard } from "@/components/dashboard/LifeOperatingSystemDashboard";
import { LifeOperatingSystemChoices } from "@/components/dashboard/LifeOperatingSystemChoices";
import { LifeOperatingSystemDomainFocus } from "@/components/dashboard/LifeOperatingSystemDomainFocus";
import { ConversationalAssessment } from "@/components/dashboard/ConversationalAssessment";
import { ProgressiveJourneyAssessment } from "@/components/dashboard/ProgressiveJourneyAssessment";
import { useLanguage } from "@/contexts/LanguageContext";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { useAuth } from "@/contexts/AuthContext";
import { LifeDomain } from "@/types/growth-program";

type ActiveView = 'welcome' | 'immediate_chat' | 'growth_program' | 'tools' | 'mood' | 'reflection' | 'insight' | 'weekly' | 'life_os_choices' | 'life_os_quick_focus' | 'life_os_full' | 'life_os_guided' | 'life_os_progressive' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("coach", "spiritual-growth");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { user } = useAuth();
  
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      const authenticated = !!data.session;
      setIsAuthenticated(authenticated);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const authenticated = !!session;
      setIsAuthenticated(authenticated);
    });
    
    return () => subscription.unsubscribe();
  }, []);

  // Initialize for immediate spiritual growth chat
  const handleStartSpiritualGrowth = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🚀 Starting Heart-Centered Coaching...');
      setActiveView('immediate_chat');
      
      // Reset conversation to ensure clean start
      resetConversation();
      
      console.log('✨ Ready for Heart-Centered Coaching chat');
      
    } catch (error) {
      console.error('Error initializing spiritual growth:', error);
      toast({
        title: "Connection Issue",
        description: "Having trouble connecting. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Extract user info for personalization
  const getUserDisplayName = () => {
    if (!blueprintData?.user_meta) return 'Friend';
    return blueprintData.user_meta.preferred_name || 
           blueprintData.user_meta.full_name?.split(' ')[0] || 
           'Friend';
  };

  const getCoreTraits = () => {
    if (!blueprintData) return ['Seeker', 'Growth-Oriented'];
    
    const traits: string[] = [];
    
    if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.energy_strategy_human_design?.type && blueprintData.energy_strategy_human_design.type !== 'Unknown') {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }
    
    if (blueprintData.archetype_western?.sun_sign && blueprintData.archetype_western.sun_sign !== 'Unknown') {
      traits.push(blueprintData.archetype_western.sun_sign);
    }
    
    return traits.length > 0 ? traits : ['Unique Soul', 'Growth-Focused'];
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <CosmicCard className="w-full max-w-md text-center space-y-6">
            <div className="w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center">
              <Sparkles className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("spiritualGrowth.title")}</h1>
              <p className="text-muted-foreground">{t("spiritualGrowth.description")}</p>
            </div>
            <Button 
              className="w-full"
              onClick={() => window.location.href = '/auth'}
            >
              {t("spiritualGrowth.getStarted")}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Show immediate chat interface with unified component
  if (activeView === 'immediate_chat') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto py-6 px-4 max-w-4xl">
            
            {/* Header with back button */}
            <div className="flex items-center justify-between mb-6">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('welcome')}
                className="flex items-center gap-2 text-muted-foreground hover:text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </Button>
              <div className="text-center">
                <h1 className="text-xl font-heading font-bold text-foreground">Heart-Centered Coach</h1>
                <p className="text-sm text-muted-foreground">Connected & Ready</p>
              </div>
              <div className="w-20" />
            </div>

            {/* Direct Chat Interface - Matching Coach Layout */}
            <div className="h-[calc(100vh-200px)]">
              <SpiritualGuideInterface
                userDisplayName={getUserDisplayName()}
                coreTraits={getCoreTraits()}
              />
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show Growth Program Interface with Agent-Driven System
  if (activeView === 'growth_program') {
    return (
      <TelemetryTracker>
        <MainLayout>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 px-4 max-w-6xl">
              <div className="mb-6">
                <Button 
                  variant="outline" 
                  onClick={() => setActiveView('welcome')}
                  className="mb-4"
                  data-track="navigation-back-to-welcome"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Growth Coach
                </Button>
              </div>
              
              <GrowthProgramInterface />
            </div>
          </div>
        </MainLayout>
      </TelemetryTracker>
    );
  }

  if (activeView === 'tools') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('welcome')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center gradient-text mb-6">Growth Tools</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('mood')}
                className="h-20 flex-col gap-2"
              >
                <Heart className="h-6 w-6" />
                Mood Tracker
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('reflection')}
                className="h-20 flex-col gap-2"
              >
                <Sparkles className="h-6 w-6" />
                Reflection
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('insight')}
                className="h-20 flex-col gap-2"
              >
                <BookOpen className="h-6 w-6" />
                Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('weekly')}
                className="h-20 flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                Weekly Review
              </Button>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'mood') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <MoodTracker onMoodSave={addMoodEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'reflection') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <ReflectionPrompts onReflectionSave={addReflectionEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'insight') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <InsightJournal onInsightSave={addInsightEntry} />
        </div>
      </MainLayout>
    );
  }
  
  if (activeView === 'weekly') {
    return (
      <MainLayout>
        <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
          <div className="mb-4">
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className="mb-2"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
          <WeeklyInsights />
        </div>
      </MainLayout>
    );
  }

  // Life Operating System Choice Interface
  if (activeView === 'life_os_choices') {
    const handleChoiceSelect = (choice: 'quick_focus' | 'full_assessment' | 'guided_discovery' | 'progressive_journey') => {
      switch (choice) {
        case 'quick_focus':
          setActiveView('life_os_quick_focus');
          break;
        case 'full_assessment':
          setActiveView('life_os_full');
          break;
        case 'guided_discovery':
          setActiveView('life_os_guided');
          break;
        case 'progressive_journey':
          setActiveView('life_os_progressive');
          break;
      }
    };

    return (
      <MainLayout>
        <LifeOperatingSystemChoices
          onChoiceSelect={handleChoiceSelect}
          onBack={() => setActiveView('welcome')}
        />
      </MainLayout>
    );
  }

  // Quick Focus Assessment
  if (activeView === 'life_os_quick_focus') {
    const handleAssessmentComplete = (assessmentData: any[]) => {
      console.log('🎯 Quick focus assessment completed:', assessmentData);
      toast({
        title: "Assessment Complete! 🎯",
        description: "Your focused assessment has been processed.",
      });
      setActiveView('life_os_full'); // Show dashboard with results
    };

    return (
      <MainLayout>
        <LifeOperatingSystemDomainFocus
          onBack={() => setActiveView('life_os_choices')}
          onComplete={handleAssessmentComplete}
        />
      </MainLayout>
    );
  }

  // Full Assessment Dashboard
  if (activeView === 'life_os_full') {
    const handleCreateProgram = async (primaryDomain: LifeDomain, supportingDomains: LifeDomain[]) => {
      if (!user || !blueprintData) {
        toast({
          title: "Blueprint Required",
          description: "Please complete your blueprint first to create a personalized growth program.",
          variant: "destructive"
        });
        return;
      }

      console.log('🚀 Creating REAL multi-domain program with HACS:', { primaryDomain, supportingDomains });
      
      try {
        // Import the agent growth integration
        const { agentGrowthIntegration } = await import('@/services/agent-growth-integration');
        
        // Create multi-domain configuration in blueprint
        const enhancedBlueprint = {
          ...blueprintData,
          multiDomainConfig: {
            primaryDomain,
            supportingDomains,
            integrationLevel: 'high',
            createdAt: new Date().toISOString()
          }
        };
        
        // Create program with real HACS system
        const program = await agentGrowthIntegration.createProgram(
          user.id, 
          primaryDomain, 
          enhancedBlueprint
        );
        
        // Update program to active status
        await agentGrowthIntegration.updateProgramProgress(program.id, { 
          status: 'active' 
        });
        
        toast({
          title: "Multi-Domain Program Created! 🎯",
          description: `Your AI-powered growth program integrating ${primaryDomain} with ${supportingDomains.length} supporting domains is ready.`,
        });
        
        // Switch to growth program view to see the results
        setActiveView('growth_program');
        
      } catch (error) {
        console.error('❌ Error creating multi-domain program:', error);
        toast({
          title: "Error Creating Program",
          description: "There was an issue creating your multi-domain growth program. Please try again.",
          variant: "destructive"
        });
      }
    };

    return (
        <MainLayout>
          <div className="min-h-screen bg-background">
            <div className="container mx-auto py-6 px-4 max-w-7xl">
            <div className="mb-6">
              <Button 
                variant="outline" 
                onClick={() => setActiveView('life_os_choices')}
                className="mb-4"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Assessment Options
              </Button>
            </div>
            
            <LifeOperatingSystemDashboard onCreateProgram={handleCreateProgram} />
          </div>
        </div>
      </MainLayout>
    );
  }

  // Guided Discovery - Conversational Assessment
  if (activeView === 'life_os_guided') {
    const handleGuidedComplete = (assessmentData: any[]) => {
      console.log('🎯 Guided discovery assessment completed:', assessmentData);
      toast({
        title: "Guided Assessment Complete! 💬",
        description: "Your conversational assessment has been processed.",
      });
      setActiveView('life_os_full'); // Show dashboard with results
    };

    return (
      <MainLayout>
        <ConversationalAssessment
          onComplete={handleGuidedComplete}
          onBack={() => setActiveView('life_os_choices')}
        />
      </MainLayout>
    );
  }

  // Progressive Journey - Smart Domain Expansion
  if (activeView === 'life_os_progressive') {
    const handleProgressiveComplete = (assessmentData: any[]) => {
      console.log('🛤️ Progressive journey assessment completed:', assessmentData);
      toast({
        title: "Progressive Journey Complete! 🛤️",
        description: "Your step-by-step assessment has been processed.",
      });
      setActiveView('life_os_full'); // Show dashboard with results
    };

    return (
      <MainLayout>
        <ProgressiveJourneyAssessment
          onComplete={handleProgressiveComplete}
          onBack={() => setActiveView('life_os_choices')}
        />
      </MainLayout>
    );
  }

  // Welcome view with all growth options including Life Operating System
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-6xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
              {t("spiritualGrowth.title")}
            </h1>
            <p className="text-muted-foreground text-lg">
              {t("spiritualGrowth.subtitle")}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Heart-Centered Coaching Option */}
            <div className="rounded-3xl bg-card p-3 ring-1 ring-border/40 shadow-sm transition-shadow hover:shadow-md">
              <CosmicCard variant="minimal" size="lg" className="h-full p-0 overflow-hidden rounded-2xl cursor-pointer" onClick={handleStartSpiritualGrowth}>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <Sparkles className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Heart-Centered Coach</h3>
                  <p className="text-muted-foreground text-sm">
                    Immediate personalized spiritual guidance.
                  </p>
                </div>
              </div>
            </CosmicCard>
            </div>

            {/* Life Operating System */}
            <div className="rounded-3xl bg-card p-3 ring-1 ring-border/40 shadow-sm transition-shadow hover:shadow-md">
              <CosmicCard variant="minimal" size="lg" className="h-full p-0 overflow-hidden rounded-2xl cursor-pointer" onClick={() => setActiveView('life_os_choices')}>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <Settings className="h-6 w-6 text-secondary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Life Operating System</h3>
                  <p className="text-muted-foreground text-sm">
                    Holistic life assessment and growth coordination.
                  </p>
                </div>
              </div>
            </CosmicCard>
            </div>

            {/* Growth Program Option */}
            <div className="rounded-3xl bg-card p-3 ring-1 ring-border/40 shadow-sm transition-shadow hover:shadow-md">
              <CosmicCard variant="minimal" size="lg" className="h-full p-0 overflow-hidden rounded-2xl cursor-pointer" onClick={() => setActiveView('growth_program')}>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <TrendingUp className="h-6 w-6 text-accent" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Structured Program</h3>
                  <p className="text-muted-foreground text-sm">
                    12-week journey for deep transformation.
                  </p>
                </div>
              </div>
            </CosmicCard>
            </div>

            {/* Tools & Practices */}
            <div className="rounded-3xl bg-card p-3 ring-1 ring-border/40 shadow-sm transition-shadow hover:shadow-md">
              <CosmicCard variant="minimal" size="lg" className="h-full p-0 overflow-hidden rounded-2xl cursor-pointer" onClick={() => setActiveView('tools')}>
              <div className="flex flex-col items-center text-center space-y-3 p-4">
                <BookOpen className="h-6 w-6 text-primary" />
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-1">Spiritual Tools</h3>
                  <p className="text-muted-foreground text-sm">
                    Mood tracking and reflection practices.
                  </p>
                </div>
              </div>
            </CosmicCard>
            </div>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;
