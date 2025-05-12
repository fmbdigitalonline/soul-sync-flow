import React, { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Plus, Clock, Trash2, Calendar, Star, MoreVertical, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { SpeechBubble } from "@/components/ui/speech-bubble";
import { ProductivityDashboard } from "@/components/productivity/ProductivityDashboard";

// Define task types
type TaskStatus = "todo" | "in-progress" | "stuck" | "completed";

type Task = {
  id: string;
  title: string;
  completed: boolean;
  status: TaskStatus;
  dueDate?: string;
  priority: "low" | "medium" | "high";
  alignedWith: string[];
};

// Mock initial tasks
const initialTasks: Task[] = [
  {
    id: "1",
    title: "Meditate for 15 minutes",
    completed: false,
    status: "todo",
    priority: "high",
    alignedWith: ["Pisces Moon", "Projector"],
  },
  {
    id: "2",
    title: "Write in gratitude journal",
    completed: false,
    status: "in-progress",
    dueDate: "Today",
    priority: "medium",
    alignedWith: ["INFJ", "Life Path 7"],
  },
  {
    id: "3",
    title: "Plan creative project outline",
    completed: false,
    status: "stuck",
    dueDate: "Tomorrow",
    priority: "high",
    alignedWith: ["Leo Sun", "Virgo Rising"],
  },
  {
    id: "4",
    title: "Review weekly goals",
    completed: true,
    status: "completed",
    priority: "medium",
    alignedWith: ["Virgo Rising", "INFJ"],
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeView, setActiveView] = useState<"list" | "kanban">("list");
  const [activeTab, setActiveTab] = useState("all");
  const [helpVisible, setHelpVisible] = useState(false);
  const [showProductivityTools, setShowProductivityTools] = useState(true);
  const { toast } = useToast();

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
      status: "todo", // This is now properly typed as TaskStatus
      priority: "medium",
      alignedWith: ["Leo Sun", "INFJ"], // Default alignment for demo
    };

    setTasks([newTask, ...tasks]);
    setNewTaskTitle("");

    toast({
      title: "Task added",
      description: "Your new aligned task has been created.",
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleAddTask();
    }
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === id) {
          const updatedTask = { 
            ...task, 
            completed: !task.completed,
            status: !task.completed ? "completed" as TaskStatus : "todo" as TaskStatus
          };
          return updatedTask;
        }
        return task;
      })
    );

    const task = tasks.find((t) => t.id === id);
    if (task) {
      toast({
        title: task.completed ? "Task reopened" : "Task completed",
        description: task.completed ? "You've reopened this task" : "Great job completing this task!",
      });
    }
  };

  const updateTaskStatus = (taskId: string, newStatus: TaskStatus) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === taskId) {
          const completed = newStatus === "completed";
          return {
            ...task,
            status: newStatus,
            completed
          };
        }
        return task;
      })
    );

    // Show help bubble when a task is marked as stuck
    if (newStatus === "stuck") {
      setHelpVisible(true);
      setTimeout(() => {
        setHelpVisible(false);
      }, 8000);
    }
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id));
    
    toast({
      title: "Task deleted",
      description: "Your task has been removed.",
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (activeTab === "all") return true;
    if (activeTab === "active") return !task.completed;
    return task.completed;
  });

  const getPriorityColor = (priority: "low" | "medium" | "high") => {
    switch (priority) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-orange-100 text-orange-800";
      case "high":
        return "bg-rose-100 text-rose-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get tasks for each status column in Kanban view
  const todoTasks = tasks.filter(task => task.status === "todo");
  const inProgressTasks = tasks.filter(task => task.status === "in-progress");
  const stuckTasks = tasks.filter(task => task.status === "stuck");
  const completedTasks = tasks.filter(task => task.status === "completed");

  return (
    <MainLayout>
      <div className="p-4 max-w-5xl mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">Aligned Tasks</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Tasks personalized to your Soul Blueprint
          </p>
        </div>

        {showProductivityTools && (
          <div className="mb-6">
            <ProductivityDashboard />
          </div>
        )}

        <CosmicCard className="mb-6">
          <div className="flex items-center space-x-2">
            <Input
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Add a new aligned task..."
              className="flex-1"
            />
            <GradientButton
              size="icon"
              onClick={handleAddTask}
              disabled={newTaskTitle.trim() === ""}
            >
              <Plus className="h-4 w-4" />
            </GradientButton>
          </div>
        </CosmicCard>

        <div className="flex justify-between items-center mb-4">
          <Tabs
            defaultValue="all"
            className="w-full"
            onValueChange={(value) => setActiveTab(value)}
          >
            <TabsList className="grid w-full max-w-xs grid-cols-3">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="completed">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant={activeView === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("list")}
            >
              List
            </Button>
            <Button 
              variant={activeView === "kanban" ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveView("kanban")}
            >
              Kanban
            </Button>
          </div>
        </div>

        {activeView === "list" ? (
          <TabsContent value={activeTab} className="space-y-3">
            {filteredTasks.length === 0 ? (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No tasks found</p>
                {activeTab !== "all" && (
                  <Button
                    variant="link"
                    onClick={() => setActiveTab("all")}
                    className="mt-2"
                  >
                    View all tasks
                  </Button>
                )}
              </div>
            ) : (
              filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggle={() => toggleTaskCompletion(task.id)}
                  onDelete={() => deleteTask(task.id)}
                  onStatusChange={(status) => updateTaskStatus(task.id, status)}
                  priorityColor={getPriorityColor(task.priority)}
                />
              ))
            )}
          </TabsContent>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-2">
            <KanbanColumn 
              title="To Do" 
              tasks={todoTasks} 
              status="todo"
              onToggle={toggleTaskCompletion}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
              getPriorityColor={getPriorityColor}
            />
            <KanbanColumn 
              title="In Progress" 
              tasks={inProgressTasks} 
              status="in-progress"
              onToggle={toggleTaskCompletion}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
              getPriorityColor={getPriorityColor}
            />
            <KanbanColumn 
              title="Stuck" 
              tasks={stuckTasks} 
              status="stuck"
              onToggle={toggleTaskCompletion}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
              getPriorityColor={getPriorityColor}
              helpVisible={helpVisible}
            />
            <KanbanColumn 
              title="Completed" 
              tasks={completedTasks} 
              status="completed"
              onToggle={toggleTaskCompletion}
              onDelete={deleteTask}
              onStatusChange={updateTaskStatus}
              getPriorityColor={getPriorityColor}
            />
          </div>
        )}
      </div>
    </MainLayout>
  );
};

