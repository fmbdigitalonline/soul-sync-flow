
import { useState } from "react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useBlueprintData } from "@/hooks/use-blueprint-data";

export const useJourneyMapData = () => {
  const { productivityJourney } = useJourneyTracking();
  const { blueprintData } = useBlueprintData();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  
  const currentGoals = (productivityJourney?.current_goals || []) as any[];
  const mainGoal = currentGoals[0];
  
  if (!mainGoal) {
    return {
      mainGoal: null,
      selectedView,
      setSelectedView,
      focusedMilestone,
      setFocusedMilestone,
      blueprintData,
      completedMilestones: [],
      totalMilestones: 0,
      progress: 0,
      currentMilestone: null,
      nextTasks: []
    };
  }

  const completedMilestones = mainGoal.milestones?.filter((m: any) => m.completed) || [];
  const totalMilestones = mainGoal.milestones?.length || 0;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;
  
  const currentMilestone = mainGoal.milestones?.find((m: any) => !m.completed);
  const nextTasks = mainGoal.tasks?.filter((t: any) => !t.completed).slice(0, 3) || [];

  const getBlueprintInsight = () => {
    if (!blueprintData) return "Your journey is uniquely yours";
    
    const traits = [];
    if (blueprintData.cognition_mbti?.type) traits.push(blueprintData.cognition_mbti.type);
    if (blueprintData.energy_strategy_human_design?.type) traits.push(blueprintData.energy_strategy_human_design.type);
    if (blueprintData.values_life_path?.lifePathNumber) traits.push(`Life Path ${blueprintData.values_life_path.lifePathNumber}`);
    
    return `Optimized for your ${traits.slice(0, 2).join(' & ')} blueprint`;
  };

  return {
    mainGoal,
    selectedView,
    setSelectedView,
    focusedMilestone,
    setFocusedMilestone,
    blueprintData,
    completedMilestones,
    totalMilestones,
    progress,
    currentMilestone,
    nextTasks,
    getBlueprintInsight
  };
};
