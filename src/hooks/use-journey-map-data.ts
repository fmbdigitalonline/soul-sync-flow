
import { useState } from "react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { useEnhancedJourneyTracking } from "@/hooks/use-enhanced-journey-tracking";

export const useJourneyMapData = () => {
  const { productivityJourney } = useJourneyTracking();
  const { blueprintData } = useBlueprintData();
  const { enhancedMetrics, journeyInsights } = useEnhancedJourneyTracking();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');
  const [focusedMilestone, setFocusedMilestone] = useState<any>(null);
  const [preserveSuccessView, setPreserveSuccessView] = useState(false);
  const [currentDetailView, setCurrentDetailView] = useState<'milestones' | 'tasks' | 'timeline' | null>(null);
  
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
      nextTasks: [],
      preserveSuccessView,
      setPreserveSuccessView,
      currentDetailView,
      setCurrentDetailView,
      enhancedMetrics: null,
      journeyInsights: []
    };
  }

  // Use enhanced metrics when available, fall back to basic calculation
  const completedMilestones = mainGoal.milestones?.filter((m: any) => m.completed) || [];
  const totalMilestones = mainGoal.milestones?.length || 0;
  
  // Calculate progress using enhanced metrics if available
  const basicProgress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;
  const enhancedProgress = enhancedMetrics?.engagementScore || 0;
  
  // Weighted combination of basic milestone completion and enhanced engagement
  const progress = enhancedMetrics 
    ? Math.round((basicProgress * 0.4) + (enhancedProgress * 0.6))
    : basicProgress;
  
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
    getBlueprintInsight,
    preserveSuccessView,
    setPreserveSuccessView,
    currentDetailView,
    setCurrentDetailView,
    enhancedMetrics,
    journeyInsights
  };
};
