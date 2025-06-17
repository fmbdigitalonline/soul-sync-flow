
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Target, Clock, CheckCircle2, Calendar, Brain } from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { format, startOfWeek, endOfWeek, isWithinInterval, parseISO } from "date-fns";

interface WeeklySummaryProps {
  weekDate?: Date;
}

export const WeeklySummary: React.FC<WeeklySummaryProps> = ({ 
  weekDate = new Date() 
}) => {
  const { productivityJourney } = useJourneyTracking();
  
  const weekStart = startOfWeek(weekDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(weekDate, { weekStartsOn: 1 });
  
  // Calculate week metrics
  const weekMetrics = React.useMemo(() => {
    if (!productivityJourney?.current_goals) return null;
    
    const goals = productivityJourney.current_goals as any[];
    let tasksCompleted = 0;
    let totalTasks = 0;
    let completedGoals = 0;
    let timeSpent = 0;
    const categories: Record<string, number> = {};
    
    goals.forEach(goal => {
      if (goal.progress >= 100) completedGoals++;
      
      goal.tasks?.forEach((task: any) => {
        totalTasks++;
        if (task.status === 'completed' || task.completed) {
          tasksCompleted++;
          
          // Estimate time spent (rough calculation)
          const duration = task.estimated_duration || '30 min';
          const minutes = duration.includes('hour') ? 
            parseInt(duration) * 60 : 
            parseInt(duration) || 30;
          timeSpent += minutes;
        }
        
        // Track categories
        const category = task.category || 'execution';
        categories[category] = (categories[category] || 0) + 1;
      });
    });
    
    return {
      tasksCompleted,
      totalTasks,
      completionRate: totalTasks > 0 ? (tasksCompleted / totalTasks) * 100 : 0,
      completedGoals,
      totalGoals: goals.length,
      timeSpent,
      topCategory: Object.entries(categories).sort((a, b) => b[1] - a[1])[0]?.[0] || 'execution'
    };
  }, [productivityJourney, weekStart, weekEnd]);
  
  const generateInsights = () => {
    if (!weekMetrics) return [];
    
    const insights = [];
    
    if (weekMetrics.completionRate >= 80) {
      insights.push({
        type: 'success',
        message: `Excellent week! You completed ${weekMetrics.completionRate.toFixed(0)}% of your tasks.`,
        icon: CheckCircle2
      });
    } else if (weekMetrics.completionRate >= 60) {
      insights.push({
        type: 'progress',
        message: `Good progress this week. Consider time-blocking for better focus.`,
        icon: Target
      });
    } else {
      insights.push({
        type: 'improvement',
        message: `This week shows opportunity for growth. Try breaking tasks into smaller steps.`,
        icon: TrendingUp
      });
    }
    
    if (weekMetrics.timeSpent > 0) {
      const hoursSpent = Math.round(weekMetrics.timeSpent / 60);
      insights.push({
        type: 'time',
        message: `You invested ${hoursSpent} hours in productive work.`,
        icon: Clock
      });
    }
    
    return insights;
  };
  
  const insights = generateInsights();
  
  if (!weekMetrics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
          <CardDescription>
            {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No activity data available for this week.</p>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Weekly Summary
        </CardTitle>
        <CardDescription>
          {format(weekStart, 'MMM d')} - {format(weekEnd, 'MMM d, yyyy')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Task Completion Overview */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Task Completion</h4>
            <Badge variant={weekMetrics.completionRate >= 70 ? "default" : "secondary"}>
              {weekMetrics.tasksCompleted}/{weekMetrics.totalTasks} completed
            </Badge>
          </div>
          <Progress value={weekMetrics.completionRate} className="h-2" />
          <p className="text-sm text-muted-foreground">
            {weekMetrics.completionRate.toFixed(0)}% completion rate
          </p>
        </div>
        
        {/* Goals Progress */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="font-medium">Goals Progress</h4>
            <Badge variant="outline">
              {weekMetrics.completedGoals}/{weekMetrics.totalGoals} goals
            </Badge>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Time Invested</p>
              <p className="font-medium">{Math.round(weekMetrics.timeSpent / 60)}h</p>
            </div>
            <div>
              <p className="text-muted-foreground">Top Category</p>
              <p className="font-medium capitalize">{weekMetrics.topCategory}</p>
            </div>
          </div>
        </div>
        
        {/* AI Insights */}
        <div className="space-y-3">
          <h4 className="font-medium flex items-center gap-2">
            <Brain className="h-4 w-4" />
            AI Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, index) => {
              const IconComponent = insight.icon;
              return (
                <div key={index} className="flex items-start gap-2 p-3 bg-muted/50 rounded-lg">
                  <IconComponent className="h-4 w-4 mt-0.5 text-soul-purple" />
                  <p className="text-sm">{insight.message}</p>
                </div>
              );
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
