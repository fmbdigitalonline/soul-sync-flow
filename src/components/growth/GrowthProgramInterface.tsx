
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Lock, Play, ArrowRight } from 'lucide-react';
import { GrowthProgram, ProgramWeek, LifeDomain } from '@/types/growth-program';
import { growthProgramService } from '@/services/growth-program-service';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { GrowthProgramStarter } from './GrowthProgramStarter';
import { useToast } from '@/hooks/use-toast';

interface GrowthProgramInterfaceProps {
  onWeekSelect: (week: ProgramWeek) => void;
}

export const GrowthProgramInterface: React.FC<GrowthProgramInterfaceProps> = ({
  onWeekSelect
}) => {
  const [currentProgram, setCurrentProgram] = useState<GrowthProgram | null>(null);
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { blueprintData } = useBlueprintCache();
  const { toast } = useToast();

  useEffect(() => {
    loadCurrentProgram();
  }, [user]);

  const loadCurrentProgram = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const program = await growthProgramService.getCurrentProgram(user.id);
      
      if (program) {
        setCurrentProgram(program);
        const weeks = await growthProgramService.generateWeeklyProgram(program);
        setProgramWeeks(weeks);
      }
    } catch (error) {
      console.error('Error loading program:', error);
      toast({
        title: "Error Loading Program",
        description: "There was an issue loading your growth program. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgram = async (domain: LifeDomain) => {
    if (!user || !blueprintData) {
      toast({
        title: "Blueprint Required",
        description: "Please complete your blueprint first to create a personalized growth program.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setCreating(true);
      console.log('Creating growth program for domain:', domain);
      
      const program = await growthProgramService.createProgram(user.id, domain, blueprintData);
      setCurrentProgram(program);
      
      // Generate week structure
      const weeks = await growthProgramService.generateWeeklyProgram(program);
      setProgramWeeks(weeks);
      
      // Start program
      await growthProgramService.updateProgramProgress(program.id, { status: 'active' });
      
      toast({
        title: "Growth Program Created!",
        description: `Your personalized ${domain.replace('_', ' ')} growth program is ready to begin.`,
      });
      
    } catch (error) {
      console.error('Error creating program:', error);
      toast({
        title: "Error Creating Program",
        description: "There was an issue creating your growth program. Please try again.",
        variant: "destructive"
      });
    } finally {
      setCreating(false);
    }
  };

  const getProgramTypeInfo = (programType: string) => {
    const info = {
      sprint: { label: 'Sprint Program', duration: '3 weeks', intensity: 'High' },
      standard: { label: 'Standard Program', duration: '6 weeks', intensity: 'Medium' },
      deep_dive: { label: 'Deep Dive Program', duration: '8 weeks', intensity: 'Deep' },
      light_touch: { label: 'Light Touch Program', duration: '4 weeks', intensity: 'Light' }
    };
    return info[programType] || info.standard;
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <Clock className="h-6 w-6 animate-spin mr-2" />
            Loading Growth Program...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentProgram) {
    return <GrowthProgramStarter onDomainSelect={handleCreateProgram} loading={creating} />;
  }

  const programInfo = getProgramTypeInfo(currentProgram.program_type);
  const progressPercentage = (currentProgram.current_week / currentProgram.total_weeks) * 100;

  return (
    <div className="space-y-6">
      {/* Program Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{programInfo.label}</CardTitle>
              <p className="text-muted-foreground capitalize">
                {currentProgram.domain.replace('_', ' ')} • Week {currentProgram.current_week} of {currentProgram.total_weeks}
              </p>
            </div>
            <Badge variant="outline" className="capitalize">
              {currentProgram.status}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span>Progress</span>
                <span>{Math.round(progressPercentage)}%</span>
              </div>
              <Progress value={progressPercentage} className="h-2 bg-gray-200" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Sessions</span>
                <p className="font-semibold">{currentProgram.progress_metrics.completed_sessions}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Insights</span>
                <p className="font-semibold">{currentProgram.progress_metrics.insight_entries}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Actions</span>
                <p className="font-semibold">{currentProgram.progress_metrics.micro_actions_completed}</p>
              </div>
              <div>
                <span className="text-muted-foreground">Progress</span>
                <p className="font-semibold">{currentProgram.progress_metrics.domain_progress_score}%</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Program */}
      <Card>
        <CardHeader>
          <CardTitle>Your Weekly Journey</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {programWeeks.map((week) => (
              <div
                key={week.week_number}
                className={`p-4 rounded-lg border transition-all ${
                  week.is_completed 
                    ? 'bg-green-50 border-green-200' 
                    : week.is_unlocked 
                      ? 'bg-blue-50 border-blue-200 cursor-pointer hover:shadow-md' 
                      : 'bg-gray-50 border-gray-200 opacity-60'
                }`}
                onClick={() => week.is_unlocked && onWeekSelect(week)}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    {week.is_completed ? (
                      <CheckCircle className="h-5 w-5 text-green-600" />
                    ) : week.is_unlocked ? (
                      <Play className="h-5 w-5 text-blue-600" />
                    ) : (
                      <Lock className="h-5 w-5 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold capitalize">
                        Week {week.week_number}: {week.theme.replace('_', ' ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">{week.focus_area}</p>
                    </div>
                  </div>
                  {week.is_unlocked && !week.is_completed && (
                    <ArrowRight className="h-4 w-4 text-blue-600" />
                  )}
                </div>
                
                <div className="ml-8">
                  <div className="flex flex-wrap gap-2 mb-2">
                    {week.tools_unlocked.slice(0, 3).map((tool) => (
                      <Badge key={tool} variant="secondary" className="text-xs">
                        {tool}
                      </Badge>
                    ))}
                    {week.tools_unlocked.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{week.tools_unlocked.length - 3} more
                      </Badge>
                    )}
                  </div>
                  
                  <div className="text-sm">
                    <p className="text-muted-foreground mb-1">Key Activities:</p>
                    <ul className="list-disc list-inside space-y-1">
                      {week.key_activities.slice(0, 2).map((activity, idx) => (
                        <li key={idx} className="text-sm">{activity}</li>
                      ))}
                      {week.key_activities.length > 2 && (
                        <li className="text-sm text-muted-foreground">
                          +{week.key_activities.length - 2} more activities
                        </li>
                      )}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
