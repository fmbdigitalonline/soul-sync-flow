
import React, { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Check, Plus, Clock, Trash2, Calendar, Star, MoreVertical } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Define task types
type Task = {
  id: string;
  title: string;
  completed: boolean;
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
    priority: "high",
    alignedWith: ["Pisces Moon", "Projector"],
  },
  {
    id: "2",
    title: "Write in gratitude journal",
    completed: false,
    dueDate: "Today",
    priority: "medium",
    alignedWith: ["INFJ", "Life Path 7"],
  },
  {
    id: "3",
    title: "Plan creative project outline",
    completed: false,
    dueDate: "Tomorrow",
    priority: "high",
    alignedWith: ["Leo Sun", "Virgo Rising"],
  },
  {
    id: "4",
    title: "Review weekly goals",
    completed: true,
    priority: "medium",
    alignedWith: ["Virgo Rising", "INFJ"],
  },
];

const Tasks = () => {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const { toast } = useToast();

  const handleAddTask = () => {
    if (newTaskTitle.trim() === "") return;

    const newTask: Task = {
      id: Date.now().toString(),
      title: newTaskTitle,
      completed: false,
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
      tasks.map((task) =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

    const task = tasks.find((t) => t.id === id);
    if (task) {
      toast({
        title: task.completed ? "Task reopened" : "Task completed",
        description: task.completed ? "You've reopened this task" : "Great job completing this task!",
      });
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

  return (
    <MainLayout>
      <div className="p-4 max-w-md mx-auto">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold font-display">
            <span className="gradient-text">Aligned Tasks</span>
          </h1>
          <p className="text-sm text-muted-foreground">
            Tasks personalized to your Soul Blueprint
          </p>
        </div>

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

        <Tabs
          defaultValue="all"
          className="w-full"
          onValueChange={(value) => setActiveTab(value)}
        >
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>

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
                  priorityColor={getPriorityColor(task.priority)}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

const TaskCard = ({
  task,
  onToggle,
  onDelete,
  priorityColor,
}: {
  task: Task;
  onToggle: () => void;
  onDelete: () => void;
  priorityColor: string;
}) => {
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
          </div>
        </div>

        <div className="flex items-center space-x-1">
          <Button
            size="icon"
            variant="ghost"
            className="h-8 w-8"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 text-muted-foreground" />
          </Button>
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

export default Tasks;
