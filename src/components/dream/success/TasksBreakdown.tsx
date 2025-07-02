
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckSquare, Clock, Zap, ChevronDown, ChevronUp, Target } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const isMobile = useIsMobile();
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
    <div className={`bg-white/80 backdrop-blur-lg rounded-2xl p-4 sm:p-6 shadow-lg border border-white/20 transition-all duration-500 w-full max-w-full ${
      isHighlighted ? 'ring-2 ring-soul-purple shadow-soul-purple/20 transform scale-[1.02]' : ''
    }`}>
      <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6 flex items-center gap-3 flex-wrap">
        <CheckSquare className="h-5 w-5 sm:h-6 sm:w-6 text-soul-purple flex-shrink-0" />
        <span className="flex-1 min-w-0">Complete Task Breakdown</span>
        <Badge className="bg-soul-purple/10 text-soul-purple text-xs border-0 flex-shrink-0">
          {displayTasks.length} Tasks
        </Badge>
      </h3>
      
      <div className="space-y-4">
        {Object.entries(tasksByMilestone).map(([milestoneId, milestoneTasks]) => (
          <div key={milestoneId} className="border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleMilestone(milestoneId)}
              className="w-full p-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-soul-purple" />
                <span className="font-medium text-gray-800 text-sm">
                  {getMilestoneTitle(milestoneId)}
                </span>
                <Badge variant="outline" className="text-xs">
                  {Array.isArray(milestoneTasks) ? milestoneTasks.length : 0} tasks
                </Badge>
              </div>
              {expandedMilestone === milestoneId ? (
                <ChevronUp className="h-4 w-4 text-gray-500" />
              ) : (
                <ChevronDown className="h-4 w-4 text-gray-500" />
              )}
            </button>
            
            {expandedMilestone === milestoneId && Array.isArray(milestoneTasks) && (
              <div className="space-y-2 p-3 bg-white">
                {milestoneTasks.map((task: any, index: number) => (
                  <button
                    key={task.id || index}
                    onClick={() => handleTaskClick(task)}
                    className="w-full p-3 border border-gray-200 rounded-lg hover:border-soul-purple/30 hover:bg-soul-purple/5 transition-all duration-200 text-left"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-6 h-6 bg-soul-purple/20 rounded-full flex items-center justify-center text-soul-purple font-medium text-xs flex-shrink-0 mt-0.5">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-800 text-sm mb-1 line-clamp-1">
                          {task.title}
                        </h4>
                        <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                          {task.description}
                        </p>
                        
                        <div className="flex gap-2 flex-wrap">
                          <Badge variant="outline" className="text-xs">
                            <Clock className="h-3 w-3 mr-1" />
                            {task.estimated_duration || '1 hour'}
                          </Badge>
                          <Badge className={`text-xs ${getEnergyColor(task.energy_level_required)}`}>
                            <span className="mr-1">{getEnergyIcon(task.energy_level_required)}</span>
                            {task.energy_level_required || 'medium'} energy
                          </Badge>
                          {task.category && (
                            <Badge variant="outline" className="text-xs">
                              {task.category}
                            </Badge>
                          )}
                        </div>
                        
                        {task.blueprint_reasoning && (
                          <div className="mt-2">
                            <p className="text-xs text-soul-purple bg-soul-purple/10 rounded px-2 py-1 inline-block">
                              💡 {task.blueprint_reasoning}
                            </p>
                          </div>
                        )}
                        
                        {task.optimal_timing && (
                          <div className="mt-2">
                            <p className="text-xs text-gray-500">
                              🕒 Best time: {task.optimal_timing}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
        
        {displayTasks.length === 0 && (
          <div className="text-center py-6 text-gray-500">
            <CheckSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No tasks generated yet</p>
          </div>
        )}
      </div>
      
      {displayTasks.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setExpandedMilestone(expandedMilestone ? null : Object.keys(tasksByMilestone)[0])}
            className="w-full text-xs"
          >
            {expandedMilestone ? 'Collapse All' : 'Expand All Tasks'}
          </Button>
          <p className="text-xs text-center text-gray-500 mt-2">
            ✨ Each task is optimized for your energy patterns and cognitive style
          </p>
        </div>
      )}
    </div>
  );
};
