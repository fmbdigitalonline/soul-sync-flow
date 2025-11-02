
import React, { useEffect } from 'react';
import { Target, CheckCircle, Calendar } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const { spacing, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();
  const { t } = useLanguage();

  useEffect(() => {
    console.log('🧭 InteractiveJourneyOverview: metrics received', {
      milestonesCount,
      tasksCount,
      timeframe,
      isHighlighted
    });
  }, [isHighlighted, milestonesCount, tasksCount, timeframe]);

  return (
    <div className={`bg-card/95 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-500 w-full max-w-full ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <div className={`text-center mb-4 w-full max-w-full ${isFoldDevice ? 'mb-2' : ''}`}>
        <h2 className={`font-bold text-foreground mb-2 leading-tight break-words ${getTextSize('text-lg')} ${isFoldDevice ? 'mb-1' : ''}`}>
          {isFoldDevice ? t('journeyOverview.titleShort') : t('journeyOverview.title')}
        </h2>
        {!isFoldDevice && (
          <p className={`text-muted-foreground leading-relaxed break-words ${getTextSize('text-sm')}`}>
            {t('journeyOverview.subtitle')}
          </p>
        )}
      </div>
      
      <div className={`flex flex-col w-full max-w-full space-y-3 ${isFoldDevice ? 'space-y-2' : ''}`}>
        <button
          onClick={() => onNavigateToSection('milestones')}
          className={`group transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-2xl border border-transparent hover:border-soul-purple/20 hover:bg-soul-purple/5 w-full max-w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full max-w-full gap-3 ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-purple to-soul-teal rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-8 h-8 rounded-xl' : 'w-12 h-12'}`}>
              <Target className={`text-white ${isFoldDevice ? 'h-3 w-3' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left min-w-0 w-full max-w-full">
            <h3 className={`font-semibold mb-1 text-foreground group-hover:text-soul-purple transition-colors w-full truncate ${getTextSize('text-base')}`}>
                {t('journeyOverview.milestones')}
              </h3>
              <p className={`font-bold text-soul-purple mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {milestonesCount}
              </p>
              {!isFoldDevice && !isUltraNarrow && (
                <p className={`text-muted-foreground w-full truncate ${getTextSize('text-xs')}`}>
                  {t('journeyOverview.milestonesDesc')}
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
          className={`group transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-teal/50 rounded-2xl border border-transparent hover:border-soul-teal/20 hover:bg-soul-teal/5 w-full max-w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full max-w-full gap-3 ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-teal to-soul-blue rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-8 h-8 rounded-xl' : 'w-12 h-12'}`}>
              <CheckCircle className={`text-white ${isFoldDevice ? 'h-3 w-3' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left min-w-0 w-full max-w-full">
            <h3 className={`font-semibold mb-1 text-foreground group-hover:text-soul-teal transition-colors w-full truncate ${getTextSize('text-base')}`}>
                {isFoldDevice ? t('journeyOverview.tasks') : t('journeyOverview.actionTasks')}
              </h3>
              <p className={`font-bold text-soul-teal mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {tasksCount}
              </p>
              {!isFoldDevice && !isUltraNarrow && (
                <p className={`text-muted-foreground w-full truncate ${getTextSize('text-xs')}`}>
                  {t('journeyOverview.tasksDesc')}
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
          className={`group transition-all duration-300 hover:scale-[1.02] active:scale-95 focus:outline-none focus:ring-2 focus:ring-soul-blue/50 rounded-2xl border border-transparent hover:border-soul-blue/20 hover:bg-soul-blue/5 w-full max-w-full ${spacing.card} ${touchTargetSize}`}
        >
          <div className={`flex items-center w-full max-w-full gap-3 ${isFoldDevice ? 'gap-2' : ''}`}>
            <div className={`bg-gradient-to-br from-soul-blue to-soul-purple rounded-2xl flex items-center justify-center group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0 ${isFoldDevice ? 'w-8 h-8 rounded-xl' : 'w-12 h-12'}`}>
              <Calendar className={`text-white ${isFoldDevice ? 'h-3 w-3' : 'h-6 w-6'}`} />
            </div>
            <div className="flex-1 text-left min-w-0 w-full max-w-full">
            <h3 className={`font-semibold mb-1 text-foreground group-hover:text-soul-blue transition-colors w-full truncate ${getTextSize('text-base')}`}>
                {t('journeyOverview.timeline')}
              </h3>
              <p className={`font-bold text-soul-blue mb-1 group-hover:scale-110 transition-transform ${getTextSize('text-2xl')} ${isFoldDevice ? getTextSize('text-xl') : ''}`}>
                {timeframe}
              </p>
              {!isFoldDevice && !isUltraNarrow && (
                <p className={`text-muted-foreground w-full truncate ${getTextSize('text-xs')}`}>
                  {t('journeyOverview.timelineDesc')}
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
