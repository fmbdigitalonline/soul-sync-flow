
import React from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-500 ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className="text-center mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2">Your Complete Journey Overview</h2>
        <p className="text-gray-600">Designed specifically for your blueprint</p>
      </div>
      
      <div className="grid md:grid-cols-3 gap-6">
        <button
          onClick={() => onNavigateToSection('milestones')}
          className="text-center group transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-2xl"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <Target className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-purple transition-colors">Milestones</h3>
          <p className="text-3xl font-bold text-soul-purple mb-1 group-hover:scale-110 transition-transform">{milestonesCount}</p>
          <p className="text-xs text-gray-500">Key achievement phases</p>
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-soul-purple font-medium">
            Tap to explore →
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('tasks')}
          className="text-center group transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-soul-teal/50 rounded-2xl"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-teal transition-colors">Action Tasks</h3>
          <p className="text-3xl font-bold text-soul-teal mb-1 group-hover:scale-110 transition-transform">{tasksCount}</p>
          <p className="text-xs text-gray-500">Blueprint-optimized steps</p>
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-soul-teal font-medium">
            Tap to explore →
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('timeline')}
          className="text-center group transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-soul-blue/50 rounded-2xl"
        >
          <div className="w-16 h-16 bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:shadow-xl transition-shadow duration-300">
            <Calendar className="h-8 w-8 text-white" />
          </div>
          <h3 className="font-semibold mb-2 text-gray-800 group-hover:text-soul-blue transition-colors">Timeline</h3>
          <p className="text-3xl font-bold text-soul-blue mb-1 group-hover:scale-110 transition-transform">{timeframe}</p>
          <p className="text-xs text-gray-500">To completion</p>
          <div className="mt-2 opacity-0 group-hover:opacity-100 transition-opacity text-xs text-soul-blue font-medium">
            Tap to explore →
          </div>
        </button>
      </div>
    </div>
  );
};
