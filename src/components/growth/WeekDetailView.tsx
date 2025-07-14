
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowLeft, Play, Star, Target, MessageSquare, TrendingUp } from 'lucide-react';
import { ProgramWeek } from '@/types/growth-program';
import { useEnhancedAICoach } from '@/hooks/use-enhanced-ai-coach-stub';
import { GuideInterface } from '@/components/coach/GuideInterface';
import { useToast } from '@/hooks/use-toast';
import { useMilestoneTracker } from '@/hooks/use-milestone-tracker';

interface WeekDetailViewProps {
  week: ProgramWeek;
  onBack: () => void;
  onMarkComplete: (weekNumber: number) => void;
}

export const WeekDetailView: React.FC<WeekDetailViewProps> = ({
  week,
  onBack,
  onMarkComplete
}) => {
  const [activeActivity, setActiveActivity] = useState<string | null>(null);
  const [completedActivities, setCompletedActivities] = useState<string[]>([]);
  const [weekProgress, setWeekProgress] = useState<any>(null);
  const { messages, isLoading, sendMessage, resetConversation } = useEnhancedAICoach("guide");
  const { toast } = useToast();
  const { calculateMilestoneProgress, getProgressInsights, updateMilestoneTracking } = useMilestoneTracker();

  // Generate week-specific conversation starter
  const getWeekConversationStarter = () => {
    const themePrompts = {
      foundation: `I'm starting Week ${week.week_number}: Foundation. I want to explore my current state in ${week.focus_area}. Help me understand where I am right now and what I want to achieve.`,
      belief_excavation: `I'm in Week ${week.week_number}: Belief Excavation, focusing on ${week.focus_area}. I'm ready to explore what beliefs might be holding me back. Guide me through this safely.`,
      blueprint_activation: `I'm in Week ${week.week_number}: Blueprint Activation, working on ${week.focus_area}. I want to understand how my personality blueprint can guide my growth in this area.`,
      domain_deep_dive: `I'm in Week ${week.week_number}: Domain Deep Dive, focusing on ${week.focus_area}. I'm ready to go deeper and create specific action steps for transformation.`,
      integration: `I'm in Week ${week.week_number}: Integration, working on ${week.focus_area}. Help me connect what I've learned to other areas of my life and create lasting change.`,
      graduation: `I'm in Week ${week.week_number}: Graduation, reflecting on ${week.focus_area}. I want to celebrate my progress and plan my continued growth journey.`
    };
    
    return themePrompts[week.theme] || `I'm working on Week ${week.week_number} of my growth program, focusing on ${week.focus_area}. How can we work together on this?`;
  };

  const handleStartConversation = () => {
    const starter = getWeekConversationStarter();
    sendMessage(starter);
    setActiveActivity('conversation');
  };

  const handleCompleteActivity = (activity: string) => {
    if (!completedActivities.includes(activity)) {
      setCompletedActivities([...completedActivities, activity]);
      toast({
        title: "Activity Completed!",
        description: `Great work on: ${activity}`,
      });
    }
  };

  const handleMarkWeekComplete = async () => {
    if (completedActivities.length >= week.completion_criteria.length) {
      // Update milestone tracking before marking complete
      await updateMilestoneTracking(`week-${week.week_number}`);
      
      onMarkComplete(week.week_number);
      toast({
        title: "Week Completed!",
        description: `Congratulations on completing Week ${week.week_number}: ${week.theme.replace('_', ' ')}`,
      });
    } else {
      toast({
        title: "Week Not Ready",
        description: "Please complete more activities before marking this week as done.",
        variant: "destructive"
      });
    }
  };

  // Calculate real progress from multiple sources
  const calculateRealProgress = () => {
    const activityProgress = (completedActivities.length / week.completion_criteria.length) * 100;
    const milestoneProgress = weekProgress?.metrics?.overall_progress || 0;
    
    // Weighted combination of activity completion and milestone progress
    return Math.round((activityProgress * 0.6) + (milestoneProgress * 0.4));
  };

  const progressPercentage = calculateRealProgress();

  // Load week progress on mount
  useEffect(() => {
    const loadWeekProgress = async () => {
      try {
        const insights = await getProgressInsights(`week-${week.week_number}`);
        setWeekProgress(insights);
      } catch (error) {
        console.error('Error loading week progress:', error);
      }
    };
    
    loadWeekProgress();
  }, [week.week_number, completedActivities.length]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Program
        </Button>
        <Badge variant="outline" className="capitalize">
          Week {week.week_number}
        </Badge>
      </div>

      {/* Week Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl capitalize">
            {week.theme.replace('_', ' ')}: {week.focus_area}
          </CardTitle>
          <div className="flex items-center gap-4">
            <div className="flex-1">
              <div className="flex justify-between text-sm mb-2">
                <span>Week Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
            </div>
            <Button 
              onClick={handleMarkWeekComplete}
              disabled={completedActivities.length < week.completion_criteria.length}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Complete Week
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Activities Panel */}
        <div className="space-y-4">
          {/* Real Progress Insights */}
          {weekProgress && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <TrendingUp className="h-5 w-5 mr-2" />
                  Your Progress Analytics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground">Task Completion</div>
                    <div className="font-semibold">{weekProgress.metrics.task_completion_rate.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Consistency</div>
                    <div className="font-semibold">{weekProgress.metrics.time_consistency.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Engagement</div>
                    <div className="font-semibold">{weekProgress.metrics.engagement_quality.toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground">Reflection Depth</div>
                    <div className="font-semibold">{weekProgress.metrics.reflection_depth.toFixed(1)}%</div>
                  </div>
                </div>
                
                {weekProgress.insights.length > 0 && (
                  <div className="mt-4 p-3 bg-soul-purple/10 rounded-lg">
                    <div className="text-sm font-medium mb-2">Personalized Insights:</div>
                    <ul className="text-sm space-y-1">
                      {weekProgress.insights.slice(0, 2).map((insight: string, idx: number) => (
                        <li key={idx} className="text-muted-foreground">• {insight}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* Key Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Target className="h-5 w-5 mr-2" />
                Key Activities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {week.key_activities.map((activity, idx) => (
                <div
                  key={idx}
                  className={`p-3 rounded-lg border cursor-pointer transition-all ${
                    completedActivities.includes(activity)
                      ? 'bg-green-50 border-green-200'
                      : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                  }`}
                  onClick={() => handleCompleteActivity(activity)}
                >
                  <div className="flex items-center justify-between">
                    <span className="flex-1">{activity}</span>
                    {completedActivities.includes(activity) ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : (
                      <div className="h-5 w-5 border-2 border-gray-300 rounded-full" />
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Tools Available */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Star className="h-5 w-5 mr-2" />
                Available Tools
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {week.tools_unlocked.map((tool) => (
                  <Badge key={tool} variant="secondary" className="justify-center py-2">
                    {tool}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Completion Criteria */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Week Completion Goals</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {week.completion_criteria.map((criteria, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${
                    completedActivities.length > idx ? 'bg-green-500' : 'bg-gray-300'
                  }`} />
                  <span className="text-sm">{criteria}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Conversation Panel */}
        <Card className="h-fit">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                <MessageSquare className="h-5 w-5 mr-2" />
                Week-Focused Conversation
              </CardTitle>
              {activeActivity !== 'conversation' && (
                <Button onClick={handleStartConversation} size="sm">
                  <Play className="h-4 w-4 mr-2" />
                  Start Session
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {activeActivity === 'conversation' ? (
              <div className="h-96 flex flex-col">
                <GuideInterface
                  messages={messages}
                  isLoading={isLoading}
                  onSendMessage={sendMessage}
                  messagesEndRef={React.createRef()}
                />
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Start a conversation to work on this week's focus area</p>
                <p className="text-sm mt-2">
                  The Soul Guide is ready to help you with: {week.focus_area}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