const TaskCard = ({
  task,
  onToggle,
  onDelete,
  onStatusChange,
  priorityColor,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  onStatusChange: (status: TaskStatus) => void;
  priorityColor: string;
}) => {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <CosmicCard>
      <div className="flex items-center space-x-4">
        <Button
          size="icon"
          variant="outline"
          className={cn(
            "rounded-full h-6 w-6 p-0 flex-shrink-0",
            task.completed && "bg-soul-purple text-white"
          )}
          onClick={onToggle}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </Button>

        <div className="flex-1 min-w-0">
          <p
            className={cn(
              "text-sm font-medium truncate",
              task.completed && "line-through text-muted-foreground"
            )}
          >
            {task.title}
          </p>
          <div className="flex items-center space-x-2 mt-1">
            {task.dueDate && (
              <div className="flex items-center space-x-1 text-xs text-muted-foreground">
                <Clock className="h-3 w-3" />
                <span>{task.dueDate}</span>
              </div>
            )}
            <Badge variant="outline" className={cn("text-xs py-0 px-2", priorityColor)}>
              {task.priority}
            </Badge>
            {task.status === "stuck" && (
              <Badge variant="outline" className="bg-red-100 text-red-800 text-xs py-0 px-2">
                Stuck
              </Badge>
            )}
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <div className="relative">
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8"
              onClick={() => setShowMenu(!showMenu)}
            >
              <MoreVertical className="h-4 w-4 text-muted-foreground" />
            </Button>
            
            {showMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md py-1 z-10">
                <p className="px-4 py-1 text-xs text-muted-foreground">Status</p>
                <button 
                  onClick={() => {
                    onStatusChange("todo");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  To Do
                </button>
                <button 
                  onClick={() => {
                    onStatusChange("in-progress");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  In Progress
                </button>
                <button 
                  onClick={() => {
                    onStatusChange("stuck");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Stuck
                </button>
                <button 
                  onClick={() => {
                    onStatusChange("completed");
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                >
                  Completed
                </button>
                <div className="border-t border-gray-200 my-1"></div>
                <button 
                  onClick={() => {
                    onDelete();
                    setShowMenu(false);
                  }}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {task.alignedWith.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1">
          {task.alignedWith.map((trait) => (
            <div
              key={trait}
              className="flex items-center space-x-1 bg-secondary rounded-full px-2 py-0.5 text-xs"
            >
              <Star className="h-3 w-3 text-soul-purple" />
              <span>{trait}</span>
            </div>
          ))}
        </div>
      )}
    </CosmicCard>
  );
};

const KanbanColumn = ({
  title,
  tasks,
  status,
  onToggle,
  onDelete,
  onStatusChange,
  getPriorityColor,
  helpVisible = false,
}: {
  title: string;
  tasks: Task[];
  status: TaskStatus;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
  getPriorityColor: (priority: "low" | "medium" | "high") => string;
  helpVisible?: boolean;
}) => {
  return (
    <div className="relative bg-secondary/30 rounded-md p-3">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-medium text-sm">
          {title} <span className="ml-1 text-muted-foreground">({tasks.length})</span>
        </h3>
        {status === "stuck" && helpVisible && (
          <div className="absolute -top-4 right-4 z-20">
            <SpeechBubble position="top">
              <p className="text-sm">I notice you have a stuck task. Would you like some help or suggestions to move it forward?</p>
            </SpeechBubble>
          </div>
        )}
        {status === "stuck" && (
          <AlertCircle className="h-4 w-4 text-red-500" />
        )}
      </div>
      <div className="space-y-2">
        {tasks.map(task => (
          <div 
            key={task.id}
            className="bg-background rounded-md shadow-sm" 
            draggable
            onDragStart={(e) => {
              e.dataTransfer.setData('taskId', task.id);
            }}
          >
            <TaskCard
              task={task}
              onToggle={() => onToggle(task.id)}
              onDelete={() => onDelete(task.id)}
              onStatusChange={(newStatus) => onStatusChange(task.id, newStatus)}
              priorityColor={getPriorityColor(task.priority)}
            />
          </div>
        ))}
        {tasks.length === 0 && (
          <div className="text-center py-4 text-muted-foreground text-sm">
            No tasks
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;
