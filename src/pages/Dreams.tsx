import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import EnhancedBlueprintViewer from "@/components/blueprint/EnhancedBlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw, ToggleLeft, ToggleRight, Activity, ArrowLeft, Plus, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { BlueprintData, blueprintService } from "@/services/blueprint-service";
import { useNavigate } from "react-router-dom";
import { BlueprintGenerator } from "@/components/blueprint/BlueprintGenerationFlow";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { BlueprintEnhancementService } from "@/services/blueprint-enhancement-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Target, MapPin, Calendar, Zap, Brain, Clock, CheckCircle } from "lucide-react";
import { useBlueprintAwareDreamDiscoveryCoach } from "@/hooks/use-blueprint-aware-dream-discovery-coach";
import { DreamSuggestionCard } from "@/components/dream/DreamSuggestionCard";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { aiGoalDecompositionService } from "@/services/ai-goal-decomposition-service";
import { JourneyMap } from "@/components/journey/JourneyMap";
import { EnhancedJourneyMap } from "@/components/journey/EnhancedJourneyMap";
import { TaskViews } from "@/components/journey/TaskViews";
import { TaskCoachInterface } from "@/components/task/TaskCoachInterface";
import { PomodoroTimer } from "@/components/productivity/PomodoroTimer";
import { HabitTracker } from "@/components/productivity/HabitTracker";
import { useIsMobile } from "@/hooks/use-mobile";
import { DreamDecompositionPage } from "@/components/dream/DreamDecompositionPage";
import { DreamSuccessPage } from "@/components/dream/DreamSuccessPage";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { DreamDiscoveryChat } from "@/components/dream/DreamDiscoveryChat";

interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'stuck' | 'completed';
  due_date?: string;
  estimated_duration: string;
  energy_level_required: string;
  category: string;
  optimal_time_of_day: string[];
  goal_id?: string;
}

