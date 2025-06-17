
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Target, Clock, Zap, Calendar } from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, BarChart, Bar } from "recharts";
import { format, subDays, startOfDay } from "date-fns";

export const ProgressAnalytics: React.FC = () => {
  const { productivityJourney } = useJourneyTracking();
  
  // Generate mock productivity data for the chart
  const generateProductivityData = () => {
    const data = [];
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i);
      const tasksCompleted = Math.floor(Math.random() * 8) + 2;
      const focusTime = Math.floor(Math.random() * 4) + 2;
      
      data.push({
        date: format(date, 'MMM dd'),
        fullDate: date,
        tasks: tasksCompleted,
        focusHours: focusTime,
        efficiency: Math.floor(Math.random() * 30) + 70
      });
    }
    return data;
  };
  
  const productivityData = generateProductivityData();
  
  // Calculate analytics from journey data
  const analytics = React.useMemo(() => {
    if (!productivityJourney?.current_goals) {
      return {
        totalTasks: 0,
        completedTasks: 0,
        completionRate: 0,
        activeGoals: 0,
        avgTaskTime: 0,
        productivityTrend: 0,
        streakDays: 0
      };
    }
    
    const goals = productivityJourney.current_goals as any[];
    let totalTasks = 0;
    let completedTasks = 0;
    let totalTimeSpent = 0;
    
    goals.forEach(goal => {
      goal.tasks?.forEach((task: any) => {
        totalTasks++;
        if (task.status === 'completed' || task.completed) {
          completedTasks++;
          
          // Estimate time (rough calculation)
          const duration = task.estimated_duration || '30 min';
          const minutes = duration.includes('hour') ? 
            parseInt(duration) * 60 : 
            parseInt(duration) || 30;
          totalTimeSpent += minutes;
        }
      });
    });
    
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
    const avgTaskTime = completedTasks > 0 ? totalTimeSpent / completedTasks : 0;
    
    // Calculate trend (simplified)
    const recent3Days = productivityData.slice(-3).reduce((sum, day) => sum + day.tasks, 0);
    const previous3Days = productivityData.slice(-6, -3).reduce((sum, day) => sum + day.tasks, 0);
    const productivityTrend = recent3Days - previous3Days;
    
    return {
      totalTasks,
      completedTasks,
      completionRate,
      activeGoals: goals.filter(g => g.progress < 100).length,
      avgTaskTime: Math.round(avgTaskTime),
      productivityTrend,
      streakDays: 3 // Mock streak
    };
  }, [productivityJourney, productivityData]);
  
  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <TrendingUp className="h-4 w-4 text-green-500" />;
    if (trend < 0) return <TrendingDown className="h-4 w-4 text-red-500" />;
    return <Target className="h-4 w-4 text-gray-500" />;
  };
  
  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-600';
    if (trend < 0) return 'text-red-600';
    return 'text-gray-600';
  };
  
  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{analytics.completionRate.toFixed(0)}%</p>
              </div>
              <Target className="h-8 w-8 text-soul-purple" />
            </div>
            <Progress value={analytics.completionRate} className="mt-2" />
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Goals</p>
                <p className="text-2xl font-bold">{analytics.activeGoals}</p>
              </div>
              <Zap className="h-8 w-8 text-orange-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analytics.completedTasks}/{analytics.totalTasks} tasks done
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Task Time</p>
                <p className="text-2xl font-bold">{analytics.avgTaskTime}m</p>
              </div>
              <Clock className="h-8 w-8 text-blue-500" />
            </div>
            <div className="flex items-center mt-1">
              {getTrendIcon(analytics.productivityTrend)}
              <span className={`text-xs ml-1 ${getTrendColor(analytics.productivityTrend)}`}>
                {analytics.productivityTrend > 0 ? '+' : ''}{analytics.productivityTrend} vs last week
              </span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Current Streak</p>
                <p className="text-2xl font-bold">{analytics.streakDays}</p>
              </div>
              <Calendar className="h-8 w-8 text-green-500" />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              days of consistent progress
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* Productivity Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>7-Day Productivity Trend</CardTitle>
          <CardDescription>
            Track your daily task completion and focus time
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={productivityData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip 
                  formatter={(value, name) => [
                    value, 
                    name === 'tasks' ? 'Tasks Completed' : 'Focus Hours'
                  ]}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Line 
                  type="monotone" 
                  dataKey="tasks" 
                  stroke="#8b5cf6" 
                  strokeWidth={2}
                  dot={{ fill: '#8b5cf6' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="focusHours" 
                  stroke="#06b6d4" 
                  strokeWidth={2}
                  dot={{ fill: '#06b6d4' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Weekly Performance */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Performance Breakdown</CardTitle>
          <CardDescription>
            Efficiency scores across the week
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productivityData}>
                <XAxis dataKey="date" />
                <YAxis domain={[60, 100]} />
                <Tooltip 
                  formatter={(value) => [`${value}%`, 'Efficiency']}
                  labelFormatter={(label) => `Date: ${label}`}
                />
                <Bar 
                  dataKey="efficiency" 
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">This Week</p>
              <p className="text-lg font-semibold">
                {productivityData.slice(-7).reduce((sum, day) => sum + day.efficiency, 0) / 7}% avg
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Best Day</p>
              <p className="text-lg font-semibold">
                {Math.max(...productivityData.map(d => d.efficiency))}% efficiency
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
