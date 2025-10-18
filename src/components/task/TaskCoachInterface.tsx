
import React, { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useLanguage } from "@/contexts/LanguageContext";
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
  X,
  ArrowRight
} from "lucide-react";
import { useTaskAwareCoach } from "@/hooks/use-task-aware-coach";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { SessionProgress } from "./SessionProgress";
import { SubTaskManager } from "./SubTaskManager";
import { SmartQuickActions } from "./SmartQuickActions";
import { QuickActions } from "./QuickActions";
import { TaskCoachMessageRenderer } from "./TaskCoachMessageRenderer";
import { ParsedSubTask } from "@/services/coach-message-parser";
import { enhancedTaskCoachIntegrationService } from "@/services/enhanced-task-coach-integration-service";
import { dreamActivityLogger } from "@/services/dream-activity-logger";
import { TaskContext } from "@/services/task-coach-integration-service";
import { AgentMode } from "@/types/personality-modules";
import { useResponsiveLayout } from "@/hooks/use-responsive-layout";
import { useTaskCompletion } from "@/hooks/use-task-completion";

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
  const { t } = useLanguage();
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
  const [inputValue, setInputValue] = useState("");

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
  
  // Pillar I: Preserve existing functionality, add unified completion
  const { completeTaskFromCoach, isTaskCompleting } = useTaskCompletion({
    showFeedback: true,
    autoNavigate: true,
    returnRoute: '/tasks'
  });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [taskCompleted, setTaskCompleted] = useState(false);
  const [coachMessages, setCoachMessages] = useState<CoachMessage[]>([]);

  // Calculate total days for progress tracking
  const totalDays = useMemo(() => {
    if (!task.estimated_duration) return 1;
    
    // Parse duration string to estimate days
    const duration = task.estimated_duration.toLowerCase();
    if (duration.includes('day')) {
      const match = duration.match(/(\d+)\s*day/);
      return match ? parseInt(match[1]) : 1;
    } else if (duration.includes('week')) {
      const match = duration.match(/(\d+)\s*week/);
      return match ? parseInt(match[1]) * 7 : 7;
    } else if (duration.includes('hour')) {
      const match = duration.match(/(\d+)\s*hour/);
      return match ? Math.ceil(parseInt(match[1]) / 8) : 1; // 8 hours per day
    }
    return 1;
  }, [task.estimated_duration]);

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

  // Set up task completion callback with unified service integration
  useEffect(() => {
    const unsubscribeComplete = enhancedTaskCoachIntegrationService.onTaskComplete(async (taskId) => {
      console.log('🎉 Task completed via coach integration:', taskId);
      
      // Pillar I: Preserve existing logging, add unified completion
      await dreamActivityLogger.logActivity('task_completed_notification', {
        task_id: taskId,
        completion_method: 'coach_integration',
        focus_time_seconds: focusTime,
        session_duration: sessionStats.sessionDuration,
        messages_exchanged: sessionStats.messageCount,
        actions_executed: sessionStats.actionCount
      });
      
      // Pillar I: Use unified completion service instead of direct callback
      const sessionData = {
        duration: sessionStats.sessionDuration,
        messageCount: sessionStats.messageCount,
        actionCount: sessionStats.actionCount,
        focusTime: focusTime
      };
      
      const result = await completeTaskFromCoach(taskId, sessionData);
      
      if (result.success) {
        setTaskCompleted(true);
        setIsTimerRunning(false);
        // Pillar I: Removed duplicate toast trigger (Principle #8: Only Add, Never Mask)
        // onTaskComplete(taskId) removed - unified service handles navigation and feedback
      }
    });

    return () => {
      unsubscribeComplete();
    };
  }, [completeTaskFromCoach, focusTime, sessionStats]);

  // Sanitize content to remove system prompts and internal markers
  const sanitizeContent = (content: string): string => {
    if (!content) return '';
    
    // Remove common system prompt patterns
    let sanitized = content
      // Remove XML-style tags like <thinking>, <system>, <instructions>, etc.
      .replace(/<thinking>[\s\S]*?<\/thinking>/gi, '')
      .replace(/<system>[\s\S]*?<\/system>/gi, '')
      .replace(/<instructions>[\s\S]*?<\/instructions>/gi, '')
      .replace(/<prompt>[\s\S]*?<\/prompt>/gi, '')
      .replace(/<internal>[\s\S]*?<\/internal>/gi, '')
      // Remove prompt engineering markers
      .replace(/\[SYSTEM\][\s\S]*?\[\/SYSTEM\]/gi, '')
      .replace(/\[INTERNAL\][\s\S]*?\[\/INTERNAL\]/gi, '')
      .replace(/\[PROMPT\][\s\S]*?\[\/PROMPT\]/gi, '')
      // Clean up excessive whitespace
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    
    return sanitized;
  };

  // Convert task-aware messages to coach messages format
  useEffect(() => {
    const convertedMessages: CoachMessage[] = messages.map(msg => ({
      id: msg.id,
      content: sanitizeContent(msg.content),
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

  // Timer control handlers
  const handleTimerToggle = useCallback(() => {
    setIsTimerRunning(prev => !prev);
    dreamActivityLogger.logActivity('timer_toggled', {
      task_id: task.id,
      new_state: !isTimerRunning ? 'running' : 'paused',
      current_time: focusTime
    });
  }, [isTimerRunning, focusTime, task.id]);

  const handleTimerReset = useCallback(() => {
    setFocusTime(0);
    setIsTimerRunning(false);
    dreamActivityLogger.logActivity('timer_reset', {
      task_id: task.id,
      previous_time: focusTime
    });
  }, [focusTime, task.id]);

  // Task completion handler with unified service
  const handleCompleteTask = useCallback(async () => {
    await dreamActivityLogger.logActivity('manual_task_completion', {
      task_id: task.id,
      focus_time_seconds: focusTime,
      progress_at_completion: taskProgress
    });
    
    // Pillar I: Preserve quick action, but also trigger unified completion
    const sessionData = {
      duration: sessionStats.sessionDuration,
      messageCount: sessionStats.messageCount,
      actionCount: sessionStats.actionCount,
      focusTime: focusTime
    };
    
    // Use unified completion service
    await completeTaskFromCoach(task.id, sessionData);
  }, [task.id, focusTime, taskProgress, sessionStats, completeTaskFromCoach]);

  // Quick action handler
  const handleQuickAction = useCallback(async (actionId: string, message: string) => {
    await dreamActivityLogger.logActivity('quick_action_used', {
      task_id: task.id,
      action_id: actionId,
      action_message: message.substring(0, 100)
    });
    
    sendMessage(message);
  }, [task.id, sendMessage]);

  // Sub-task management handlers
  const handleSubTaskCompleteById = useCallback(async (subTaskId: string) => {
    await dreamActivityLogger.logActivity('subtask_completed_by_id', {
      task_id: task.id,
      subtask_id: subTaskId
    });
    
    quickTaskActions.markSubTaskComplete(subTaskId);
  }, [task.id, quickTaskActions]);

  const handleAllSubTasksComplete = useCallback(async () => {
    await dreamActivityLogger.logActivity('all_subtasks_completed', {
      task_id: task.id,
      total_subtasks: currentTask?.sub_tasks?.length || 0
    });
    
    const message = "I've completed all the sub-tasks! Please review my work and mark the main task as complete.";
    sendMessage(message);
  }, [task.id, currentTask?.sub_tasks?.length, sendMessage]);

  // Enhanced session starter with structured task breakdown prompting
  const handleStartSession = useCallback(async () => {
    console.log('🚀 Starting coaching session for task:', task.title);
    
    await dreamActivityLogger.logActivity('session_start_clicked', {
      task_id: task.id,
      task_title: task.title,
      user_click_timestamp: new Date().toISOString()
    });

    setSessionStarted(true);
    setIsTimerRunning(true);
    setSidebarOpen(false);

    // Get current goal context
    const currentGoals = productivityJourney?.current_goals || [];
    const currentGoal = currentGoals.find(goal => goal.id === task.goal_id);
    const goalContext = currentGoal ? `\n\nThis task is part of your goal: "${currentGoal.title}" - ${currentGoal.description}` : '';

    // CRITICAL FIX: Structured prompt to trigger WorkingInstructionsPanel
    const initialMessage = `I'm working on: "${task.title}"
${task.description ? `\nTask Description: ${task.description}` : ''}${goalContext}

Provide detailed step-by-step work instructions in this exact format:

1. **[Step Title]**:
   [Clear, actionable description of what to do]
   [Time estimate if relevant]
   
2. **[Step Title]**:
   [Description]

Format requirements:
- Use numbered list (1., 2., 3., etc.)
- Bold step titles with ** **
- Add colon after each title
- Provide substantial details for each step
- DO NOT ask questions or say "Would you like..."
- Give direct, executable instructions

Provide 4-6 concrete steps I can start working on immediately.`;
    
    await dreamActivityLogger.logActivity('enhanced_coaching_message_sent', {
      task_id: task.id,
      message_length: initialMessage.length,
      includes_goal_context: !!goalContext,
      includes_breakdown_instructions: true,
      structured_prompting: true
    });
    
    console.log('📤 Sending enhanced coaching message with breakdown instructions');
    sendMessage(initialMessage);
  }, [task, productivityJourney, sendMessage]);

  // Sub-task interaction handlers
  const handleSubTaskStart = useCallback(async (subTask: ParsedSubTask) => {
    console.log('🎯 Starting sub-task:', subTask.title);
    
    await dreamActivityLogger.logActivity('subtask_started_from_card', {
      subtask_id: subTask.id,
      subtask_title: subTask.title,
      task_id: task.id,
      interaction_type: 'clickable_card'
    });
    
    const message = `I'm starting sub-task: "${subTask.title}".

Provide detailed work instructions for this specific step in this format:

1. **[Action Title]**:
   [Detailed description]
   
2. **[Action Title]**:
   [Description]

Give me 3-5 specific actions I need to take to complete this sub-task. Use the format above with bold titles and numbered steps.`;
    sendMessage(message);
  }, [sendMessage, task.id]);

  const handleSubTaskComplete = useCallback(async (subTask: ParsedSubTask) => {
    console.log('✅ Completing sub-task via card:', subTask.title);
    
    await dreamActivityLogger.logActivity('subtask_completed_from_card', {
      subtask_id: subTask.id,
      subtask_title: subTask.title,
      task_id: task.id,
      interaction_type: 'clickable_card'
    });
    
    // Mark sub-task as complete and notify coach
    quickTaskActions.markSubTaskComplete(subTask.id);
    
    const message = `I've completed the sub-task: "${subTask.title}". Please update my progress and let me know what's next.`;
    sendMessage(message);
  }, [quickTaskActions, sendMessage, task.id]);

  const handleStartTaskPlan = useCallback(async () => {
    console.log('🚀 Starting complete task plan');
    
    await dreamActivityLogger.logActivity('task_plan_started', {
      task_id: task.id,
      interaction_type: 'start_all_button'
    });
    
    const message = `I'm ready to start working through the complete task plan. Guide me through each step systematically.`;
    sendMessage(message);
  }, [sendMessage, task.id]);

  // Working instructions handlers
  const handleInstructionComplete = useCallback(async (instructionId: string) => {
    console.log('✅ Instruction completed:', instructionId);
    
    await dreamActivityLogger.logActivity('working_instruction_completed', {
      task_id: task.id,
      instruction_id: instructionId,
      completion_method: 'interactive_checkbox'
    });
  }, [task.id]);

  const handleAllInstructionsComplete = useCallback(async () => {
    console.log('🎉 All working instructions completed');
    
    await dreamActivityLogger.logActivity('all_working_instructions_completed', {
      task_id: task.id,
      completion_method: 'interactive_panel'
    });
    
    // Update task progress and potentially complete the task
    await quickTaskActions.updateProgress(100);
    
    const message = "I've completed all the working instructions! Please review my work and help me finalize this task.";
    sendMessage(message);
  }, [task.id, quickTaskActions, sendMessage]);

  const handleSendMessage = () => {
    if (inputValue.trim() === "" || isLoading) return;
    sendMessage(inputValue);
    setInputValue("");
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

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
            <Button variant="outline" onClick={onBack}>
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
            subTasks={currentTask?.sub_tasks || []}
            onSubTaskComplete={handleSubTaskCompleteById}
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
              onClick={onBack}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">{t('tasks.backToJourney')}</span>
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
                disabled={!sessionStarted || isTaskCompleting(task.id)}
                className="bg-emerald-600 hover:bg-emerald-700 w-full sm:w-auto disabled:opacity-50"
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
        {import.meta.env.DEV && (
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
            subTasks={currentTask?.sub_tasks || []}
            onSubTaskComplete={handleSubTaskCompleteById}
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
                <h3 className={`font-semibold mb-2 ${getTextSize('text-xl')}`}>Ready to Work Together?</h3>
                <p className={`text-muted-foreground mb-6 ${getTextSize('text-sm')}`}>
                  Your coach will collaborate with you on "{task.title}". Ready to tackle this together?
                </p>
                <Button 
                  onClick={handleStartSession}
                  className="bg-soul-purple hover:bg-soul-purple/90 w-full sm:w-auto"
                  size={isMobile ? "default" : "lg"}
                >
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Start Task Collaboration
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex-1 overflow-y-auto px-4 pt-4 pb-4 space-y-4 min-h-0">
                {coachMessages.map((message, idx) => (
                  <TaskCoachMessageRenderer
                    key={message.id}
                    content={message.content}
                    isUser={message.isUser}
                    taskId={task.id}
                    onSubTaskStart={handleSubTaskStart}
                    onSubTaskComplete={handleSubTaskComplete}
                    onStartTaskPlan={handleStartTaskPlan}
                    onInstructionComplete={handleInstructionComplete}
                    onAllInstructionsComplete={handleAllInstructionsComplete}
                  />
                ))}
                
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-slate-50 border border-green-200/20 max-w-[80%] rounded-2xl p-4">
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="h-4 w-4 text-green-400" />
                        <p className="text-xs font-medium">Task Coach</p>
                      </div>
                      <div className="flex items-center space-x-2 mt-2">
                        <ArrowRight className="h-4 w-4 animate-spin" />
                        <p className="text-sm">Creating your task breakdown...</p>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Input Section */}
              <div className="sticky bottom-0 p-4 bg-white border-t">
                <div className="flex items-center space-x-2">
                  <input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder="Ask about your task, request actions, or get guidance..."
                    className="flex-1 px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={isLoading}
                  />
                  <Button
                    onClick={handleSendMessage}
                    disabled={inputValue.trim() === "" || isLoading}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>
                <p className="text-xs text-center text-gray-500 mt-2">
                  Task-aware coaching with interactive micro-task breakdown
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
