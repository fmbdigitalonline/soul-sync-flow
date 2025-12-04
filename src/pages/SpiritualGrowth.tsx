import React, { useRef, useEffect, useState, useCallback } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, BookOpen, Calendar, MessageCircle, Settings, TrendingUp, ArrowLeft, User, Heart, Clock, ListChecks } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { ReflectiveGrowthInterface } from "@/components/growth/ReflectiveGrowthInterface";
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
import { LifeDomain, ProgramStatus } from "@/types/growth-program";

import { useLifeOrchestrator } from "@/hooks/use-life-orchestrator";
import { agentGrowthIntegration } from "@/services/agent-growth-integration";
type ActiveView = 'welcome' | 'immediate_chat' | 'growth_program' | 'tools' | 'mood' | 'reflection' | 'insight' | 'weekly' | 'life_os_choices' | 'life_os_quick_focus' | 'life_os_full' | 'life_os_guided' | 'life_os_progressive' | null;

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("coach", "spiritual-growth");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<ActiveView>('welcome');
  const [programStatus, setProgramStatus] = useState<{ status: ProgramStatus; domain?: LifeDomain; updatedAt?: string } | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { user } = useAuth();
  const { growthJourney, addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();
  const { needsAssessment, assessments, checkAssessmentNeeds } = useLifeOrchestrator();
  const [recentGrowthActivity, setRecentGrowthActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(false);

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

  const formatRelativeTime = useCallback((dateString?: string | null) => {
    if (!dateString) return '';
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }, []);

  useEffect(() => {
    checkAssessmentNeeds();
  }, [checkAssessmentNeeds]);

  useEffect(() => {
    const loadProgramStatus = async () => {
      if (!user) return;
      try {
        const program = await agentGrowthIntegration.getCurrentProgram(user.id);
        if (program) {
          setProgramStatus({
            status: program.status,
            domain: program.domain,
            updatedAt: program.updated_at
          });
        }
      } catch (error) {
        console.error('Error loading program status:', error);
      }
    };

    loadProgramStatus();
  }, [user]);

  

  const formatTimestamp = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  useEffect(() => {
    const fetchRecentActivity = async () => {
      if (!user) return;
      setLoadingActivity(true);
      const growthTypes = [
        'reflection_entry',
        'insight_entry',
        'mood_entry',
        'task_completed',
        'ritual_completed',
        'blueprint_sync',
        'growth_task',
        'growth_check_in'
      ];

      const { data, error } = await supabase
        .from('user_activities')
        .select('id, activity_type, activity_data, created_at')
        .eq('user_id', user.id)
        .in('activity_type', growthTypes)
        .order('created_at', { ascending: false })
        .limit(10);

      if (error) {
        console.error('Error fetching growth activity:', error);
        setLoadingActivity(false);
        return;
      }

      setRecentGrowthActivity(data || []);
      setLoadingActivity(false);
    };

    fetchRecentActivity();
  }, [user]);

  const describeActivity = (activity: any) => {
    const type = activity.activity_type as string;
    const data = activity.activity_data || {};

    switch (type) {
      case 'reflection_entry':
        return data.prompt ? `Reflection: ${data.prompt}` : 'Reflection saved';
      case 'insight_entry':
        return data.title ? `Insight: ${data.title}` : 'Insight captured';
      case 'mood_entry':
        return data.mood ? `Mood: ${data.mood}` : 'Mood logged';
      case 'task_completed':
      case 'growth_task':
        return data.title ? `Task completed: ${data.title}` : 'Growth task completed';
      case 'ritual_completed':
        return data.name ? `Ritual: ${data.name}` : 'Ritual completed';
      case 'blueprint_sync':
        return 'Blueprint synchronized';
      case 'growth_check_in':
        return 'Growth check-in recorded';
      default:
        return 'Growth activity logged';
    }
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
                {t('spiritualGrowth.ui.backToOptions')}
              </Button>
              <div className="text-center">
                <h1 className="text-xl font-heading font-bold text-foreground">{t('spiritualGrowth.ui.heartCenteredCoach')}</h1>
                <p className="text-sm text-muted-foreground">{t('spiritualGrowth.ui.connectedReady')}</p>
              </div>
              <div className="w-20" />
            </div>

            {/* Direct Chat Interface - Matching Coach Layout */}
            <div className="h-[calc(100vh-200px)]">
              <ReflectiveGrowthInterface
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
                  {t('spiritualGrowth.ui.backToGrowthCoach')}
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
              {t('spiritualGrowth.ui.backToGrowthCoach')}
            </Button>
          </div>

          <div className="space-y-4">
            <h2 className="text-xl font-bold text-center gradient-text mb-6">{t('spiritualGrowth.ui.growthTools')}</h2>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                onClick={() => setActiveView('mood')}
                className="h-20 flex-col gap-2"
              >
                <Heart className="h-6 w-6" />
                {t('spiritualGrowth.ui.moodTracker')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('reflection')}
                className="h-20 flex-col gap-2"
              >
                <Sparkles className="h-6 w-6" />
                {t('spiritualGrowth.ui.reflection')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('insight')}
                className="h-20 flex-col gap-2"
              >
                <BookOpen className="h-6 w-6" />
                {t('spiritualGrowth.ui.insights')}
              </Button>
              <Button
                variant="outline"
                onClick={() => setActiveView('weekly')}
                className="h-20 flex-col gap-2"
              >
                <Calendar className="h-6 w-6" />
                {t('spiritualGrowth.ui.weeklyReview')}
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
              {t('spiritualGrowth.ui.backToTools')}
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
              {t('spiritualGrowth.ui.backToTools')}
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
              {t('spiritualGrowth.ui.backToTools')}
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
              {t('spiritualGrowth.ui.backToTools')}
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
                {t('spiritualGrowth.ui.backToAssessmentOptions')}
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

  // Welcome view with hub layout and contextual guidance
  const lastSync = growthJourney?.last_updated || blueprintData?.updated_at || user?.last_sign_in_at;
  const formattedLastSync = lastSync
    ? new Date(lastSync).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
    : 'Awaiting first sync';
  const currentFocus = growthJourney?.current_focus_area || t('spiritualGrowth.ui.defaultFocus', { defaultValue: 'Centering & Clarity' });
  const reflectionCount = growthJourney?.reflection_entries?.length ?? 0;
  const insightCount = growthJourney?.insight_entries?.length ?? 0;
  const moodCount = growthJourney?.mood_entries?.length ?? 0;

  const focusTitleText = currentFocus;
  const focusDescriptionText = "Your inner peace is the key to unlock your higher consciousness.";
  const lastSyncedLabel = formatRelativeTime(lastSync || '') || 'Awaiting first sync';

  const continuationCards: {
    key: ActiveView;
    title: string;
    helper: string;
    icon: React.ElementType;
    tag?: string;
    onClick: () => void;
  }[] = [
    {
      key: 'life_os_full',
      title: 'Life Operating System',
      helper: needsAssessment ? 'Growth wheel assessment' : 'Growth wheel in-view',
      icon: Settings,
      tag: needsAssessment ? 'Start' : 'Resume',
      onClick: () => setActiveView('life_os_full')
    },
    {
      key: 'life_os_guided',
      title: 'Guided Discovery',
      helper: 'Guided mapping to focus',
      icon: BookOpen,
      tag: 'Resume',
      onClick: () => setActiveView('life_os_guided')
    },
    {
      key: 'life_os_progressive',
      title: 'Progressive Journey',
      helper: 'Step-by-step expansion',
      icon: TrendingUp,
      tag: 'Step 2 of 10',
      onClick: () => setActiveView('life_os_progressive')
    },
    {
      key: 'growth_program',
      title: 'Blueprint alignment',
      helper: programStatus ? `Focus: ${programStatus.domain?.replace(/_/g, ' ') || 'integration'}` : 'Focus on integration',
      icon: Heart,
      tag: 'Focus on Integration AI',
      onClick: () => setActiveView('growth_program')
    },
    {
      key: 'immediate_chat',
      title: 'Heart-Centered Coach',
      helper: growthJourney?.last_updated ? `Last chat ${formatRelativeTime(growthJourney.last_updated)}` : 'Open a heart chat',
      icon: MessageCircle,
      tag: 'Resume',
      onClick: handleStartSpiritualGrowth
    },
    {
      key: 'life_os_quick_focus',
      title: 'Quick Focus',
      helper: 'Choose today’s focus',
      icon: ListChecks,
      tag: 'Start',
      onClick: () => setActiveView('life_os_quick_focus')
    }
  ];

  const moduleOptions = [
    { title: 'Quick Focus', icon: ListChecks, onClick: () => setActiveView('life_os_quick_focus') },
    { title: 'Full Assessment', icon: Settings, onClick: () => setActiveView('life_os_full') },
    { title: 'Guided Discovery', icon: BookOpen, onClick: () => setActiveView('life_os_guided') },
    { title: 'Progressive Journey', icon: TrendingUp, onClick: () => setActiveView('life_os_progressive') },
  ];

  return (
    <MainLayout>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-8 px-4 max-w-5xl space-y-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-heading font-semibold text-foreground">
              {getUserDisplayName()}, here is your current spiritual trajectory
            </h1>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last-synced {lastSyncedLabel}</span>
            </div>
          </div>

          <CosmicCard className="bg-card/90 border shadow-sm p-5">
            <div className="flex items-start gap-3">
              <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-purple-100 to-primary/20 flex items-center justify-center text-xl">
                🪐
              </div>
              <div className="flex flex-col gap-2 w-full">
                <div className="flex flex-wrap items-center gap-2 justify-between">
                  <div className="inline-flex items-center gap-2">
                    <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold">
                      Today&apos;s Growth Focus
                    </span>
                    <div className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{lastSyncedLabel}</span>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                    {focusTitleText}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {focusDescriptionText}
                </p>
              </div>
            </div>
          </CosmicCard>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Continue Where You Left Off</p>
                <h3 className="text-lg font-semibold text-foreground">Pick back up with guided support</h3>
              </div>
              <span className="text-xs px-2 py-1 rounded-full bg-muted text-muted-foreground">Resume</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
              {continuationCards.map(tile => (
                <button
                  key={tile.key}
                  onClick={tile.onClick}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/80 p-4 text-center shadow-sm hover:border-primary/60 hover:shadow-md transition"
                >
                  <div className="flex items-center justify-between w-full">
                    {tile.tag ? (
                      <span className="text-[11px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium whitespace-nowrap">{tile.tag}</span>
                    ) : <span />}
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                    <tile.icon className="h-6 w-6" />
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">{tile.title}</p>
                    <p className="text-xs text-muted-foreground">{tile.helper}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-foreground">Explore Growth Modules</h3>
              <span className="text-sm text-muted-foreground">Find your best focus</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-4">
              {moduleOptions.map(module => (
                <button
                  key={module.title}
                  onClick={module.onClick}
                  className="flex flex-col items-center gap-2 rounded-xl border border-border bg-card/90 p-4 text-center shadow-sm hover:border-primary/60 hover:shadow-md transition"
                >
                  <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/20 text-primary flex items-center justify-center">
                    <module.icon className="h-6 w-6" />
                  </div>
                  <p className="text-sm font-semibold text-foreground">{module.title}</p>
                  <p className="text-xs text-muted-foreground">Open</p>
                </button>
              ))}
            </div>
          </div>

          <CosmicCard className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">Recent Activity</h3>
            </div>
            <div className="space-y-2">
              {loadingActivity && (
                <p className="text-sm text-muted-foreground">Loading your recent activities...</p>
              )}
              {!loadingActivity && recentGrowthActivity.length === 0 && (
                <p className="text-sm text-muted-foreground">No growth activities yet. Log a mood, reflection, or insight to begin.</p>
              )}
              {!loadingActivity && recentGrowthActivity.map(activity => (
                <div key={activity.id} className="flex items-center justify-between rounded-lg border border-border bg-card/80 px-3 py-2">
                  <div className="flex items-center gap-3">
                    <div className="h-9 w-9 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <p className="text-sm text-foreground">{describeActivity(activity)}</p>
                  </div>
                  <span className="text-xs text-muted-foreground">{formatTimestamp(activity.created_at)}</span>
                </div>
              ))}
            </div>
          </CosmicCard>
        </div>
      </div>
    </MainLayout>
  );
};

export default SpiritualGrowth;
