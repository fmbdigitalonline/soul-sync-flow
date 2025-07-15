import React, { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
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

// Create sub-page components
const DreamsCreate = () => {
  const navigate = useNavigate();
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
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const [createdGoal, setCreatedGoal] = useState<any>(null);
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
    navigate('/dreams/decomposing');
    setCreatedGoal(null);
  }, [dreamForm.title, toast, navigate]);

  const handleStartAIGuidance = useCallback(() => {
    resetDreamConversation();
    sendDreamMessage("I'm ready to explore my dreams with you. Help me discover what truly lights up my soul and what I'm meant to create in this world.");
    navigate('/dreams/chat');
  }, [sendDreamMessage, resetDreamConversation, navigate]);

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

  return (
    <div className={`min-h-screen bg-white w-full ${isMobile ? 'pb-20' : ''}`}>
      <div className={`w-full max-w-4xl mx-auto py-8 ${isMobile ? 'px-3 pb-24' : 'px-6 pb-20'}`}>
        {/* Header */}
        <div className={`text-center mb-8 ${spacing.container}`}>
          <div className={`w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-primary via-soul-purple to-soul-teal rounded-full flex items-center justify-center ${isFoldDevice ? 'w-12 h-12' : ''}`}>
            <Heart className={`text-white ${isFoldDevice ? 'h-4 w-4' : 'h-6 w-6'}`} />
          </div>
          <h1 className={`font-heading font-bold text-foreground mb-3 ${getTextSize('text-xl')}`}>
            {t("dreams.createTitle")}
          </h1>
          <p className={`text-muted-foreground leading-relaxed max-w-2xl mx-auto ${getTextSize('text-sm')}`}>
            {t("dreams.createDescription")}
          </p>
          <div className={`mt-4 p-3 bg-card/50 rounded-xl border border-border/50 ${spacing.container}`}>
            <p className={`text-muted-foreground font-medium ${getTextSize('text-xs')}`}>
              {getBlueprintInsight()}
            </p>
          </div>
        </div>

        {/* Action Cards Grid */}
        <div className={`grid gap-4 max-w-2xl mx-auto ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {/* Quick Dream Creation */}
          <CosmicCard className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${spacing.card}`}>
            <div className={`text-center space-y-4`}>
              <div className={`w-12 h-12 mx-auto bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isFoldDevice ? 'w-8 h-8' : ''}`}>
                <Plus className={`text-white ${isFoldDevice ? 'h-3 w-3' : 'h-5 w-5'}`} />
              </div>
              <div>
                <h3 className={`font-heading font-semibold text-foreground mb-2 ${getTextSize('text-base')}`}>
                  {t("dreams.quickCreate")}
                </h3>
                <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
                  {t("dreams.quickCreateDescription")}
                </p>
              </div>
              
              {/* Quick Form */}
              <div className="space-y-3 text-left">
                <Input
                  placeholder={t("dreams.dreamPlaceholder")}
                  value={dreamForm.title}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                  className={`${getTextSize('text-sm')}`}
                />
                <Textarea
                  placeholder={t("dreams.descriptionPlaceholder")}
                  value={dreamForm.description}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                  className={`resize-none ${getTextSize('text-sm')}`}
                  rows={3}
                />
                
                <div className="grid grid-cols-2 gap-2">
                  <Select value={dreamForm.category} onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger className={getTextSize('text-sm')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_growth">{t("dreams.categories.personalGrowth")}</SelectItem>
                      <SelectItem value="career">{t("dreams.categories.career")}</SelectItem>
                      <SelectItem value="relationships">{t("dreams.categories.relationships")}</SelectItem>
                      <SelectItem value="health">{t("dreams.categories.health")}</SelectItem>
                      <SelectItem value="creativity">{t("dreams.categories.creativity")}</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  <Select value={dreamForm.timeframe} onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}>
                    <SelectTrigger className={getTextSize('text-sm')}>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">{t("dreams.timeframes.oneMonth")}</SelectItem>
                      <SelectItem value="3 months">{t("dreams.timeframes.threeMonths")}</SelectItem>
                      <SelectItem value="6 months">{t("dreams.timeframes.sixMonths")}</SelectItem>
                      <SelectItem value="1 year">{t("dreams.timeframes.oneYear")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  onClick={handleCreateDream}
                  disabled={!dreamForm.title.trim() || isCreatingDream}
                  className={`w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-xl font-medium font-ui ${touchTargetSize} ${getTextSize('text-sm')}`}
                >
                  {isCreatingDream ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      {t("dreams.creating")}
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("dreams.createDream")}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CosmicCard>

          {/* AI-Guided Discovery */}
          <CosmicCard className={`p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group ${spacing.card}`} onClick={handleStartAIGuidance}>
            <div className="text-center space-y-4">
              <div className={`w-12 h-12 mx-auto bg-gradient-to-br from-soul-teal to-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform ${isFoldDevice ? 'w-8 h-8' : ''}`}>
                <MessageCircle className={`text-white ${isFoldDevice ? 'h-3 w-3' : 'h-5 w-5'}`} />
              </div>
              <div>
                <h3 className={`font-heading font-semibold text-foreground mb-2 ${getTextSize('text-base')}`}>
                  {t("dreams.aiGuidance")}
                </h3>
                <p className={`text-muted-foreground ${getTextSize('text-sm')}`}>
                  {t("dreams.aiGuidanceDescription")}
                </p>
              </div>
              <Button 
                variant="outline"
                className={`w-full border-gradient hover:shadow-lg transition-all duration-300 rounded-xl font-medium font-ui ${touchTargetSize} ${getTextSize('text-sm')}`}
              >
                <Brain className="mr-2 h-4 w-4" />
                {t("dreams.startDiscovery")}
              </Button>
            </div>
          </CosmicCard>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 flex justify-center">
          <Button
            variant="ghost"
            onClick={() => navigate('/dreams/journey')}
            className={`text-muted-foreground hover:text-primary ${getTextSize('text-sm')}`}
          >
            <Target className="mr-2 h-4 w-4" />
            {t("dreams.viewExistingDreams")}
          </Button>
        </div>
      </div>
    </div>
  );
};

