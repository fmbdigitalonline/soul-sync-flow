
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin, ChevronRight } from 'lucide-react';
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
  const displayMilestones = milestones?.slice(0, 3) || [];
  const remainingCount = (milestones?.length || 0) - 3;

  const handleMilestoneClick = (milestone: any) => {
    if (onMilestoneClick) {
      onMilestoneClick(milestone);
    }
  };

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-3 flex-wrap">
        <MapPin className="h-5 w-5 sm:h-6 sm:w-6 text-soul-purple flex-shrink-0" />
        <span className="flex-1 min-w-0">Your Milestone Roadmap</span>
        <Badge className="bg-soul-purple/10 text-soul-purple text-xs border-0 flex-shrink-0">
          Blueprint Aligned
        </Badge>
      </h3>
      
      <div className="space-y-3 sm:space-y-4">
        {displayMilestones.map((milestone: any, index: number) => (
          <button
            key={milestone.id}
            onClick={() => handleMilestoneClick(milestone)}
            className="flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-xl border border-soul-purple/10 hover:border-soul-purple/30 hover:bg-soul-purple/10 transition-all duration-300 hover:shadow-md active:scale-[0.98] w-full text-left min-h-[80px] sm:min-h-[90px]"
          >
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0 text-sm sm:text-base">
              {index + 1}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="font-semibold text-gray-800 mb-1 text-sm sm:text-base leading-tight line-clamp-2">{milestone.title}</h4>
              <p className="text-xs sm:text-sm text-gray-600 mb-2 line-clamp-2 leading-relaxed">{milestone.description}</p>
              {milestone.blueprint_alignment && (
                <div className="mb-2">
                  <p className="text-xs text-soul-purple bg-soul-purple/10 rounded-lg px-2 py-1 inline-block leading-tight line-clamp-2">
                    💡 {typeof milestone.blueprint_alignment === 'string' 
                      ? milestone.blueprint_alignment 
                      : milestone.blueprint_alignment.recommendations?.[0] || 'Blueprint optimized for your energy type'}
                  </p>
                </div>
              )}
              <div className="flex items-center justify-between">
                <Badge variant="outline" className="text-xs border-gray-300">
                  {new Date(milestone.target_date).toLocaleDateString()}
                </Badge>
                {isMobile && (
                  <span className="text-xs text-soul-purple font-medium">Tap to view</span>
                )}
              </div>
            </div>
            <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5 text-soul-purple flex-shrink-0" />
          </button>
        ))}
        
        {remainingCount > 0 && (
          <div className="text-center pt-2">
            <p className="text-xs sm:text-sm text-gray-500">
              +{remainingCount} more milestones in your complete journey
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
