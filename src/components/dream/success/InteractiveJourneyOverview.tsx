
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
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="text-center mb-4 sm:mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-gray-800 mb-2 leading-tight">Your Complete Journey Overview</h2>
        <p className="text-gray-600 text-sm sm:text-base leading-relaxed px-2">Designed specifically for your blueprint</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <button
          onClick={() => onNavigateToSection('milestones')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-2xl p-4 min-h-[120px] sm:min-h-[140px] border border-transparent hover:border-soul-purple/20 hover:bg-soul-purple/5 w-full"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <Target className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-purple transition-colors text-sm sm:text-base">Milestones</h3>
          <p className="text-2xl sm:text-3xl font-bold text-soul-purple mb-1 group-hover:scale-110 transition-transform">{milestonesCount}</p>
          <p className="text-xs text-gray-500 mb-2">Key achievement phases</p>
          <div className={`${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-xs text-soul-purple font-medium flex items-center justify-center gap-1`}>
            <span>Tap to explore</span>
            <span className="text-lg">→</span>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('tasks')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-teal/50 rounded-2xl p-4 min-h-[120px] sm:min-h-[140px] border border-transparent hover:border-soul-teal/20 hover:bg-soul-teal/5 w-full"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <CheckCircle className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-teal transition-colors text-sm sm:text-base">Action Tasks</h3>
          <p className="text-2xl sm:text-3xl font-bold text-soul-teal mb-1 group-hover:scale-110 transition-transform">{tasksCount}</p>
          <p className="text-xs text-gray-500 mb-2">Blueprint-optimized steps</p>
          <div className={`${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-xs text-soul-teal font-medium flex items-center justify-center gap-1`}>
            <span>Tap to explore</span>
            <span className="text-lg">→</span>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('timeline')}
          className="text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-blue/50 rounded-2xl p-4 min-h-[120px] sm:min-h-[140px] border border-transparent hover:border-soul-blue/20 hover:bg-soul-blue/5 w-full"
        >
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <Calendar className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-blue transition-colors text-sm sm:text-base">Timeline</h3>
          <p className="text-2xl sm:text-3xl font-bold text-soul-blue mb-1 group-hover:scale-110 transition-transform break-words">{timeframe}</p>
          <p className="text-xs text-gray-500 mb-2">To completion</p>
          <div className={`${isMobile ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'} transition-opacity text-xs text-soul-blue font-medium flex items-center justify-center gap-1`}>
            <span>Tap to explore</span>
            <span className="text-lg">→</span>
          </div>
        </button>
      </div>
    </div>
  );
};
