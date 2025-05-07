
import React, { useState, useEffect } from "react";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PomodoroTimer } from "./PomodoroTimer";
import { HabitTracker } from "./HabitTracker";
import { GoalSetting } from "./GoalSetting";
import { Clock, Calendar, Target, ListChecks } from "lucide-react";
import { blueprintService, BlueprintData } from "@/services/blueprint-service";
import { supabase } from "@/integrations/supabase/client";

export const ProductivityDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState("focus");
  const [blueprint, setBlueprint] = useState<BlueprintData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const { data } = await supabase.auth.getSession();
      setIsAuthenticated(!!data.session);
    };
    
    checkAuth();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsAuthenticated(!!session);
    });
    
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch blueprint data
  useEffect(() => {
    const fetchBlueprintData = async () => {
      if (isAuthenticated) {
        setIsLoading(true);
        const { data } = await blueprintService.getActiveBlueprintData();
        setBlueprint(data);
        setIsLoading(false);
      } else {
        setIsLoading(false);
      }
    };
    
    fetchBlueprintData();
  }, [isAuthenticated]);

  // Get relevant blueprint traits for productivity tools
  const getRelevantTraits = () => {
    if (!blueprint) return [];
    
    return [
      blueprint.cognition_mbti.type,
      blueprint.energy_strategy_human_design.type,
      blueprint.archetype_western.sun_sign.split(" ")[0],
      blueprint.archetype_western.moon_sign.split(" ")[0],
      `Life Path ${blueprint.values_life_path.life_path_number}`
    ];
  };

  // Get focus style from blueprint
  const getFocusStyle = () => {
    if (!blueprint) return "standard";
    
    const mbtiType = blueprint.cognition_mbti.type;
    const hdType = blueprint.energy_strategy_human_design.type;
    
    // Determine focus style based on blueprint traits
    if (mbtiType.startsWith("IN") || hdType === "Projector") {
      return "deep focus";
    } else if (mbtiType.startsWith("EN") || hdType === "Manifesting Generator") {
      return "quick bursts";
    }
    
    return "standard";
  };

  return (
    <CosmicCard className="p-4">
      <h2 className="text-xl font-bold font-display mb-4">
        <span className="gradient-text">Productivity Suite</span>
      </h2>
      
      <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 h-auto">
          <TabsTrigger value="focus" className="flex flex-col gap-1 py-2 h-auto">
            <Clock className="h-4 w-4" />
            <span className="text-xs">Focus Timer</span>
          </TabsTrigger>
          <TabsTrigger value="habits" className="flex flex-col gap-1 py-2 h-auto">
            <ListChecks className="h-4 w-4" />
            <span className="text-xs">Habits</span>
          </TabsTrigger>
          <TabsTrigger value="goals" className="flex flex-col gap-1 py-2 h-auto">
            <Target className="h-4 w-4" />
            <span className="text-xs">Goals</span>
          </TabsTrigger>
          <TabsTrigger value="planning" className="flex flex-col gap-1 py-2 h-auto">
            <Calendar className="h-4 w-4" />
            <span className="text-xs">Planning</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="focus" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading your personalized focus timer...</div>
          ) : (
            <PomodoroTimer 
              focusType={getFocusStyle()} 
              defaultWorkMinutes={getFocusStyle() === "deep focus" ? 35 : getFocusStyle() === "quick bursts" ? 15 : 25}
            />
          )}
        </TabsContent>
        
        <TabsContent value="habits" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading your personalized habit tracker...</div>
          ) : (
            <HabitTracker blueprintTraits={getRelevantTraits()} />
          )}
        </TabsContent>
        
        <TabsContent value="goals" className="space-y-4">
          {isLoading ? (
            <div className="text-center py-8">Loading your personalized goal setting tools...</div>
          ) : (
            <GoalSetting blueprintTraits={getRelevantTraits()} />
          )}
        </TabsContent>
        
        <TabsContent value="planning" className="space-y-4">
          <CosmicCard className="p-6 text-center">
            <h3 className="text-lg font-medium mb-2">Planning Tools</h3>
            <p className="text-muted-foreground">
              Your blueprint-aligned planning tools are coming soon!
            </p>
          </CosmicCard>
        </TabsContent>
      </Tabs>
    </CosmicCard>
  );
};
