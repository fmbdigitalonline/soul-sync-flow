import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Heart, Sparkles, Moon, BookOpen, Calendar, MessageCircle, Compass, TrendingUp, ArrowLeft, Target } from "lucide-react";
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
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
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
  const { spacing, layout, touchTargetSize, getTextSize } = useResponsiveLayout();
  
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
      traits.push(blueprintData.cognition_mbti.type);
    }
    
    if (blueprintData.archetype_western?.sun_sign && blueprintData.archetype_western.sun_sign !== 'Unknown') {
      traits.push(blueprintData.archetype_western.sun_sign);
    }
    
    return traits.length > 0 ? traits : ['Unique Soul', 'Growth-Focused'];
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className={`min-h-screen bg-background flex items-center justify-center ${spacing.container}`}>
          <CosmicCard className={`${layout.width} ${layout.maxWidth} text-center ${spacing.gap}`}>
            <div className={`w-16 h-16 mx-auto bg-primary rounded-full flex items-center justify-center ${touchTargetSize}`}>
              <Heart className="h-8 w-8 text-primary-foreground" />
            </div>
            <div>
              <h1 className={`${getTextSize('text-2xl')} font-heading font-bold text-foreground mb-2`}>{t("spiritualGrowth.title")}</h1>
              <p className={`text-muted-foreground ${getTextSize('text-base')}`}>{t("spiritualGrowth.description")}</p>
            </div>
            <Button 
              className={`${layout.width} ${touchTargetSize}`}
              onClick={() => window.location.href = '/auth'}
            >
              {t("spiritualGrowth.getStarted")}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'immediate_chat') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-background">
          <div className={`container mx-auto ${spacing.container} ${layout.maxWidth}`}>
            
            <div className={`flex items-center justify-between ${spacing.gap}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setActiveView('welcome')}
                className={`flex items-center ${spacing.gap} text-muted-foreground hover:text-primary ${touchTargetSize}`}
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Options
              </Button>
              <div className="text-center">
                <h1 className={`${getTextSize('text-xl')} font-heading font-bold text-foreground`}>Heart-Centered Coach</h1>
                <p className={`${getTextSize('text-sm')} text-muted-foreground`}>Connected & Ready</p>
              </div>
              <div className="w-20" />
            </div>

            <CosmicCard className={`${layout.width} h-[calc(100vh-200px)]`}>
              <SpiritualGuideInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={sendMessage}
                userDisplayName={getUserDisplayName()}
                coreTraits={getCoreTraits()}
              />
            </CosmicCard>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (activeView === 'growth_program') {
    return (
      <TelemetryTracker>
        <MainLayout>
          <div className="min-h-screen bg-background">
            <div className={`container mx-auto ${spacing.container} ${layout.maxWidth}`}>
              <div className={spacing.gap}>
                <Button 
                  variant="outline" 
                  onClick={() => setActiveView('welcome')}
                  className={`${touchTargetSize} mb-4`}
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
        <div className={`flex flex-col h-[calc(100vh-5rem)] w-full ${spacing.container}`}>
          <div className={spacing.gap}>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('welcome')}
              className={`${touchTargetSize} mb-2`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Growth Coach
            </Button>
          </div>

          <div className={spacing.gap}>
            <h2 className={`${getTextSize('text-xl')} font-bold text-center gradient-text ${spacing.gap}`}>Growth Tools</h2>
            <div className={`${layout.columns} ${spacing.gap}`}>
              <Button
                variant="outline"
                onClick={() => setActiveView('mood')}
                className={`h-20 flex-col ${spacing.gap} ${touchTargetSize}`}
              >
                <Heart className="h-6 w-6" />
                Mood Tracker
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('reflection')}
                className={`h-20 flex-col ${spacing.gap} ${touchTargetSize}`}
              >
                <Sparkles className="h-6 w-6" />
                Reflection
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('insight')}
                className={`h-20 flex-col ${spacing.gap} ${touchTargetSize}`}
              >
                <BookOpen className="h-6 w-6" />
                Insights
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('weekly')}
                className={`h-20 flex-col ${spacing.gap} ${touchTargetSize}`}
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
        <div className={`flex flex-col h-[calc(100vh-5rem)] w-full ${spacing.container}`}>
          <div className={spacing.gap}>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className={`${touchTargetSize} mb-2`}
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
        <div className={`flex flex-col h-[calc(100vh-5rem)] w-full ${spacing.container}`}>
          <div className={spacing.gap}>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className={`${touchTargetSize} mb-2`}
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
        <div className={`flex flex-col h-[calc(100vh-5rem)] w-full ${spacing.container}`}>
          <div className={spacing.gap}>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className={`${touchTargetSize} mb-2`}
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
        <div className={`flex flex-col h-[calc(100vh-5rem)] w-full ${spacing.container}`}>
          <div className={spacing.gap}>
            <Button 
              variant="outline" 
              onClick={() => setActiveView('tools')}
              className={`${touchTargetSize} mb-2`}
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

  if (activeView === 'life_os_quick_focus') {
    const handleAssessmentComplete = (assessmentData: any[]) => {
      console.log('🎯 Quick focus assessment completed:', assessmentData);
      toast({
        title: "Assessment Complete! 🎯",
        description: "Your focused assessment has been processed.",
      });
      setActiveView('life_os_full');
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

  if (activeView === 'life_os_full') {
    const handleCreateProgram = (primaryDomain: LifeDomain, supportingDomains: LifeDomain[]) => {
      console.log('🚀 Creating program with Life OS integration:', { primaryDomain, supportingDomains });
      toast({
        title: "Program Created! 🎯",
        description: `Multi-domain growth plan created with ${primaryDomain} as primary focus.`,
      });
      setActiveView('growth_program');
    };

    return (
        <MainLayout>
          <div className="min-h-screen bg-background">
            <div className={`container mx-auto ${spacing.container} ${layout.maxWidth}`}>
            <div className={spacing.gap}>
              <Button 
                variant="outline" 
                onClick={() => setActiveView('life_os_choices')}
                className={`${touchTargetSize} mb-4`}
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

  if (activeView === 'life_os_guided') {
    const handleGuidedComplete = (assessmentData: any[]) => {
      console.log('🎯 Guided discovery assessment completed:', assessmentData);
      toast({
        title: "Guided Assessment Complete! 💬",
        description: "Your conversational assessment has been processed.",
      });
      setActiveView('life_os_full');
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

  if (activeView === 'life_os_progressive') {
    const handleProgressiveComplete = (assessmentData: any[]) => {
      console.log('🛤️ Progressive journey assessment completed:', assessmentData);
      toast({
        title: "Progressive Journey Complete! 🛤️",
        description: "Your step-by-step assessment has been processed.",
      });
      setActiveView('life_os_full');
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

  // Welcome view with responsive design
  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className={`container mx-auto ${spacing.container} ${layout.maxWidth}`}>
          <div className={`text-center ${spacing.gap}`}>
            <h1 className={`${getTextSize('text-3xl')} font-heading font-bold text-foreground mb-2`}>
              {t("spiritualGrowth.title")}
            </h1>
            <p className={`text-muted-foreground ${getTextSize('text-lg')}`}>
              {t("spiritualGrowth.subtitle")}
            </p>
          </div>

          <div className={`${layout.columns} ${spacing.gap}`}>
            
            <CosmicCard className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${touchTargetSize}`} onClick={handleStartSpiritualGrowth}>
              <div className={`flex flex-col items-center text-center ${spacing.gap}`}>
                <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Heart className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className={`${getTextSize('text-xl')} font-semibold text-foreground mb-2`}>Heart-Centered Coach</h3>
                  <p className={`text-muted-foreground ${getTextSize('text-sm')} leading-relaxed`}>
                    Start an immediate conversation with your personalized spiritual coach.
                  </p>
                </div>
                <div className={`${getTextSize('text-xs')} text-primary font-medium bg-primary/10 px-3 py-1 rounded-full`}>
                  ✨ Instant Connection
                </div>
              </div>
            </CosmicCard>

            <CosmicCard className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${touchTargetSize}`} onClick={() => setActiveView('life_os_choices')}>
              <div className={`flex flex-col items-center text-center ${spacing.gap}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-secondary to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="h-8 w-8 text-secondary-foreground" />
                </div>
                <div>
                  <h3 className={`${getTextSize('text-xl')} font-semibold text-foreground mb-2`}>Life Operating System</h3>
                  <p className={`text-muted-foreground ${getTextSize('text-sm')} leading-relaxed`}>
                    Holistic life wheel assessment and multi-domain growth coordination.
                  </p>
                </div>
                <div className={`${getTextSize('text-xs')} text-secondary font-medium bg-secondary/10 px-3 py-1 rounded-full`}>
                  🎯 Multi-Domain
                </div>
              </div>
            </CosmicCard>

            <CosmicCard className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${touchTargetSize}`} onClick={() => setActiveView('growth_program')}>
              <div className={`flex flex-col items-center text-center ${spacing.gap}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-accent to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="h-8 w-8 text-accent-foreground" />
                </div>
                <div>
                  <h3 className={`${getTextSize('text-xl')} font-semibold text-foreground mb-2`}>Structured Program</h3>
                  <p className={`text-muted-foreground ${getTextSize('text-sm')} leading-relaxed`}>
                    Comprehensive 12-week journey for deep spiritual transformation.
                  </p>
                </div>
                <div className={`${getTextSize('text-xs')} text-accent font-medium bg-accent/10 px-3 py-1 rounded-full`}>
                  🤖 AI-Powered
                </div>
              </div>
            </CosmicCard>

            <CosmicCard className={`group hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-1 ${touchTargetSize}`} onClick={() => setActiveView('tools')}>
              <div className={`flex flex-col items-center text-center ${spacing.gap}`}>
                <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Compass className="h-8 w-8 text-primary-foreground" />
                </div>
                <div>
                  <h3 className={`${getTextSize('text-xl')} font-semibold text-foreground mb-2`}>Spiritual Tools</h3>
                  <p className={`text-muted-foreground ${getTextSize('text-sm')} leading-relaxed`}>
                    Mood tracking, reflection prompts, and insight journaling tools.
                  </p>
                </div>
                <div className={`${getTextSize('text-xs')} text-primary font-medium bg-primary/10 px-3 py-1 rounded-full`}>
                  🧘 Daily Practice
                </div>
              </div>
            </CosmicCard>

          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;
