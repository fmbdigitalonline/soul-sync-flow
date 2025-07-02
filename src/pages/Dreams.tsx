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
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
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
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("coach");
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
  const isMobile = useIsMobile();

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
    sendMessage("I want to start my dream journey. Help me define my biggest goal and create a personalized action plan based on my soul blueprint.");
    setCurrentView('chat');
  }, [sendMessage]);

  // Add the missing success page handlers
  const handleSuccessTaskStart = useCallback((task: any) => {
    setSelectedTask(task);
    setCurrentView('task-coach');
  }, []);

  const handleSuccessViewJourney = useCallback(() => {
    setCurrentView('journey');
  }, []);

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

  // Set agent to coach for this page
  useEffect(() => {
    if (currentAgent !== "coach") {
      switchAgent("coach");
    }
  }, [currentAgent, switchAgent]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

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
          <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
            <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-2xl border border-white/20 text-center max-w-sm w-full">
              <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mx-auto mb-4 flex items-center justify-center">
                <Heart className="h-6 w-6 text-white" />
              </div>
              <h1 className="text-xl font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
                {t("dreams.title")}
              </h1>
              <p className="mb-6 text-gray-600 text-sm leading-relaxed">{t("dreams.description")}</p>
              <Button 
                className="w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl h-10 text-white font-medium text-sm"
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

  // Task Coach View
  if (currentView === 'task-coach' && selectedTask) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 to-soul-teal/5 w-full max-w-full overflow-x-hidden">
          <TaskCoachInterface
            task={selectedTask}
            onBack={handleBackFromTaskCoach}
            onTaskComplete={handleTaskComplete}
          />
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'chat') {
    return (
      <MainLayout>
        <div className="min-h-screen flex flex-col bg-gradient-to-br from-soul-purple/5 to-white w-full max-w-full overflow-x-hidden">
          {/* Mobile-Optimized Header - Reduced height */}
          <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 p-2 sticky top-0 z-10 w-full">
            <div className="flex items-center justify-between w-full max-w-sm mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-1 text-gray-600 hover:text-soul-purple rounded-xl p-1.5 text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                {!isMobile && "Back"}
              </Button>
              <div className="flex items-center gap-2 flex-1 justify-center">
                <div className="w-5 h-5 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center">
                  <Brain className="h-2.5 w-2.5 text-white" />
                </div>
                <h2 className="font-semibold text-gray-800 text-xs">AI Dream Coach</h2>
              </div>
              <div className="w-12" />
            </div>
          </div>
          
          <div className="flex-1 w-full p-2 overflow-hidden max-w-sm mx-auto">
            <CoachInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
              taskTitle="Dream Coaching"
              estimatedDuration="~30 min"
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'journey') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5 w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-sm mx-auto py-2 px-3">
            
            {/* Mobile-Optimized Header - Smaller */}
            <div className="flex items-center justify-between mb-3 w-full">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-1 text-gray-600 hover:text-soul-purple rounded-xl px-1 py-0.5 text-xs"
              >
                <ArrowLeft className="h-3 w-3" />
                {!isMobile ? t("dreams.newDream") : t("dreams.new")}
              </Button>
              <div className="text-center flex-1">
                <h1 className="text-sm font-bold text-gray-800">{t("dreams.yourJourney")}</h1>
                <p className="text-xs text-gray-500">{t("dreams.trackProgress")}</p>
              </div>
              <div className="w-12" />
            </div>

            {/* Mobile-First Single Card Layout - Smaller padding */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden w-full">
              
              {/* Horizontal Tab Navigation - Smaller */}
              <div className="border-b border-gray-100 p-2 bg-white/50 w-full">
                <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                  <Button
                    variant={activeTab === 'journey' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('journey')}
                    className={`flex items-center gap-1 rounded-lg whitespace-nowrap min-w-fit px-2 py-1.5 text-xs font-medium transition-all ${
                      activeTab === 'journey' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <MapPin className="h-3 w-3" />
                    {t("dreams.tabs.journey")}
                  </Button>
                  <Button
                    variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-1 rounded-lg whitespace-nowrap min-w-fit px-2 py-1.5 text-xs font-medium transition-all ${
                      activeTab === 'tasks' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <Target className="h-3 w-3" />
                    {t("dreams.tabs.tasks")}
                  </Button>
                  <Button
                    variant={activeTab === 'focus' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('focus')}
                    className={`flex items-center gap-1 rounded-lg whitespace-nowrap min-w-fit px-2 py-1.5 text-xs font-medium transition-all ${
                      activeTab === 'focus' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <Clock className="h-3 w-3" />
                    {t("dreams.tabs.focus")}
                  </Button>
                  <Button
                    variant={activeTab === 'habits' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('habits')}
                    className={`flex items-center gap-1 rounded-lg whitespace-nowrap min-w-fit px-2 py-1.5 text-xs font-medium transition-all ${
                      activeTab === 'habits' 
                        ? 'bg-gradient-to-r from-soul-purple to-soul-teal text-white shadow-md' 
                        : 'text-gray-600 hover:text-soul-purple hover:bg-gray-50'
                    }`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    {t("dreams.tabs.habits")}
                  </Button>
                </div>
              </div>

              {/* Single Tab Content Area - Smaller padding */}
              <div className="p-3 w-full overflow-hidden">
                {activeTab === 'journey' && (
                  <div className="w-full max-w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 bg-gradient-to-br from-soul-purple to-soul-teal rounded-xl flex items-center justify-center">
                        <MapPin className="h-3 w-3 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h2 className="text-sm font-semibold text-gray-800">Journey Map</h2>
                        <p className="text-xs text-gray-500 truncate">{getBlueprintInsight()}</p>
                      </div>
                    </div>
                    
                    <div className="w-full overflow-hidden">
                      <EnhancedJourneyMap 
                        onTaskClick={handleTaskClick}
                        onMilestoneClick={handleMilestoneClick}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="w-full max-w-full">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold flex items-center gap-2 text-gray-800 text-sm">
                        <Target className="h-3 w-3 text-soul-purple" />
                        {t("dreams.tab.yourTasks")}
                      </h3>
                    </div>
                    <div className="w-full overflow-hidden">
                      <TaskViews 
                        focusedMilestone={focusedMilestone}
                        onBackToJourney={() => setActiveTab('journey')}
                        onTaskSelect={handleTaskSelect}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'focus' && (
                  <div className="w-full max-w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <Clock className="h-3 w-3 text-soul-purple" />
                      <h3 className="font-semibold text-gray-800 text-sm">{t("dreams.tab.focusSession")}</h3>
                    </div>
                    <div className="w-full">
                      <PomodoroTimer />
                    </div>
                  </div>
                )}
                
                {activeTab === 'habits' && (
                  <div className="w-full max-w-full">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle className="h-3 w-3 text-soul-purple" />
                      <h3 className="font-semibold text-gray-800 text-sm">{t("dreams.tab.habits")}</h3>
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

  // Create Dream View (default) - Mobile Optimized with smaller container
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
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 w-full max-w-full overflow-x-hidden">
          <div className="w-full max-w-sm mx-auto py-4 pb-20 px-3">
            
            {/* Mobile-Optimized Hero Section - Smaller */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto bg-gradient-to-br from-soul-purple via-soul-purple to-soul-teal rounded-full flex items-center justify-center mb-3 shadow-xl">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-xl font-bold mb-2 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
                {t("dreams.whatsYourDream")}
              </h1>
              <p className="text-gray-600 text-sm leading-relaxed mb-3 px-1">
                {t("dreams.heroDescription")}
              </p>
              <div className="inline-flex items-center gap-2 bg-soul-purple/10 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-soul-purple rounded-full animate-pulse"></div>
                <p className="text-xs text-soul-purple font-medium">{getBlueprintInsight()}</p>
              </div>
            </div>

            {/* Mobile-Optimized Dream Creation Form - Smaller */}
            <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-3 mb-4 shadow-lg border border-white/20 w-full">
              <div className="space-y-3">
                {/* Dream Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">{t("dreams.whatsYourDream")}</label>
                  <Input
                    placeholder={t("dreams.placeholderDream")}
                    value={dreamForm.title}
                    onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                    className="text-sm border-gray-200 rounded-xl h-9 focus:border-soul-purple focus:ring-soul-purple/20 w-full"
                  />
                </div>

                {/* Why Input */}
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-gray-700 block">{t("dreams.whyImportant")}</label>
                  <Textarea
                    placeholder={t("dreams.placeholderWhy")}
                    value={dreamForm.description}
                    onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                    className="text-sm border-gray-200 rounded-xl min-h-[60px] focus:border-soul-purple focus:ring-soul-purple/20 resize-none w-full"
                  />
                </div>

                {/* Category & Timeline - Stacked for Mobile */}
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">{t("dreams.category")}</label>
                    <Select 
                      value={dreamForm.category} 
                      onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl h-9 focus:border-soul-purple w-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        <SelectItem value="personal_growth" className="rounded-lg text-sm">{t("goals.categoryPersonal")}</SelectItem>
                        <SelectItem value="career" className="rounded-lg text-sm">{t("goals.categoryCareer")}</SelectItem>
                        <SelectItem value="health" className="rounded-lg text-sm">{t("goals.categoryHealth")}</SelectItem>
                        <SelectItem value="relationships" className="rounded-lg text-sm">{t("goals.categoryRelationships")}</SelectItem>
                        <SelectItem value="creativity" className="rounded-lg text-sm">{t("goals.categoryCreative")}</SelectItem>
                        <SelectItem value="financial" className="rounded-lg text-sm">{t("goals.categoryFinancial")}</SelectItem>
                        <SelectItem value="spiritual" className="rounded-lg text-sm">{t("goals.categorySpiritual")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-gray-700 block">{t("dreams.timeline")}</label>
                    <Select 
                      value={dreamForm.timeframe} 
                      onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                    >
                      <SelectTrigger className="border-gray-200 rounded-xl h-9 focus:border-soul-purple w-full text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-gray-200">
                        <SelectItem value="1 month" className="rounded-lg text-sm">{t("goals.targetDate") + " - 1 Month"}</SelectItem>
                        <SelectItem value="3 months" className="rounded-lg text-sm">{t("goals.targetDate") + " - 3 Months"}</SelectItem>
                        <SelectItem value="6 months" className="rounded-lg text-sm">{t("goals.targetDate") + " - 6 Months"}</SelectItem>
                        <SelectItem value="1 year" className="rounded-lg text-sm">{t("goals.targetDate") + " - 1 Year"}</SelectItem>
                        <SelectItem value="2 years" className="rounded-lg text-sm">{t("goals.targetDate") + " - 2+ Years"}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Create Button */}
                <Button 
                  onClick={handleCreateDream}
                  disabled={isCreatingDream || !dreamForm.title.trim()}
                  className="w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg text-white text-sm py-4 rounded-xl font-semibold mt-4 transition-all duration-300 disabled:opacity-50"
                >
                  {isCreatingDream ? (
                    <>
                      <Brain className="h-4 w-4 mr-2 animate-pulse" />
                      {t("dreams.creatingJourney")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4 mr-2" />
                      {t("dreams.createJourney")}
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Mobile-Optimized Alternative Options - Smaller */}
            <div className="space-y-2 w-full">
              <div className="text-center">
                <p className="text-xs text-gray-500 mb-3">{t("dreams.aiInsighLabel")}</p>
              </div>
              
              <div className="space-y-2 w-full">
                <Button
                  variant="outline"
                  onClick={handleStartAIGuidance}
                  className="w-full justify-start text-left p-2 h-auto border-gray-200 hover:border-soul-purple/50 hover:bg-soul-purple/5 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-soul-teal/20 to-soul-teal/10 rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
                      <Zap className="h-3 w-3 text-soul-teal" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-xs">{t("dreams.aiButtonTitle")}</div>
                      <div className="text-xs text-gray-500">{t("dreams.aiButtonDesc")}</div>
                    </div>
                  </div>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setCurrentView('journey')}
                  className="w-full justify-start text-left p-2 h-auto border-gray-200 hover:border-soul-purple/50 hover:bg-soul-purple/5 rounded-xl transition-all duration-300"
                >
                  <div className="flex items-center w-full">
                    <div className="w-8 h-8 bg-gradient-to-br from-soul-purple/20 to-soul-purple/10 rounded-xl flex items-center justify-center mr-2 flex-shrink-0">
                      <MapPin className="h-3 w-3 text-soul-purple" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-800 text-xs">{t("dreams.journeyButtonTitle")}</div>
                      <div className="text-xs text-gray-500">{t("dreams.journeyButtonDesc")}</div>
                    </div>
                  </div>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </ErrorBoundary>
    </MainLayout>
  );
};

export default Dreams;
