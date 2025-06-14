
import React from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';

interface JourneyOverviewProps {
  milestonesCount: number;
  tasksCount: number;
  timeframe: string;
  isHighlighted: boolean;
}

export const JourneyOverview: React.FC<JourneyOverviewProps> = ({
  milestonesCount,
  tasksCount,
  timeframe,
  isHighlighted
}) => {
  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Complete Journey Overview</h2>
        <p className="text-gray-600">Designed specifically for your blueprint</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">Milestones</h3>
          <p className="text-3xl font-bold text-soul-purple mb-1">{milestonesCount}</p>
          <p className="text-xs text-gray-500">Key achievement phases</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">Action Tasks</h3>
          <p className="text-3xl font-bold text-soul-teal mb-1">{tasksCount}</p>
          <p className="text-xs text-gray-500">Blueprint-optimized steps</p>
        </div>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800">Timeline</h3>
          <p className="text-3xl font-bold text-soul-blue mb-1">{timeframe}</p>
          <p className="text-xs text-gray-500">To completion</p>
        </div>
      </div>
    </div>
  );
};
