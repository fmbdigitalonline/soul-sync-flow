
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { MapPin } from 'lucide-react';

interface MilestonesRoadmapProps {
  milestones: any[];
  isHighlighted: boolean;
}

export const MilestonesRoadmap: React.FC<MilestonesRoadmapProps> = ({
  milestones,
  isHighlighted
}) => {
  const displayMilestones = milestones?.slice(0, 3) || [];
  const remainingCount = (milestones?.length || 0) - 3;

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-3">
        <MapPin className="h-6 w-6 text-soul-purple" />
        Your Milestone Roadmap
        <Badge className="bg-soul-purple/10 text-soul-purple">
          Blueprint Aligned
        </Badge>
      </h3>
      
      <div className="space-y-4">
        {displayMilestones.map((milestone: any, index: number) => (
          <div key={milestone.id} className="flex items-center gap-4 p-4 bg-gradient-to-r from-soul-purple/5 to-transparent rounded-xl border border-soul-purple/10">
            <div className="w-10 h-10 bg-gradient-to-br from-soul-purple to-soul-teal rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
              {index + 1}
            </div>
            <div className="flex-1">
              <h4 className="font-semibold text-gray-800 mb-1">{milestone.title}</h4>
              <p className="text-sm text-gray-600 mb-2">{milestone.description}</p>
              {milestone.blueprint_alignment && (
                <p className="text-xs text-soul-purple bg-soul-purple/10 rounded-lg px-2 py-1 inline-block">
                  💡 {milestone.blueprint_alignment}
                </p>
              )}
            </div>
            <Badge variant="outline" className="text-xs">
              {new Date(milestone.target_date).toLocaleDateString()}
            </Badge>
          </div>
        ))}
        
        {remainingCount > 0 && (
          <p className="text-sm text-gray-500 text-center">
            +{remainingCount} more milestones in your complete journey
          </p>
        )}
      </div>
    </div>
  );
};
