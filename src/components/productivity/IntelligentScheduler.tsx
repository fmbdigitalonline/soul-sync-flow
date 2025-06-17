
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Zap, Brain, CheckCircle2 } from "lucide-react";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { format, addHours, startOfDay, isAfter, isBefore } from "date-fns";

interface ScheduleSuggestion {
  taskId: string;
  taskTitle: string;
  suggestedTime: Date;
  reason: string;
  energyMatch: 'high' | 'medium' | 'low';
  estimatedDuration: string;
  category: string;
}

export const IntelligentScheduler: React.FC = () => {
  const { productivityJourney, updateProductivityJourney } = useJourneyTracking();
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<ScheduleSuggestion[]>([]);
  
  // Extract user's energy patterns (mock for now, would come from analytics)
  const getUserEnergyPatterns = () => ({
    peakHours: [9, 10, 11], // 9-11 AM
    lowHours: [13, 14], // 1-2 PM
    focusHours: [15, 16, 17], // 3-5 PM
    timeZone: 'local'
  });
  
  const generateScheduleSuggestions = () => {
    if (!productivityJourney?.current_goals) return [];
    
    const goals = productivityJourney.current_goals as any[];
    const energyPatterns = getUserEnergyPatterns();
    const tomorrow = addHours(startOfDay(new Date()), 24);
    const suggestions: ScheduleSuggestion[] = [];
    
    // Get pending tasks
    const pendingTasks = goals.flatMap(goal => 
      goal.tasks?.filter((task: any) => 
        task.status !== 'completed' && !task.completed
      ).map((task: any) => ({ ...task, goalId: goal.id })) || []
    );
    
    // Sort by priority and energy requirements
    const sortedTasks = pendingTasks.sort((a, b) => {
      const aPriority = a.category === 'execution' ? 3 : a.category === 'planning' ? 2 : 1;
      const bPriority = b.category === 'execution' ? 3 : b.category === 'planning' ? 2 : 1;
      return bPriority - aPriority;
    });
    
    // Generate time slots for tomorrow
    let currentHour = 9; // Start at 9 AM
    
    sortedTasks.slice(0, 6).forEach(task => {
      const energyRequired = task.energy_level_required || 'medium';
      let suggestedHour = currentHour;
      let reason = 'Optimal productivity slot';
      let energyMatch: 'high' | 'medium' | 'low' = 'medium';
      
      // Match task energy to user's energy patterns
      if (energyRequired === 'high') {
        if (energyPatterns.peakHours.includes(currentHour)) {
          energyMatch = 'high';
          reason = 'Peak energy period - perfect for demanding tasks';
        } else {
          // Find next peak hour
          const nextPeak = energyPatterns.peakHours.find(h => h > currentHour);
          if (nextPeak) {
            suggestedHour = nextPeak;
            energyMatch = 'high';
            reason = 'Moved to peak energy period';
          }
        }
      } else if (energyRequired === 'low') {
        if (energyPatterns.lowHours.includes(currentHour)) {
          energyMatch = 'high';
          reason = 'Low-energy period - ideal for lighter tasks';
        }
      }
      
      const suggestedTime = addHours(tomorrow, suggestedHour);
      
      suggestions.push({
        taskId: task.id,
        taskTitle: task.title,
        suggestedTime,
        reason,
        energyMatch,
        estimatedDuration: task.estimated_duration || '30 min',
        category: task.category || 'execution'
      });
      
      // Move to next time slot
      const duration = parseInt(task.estimated_duration) || 30;
      currentHour += Math.ceil(duration / 60);
      if (currentHour > 17) currentHour = 9; // Wrap around
    });
    
    return suggestions;
  };
  
  const handleGenerateSuggestions = async () => {
    setIsGenerating(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newSuggestions = generateScheduleSuggestions();
    setSuggestions(newSuggestions);
    setIsGenerating(false);
  };
  
  const handleAcceptSuggestion = async (suggestion: ScheduleSuggestion) => {
    // In a real implementation, this would update the task's scheduled time
    console.log('Accepting suggestion:', suggestion);
    
    // Update the suggestion list to show it's been accepted
    setSuggestions(prev => prev.filter(s => s.taskId !== suggestion.taskId));
  };
  
  const getEnergyIcon = (match: 'high' | 'medium' | 'low') => {
    switch (match) {
      case 'high': return <Zap className="h-4 w-4 text-green-500" />;
      case 'medium': return <Zap className="h-4 w-4 text-yellow-500" />;
      case 'low': return <Zap className="h-4 w-4 text-red-500" />;
    }
  };
  
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'execution': return 'bg-blue-100 text-blue-800';
      case 'planning': return 'bg-purple-100 text-purple-800';
      case 'learning': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Intelligent Scheduler
        </CardTitle>
        <CardDescription>
          AI-powered task scheduling based on your energy patterns and priorities
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {suggestions.length === 0 ? (
          <div className="text-center py-6">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground mb-4">
              Generate smart schedule suggestions for tomorrow
            </p>
            <Button 
              onClick={handleGenerateSuggestions} 
              disabled={isGenerating}
              className="bg-soul-purple hover:bg-soul-purple/90"
            >
              {isGenerating ? (
                <>
                  <Brain className="h-4 w-4 mr-2 animate-spin" />
                  Analyzing patterns...
                </>
              ) : (
                <>
                  <Brain className="h-4 w-4 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Tomorrow's Suggestions</h4>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGenerateSuggestions}
                disabled={isGenerating}
              >
                Refresh
              </Button>
            </div>
            
            {suggestions.map(suggestion => (
              <div 
                key={suggestion.taskId} 
                className="border rounded-lg p-4 space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h5 className="font-medium">{suggestion.taskTitle}</h5>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {format(suggestion.suggestedTime, 'h:mm a')} • {suggestion.estimatedDuration}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getEnergyIcon(suggestion.energyMatch)}
                    <Badge className={getCategoryColor(suggestion.category)}>
                      {suggestion.category}
                    </Badge>
                  </div>
                </div>
                
                <p className="text-sm text-muted-foreground">
                  {suggestion.reason}
                </p>
                
                <div className="flex gap-2">
                  <Button 
                    size="sm" 
                    onClick={() => handleAcceptSuggestion(suggestion)}
                    className="bg-soul-purple hover:bg-soul-purple/90"
                  >
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Schedule
                  </Button>
                  <Button variant="outline" size="sm">
                    Adjust Time
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
