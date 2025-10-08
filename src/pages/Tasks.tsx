import React, { useRef, useEffect, useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Target, TrendingUp, CheckCircle, Plus, MessageCircle, Brain, Clock, ArrowLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useHACSConversationAdapter } from "@/hooks/use-hacs-conversation-adapter";
import { useSubconsciousOrb } from "@/hooks/use-subconscious-orb";
import { supabase } from "@/integrations/supabase/client";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { PomodoroTimer } from "@/components/productivity/PomodoroTimer";
import { HabitTracker } from "@/components/productivity/HabitTracker";
import { GoalSetting } from "@/components/productivity/GoalSetting";
import { GoalAchievement } from "@/components/productivity/GoalAchievement";
import { PlanningInterface } from "@/components/productivity/PlanningInterface";
import { useLanguage } from "@/contexts/LanguageContext";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useIsMobile } from "@/hooks/use-mobile";

const Tasks = () => {
  const { 
    messages: conversationMessages, 
    isLoading, 
    sendMessage: adapterSendMessage, 
    resetConversation,
    switchAgent,
    currentAgent
  } = useHACSConversationAdapter("coach");
  
  // Shadow detection integration
  const { processMessage, isEnabled: orbEnabled } = useSubconsciousOrb();
  
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'achievement' | 'planning' | 'timer' | 'habits' | 'goals' | 'chat'>('achievement');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const { isMobile } = useIsMobile();

  // Transform ConversationMessage[] to Message[] for CoachInterface compatibility
  const messages = conversationMessages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.role === 'user' ? 'user' as const : 'assistant' as const,
    timestamp: new Date(msg.timestamp)
  }));

  // Wrapper to integrate shadow detection with message sending
  const sendMessage = async (message: string) => {
    await adapterSendMessage(message);
    
    // Process message for shadow pattern detection
    if (orbEnabled && message.trim()) {
      const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      await processMessage(message, messageId);
    }
  };

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

  const handleNewConversation = () => {
    resetConversation();
    toast({
      title: t('coach.newConversation'),
      description: `New conversation started with ${t('coach.soulCoach')}`,
    });
  };

  const quickActions = [
    "Help me break down my biggest goal into actionable steps",
    "Create a morning routine that aligns with my energy",
    "Set up accountability for my weekly targets",
    "Plan my most productive work blocks"
  ];

  if (!isAuthenticated) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-25 flex items-center justify-center p-4">
          <div className="bg-white/80 backdrop-blur-lg rounded-3xl p-8 shadow-2xl border border-white/20 text-center max-w-sm w-full">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-green-500 rounded-full mx-auto mb-6 flex items-center justify-center">
              <Target className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-3 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Productivity Mode
            </h1>
            <p className="mb-8 text-gray-600 leading-relaxed">Goal-focused achievement and task management</p>
            <Button 
              className="w-full bg-gradient-to-r from-green-600 to-green-500 hover:shadow-lg transition-all duration-300 rounded-2xl h-12 text-white font-medium"
              onClick={() => window.location.href = '/auth'}
            >
              Get Started
            </Button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-25">
        <div className="w-full px-3 py-4">
          
          {/* Mobile-Optimized Header */}
          <div className="text-center mb-4">
            <h1 className="text-2xl font-bold mb-1 bg-gradient-to-r from-green-600 to-green-500 bg-clip-text text-transparent">
              Productivity Mode
            </h1>
            <p className="text-sm text-gray-500">Goal-focused achievement</p>
          </div>

          {/* Progress Overview Card */}
          <CosmicCard className="p-4 mb-4 border-green-200/20 bg-white/80 backdrop-blur-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium flex items-center">
                <Target className="h-4 w-4 mr-2 text-green-600" />
                Today's Focus
              </h3>
              <Badge variant="outline" className="text-xs border-green-600/30">
                <TrendingUp className="h-3 w-3 mr-1" />
                Day 3 Streak
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div className="flex justify-between text-xs">
                <span>Daily Goals</span>
                <span>2 of 3 complete</span>
              </div>
              <Progress value={66} className="h-2" />
            </div>
          </CosmicCard>

          {/* Mobile-First Single Card Layout */}
          <div className="bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 overflow-hidden">
            
            {/* Horizontal Tab Navigation */}
            <div className="border-b border-gray-100 p-3 bg-white/50">
              <div className="flex gap-1 overflow-x-auto scrollbar-hide">
                <Button
                  variant={activeTab === 'achievement' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('achievement')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'achievement' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Brain className="h-3 w-3" />
                  AI Goals
                </Button>
                <Button
                  variant={activeTab === 'planning' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('planning')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'planning' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Target className="h-3 w-3" />
                  Planning
                </Button>
                <Button
                  variant={activeTab === 'timer' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('timer')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'timer' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Clock className="h-3 w-3" />
                  Focus
                </Button>
                <Button
                  variant={activeTab === 'habits' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('habits')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'habits' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <CheckCircle className="h-3 w-3" />
                  Habits
                </Button>
                <Button
                  variant={activeTab === 'goals' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('goals')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'goals' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <Target className="h-3 w-3" />
                  Goals
                </Button>
                <Button
                  variant={activeTab === 'chat' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setActiveTab('chat')}
                  className={`flex items-center gap-2 rounded-xl whitespace-nowrap min-w-fit px-3 py-2 text-xs font-medium transition-all ${
                    activeTab === 'chat' 
                      ? 'bg-gradient-to-r from-green-600 to-green-500 text-white shadow-md' 
                      : 'text-gray-600 hover:text-green-600 hover:bg-gray-50'
                  }`}
                >
                  <MessageCircle className="h-3 w-3" />
                  Coach
                </Button>
              </div>
            </div>

            {/* Single Tab Content Area */}
            <div className="p-4 w-full overflow-hidden">
              {activeTab === 'achievement' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <Brain className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">AI Goal Achievement</h2>
                      <p className="text-xs text-gray-500">Smart goal tracking and progress</p>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <GoalAchievement />
                  </div>
                </div>
              )}

              {activeTab === 'planning' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Planning Interface</h2>
                      <p className="text-xs text-gray-500">Organize and structure your goals</p>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <PlanningInterface />
                  </div>
                </div>
              )}

              {activeTab === 'timer' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <Clock className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Focus Timer</h2>
                      <p className="text-xs text-gray-500">Pomodoro technique for productivity</p>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <PomodoroTimer />
                  </div>
                </div>
              )}

              {activeTab === 'habits' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Habit Tracker</h2>
                      <p className="text-xs text-gray-500">Build consistent daily routines</p>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <HabitTracker />
                  </div>
                </div>
              )}

              {activeTab === 'goals' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <Target className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Goal Setting</h2>
                      <p className="text-xs text-gray-500">Define and structure your objectives</p>
                    </div>
                  </div>
                  <div className="w-full overflow-hidden">
                    <GoalSetting />
                  </div>
                </div>
              )}

              {activeTab === 'chat' && (
                <div className="w-full">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-600 to-green-500 rounded-xl flex items-center justify-center">
                      <MessageCircle className="h-4 w-4 text-white" />
                    </div>
                    <div>
                      <h2 className="text-base font-semibold text-gray-800">Productivity Coach</h2>
                      <p className="text-xs text-gray-500">AI-powered goal achievement guidance</p>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="mb-4">
                    <h3 className="text-sm font-medium mb-3">Quick Start</h3>
                    <div className="space-y-2">
                      {quickActions.map((action, index) => (
                        <Button
                          key={index}
                          variant="outline"
                          size="sm"
                          onClick={() => sendMessage(action)}
                          className="w-full justify-start text-xs h-8 border-green-600/30 hover:bg-green-50"
                        >
                          <Plus className="h-3 w-3 mr-2" />
                          {action}
                        </Button>
                      ))}
                    </div>
                  </div>
                  
                  <div className="w-full h-80 overflow-hidden">
                    <CoachInterface
                      messages={messages}
                      isLoading={isLoading}
                      onSendMessage={sendMessage}
                      messagesEndRef={messagesEndRef}
                      taskTitle="General Coaching"
                      estimatedDuration="~30 min"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Tasks;
