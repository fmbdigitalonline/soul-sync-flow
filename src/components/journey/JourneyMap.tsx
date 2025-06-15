
import React from "react";
import { useJourneyMapData } from "@/hooks/use-journey-map-data";
import { JourneyEmptyState } from "./JourneyEmptyState";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyFocusMode } from "./JourneyFocusMode";
import { JourneyOverview } from "./JourneyOverview";
import { JourneyDetailedView } from "./JourneyDetailedView";

interface JourneyMapProps {
  onTaskClick?: (taskId: string) => void;
  onMilestoneClick?: (milestoneId: string) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({ onTaskClick, onMilestoneClick }) => {
  const {
    mainGoal,
    selectedView,
    setSelectedView,
    focusedMilestone,
    setFocusedMilestone,
    completedMilestones,
    progress,
    currentMilestone,
    nextTasks,
    getBlueprintInsight
  } = useJourneyMapData();

  if (!mainGoal) {
    return <JourneyEmptyState />;
  }

  const handleFocusMode = (milestone: any) => {
    setFocusedMilestone(milestone);
    console.log('🎯 Entering focus mode for milestone:', milestone.title);
  };

  const exitFocusMode = () => {
    setFocusedMilestone(null);
    console.log('↩️ Exiting focus mode');
  };

  // Focus Mode View
  if (focusedMilestone) {
    return (
      <JourneyFocusMode
        focusedMilestone={focusedMilestone}
        mainGoal={mainGoal}
        onTaskClick={onTaskClick}
        onExitFocus={exitFocusMode}
      />
    );
  }

  // Regular Journey View
  return (
    <div className="space-y-6">
      <JourneyHeader
        mainGoal={mainGoal}
        progress={progress}
        getBlueprintInsight={getBlueprintInsight}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />

      {selectedView === 'overview' ? (
        <JourneyOverview
          mainGoal={mainGoal}
          completedMilestones={completedMilestones}
          onMilestoneClick={onMilestoneClick}
          onFocusMilestone={handleFocusMode}
        />
      ) : (
        <JourneyDetailedView
          currentMilestone={currentMilestone}
          nextTasks={nextTasks}
          mainGoal={mainGoal}
          onTaskClick={onTaskClick}
          onFocusMilestone={handleFocusMode}
        />
      )}
    </div>
  );
};
