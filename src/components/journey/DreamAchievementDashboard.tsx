
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  Map, 
  Clock, 
  Target, 
  CheckCircle, 
  Brain,
  Sparkles
} from "lucide-react";
import { JourneyMap } from "./JourneyMap";
import { PomodoroTimer } from "../productivity/PomodoroTimer";
import { HabitTracker } from "../productivity/HabitTracker";
import { GoalAchievement } from "../productivity/GoalAchievement";
import { PlanningInterface } from "../productivity/PlanningInterface";
import { useLanguage } from "@/contexts/LanguageContext";

const DreamAchievementDashboard = () => {
  const { t } = useLanguage();

  return (
    <CosmicCard className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2 flex items-center justify-center">
          <Heart className="h-6 w-6 mr-2 text-soul-purple" />
          Dream Achievement Journey
        </h2>
        <p className="text-sm text-muted-foreground mb-4">
          Your personalized path to achieving your dreams, guided by your Soul Blueprint
        </p>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI-powered goal breakdown based on your unique blueprint</p>
          <p>• Soul-aligned milestones and tasks</p>
          <p>• Journey tools to support your authentic success</p>
        </div>
      </div>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="journey" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            <span className="hidden sm:inline">Journey</span>
          </TabsTrigger>
          <TabsTrigger value="dreams" className="flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            <span className="hidden sm:inline">Dreams</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Planning</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">Focus</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">Habits</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journey" className="mt-6">
          <JourneyMap />
        </TabsContent>
        
        <TabsContent value="dreams" className="mt-6">
          <GoalAchievement />
        </TabsContent>
        
        <TabsContent value="planning" className="mt-6">
          <PlanningInterface />
        </TabsContent>
        
        <TabsContent value="focus" className="mt-6">
          <PomodoroTimer />
        </TabsContent>
        
        <TabsContent value="habits" className="mt-6">
          <HabitTracker />
        </TabsContent>
      </Tabs>
    </CosmicCard>
  );
};

export default DreamAchievementDashboard;
