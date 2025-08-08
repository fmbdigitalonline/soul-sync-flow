
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Zap, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useResponsiveLayout } from '@/hooks/use-responsive-layout';

interface TasksBreakdownProps {
  tasks: any[];
  milestones: any[];
  isHighlighted: boolean;
  onTaskClick?: (task: any) => void;
}

export const TasksBreakdown: React.FC<TasksBreakdownProps> = ({
  tasks,
  milestones,
  isHighlighted,
  onTaskClick
}) => {
  const { spacing, layout, touchTargetSize, getTextSize, isFoldDevice, isUltraNarrow } = useResponsiveLayout();
  const [expandedMilestone, setExpandedMilestone] = useState<string | null>(null);
  
  // Ensure tasks and milestones are arrays and provide defaults
  const displayTasks = Array.isArray(tasks) ? tasks : [];
  const displayMilestones = Array.isArray(milestones) ? milestones : [];
  
  const handleTaskClick = (task: any) => {
    if (onTaskClick) {
      onTaskClick(task);
    }
  };

  const getEnergyIcon = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '🌱';
      default: return '⚡';
    }
  };

  const getEnergyColor = (level: string) => {
    switch (level?.toLowerCase()) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  // Group tasks by milestone
  const tasksByMilestone = displayTasks.reduce((acc, task) => {
    const milestoneId = task.milestone_id || 'unassigned';
    if (!acc[milestoneId]) {
      acc[milestoneId] = [];
    }
    acc[milestoneId].push(task);
    return acc;
  }, {} as Record<string, any[]>);

  const getMilestoneTitle = (milestoneId: string) => {
    if (milestoneId === 'unassigned') return 'General Tasks';
    const milestone = displayMilestones.find(m => m.id === milestoneId);
    return milestone?.title || `Milestone ${milestoneId.slice(-4)}`;
  };

  const toggleMilestone = (milestoneId: string) => {
    setExpandedMilestone(expandedMilestone === milestoneId ? null : milestoneId);
  };

  return (
    <div className={`bg-card/80 backdrop-blur-lg rounded-2xl shadow-lg transition-all duration-500 w-full max-w-full ${spacing.card} ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <h3 className={`font-semibold mb-4 flex items-center flex-wrap ${getTextSize('text-base')} ${spacing.gap} ${isFoldDevice ? 'mb-2' : ''}`}>
        <CheckSquare className={`text-soul-purple flex-shrink-0 ${isFoldDevice ? 'h-4 w-4' : 'h-5 w-5'}`} />
        <span className="flex-1 min-w-0">{isFoldDevice ? 'Tasks' : 'Complete Task Breakdown'}</span>
        <Badge className={`bg-soul-purple/10 text-soul-purple border-0 flex-shrink-0 ${getTextSize('text-xs')}`}>
          {displayTasks.length} {isFoldDevice ? '' : 'Tasks'}
        </Badge>
      </h3>
      
      <div className={`space-y-4 ${isFoldDevice ? 'space-y-2' : ''}`}>
        {Object.entries(tasksByMilestone).map(([milestoneId, milestoneTasks]) => (
          <div key={milestoneId} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleMilestone(milestoneId)}
              className={`w-full bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between ${spacing.card} ${touchTargetSize}`}
            >
              <div className={`flex items-center ${spacing.gap}`}>
                <Target className={`text-soul-purple ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
                <span className={`font-medium text-gray-800 ${getTextSize('text-sm')} ${isFoldDevice ? 'truncate' : ''}`}>
                  {isFoldDevice ? getMilestoneTitle(milestoneId).split(' ')[0] : getMilestoneTitle(milestoneId)}
                </span>
                <Badge variant="outline" className={getTextSize('text-xs')}>
                  {Array.isArray(milestoneTasks) ? milestoneTasks.length : 0}
                </Badge>
              </div>
              {expandedMilestone === milestoneId ? (
                <ChevronUp className={`text-gray-500 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              ) : (
                <ChevronDown className={`text-gray-500 ${isFoldDevice ? 'h-3 w-3' : 'h-4 w-4'}`} />
              )}
            </button>
            
            {expandedMilestone === milestoneId && Array.isArray(milestoneTasks) && (
              <div className={`bg-white ${spacing.card} ${spacing.gap}`}>
                <div className={`space-y-2 ${isFoldDevice ? 'space-y-1' : ''}`}>
                  {milestoneTasks.map((task: any, index: number) => (
                    <button
                      key={task.id || index}
                      onClick={() => handleTaskClick(task)}
                      className={`w-full border border-gray-200 rounded-lg hover:border-soul-purple/30 hover:bg-soul-purple/5 transition-all duration-200 text-left ${spacing.card} ${touchTargetSize}`}
                    >
                      <div className={`flex items-start ${spacing.gap}`}>
                        <div className={`bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-medium flex-shrink-0 mt-0.5 ${getTextSize('text-xs')} ${isFoldDevice ? 'w-5 h-5' : 'w-6 h-6'}`}>
                          {index + 1}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium text-gray-800 mb-1 line-clamp-1 ${getTextSize('text-sm')}`}>
                            {task.title}
                          </h4>
                          {!isFoldDevice && task.description && (
                            <p className={`text-gray-600 mb-2 line-clamp-2 ${getTextSize('text-xs')}`}>
                              {task.description}
                            </p>
                          )}
                          
                          <div className={`flex flex-wrap ${isFoldDevice ? 'gap-1' : 'gap-2'}`}>
                            <Badge variant="outline" className={getTextSize('text-xs')}>
                              <Clock className={`mr-1 ${isFoldDevice ? 'h-2 w-2' : 'h-3 w-3'}`} />
                              {isFoldDevice ? (task.estimated_duration || '1h').replace('hour', 'h') : (task.estimated_duration || '1 hour')}
                            </Badge>
                            <Badge className={`${getEnergyColor(task.energy_level_required)} ${getTextSize('text-xs')}`}>
                              <span className="mr-1">{getEnergyIcon(task.energy_level_required)}</span>
                              {isFoldDevice ? (task.energy_level_required || 'med').slice(0, 3) : `${task.energy_level_required || 'medium'} energy`}
                            </Badge>
                            {task.category && !isFoldDevice && (
                              <Badge variant="outline" className={getTextSize('text-xs')}>
                                {task.category}
                              </Badge>
                            )}
                          </div>
                          
                          {task.blueprint_reasoning && !isFoldDevice && (
                            <div className="mt-2">
                              <p className={`text-soul-purple bg-soul-purple/10 rounded px-2 py-1 inline-block ${getTextSize('text-xs')}`}>
                                💡 {task.blueprint_reasoning}
                              </p>
                            </div>
                          )}
                          
                          {task.optimal_timing && !isFoldDevice && (
                            <div className="mt-2">
                              <p className={`text-gray-500 ${getTextSize('text-xs')}`}>
                                🕒 Best time: {task.optimal_timing}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
        
        {displayTasks.length === 0 && (
          <div className={`text-center py-6 text-gray-500 ${isFoldDevice ? 'py-4' : ''}`}>
            <CheckSquare className={`mx-auto mb-2 opacity-50 ${isFoldDevice ? 'h-6 w-6' : 'h-8 w-8'}`} />
            <p className={getTextSize('text-sm')}>No tasks generated yet</p>
          </div>
        )}
      </div>
      
      {displayTasks.length > 0 && (
        <div className={`mt-4 pt-4 border-t border-gray-200 ${isFoldDevice ? 'mt-2 pt-2' : ''}`}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedMilestone(expandedMilestone ? null : Object.keys(tasksByMilestone)[0])}
            className={`w-full ${getTextSize('text-xs')} ${touchTargetSize}`}
          >
            {expandedMilestone ? 'Collapse All' : isFoldDevice ? 'Expand Tasks' : 'Expand All Tasks'}
          </Button>
          {!isFoldDevice && (
            <p className={`text-center text-gray-500 mt-2 ${getTextSize('text-xs')}`}>
              ✨ Each task is optimized for your energy patterns and cognitive style
            </p>
          )}
        </div>
      )}
    </div>
  );
};
