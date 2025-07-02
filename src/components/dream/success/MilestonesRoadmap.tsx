
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

interface MilestonesRoadmapProps {
  milestones: any[];
  isHighlighted: boolean;
  onMilestoneClick?: (milestone: any) => void;
}

export const MilestonesRoadmap: React.FC<MilestonesRoadmapProps> = ({
  milestones,
  isHighlighted,
  onMilestoneClick
}) => {
  const isMobile = useIsMobile();
  
  // Show ALL milestones instead of limiting to 3
  const displayMilestones = milestones || [];

  const handleMilestoneClick = (milestone: any) => {
    if (onMilestoneClick) {
      onMilestoneClick(milestone);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
      });
    } catch {
      return 'Date TBD';
    }
  };

  const getPhaseIcon = (phase: string) => {
    const icons = {
      foundation: '🏗️',
      development: '⚡',
      refinement: '✨',
      completion: '🎯'
    };
    return icons[phase as keyof typeof icons] || '📌';
  };

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-3 flex-wrap">
        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-soul-purple flex-shrink-0" />
        <span className="flex-1 min-w-0">Your Complete Journey Roadmap</span>
        <Badge className="bg-soul-purple/10 text-soul-purple text-xs border-0 flex-shrink-0">
          {displayMilestones.length} Milestones
        </Badge>
      </h3>
      
      <div className="space-y-3 sm:space-y-4">
        {displayMilestones.map((milestone: any, index: number) => (
          <button
            key={milestone.id || index}
            onClick={() => handleMilestoneClick(milestone)}
            className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-xl border border-soul-purple/10 hover:border-soul-purple/30 hover:bg-soul-purple/10 transition-all duration-300 hover:shadow-md active:scale-[0.98] w-full text-left"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="text-base flex-shrink-0">
                  {getPhaseIcon(milestone.blueprint_alignment?.phase || 'foundation')}
                </span>
                <h4 className="font-semibold text-gray-800 text-sm sm:text-base leading-tight flex-1">
                  {milestone.title}
                </h4>
                <Badge variant="outline" className="text-xs">
                  {milestone.blueprint_alignment?.phase || 'milestone'}
                </Badge>
              </div>
              
              <p className="text-xs sm:text-sm text-gray-600 mb-3 line-clamp-2 leading-relaxed">
                {milestone.description}
              </p>
              
              {milestone.blueprint_alignment?.recommendations && (
                <div className="mb-3">
                  <p className="text-xs text-soul-purple bg-soul-purple/10 rounded-lg px-2 py-1 inline-block leading-tight">
                    💡 {milestone.blueprint_alignment.recommendations[0] || 'Blueprint optimized for your energy type'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-3 text-xs">
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">
                      {formatDate(milestone.target_date)}
                    </span>
                  </div>
                  {milestone.completion_criteria && milestone.completion_criteria.length > 0 && (
                    <Badge variant="outline" className="text-xs">
                      <Target className="h-3 w-3 mr-1" />
                      {milestone.completion_criteria.length} criteria
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-soul-purple">
                  <span className="text-xs font-medium">
                    {isMobile ? 'Tap' : 'Click'} to expand
                  </span>
                  <ChevronRight className="h-4 w-4" />
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {displayMilestones.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <MapPin className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No milestones generated yet</p>
          </div>
        )}
      </div>
      
      {displayMilestones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-xs text-center text-gray-500">
            ✨ Each milestone is personalized to your unique blueprint and energy type
          </p>
        </div>
      )}
    </div>
  );
};