const DreamsChat = () => {
  const navigate = useNavigate();
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
  const [dreamForm, setDreamForm] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { spacing, layout, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow, isMobile } = useResponsiveLayout();

  const handleDiscoveryComplete = useCallback(() => {
    if (isReadyForDecomposition && intakeData) {
      setDreamForm({
        title: intakeData.title,
        description: intakeData.description || '',
        category: intakeData.category,
        timeframe: intakeData.timeframe
      });
      
      navigate('/dreams/decomposing');
      setIsCreatingDream(true);
    }
  }, [isReadyForDecomposition, intakeData, navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [dreamMessages]);

  return (
    <div className={`min-h-screen flex flex-col bg-white w-full ${isMobile ? 'pb-20' : ''}`}>
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
            <h2 className={`font-heading font-semibold text-foreground ${getTextSize('text-sm')} ${isFoldDevice ? 'hidden' : ''}`}>Dreams & Goals Discovery</h2>
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
                  Dreams Aligned with Your Blueprint
                </h3>
                <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>
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
  );
};

const DreamsJourney = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'journey' | 'tasks' | 'focus' | 'habits'>('journey');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { spacing, layout, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow, isMobile } = useResponsiveLayout();

  const handleTaskSelect = (task: Task) => {
    setSelectedTask(task);
    navigate('/dreams/task-coach');
  };

  const handleTaskComplete = async (taskId: string) => {
    toast({
      title: "🎉 Task Completed!",
      description: "Great work! The task has been marked as complete.",
    });
  };

  return (
    <div className={`min-h-screen bg-white w-full ${isMobile ? 'pb-20' : ''}`}>
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
            {isFoldDevice ? '' : 'New Dream'}
          </Button>
          <div className={`text-center ${isFoldDevice ? 'w-full' : 'flex-1'}`}>
            <h1 className={`font-heading font-bold text-foreground ${getTextSize('text-base')}`}>Your Dreams & Goals Journey</h1>
            {!isFoldDevice && <p className={`text-muted-foreground ${getTextSize('text-xs')}`}>{t("dreams.trackProgress")}</p>}
          </div>
          <div className={isFoldDevice ? 'hidden' : 'w-20'} />
        </div>

        {/* Mobile Responsive Single Card */}
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
                className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize}`}
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
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize}`}
                  >
                    <Brain className="h-3 w-3" />
                    Focus
                  </Button>
                  <Button
                    variant={activeTab === 'habits' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setActiveTab('habits')}
                    className={`flex items-center gap-1 rounded-lg flex-1 px-2 py-2 font-medium transition-all font-ui ${getTextSize('text-xs')} ${touchTargetSize}`}
                  >
                    <CheckCircle className="h-3 w-3" />
                    Habits
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* Tab Content */}
          <div className={`${spacing.container} p-4 min-h-[400px]`}>
            {activeTab === 'journey' && (
              <div className="space-y-4">
                <EnhancedJourneyMap onTaskClick={(taskId: string) => {
                  // Convert taskId to Task object - you might need to implement this properly
                  const mockTask: Task = {
                    id: taskId,
                    title: 'Task Title',
                    status: 'todo',
                    estimated_duration: '30 min',
                    energy_level_required: 'medium',
                    category: 'general',
                    optimal_time_of_day: ['morning']
                  };
                  handleTaskSelect(mockTask);
                }} />
              </div>
            )}

            {activeTab === 'tasks' && (
              <div className="space-y-4">
                <TaskViews 
                  onTaskSelect={handleTaskSelect} 
                  onBackToJourney={() => navigate('/dreams/journey')}
                />
              </div>
            )}

            {activeTab === 'focus' && (
              <div className="space-y-4">
                <PomodoroTimer />
              </div>
            )}

            {activeTab === 'habits' && (
              <div className="space-y-4">
                <HabitTracker />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const DreamsTaskCoach = () => {
  const navigate = useNavigate();
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const { toast } = useToast();
  const { isMobile } = useIsMobile();

  const handleTaskComplete = async (taskId: string) => {
    toast({
      title: "🎉 Task Completed!",
      description: "Great work! The task has been marked as complete.",
    });
  };

  const handleBackFromTaskCoach = () => {
    setSelectedTask(null);
    navigate('/dreams/journey');
  };

  return (
    <div className={`min-h-screen bg-white w-full ${isMobile ? 'pb-20' : ''}`}>
      <TaskCoachInterface
        task={selectedTask}
        onBack={handleBackFromTaskCoach}
        onTaskComplete={handleTaskComplete}
      />
    </div>
  );
};

const DreamsDecomposing = () => {
  const navigate = useNavigate();
  const [dreamForm] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });
  const [createdGoal, setCreatedGoal] = useState<any>(null);

  const handleDecompositionComplete = useCallback((decomposedGoal: any) => {
    setCreatedGoal(decomposedGoal);
    navigate('/dreams/success');
  }, [navigate]);

  return (
    <DreamDecompositionPage
      dreamTitle={dreamForm.title}
      dreamDescription={dreamForm.description}
      dreamCategory={dreamForm.category}
      dreamTimeframe={dreamForm.timeframe}
      onComplete={handleDecompositionComplete}
    />
  );
};

