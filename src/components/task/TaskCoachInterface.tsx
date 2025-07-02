import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  MessageCircle, 
  CheckCircle2, 
  Clock, 
  Target, 
  Zap, 
  Brain,
  Play,
  Pause,
  RotateCcw,
  AlertCircle,
  Menu,
  X
} from "lucide-react";
import { useTaskAwareCoach } from "@/hooks/use-task-aware-coach";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import EnhancedCoachInterface from "@/components/coach/EnhancedCoachInterface";
import { SessionProgress } from "./SessionProgress";
import { SubTaskManager } from "./SubTaskManager";
import { SmartQuickActions } from "./SmartQuickActions";
import { QuickActions } from "./QuickActions";
import { enhancedTaskCoachIntegrationService } from "@/services/enhanced-task-coach-integration-service";
import { dreamActivityLogger } from "@/services/dream-activity-logger";
import { TaskContext } from "@/services/task-coach-integration-service";
import { AgentMode } from "@/types/personality-modules";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";

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

interface TaskCoachInterfaceProps {
  task: Task;
  onBack: () => void;
  onTaskComplete: (taskId: string) => void;
}

// EnhancedCoachInterface's Message type
interface CoachMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
  agentMode: AgentMode;
  interventionApplied?: boolean;
  fallbackUsed?: boolean;
}

