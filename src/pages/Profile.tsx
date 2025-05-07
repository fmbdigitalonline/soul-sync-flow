
import React, { useState } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Settings, LogOut, ArrowUpRight, Bell, Moon, Sun, Check } from "lucide-react";
import { FocusToggle } from "@/components/ui/focus-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Profile = () => {
  const { toast } = useToast();
  const [darkMode, setDarkMode] = useState(false);

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    
    toast({
      title: checked ? "Dark mode enabled" : "Light mode enabled",
      description: checked 
        ? "Switched to dark theme" 
        : "Switched to light theme",
      duration: 2000,
    });
  };

  const handleTaskComplete = () => {
    toast({
      title: "Task completed!",
      description: "Great job on completing your task.",
      icon: <Check className="h-4 w-4 text-green-500" />,
      duration: 2000,
    });
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-20 w-20 mb-4 shadow-soft-ui">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" alt="Sarah" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold font-heading mb-1">Sarah Johnson</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="bg-soul-teal bg-opacity-20">Leo Sun</Badge>
            <Badge variant="outline" className="bg-soul-lavender bg-opacity-20">INFJ</Badge>
            <Badge variant="outline" className="bg-soul-pewter bg-opacity-20">Projector</Badge>
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 rounded-comfort">
            <TabsTrigger value="stats" className="text-base">Stats</TabsTrigger>
            <TabsTrigger value="goals" className="text-base">Goals</TabsTrigger>
            <TabsTrigger value="settings" className="text-base">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-grid-16">
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">Your Growth Journey</h2>
              
              <div className="space-y-grid-16">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">Blueprint Completion</span>
                    <span className="text-base font-medium">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">Active Goals</span>
                    <span className="text-base font-medium">2/4</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">Tasks Completed</span>
                    <span className="text-base font-medium">24</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">Coach Conversations</span>
                    <span className="text-base font-medium">12</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">Weekly Insights</h2>
              
              <div className="space-y-grid-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">Most Productive Day</p>
                    <p className="text-sm text-muted-foreground">Wednesday</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+28%</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">Energy Peaks</p>
                    <p className="text-sm text-muted-foreground">Morning: 9-11am</p>
                  </div>
                  <Badge className="bg-soul-teal bg-opacity-20 text-teal-800 hover:bg-soul-teal hover:bg-opacity-20">Aligned</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">Focus Sessions</p>
                    <p className="text-sm text-muted-foreground">8 completed</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">+2</Badge>
                </div>
              </div>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-grid-16">
            <GoalCard 
              title="Complete meditation course"
              progress={75}
              alignedWith={["Pisces Moon", "INFJ"]}
              status="On track"
              onComplete={handleTaskComplete}
            />
            
            <GoalCard 
              title="Launch creative project"
              progress={40}
              alignedWith={["Leo Sun", "Life Path 7"]}
              status="Needs attention"
              statusColor="bg-amber-100 text-amber-800"
              onComplete={handleTaskComplete}
            />
            
            <GoalCard 
              title="Learn new skill"
              progress={20}
              alignedWith={["Virgo Rising", "Projector"]}
              status="Just started"
              onComplete={handleTaskComplete}
            />
            
            <CosmicCard className="text-center p-4 rounded-comfort">
              <Button
                variant="ghost"
                className="text-soul-teal w-full flex items-center justify-center interactive-element"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View All Goals
              </Button>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-grid-16">
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">App Settings</h2>
              
              <div className="space-y-grid-16">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="notifications" className="text-base">Notifications</Label>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? 
                      <Moon className="h-5 w-5 text-muted-foreground" /> : 
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    }
                    <Label htmlFor="dark-mode" className="text-base">Dark Mode</Label>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={toggleDarkMode} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <FocusToggle />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer interactive-element hover:bg-muted p-2 rounded-md">
                        <div className="flex items-center space-x-3">
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <span className="text-base">Account Settings</span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Configure your account preferences</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CosmicCard>
            
            <CosmicCard className="text-center p-4 rounded-comfort">
              <Button
                variant="ghost"
                className="text-destructive w-full flex items-center justify-center interactive-element"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log Out
              </Button>
            </CosmicCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

interface GoalCardProps {
  title: string;
  progress: number;
  alignedWith: string[];
  status: string;
  statusColor?: string;
  onComplete?: () => void;
}

const GoalCard = ({
  title,
  progress,
  alignedWith,
  status,
  statusColor = "bg-green-100 text-green-800",
  onComplete
}: GoalCardProps) => {
  return (
    <CosmicCard className="p-6 rounded-comfort">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium font-heading">{title}</h3>
        <Badge className={statusColor}>{status}</Badge>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {alignedWith.map((trait) => (
            <Badge key={trait} variant="outline" className="bg-secondary text-xs">
              {trait}
            </Badge>
          ))}
        </div>
        
        {progress < 100 && (
          <Button 
            size="sm" 
            variant="outline"
            className="ml-2 interactive-element"
            onClick={onComplete}
          >
            <Check className="h-4 w-4 mr-1" /> Complete
          </Button>
        )}
      </div>
    </CosmicCard>
  );
};

export default Profile;
