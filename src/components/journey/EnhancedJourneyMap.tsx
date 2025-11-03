import React, { useState, useRef, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  MapPin, 
  Target, 
  Star, 
  CheckCircle2, 
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Clock,
  Calendar,
  Focus,
  ArrowDown,
  Info
} from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { MilestoneDetailPopup } from "./MilestoneDetailPopup";
import { useDoubleTap } from "@/hooks/use-double-tap";
import { useLanguage } from "@/contexts/LanguageContext";

interface EnhancedJourneyMapProps {
  onTaskClick?: (task: any) => void;
  onMilestoneClick?: (milestone: any) => void;
  onBackToSuccessOverview?: () => void;
  showSuccessBackButton?: boolean;
  activeGoal?: any; // NEW: Accept active goal from parent (Principle #6: Respect Critical Data Pathways)
}

export const EnhancedJourneyMap: React.FC<EnhancedJourneyMapProps> = ({
  onTaskClick,
  onMilestoneClick,
  onBackToSuccessOverview,
  showSuccessBackButton,
  activeGoal // NEW: Use activeGoal if provided (Principle #6: Respect Critical Data Pathways)
}) => {
  const { productivityJourney } = useJourneyTracking();
  const { blueprintData } = useOptimizedBlueprintData();
  const { t } = useLanguage();
  const [selectedView, setSelectedView] = useState<'overview' | 'detailed'>('overview');
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const milestoneRefs = useRef<(HTMLDivElement | null)[]>([]);
  const dreamAchievedRef = useRef<HTMLDivElement | null>(null);
  const { t } = useLanguage();

  // Principle #6: Use activeGoal if provided, otherwise fall back to journey data
  const currentGoals = (productivityJourney?.current_goals || []) as any[];
  const mainGoal = activeGoal || currentGoals[0];

  // Principle #3: No Fallbacks That Mask Errors - Show clear "no goal selected" state
  if (!mainGoal) {
    return (
      <div className="p-6 text-center w-full">
        <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
        <h3 className="text-lg font-semibold mb-2">
          {activeGoal === null ? 'No Dream Selected' : t('journey.empty.title')}
        </h3>
        <p className="text-muted-foreground text-sm">
          {activeGoal === null
            ? 'Please select a dream from your overview to view your journey map.'
            : t('journey.empty.description')}
        </p>
      </div>
    );
  }

  // Sort milestones by order to ensure proper progression
  const sortedMilestones = useMemo(() => {
    const rawMilestones = Array.isArray(mainGoal?.milestones) ? mainGoal.milestones : [];
    return [...rawMilestones].sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  }, [mainGoal]);

  const completedMilestones = sortedMilestones.filter((m: any) => m.completed);
  const totalMilestones = sortedMilestones.length;
  const progress = totalMilestones > 0 ? Math.round((completedMilestones.length / totalMilestones) * 100) : 0;
  
  const currentMilestone = sortedMilestones.find((m: any) => !m.completed);
  const nextTasks = (mainGoal?.tasks || [])
    .filter((t: any) => !t.completed)
    .slice(0, 3);

  const renderEmptyState = () => (
    <div className="p-6 text-center w-full">
      <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
      <h3 className="text-lg font-semibold mb-2">
        {activeGoal === null ? 'No Dream Selected' : t('journey.empty.title')}
      </h3>
      <p className="text-muted-foreground text-sm">
        {activeGoal === null
          ? 'Please select a dream from your overview to view your journey map.'
          : t('journey.empty.description')}
      </p>
    </div>
  );

  const getBlueprintInsight = () => {
    if (!blueprintData) return "Your journey is uniquely yours";
    
    const traits = [];
    if (blueprintData.cognitiveTemperamental?.mbtiType) traits.push(blueprintData.cognitiveTemperamental.mbtiType);
    if (blueprintData.energyDecisionStrategy?.humanDesignType) traits.push(blueprintData.energyDecisionStrategy.humanDesignType);
    
    return `Optimized for your ${traits.slice(0, 2).join(' & ')} blueprint`;
  };

  const formatDate = (dateInput: unknown) => {
    if (!dateInput) {
      return 'Date TBD';
    }

    const parsedDate = (() => {
      if (dateInput instanceof Date) {
        return dateInput;
      }

      if (typeof dateInput === 'string' || typeof dateInput === 'number') {
        const constructedDate = new Date(dateInput);
        if (!Number.isNaN(constructedDate.getTime())) {
          return constructedDate;
        }
      }

      return null;
    })();

    if (!parsedDate) {
      console.warn('⚠️ EnhancedJourneyMap: Unable to format date input', dateInput);
      return 'Date TBD';
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  };

  const scrollToMilestone = useCallback(
    (index: number) => {
      const milestoneElement = milestoneRefs.current[index];
      if (milestoneElement) {
        milestoneElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
      }

      if (index >= sortedMilestones.length) {
        dreamAchievedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },
    [sortedMilestones.length]
  );

  const getPhaseColor = (phase: string) => {
    const colors = {
      discovery: 'from-blue-400 to-blue-600',
      planning: 'from-purple-400 to-purple-600',
      execution: 'from-green-400 to-green-600',
      analysis: 'from-orange-400 to-orange-600'
    };
    return colors[phase] || 'from-gray-400 to-gray-600';
  };

  const getPhaseIcon = (phase: string) => {
    const icons = {
      discovery: '🔍',
      planning: '📋',
      execution: '⚡',
      analysis: '📊'
    };
    return icons[phase] || '📌';
  };

  const handleMilestoneDoubleTap = (milestone: any) => {
    setSelectedMilestone(milestone);
    setIsPopupOpen(true);
  };

  const handleMilestoneSingleTap = (milestone: any) => {
    // Optional: Add visual feedback for single tap
    console.log('Single tap on milestone:', milestone.title);
  };

  const MilestoneCard = ({ milestone, index }: { milestone: any; index: number }) => {
    const isCompleted = milestone.completed;
    const isCurrent = !isCompleted && index === completedMilestones.length;
    const milestoneTasks = mainGoal?.tasks?.filter((t: any) => t.milestone_id === milestone.id) || [];
    
    const doubleTapHandlers = useDoubleTap({
      onDoubleTap: () => handleMilestoneDoubleTap(milestone),
      onSingleTap: () => handleMilestoneSingleTap(milestone),
      delay: 300
    });

    return (
      <div className="flex items-start space-x-3 w-full">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shadow-md transition-all duration-300 flex-shrink-0 mt-1 ${
          isCompleted ? `bg-gradient-to-br ${getPhaseColor(milestone.phase)} text-white scale-105` : 
          isCurrent ? 'bg-blue-500 text-white animate-pulse shadow-lg border-2 border-blue-300' : 
          'bg-gray-200 text-gray-400'
        }`}>
          {isCompleted ? (
            <CheckCircle2 className="h-4 w-4" />
          ) : isCurrent ? (
            <Star className="h-4 w-4" />
          ) : (
            <div className="w-2 h-2 rounded-full bg-current" />
          )}
        </div>
        
        <div className="flex-1 min-w-0 w-full">
          <div 
            className="p-4 rounded-xl border transition-all duration-300 hover:shadow-lg cursor-pointer w-full transform active:scale-[0.98]" 
            style={{
              backgroundColor: isCompleted ? '#f8fafc' : isCurrent ? '#dbeafe' : '#f9fafb',
              borderColor: isCompleted ? '#e2e8f0' : isCurrent ? '#3b82f6' : '#e5e7eb',
              borderWidth: isCurrent ? '2px' : '1px'
            }}
            {...doubleTapHandlers}
          >
            <div className="flex items-center justify-between w-full mb-2">
              <div className="flex items-center gap-2 flex-1 min-w-0">
                <span className="text-base flex-shrink-0">{getPhaseIcon(milestone.phase)}</span>
                <h5 className={`font-semibold text-sm ${isCompleted ? 'line-through text-muted-foreground' : 'text-gray-800'} leading-tight flex-1`}>
                  {milestone.title}
                </h5>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {isCurrent && (
                  <Badge className="bg-blue-500 text-white text-xs border-0">
                    <MapPin className="h-3 w-3 mr-1" />
                    Current
                  </Badge>
                )}
                <Info className="h-4 w-4 text-gray-400" />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 text-xs">
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3 text-muted-foreground" />
                  <span className="text-muted-foreground">{formatDate(milestone.target_date)}</span>
                </div>
                <Badge variant="outline" className="text-xs">
                  {milestone.phase}
                </Badge>
              </div>
              
              {isCurrent && (
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMilestoneClick?.(milestone);
                  }}
                  className="bg-blue-500 hover:bg-blue-600 text-xs h-7 px-2"
                >
                  <Focus className="h-3 w-3 mr-1" />
                  Focus
                </Button>
              )}
            </div>
            
            {/* Double-tap hint */}
            <div className="mt-2 text-center">
              <p className="text-xs text-gray-400">Double-tap for details</p>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="w-full max-w-full overflow-hidden">
      {/* Back to Success Overview Button */}
      {showSuccessBackButton && (
        <Button
          variant="outline"
          size="sm"
          onClick={onBackToSuccessOverview}
          className="flex items-center gap-2 bg-background/80 hover:bg-background border-soul-purple/30 mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Success Overview
        </Button>
      )}

      {!mainGoal ? (
        renderEmptyState()
      ) : (
        <>
          {/* Mobile-Optimized Journey Header */}
          <div className="p-3 bg-gradient-to-r from-soul-purple/10 to-blue-500/10 rounded-xl border border-white/20 mb-4 w-full">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h2 className="text-base font-bold mb-1 flex items-center leading-tight">
                  <Target className="h-4 w-4 mr-2 text-soul-purple flex-shrink-0" />
                  <span className="truncate">{mainGoal.title}</span>
                </h2>
                <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{mainGoal.description}</p>
                <p className="text-xs text-soul-purple font-medium">{getBlueprintInsight()}</p>
              </div>

              <div className="text-right flex-shrink-0">
                <div className="text-xl font-bold text-soul-purple mb-1">{progress}%</div>
                <div className="text-xs text-muted-foreground">Complete</div>
              </div>
            </div>

            <Progress value={progress} className="h-2 mb-3" />

            <div className="flex gap-2">
              <Button
                variant={selectedView === 'overview' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('overview')}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <MapPin className="h-3 w-3" />
                Timeline
              </Button>
              <Button
                variant={selectedView === 'detailed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedView('detailed')}
                className="flex items-center gap-1 text-xs h-8 px-3"
              >
                <Star className="h-3 w-3" />
                Focus
              </Button>
            </div>
          </div>

          {selectedView === 'overview' ? (
        /* Mobile-First Journey Timeline */
        <div className="w-full">
          <h3 className="font-medium mb-3 flex items-center text-sm">
            <MapPin className="h-4 w-4 mr-2" />
            Your Journey Path
            <div className="ml-auto">
              <Badge variant="outline" className="text-xs">
                Tap cards for details
              </Badge>
            </div>
          </h3>
          
          <div className="relative w-full">
            {/* Mobile-Optimized Timeline */}
            <div className="relative w-full">
              {/* Connecting Line */}
              <div className="absolute left-4 top-6 bottom-6 w-0.5 bg-gradient-to-b from-gray-300 via-soul-purple to-green-500 z-0"></div>
              
              <div className="space-y-4 relative z-10 w-full">
                {/* Starting Point */}
                <div className="flex items-start space-x-3 w-full">
                  <div className="w-8 h-8 bg-gradient-to-br from-gray-400 to-gray-600 rounded-full flex items-center justify-center shadow-md flex-shrink-0 mt-1">
                    <CheckCircle2 className="h-4 w-4 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <h5 className="font-medium text-gray-600 text-sm mb-1">🚀 Journey Started</h5>
                    <p className="text-xs text-gray-500 mb-1">Your dream begins here</p>
                    <p className="text-xs text-gray-400">
                      {formatDate(mainGoal.created_at)}
                    </p>
                  </div>
                </div>

                {/* Flow Arrow */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => scrollToMilestone(0)}
                    className="rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-soul-purple/50"
                    aria-label="Scroll to first milestone"
                  >
                    <ArrowDown className="h-4 w-4 text-soul-purple animate-bounce" />
                  </button>
                </div>

                {/* Milestones in chronological order */}
                {sortedMilestones.map((milestone: any, index: number) => (
                  <div
                    key={milestone.id}
                    className="w-full"
                    ref={element => {
                      milestoneRefs.current[index] = element;
                    }}
                  >
                    <MilestoneCard milestone={milestone} index={index} />

                    {/* Flow Arrow between milestones */}
                    {index < sortedMilestones.length - 1 && (
                      <div className="flex justify-center py-2">
                        <button
                          type="button"
                          onClick={() => scrollToMilestone(index + 1)}
                          className="rounded-full p-1 focus:outline-none focus:ring-2 focus:ring-soul-purple/40"
                          aria-label="Scroll to next milestone"
                        >
                          <ArrowDown className="h-3 w-3 text-gray-400" />
                        </button>
                      </div>
                    )}
                  </div>
                ))}

                {/* Final Flow Arrow */}
                <div className="flex justify-center">
                  <button
                    type="button"
                    onClick={() => scrollToMilestone(sortedMilestones.length)}
                    className="rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-emerald-400/50"
                    aria-label="Scroll to dream achievement"
                  >
                    <ArrowDown className="h-4 w-4 text-green-500 animate-bounce" />
                  </button>
                </div>

                {/* Dream Achievement */}
                <div ref={dreamAchievedRef} className="flex items-start space-x-3 w-full">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center shadow-lg flex-shrink-0 mt-1">
                    <Target className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1 min-w-0 p-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-800 text-sm mb-1">🎯 Dream Achieved!</h4>
                    <p className="text-xs text-green-600 mb-1 line-clamp-1">{mainGoal.title}</p>
                    <p className="text-xs text-green-500">
                      Target: {formatDate(mainGoal.target_completion)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Current Focus View - Mobile Optimized */
        <div className="space-y-4 w-full">
          {/* Current Milestone Focus */}
          {currentMilestone && (
            <div className="p-3 border-blue-200 bg-blue-50/50 rounded-lg border w-full">
              <h3 className="font-medium mb-3 flex items-center text-sm">
                <Star className="h-4 w-4 mr-2 text-blue-500" />
                Current Milestone Focus
              </h3>
              <div className="bg-white p-3 rounded-lg border border-blue-200 mb-3 w-full">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <span className="text-base">{getPhaseIcon(currentMilestone.phase)}</span>
                  <h4 className="font-medium text-blue-800 text-sm flex-1">{currentMilestone.title}</h4>
                  <Badge variant="outline" className="text-xs">{currentMilestone.phase}</Badge>
                </div>
                <p className="text-xs text-blue-600 mb-3 line-clamp-3">{currentMilestone.description}</p>
                <div className="flex items-center gap-4 text-xs flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-blue-500" />
                    <span>Target: {formatDate(currentMilestone.target_date)}</span>
                  </div>
                  <Badge variant="outline" className="bg-blue-100 text-blue-700 text-xs">
                    {currentMilestone.completion_criteria?.length || 0} criteria
                  </Badge>
                </div>
              </div>
            </div>
          )}
          
          {/* Next Steps - Mobile Optimized */}
          <div className="w-full">
            <h3 className="font-medium mb-3 flex items-center text-sm">
              <Sparkles className="h-4 w-4 mr-2 text-soul-purple" />
              Your Next Steps
            </h3>
            {nextTasks.length > 0 ? (
              <div className="space-y-2 w-full">
                {nextTasks.map((task: any, index: number) => (
                  <div
                    key={task.id}
                    className="flex items-center space-x-3 p-3 border rounded-lg hover:bg-secondary/20 cursor-pointer transition-all duration-200 hover:shadow-md w-full min-h-[60px]"
                    onClick={() => onTaskClick?.(task)}
                  >
                    <div className="w-6 h-6 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-medium text-xs flex-shrink-0">
                      {index + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="font-medium text-sm line-clamp-1">{task.title}</h5>
                      <p className="text-xs text-muted-foreground mb-1 line-clamp-2">{task.description}</p>
                      <div className="flex gap-1 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {task.estimated_duration}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {task.energy_level_required}
                        </Badge>
                      </div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground w-full">
                <Target className="h-8 w-8 mx-auto mb-3 opacity-50" />
                <p className="text-sm">All tasks completed! Time to celebrate this milestone.</p>
              </div>
            )}
          </div>
          
          {/* Blueprint Alignment - Mobile Optimized */}
          {mainGoal.blueprint_alignment?.length > 0 && (
            <div className="w-full">
              <h3 className="font-medium mb-3 flex items-center text-sm">
                <Sparkles className="h-4 w-4 mr-2 text-green-500" />
                Soul Blueprint Alignment
              </h3>
              <div className="grid grid-cols-1 gap-2 w-full">
                {mainGoal.blueprint_alignment.map((trait: string, index: number) => (
                  <div key={index} className="flex items-center p-2 bg-green-50 rounded-lg border border-green-200 w-full">
                    <Star className="h-3 w-3 mr-2 text-green-600 flex-shrink-0" />
                    <span className="text-xs text-green-800 font-medium line-clamp-1">{trait}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                ✨ This journey honors your authentic self and natural strengths
              </p>
            </div>
          )}
          <MilestoneDetailPopup
            milestone={selectedMilestone}
            tasks={mainGoal?.tasks || []}
            isOpen={isPopupOpen}
            onClose={() => {
              setIsPopupOpen(false);
              setSelectedMilestone(null);
            }}
            onTaskClick={onTaskClick}
            onMilestoneAction={(milestone) => {
              onMilestoneClick?.(milestone);
              setIsPopupOpen(false);
              setSelectedMilestone(null);
            }}
          />
        </>
      )}
    </div>
  );
};
