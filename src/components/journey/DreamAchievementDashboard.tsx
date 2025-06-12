
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
    <CosmicCard className="p-4">
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold mb-2 flex items-center justify-center">
          <Heart className="h-5 w-5 mr-2 text-soul-purple" />
          Dream Achievement Tools
        </h2>
        <p className="text-xs text-muted-foreground mb-3">
          Your personalized toolkit for achieving your dreams
        </p>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• AI-powered goal breakdown</p>
          <p>• Soul-aligned milestones</p>
          <p>• Journey tools for authentic success</p>
        </div>
      </div>

      <Tabs defaultValue="journey" className="w-full">
        <TabsList className="grid w-full grid-cols-5 h-8">
          <TabsTrigger value="journey" className="flex items-center gap-1 text-xs">
            <Map className="h-3 w-3" />
            <span className="hidden xs:inline">Journey</span>
          </TabsTrigger>
          <TabsTrigger value="dreams" className="flex items-center gap-1 text-xs">
            <Sparkles className="h-3 w-3" />
            <span className="hidden xs:inline">Dreams</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-1 text-xs">
            <Brain className="h-3 w-3" />
            <span className="hidden xs:inline">Plan</span>
          </TabsTrigger>
          <TabsTrigger value="focus" className="flex items-center gap-1 text-xs">
            <Clock className="h-3 w-3" />
            <span className="hidden xs:inline">Focus</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-1 text-xs">
            <CheckCircle className="h-3 w-3" />
            <span className="hidden xs:inline">Habits</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="journey" className="mt-4">
          <JourneyMap />
        </TabsContent>
        
        <TabsContent value="dreams" className="mt-4">
          <GoalAchievement />
        </TabsContent>
        
        <TabsContent value="planning" className="mt-4">
          <PlanningInterface />
        </TabsContent>
        
        <TabsContent value="focus" className="mt-4">
          <PomodoroTimer />
        </TabsContent>
        
        <TabsContent value="habits" className="mt-4">
          <HabitTracker />
        </TabsContent>
      </Tabs>
    </CosmicCard>
  );
};

export default DreamAchievementDashboard;
