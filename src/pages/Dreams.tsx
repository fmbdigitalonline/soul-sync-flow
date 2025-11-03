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
import { useNavigate, useLocation } from "react-router-dom";
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
import { DreamMenuGrid } from "@/components/dream/DreamMenuGrid";
import { HomeMenuGrid } from "@/components/home/HomeMenuGrid";
import { DreamsOverview } from "@/components/dream/DreamsOverview";
import { AllDreamsList } from "@/components/dream/AllDreamsList";
import { useGoals } from "@/hooks/use-goals";
import { getTaskSessionType } from "@/utils/task-session";
import type { ResumableTask } from "@/hooks/use-resumable-tasks";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";

type Task = ResumableTask;

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
  // Removed duplicate authentication state - trusting ProtectedRoute
  const [currentView, setCurrentView] = useState<'hub' | 'create' | 'chat' | 'journey' | 'task-coach' | 'decomposing' | 'success' | 'details' | 'all-goals'>('hub');
  const [activeTab, setActiveTab] = useState<'journey' | 'tasks' | 'focus' | 'habits'>('journey');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const [createdGoal, setCreatedGoal] = useState<any>(null);
  const [selectedGoalForDetails, setSelectedGoalForDetails] = useState<any>(null);
  const [focusedMilestoneInDetails, setFocusedMilestoneInDetails] = useState<any>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]); // Track breadcrumb navigation (Pillar I: Preserve Core Intelligence)
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [previousView, setPreviousView] = useState<'hub' | 'all-goals'>('hub');
  const [sessionRefreshKey, setSessionRefreshKey] = useState(0);

  // Principle #2: No Hardcoded Data - Load all goals from database
  const { goals, isLoading: goalsLoading } = useGoals();

  const { productivityJourney, refetch: refetchJourneyData } = useJourneyTracking();

  const journeyGoals = useMemo(() => {
    const rawGoals = productivityJourney?.current_goals;

    if (!rawGoals) {
      return [];
    }

    if (Array.isArray(rawGoals)) {
      return rawGoals as any[];
    }

    if (typeof rawGoals === 'string') {
      try {
        const parsed = JSON.parse(rawGoals);
        return Array.isArray(parsed) ? parsed : [];
      } catch (error) {
        console.warn('⚠️ Dreams: Unable to parse productivity journey goals string', error);
        return [];
      }
    }

    if (typeof rawGoals === 'object') {
      return Object.values(rawGoals as Record<string, any>);
    }

    return [];
  }, [productivityJourney?.current_goals]);

  const selectedJourneyGoal = useMemo(() => {
    if (!selectedGoalId) return null;

    return (
      journeyGoals.find(goal => {
        const goalId = goal?.id ? String(goal.id) : undefined;
        const altGoalId = goal?.goal_id ? String(goal.goal_id) : undefined;

        return goalId === selectedGoalId || altGoalId === selectedGoalId;
      }) || null
    );
  }, [journeyGoals, selectedGoalId]);

  const fallbackGoalFromList = useMemo(
    () => (selectedGoalId ? goals.find(goal => goal.id === selectedGoalId) || null : null),
    [goals, selectedGoalId]
  );

  const resolvedGoalToShow = useMemo(() => {
    console.log('🎯 Dreams: Resolving goal to show', {
      hasCreatedGoal: !!createdGoal,
      hasSelectedJourneyGoal: !!selectedJourneyGoal,
      hasFallbackGoal: !!fallbackGoalFromList,
      journeyGoalsCount: journeyGoals.length
    });

    // Check if goal has complete data (using optional chaining for any type)
    const hasCompleteData = (goal: any) => {
      return goal && 
             (goal.milestones || (goal as any).milestones) && 
             ((goal as any).tasks || goal.milestones?.length > 0);
    };

    if (createdGoal && hasCompleteData(createdGoal)) {
      console.log('✅ Dreams: Using createdGoal with complete data');
      return createdGoal;
    }

    if (selectedJourneyGoal && hasCompleteData(selectedJourneyGoal)) {
      console.log('✅ Dreams: Using selectedJourneyGoal with complete data');
      return selectedJourneyGoal;
    }

    if (fallbackGoalFromList && hasCompleteData(fallbackGoalFromList)) {
      console.log('✅ Dreams: Using fallbackGoalFromList with complete data');
      return fallbackGoalFromList;
    }

    const firstJourneyGoal = journeyGoals[0];
    if (firstJourneyGoal && hasCompleteData(firstJourneyGoal)) {
      console.log('✅ Dreams: Using first journey goal with complete data');
      return firstJourneyGoal;
    }

    console.warn('⚠️ Dreams: No goal with complete data found, returning best available or null');
    return createdGoal || selectedJourneyGoal || fallbackGoalFromList || firstJourneyGoal || null;
  }, [createdGoal, fallbackGoalFromList, journeyGoals, selectedJourneyGoal]);
  
  // Principle #6: Respect Critical Data Pathways - Track active goal
  const [activeGoalId, setActiveGoalId] = useState<string | null>(() => {
    // Restore from localStorage (Principle #7: Build Transparently)
    return localStorage.getItem('activeGoalId');
  });
  
  // Get active goal from loaded goals
  const activeGoal = goals.find(g => g.id === activeGoalId) || null;
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

  const formRef = useRef<HTMLDivElement>(null);
  const scrollToForm = useCallback(() => {
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  // Memoize handlers to prevent unnecessary re-renders
  const handleCreateDream = useCallback(async () => {
    if (!dreamForm.title.trim()) {
      toast({
        title: t('dreams.dreamRequired'),
        description: t('dreams.dreamRequiredDesc'),
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

  const navigate = useNavigate();
  const location = useLocation();

  const handleSuccessViewJourney = useCallback(() => {
    console.log('📍 Dreams: Navigating from success to journey, tracking breadcrumb');
    setNavigationHistory(prev => [...prev, 'success']);
    
    if (createdGoal?.id) {
      setActiveGoalId(createdGoal.id);
      localStorage.setItem('activeGoalId', createdGoal.id);
      console.log('✅ Dreams: Set active goal:', createdGoal.id);
    }
    
    setCurrentView('journey');
  }, [createdGoal]);
  
  const handleSelectGoal = useCallback((goalId: string) => {
    console.log('🎯 Dreams: User selected goal:', goalId);
    setActiveGoalId(goalId);
    localStorage.setItem('activeGoalId', goalId);
    setCurrentView('journey');
    navigate('/dreams/journey');
  }, [navigate]);
  
  const handleCreateAnotherDream = useCallback(() => {
    console.log('➕ Dreams: User wants to create another dream');
    setCurrentView('create');
    navigate('/dreams/create');
  }, [navigate]);

  const handleDiscoveryComplete = useCallback(() => {
    if (isReadyForDecomposition && intakeData) {
      setDreamForm({
        title: intakeData.title,
        description: intakeData.description || '',
        category: intakeData.category,
        timeframe: intakeData.timeframe
      });
      
      setCurrentView('decomposing');
      setIsCreatingDream(true);
    }
  }, [isReadyForDecomposition, intakeData]);

  // Principle #2: No Hardcoded Data - Load real goal from database
  const handleViewGoalDetails = useCallback((goalId: string) => {
    console.log('🔍 Viewing goal details:', goalId);
    setPreviousView(currentView as 'hub' | 'all-goals');
    setSelectedGoalId(goalId);
    setCurrentView('success');
    navigate('/dreams/success');
  }, [currentView, navigate]);

  const handleViewAllGoals = useCallback(() => {
    console.log('📋 Navigating to all goals view');
    setCurrentView('all-goals');
    navigate('/dreams/all');
  }, [navigate]);

  const handleBackFromDetails = useCallback(() => {
    console.log('⬅️ Navigating back from details to overview');
    setSelectedGoalForDetails(null);
    setFocusedMilestoneInDetails(null);
    setCurrentView('hub');
    navigate('/dreams');
  }, [navigate]);

  // NEW: Handle pre-filled form data from steward completion screen (Principle #8: Only Add)
  useEffect(() => {
    const prefillData = sessionStorage.getItem('dreamFormPrefill');
    if (prefillData && currentView === 'create') {
      try {
        const parsedData = JSON.parse(prefillData);
        setDreamForm(parsedData);
        sessionStorage.removeItem('dreamFormPrefill'); // Clear after use
        console.log('✅ DREAMS: Form pre-filled from steward completion:', parsedData);
        
        // Scroll to form
        scrollToForm();
      } catch (error) {
        console.error('❌ DREAMS: Failed to parse prefill data:', error);
      }
    }
  }, [currentView, scrollToForm]);

  useEffect(() => {
    const path = location.pathname;
    if (path === "/dreams" || path === "/dreams/") {
      setCurrentView("hub");
      return;
    }
    if (path.startsWith("/dreams/discover")) {
      setCurrentView("chat");
      return;
    }
    if (path.startsWith("/dreams/create")) {
      setCurrentView("create");
      return;
    }
    if (path.startsWith("/dreams/journey")) {
      setCurrentView("journey");
      setActiveTab("journey");
      return;
    }
    if (path.startsWith("/dreams/tasks")) {
      setCurrentView("journey");
      setActiveTab("tasks");
      return;
    }
    if (path.startsWith("/dreams/focus")) {
      setCurrentView("journey");
      setActiveTab("focus");
      return;
    }
    if (path.startsWith("/dreams/habits")) {
      setCurrentView("journey");
      setActiveTab("habits");
      return;
    }
    if (path.startsWith("/dreams/all")) {
      console.log('📋 Route handler: /dreams/all → setting view to all-goals');
      setCurrentView("all-goals");
      return;
    }
    if (path.startsWith("/dreams/success")) {
      console.log('🎯 Route handler: /dreams/success', { createdGoal: !!createdGoal, selectedGoalId });
      if (createdGoal || selectedGoalId) {
        setCurrentView("success");
      } else {
        console.warn('⚠️ Attempted to access /dreams/success without goal data');
        toast({ title: t('toast.info.notAvailable'), description: t('dreams.notAvailableDesc') });
        navigate("/dreams", { replace: true });
      }
      return;
    }
    
    // Defensive logging for unhandled routes
    if (path.startsWith("/dreams/") && path !== "/dreams") {
      console.warn('⚠️ Unhandled Dreams route:', path);
    }
  }, [location.pathname, createdGoal, selectedGoalId, navigate, toast]);

  const getBlueprintInsight = useCallback(() => {
    if (!blueprintData) return t('dreams.blueprintInsight');
    
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
      return t('dreams.blueprintInsight');
    }
    
    return `This journey will be optimized for your ${traits.slice(0, 2).join(' & ')} nature`;
  }, [blueprintData, t]);

  // Debug logging for view changes
  useEffect(() => {
    console.log('🔄 Current view changed:', currentView, { selectedGoalId, createdGoal: !!createdGoal });
  }, [currentView, selectedGoalId, createdGoal]);

  // Removed duplicate authentication logic - trusting ProtectedRoute wrapper

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
    // Pillar I: Removed duplicate toast - unified completion service handles this (Principle #8: Only Add, Never Mask)
    console.log('🎯 Dreams: Task completion notification received from coach:', taskId);
    // Toast is now shown once by use-task-completion hook
  };

  const handleBackFromTaskCoach = async () => {
    console.log('🔙 Dreams: Returning from task coach, refreshing data');
    await refetchJourneyData();
    setSelectedTask(null);
    setCurrentView('journey');
    setSessionRefreshKey(prev => prev + 1);
  };

  const handleBackToSuccessOverview = useCallback(async () => {
    // Navigate back to success landing page (Pillar III: Intentional Craft)
    if (navigationHistory.includes('success') && createdGoal) {
      console.log('🔙 Dreams: Returning to success overview from journey, refreshing data');
      await refetchJourneyData();
      setCurrentView('success');
      setNavigationHistory([]);
      setFocusedMilestone(null);
    }
  }, [navigationHistory, createdGoal, refetchJourneyData]);

  const handleMilestoneClick = (milestone: any) => {
    // Receive and use full milestone object (Principle #6: Respect Critical Data Pathways)
    console.log('🎯 Dreams: Focusing on milestone with full data:', milestone);
    setFocusedMilestone(milestone);
    setActiveTab('tasks');
  };

  const handleTaskClick = (task: Task) => {
    // Receive full task object and navigate to task coach (Principle #7: Build Transparently)
    console.log('📋 Dreams: Navigating to task with full data:', task);
    setSelectedTask(task);
    setCurrentView('task-coach');
  };

  const handleResumeTaskPlan = useCallback((task: Task) => {
    console.log('🔁 Dreams: Resuming plan for task', task.title, '(', task.id, ')');
    if (task.goal_id) {
      setActiveGoalId(task.goal_id);
      localStorage.setItem('activeGoalId', task.goal_id);
    }

    setSelectedTask(task);
    setCurrentView('task-coach');
  }, []);

  const resolveTaskSessionType = useCallback((taskId: string) => getTaskSessionType(taskId), []);

  // Removed duplicate authentication check - component is wrapped in ProtectedRoute

  // Task Coach View - uses task-specific hook
  if (currentView === 'task-coach' && selectedTask) {
    return (
      <MainLayout>
        <div className={`min-h-screen bg-background w-full ${isMobile ? 'pb-20' : ''}`}>
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
        <div className={`min-h-screen flex flex-col bg-background w-full ${isMobile ? 'pb-20' : ''}`}>
          {/* Mobile Optimized Header */}
          <div className={`bg-card/80 border-b border-border sticky top-0 z-10 w-full ${isMobile ? 'px-3 py-2' : 'px-4 py-3'}`}>
            <div className={`flex items-center justify-between w-full max-w-4xl mx-auto`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dreams')}
                className={`flex items-center gap-2 text-muted-foreground hover:text-primary rounded-xl font-ui ${isFoldDevice ? 'px-1 py-1' : 'px-2 py-1'} ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <ArrowLeft className={`h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                {!isFoldDevice && 'Back'}
              </Button>
              <div className="flex items-center gap-2">
                <div className={`bg-primary rounded-full flex items-center justify-center ${isFoldDevice ? 'w-5 h-5' : 'w-6 h-6'}`}>
                  <Heart className={`text-primary-foreground ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                </div>
                <h2 className={`font-heading font-semibold text-foreground ${getTextSize('text-sm')} ${isFoldDevice ? 'hidden' : ''}`}>{t('dreams.creator')}</h2>
              </div>
              <div className={isFoldDevice ? 'w-6' : 'w-16'} />
            </div>
          </div>
          
          <div className={`flex-1 w-full overflow-hidden max-w-4xl mx-auto ${isMobile ? 'px-0' : 'px-4'}`}>
            {/* Show suggestions if in suggestion phase */}
            {conversationPhase === 'suggestion_presentation' && dreamSuggestions.length > 0 && (
              <div className={`bg-card/90 border-b border-border ${spacing.container} py-4`}>
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-4">
                    <h3 className={`font-heading font-semibold text-foreground mb-2 ${getTextSize('text-sm')}`}>
                      {t('dreamSuggestions.dreamsAligned')}
                    </h3>
                    <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>
                      {t('dreamSuggestions.basedOnPersonality')}
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
        <div className={`min-h-screen bg-background w-full ${isMobile ? 'pb-20' : ''}`}>
          <div className={`w-full max-w-4xl mx-auto py-3 ${isMobile ? 'px-3 pb-24' : 'px-6 pb-20'}`}>
            
            {/* Mobile Optimized Header */}
            <div className={`flex items-center justify-between mb-4 w-full ${isFoldDevice ? 'flex-col gap-2' : ''}`}>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => navigate('/dreams')}
                className={`flex items-center gap-2 text-muted-foreground hover:text-primary rounded-xl font-ui ${isFoldDevice ? 'px-1 py-1' : 'px-2 py-1'} ${getTextSize('text-sm')} ${touchTargetSize}`}
              >
                <ArrowLeft className={`h-4 w-4 ${isFoldDevice ? 'h-3 w-3' : ''}`} />
                {isFoldDevice ? '' : t('dreams.newDream')}
              </Button>
              <div className={`text-center ${isFoldDevice ? 'w-full' : 'flex-1'}`}>
                <h1 className={`font-heading font-bold text-foreground ${getTextSize('text-base')}`}>{t('dreams.journey')}</h1>
                {!isFoldDevice && <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>{t("dreams.trackProgress")}</p>}
              </div>
              <div className={isFoldDevice ? 'hidden' : 'w-20'} />
            </div>

            {/* Mobile Responsive Single Card - Updated with consistent 1px border */}
            <div className="bg-card rounded-2xl border border-border overflow-hidden w-full">
              
              {/* Mobile Optimized Tab Navigation */}
              <div className={`border-b border-border bg-card/50 w-full ${isFoldDevice ? 'p-1' : 'p-2'}`}>
                <div className={`w-full ${isFoldDevice ? 'grid grid-cols-2 gap-1' : 'flex gap-2'}`}>
                  <Button
                    variant={activeTab === 'journey' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('journey')}
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize}`}
                  >
                    <MapPin className={`${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                    {isFoldDevice ? 'Map' : 'Journey'}
                  </Button>
                  <Button
                    variant={activeTab === 'tasks' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('tasks')}
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize} ${
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
                        className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize} ${
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
                        className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize} ${
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
                      className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize} ${
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
                      className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize} ${
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
                        <h2 className={`font-heading font-semibold text-card-foreground ${getTextSize('text-sm')}`}>{t('dreams.journeyMap')}</h2>
                        {!isFoldDevice && <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>{getBlueprintInsight()}</p>}
                      </div>
                    </div>
                    
                    <div className="w-full">
                      <EnhancedJourneyMap 
                        onTaskClick={handleTaskClick}
                        onMilestoneClick={handleMilestoneClick}
                        onBackToSuccessOverview={handleBackToSuccessOverview}
                        showSuccessBackButton={navigationHistory.includes('success')}
                      />
                    </div>
                  </div>
                )}

                {activeTab === 'tasks' && (
                  <div className="w-full">
                    <div className={`flex items-center justify-between mb-3 ${isFoldDevice ? 'flex-col items-start gap-1' : ''}`}>
                      <h3 className={`font-heading font-semibold flex items-center gap-2 text-card-foreground ${getTextSize('text-sm')}`}>
                        <Target className={`text-primary ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                        {t('dreams.yourTasks')}
                      </h3>
                    </div>
                    <div className="w-full">
                      <TaskViews
                        focusedMilestone={focusedMilestone}
                        onBackToJourney={() => setActiveTab('journey')}
                        onTaskSelect={handleTaskSelect}
                        getSessionType={resolveTaskSessionType}
                        sessionRefreshKey={sessionRefreshKey}
                      />
                    </div>
                  </div>
                )}
                
                {activeTab === 'focus' && (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className={`text-primary ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h3 className={`font-heading font-semibold text-card-foreground ${getTextSize('text-sm')}`}>{t('dreams.focusSession')}</h3>
                    </div>
                    <div className="w-full">
                      <PomodoroTimer />
                    </div>
                  </div>
                )}
                
                {activeTab === 'habits' && (
                  <div className="w-full">
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className={`text-primary ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                      <h3 className={`font-heading font-semibold text-card-foreground ${getTextSize('text-sm')}`}>{t('dreams.habitsSection')}</h3>
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

  if (currentView === 'success') {
    if (!resolvedGoalToShow) {
      return (
        <MainLayout>
          <div className="text-center p-8">
            <p>Goal not found</p>
            <Button onClick={() => navigate('/dreams')} className="mt-4">
              Back to Dreams
            </Button>
          </div>
        </MainLayout>
      );
    }

    return (
      <MainLayout>
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView(previousView === 'all-goals' ? 'all-goals' : 'hub');
              navigate(previousView === 'all-goals' ? '/dreams/all' : '/dreams');
              setSelectedGoalId(null);
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        </div>

        <DreamSuccessPage
          goal={resolvedGoalToShow}
          onStartTask={handleSuccessTaskStart}
          onViewJourney={handleSuccessViewJourney}
        />
      </MainLayout>
    );
  }

  // Principle #1: Never Break Functionality - Additive only
  // Principle #2: No Hardcoded Data - Uses real goal from database
  if (currentView === 'details' && selectedGoalForDetails) {
    return (
      <MainLayout>
        {/* Show back button ONLY when not in focus mode - Principle #5: Mobile-Responsive */}
        {!focusedMilestoneInDetails && (
          <div className="absolute top-4 left-4 z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBackFromDetails}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span>Back to Dreams</span>
            </Button>
          </div>
        )}
        
        {/* Principle #6: Respect Critical Data Pathways - Render DreamSuccessPage with real data */}
        <DreamSuccessPage
          goal={selectedGoalForDetails}
          focusedMilestone={focusedMilestoneInDetails}
          onMilestoneSelect={(milestone) => {
            console.log('🎯 Setting focused milestone from details:', milestone.title);
            setFocusedMilestoneInDetails(milestone);
          }}
          onExitFocus={() => {
            console.log('🎯 Exiting focus mode in details view');
            setFocusedMilestoneInDetails(null);
          }}
          onStartTask={(task) => {
            console.log('🎯 Starting task from details view:', task);
            handleSuccessTaskStart(task);
          }}
          onViewJourney={() => {
            console.log('🗺️ Viewing journey from details view');
            // Set this goal as active and navigate to journey (Principle #6)
            setActiveGoalId(selectedGoalForDetails.id);
            localStorage.setItem('activeGoalId', selectedGoalForDetails.id);
            setCurrentView('journey');
            navigate('/dreams');
          }}
        />
      </MainLayout>
    );
  }

  if (currentView === 'create') {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className={`min-h-screen bg-background w-full ${isMobile ? 'pb-20' : ''}`}>
            <div className={`w-full max-w-lg mx-auto py-4 px-3 ${isMobile ? 'pb-24' : 'pb-20'}`}>
              {/* Back Navigation Header */}
              <div className={`flex items-center gap-3 mb-4 px-2`}>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setCurrentView('hub');
                    navigate('/dreams');
                  }}
                  className={`flex items-center gap-2 ${touchTargetSize} text-muted-foreground hover:text-foreground transition-colors`}
                >
                  <ArrowLeft className={`${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
                  {!isFoldDevice && <span className={getTextSize('text-sm')}>Back to Dreams</span>}
                </Button>
              </div>

              {/* Enhanced Mobile Optimized Hero Section with Better Title Visibility */}
              <div className={`text-center mb-6 px-2`}>
                <div className={`mx-auto cosmic-bg rounded-full flex items-center justify-center mb-4 ${isFoldDevice ? 'w-12 h-12' : 'w-16 h-16'}`}>
                  <Heart className={`text-primary-foreground ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
                </div>
                <div className="mb-4">
                  <h1 className={`font-heading font-bold mb-2 text-foreground leading-tight ${getTextSize('text-2xl')} ${isFoldDevice ? 'text-xl' : 'text-2xl lg:text-3xl'}`}>
                    {t('dreams.title')}
                  </h1>
                  <div className="w-16 h-1 cosmic-bg rounded-full mx-auto mb-3"></div>
                </div>
                <p className={`text-muted-foreground leading-relaxed mb-4 ${getTextSize('text-sm')} ${isFoldDevice ? 'text-xs' : 'text-sm lg:text-base'}`}>
                  {t('dreams.inspiration')}
                </p>
                <div className={`inline-flex items-center gap-2 bg-primary/10 px-3 py-1 rounded-full`}>
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                  <p className={`text-primary font-medium ${getTextSize('text-xs')} text-center leading-tight`}>{getBlueprintInsight()}</p>
                </div>
              </div>

              {/* Mobile Optimized Dream Creation Form - Updated with consistent 1px border */}
              <div ref={formRef} className={`cosmic-card w-full p-4`}>
                <div className={`space-y-4`}>
                  {/* Dream Input */}
                  <div className="space-y-2">
                    <label className={`font-heading font-semibold text-card-foreground block ${getTextSize('text-sm')}`}>{t("dreams.whatsYourDream")}</label>
                    <Input
                      placeholder={t("dreams.placeholderDream")}
                      value={dreamForm.title}
                      onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                      className={`border-border rounded-xl focus:border-primary focus:ring-primary/20 w-full font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}
                    />
                  </div>

                  {/* Why Input */}
                  <div className="space-y-2">
                    <label className={`font-heading font-semibold text-card-foreground block ${getTextSize('text-sm')}`}>{t("dreams.whyImportant")}</label>
                    <Textarea
                      placeholder={t("dreams.placeholderWhy")}
                      value={dreamForm.description}
                      onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                      className={`border-border rounded-xl focus:border-primary focus:ring-primary/20 resize-none w-full font-ui ${getTextSize('text-sm')} ${isFoldDevice ? 'min-h-[60px]' : 'min-h-[70px]'}`}
                    />
                  </div>

                  {/* Category & Timeline - Stack on mobile */}
                  <div className={`space-y-4`}>
                    <div className="space-y-2">
                      <label className={`font-heading font-semibold text-card-foreground block ${getTextSize('text-sm')}`}>{t("dreams.category")}</label>
                      <Select 
                        value={dreamForm.category} 
                        onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                      >
                        <SelectTrigger className={`border-border rounded-xl focus:border-primary w-full font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="personal_growth" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryPersonal")}</SelectItem>
                          <SelectItem value="career" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryCareer")}</SelectItem>
                          <SelectItem value="health" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryHealth")}</SelectItem>
                          <SelectItem value="relationships" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryRelationships")}</SelectItem>
                          <SelectItem value="creativity" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryCreative")}</SelectItem>
                          <SelectItem value="financial" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categoryFinancial")}</SelectItem>
                          <SelectItem value="spiritual" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.categorySpiritual")}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <label className={`font-heading font-semibold text-card-foreground block ${getTextSize('text-sm')}`}>{t("dreams.timeline")}</label>
                      <Select 
                        value={dreamForm.timeframe} 
                        onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                      >
                        <SelectTrigger className={`border-border rounded-xl focus:border-primary w-full font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-border">
                          <SelectItem value="1 month" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 1 Month"}</SelectItem>
                          <SelectItem value="3 months" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 3 Months"}</SelectItem>
                          <SelectItem value="6 months" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 6 Months"}</SelectItem>
                          <SelectItem value="1 year" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 1 Year"}</SelectItem>
                          <SelectItem value="2 years" className={`rounded-lg font-ui ${getTextSize('text-sm')}`}>{t("goals.targetDate") + " - 2+ Years"}</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Create Button */}
                  <Button 
                    onClick={handleCreateDream}
                    disabled={isCreatingDream || !dreamForm.title.trim()}
                    className={`w-full cosmic-bg hover:shadow-lg text-primary-foreground py-4 rounded-xl font-semibold transition-all duration-300 disabled:opacity-50 font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}
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
                  <p className={`text-muted-foreground mb-3 ${getTextSize('text-xs')}`}>
                    {t('dreams.altGuide')}
                  </p>
                </div>
                
                <Button 
                  onClick={() => { handleStartAIGuidance(); navigate('/dreams/discover'); }}
                  variant="outline"
                  className={`w-full border-2 border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary py-4 rounded-xl font-medium transition-all duration-300 font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}
                >
                  <Heart className={`mr-2 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                  Start Heart-Centered Discovery
                </Button>
                
                <Button 
                  onClick={() => navigate('/dreams/journey')}
                  variant="outline"
                  className={`w-full border-2 border-border bg-accent hover:bg-accent-foreground/10 text-accent-foreground py-4 rounded-xl font-medium transition-all duration-300 font-ui ${getTextSize('text-sm')} ${touchTargetSize}`}
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
  }

  // All Goals View
  if (currentView === 'all-goals') {
    return (
      <MainLayout>
        <div className="absolute top-4 left-4 z-10">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setCurrentView('hub');
              navigate('/dreams');
            }}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Dreams</span>
          </Button>
        </div>
        
        <div className={`min-h-screen bg-background w-full ${isMobile ? 'pb-20' : ''} pt-16`}>
          <AllDreamsList
            onSelectGoal={handleSelectGoal}
            onViewDetails={handleViewGoalDetails}
            onCreateNew={() => navigate('/dreams/create')}
            onResumeTaskPlan={handleResumeTaskPlan}
            sessionRefreshKey={sessionRefreshKey}
          />
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        <div className={`min-h-screen bg-background w-full ${isMobile ? 'pb-20' : ''}`}>
          {/* NEW: My Dreams Overview Section - Principle #8: Only Add */}
          <div className="w-full max-w-5xl mx-auto px-3 pt-4 pb-6">
            <DreamsOverview
              onSelectGoal={handleSelectGoal}
              onCreateNew={() => navigate('/dreams/create')}
              onViewDetails={handleViewGoalDetails}
              onViewAllGoals={handleViewAllGoals}
              onResumeTaskPlan={handleResumeTaskPlan}
              sessionRefreshKey={sessionRefreshKey}
            />
          </div>

          {/* Dream mode starting hub */}
          <div className="w-full max-w-5xl mx-auto px-3 pt-4 pb-2 border-t border-border">
            {isMobile ? (
              <HomeMenuGrid
                items={[
                  {
                    key: 'discover',
                    title: t('dreams.cards.discoverYourDream.title'),
                    description: t('dreams.cards.discoverYourDream.description'),
                    Icon: MessageCircle,
                    image: '/assets/home/companion.jpg',
                    to: "/dreams/discover",
                  },
                  {
                    key: 'create',
                    title: t('dreams.cards.createDecompose.title'),
                    description: t('dreams.cards.createDecompose.description'),
                    Icon: Target,
                    image: '/assets/home/dreams.jpg',
                    to: "/dreams/create",
                  },
                  {
                    key: 'journey',
                    title: t('dreams.cards.journeyMap.title'),
                    description: t('dreams.cards.journeyMap.description'),
                    Icon: MapPin,
                    image: '/assets/home/growth.jpg',
                    to: "/dreams/journey",
                  },
                  {
                    key: 'tasks',
                    title: t('dreams.cards.yourTasks.title'),
                    description: t('dreams.cards.yourTasks.description'),
                    Icon: Target,
                    image: '/assets/home/tasks.jpg',
                    to: "/dreams/tasks",
                  }
                ]}
                className="mb-6"
              />
            ) : (
              <DreamMenuGrid
                items={[
                  {
                    key: 'discover',
                    title: t('dreams.cards.discoverYourDream.title'),
                    description: t('dreams.cards.discoverYourDream.description'),
                    Icon: MessageCircle,
                    image: '/assets/home/companion.jpg',
                    to: "/dreams/discover",
                  },
                  {
                    key: 'suggestions',
                    title: t('dreams.cards.blueprintSuggestions.title'),
                    description: t('dreams.cards.blueprintSuggestions.description'),
                    Icon: Sparkles,
                    image: '/assets/home/blueprint.jpg',
                    to: "/dreams/discover",
                  },
                  {
                    key: 'create',
                    title: t('dreams.cards.createDecompose.title'),
                    description: t('dreams.cards.createDecompose.description'),
                    Icon: Target,
                    image: '/assets/home/dreams.jpg',
                    to: "/dreams/create",
                  },
                  {
                    key: 'journey',
                    title: t('dreams.cards.journeyMap.title'),
                    description: t('dreams.cards.journeyMap.description'),
                    Icon: MapPin,
                    image: '/assets/home/growth.jpg',
                    to: "/dreams/journey",
                  },
                  {
                    key: 'tasks',
                    title: t('dreams.cards.yourTasks.title'),
                    description: t('dreams.cards.yourTasks.description'),
                    Icon: Target,
                    image: '/assets/home/tasks.jpg',
                    to: "/dreams/tasks",
                  },
                  {
                    key: 'focus',
                    title: t('dreams.cards.focusSession.title'),
                    description: t('dreams.cards.focusSession.description'),
                    Icon: Clock,
                    image: '/assets/home/dashboard.jpg',
                    to: "/dreams/focus",
                  },
                  {
                    key: 'habits',
                    title: t('dreams.cards.habits.title'),
                    description: t('dreams.cards.habits.description'),
                    Icon: CheckCircle,
                    image: '/assets/home/growth.jpg',
                    to: "/dreams/habits",
                  },
                  {
                    key: 'success',
                    title: t('dreams.cards.successView.title'),
                    description: t('dreams.cards.successView.description'),
                    Icon: Sparkles,
                    image: '/assets/home/dreams.jpg',
                    onClick: () => {
                      setCurrentView('all-goals');
                      navigate('/dreams/all');
                    }
                  }
                ]}
                className="mb-6"
              />
            )}
          </div>
          </div>
      </ErrorBoundary>
    </MainLayout>
  );
};

export default Dreams;
