import React, { useRef, useEffect, useState } from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Sparkles, Moon, BookOpen, Calendar, MessageCircle, Settings, TrendingUp, ArrowLeft, User, Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach-stub";
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

const SpiritualGrowth = () => {
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("coach", "spiritual-growth");
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { user } = useAuth();
  const navigate = useNavigate();
  
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

  // Initialize for immediate spiritual growth chat
  const handleStartSpiritualGrowth = async () => {
    if (!isAuthenticated) return;
    
    try {
      console.log('🚀 Starting Heart-Centered Coaching...');
      
      // Reset conversation to ensure clean start
      resetConversation();
      
      // Navigate to chat route
      navigate('/spiritual-growth/chat');
      
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

  if (!isAuthenticated) {
    return (
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
    );
  }

  return (
    <Routes>
      {/* Welcome/Landing page */}
      <Route index element={<WelcomePage onStartChat={handleStartSpiritualGrowth} t={t} />} />
      
      {/* Heart-Centered Coach */}
      <Route path="chat" element={
        <ChatPage 
          getUserDisplayName={getUserDisplayName}
          getCoreTraits={getCoreTraits}
        />
      } />
      
      {/* Growth Program */}
      <Route path="program" element={<GrowthProgramPage />} />
      
      {/* Tools Overview */}
      <Route path="tools" element={<ToolsPage />} />
      
      {/* Individual Tools */}
      <Route path="tools/mood" element={<MoodPage addMoodEntry={addMoodEntry} />} />
      <Route path="tools/reflection" element={<ReflectionPage addReflectionEntry={addReflectionEntry} />} />
      <Route path="tools/insights" element={<InsightPage addInsightEntry={addInsightEntry} />} />
      <Route path="tools/weekly" element={<WeeklyPage />} />
      
      {/* Life Operating System */}
      <Route path="life-os" element={<LifeOSChoicesPage />} />
      <Route path="life-os/focus" element={<LifeOSFocusPage />} />
      <Route path="life-os/full" element={<LifeOSFullPage user={user} blueprintData={blueprintData} toast={toast} />} />
      <Route path="life-os/guided" element={<LifeOSGuidedPage />} />
      <Route path="life-os/progressive" element={<LifeOSProgressivePage />} />
    </Routes>
  );
};

// Welcome Page Component
const WelcomePage = ({ onStartChat, t }: { onStartChat: () => void; t: any }) => {
  const navigate = useNavigate();
  
  return (
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
          <CosmicCard className="group hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4" onClick={onStartChat}>
            <div className="flex flex-col items-center text-center space-y-3">
              <Sparkles className="h-6 w-6 text-primary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Heart-Centered Coach</h3>
                <p className="text-muted-foreground text-sm">
                  Immediate personalized spiritual guidance.
                </p>
              </div>
            </div>
          </CosmicCard>

          {/* Life Operating System */}
          <CosmicCard className="group hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4" onClick={() => navigate('/spiritual-growth/life-os')}>
            <div className="flex flex-col items-center text-center space-y-3">
              <Settings className="h-6 w-6 text-secondary" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Life Operating System</h3>
                <p className="text-muted-foreground text-sm">
                  Holistic life assessment and growth coordination.
                </p>
              </div>
            </div>
          </CosmicCard>

          {/* Growth Program Option */}
          <CosmicCard className="group hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4" onClick={() => navigate('/spiritual-growth/program')}>
            <div className="flex flex-col items-center text-center space-y-3">
              <TrendingUp className="h-6 w-6 text-accent" />
              <div>
                <h3 className="text-lg font-semibold text-foreground mb-1">Structured Program</h3>
                <p className="text-muted-foreground text-sm">
                  12-week journey for deep transformation.
                </p>
              </div>
            </div>
          </CosmicCard>

          {/* Tools & Practices */}
          <CosmicCard className="group hover:shadow-md transition-all duration-300 cursor-pointer transform hover:-translate-y-1 p-4" onClick={() => navigate('/spiritual-growth/tools')}>
            <div className="flex flex-col items-center text-center space-y-3">
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
  );
};

// Chat Page Component
const ChatPage = ({ getUserDisplayName, getCoreTraits }: { getUserDisplayName: () => string; getCoreTraits: () => string[] }) => {
  const navigate = useNavigate();
  
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-4xl">
        
        {/* Header with back button */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => navigate('/spiritual-growth')}
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

        {/* Unified Chat Interface Container */}
        <CosmicCard className="w-full h-[calc(100vh-200px)]">
          <SpiritualGuideInterface
            userDisplayName={getUserDisplayName()}
            coreTraits={getCoreTraits()}
          />
        </CosmicCard>
      </div>
    </div>
  );
};

// Growth Program Page Component
const GrowthProgramPage = () => {
  const navigate = useNavigate();
  
  return (
    <TelemetryTracker>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto py-6 px-4 max-w-6xl">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => navigate('/spiritual-growth')}
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
    </TelemetryTracker>
  );
};

// Tools Page Component
const ToolsPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spiritual-growth')}
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
            onClick={() => navigate('/spiritual-growth/tools/mood')}
            className="h-20 flex-col gap-2"
          >
            <Heart className="h-6 w-6" />
            Mood Tracker
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/spiritual-growth/tools/reflection')}
            className="h-20 flex-col gap-2"
          >
            <Sparkles className="h-6 w-6" />
            Reflection
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/spiritual-growth/tools/insights')}
            className="h-20 flex-col gap-2"
          >
            <BookOpen className="h-6 w-6" />
            Insights
          </Button>
          <Button
            variant="outline"
            onClick={() => navigate('/spiritual-growth/tools/weekly')}
            className="h-20 flex-col gap-2"
          >
            <Calendar className="h-6 w-6" />
            Weekly Review
          </Button>
        </div>
      </div>
    </div>
  );
};

