
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Sparkles, 
  Target, 
  CheckSquare, 
  Calendar,
  TrendingUp,
  Eye,
  List,
  ArrowRight
} from 'lucide-react';
import { MilestonesRoadmap } from './MilestonesRoadmap';
import { TasksBreakdown } from './TasksBreakdown';

interface DreamSuccessViewProps {
  dream: any;
  onStartJourney: () => void;
  onViewDetails: () => void;
}

export const DreamSuccessView: React.FC<DreamSuccessViewProps> = ({
  dream,
  onStartJourney,
  onViewDetails
}) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMilestone, setSelectedMilestone] = useState<any>(null);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  const milestones = dream?.milestones || [];
  const tasks = dream?.tasks || [];
  const insights = dream?.blueprint_insights || [];

  const handleMilestoneClick = (milestone: any) => {
    setSelectedMilestone(milestone);
    setActiveTab('milestones');
  };

  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
    setActiveTab('tasks');
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Success Header */}
        <div className="text-center space-y-4 py-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-soul-purple rounded-full mb-4">
            <Sparkles className="h-8 w-8 text-white animate-pulse" />
          </div>
          
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">
            Your Dream Journey is Ready! ✨
          </h1>
          
          <div className="bg-card/80 backdrop-blur-lg rounded-xl p-4 max-w-2xl mx-auto shadow-sm">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">{dream?.title}</h2>
            <p className="text-sm text-gray-600 mb-4">{dream?.description}</p>
            
            <div className="flex items-center justify-center gap-4 text-sm">
              <Badge variant="outline" className="flex items-center gap-1">
                <Target className="h-3 w-3" />
                {milestones.length} Milestones
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <CheckSquare className="h-3 w-3" />
                {tasks.length} Tasks
              </Badge>
              <Badge variant="outline" className="flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {dream?.timeframe}
              </Badge>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center">
          <Button 
            onClick={onStartJourney}
            className="bg-soul-purple hover:bg-soul-purple/90 text-white px-6 py-2"
          >
            <TrendingUp className="h-4 w-4 mr-2" />
            Start Journey
          </Button>
          <Button 
            variant="outline" 
            onClick={onViewDetails}
            className="px-6 py-2"
          >
            <Eye className="h-4 w-4 mr-2" />
            View Details
          </Button>
        </div>

        {/* Enhanced Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="milestones" className="flex items-center gap-2">
              <Target className="h-4 w-4" />
              <span className="hidden sm:inline">Milestones</span>
              <Badge variant="secondary" className="text-xs ml-1">
                {milestones.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="tasks" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Tasks</span>
              <Badge variant="secondary" className="text-xs ml-1">
                {tasks.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6 mt-6">
            <div className="grid gap-6 md:grid-cols-2">
              <MilestonesRoadmap
                milestones={milestones}
                isHighlighted={false}
                onMilestoneClick={handleMilestoneClick}
              />
              <TasksBreakdown
                tasks={tasks}
                milestones={milestones}
                isHighlighted={false}
                onTaskClick={handleTaskClick}
              />
            </div>
            
            {/* Blueprint Insights */}
            {insights.length > 0 && (
              <div className="bg-card/80 backdrop-blur-lg rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-soul-purple" />
                  Personalized Insights
                </h3>
                <div className="space-y-3">
                  {insights.map((insight: string, index: number) => (
                    <div key={index} className="flex items-start gap-3 p-3 bg-soul-purple/5 rounded-lg">
                      <div className="w-6 h-6 bg-soul-purple/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-soul-purple text-xs font-bold">{index + 1}</span>
                      </div>
                      <p className="text-sm text-gray-700">{insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="milestones" className="mt-6">
            <MilestonesRoadmap
              milestones={milestones}
              isHighlighted={true}
              onMilestoneClick={handleMilestoneClick}
            />
          </TabsContent>

          <TabsContent value="tasks" className="mt-6">
            <TasksBreakdown
              tasks={tasks}
              milestones={milestones}
              isHighlighted={true}
              onTaskClick={handleTaskClick}
            />
          </TabsContent>
        </Tabs>

        {/* Personalization Note */}
        <div className="text-center">
          <p className="text-sm text-gray-600 bg-card/60 rounded-lg p-4 max-w-2xl mx-auto">
            ✨ {dream?.personalization_notes || 
              `This journey has been crafted specifically for your unique blueprint, 
              with ${milestones.length} milestones and ${tasks.length} tasks optimized for your energy type and cognitive style.`}
          </p>
        </div>
        
      </div>
    </div>
  );
};
