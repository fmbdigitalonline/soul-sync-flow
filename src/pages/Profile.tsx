
import React from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Settings, LogOut, ArrowUpRight, Bell, Moon, Sun } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out.",
    });
  };

  return (
    <MainLayout>
      <div className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-20 w-20 mb-4">
            <AvatarImage src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=256&q=80" alt="Sarah" />
            <AvatarFallback>S</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold font-display">Sarah Johnson</h1>
          <div className="flex items-center space-x-2 mt-1">
            <Badge variant="outline" className="bg-soul-lavender bg-opacity-20">Leo Sun</Badge>
            <Badge variant="outline" className="bg-soul-lavender bg-opacity-20">INFJ</Badge>
            <Badge variant="outline" className="bg-soul-lavender bg-opacity-20">Projector</Badge>
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="goals">Goals</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-4">
            <CosmicCard>
              <h2 className="font-medium mb-4">Your Growth Journey</h2>
              
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Blueprint Completion</span>
                    <span className="text-sm font-medium">100%</span>
                  </div>
                  <Progress value={100} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Active Goals</span>
                    <span className="text-sm font-medium">2/4</span>
                  </div>
                  <Progress value={50} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Tasks Completed</span>
                    <span className="text-sm font-medium">24</span>
                  </div>
                  <Progress value={80} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Coach Conversations</span>
                    <span className="text-sm font-medium">12</span>
                  </div>
                  <Progress value={60} className="h-2" />
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard>
              <h2 className="font-medium mb-4">Weekly Insights</h2>
              
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Most Productive Day</p>
                    <p className="text-xs text-muted-foreground">Wednesday</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">+28%</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Energy Peaks</p>
                    <p className="text-xs text-muted-foreground">Morning: 9-11am</p>
                  </div>
                  <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100">Aligned</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium">Focus Sessions</p>
                    <p className="text-xs text-muted-foreground">8 completed</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">+2</Badge>
                </div>
              </div>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-4">
            <GoalCard 
              title="Complete meditation course"
              progress={75}
              alignedWith={["Pisces Moon", "INFJ"]}
              status="On track"
            />
            
            <GoalCard 
              title="Launch creative project"
              progress={40}
              alignedWith={["Leo Sun", "Life Path 7"]}
              status="Needs attention"
              statusColor="bg-amber-100 text-amber-800"
            />
            
            <GoalCard 
              title="Learn new skill"
              progress={20}
              alignedWith={["Virgo Rising", "Projector"]}
              status="Just started"
            />
            
            <CosmicCard className="text-center">
              <Button
                variant="ghost"
                className="text-soul-purple w-full flex items-center justify-center"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                View All Goals
              </Button>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-4">
            <CosmicCard>
              <h2 className="font-medium mb-4">App Settings</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <span>Notifications</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">On</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Moon className="h-5 w-5 text-muted-foreground" />
                    <span>Dark Mode</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-muted-foreground">Off</span>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Settings className="h-5 w-5 text-muted-foreground" />
                    <span>Account Settings</span>
                  </div>
                  <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard className="text-center">
              <Button
                variant="ghost"
                className="text-destructive w-full flex items-center justify-center"
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

const GoalCard = ({
  title,
  progress,
  alignedWith,
  status,
  statusColor = "bg-green-100 text-green-800"
}: {
  title: string;
  progress: number;
  alignedWith: string[];
  status: string;
  statusColor?: string;
}) => {
  return (
    <CosmicCard>
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium">{title}</h3>
        <Badge className={statusColor}>{status}</Badge>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-xs">
          <span>Progress</span>
          <span>{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
      
      <div className="flex flex-wrap gap-1 mt-2">
        {alignedWith.map((trait) => (
          <Badge key={trait} variant="outline" className="bg-secondary text-xs">
            {trait}
          </Badge>
        ))}
      </div>
    </CosmicCard>
  );
};

export default Profile;
