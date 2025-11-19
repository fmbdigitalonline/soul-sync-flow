
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
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
import { useLanguage } from "@/contexts/LanguageContext";

interface JourneyMapProps {
  onTaskClick?: (task: any) => void;
  onMilestoneClick?: (milestone: any) => void;
  onBackToSuccessOverview?: () => void; // Breadcrumb navigation (Pillar III: Intentional Craft)
  showSuccessBackButton?: boolean;
}

export const JourneyMap: React.FC<JourneyMapProps> = ({
  onTaskClick,
  onMilestoneClick,
  onBackToSuccessOverview,
  showSuccessBackButton
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
  const { t } = useLanguage();
  const [taskMilestoneFilter, setTaskMilestoneFilter] = React.useState<any | null>(null);

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
    setTaskMilestoneFilter(null);
  };

  const handleViewTasksFromFocus = (milestone: any) => {
    setTaskMilestoneFilter(milestone);
    setFocusedMilestone(null);
    setCurrentDetailView("tasks");
  };

  const handleMilestoneSelect = (milestone: any) => {
    // Log milestone to check for rendering issues
    console.log('🏁 Selecting milestone (full object):', milestone);
    if (onMilestoneClick) {
      // Pass full milestone object to maintain data integrity (Principle #6: Respect Critical Data Pathways)
      onMilestoneClick(milestone);
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
            activeGoal={mainGoal}
            focusedMilestone={taskMilestoneFilter}
            onBackToJourney={handleBackToOverview}
            onTaskSelect={(task) => onTaskClick?.(task)}
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
        onViewMilestoneTasks={handleViewTasksFromFocus}
      />
    );
  }

  // Regular Journey View with Interactive Overview
  return (
    <div className="space-y-6">
      {showSuccessBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToSuccessOverview}
          className="flex items-center gap-2 bg-background/80 hover:bg-background border-soul-purple/30 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          {t('journey.backToOverview')}
        </Button>
      )}

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
