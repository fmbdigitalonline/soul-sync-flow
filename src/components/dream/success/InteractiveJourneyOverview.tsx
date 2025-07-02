
import React from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useIsMobile } from '@/hooks/use-mobile';

interface InteractiveJourneyOverviewProps {
  milestonesCount: number;
  tasksCount: number;
  timeframe: string;
  isHighlighted: boolean;
  onNavigateToSection: (section: 'milestones' | 'tasks' | 'timeline') => void;
}

export const InteractiveJourneyOverview: React.FC<InteractiveJourneyOverviewProps> = ({
  milestonesCount,
  tasksCount,
  timeframe,
  isHighlighted,
  onNavigateToSection
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-4 shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="text-center mb-4">
        <h2 className="text-lg font-bold text-gray-800 mb-2 leading-tight">Your Complete Journey Overview</h2>
        <p className="text-gray-600 text-sm leading-relaxed">Designed specifically for your blueprint</p>
      </div>
      
      {/* Force Single Column Layout on Mobile */}
      <div className="flex flex-col gap-3 w-full">
        <button
          onClick={() => onNavigateToSection('milestones')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-2xl p-4 border border-transparent hover:border-soul-purple/20 hover:bg-soul-purple/5 w-full"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
              <Target className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-soul-purple transition-colors text-base">Milestones</h3>
              <p className="text-2xl font-bold text-soul-purple mb-1 group-hover:scale-110 transition-transform">{milestonesCount}</p>
              <p className="text-xs text-gray-500">Key achievement phases</p>
            </div>
            <div className="text-soul-purple flex-shrink-0">
              <span className="text-lg">→</span>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('tasks')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-teal/50 rounded-2xl p-4 border border-transparent hover:border-soul-teal/20 hover:bg-soul-teal/5 w-full"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
              <CheckCircle className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-soul-teal transition-colors text-base">Action Tasks</h3>
              <p className="text-2xl font-bold text-soul-teal mb-1 group-hover:scale-110 transition-transform">{tasksCount}</p>
              <p className="text-xs text-gray-500">Blueprint-optimized steps</p>
            </div>
            <div className="text-soul-teal flex-shrink-0">
              <span className="text-lg">→</span>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('timeline')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-blue/50 rounded-2xl p-4 border border-transparent hover:border-soul-blue/20 hover:bg-soul-blue/5 w-full"
        >
          <div className="flex items-center gap-4 w-full">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1 text-left">
              <h3 className="font-semibold mb-1 text-gray-800 group-hover:text-soul-blue transition-colors text-base">Timeline</h3>
              <p className="text-2xl font-bold text-soul-blue mb-1 group-hover:scale-110 transition-transform">{timeframe}</p>
              <p className="text-xs text-gray-500">To completion</p>
            </div>
            <div className="text-soul-blue flex-shrink-0">
              <span className="text-lg">→</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