export const TaskCoachInterface: React.FC<TaskCoachInterfaceProps> = ({
  task,
  onBack,
  onTaskComplete
}) => {
  const { isMobile, isUltraNarrow, spacing, getTextSize, touchTargetSize } = useResponsiveLayout();
  
  // Create stable task context
  const taskContext: TaskContext = useMemo(() => ({
    ...task,
    progress: 0,
    sub_tasks: []
  }), [task.id, task.title, task.description, task.status]);

  const [initializationError, setInitializationError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize the task-aware coach with error handling
  const { 
    messages, 
    isLoading, 
    sendMessage, 
    resetConversation, 
    currentTask,
    quickTaskActions,
    sessionStats
  } = useTaskAwareCoach(taskContext);
  
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);

  // Log component mount with error handling
  useEffect(() => {
    const initializeInterface = async () => {
      try {
        console.log('🎯 TaskCoachInterface: Initializing with task:', task.title);
        
        await dreamActivityLogger.logActivity('task_coach_interface_mounted', {
          task_id: task.id,
          task_title: task.title,
          task_status: task.status,
          estimated_duration: task.estimated_duration
        });
        
        setIsInitializing(false);
        console.log('✅ TaskCoachInterface: Initialization complete');
      } catch (error) {
        console.error('❌ TaskCoachInterface: Failed to initialize:', error);
        setInitializationError(error instanceof Error ? error.message : 'Unknown initialization error');
        setIsInitializing(false);
      }
    };

    initializeInterface();

    return () => {
      dreamActivityLogger.logActivity('task_coach_interface_unmounted', {
        task_id: task.id,
        session_duration: Date.now() - sessionStats.sessionDuration,
        messages_sent: sessionStats.messageCount,
        actions_executed: sessionStats.actionCount
      });
    };
  }, [task.id, task.title, task.status, task.estimated_duration, sessionStats]);

  // Timer effect with logging
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusTime(prev => {
          const newTime = prev + 1;
          
          // Log focus milestones
          if (newTime % 300 === 0) { // Every 5 minutes
            dreamActivityLogger.logActivity('focus_milestone_reached', {
              task_id: task.id,
              focus_time_seconds: newTime,
              milestone_minutes: Math.floor(newTime / 60)
            });
          }
          
          return newTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, task.id]);

  // Sync task progress with current task state
  useEffect(() => {
    if (currentTask && currentTask.progress !== taskProgress) {
      const previousProgress = taskProgress;
      setTaskProgress(currentTask.progress);
      
      dreamActivityLogger.logActivity('task_progress_updated', {
        task_id: currentTask.id,
        previous_progress: previousProgress,
        new_progress: currentTask.progress,
        progress_change: currentTask.progress - previousProgress
      });
    }
  }, [currentTask?.progress, taskProgress]);

  // Set up task completion callback with logging
  useEffect(() => {
    const unsubscribeComplete = enhancedTaskCoachIntegrationService.onTaskComplete((taskId) => {
      console.log('🎉 Task completed via coach integration:', taskId);
      
      dreamActivityLogger.logActivity('task_completed_notification', {
        task_id: taskId,
        completion_method: 'coach_integration',
        focus_time_seconds: focusTime,
        session_duration: sessionStats.sessionDuration,
        messages_exchanged: sessionStats.messageCount,
        actions_executed: sessionStats.actionCount
      });
      
      setTaskCompleted(true);
      setIsTimerRunning(false);
      onTaskComplete(taskId);
    });

    return () => {
      unsubscribeComplete();
    };
  }, [onTaskComplete, focusTime, sessionStats]);

  // Convert task-aware messages to coach messages format
  useEffect(() => {
    const convertedMessages: CoachMessage[] = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      isUser: msg.sender === 'user',
      timestamp: msg.timestamp,
      agentMode: 'guide' as AgentMode
    }));
    setCoachMessages(convertedMessages);
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [coachMessages]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getEnergyColor = (energy: string) => {
    switch (energy.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Stable event handlers
  const handleStartSession = useCallback(async () => {
    console.log('🚀 Starting coaching session for task:', task.title);
    
    await dreamActivityLogger.logActivity('session_start_clicked', {
      task_id: task.id,
      task_title: task.title,
      user_click_timestamp: new Date().toISOString()
    });

    setSessionStarted(true);
    setIsTimerRunning(true);
    setSidebarOpen(false); // Close sidebar on mobile when starting session

    // Get current goal context
    const currentGoals = productivityJourney?.current_goals || [];
    const currentGoal = currentGoals.find(goal => goal.id === task.goal_id);
    const goalContext = currentGoal ? `\n\nThis task is part of your goal: "${currentGoal.title}" - ${currentGoal.description}` : '';

    const initialMessage = `I'm ready to start working on "${task.title}". This is a ${task.energy_level_required} energy task that should take ${task.estimated_duration}.

${task.description ? `Task Description: ${task.description}` : ''}${goalContext}

As my productivity coach with task management capabilities, please help me by:
1. Breaking this into 3-5 actionable sub-tasks 
2. Creating a step-by-step plan
3. Using your task management functions to track progress
4. Providing personalized guidance based on my blueprint

Let's get started! What's the first step?`;
    
    await dreamActivityLogger.logActivity('initial_coaching_message_sent', {
      task_id: task.id,
      message_length: initialMessage.length,
      includes_goal_context: !!goalContext,
      includes_task_description: !!task.description
    });
    
    console.log('📤 Sending initial coaching message');
    sendMessage(initialMessage);
  }, [task, productivityJourney, sendMessage]);

  const handleQuickAction = useCallback(async (actionId: string, message: string) => {
    if (!isLoading) {
      await dreamActivityLogger.logActivity('quick_action_clicked', {
        action_id: actionId,
        message_preview: message.substring(0, 100),
        task_id: task.id,
        is_loading: isLoading
      });
      
      sendMessage(message);
      if (isMobile) setSidebarOpen(false); // Close sidebar after action on mobile
    }
  }, [isLoading, sendMessage, task.id, isMobile]);

  const handleSubTaskComplete = useCallback(async (subTaskId: string) => {
    console.log('🎯 Sub-task completed, notifying coach:', subTaskId);
    
    await dreamActivityLogger.logActivity('subtask_completion_clicked', {
      subtask_id: subTaskId,
      task_id: task.id,
      current_progress: taskProgress
    });
    
    quickTaskActions.markSubTaskComplete(subTaskId);
  }, [quickTaskActions, task.id, taskProgress]);

  const handleAllSubTasksComplete = useCallback(async () => {
    console.log('🏁 All sub-tasks completed, checking with coach');
    
    await dreamActivityLogger.logActivity('all_subtasks_completed', {
      task_id: task.id,
      completion_check_requested: true,
      current_progress: taskProgress
    });
    
    sendMessage("I've completed all the sub-tasks! Can you verify if the main task is fully complete and mark it as done?");
  }, [sendMessage, task.id, taskProgress]);

  const handleCompleteTask = useCallback(async () => {
    console.log('✅ Manually completing task via coach');
    
    await dreamActivityLogger.logActivity('manual_task_completion_clicked', {
      task_id: task.id,
      completion_method: 'manual_button_click',
      current_progress: taskProgress,
      focus_time_seconds: focusTime
    });
    
    await quickTaskActions.markTaskComplete();
  }, [quickTaskActions, task.id, taskProgress, focusTime]);

  const handleNewMessage = useCallback((message: CoachMessage) => {
    dreamActivityLogger.logActivity('coach_message_received', {
      message_id: message.id,
      message_sender: message.isUser ? 'user' : 'assistant',
      message_length: message.content.length,
      task_id: task.id
    });
  }, [task.id]);

  const handleTimerToggle = useCallback(async () => {
    const newTimerState = !isTimerRunning;
    setIsTimerRunning(newTimerState);
    
    await dreamActivityLogger.logActivity('timer_toggled', {
      task_id: task.id,
      timer_action: newTimerState ? 'started' : 'paused',
      current_focus_time: focusTime,
      session_started: sessionStarted
    });
  }, [isTimerRunning, task.id, focusTime, sessionStarted]);

  const handleTimerReset = useCallback(async () => {
    const previousFocusTime = focusTime;
    setFocusTime(0);
    setIsTimerRunning(false);
    
    await dreamActivityLogger.logActivity('timer_reset', {
      task_id: task.id,
      previous_focus_time: previousFocusTime,
      session_started: sessionStarted
    });
  }, [focusTime, task.id, sessionStarted]);

  const handleBackClick = useCallback(async () => {
    await dreamActivityLogger.logActivity('back_button_clicked', {
      task_id: task.id,
      session_duration: sessionStats.sessionDuration,
      focus_time_seconds: focusTime,
      messages_sent: sessionStats.messageCount,
      actions_executed: sessionStats.actionCount,
      task_completed: taskCompleted
    });
    
    onBack();
  }, [onBack, task.id, sessionStats, focusTime, taskCompleted]);

  const getTotalDays = (duration: string): number => {
    const dayMatch = duration.match(/(\d+)\s*days?/i);
    return dayMatch ? parseInt(dayMatch[1]) : 1;
  };

  const totalDays = getTotalDays(task.estimated_duration);

  // Show loading state during initialization
  if (isInitializing) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center">
          <Brain className="h-8 w-8 text-soul-purple animate-pulse mx-auto mb-4" />
          <p className="text-muted-foreground">Initializing task coach...</p>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (initializationError) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center max-w-md p-6">
          <AlertCircle className="h-8 w-8 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-semibold mb-2">Initialization Error</h3>
          <p className="text-muted-foreground mb-4">{initializationError}</p>
          <div className="space-x-2">
            <Button variant="outline" onClick={handleBackClick}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Mobile Sidebar Component
  const MobileSidebar = () => (
    <div className={`
      fixed inset-0 z-50 md:hidden
      ${sidebarOpen ? 'visible' : 'invisible'}
    `}>
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          sidebarOpen ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={() => setSidebarOpen(false)}
      />
      
      {/* Sidebar */}
      <div className={`
        absolute left-0 top-0 h-full w-80 max-w-[85vw] bg-background border-r
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        overflow-y-auto
      `}>
        <div className="p-4 border-b flex items-center justify-between">
          <h3 className="font-semibold">Task Tools</h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="p-4 space-y-4">
          <SessionProgress 
            focusTime={focusTime}
            estimatedDuration={task.estimated_duration}
            energyLevel={task.energy_level_required}
            taskProgress={taskProgress}
            totalDays={totalDays}
          />
          
          <SubTaskManager
            taskTitle={task.title}
            onSubTaskComplete={handleSubTaskComplete}
            onAllComplete={handleAllSubTasksComplete}
          />
          
          {sessionStarted && (
            <>
              <SmartQuickActions
                onAction={handleQuickAction}
                isLoading={isLoading}
                currentProgress={taskProgress}
                hasSubTasks={!!(currentTask?.sub_tasks && currentTask.sub_tasks.length > 0)}
              />
              
              <QuickActions
                onAction={handleQuickAction}
                isLoading={isLoading}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col animate-fade-in transition-all duration-300">
      {/* Mobile Sidebar */}
      <MobileSidebar />
      
      {/* Task Header - Mobile Responsive */}
      <div className="border-b bg-background p-3 md:p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleBackClick}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Journey</span>
              <span className="sm:hidden">Back</span>
            </Button>
            
            {/* Mobile sidebar toggle */}
            {sessionStarted && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSidebarOpen(true)}
                className="md:hidden"
              >
                <Menu className="h-4 w-4" />
              </Button>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTimerToggle}
              disabled={!sessionStarted}
              className="flex items-center gap-2"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              <span className={getTextSize('text-xs')}>{formatTime(focusTime)}</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTimerReset}
              disabled={!sessionStarted}
              className="hidden sm:flex"
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Compact task info - Mobile Responsive */}
        <div className="space-y-2">
          <div className="flex items-start justify-between flex-col sm:flex-row gap-2">
            <h2 className={`font-semibold flex items-center gap-2 ${getTextSize('text-lg')}`}>
              <Target className="h-5 w-5 text-soul-purple flex-shrink-0" />
              <span className="break-words">{task.title}</span>
            </h2>
            
            {!taskCompleted && task.status !== 'completed' && (
              <Button
                onClick={handleCompleteTask}
                disabled={!sessionStarted}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete Task
              </Button>
            )}
          </div>
          
          {task.description && (
            <p className={`text-muted-foreground break-words ${getTextSize('text-sm')}`}>
              {task.description}
            </p>
          )}

          <div className="flex gap-2 flex-wrap">
            <Badge variant="outline" className={`text-xs ${getEnergyColor(task.energy_level_required)}`}>
              <Zap className="h-3 w-3 mr-1" />
              {task.energy_level_required} energy
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {task.estimated_duration}
            </Badge>
            {task.optimal_time_of_day && (
              <Badge variant="outline" className="text-xs">
                🕐 {task.optimal_time_of_day.join(', ')}
              </Badge>
            )}
          </div>
          
          {/* Progress Bar */}
          {sessionStarted && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{taskProgress}%</span>
              </div>
              <Progress value={taskProgress} className="h-2" />
            </div>
          )}
        </div>
        
        {/* Debug Info (only in development) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 p-2 bg-gray-100 rounded text-xs">
            <strong>Debug:</strong> Session {sessionStats.sessionId.substring(0, 8)}, 
            Messages: {sessionStats.messageCount}, Actions: {sessionStats.actionCount}
          </div>
        )}
      </div>

      {/* Main Content - Mobile Responsive Layout */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 p-4 min-h-0">
        {/* Desktop Sidebar - Hidden on Mobile */}
        <div className="hidden md:block w-80 space-y-4 overflow-y-auto">
          <SessionProgress 
            focusTime={focusTime}
            estimatedDuration={task.estimated_duration}
            energyLevel={task.energy_level_required}
            taskProgress={taskProgress}
            totalDays={totalDays}
          />
          
          <SubTaskManager
            taskTitle={task.title}
            onSubTaskComplete={handleSubTaskComplete}
            onAllComplete={handleAllSubTasksComplete}
          />
          
          {sessionStarted && (
            <>
              <SmartQuickActions
                onAction={handleQuickAction}
                isLoading={isLoading}
                currentProgress={taskProgress}
                hasSubTasks={!!(currentTask?.sub_tasks && currentTask.sub_tasks.length > 0)}
              />
              
              <QuickActions
                onAction={handleQuickAction}
                isLoading={isLoading}
              />
            </>
          )}
        </div>

        {/* Main Coach Interface - Full Width on Mobile */}
        <div className="flex-1 flex flex-col min-h-0">
          {!sessionStarted ? (
            <div className="flex-1 flex items-center justify-center p-4 md:p-8">
              <div className="text-center max-w-md w-full">
                <div className="w-16 h-16 bg-soul-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-soul-purple" />
                </div>
                <h3 className={`font-semibold mb-2 ${getTextSize('text-xl')}`}>Ready to Focus?</h3>
                <p className={`text-muted-foreground mb-6 ${getTextSize('text-sm')}`}>
                  Start a personalized coaching session with integrated task management for "{task.title}".
                </p>
                <Button 
                  onClick={handleStartSession}
                  className="bg-soul-purple hover:bg-soul-purple/90 w-full sm:w-auto"
                  size={isMobile ? "default" : "lg"}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Coaching Session
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0">
              <EnhancedCoachInterface
                sessionId={sessionStats.sessionId}
                initialMessages={coachMessages}
                onNewMessage={handleNewMessage}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
