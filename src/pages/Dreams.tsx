import React, { useState, useMemo, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
import BlueprintViewer from "@/components/blueprint/BlueprintViewer";
import EnhancedBlueprintViewer from "@/components/blueprint/EnhancedBlueprintViewer";
import BlueprintEditor from "@/components/blueprint/BlueprintEditor";
import { BlueprintHealthCheck } from "@/components/blueprint/BlueprintHealthCheck";
import { Button } from "@/components/ui/button";
import { Loader2, MessageCircle, RefreshCw, ToggleLeft, ToggleRight, Activity } from "lucide-react";
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
import { Heart, Target, Sparkles, MapPin, Calendar, Zap, Brain, Clock, CheckCircle } from "lucide-react";
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { enhancedGoalDecompositionService } from "@/services/enhanced-goal-decomposition-service";
import { JourneyMap } from "@/components/journey/JourneyMap";
import { EnhancedJourneyMap } from "@/components/journey/EnhancedJourneyMap";
import { TaskViews } from "@/components/journey/TaskViews";
import { TaskCoachInterface } from "@/components/task/TaskCoachInterface";
import { PomodoroTimer } from "@/components/productivity/PomodoroTimer";
import { HabitTracker } from "@/components/productivity/HabitTracker";

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
  const [currentView, setCurrentView] = useState<'create' | 'chat' | 'journey' | 'task-coach'>('create');
  const [taskView, setTaskView] = useState<'none' | 'tasks' | 'focus' | 'habits'>('none');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isCreatingDream, setIsCreatingDream] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { blueprintData } = useBlueprintData();

  // Dream creation form state
  const [dreamForm, setDreamForm] = useState({
    title: '',
    description: '',
    category: 'personal_growth',
    timeframe: '3 months'
  });

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Set agent to coach for this page
  useEffect(() => {
    if (currentAgent !== "coach") {
      switchAgent("coach");
    }
  }, [currentAgent, switchAgent]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleCreateDream = async () => {
    if (!dreamForm.title.trim()) {
      toast({
        title: "Dream Required",
        description: "Please enter your dream or goal",
        variant: "destructive"
      });
      return;
    }

    setIsCreatingDream(true);

    try {
      console.log('Starting dream creation with form:', dreamForm);
      
      // Create goal using blueprint-aligned decomposition
      const goal = await enhancedGoalDecompositionService.decomposeGoal(
        dreamForm.title,
        dreamForm.timeframe,
        dreamForm.category,
        blueprintData || {}
      );

      console.log('Goal decomposed successfully:', goal);

      // Save to productivity journey
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving goal for user:', user.id);

      // Convert Goal to a plain object with properly serialized nested arrays
      const goalAsJson = {
        id: goal.id,
        title: goal.title,
        description: goal.description,
        category: goal.category,
        timeframe: goal.timeframe,
        target_completion: goal.target_completion,
        created_at: goal.created_at,
        milestones: (goal.milestones || []).map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          target_date: milestone.target_date,
          completed: milestone.completed || false,
          completion_criteria: milestone.completion_criteria || []
        })),
        tasks: (goal.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed || false,
          estimated_duration: task.estimated_duration,
          energy_level_required: task.energy_level_required,
          category: task.category
        })),
        blueprint_alignment: goal.blueprint_alignment || []
      };
      
      const { error } = await supabase
        .from('productivity_journey')
        .upsert({
          user_id: user.id,
          current_goals: [goalAsJson],
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'user_id'
        });

      if (error) {
        console.error('Supabase error saving goal:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('Goal saved successfully to database');

      // Show success and switch to journey view
      toast({
        title: "🎯 Dream Journey Created!",
        description: "Your personalized roadmap is ready. Let's begin!",
      });

      // Reset form
      setDreamForm({
        title: '',
        description: '',
        category: 'personal_growth',
        timeframe: '3 months'
      });

      setCurrentView('journey');
    } catch (error) {
      console.error('Error creating dream:', error);
      toast({
        title: "Creation Error",
        description: error instanceof Error ? error.message : "Failed to create your dream journey. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsCreatingDream(false);
    }
  };

  const handleStartAIGuidance = () => {
    sendMessage("I want to start my dream journey. Help me define my biggest goal and create a personalized action plan based on my soul blueprint.");
    setCurrentView('chat');
  };

  const getBlueprintInsight = () => {
    if (!blueprintData) return "Your journey will be personalized once your blueprint is complete";
    
    const traits = [];
    if (blueprintData.cognition_mbti?.type) traits.push(blueprintData.cognition_mbti.type);
    if (blueprintData.energy_strategy_human_design?.type) traits.push(blueprintData.energy_strategy_human_design.type);
    if (blueprintData.values_life_path?.lifePathNumber) traits.push(`Life Path ${blueprintData.values_life_path.lifePathNumber}`);
    
    return `This journey will be optimized for your ${traits.slice(0, 2).join(' & ')} nature`;
  };

  // New task selection handler
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
    setTaskView('tasks');
  };

  const handleTaskClick = (taskId: string) => {
    // Focus on specific task - for now just switch to task view
    setTaskView('tasks');
  };

  const handleBackToJourney = () => {
    setTaskView('none');
    setFocusedMilestone(null);
  };

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center p-4">
          <CosmicCard className="p-8 text-center max-w-sm w-full">
            <Heart className="h-12 w-12 text-soul-purple mx-auto mb-6" />
            <h1 className="text-2xl font-bold font-display mb-4">
              <span className="text-soul-purple">Dream Achievement</span>
            </h1>
            <p className="mb-8 text-muted-foreground">Sign in to start your personalized journey to your dreams</p>
            <Button 
              className="w-full bg-soul-purple hover:bg-soul-purple/90"
              onClick={() => window.location.href = '/auth'}
            >
              {t('nav.signIn')}
            </Button>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  // Task Coach View
  if (currentView === 'task-coach' && selectedTask) {
    return (
      <MainLayout>
        <div className="h-screen">
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
        <div className="h-screen flex flex-col">
          <div className="bg-background border-b border-border p-4">
            <div className="flex items-center justify-between max-w-md mx-auto">
              <div className="flex items-center">
                <Heart className="h-5 w-5 text-soul-purple mr-2" />
                <h2 className="text-lg font-semibold">Dream Guide</h2>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className="text-sm"
              >
                Back
              </Button>
            </div>
          </div>
          
          <div className="flex-1 max-w-md mx-auto w-full p-4">
            <CoachInterface
              messages={messages}
              isLoading={isLoading}
              onSendMessage={sendMessage}
              messagesEndRef={messagesEndRef}
            />
          </div>
        </div>
      </MainLayout>
    );
  }

  if (currentView === 'journey') {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-background">
          <div className="max-w-6xl mx-auto px-4 py-6">
            
            {/* Strategic Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentView('create')}
                  className="flex items-center gap-2"
                >
                  ← New Dream
                </Button>
                <h1 className="text-2xl font-bold font-display">Strategic Command Center</h1>
              </div>
              
              {/* Quick Actions */}
              <div className="flex gap-2">
                <Button
                  variant={taskView === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'tasks' ? 'none' : 'tasks')}
                  className="flex items-center gap-2"
                >
                  <Target className="h-4 w-4" />
                  Tasks
                </Button>
                <Button
                  variant={taskView === 'focus' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'focus' ? 'none' : 'focus')}
                  className="flex items-center gap-2"
                >
                  <Clock className="h-4 w-4" />
                  Focus
                </Button>
                <Button
                  variant={taskView === 'habits' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'habits' ? 'none' : 'habits')}
                  className="flex items-center gap-2"
                >
                  <CheckCircle className="h-4 w-4" />
                  Habits
                </Button>
              </div>
            </div>

            {/* Main Layout: Journey Map + Optional Task View */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Journey Map - Always Visible (Helicopter View) */}
              <div className={`${taskView === 'none' ? 'xl:col-span-3' : 'xl:col-span-2'} transition-all duration-300`}>
                <CosmicCard className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-soul-purple" />
                      <h2 className="text-xl font-semibold">Journey Command Map</h2>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {getBlueprintInsight()}
                    </div>
                  </div>
                  
                  <EnhancedJourneyMap 
                    onTaskClick={handleTaskClick}
                    onMilestoneClick={handleMilestoneClick}
                  />
                </CosmicCard>
              </div>

              {/* Dynamic Task Management Panel */}
              {taskView !== 'none' && (
                <div className="xl:col-span-1 transition-all duration-300">
                  <CosmicCard className="p-6 h-fit">
                    {taskView === 'tasks' && (
                      <TaskViews 
                        focusedMilestone={focusedMilestone}
                        onBackToJourney={handleBackToJourney}
                        onTaskSelect={handleTaskSelect}
                      />
                    )}
                    
                    {taskView === 'focus' && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <Clock className="h-5 w-5" />
                            Focus Session
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setTaskView('none')}
                          >
                            ×
                          </Button>
                        </div>
                        <PomodoroTimer />
                      </div>
                    )}
                    
                    {taskView === 'habits' && (
                      <div>
                        <div className="flex items-center justify-between mb-4">
                          <h3 className="font-semibold flex items-center gap-2">
                            <CheckCircle className="h-5 w-5" />
                            Daily Habits
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setTaskView('none')}
                          >
                            ×
                          </Button>
                        </div>
                        <HabitTracker />
                      </div>
                    )}
                  </CosmicCard>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create Dream View (default)
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-b from-soul-purple/5 to-background">
        <div className="max-w-md mx-auto px-4 py-8">
          
          {/* Hero Section - Above the fold */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto bg-gradient-to-br from-soul-purple/20 to-soul-purple/10 rounded-full flex items-center justify-center mb-6">
              <Target className="h-10 w-10 text-soul-purple" />
            </div>
            <h1 className="text-3xl font-bold font-display mb-3">Create Your Dream</h1>
            <p className="text-muted-foreground text-lg leading-relaxed mb-2">
              Turn your biggest aspiration into a personalized roadmap
            </p>
            <p className="text-sm text-soul-purple">{getBlueprintInsight()}</p>
          </div>

          {/* Dream Creation Form */}
          <CosmicCard className="p-6 mb-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-2 block">What's your dream or goal?</label>
                <Input
                  placeholder="e.g., Launch my creative business, Get fit and healthy..."
                  value={dreamForm.title}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-base"
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Why is this important to you?</label>
                <Textarea
                  placeholder="Share what drives this dream..."
                  value={dreamForm.description}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-base min-h-[80px]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Category</label>
                  <Select 
                    value={dreamForm.category} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="personal_growth">Personal Growth</SelectItem>
                      <SelectItem value="career">Career</SelectItem>
                      <SelectItem value="health">Health & Fitness</SelectItem>
                      <SelectItem value="relationships">Relationships</SelectItem>
                      <SelectItem value="creativity">Creativity</SelectItem>
                      <SelectItem value="financial">Financial</SelectItem>
                      <SelectItem value="spiritual">Spiritual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Timeframe</label>
                  <Select 
                    value={dreamForm.timeframe} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1 month">1 Month</SelectItem>
                      <SelectItem value="3 months">3 Months</SelectItem>
                      <SelectItem value="6 months">6 Months</SelectItem>
                      <SelectItem value="1 year">1 Year</SelectItem>
                      <SelectItem value="2 years">2+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Button */}
              <Button 
                onClick={handleCreateDream}
                disabled={isCreatingDream}
                className="w-full bg-soul-purple hover:bg-soul-purple/90 text-white text-lg py-6 rounded-xl font-semibold mt-6"
              >
                {isCreatingDream ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-pulse" />
                    Creating Your Journey...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create My Dream Journey
                  </>
                )}
              </Button>
            </div>
          </CosmicCard>

          {/* Alternative Options */}
          <div className="space-y-3">
            <div className="text-center text-sm text-muted-foreground mb-4">
              Or explore other ways to start:
            </div>
            
            <Button
              variant="outline"
              onClick={handleStartAIGuidance}
              className="w-full justify-start text-left p-4 h-auto border-soul-purple/30 hover:bg-soul-purple/5"
            >
              <div className="flex items-center">
                <Zap className="h-5 w-5 mr-3 text-soul-purple" />
                <div>
                  <div className="font-medium">Talk with AI Dream Guide</div>
                  <div className="text-sm text-muted-foreground">Explore your dreams through conversation</div>
                </div>
              </div>
            </Button>

            <Button
              variant="outline"
              onClick={() => setCurrentView('journey')}
              className="w-full justify-start text-left p-4 h-auto border-soul-purple/30 hover:bg-soul-purple/5"
            >
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-3 text-soul-purple" />
                <div>
                  <div className="font-medium">View Existing Journey</div>
                  <div className="text-sm text-muted-foreground">Continue your current dream path</div>
                </div>
              </div>
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dreams;
