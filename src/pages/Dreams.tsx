import React, { useState, useMemo, useEffect, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MainLayout from "@/components/Layout/MainLayout";
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
      console.log('Starting AI-powered dream creation with form:', dreamForm);
      
      // Create goal using AI-powered blueprint-aligned decomposition
      const aiGoal = await aiGoalDecompositionService.decomposeGoalWithAI(
        dreamForm.title,
        dreamForm.description,
        dreamForm.timeframe,
        dreamForm.category,
        blueprintData || {}
      );

      console.log('AI goal decomposed successfully:', aiGoal);

      // Save to productivity journey
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      console.log('Saving AI-generated goal for user:', user.id);

      // Convert AI Goal to database format
      const goalAsJson = {
        id: aiGoal.id,
        title: aiGoal.title,
        description: aiGoal.description,
        category: aiGoal.category,
        timeframe: aiGoal.timeframe,
        target_completion: aiGoal.target_completion,
        created_at: aiGoal.created_at,
        milestones: (aiGoal.milestones || []).map(milestone => ({
          id: milestone.id,
          title: milestone.title,
          description: milestone.description,
          target_date: milestone.target_date,
          completed: milestone.completed || false,
          completion_criteria: milestone.completion_criteria || [],
          blueprint_alignment: milestone.blueprint_alignment
        })),
        tasks: (aiGoal.tasks || []).map(task => ({
          id: task.id,
          title: task.title,
          description: task.description,
          completed: task.completed || false,
          estimated_duration: task.estimated_duration,
          energy_level_required: task.energy_level_required,
          category: task.category,
          optimal_timing: task.optimal_timing,
          blueprint_reasoning: task.blueprint_reasoning
        })),
        blueprint_insights: aiGoal.blueprint_insights || [],
        personalization_notes: aiGoal.personalization_notes
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
        console.error('Supabase error saving AI goal:', error);
        throw new Error(`Database error: ${error.message}`);
      }

      console.log('AI-generated goal saved successfully to database');

      // Show success and switch to journey view
      toast({
        title: "🎯 AI Dream Journey Created!",
        description: "Your personalized roadmap has been created using your unique blueprint!",
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
      console.error('Error creating AI dream:', error);
      toast({
        title: "Creation Error",
        description: error instanceof Error ? error.message : "Failed to create your AI dream journey. Please try again.",
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
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full mx-auto mb-6 flex items-center justify-center">
              <Heart className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
              Dreams & Goals
            </h1>
            <p className="mb-8 text-gray-600 leading-relaxed">Transform your biggest dreams into achievable milestones with AI-powered guidance</p>
            <Button 
              className="w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-lg transition-all duration-300 rounded-2xl h-12 text-white font-medium"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Task Coach View
  if (currentView === 'task-coach' && selectedTask) {
    return (
      <MainLayout>
        <div className="h-screen bg-gradient-to-br from-soul-purple/5 to-soul-teal/5">
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
        <div className="h-screen flex flex-col bg-gradient-to-br from-soul-purple/5 to-white">
          {/* Modern Header */}
          <div className="bg-white/80 backdrop-blur-lg border-b border-gray-100 p-4 sticky top-0 z-10">
            <div className="flex items-center justify-between max-w-lg mx-auto">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setCurrentView('create')}
                className="flex items-center gap-2 text-gray-600 hover:text-soul-purple rounded-xl"
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center">
                  <Brain className="h-4 w-4 text-white" />
                </div>
                <h2 className="font-semibold text-gray-800">AI Dream Coach</h2>
              </div>
              <div className="w-16" /> {/* Spacer for centering */}
            </div>
          </div>
          
          <div className="flex-1 max-w-lg mx-auto w-full p-4">
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
        <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5">
          <div className="max-w-7xl mx-auto px-4 py-6">
            
            {/* Modern Header */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setCurrentView('create')}
                  className="flex items-center gap-2 text-gray-600 hover:text-soul-purple rounded-xl px-3 py-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  New Dream
                </Button>
                <div>
                  <h1 className="text-2xl font-bold text-gray-800">Your Journey</h1>
                  <p className="text-sm text-gray-500">Track progress and stay focused</p>
                </div>
              </div>
              
              {/* Action Pills */}
              <div className="flex gap-2">
                <Button
                  variant={taskView === 'tasks' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'tasks' ? 'none' : 'tasks')}
                  className="flex items-center gap-2 rounded-xl border-gray-200 hover:border-soul-purple/50"
                >
                  <Target className="h-4 w-4" />
                  Tasks
                </Button>
                <Button
                  variant={taskView === 'focus' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'focus' ? 'none' : 'focus')}
                  className="flex items-center gap-2 rounded-xl border-gray-200 hover:border-soul-purple/50"
                >
                  <Clock className="h-4 w-4" />
                  Focus
                </Button>
                <Button
                  variant={taskView === 'habits' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setTaskView(taskView === 'habits' ? 'none' : 'habits')}
                  className="flex items-center gap-2 rounded-xl border-gray-200 hover:border-soul-purple/50"
                >
                  <CheckCircle className="h-4 w-4" />
                  Habits
                </Button>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              
              {/* Journey Map */}
              <div className={`${taskView === 'none' ? 'xl:col-span-3' : 'xl:col-span-2'} transition-all duration-300`}>
                <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/20">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center">
                        <MapPin className="h-5 w-5 text-white" />
                      </div>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-800">Journey Map</h2>
                        <p className="text-sm text-gray-500">{getBlueprintInsight()}</p>
                      </div>
                    </div>
                  </div>
                  
                  <EnhancedJourneyMap 
                    onTaskClick={handleTaskClick}
                    onMilestoneClick={handleMilestoneClick}
                  />
                </div>
              </div>

              {/* Side Panel */}
              {taskView !== 'none' && (
                <div className="xl:col-span-1 transition-all duration-300">
                  <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 shadow-lg border border-white/20 h-fit">
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
                          <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                            <Clock className="h-5 w-5 text-soul-purple" />
                            Focus Session
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setTaskView('none')}
                            className="rounded-xl"
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
                          <h3 className="font-semibold flex items-center gap-2 text-gray-800">
                            <CheckCircle className="h-5 w-5 text-soul-purple" />
                            Daily Habits
                          </h3>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => setTaskView('none')}
                            className="rounded-xl"
                          >
                            ×
                          </Button>
                        </div>
                        <HabitTracker />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Create Dream View (default) - Completely redesigned
  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-soul-purple/10 via-white to-soul-teal/5">
        <div className="max-w-lg mx-auto px-4 py-8 pb-32 md:pb-8">
          
          {/* Hero Section */}
          <div className="text-center mb-10">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-soul-purple via-soul-purple to-soul-teal rounded-full flex items-center justify-center mb-6 shadow-2xl">
              <Sparkles className="h-12 w-12 text-white" />
            </div>
            <h1 className="text-3xl font-bold mb-4 bg-gradient-to-r from-soul-purple to-soul-teal bg-clip-text text-transparent">
              What's Your Dream?
            </h1>
            <p className="text-gray-600 text-lg leading-relaxed mb-3">
              Turn your biggest aspiration into a personalized, step-by-step journey
            </p>
            <div className="inline-flex items-center gap-2 bg-soul-purple/10 px-4 py-2 rounded-full">
              <div className="w-2 h-2 bg-soul-purple rounded-full animate-pulse"></div>
              <p className="text-sm text-soul-purple font-medium">{getBlueprintInsight()}</p>
            </div>
          </div>

          {/* Dream Creation Form */}
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-6 mb-8 shadow-lg border border-white/20">
            <div className="space-y-6">
              {/* Dream Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Your Dream or Goal</label>
                <Input
                  placeholder="Launch my creative business, get fit and healthy..."
                  value={dreamForm.title}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, title: e.target.value }))}
                  className="text-base border-gray-200 rounded-2xl h-12 focus:border-soul-purple focus:ring-soul-purple/20"
                />
              </div>

              {/* Why Input */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700 block">Why is this important?</label>
                <Textarea
                  placeholder="Share what drives this dream and why it matters to you..."
                  value={dreamForm.description}
                  onChange={(e) => setDreamForm(prev => ({ ...prev, description: e.target.value }))}
                  className="text-base border-gray-200 rounded-2xl min-h-[100px] focus:border-soul-purple focus:ring-soul-purple/20 resize-none"
                />
              </div>

              {/* Category & Timeline Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Category</label>
                  <Select 
                    value={dreamForm.category} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger className="border-gray-200 rounded-2xl h-12 focus:border-soul-purple">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200">
                      <SelectItem value="personal_growth" className="rounded-xl">Personal Growth</SelectItem>
                      <SelectItem value="career" className="rounded-xl">Career</SelectItem>
                      <SelectItem value="health" className="rounded-xl">Health & Fitness</SelectItem>
                      <SelectItem value="relationships" className="rounded-xl">Relationships</SelectItem>
                      <SelectItem value="creativity" className="rounded-xl">Creativity</SelectItem>
                      <SelectItem value="financial" className="rounded-xl">Financial</SelectItem>
                      <SelectItem value="spiritual" className="rounded-xl">Spiritual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700 block">Timeline</label>
                  <Select 
                    value={dreamForm.timeframe} 
                    onValueChange={(value) => setDreamForm(prev => ({ ...prev, timeframe: value }))}
                  >
                    <SelectTrigger className="border-gray-200 rounded-2xl h-12 focus:border-soul-purple">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-gray-200">
                      <SelectItem value="1 month" className="rounded-xl">1 Month</SelectItem>
                      <SelectItem value="3 months" className="rounded-xl">3 Months</SelectItem>
                      <SelectItem value="6 months" className="rounded-xl">6 Months</SelectItem>
                      <SelectItem value="1 year" className="rounded-xl">1 Year</SelectItem>
                      <SelectItem value="2 years" className="rounded-xl">2+ Years</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Create Button */}
              <Button 
                onClick={handleCreateDream}
                disabled={isCreatingDream || !dreamForm.title.trim()}
                className="w-full bg-gradient-to-r from-soul-purple to-soul-teal hover:shadow-xl text-white text-lg py-6 rounded-2xl font-semibold mt-8 transition-all duration-300 disabled:opacity-50"
              >
                {isCreatingDream ? (
                  <>
                    <Brain className="h-5 w-5 mr-2 animate-pulse" />
                    Creating Your AI Journey...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-5 w-5 mr-2" />
                    Create My Dream Journey
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Alternative Options */}
          <div className="space-y-4">
            <div className="text-center">
              <p className="text-sm text-gray-500 mb-6">Or explore other ways to start</p>
            </div>
            
            <div className="space-y-3">
              <Button
                variant="outline"
                onClick={handleStartAIGuidance}
                className="w-full justify-start text-left p-4 h-auto border-gray-200 hover:border-soul-purple/50 hover:bg-soul-purple/5 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-soul-teal/20 to-soul-teal/10 rounded-2xl flex items-center justify-center mr-4">
                    <Zap className="h-5 w-5 text-soul-teal" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">Talk with AI Dream Coach</div>
                    <div className="text-sm text-gray-500">Explore your dreams through conversation</div>
                  </div>
                </div>
              </Button>

              <Button
                variant="outline"
                onClick={() => setCurrentView('journey')}
                className="w-full justify-start text-left p-4 h-auto border-gray-200 hover:border-soul-purple/50 hover:bg-soul-purple/5 rounded-2xl transition-all duration-300"
              >
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-soul-purple/20 to-soul-purple/10 rounded-2xl flex items-center justify-center mr-4">
                    <MapPin className="h-5 w-5 text-soul-purple" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">View Current Journey</div>
                    <div className="text-sm text-gray-500">Continue your dream progress</div>
                  </div>
                </div>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Dreams;
