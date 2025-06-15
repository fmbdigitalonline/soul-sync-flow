
import React from 'react';
import { Button } from "@/components/ui/button";
import { ArrowLeft, Calendar, Target, Clock, CheckCircle2 } from 'lucide-react';

interface TimelineDetailViewProps {
  goal: any;
  milestones: any[];
  onBack: () => void;
}

export const TimelineDetailView: React.FC<TimelineDetailViewProps> = ({
  goal,
  milestones,
  onBack
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric'
    });
  };

  const today = new Date();
  const startDate = new Date(goal.created_at);
  const endDate = new Date(goal.target_completion);
  const totalDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.ceil((today.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysRemaining = Math.max(0, totalDays - daysElapsed);
  const progressPercentage = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));

  return (
    <div className="min-h-screen bg-gradient-to-br from-soul-blue/5 via-white to-soul-purple/5">
      <div className="max-w-4xl mx-auto p-4">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <Button 
            variant="ghost" 
            onClick={onBack}
            className="flex items-center gap-2 text-gray-600 hover:text-soul-blue"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Overview
          </Button>
          <div className="text-center flex-1">
            <h1 className="text-xl font-bold text-gray-800">Journey Timeline</h1>
            <p className="text-sm text-gray-500">{goal.timeframe} journey</p>
          </div>
          <div className="w-24" />
        </div>

        {/* Timeline Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Days Elapsed</h3>
            <p className="text-2xl font-bold text-green-600">{daysElapsed}</p>
            <p className="text-xs text-gray-500">Since you started</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl flex items-center justify-center mx-auto mb-3">
              <Target className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Days Remaining</h3>
            <p className="text-2xl font-bold text-blue-600">{daysRemaining}</p>
            <p className="text-xs text-gray-500">Until completion</p>
          </div>
          
          <div className="bg-white/80 backdrop-blur-lg rounded-xl p-4 shadow-lg border border-white/20 text-center">
            <div className="w-12 h-12 bg-gradient-to-br from-soul-purple to-soul-teal rounded-xl flex items-center justify-center mx-auto mb-3">
              <Calendar className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-800 mb-1">Progress</h3>
            <p className="text-2xl font-bold text-soul-purple">{Math.round(progressPercentage)}%</p>
            <p className="text-xs text-gray-500">Time elapsed</p>
          </div>
        </div>

        {/* Visual Timeline */}
        <div className="bg-white/80 backdrop-blur-lg rounded-2xl p-6 shadow-lg border border-white/20">
          <h2 className="text-lg font-semibold mb-6 flex items-center">
            <Calendar className="h-5 w-5 mr-2 text-soul-blue" />
            Your Journey Timeline
          </h2>
          
          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Started: {formatDateShort(goal.created_at)}</span>
              <span>Target: {formatDateShort(goal.target_completion)}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-gradient-to-r from-soul-purple to-soul-teal rounded-full transition-all duration-1000"
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
            <div className="text-center mt-2">
              <span className="text-xs text-gray-500">
                {daysElapsed} of {totalDays} days
              </span>
            </div>
          </div>

          {/* Milestone Timeline */}
          <div className="space-y-4">
            <h3 className="font-medium text-gray-800 mb-4">Milestone Schedule</h3>
            {milestones.map((milestone, index) => {
              const milestoneDate = new Date(milestone.target_date);
              const isPast = milestoneDate < today;
              const isCompleted = milestone.completed;
              
              return (
                <div key={milestone.id} className="flex items-center space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                    isCompleted ? 'bg-soul-purple text-white' : 
                    isPast ? 'bg-yellow-500 text-white' : 
                    'bg-gray-200 text-gray-400'
                  }`}>
                    {isCompleted ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <span className="text-xs font-bold">{index + 1}</span>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <h4 className={`font-medium text-sm ${isCompleted ? 'line-through text-gray-500' : 'text-gray-800'}`}>
                      {milestone.title}
                    </h4>
                    <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                      <span>Target: {formatDate(milestone.target_date)}</span>
                      {isPast && !isCompleted && (
                        <span className="text-yellow-600 font-medium">Needs Attention</span>
                      )}
                      {isCompleted && (
                        <span className="text-soul-purple font-medium">✓ Completed</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
