
import React from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Target, Calendar, CheckCircle2, Star, MapPin } from 'lucide-react';

interface MilestoneDetailViewProps {
  milestones: any[];
  onBack: () => void;
  onMilestoneSelect: (milestone: any) => void;
}

export const MilestoneDetailView: React.FC<MilestoneDetailViewProps> = ({
  milestones,
  onBack,
  onMilestoneSelect
}) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'TBD';
    const parsedDate = new Date(dateString);

    if (Number.isNaN(parsedDate.getTime())) {
      return 'TBD';
    }

    return parsedDate.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const safeMilestones = Array.isArray(milestones)
    ? milestones.filter((milestone) => milestone && typeof milestone === 'object')
    : [];

  const completedMilestones = safeMilestones.filter(m => Boolean(m?.completed));
  const currentMilestone = safeMilestones.find(m => !m?.completed);
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-purple/5 via-white to-soul-teal/5">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-soul-purple"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-800">Journey Milestones</h1>
            <p className="text-sm text-gray-500">{completedMilestones.length} of {safeMilestones.length} completed</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Progress Stats */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-4 mb-6 shadow-lg border border-white/20">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-soul-purple">{completedMilestones.length}</div>
              <div className="text-xs text-gray-500">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-500">{currentMilestone ? 1 : 0}</div>
              <div className="text-xs text-gray-500">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-400">{safeMilestones.length - completedMilestones.length - (currentMilestone ? 1 : 0)}</div>
              <div className="text-xs text-gray-500">Upcoming</div>
            </div>
          </div>
        </div>

        {/* Milestone Timeline */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-4 flex items-center">
            <Target className="h-5 w-5 mr-2 text-soul-purple" />
            Your Milestone Journey
          </h2>
          
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-5 top-8 bottom-8 w-0.5 bg-gradient-to-b from-soul-purple via-blue-400 to-gray-300"></div>
            
            <div className="space-y-6">
              {safeMilestones.map((milestone, index) => {
                const isCompleted = Boolean(milestone?.completed);
                const isCurrent = !isCompleted && index === completedMilestones.length;
                const milestoneTitle = typeof milestone?.title === 'string' && milestone.title.trim()
                  ? milestone.title
                  : `Milestone ${index + 1}`;
                const milestoneDescription = milestone?.description || 'Stay focused and keep moving forward.';
                const completionCriteriaCount = Array.isArray(milestone?.completion_criteria)
                  ? milestone.completion_criteria.length
                  : 0;
                const handleMilestoneFocus = () => {
                  if (!milestone) return;
                  onMilestoneSelect(milestone);
                };
                
                return (
                  <button
                    key={milestone?.id ?? `milestone-${index}`}
                    onClick={handleMilestoneFocus}
                    className="flex items-start space-x-4 relative z-10 w-full text-left group transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-soul-purple/50 rounded-lg"
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all duration-300 ${
                      isCompleted ? 'bg-soul-purple text-white scale-105' : 
                      isCurrent ? 'bg-blue-500 text-white animate-pulse shadow-xl' : 
                      'bg-gray-200 text-gray-400 group-hover:bg-gray-300'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : isCurrent ? (
                        <Star className="h-5 w-5" />
                      ) : (
                        <MapPin className="h-5 w-5" />
                      )}
                    </div>
                    
                    <div className="flex-1 p-4 rounded-xl border transition-all duration-300 group-hover:shadow-md group-hover:border-soul-purple/30" 
                         style={{
                           backgroundColor: isCompleted ? '#f8fafc' : isCurrent ? '#dbeafe' : '#f9fafb',
                           borderColor: isCompleted ? '#e2e8f0' : isCurrent ? '#3b82f6' : '#e5e7eb'
                         }}>
                      <div className="flex items-center justify-between mb-2">
                        <h3 className={`font-semibold text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                          {milestoneTitle}
                        </h3>
                        {isCurrent && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200 text-xs">
                            Current Focus
                          </Badge>
                        )}
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-3">{milestoneDescription}</p>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="h-3 w-3" />
                          <span>Target: {formatDate(milestone?.target_date)}</span>
                        </div>
                        
                        <div className="text-xs text-gray-400 group-hover:text-soul-purple transition-colors">
                          Tap to focus →
                        </div>
                      </div>
                      
                      {completionCriteriaCount > 0 && (
                        <div className="mt-2 text-xs text-gray-500">
                          {completionCriteriaCount} completion criteria
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
