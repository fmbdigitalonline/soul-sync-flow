import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Target,
  Clock,
  Zap,
  NotebookPen,
  Mic,
  FileDown,
  Cloud,
  CalendarClock,
  ShieldCheck,
  Link2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ContextualToolsPanelProps {
  context?: 'journey' | 'task-coach' | 'focus' | 'tasks' | 'milestones' | 'hub' | 'chat' | 'create';
  activeGoal?: any;
  focusedMilestone?: any;
  selectedTask?: any;
  className?: string;
}

export const ContextualToolsPanel: React.FC<ContextualToolsPanelProps> = ({
  context,
  activeGoal,
  focusedMilestone,
  selectedTask,
  className
}) => {
  const location = useLocation();

  // Auto-detect context from route if not provided
  const detectedContext = context || detectContextFromRoute(location.pathname);

  return (
    <div className={cn("h-full p-6 space-y-6", className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-subheading font-semibold text-foreground">
            Tools & Insights
          </h3>
          <Badge variant="outline" className="text-xs">
            {detectedContext}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground">
          Context-aware assistance for your current view
        </p>
      </div>

      {/* Context-specific tools */}
      {renderToolsForContext(detectedContext, { activeGoal, focusedMilestone, selectedTask })}
    </div>
  );
};

// Helper: Detect context from route
function detectContextFromRoute(pathname: string): string {
  if (pathname.includes('/journey')) return 'journey';
  if (pathname.includes('/tasks')) return 'tasks';
  if (pathname.includes('/focus')) return 'focus';
  if (pathname.includes('/habits')) return 'habits';
  if (pathname.includes('/discover') || pathname.includes('/chat')) return 'chat';
  if (pathname.includes('/create')) return 'create';
  if (pathname.includes('/coach')) return 'task-coach';
  return 'hub';
}

// Helper: Render tools based on context (Principle #2: No Hardcoded Data)
function renderToolsForContext(
  context: string,
  data: { activeGoal?: any; focusedMilestone?: any; selectedTask?: any }
) {
  switch (context) {
    case 'journey':
      return <JourneyTools activeGoal={data.activeGoal} />;
    
    case 'task-coach':
      return <TaskCoachTools selectedTask={data.selectedTask} />;
    
    case 'focus':
      return <FocusTools focusedMilestone={data.focusedMilestone} />;
    
    case 'tasks':
      return <TasksTools />;
    
    case 'chat':
      return <DiscoveryTools />;
    
    case 'create':
      return <CreateTools />;
    
    case 'hub':
    default:
      return <HubTools />;
  }
}

// Context-specific tool widgets
function JourneyTools({ activeGoal }: { activeGoal?: any }) {
  const completedMilestones = activeGoal?.completedMilestones ?? 0;
  const totalMilestones = activeGoal?.totalMilestones ?? 0;
  const milestoneProgress = totalMilestones
    ? Math.min(100, (completedMilestones / totalMilestones) * 100)
    : 0;

  const completedTasks = activeGoal?.completedTasks ?? 0;
  const totalTasks = activeGoal?.totalTasks ?? 0;
  const taskProgress = totalTasks
    ? Math.min(100, (completedTasks / totalTasks) * 100)
    : 0;

  const timeSpent = activeGoal?.timeSpent ?? 0;
  const scheduledTime = activeGoal?.scheduledTime ?? 0;
  const timeAllocation = scheduledTime
    ? Math.min(100, (timeSpent / scheduledTime) * 100)
    : 0;

  const activeStreak = activeGoal?.focusStreak ?? 0;

  return (
    <div className="space-y-4">
      {/* AI Output & Tool Workspace */}
      <Card className="p-4 space-y-4 bg-muted/40">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <div>
            <h4 className="font-semibold text-sm">AI Output &amp; Tool Workspace</h4>
            <p className="text-xs text-muted-foreground">
              Capture insights, craft plans, and surface AI-generated support.
            </p>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <NotebookPen className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Multimodal note-taking</p>
              <p className="text-xs text-muted-foreground">
                Switch between written inputs and quick voice capture to build living notes as you work.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <FileDown className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Flexible exports</p>
              <p className="text-xs text-muted-foreground">
                Download outputs in TXT, PDF, DOCX, or Markdown for easy sharing and archival.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3 rounded-lg border border-border/60 p-3 bg-background/80">
            <Cloud className="mt-0.5 h-4 w-4 text-primary" />
            <div className="space-y-1">
              <p className="text-xs font-semibold">Cross-platform syncing</p>
              <p className="text-xs text-muted-foreground">
                Keep your saved notes and insights synced across devices for uninterrupted momentum.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 rounded-md bg-primary/5 px-3 py-2 text-xs text-primary">
          <Mic className="h-4 w-4" />
          <span>Enable voice mode to capture a new insight.</span>
        </div>
      </Card>

      {/* Agenda Management */}
      <Card className="p-4 space-y-4">
        <div className="flex items-center gap-2">
          <CalendarClock className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Agenda Management</h4>
        </div>
        <div className="space-y-3 text-xs text-muted-foreground">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Adaptive agenda</span> automatically builds and adjusts tasks to stay aligned with your goals.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <ShieldCheck className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Locked agenda time</span> protects deep work blocks by preventing double-booking or interruptions.
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Link2 className="mt-0.5 h-3.5 w-3.5 text-primary" />
            <p>
              <span className="font-medium text-foreground">Integration hooks</span> connect to calendars and productivity APIs for automated scheduling.
            </p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Quick Actions</h4>
        </div>
        {activeGoal ? (
          <div className="space-y-2">
            <p className="text-xs text-muted-foreground">
              {activeGoal.title || 'Active Goal'}
            </p>
            <div className="grid gap-2">
              <button className="text-xs text-left px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                View Timeline
              </button>
              <button className="text-xs text-left px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                Start Focus Mode
              </button>
              <button className="text-xs text-left px-3 py-2 rounded-lg bg-accent/50 hover:bg-accent transition-colors">
                View All Tasks
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            Select a goal to see quick actions.
          </p>
        )}
      </Card>

      {/* Progress Overview */}
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Progress Overview</h4>
        </div>
        {activeGoal ? (
          <div className="space-y-3 text-xs">
            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Milestones</span>
                <span className="font-medium text-foreground">
                  {completedMilestones}/{totalMilestones}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary"
                  style={{ width: `${milestoneProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tasks</span>
                <span className="font-medium text-foreground">
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-secondary"
                  style={{ width: `${taskProgress}%` }}
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Time spent vs. scheduled</span>
                <span className="font-medium text-foreground">
                  {timeSpent}h / {scheduledTime}h
                </span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-muted">
                <div
                  className="h-1.5 rounded-full bg-primary/70"
                  style={{ width: `${timeAllocation}%` }}
                />
              </div>
            </div>

            <div className="flex justify-between rounded-md bg-muted/40 px-3 py-2">
              <span className="text-muted-foreground">Recent streak</span>
              <span className="font-medium text-foreground">{activeStreak} days</span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No active goal selected.
          </p>
        )}
      </Card>

      {/* Blueprint Insights */}
      <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Blueprint Insights</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Personality-based tips and guidance will appear here.
        </p>
      </Card>
    </div>
  );
}

function TaskCoachTools({ selectedTask }: { selectedTask?: any }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Clock className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Current Task</h4>
        </div>
        {selectedTask ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">{selectedTask.title}</p>
            <p className="text-xs text-muted-foreground">
              {selectedTask.description || 'No description'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No task selected
          </p>
        )}
      </Card>

      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Task Notes</h4>
        <p className="text-xs text-muted-foreground">
          Quick notes and reminders will appear here
        </p>
      </Card>
    </div>
  );
}

function FocusTools({ focusedMilestone }: { focusedMilestone?: any }) {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Target className="h-4 w-4 text-secondary" />
          <h4 className="font-semibold text-sm">Current Milestone</h4>
        </div>
        {focusedMilestone ? (
          <div className="space-y-2">
            <p className="text-xs font-medium">{focusedMilestone.title}</p>
            <p className="text-xs text-muted-foreground">
              {focusedMilestone.description || 'No description'}
            </p>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No milestone in focus
          </p>
        )}
      </Card>
    </div>
  );
}

function TasksTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Task Filters</h4>
        <p className="text-xs text-muted-foreground">
          Filter and sort options will appear here
        </p>
      </Card>
    </div>
  );
}

function DiscoveryTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3 bg-gradient-to-br from-primary/5 to-secondary/5">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Discovery Tips</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Tips for dream discovery conversations will appear here
        </p>
      </Card>
    </div>
  );
}

function CreateTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <h4 className="font-semibold text-sm">Creation Guide</h4>
        <p className="text-xs text-muted-foreground">
          Helpful hints for creating your dream will appear here
        </p>
      </Card>
    </div>
  );
}

function HubTools() {
  return (
    <div className="space-y-4">
      <Card className="p-4 space-y-3">
        <div className="flex items-center space-x-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <h4 className="font-semibold text-sm">Welcome</h4>
        </div>
        <p className="text-xs text-muted-foreground">
          Navigate to any view to see context-specific tools and insights
        </p>
      </Card>
    </div>
  );
}
