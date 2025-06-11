
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
  ChevronRight
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

  console.log("ProductivityJourney current_goals:", productivityJourney?.current_goals);

  const currentGoals = (productivityJourney?.current_goals || []) as Goal[];
  
  // Extract all tasks from goals and normalize them
  const allTasks: Task[] = currentGoals.flatMap(goal => 
    goal.tasks.map(task => {
      // Normalize the task to ensure it has all required properties
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

  console.log("Extracted and normalized tasks:", allTasks);

  // Group tasks by status for Kanban
  const tasksByStatus = {
    todo: allTasks.filter(task => task.status === 'todo'),
    in_progress: allTasks.filter(task => task.status === 'in_progress'),
    stuck: allTasks.filter(task => task.status === 'stuck'),
    completed: allTasks.filter(task => task.status === 'completed')
  };

  console.log("Tasks by status:", tasksByStatus);

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
    console.log(`Updating task ${taskId} to status ${newStatus}`);
    
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

    console.log("Updated goals with new task status:", updatedGoals);

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
      case 'todo': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'in_progress': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'stuck': return 'bg-red-100 text-red-800 border-red-200';
      case 'completed': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEnergyColor = (energy: string) => {
    switch (energy.toLowerCase()) {
      case 'low': return 'bg-green-100 text-green-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const TaskCard = ({ task, showGoal = false }: { task: Task; showGoal?: boolean }) => {
    const goal = currentGoals.find(g => g.id === task.goal_id);
    
    return (
      <div
        className={`p-3 border rounded-lg cursor-move hover:shadow-sm transition-shadow ${getStatusColor(task.status)}`}
        draggable
        onDragStart={() => handleDragStart(task)}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm">{task.title}</h4>
          {getStatusIcon(task.status)}
        </div>
        
        {task.description && (
          <p className="text-xs text-muted-foreground mb-2">{task.description}</p>
        )}
        
        <div className="flex flex-wrap gap-1 mb-2">
          <Badge variant="outline" className={`text-xs ${getEnergyColor(task.energy_level_required)}`}>
            {task.energy_level_required} energy
          </Badge>
          <Badge variant="outline" className="text-xs">
            {task.estimated_duration}
          </Badge>
          {task.optimal_time_of_day.slice(0, 2).map(time => (
            <Badge key={time} variant="outline" className="text-xs">
              {time}
            </Badge>
          ))}
        </div>
        
        {showGoal && goal && (
          <div className="flex items-center text-xs text-muted-foreground">
            <Target className="h-3 w-3 mr-1" />
            {goal.title}
          </div>
        )}
        
        {task.due_date && (
          <div className="flex items-center text-xs text-muted-foreground mt-1">
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
    icon 
  }: { 
    title: string; 
    status: 'todo' | 'in_progress' | 'stuck' | 'completed';
    tasks: Task[]; 
    icon: React.ReactNode;
  }) => (
    <div className="flex-1 min-w-64">
      <div className="flex items-center justify-between mb-3 p-3 bg-secondary/20 rounded-lg">
        <div className="flex items-center space-x-2">
          {icon}
          <h3 className="font-medium text-sm">{title}</h3>
        </div>
        <Badge variant="outline" className="text-xs">
          {tasks.length}
        </Badge>
      </div>
      
      <div
        className="space-y-3 min-h-96 p-2 border-2 border-dashed border-muted rounded-lg"
        onDragOver={handleDragOver}
        onDrop={(e) => handleDrop(e, status)}
      >
        {tasks.map(task => (
          <TaskCard key={task.id} task={task} showGoal />
        ))}
        
        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 text-muted-foreground">
            <p className="text-sm">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );

  if (currentGoals.length === 0) {
    return (
      <CosmicCard className="p-6">
        <div className="text-center py-12">
          <Brain className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-medium mb-2">No Intelligent Goals Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Create an AI-powered goal in the Goal Achievement tab to see your personalized planning board
          </p>
          <div className="flex items-center justify-center text-xs text-muted-foreground">
            <ChevronRight className="h-3 w-3 mr-1" />
            Switch to "AI Goals" tab to get started
          </div>
        </div>
      </CosmicCard>
    );
  }

  return (
    <CosmicCard className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-2">Intelligent Planning Board</h3>
        <p className="text-sm text-muted-foreground">
          AI-generated tasks and milestones from your goals, organized for optimal productivity
        </p>
        <div className="mt-2 text-xs text-muted-foreground">
          Found {allTasks.length} tasks from {currentGoals.length} goals
        </div>
      </div>

      <Tabs defaultValue="kanban" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="kanban" className="flex items-center gap-2">
            <Kanban className="h-4 w-4" />
            <span className="hidden sm:inline">Kanban Board</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar View</span>
          </TabsTrigger>
          <TabsTrigger value="list" className="flex items-center gap-2">
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">List View</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-4">
            <KanbanColumn
              title="To Do"
              status="todo"
              tasks={tasksByStatus.todo}
              icon={<List className="h-4 w-4 text-gray-600" />}
            />
            <KanbanColumn
              title="In Progress"
              status="in_progress"
              tasks={tasksByStatus.in_progress}
              icon={<Play className="h-4 w-4 text-blue-600" />}
            />
            <KanbanColumn
              title="Stuck"
              status="stuck"
              tasks={tasksByStatus.stuck}
              icon={<AlertCircle className="h-4 w-4 text-red-600" />}
            />
            <KanbanColumn
              title="Completed"
              status="completed"
              tasks={tasksByStatus.completed}
              icon={<CheckCircle2 className="h-4 w-4 text-green-600" />}
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
                className="rounded-md border"
              />
            </div>
            
            <div>
              <h4 className="font-medium mb-4">
                Tasks for {format(selectedDate, 'MMMM d, yyyy')}
              </h4>
              
              <div className="space-y-3">
                {tasksForSelectedDate.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <CalendarIcon className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">No tasks scheduled for this day</p>
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
              <div key={goal.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-medium">{goal.title}</h4>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">{goal.progress}%</div>
                    <Progress value={goal.progress} className="w-24 h-2 mt-1" />
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
      </Tabs>
    </CosmicCard>
  );
};
