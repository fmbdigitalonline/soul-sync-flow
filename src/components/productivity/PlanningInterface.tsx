
import React, { useState } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
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
  Brain,
  ChevronRight,
  TrendingUp,
  BarChart3
} from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { format, parseISO, isWithinInterval, startOfDay, endOfDay, isValid } from "date-fns";

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

export const PlanningInterface = () => {
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const currentGoals = (productivityJourney?.current_goals || []) as Goal[];
  
  // Extract all tasks from goals and normalize them
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

  // Calculate statistics
  const stats = {
    total: allTasks.length,
    completed: allTasks.filter(t => t.status === 'completed').length,
    inProgress: allTasks.filter(t => t.status === 'in_progress').length,
    stuck: allTasks.filter(t => t.status === 'stuck').length,
    completionRate: allTasks.length > 0 ? Math.round((allTasks.filter(t => t.status === 'completed').length / allTasks.length) * 100) : 0
  };

  // Group tasks by status for Kanban
  const tasksByStatus = {
    todo: allTasks.filter(task => task.status === 'todo'),
    in_progress: allTasks.filter(task => task.status === 'in_progress'),
    stuck: allTasks.filter(task => task.status === 'stuck'),
    completed: allTasks.filter(task => task.status === 'completed')
  };

  // Get tasks for selected date
  const tasksForSelectedDate = allTasks.filter(task => {
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

  const getEnergyColor = (energy: string) => {
    switch (energy.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const TaskCard = ({ task, showGoal = false }: { task: Task; showGoal?: boolean }) => {
    const goal = currentGoals.find(g => g.id === task.goal_id);
    
    return (
      <div
        className={`p-4 border-2 rounded-xl cursor-move transition-all duration-200 ${getStatusColor(task.status)} hover:shadow-md`}
        draggable
        onDragStart={() => handleDragStart(task)}
      >
        <div className="flex items-start justify-between mb-3">
          <h4 className="font-semibold text-sm leading-relaxed">{task.title}</h4>
          <div className="ml-2 flex-shrink-0">
            {getStatusIcon(task.status)}
          </div>
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mb-3 leading-relaxed">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className={`text-xs font-medium ${getEnergyColor(task.energy_level_required)}`}>
            {task.energy_level_required} energy
          </Badge>
          <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
            {task.estimated_duration}
          </Badge>
          {task.optimal_time_of_day.slice(0, 2).map(time => (
            <Badge key={time} variant="outline" className="text-xs bg-indigo-50 text-indigo-700 border-indigo-200">
              {time}
            </Badge>
          ))}
        </div>
        
        {showGoal && goal && (
          <div className="flex items-center text-xs text-muted-foreground mb-2">
            <Target className="h-3 w-3 mr-1" />
            <span className="truncate">{goal.title}</span>
          </div>
        )}
        
        {task.due_date && (
          <div className="flex items-center text-xs text-muted-foreground">
            <CalendarIcon className="h-3 w-3 mr-1" />
            {(() => {
              try {
                const date = parseISO(task.due_date);
                return isValid(date) ? format(date, 'MMM d') : 'Invalid date';
              } catch {
                return 'Invalid date';
              }
            })()}
          </div>
        )}
      </div>
    );
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
    <div className="flex-1 min-w-72">
      <div className={`flex items-center justify-between mb-4 p-4 rounded-xl ${accentColor}`}>
        <div className="flex items-center space-x-3">
          {icon}
          <h3 className="font-semibold text-sm">{title}</h3>
        </div>
        <Badge variant="secondary" className="text-xs font-bold">
          {tasks.length}
        </Badge>
      </div>
      
      <div
        className="space-y-3 min-h-96 p-3 border-2 border-dashed border-muted-foreground/20 rounded-xl bg-muted/10 transition-colors hover:border-muted-foreground/40"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} showGoal />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm font-medium">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );

  const StatCard = ({ label, value, icon, color }: { label: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className={`p-4 rounded-xl ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        {icon}
      </div>
    </div>
  );

  if (currentGoals.length === 0) {
    return (
      <CosmicCard className="p-8">
        <div className="text-center py-12">
          <Brain className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
          <h3 className="text-xl font-semibold mb-3">No AI Goals Yet</h3>
          <p className="text-muted-foreground mb-6 max-w-md mx-auto">
            Create an AI-powered goal in the Dream Achievement tab to see your personalized planning board with intelligent task breakdown
          </p>
          <div className="flex items-center justify-center text-sm text-soul-purple font-medium">
            <ChevronRight className="h-4 w-4 mr-1" />
            Switch to "Dreams" tab to get started
          </div>
        </div>
      </CosmicCard>
    );
  }

  return (
    <CosmicCard className="p-6">
      <div className="mb-6">
        <h3 className="text-xl font-semibold mb-2">Intelligent Task Management</h3>
        <p className="text-muted-foreground">
          AI-generated tasks and milestones from your goals, organized for optimal productivity
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard 
          label="Total Tasks" 
          value={stats.total} 
          icon={<List className="h-5 w-5 text-muted-foreground" />}
          color="bg-slate-50"
        />
        <StatCard 
          label="Completed" 
          value={stats.completed} 
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          color="bg-emerald-50"
        />
        <StatCard 
          label="In Progress" 
          value={stats.inProgress} 
          icon={<Play className="h-5 w-5 text-blue-600" />}
          color="bg-blue-50"
        />
        <StatCard 
          label="Success Rate" 
          value={stats.completionRate} 
          icon={<TrendingUp className="h-5 w-5 text-purple-600" />}
          color="bg-purple-50"
        />
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban Flow</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Task List</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span className="hidden sm:inline">Overview</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <div className="flex gap-6 overflow-x-auto pb-4">
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={tasksByStatus.todo}
              icon={<List className="h-5 w-5 text-slate-600" />}
              accentColor="bg-slate-100"
            />
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              tasks={tasksByStatus.in_progress}
              icon={<Play className="h-5 w-5 text-blue-600" />}
              accentColor="bg-blue-100"
            />
            <KanbanColumn
              title="Stuck"
              status="stuck"
              tasks={tasksByStatus.stuck}
              icon={<AlertCircle className="h-5 w-5 text-amber-600" />}
              accentColor="bg-amber-100"
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              tasks={tasksByStatus.completed}
              icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
              accentColor="bg-emerald-100"
            />
          </div>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                className="rounded-xl border"
              />
            </div>
            
            <div>
              <h4 className="font-semibold mb-4 text-lg">
                Tasks for {format(selectedDate, 'MMMM d, yyyy')}
              </h4>
              
              <div className="space-y-3">
                {tasksForSelectedDate.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-4" />
                    <p className="font-medium">No tasks scheduled for this day</p>
                    <p className="text-sm">Select a different date or add tasks to your goals</p>
                  </div>
                ) : (
                  tasksForSelectedDate.map(task => (
                    <TaskCard key={task.id} task={task} showGoal />
                  ))
                )}
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="list" className="mt-6">
          <div className="space-y-6">
            {currentGoals.map(goal => (
              <div key={goal.id} className="border rounded-xl p-6 bg-gradient-to-r from-background to-muted/20">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h4 className="text-lg font-semibold">{goal.title}</h4>
                    <p className="text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium mb-1">{goal.progress}% Complete</div>
                    <Progress value={goal.progress} className="w-24 h-2" />
                  </div>
                </div>
                
                <div className="grid gap-3">
                  {goal.tasks.map(task => {
                    const normalizedTask: Task = {
                      ...task,
                      status: task.completed ? 'completed' : (task.status || 'todo'),
                      estimated_duration: task.estimated_duration || '30 min',
                      energy_level_required: task.energy_level_required || 'medium',
                      category: task.category || 'execution',
                      optimal_time_of_day: Array.isArray(task.optimal_time_of_day) ? task.optimal_time_of_day : ['morning'],
                    };
                    return <TaskCard key={task.id} task={normalizedTask} />;
                  })}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="dashboard" className="mt-6">
          <div className="grid gap-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentGoals.map(goal => (
                <div key={goal.id} className="p-6 border rounded-xl bg-gradient-to-br from-background to-muted/20">
                  <div className="flex items-center justify-between mb-4">
                    <Target className="h-8 w-8 text-soul-purple" />
                    <Badge variant="outline" className="text-xs">
                      {goal.category}
                    </Badge>
                  </div>
                  <h4 className="font-semibold mb-2">{goal.title}</h4>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span className="font-medium">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div>
                        <span className="text-muted-foreground">Tasks</span>
                        <p className="font-medium">{goal.tasks.length}</p>
                      </div>
                      <div>
                        <span className="text-muted-foreground">Completed</span>
                        <p className="font-medium">{goal.tasks.filter(t => t.completed).length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </CosmicCard>
  );
};
