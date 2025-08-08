
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Sparkles, Target, CheckCircle } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface MobileTabsProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  milestonesCount: number;
}

export const MobileTabs: React.FC<MobileTabsProps> = ({
  activeTab,
  onTabChange,
  milestonesCount
}) => {
  const { isFoldDevice, isUltraNarrow, getTextSize } = useResponsiveLayout();

  // For very narrow screens, use a different approach
  if (isFoldDevice) {
    return (
      <div className="w-full bg-card/50 backdrop-blur-sm rounded-xl p-1 mb-6">
        <div className="flex flex-col w-full space-y-1">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all w-full ${
              activeTab === 'overview' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span className={`${getTextSize('text-xs')} truncate`}>Overview</span>
          </button>
          <button
            onClick={() => onTabChange('roadmap')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all w-full ${
              activeTab === 'roadmap' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="h-3 w-3 flex-shrink-0" />
            <span className={`${getTextSize('text-xs')} truncate`}>Roadmap</span>
            <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 min-w-0">
              {milestonesCount}
            </Badge>
          </button>
          <button
            onClick={() => onTabChange('nexttask')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg transition-all w-full ${
              activeTab === 'nexttask' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span className={`${getTextSize('text-xs')} truncate`}>Next Task</span>
          </button>
        </div>
      </div>
    );
  }

  // For ultra-narrow but not fold devices
  if (isUltraNarrow) {
    return (
      <div className="w-full bg-card/50 backdrop-blur-sm rounded-xl p-1 mb-6">
        <div className="grid grid-cols-3 gap-1 w-full">
          <button
            onClick={() => onTabChange('overview')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all min-w-0 ${
              activeTab === 'overview' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Sparkles className="h-3 w-3 flex-shrink-0" />
            <span className="text-[10px] truncate w-full text-center">Overview</span>
          </button>
          <button
            onClick={() => onTabChange('roadmap')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all min-w-0 relative ${
              activeTab === 'roadmap' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <Target className="h-3 w-3 flex-shrink-0" />
            <span className="text-[10px] truncate w-full text-center">Roadmap</span>
            <Badge variant="secondary" className="absolute -top-1 -right-1 text-[8px] px-1 py-0 h-3 min-w-0 leading-none">
              {milestonesCount}
            </Badge>
          </button>
          <button
            onClick={() => onTabChange('nexttask')}
            className={`flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all min-w-0 ${
              activeTab === 'nexttask' 
                ? 'bg-soul-purple/10 text-soul-purple font-medium' 
                : 'text-gray-600 hover:bg-gray-50'
            }`}
          >
            <CheckCircle className="h-3 w-3 flex-shrink-0" />
            <span className="text-[10px] truncate w-full text-center">Task</span>
          </button>
        </div>
      </div>
    );
  }

  // Default mobile layout for larger mobile screens
  return (
    <div className="w-full bg-card/50 backdrop-blur-sm rounded-xl p-1 mb-6">
      <div className="flex w-full">
        <button
          onClick={() => onTabChange('overview')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all flex-1 min-w-0 ${
            activeTab === 'overview' 
              ? 'bg-soul-purple/10 text-soul-purple font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Sparkles className="h-4 w-4 flex-shrink-0" />
          <span className={`${getTextSize('text-sm')} truncate`}>Overview</span>
        </button>
        <button
          onClick={() => onTabChange('roadmap')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all flex-1 min-w-0 relative ${
            activeTab === 'roadmap' 
              ? 'bg-soul-purple/10 text-soul-purple font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <Target className="h-4 w-4 flex-shrink-0" />
          <span className={`${getTextSize('text-sm')} truncate`}>Roadmap</span>
          <Badge variant="secondary" className="text-xs ml-1 flex-shrink-0">
            {milestonesCount}
          </Badge>
        </button>
        <button
          onClick={() => onTabChange('nexttask')}
          className={`flex items-center justify-center gap-2 py-3 px-4 rounded-lg transition-all flex-1 min-w-0 ${
            activeTab === 'nexttask' 
              ? 'bg-soul-purple/10 text-soul-purple font-medium' 
              : 'text-gray-600 hover:bg-gray-50'
          }`}
        >
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span className={`${getTextSize('text-sm')} truncate`}>Task</span>
        </button>
      </div>
    </div>
  );
};