const Dreams = () => {
  const { 
    messages: dreamMessages, 
    isLoading: dreamLoading, 
    sendMessage: sendDreamMessage, 
    resetConversation: resetDreamConversation,
    conversationPhase,
    dreamSuggestions,
    selectedSuggestion,
    selectDreamSuggestion,
    intakeData,
    isReadyForDecomposition
  } = useBlueprintAwareDreamDiscoveryCoach();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [currentView, setCurrentView] = useState<'create' | 'chat' | 'journey' | 'task-coach' | 'decomposing' | 'success'>('create');
  const [activeTab, setActiveTab] = useState<'journey' | 'tasks' | 'focus' | 'habits'>('journey');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const [createdGoal, setCreatedGoal] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();
  const { spacing, layout, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow, isMobile } = useResponsiveLayout();

  // Dream creation form state
  const [dreamForm, setDreamForm] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });

  // Memoize handlers to prevent unnecessary re-renders
  const handleCreateDream = useCallback(async () => {
    if (!dreamForm.title.trim()) {
      toast({
        title: "Dream Required",
        description: "Please enter your dream or goal",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingDream(true);
    setCurrentView('decomposing');
    setCreatedGoal(null);
  }, [dreamForm.title, toast]);

  const handleDecompositionComplete = useCallback((decomposedGoal: any) => {
    setCreatedGoal(decomposedGoal);
    setCurrentView('success');
    setIsCreatingDream(false);
    
    setDreamForm({
      title: '',
      description: '',
      category: 'personal_growth',
      timeframe: '3 months'
    });
  }, []);

  const handleStartAIGuidance = useCallback(() => {
    // Reset dream discovery conversation to ensure clean context
    resetDreamConversation();
    sendDreamMessage("I'm ready to explore my dreams with you. Help me discover what truly lights up my soul and what I'm meant to create in this world.");
    setCurrentView('chat');
  }, [sendDreamMessage, resetDreamConversation]);

  // Add the missing success page handlers
  const handleSuccessTaskStart = useCallback((task: any) => {
    setSelectedTask(task);
    setCurrentView('task-coach');
  }, []);

  const handleSuccessViewJourney = useCallback(() => {
    setCurrentView('journey');
  }, []);

  const handleDiscoveryComplete = useCallback(() => {
    if (isReadyForDecomposition && intakeData) {
      // Set the form data from the discovery conversation
      setDreamForm({
        title: intakeData.title,
        description: intakeData.description || '',
        category: intakeData.category,
        timeframe: intakeData.timeframe
      });
      
      // Trigger decomposition
      setCurrentView('decomposing');
      setIsCreatingDream(true);
    }
  }, [isReadyForDecomposition, intakeData]);

  const getBlueprintInsight = useCallback(() => {
    if (!blueprintData) return "Your journey will be personalized once your blueprint is complete";
    
    const traits = [];
    if (blueprintData.cognition_mbti?.type && blueprintData.cognition_mbti.type !== 'Unknown') {
      traits.push(blueprintData.cognition_mbti.type);
    }
    if (blueprintData.energy_strategy_human_design?.type && blueprintData.energy_strategy_human_design.type !== 'Unknown') {
      traits.push(blueprintData.energy_strategy_human_design.type);
    }
    if (blueprintData.values_life_path?.lifePathNumber) {
      traits.push(`Life Path ${blueprintData.values_life_path.lifePathNumber}`);
    }
    
    if (traits.length === 0) {
      return "Your journey will be personalized based on your unique blueprint";
    }
    
    return `This journey will be optimized for your ${traits.slice(0, 2).join(' & ')} nature`;
  }, [blueprintData]);

  // Check authentication status
  useEffect(() => {
    let mounted = true;
    
    const checkAuth = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        if (mounted) {
          setIsAuthenticated(!!data.session);
        }
      } catch (error) {
        console.error('Auth check error:', error);
        if (mounted) {
          setIsAuthenticated(false);
        }
      }
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (mounted) {
        setIsAuthenticated(!!session);
      }
    });
    
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [dreamMessages, scrollToBottom]);

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    setCurrentView('task-coach');
  };

  const handleTaskComplete = async (taskId: string) => {
    // Update task status to completed
    // This will be handled by the task coach interface
    toast({
      title: "🎉 Task Completed!",
      description: "Great work! The task has been marked as complete.",
    });
  };

  const handleBackFromTaskCoach = () => {
    setSelectedTask(null);
    setCurrentView('journey');
  };

  const handleMilestoneClick = (milestoneId: string) => {
    // Find the milestone and focus on it
    const milestone = { id: milestoneId }; // You can expand this to get full milestone data
    setFocusedMilestone(milestone);
  };

  const handleTaskClick = (taskId: string) => {
    // Focus on specific task - for now just switch to task view
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className={`min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-3 ${isMobile ? 'pb-20' : ''}`}>
            <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 text-center w-full max-w-sm mx-auto ${spacing.card}`}>
              <div className={`w-10 h-10 mx-auto bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mb-4 flex items-center justify-center ${isFoldDevice ? 'w-8 h-8' : ''}`}>
                <Heart className={`h-5 w-5 text-white ${isFoldDevice ? 'h-4 w-4' : ''}`} />
              </div>
              <h1 className={`font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent ${getTextSize('text-lg')}`}>
                {t("dreams.title")}
              </h1>
              <p className={`mb-6 text-gray-600 leading-relaxed px-2 ${getTextSize('text-sm')}`}>{t("dreams.description")}</p>
              <Button 
                className={`w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl text-white font-medium ${touchTargetSize} ${getTextSize('text-sm')}`}
                onClick={() => window.location.href = '/auth'}
              >
                {t("dreams.getStarted")}
              </Button>
            </div>
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  }

  // Task Coach View - uses task-specific hook
  if (currentView === 'task-coach' && selectedTask) {
    return (
      <MainLayout>
        <div className={`min-h-screen bg-gradient-to-br from-soul-purple/5 to-soul-teal/5 w-full ${isMobile ? 'pb-20' : ''}`}>
          <TaskCoachInterface
            task={selectedTask}
            onBack={handleBackFromTaskCoach}
            onTaskComplete={handleTaskComplete}
          />
        </div>
      </MainLayout>
    );
  }

  // Dream Discovery Chat View - enhanced with blueprint suggestions
  if (currentView === 'chat') {
    return (
      <MainLayout>
        <div className={`min-h-screen flex flex-col bg-gradient-to-br from-soul-purple/5 to-white w-full ${isMobile ? 'pb-20' : ''}`}>
          {/* Mobile Optimized Header */}
          <div className={`bg-white/80 backdrop-blur-lg border-b border-gray-100 sticky top-0 z-10 w-full ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
            <div className={`flex items-center justify-between w-full max-w-4xl mx-auto`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className={`flex items-center gap-2 text-gray-600 hover:text-soul-purple rounded-xl ${isFoldDevice ? 'px-1 py-1' : 'px-2 py-1'} ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <ArrowLeft className={`h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                {!isFoldDevice && 'Back'}
              </Button>
              <div className="flex items-center gap-2">
                <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center ${isFoldDevice ? 'w-5 h-5' : 'w-6 h-6'}`}>
                  <Heart className={`text-white ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                </div>
                <h2 className={`font-semibold text-gray-800 ${getTextSize('text-sm')} ${isFoldDevice ? 'hidden' : ''}`}>Dream Discovery</h2>
              </div>
              <div className={isFoldDevice ? 'w-6' : 'w-16'} />
            </div>
          </div>
          
          <div className={`flex-1 w-full overflow-hidden max-w-4xl mx-auto ${isMobile ? 'px-0' : 'px-4'}`}>
            {/* Show suggestions if in suggestion phase */}
            {conversationPhase === 'suggestion_presentation' && dreamSuggestions.length > 0 && (
              <div className={`bg-white/90 backdrop-blur-lg border-b border-gray-100 ${spacing.container} py-4`}>
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-4">
                    <h3 className={`font-semibold text-gray-800 mb-2 ${getTextSize('text-sm')}`}>
                      Dreams Aligned with Your Blueprint
                    </h3>
                    <p className={`text-gray-600 ${getTextSize('text-xs')}`}>
                      Based on your personality, here are some dreams that might resonate with you:
                    </p>
                  </div>
                  <div className="space-y-3">
                    {dreamSuggestions.map((suggestion) => (
                      <DreamSuggestionCard
                        key={suggestion.id}
                        suggestion={suggestion}
                        onSelect={(selected) => {
                          selectDreamSuggestion(selected);
                          sendDreamMessage(`I'm interested in exploring "${selected.title}". This really resonates with me because ${selected.blueprintReason.toLowerCase()}.`);
                        }}
                        isSelected={selectedSuggestion?.id === suggestion.id}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
            
            <DreamDiscoveryChat
              messages={dreamMessages}
              isLoading={dreamLoading}
              onSendMessage={sendDreamMessage}
              messagesEndRef={messagesEndRef}
              conversationPhase={conversationPhase}
              intakeData={intakeData}
              onReadyForDecomposition={handleDiscoveryComplete}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'journey') {
    return (
      <MainLayout>
        <div className={`min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 w-full ${isMobile ? 'pb-20' : ''}`}>
          <div className={`w-full max-w-4xl mx-auto py-3 ${isMobile ? 'px-3 pb-24' : 'px-6 pb-20'}`}>
            
            {/* Mobile Optimized Header */}
            <div className={`flex items-center justify-between mb-4 w-full ${isFoldDevice ? 'flex-col gap-2' : ''}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className={`flex items-center gap-2 text-gray-600 hover:text-soul-purple rounded-xl ${isFoldDevice ? 'px-1 py-1' : 'px-2 py-1'} ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <ArrowLeft className={`h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                {isFoldDevice ? '' : 'New Dream'}
              </Button>
              <div className={`text-center ${isFoldDevice ? 'w-full' : 'flex-1'}`}>
                <h1 className={`font-bold text-gray-800 ${getTextSize('text-base')}`}>{t("dreams.yourJourney")}</h1>
                {!isFoldDevice && <p className={`text-gray-500 ${getTextSize('text-xs')}`}>{t("dreams.trackProgress")}</p>}
              </div>
              <div className={isFoldDevice ? 'hidden' : 'w-20'} />
            </div>

            {/* Mobile Responsive Single Card */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden w-full">
              
              {/* Mobile Optimized Tab Navigation */}
              <div className={`border-b border-gray-100 bg-white/50 w-full ${isFoldDevice ? 'p-1' : 'p-2'}`}>
                <div className={`w-full ${isFoldDevice ? 'grid grid-cols-2 gap-1' : 'flex gap-2'}`}>
                  <Button
                    variant={activeTab === 'journey' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('journey')}
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                      activeTab === 'journey' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className={`${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                    {isFoldDevice ? 'Map' : 'Journey'}
                  </Button>
                  <Button
                    variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                      activeTab === 'tasks' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <Target className={`${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                    Tasks
                  </Button>
                  {!isFoldDevice && (
                    <>
                      <Button
                        variant={activeTab === 'focus' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('focus')}
                        className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                          activeTab === 'focus' 
                            ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                            : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                        }`}
                      >
                        <Clock className="h-3 w-3" />
                        Focus
                      </Button>
                      <Button
                        variant={activeTab === 'habits' ? 'default' : 'ghost'}
                        size="sm"
                        onClick={() => setActiveTab('habits')}
                        className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                          activeTab === 'habits' 
                            ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                            : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                        }`}
                      >
                        <CheckCircle className="h-3 w-3" />
                        Habits
                      </Button>
                    </>
                  )}
                </div>
                
                {/* Secondary row for Fold devices */}
                {isFoldDevice && (
                  <div className="flex gap-1 w-full mt-1">
                    <Button
                      variant={activeTab === 'focus' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('focus')}
                      className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                        activeTab === 'focus' 
                          ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                          : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                      }`}
                    >
                      <Clock className="h-2 w-2" />
                      Focus
                    </Button>
                    <Button
                      variant={activeTab === 'habits' ? 'default' : 'ghost'}
                      size="sm"
                      onClick={() => setActiveTab('habits')}
                      className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all ${getTextSize('text-xs')} ${touchTargetSize} ${
                        activeTab === 'habits' 
                          ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                          : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                      }`}
                    >
                      <CheckCircle className="h-2 w-2" />
                      Habits
                    </Button>
                  </div>
                )}
              </div>

              {/* Content Area - Mobile Optimized */}
              <div className={`w-full ${spacing.card}`}>
                {activeTab === 'journey' && (
                  <div className="w-full">
                    <div className={`flex items-center gap-2 mb-3 ${isFoldDevice ? 'flex-col items-start gap-1' : ''}`}>
                      <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-xl flex items-center justify-center ${isFoldDevice ? 'w-5 h-5' : 'w-6 h-6'}`}>
                        <MapPin className={`text-white ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      </div>
                      <div className="flex-1">
                        <h2 className={`font-semibold text-gray-800 ${getTextSize('text-sm')}`}>Journey Map</h2>
                        {!isFoldDevice && <p className={`text-gray-500 ${getTextSize('text-xs')}`}>{getBlueprintInsight()}</p>}
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <EnhancedJourneyMap 
                        onTaskClick={handleTaskClick}
                        onMilestoneClick={handleMilestoneClick}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="w-full">
                    <div className={`flex items-center justify-between mb-3 ${isFoldDevice ? 'flex-col items-start gap-1' : ''}`}>
                      <h3 className={`font-semibold flex items-center gap-2 text-gray-800 ${getTextSize('text-sm')}`}>
                        <Target className={`text-soul-purple ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        Your Tasks
                      </h3>
                    </div>
                    <div className="w-full">
                      <TaskViews 
                        focusedMilestone={focusedMilestone}
                        onBackToJourney={() => setActiveTab('journey')}
                        onTaskSelect={handleTaskSelect}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'focus' && (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className={`text-soul-purple ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h3 className={`font-semibold text-gray-800 ${getTextSize('text-sm')}`}>Focus Session</h3>
                    </div>
                    <div className="w-full">
                      <PomodoroTimer />
                    </div>
                  </div>
                )}
                
                {activeTab === 'habits' && (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className={`text-soul-purple ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h3 className={`font-semibold text-gray-800 ${getTextSize('text-sm')}`}>Habits</h3>
                    </div>
                    <div className="w-full">
                      <HabitTracker />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create Dream View (default) - Mobile Responsive
  if (currentView === 'decomposing') {
    return (
      <MainLayout>
        <DreamDecompositionPage
          dreamTitle={dreamForm.title}
          dreamDescription={dreamForm.description}
          dreamCategory={dreamForm.category}
          dreamTimeframe={dreamForm.timeframe}
          onComplete={handleDecompositionComplete}
          blueprintData={blueprintData}
        />
      </MainLayout>
    );
  }

  if (currentView === 'success' && createdGoal) {
    return (
      <MainLayout>
        <DreamSuccessPage
          goal={createdGoal}
          onStartTask={handleSuccessTaskStart}
          onViewJourney={handleSuccessViewJourney}
        />
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        <div className={`min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 w-full ${isMobile ? 'pb-20' : ''}`}>
          <div className={`w-full max-w-lg mx-auto py-4 px-3 ${isMobile ? 'pb-24' : 'pb-20'}`}>
            
            {/* Mobile Optimized Hero Section */}
            <div className={`text-center mb-6 px-2`}>
              <div className={`mx-auto bg-gradient-to-br from-soul-purple via-soul-purple to-soul-teal rounded-full flex items-center justify-center mb-4 shadow-xl ${isFoldDevice ? 'w-12 h-12' : 'w-16 h-16'}`}>
                <Heart className={`text-white ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
              </div>
              <h1 className={`font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent ${getTextSize('text-xl')}`}>
                {t("dreams.whatsYourDream")}
              </h1>
              <p className={`text-gray-600 leading-relaxed mb-4 ${getTextSize('text-sm')}`}>
                Share your deepest aspirations and let's discover what truly lights up your soul
              </p>
              <div className={`inline-flex items-center gap-2 bg-soul-purple/10 px-3 py-1 rounded-full`}>
                <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse"></div>
                <p className={`text-soul-purple font-medium ${getTextSize('text-xs')} text-center leading-tight`}>{getBlueprintInsight()}</p>
              </div>
            </div>

            {/* Mobile Optimized Dream Creation Form */}
            <div className={`bg-white/80 backdrop-blur-lg rounded-2xl mb-4 shadow-lg border border-white/20 w-full p-4`}>
              <div className={`space-y-4`}>
                {/* Dream Input */}
                <div className="space-y-2">
                  <label className={`font-semibold text-gray-700 block ${getTextSize('text-sm')}`}>{t("dreams.whatsYourDream")}</label>
                  <Input
                    placeholder={t("dreams.placeholderDream")}
                    value={dreamForm.title}
                    onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                    className={`border-gray-200 rounded-xl focus:border-soul-purple focus:ring-soul-purple/20 w-full ${getTextSize('text-sm')} ${touchTargetSize}`}
                  />
                </div>

                {/* Why Input */}
                <div className="space-y-2">
                  <label className={`font-semibold text-gray-700 block ${getTextSize('text-sm')}`}>{t("dreams.whyImportant")}</label>
                  <Textarea
                    placeholder={t("dreams.placeholderWhy")}
                    value={dreamForm.description}
                    onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                    className={`border-gray-200 rounded-xl focus:border-soul-purple focus:ring-soul-purple/20 resize-none w-full ${getTextSize('text-sm')} ${isFoldDevice ? 'min-h-[60px]' : 'min-h-[70px]'}`}
                  />
                </div>

                {/* Category & Timeline - Stack on mobile */}
                <div className={`space-y-4`}>
                  <div className="space-y-2">
                    <label className={`font-semibold text-gray-700 block ${getTextSize('text-sm')}`}>{t("dreams.category")}</label>
                    <Select 
                      value={dreamForm.category} 
                      onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className={`border-gray-200 rounded-xl focus:border-soul-purple w-full ${getTextSize('text-sm')} ${touchTargetSize}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        <SelectItem value="personal_growth" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryPersonal")}</SelectItem>
                        <SelectItem value="career" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryCareer")}</SelectItem>
                        <SelectItem value="health" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryHealth")}</SelectItem>
                        <SelectItem value="relationships" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryRelationships")}</SelectItem>
                        <SelectItem value="creativity" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryCreative")}</SelectItem>
                        <SelectItem value="financial" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categoryFinancial")}</SelectItem>
                        <SelectItem value="spiritual" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.categorySpiritual")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <label className={`font-semibold text-gray-700 block ${getTextSize('text-sm')}`}>{t("dreams.timeline")}</label>
                    <Select 
                      value={dreamForm.timeframe} 
                      onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                    >
                      <SelectTrigger className={`border-gray-200 rounded-xl focus:border-soul-purple w-full ${getTextSize('text-sm')} ${touchTargetSize}`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        <SelectItem value="1 month" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 1 Month"}</SelectItem>
                        <SelectItem value="3 months" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 3 Months"}</SelectItem>
                        <SelectItem value="6 months" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 6 Months"}</SelectItem>
                        <SelectItem value="1 year" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 1 Year"}</SelectItem>
                        <SelectItem value="2 years" className={`rounded-lg ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 2+ Years"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Create Button */}
                <Button 
                  onClick={handleCreateDream}
                  disabled={isCreatingDream || !dreamForm.title.trim()}
                  className={`w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 ${getTextSize('text-sm')} ${touchTargetSize}`}
                >
                  {isCreatingDream ? (
                    <>
                      <Brain className={`mr-2 animate-pulse ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      {t("dreams.creatingJourney")}
                    </>
                  ) : (
                    <>
                      <Sparkles className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                      {t("dreams.createJourney")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile Optimized Alternative Options */}
            <div className="space-y-3 w-full">
              <div className="text-center">
                <p className={`text-gray-500 mb-3 ${getTextSize('text-xs')}`}>
                  Or explore with your dream guide
                </p>
              </div>
              
              <Button 
                onClick={handleStartAIGuidance}
                variant="outline"
                className={`w-full border-2 border-soul-purple/20 bg-soul-purple/5 hover:bg-soul-purple/10 text-soul-purple py-4 rounded-xl font-medium transition-all duration-300 ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <Heart className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                Start Heart-Centered Discovery
              </Button>
              
              <Button 
                onClick={() => setCurrentView('journey')}
                variant="outline"
                className={`w-full border-2 border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 py-4 rounded-xl font-medium transition-all duration-300 ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <MapPin className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                {t("dreams.viewJourney")}
              </Button>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
};

export default Dreams;
