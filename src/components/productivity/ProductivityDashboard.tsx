
import React from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Clock, Target, Calendar, TrendingUp, Star, Play, CheckCircle, Brain } from "lucide-react";
import { PomodoroTimer } from "./PomodoroTimer";
import { HabitTracker } from "./HabitTracker";
import { GoalSetting } from "./GoalSetting";
import { GoalAchievement } from "./GoalAchievement";
import { PlanningInterface } from "./PlanningInterface";
import { useLanguage } from "@/contexts/LanguageContext";

const ProductivityDashboard = () => {
  const { t } = useLanguage();

  return (
    <CosmicCard className="p-6">
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold mb-2">{t('productivity.title')}</h2>
        <p className="text-sm text-muted-foreground mb-4">
          {t('productivity.subtitle')}
        </p>
        
        <div className="text-xs text-muted-foreground space-y-1">
          <p>• {t('productivity.description1')}</p>
          <p>• {t('productivity.description2')}</p>
          <p>• {t('productivity.description3')}</p>
        </div>
      </div>

      <Tabs defaultValue="achievement" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="achievement" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">AI Goals</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Planning</span>
          </TabsTrigger>
          <TabsTrigger value="timer" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span className="hidden sm:inline">{t('productivity.focusTimer')}</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex items-center gap-2">
            <CheckCircle className="h-4 w-4" />
            <span className="hidden sm:inline">{t('productivity.habits')}</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">{t('productivity.goals')}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="achievement" className="mt-6">
          <GoalAchievement />
        </TabsContent>
        
        <TabsContent value="planning" className="mt-6">
          <PlanningInterface />
        </TabsContent>
        
        <TabsContent value="timer" className="mt-6">
          <PomodoroTimer />
        </TabsContent>
        
        <TabsContent value="habits" className="mt-6">
          <HabitTracker />
        </TabsContent>
        
        <TabsContent value="goals" className="mt-6">
          <GoalSetting />
        </TabsContent>
      </Tabs>
    </CosmicCard>
  );
};

export default ProductivityDashboard;
