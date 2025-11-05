import React from 'react';
import { useLocation } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, Clock, Zap } from 'lucide-react';
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
  return (
    <div className="space-y-4">
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
            Select a goal to see quick actions
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
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Milestones</span>
              <span className="font-medium">
                {activeGoal.completedMilestones || 0}/{activeGoal.totalMilestones || 0}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Tasks</span>
              <span className="font-medium">
                {activeGoal.completedTasks || 0}/{activeGoal.totalTasks || 0}
              </span>
            </div>
          </div>
        ) : (
          <p className="text-xs text-muted-foreground">
            No active goal selected
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
          Personality-based tips and guidance will appear here
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
