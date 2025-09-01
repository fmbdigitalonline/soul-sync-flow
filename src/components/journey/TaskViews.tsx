import React, { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Calendar } from "@/components/ui/calendar";
import { 
  Calendar as CalendarIcon, 
  Kanban, 
  List, 
  Clock, 
  Target, 
  CheckCircle2,
  AlertCircle,
  Pause,
  Play,
  ArrowLeft,
  MessageCircle,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isValid } from "date-fns";
import { TaskCard } from "../task/TaskCard";
import { useIsMobile } from "@/hooks/use-mobile";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/translation-utils";

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
  completed?: boolean;
}

interface Goal {
  id: string;
  title: string;
  description: string;
  progress: number;
  tasks: Task[];
  milestones: any[];
  target_completion: string;
  category: string;
}

interface TaskViewsProps {
  focusedMilestone?: any;
  onBackToJourney: () => void;
  onTaskSelect: (task: Task) => void;
}

export const TaskViews: React.FC<TaskViewsProps> = ({ 
  focusedMilestone, 
  onBackToJourney, 
  onTaskSelect 
}) => {
  const { t } = useLanguage();
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [activeView, setActiveView] = useState<'kanban' | 'list' | 'calendar'>('kanban');
  const [mobileKanbanColumn, setMobileKanbanColumn] = useState<'todo' | 'in_progress' | 'stuck' | 'completed'>('todo');
  const isMobile = useIsMobile();

  // Extract all tasks from goals and normalize them
  const currentGoals = (productivityJourney?.current_goals || []) as Goal[];
  const allTasks: Task[] = currentGoals.flatMap(goal => 
    goal.tasks.map(task => {
      const normalizedTask: Task = {
        id: task.id,
        title: task.title,
        description: task.description || '',
        status: task.completed ? 'completed' : (task.status || 'todo'),
        due_date: task.due_date,
        estimated_duration: task.estimated_duration || '30 min',
        energy_level_required: task.energy_level_required || 'medium',
        category: task.category || 'execution',
        optimal_time_of_day: Array.isArray(task.optimal_time_of_day) ? task.optimal_time_of_day : ['morning'],
        goal_id: goal.id
      };
      return normalizedTask;
    })
  );

  // Filter tasks by focused milestone if provided
  const filteredTasks = focusedMilestone 
    ? allTasks.filter(task => {
        // For now, showing all tasks from the same goal as the milestone
        const goal = currentGoals.find(g => g.milestones?.some(m => m.id === focusedMilestone.id));
        return goal && task.goal_id === goal.id;
      })
    : allTasks;

  // Group tasks by status for Kanban
  const tasksByStatus = {
    todo: filteredTasks.filter(task => task.status === 'todo'),
    in_progress: filteredTasks.filter(task => task.status === 'in_progress'),
    stuck: filteredTasks.filter(task => task.status === 'stuck'),
    completed: filteredTasks.filter(task => task.status === 'completed')
  };

  // Get tasks for selected date
  const tasksForSelectedDate = filteredTasks.filter(task => {
    if (!task.due_date) return false;
    try {
      const taskDate = parseISO(task.due_date);
      if (!isValid(taskDate)) return false;
      return isWithinInterval(taskDate, {
        start: startOfDay(selectedDate),
        end: endOfDay(selectedDate)
      });
    } catch {
      return false;
    }
  });

  const updateTaskStatus = async (taskId: string, newStatus: 'todo' | 'in_progress' | 'stuck' | 'completed') => {
    const updatedGoals = currentGoals.map(goal => ({
      ...goal,
      tasks: goal.tasks.map(task => 
        task.id === taskId ? { 
          ...task, 
          status: newStatus,
          completed: newStatus === 'completed'
        } : task
      )
    }));

    await updateProductivityJourney({
      current_goals: updatedGoals
    });
  };

  const handleTaskStatusChange = (task: Task, newStatus: 'todo' | 'in_progress' | 'stuck' | 'completed') => {
    updateTaskStatus(task.id, newStatus);
  };

  const handleTaskMarkDone = (task: Task) => {
    updateTaskStatus(task.id, 'completed');
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, newStatus: 'todo' | 'in_progress' | 'stuck' | 'completed') => {
    e.preventDefault();
    if (draggedTask) {
      updateTaskStatus(draggedTask.id, newStatus);
      setDraggedTask(null);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <List className="h-4 w-4" />;
      case 'in_progress': return <Play className="h-4 w-4" />;
      case 'stuck': return <Pause className="h-4 w-4" />;
      case 'completed': return <CheckCircle2 className="h-4 w-4" />;
      default: return <List className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'todo': return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
      case 'in_progress': return 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100';
      case 'stuck': return 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100';
      case 'completed': return 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100';
      default: return 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
    }
  };

  const handleTaskDoubleTap = (task: Task) => {
    onTaskSelect(task);
  };

  const handleTaskSingleTap = (task: Task) => {
    // Optional: Add visual feedback for single tap
    console.log('Single tap on task:', task.title);
  };

  const KanbanColumn = ({ 
    title, 
    status, 
    tasks, 
    icon,
    accentColor
  }: { 
    title: string; 
    status: 'todo' | 'in_progress' | 'stuck' | 'completed';
    tasks: Task[]; 
    icon: React.ReactNode;
    accentColor: string;
  }) => (
    <div className={`flex-1 ${isMobile ? 'w-full' : 'min-w-64'}`}>
      <div className={`flex items-center justify-between mb-3 p-3 rounded-lg ${accentColor}`}>
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      <div
        className={`space-y-2 p-2 border-2 border-dashed border-muted-foreground/20 rounded-lg bg-muted/5 transition-colors hover:border-muted-foreground/40 ${
          isMobile ? 'min-h-60' : 'min-h-80'
        }`}
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {tasks.map(task => (
          <div key={task.id} draggable onDragStart={() => handleDragStart(task)}>
            <TaskCard 
              task={task} 
              onDoubleTap={handleTaskDoubleTap}
              onSingleTap={handleTaskSingleTap}
              onStatusChange={handleTaskStatusChange}
              onMarkDone={handleTaskMarkDone}
              showGoal 
            />
          </div>
        ))}
        
        {tasks.length === 0 && (
          <div className={`flex items-center justify-center text-muted-foreground ${isMobile ? 'h-20' : 'h-32'}`}>
            <p className="text-sm">{t('tasks.dropTasksHere')}</p>
          </div>
        )}
      </div>
    </div>
  );

  const statusColumns = [
    {
      key: 'todo' as const,
      title: t('tasks.todo'),
      tasks: tasksByStatus.todo,
      icon: <List className="h-4 w-4 text-slate-600" />,
      accentColor: 'bg-slate-100'
    },
    {
      key: 'in_progress' as const,
      title: t('tasks.inProgress'),
      tasks: tasksByStatus.in_progress,
      icon: <Play className="h-4 w-4 text-blue-600" />,
      accentColor: 'bg-blue-100'
    },
    {
      key: 'stuck' as const,
      title: t('tasks.stuck'),
      tasks: tasksByStatus.stuck,
      icon: <AlertCircle className="h-4 w-4 text-amber-600" />,
      accentColor: 'bg-amber-100'
    },
    {
      key: 'completed' as const,
      title: t('tasks.completed'),
      tasks: tasksByStatus.completed,
      icon: <CheckCircle2 className="h-4 w-4 text-emerald-600" />,
      accentColor: 'bg-emerald-100'
    }
  ];

  const currentColumnIndex = statusColumns.findIndex(col => col.key === mobileKanbanColumn);
  const currentColumn = statusColumns[currentColumnIndex];

  return (
    <div className="space-y-4">
      {/* Context Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBackToJourney}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            {t('tasks.backToJourney')}
          </Button>
          
          {focusedMilestone && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium">{t('tasks.focusingOn')}</span> {focusedMilestone.title}
            </div>
          )}
        </div>
        
        <div className="text-sm text-muted-foreground">
          {safeInterpolateTranslation(t('tasks.tasksCompleted'), { 
            tasks: filteredTasks.length.toString(), 
            completed: filteredTasks.filter(t => t.status === 'completed').length.toString() 
          })}
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex gap-2">
        <Button
          variant={activeView === 'kanban' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('kanban')}
          className="flex items-center gap-2"
        >
          <Kanban className="h-4 w-4" />
          {t('tasks.flow')}
        </Button>
        <Button
          variant={activeView === 'list' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('list')}
          className="flex items-center gap-2"
        >
          <List className="h-4 w-4" />
          {t('tasks.tasks')}
        </Button>
        <Button
          variant={activeView === 'calendar' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setActiveView('calendar')}
          className="flex items-center gap-2"
        >
          <CalendarIcon className="h-4 w-4" />
          {t('tasks.calendar')}
        </Button>
      </div>

      {/* View Content */}
      {activeView === 'kanban' && (
        <>
          {isMobile ? (
            /* Mobile: Single Column View with Navigation */
            <div className="space-y-4">
              {/* Mobile Column Navigation */}
              <div className="flex items-center justify-between bg-white rounded-lg p-3 border">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const prevIndex = Math.max(0, currentColumnIndex - 1);
                    setMobileKanbanColumn(statusColumns[prevIndex].key);
                  }}
                  disabled={currentColumnIndex === 0}
                  className="flex items-center gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('tasks.prev')}
                </Button>
                
                <div className="flex items-center gap-2">
                  {currentColumn.icon}
                  <span className="font-medium text-sm">{currentColumn.title}</span>
                  <Badge variant="secondary" className="text-xs">
                    {currentColumn.tasks.length}
                  </Badge>
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const nextIndex = Math.min(statusColumns.length - 1, currentColumnIndex + 1);
                    setMobileKanbanColumn(statusColumns[nextIndex].key);
                  }}
                  disabled={currentColumnIndex === statusColumns.length - 1}
                  className="flex items-center gap-1"
                >
                  {t('tasks.next')}
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>

              {/* Mobile Column Indicators */}
              <div className="flex justify-center gap-1">
                {statusColumns.map((col, index) => (
                  <button
                    key={col.key}
                    onClick={() => setMobileKanbanColumn(col.key)}
                    className={`w-2 h-2 rounded-full transition-colors ${
                      index === currentColumnIndex ? 'bg-blue-500' : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              
              {/* Current Column */}
              <KanbanColumn
                title={currentColumn.title}
                status={currentColumn.key}
                tasks={currentColumn.tasks}
                icon={currentColumn.icon}
                accentColor={currentColumn.accentColor}
              />
            </div>
          ) : (
            /* Desktop: All Columns Side by Side */
            <div className="flex gap-4 overflow-x-auto pb-4">
              {statusColumns.map(column => (
                <KanbanColumn
                  key={column.key}
                  title={column.title}
                  status={column.key}
                  tasks={column.tasks}
                  icon={column.icon}
                  accentColor={column.accentColor}
                />
              ))}
            </div>
          )}
        </>
      )}

      {activeView === 'list' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-gray-800">{t('tasks.allTasks')}</h3>
            <Badge variant="outline" className="text-xs">
              {t('tasks.doubleTapForCoaching')}
            </Badge>
          </div>
          {filteredTasks.map(task => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onDoubleTap={handleTaskDoubleTap}
              onSingleTap={handleTaskSingleTap}
              onStatusChange={handleTaskStatusChange}
              onMarkDone={handleTaskMarkDone}
              showGoal 
            />
          ))}
          {filteredTasks.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              <List className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('tasks.noTasksFound')}</p>
            </div>
          )}
        </div>
      )}

      {activeView === 'calendar' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(date) => date && setSelectedDate(date)}
              className="rounded-lg border"
            />
          </div>
          
          <div>
            <h4 className="font-medium mb-3">
              {safeInterpolateTranslation(t('tasks.tasksFor'), { date: format(selectedDate, 'MMMM d, yyyy') })}
            </h4>
            
            <div className="space-y-2">
              {tasksForSelectedDate.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <CalendarIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('tasks.noTasksScheduled')}</p>
                </div>
              ) : (
                tasksForSelectedDate.map(task => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onDoubleTap={handleTaskDoubleTap}
                    onSingleTap={handleTaskSingleTap}
                    onStatusChange={handleTaskStatusChange}
                    onMarkDone={handleTaskMarkDone}
                    showGoal 
                  />
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
