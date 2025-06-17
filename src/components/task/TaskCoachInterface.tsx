
import React, { useState, useRef, useEffect } from "react";
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
import { CoachInterface } from "@/components/coach/CoachInterface";
import { SubTaskManager } from "./SubTaskManager";
import { QuickActions } from "./QuickActions";
import { SessionProgress } from "./SessionProgress";
import { taskCoachIntegrationService, TaskContext } from "@/services/task-coach-integration-service";

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
    quickTaskActions
  } = useTaskAwareCoach(taskContext);
  
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [awaitingFirstAssistantReply, setAwaitingFirstAssistantReply] = useState(false);
  const [taskCompleted, setTaskCompleted] = useState(false);

  // Timer effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setFocusTime(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Sync task progress with current task state
  useEffect(() => {
    if (currentTask) {
      setTaskProgress(currentTask.progress);
    }
  }, [currentTask]);

  // Set up task completion callback
  useEffect(() => {
    taskCoachIntegrationService.onTaskComplete((taskId) => {
      console.log('🎉 Task completed via coach integration:', taskId);
      setTaskCompleted(true);
      setIsTimerRunning(false);
      onTaskComplete(taskId);
    });
  }, [onTaskComplete]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  const handleStartSession = () => {
    setSessionStarted(true);
    setIsTimerRunning(true);
    setAwaitingFirstAssistantReply(true);

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
    
    sendMessage(initialMessage).then(() => {
      setAwaitingFirstAssistantReply(false);
    });
  };

  const handleQuickAction = (actionId: string, message: string) => {
    if (!isLoading) {
      sendMessage(message);
    }
  };

  const handleSubTaskComplete = (subTaskId: string) => {
    console.log('🎯 Sub-task completed, notifying coach:', subTaskId);
    quickTaskActions.markSubTaskComplete(subTaskId);
  };

  const handleAllSubTasksComplete = () => {
    console.log('🏁 All sub-tasks completed, checking with coach');
    sendMessage("I've completed all the sub-tasks! Can you verify if the main task is fully complete and mark it as done?");
  };

  const handleCompleteTask = async () => {
    console.log('✅ Manually completing task via coach');
    await quickTaskActions.markTaskComplete();
  };

  const handleCoachMessage = (message: string) => {
    if (!isLoading && message.trim()) {
      sendMessage(message);
    }
  };

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
            onClick={onBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Journey
          </Button>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsTimerRunning(!isTimerRunning)}
              disabled={!sessionStarted}
              className="flex items-center gap-2"
            >
              {isTimerRunning ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
              {formatTime(focusTime)}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setFocusTime(0);
                setIsTimerRunning(false);
              }}
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
            <QuickActions
              onAction={handleQuickAction}
              isLoading={isLoading}
            />
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
              <CoachInterface
                messages={messages}
                isLoading={isLoading}
                onSendMessage={handleCoachMessage}
                messagesEndRef={messagesEndRef}
                taskTitle={task.title}
                estimatedDuration={task.estimated_duration}
                awaitingFirstAssistantReply={awaitingFirstAssistantReply}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
