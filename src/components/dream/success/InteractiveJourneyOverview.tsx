
import React from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

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
  const { spacing, layout, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();

  return (
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className={`text-center mb-4 ${isFoldDevice ? 'mb-2' : ''}`}>
        <h2 className={`font-bold text-gray-800 mb-2 leading-tight ${getTextSize('text-lg')} ${isFoldDevice ? 'mb-1' : ''}`}>
          {isFoldDevice ? 'Journey Overview' : 'Your Complete Journey Overview'}
        </h2>
        {!isFoldDevice && (
          <p className={`text-gray-600 leading-relaxed ${getTextSize('text-sm')}`}>
            Designed specifically for your blueprint
          </p>
        )}
      </div>
      
      {/* Force Single Column Layout - Stack All Cards Vertically */}
      <div className={`flex flex-col w-full ${spacing.gap}`}>
        <button
          onClick={() => onNavigateToSection('milestones')}
          className={`text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-2xl border border-transparent hover:border-soul-purple/20 hover:bg-soul-purple/5 w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full ${spacing.gap} ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-10 h-10 rounded-xl' : 'w-12 h-12'}`}>
              <Target className={`text-white ${isFoldDevice ? 'h-4 w-4' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold mb-1 text-gray-800 group-hover:text-soul-purple transition-colors ${getTextSize('text-base')}`}>
                Milestones
              </h3>
              <p className={`font-bold text-soul-purple mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {milestonesCount}
              </p>
              {!isFoldDevice && (
                <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
                  Key achievement phases
                </p>
              )}
            </div>
            <div className={`text-soul-purple flex-shrink-0 ${getTextSize('text-lg')}`}>
              <span>→</span>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('tasks')}
          className={`text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-teal/50 rounded-2xl border border-transparent hover:border-soul-teal/20 hover:bg-soul-teal/5 w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full ${spacing.gap} ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-10 h-10 rounded-xl' : 'w-12 h-12'}`}>
              <CheckCircle className={`text-white ${isFoldDevice ? 'h-4 w-4' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold mb-1 text-gray-800 group-hover:text-soul-teal transition-colors ${getTextSize('text-base')}`}>
                {isFoldDevice ? 'Tasks' : 'Action Tasks'}
              </h3>
              <p className={`font-bold text-soul-teal mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {tasksCount}
              </p>
              {!isFoldDevice && (
                <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
                  Blueprint-optimized steps
                </p>
              )}
            </div>
            <div className={`text-soul-teal flex-shrink-0 ${getTextSize('text-lg')}`}>
              <span>→</span>
            </div>
          </div>
        </button>
        
        <button
          onClick={() => onNavigateToSection('timeline')}
          className={`text-center group transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-blue/50 rounded-2xl border border-transparent hover:border-soul-blue/20 hover:bg-soul-blue/5 w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full ${spacing.gap} ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-10 h-10 rounded-xl' : 'w-12 h-12'}`}>
              <Calendar className={`text-white ${isFoldDevice ? 'h-4 w-4' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left">
              <h3 className={`font-semibold mb-1 text-gray-800 group-hover:text-soul-blue transition-colors ${getTextSize('text-base')}`}>
                Timeline
              </h3>
              <p className={`font-bold text-soul-blue mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {timeframe}
              </p>
              {!isFoldDevice && (
                <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
                  To completion
                </p>
              )}
            </div>
            <div className={`text-soul-blue flex-shrink-0 ${getTextSize('text-lg')}`}>
              <span>→</span>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
};
