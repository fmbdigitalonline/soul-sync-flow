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
import { useEnhancedAICoach } from "@/hooks/use-enhanced-ai-coach";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { CoachInterface } from "@/components/coach/CoachInterface";
import { SubTaskManager } from "./SubTaskManager";
import { QuickActions } from "./QuickActions";
import { SessionProgress } from "./SessionProgress";

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
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("coach");
  const { productivityJourney } = useJourneyTracking();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [focusTime, setFocusTime] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [taskProgress, setTaskProgress] = useState(0);
  const [awaitingFirstAssistantReply, setAwaitingFirstAssistantReply] = useState(false);

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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-100 text-slate-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      case 'stuck': return 'bg-amber-100 text-amber-700';
      case 'completed': return 'bg-emerald-100 text-emerald-700';
      default: return 'bg-slate-100 text-slate-700';
    }
  };

  const handleStartSession = () => {
    setSessionStarted(true);
    setIsTimerRunning(true);
    setAwaitingFirstAssistantReply(true);

    const initialMessage = `I'm ready to work on this task: "${task.title}". ${task.description ? `Description: ${task.description}. ` : ''}This task requires ${task.energy_level_required} energy and should take about ${task.estimated_duration}. 

As my coach, please help me by:
1. Breaking this down into specific, actionable sub-tasks
2. Keeping responses concise and interactive
3. Checking in regularly to see how I'm progressing
4. Providing motivation aligned with my personality

Let's start with the first concrete step I should take right now.`;
    
    sendMessage(initialMessage).then(() => {
      // As soon as at least one new message from assistant arrives, disable waiting state
      setAwaitingFirstAssistantReply(false);
    });
  };

  const handleQuickAction = (actionId: string, message: string) => {
    sendMessage(message);
  };

  const handleSubTaskComplete = (subTaskId: string) => {
    // Update progress based on completed sub-tasks
    console.log('Sub-task completed:', subTaskId);
  };

  const handleAllSubTasksComplete = () => {
    setTaskProgress(100);
    sendMessage("I've completed all the sub-tasks! Can you help me review what I've accomplished and determine if the main task is fully complete?");
  };

  const handleCompleteTask = () => {
    setIsTimerRunning(false);
    onTaskComplete(task.id);
    sendMessage(`Excellent! I've completed the task "${task.title}". It took me ${formatTime(focusTime)} of focused work. Can you help me reflect on what went well, what I learned, and how this contributes to my overall goals?`);
  };

  const handleCoachMessage = (message: string) => {
    sendMessage(message);
  };

  // Parse estimated duration to extract days
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
            
            {task.status !== 'completed' && (
              <Button
                onClick={handleCompleteTask}
                disabled={!sessionStarted}
                className="bg-emerald-600 hover:bg-emerald-700"
                size="sm"
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                Complete
              </Button>
            )}
          </div>
          
          {task.description && (
            <p className="text-sm text-muted-foreground">{task.description}</p>
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
                  Start a personalized coaching session to tackle this task step-by-step with guidance tailored to your blueprint.
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
