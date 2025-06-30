
import React, { useState, useRef, useEffect, useCallback } from "react";
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
  RotateCcw
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

interface Message {
  id: string;
  content: string;
  sender: 'user' | 'assistant';
  timestamp: Date;
}

export const TaskCoachInterface: React.FC<TaskCoachInterfaceProps> = ({
  task,
  onBack,
  onTaskComplete
}) => {
  const taskContext: TaskContext = {
    ...task,
    progress: 0,
    sub_tasks: []
  };

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
  const [coachMessages, setCoachMessages] = useState<Message[]>([]);

  // Log component mount
  useEffect(() => {
    dreamActivityLogger.logActivity('task_coach_interface_mounted', {
      task_id: task.id,
      task_title: task.title,
      task_status: task.status,
      estimated_duration: task.estimated_duration
    });

    return () => {
      dreamActivityLogger.logActivity('task_coach_interface_unmounted', {
        task_id: task.id,
        session_duration: sessionStats.sessionDuration,
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
    if (currentTask) {
      const previousProgress = taskProgress;
      setTaskProgress(currentTask.progress);
      
      if (previousProgress !== currentTask.progress) {
        dreamActivityLogger.logActivity('task_progress_updated', {
          task_id: currentTask.id,
          previous_progress: previousProgress,
          new_progress: currentTask.progress,
          progress_change: currentTask.progress - previousProgress
        });
      }
    }
  }, [currentTask, taskProgress]);

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
    const convertedMessages: Message[] = messages.map(msg => ({
      id: msg.id,
      content: msg.content,
      sender: msg.sender as 'user' | 'assistant',
      timestamp: msg.timestamp
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

  const handleStartSession = useCallback(async () => {
    await dreamActivityLogger.logActivity('session_start_clicked', {
      task_id: task.id,
      task_title: task.title,
      user_click_timestamp: new Date().toISOString()
    });

    setSessionStarted(true);
    setIsTimerRunning(true);

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
    }
  }, [isLoading, sendMessage, task.id]);

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

  const handleNewMessage = useCallback((message: Message) => {
    dreamActivityLogger.logActivity('coach_message_received', {
      message_id: message.id,
      message_sender: message.sender,
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

  return (
    <div className="h-full flex flex-col animate-fade-in transition-all duration-300">
      {/* Task Header - More compact */}
      <div className="border-b bg-background p-3">
        <div className="flex items-center justify-between mb-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={handleBackClick}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journey
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTimerToggle}
              disabled={!sessionStarted}
              className="flex items-center gap-2"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {formatTime(focusTime)}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleTimerReset}
              disabled={!sessionStarted}
            >
              <RotateCcw className="h-3 w-3" />
            </Button>
          </div>
        </div>
        
        {/* Compact task info */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Target className="h-5 w-5 text-soul-purple" />
              {task.title}
            </h2>
            
            {!taskCompleted && task.status !== 'completed' && (
              <Button
                onClick={handleCompleteTask}
                disabled={!sessionStarted}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete Task
              </Button>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
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

      {/* Main Content */}
      <div className="flex-1 flex gap-4 p-4 min-h-0">
        {/* Left Sidebar - Task Management */}
        <div className="w-80 space-y-4 overflow-y-auto">
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

        {/* Right Side - Coach Interface */}
        <div className="flex-1 flex flex-col min-h-0">
          {!sessionStarted ? (
            <div className="flex-1 flex items-center justify-center p-8">
              <div className="text-center max-w-md">
                <div className="w-16 h-16 bg-soul-purple/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-8 w-8 text-soul-purple" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Ready to Focus?</h3>
                <p className="text-muted-foreground mb-6">
                  Start a personalized coaching session with integrated task management for "{task.title}".
                </p>
                <Button 
                  onClick={handleStartSession}
                  className="bg-soul-purple hover:bg-soul-purple/90"
                  size="lg"
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