// Individual Tool Pages
const MoodPage = ({ addMoodEntry }: { addMoodEntry: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spiritual-growth/tools')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
      </div>
      <MoodTracker onMoodSave={addMoodEntry} />
    </div>
  );
};

const ReflectionPage = ({ addReflectionEntry }: { addReflectionEntry: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spiritual-growth/tools')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
      </div>
      <ReflectionPrompts onReflectionSave={addReflectionEntry} />
    </div>
  );
};

const InsightPage = ({ addInsightEntry }: { addInsightEntry: any }) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spiritual-growth/tools')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
      </div>
      <InsightJournal onInsightSave={addInsightEntry} />
    </div>
  );
};

const WeeklyPage = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] w-full p-4">
      <div className="mb-4">
        <Button 
          variant="outline" 
          onClick={() => navigate('/spiritual-growth/tools')}
          className="mb-2"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Tools
        </Button>
      </div>
      <WeeklyInsights />
    </div>
  );
};

// Life OS Pages
const LifeOSChoicesPage = () => {
  const navigate = useNavigate();
  
  const handleChoiceSelect = (choice: 'quick_focus' | 'full_assessment' | 'guided_discovery' | 'progressive_journey') => {
    switch (choice) {
      case 'quick_focus':
        navigate('/spiritual-growth/life-os/focus');
        break;
      case 'full_assessment':
        navigate('/spiritual-growth/life-os/full');
        break;
      case 'guided_discovery':
        navigate('/spiritual-growth/life-os/guided');
        break;
      case 'progressive_journey':
        navigate('/spiritual-growth/life-os/progressive');
        break;
    }
  };

  return (
    <LifeOperatingSystemChoices
      onChoiceSelect={handleChoiceSelect}
      onBack={() => navigate('/spiritual-growth')}
    />
  );
};

const LifeOSFocusPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleAssessmentComplete = (assessmentData: any[]) => {
    console.log('🎯 Quick focus assessment completed:', assessmentData);
    toast({
      title: "Assessment Complete! 🎯",
      description: "Your focused assessment has been processed.",
    });
    navigate('/spiritual-growth/life-os/full');
  };

  return (
    <LifeOperatingSystemDomainFocus
      onBack={() => navigate('/spiritual-growth/life-os')}
      onComplete={handleAssessmentComplete}
    />
  );
};

const LifeOSFullPage = ({ user, blueprintData, toast }: { user: any; blueprintData: any; toast: any }) => {
  const navigate = useNavigate();
  
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
      navigate('/spiritual-growth/program');
      
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
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-6 px-4 max-w-7xl">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => navigate('/spiritual-growth/life-os')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Assessment Options
          </Button>
        </div>
        
        <LifeOperatingSystemDashboard onCreateProgram={handleCreateProgram} />
      </div>
    </div>
  );
};

const LifeOSGuidedPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleGuidedComplete = (assessmentData: any[]) => {
    console.log('🎯 Guided discovery assessment completed:', assessmentData);
    toast({
      title: "Guided Assessment Complete! 💬",
      description: "Your conversational assessment has been processed.",
    });
    navigate('/spiritual-growth/life-os/full');
  };

  return (
    <ConversationalAssessment
      onComplete={handleGuidedComplete}
      onBack={() => navigate('/spiritual-growth/life-os')}
    />
  );
};

const LifeOSProgressivePage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const handleProgressiveComplete = (assessmentData: any[]) => {
    console.log('🛤️ Progressive journey assessment completed:', assessmentData);
    toast({
      title: "Progressive Journey Complete! 🛤️",
      description: "Your step-by-step assessment has been processed.",
    });
    navigate('/spiritual-growth/life-os/full');
  };

  return (
    <ProgressiveJourneyAssessment
      onComplete={handleProgressiveComplete}
      onBack={() => navigate('/spiritual-growth/life-os')}
    />
  );
};

export default SpiritualGrowth;