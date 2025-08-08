
import React from "react";
import { useJourneyMapData } from "@/hooks/use-journey-map-data";
import { JourneyEmptyState } from "./JourneyEmptyState";
import { JourneyHeader } from "./JourneyHeader";
import { JourneyFocusMode } from "./JourneyFocusMode";
import { JourneyOverview } from "./JourneyOverview";
import { JourneyDetailedView } from "./JourneyDetailedView";
import { InteractiveJourneyOverview } from "@/components/dream/success/InteractiveJourneyOverview";
import { MilestoneDetailView } from "./MilestoneDetailView";
import { TimelineDetailView } from "./TimelineDetailView";
import { TaskViews } from "./TaskViews";

interface JourneyMapProps {
  onTaskClick?: (taskId: string) => void;
  onMilestoneClick?: (milestoneId: string) => void;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  onTaskClick,
  onMilestoneClick,
}) => {
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
    getBlueprintInsight,
    currentDetailView,
    setCurrentDetailView,
  } = useJourneyMapData();

  // Add debugging to see if mainGoal has the problematic structure
  console.log('🗺️ JourneyMap mainGoal structure:', mainGoal);

  if (!mainGoal) {
    return <JourneyEmptyState />;
  }

  const handleFocusMode = (milestone: any) => {
    // Log milestone structure to check for blueprint_alignment issues
    console.log('🎯 Focusing on milestone:', milestone);
    setFocusedMilestone(milestone);
    console.log("[Focus] Entering focus mode for milestone:", milestone.title);
  };

  const exitFocusMode = () => {
    setFocusedMilestone(null);
    console.log("[Focus] Exiting focus mode");
  };

  const handleNavigateToSection = (section: "milestones" | "tasks" | "timeline") => {
    setCurrentDetailView(section);
    console.log(`[Navigate] To ${section} section from Journey Map`);
  };

  const handleBackToOverview = () => {
    setCurrentDetailView(null);
  };

  const handleMilestoneSelect = (milestone: any) => {
    // Log milestone to check for rendering issues
    console.log('🏁 Selecting milestone:', milestone);
    if (onMilestoneClick) {
      onMilestoneClick(milestone.id);
    }
  };

  // Show detailed views when requested
  if (currentDetailView === "milestones") {
    return (
      <div className="min-h-screen">
        <MilestoneDetailView
          milestones={mainGoal.milestones || []}
          onBack={handleBackToOverview}
          onMilestoneSelect={handleMilestoneSelect}
        />
      </div>
    );
  }

  if (currentDetailView === "tasks") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="max-w-4xl mx-auto p-4">
          <TaskViews
            focusedMilestone={null}
            onBackToJourney={handleBackToOverview}
            onTaskSelect={(task) => onTaskClick?.(task.id)}
          />
        </div>
      </div>
    );
  }

  if (currentDetailView === "timeline") {
    return (
      <div className="min-h-screen">
        <TimelineDetailView
          goal={mainGoal}
          milestones={mainGoal.milestones || []}
          onBack={handleBackToOverview}
        />
      </div>
    );
  }

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

  // Regular Journey View with Interactive Overview
  return (
    <div className="space-y-6">
      {/* Add Interactive Journey Overview at the top */}
      <InteractiveJourneyOverview
        milestonesCount={mainGoal.milestones?.length || 0}
        tasksCount={mainGoal.tasks?.length || 0}
        timeframe={mainGoal.timeframe}
        isHighlighted={false}
        onNavigateToSection={handleNavigateToSection}
      />

      <JourneyHeader
        mainGoal={mainGoal}
        progress={progress}
        getBlueprintInsight={getBlueprintInsight}
        selectedView={selectedView}
        setSelectedView={setSelectedView}
      />

      {selectedView === "overview" ? (
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
