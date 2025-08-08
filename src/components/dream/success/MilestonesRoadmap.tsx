
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, ChevronRight, Calendar, Target, CheckCircle2 } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

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
  const { spacing, getTextSize, touchTargetSize, isFoldDevice, isMobile } = useResponsiveLayout();
  
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
    <div className={`bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-500 w-full overflow-hidden ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.01]' : ''
    }`}>
      <h3 className={`font-semibold mb-4 flex items-center gap-2 flex-wrap ${getTextSize('text-base')}`}>
        <MapPin className={`text-soul-purple flex-shrink-0 ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="flex-1 min-w-0 truncate">Your Journey Roadmap</span>
        <Badge className={`bg-soul-purple/10 text-soul-purple border-0 flex-shrink-0 ${getTextSize('text-xs')}`}>
          {displayMilestones.length}
        </Badge>
      </h3>
      
      <div className="space-y-3 w-full">
        {displayMilestones.map((milestone: any, index: number) => (
          <button
            key={milestone.id || index}
            onClick={() => handleMilestoneClick(milestone)}
            className={`flex items-start gap-3 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-xl border border-soul-purple/10 hover:border-soul-purple/30 hover:bg-soul-purple/10 transition-all duration-300 hover:shadow-md active:scale-[0.98] w-full text-left overflow-hidden ${spacing.card} ${touchTargetSize}`}
          >
            <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 ${getTextSize('text-sm')} ${isFoldDevice ? 'w-6 h-6' : 'w-8 h-8'}`}>
              {index + 1}
            </div>
            <div className="flex-1 min-w-0 overflow-hidden">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <span className="flex-shrink-0">
                  {getPhaseIcon(milestone.blueprint_alignment?.phase || 'foundation')}
                </span>
                <h4 className={`font-semibold text-gray-800 leading-tight flex-1 min-w-0 truncate ${getTextSize('text-sm')}`}>
                  {milestone.title}
                </h4>
                <Badge variant="outline" className={`flex-shrink-0 ${getTextSize('text-xs')}`}>
                  {milestone.blueprint_alignment?.phase || 'milestone'}
                </Badge>
              </div>
              
              <p className={`text-gray-600 mb-3 leading-relaxed line-clamp-2 ${getTextSize('text-xs')}`}>
                {milestone.description}
              </p>
              
              {milestone.blueprint_alignment?.recommendations && (
                <div className="mb-3">
                  <p className={`text-soul-purple bg-soul-purple/10 rounded-lg px-2 py-1 inline-block leading-tight line-clamp-2 ${getTextSize('text-xs')}`}>
                    💡 {milestone.blueprint_alignment.recommendations[0] || 'Blueprint optimized for your energy type'}
                  </p>
                </div>
              )}
              
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center gap-1">
                    <Calendar className={`text-muted-foreground ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                    <span className={`text-muted-foreground ${getTextSize('text-xs')}`}>
                      {formatDate(milestone.target_date)}
                    </span>
                  </div>
                  {milestone.completion_criteria && milestone.completion_criteria.length > 0 && (
                    <Badge variant="outline" className={getTextSize('text-xs')}>
                      <Target className={`mr-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                      {milestone.completion_criteria.length}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-soul-purple flex-shrink-0">
                  <span className={`font-medium ${getTextSize('text-xs')}`}>
                    {isMobile ? 'Tap' : 'Click'}
                  </span>
                  <ChevronRight className={isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'} />
                </div>
              </div>
            </div>
          </button>
        ))}
        
        {displayMilestones.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <MapPin className={`mx-auto mb-2 opacity-50 ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
            <p className={getTextSize('text-sm')}>No milestones generated yet</p>
          </div>
        )}
      </div>
      
      {displayMilestones.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className={`text-center text-gray-500 ${getTextSize('text-xs')}`}>
            ✨ Each milestone is personalized to your unique blueprint and energy type
          </p>
        </div>
      )}
    </div>
  );
};