const DreamsSuccess = () => {
  const navigate = useNavigate();
  const [createdGoal] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  const handleSuccessTaskStart = useCallback((task: any) => {
    setSelectedTask(task);
    navigate('/dreams/task-coach');
  }, [navigate]);

  const handleSuccessViewJourney = useCallback(() => {
    navigate('/dreams/journey');
  }, [navigate]);

  return (
    <DreamSuccessPage
      goal={createdGoal}
      onStartTask={handleSuccessTaskStart}
      onViewJourney={handleSuccessViewJourney}
    />
  );
};

const Dreams = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const { isMobile } = useIsMobile();

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

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <ErrorBoundary>
          <div className={`min-h-screen bg-white flex items-center justify-center p-3 ${isMobile ? 'pb-20' : ''}`}>
            <div className={`bg-card rounded-2xl border border-border text-center w-full max-w-sm mx-auto p-6`}>
              <div className={`w-10 h-10 mx-auto bg-primary rounded-full mb-4 flex items-center justify-center`}>
                <Heart className={`h-5 w-5 text-primary-foreground`} />
              </div>
              <h1 className={`font-heading font-bold mb-3 text-foreground text-lg`}>
                Dreams & Goals
              </h1>
              <p className={`mb-6 text-muted-foreground leading-relaxed px-2 text-sm`}>{"Transform your aspirations into achievable milestones"}</p>
              <Button 
                className={`w-full hover:shadow-lg transition-all duration-300 rounded-2xl font-medium font-ui text-sm`}
                onClick={() => window.location.href = '/auth'}
              >
                {"Get Started"}
              </Button>
            </div>
          </div>
        </ErrorBoundary>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ErrorBoundary>
        <Routes>
          <Route index element={<DreamsCreate />} />
          <Route path="chat" element={<DreamsChat />} />
          <Route path="journey" element={<DreamsJourney />} />
          <Route path="task-coach" element={<DreamsTaskCoach />} />
          <Route path="decomposing" element={<DreamsDecomposing />} />
          <Route path="success" element={<DreamsSuccess />} />
        </Routes>
      </ErrorBoundary>
    </MainLayout>
  );
};

export default Dreams;