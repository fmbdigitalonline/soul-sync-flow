import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Lock, Play, ArrowRight, Plus, RotateCcw, MessageSquare, Sparkles } from 'lucide-react';
import { GrowthProgram, ProgramWeek, LifeDomain } from '@/types/growth-program';
import { growthProgramService } from '@/services/growth-program-service';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { GrowthProgramStarter } from './GrowthProgramStarter';
import { WeekDetailView } from './WeekDetailView';
import { useToast } from '@/hooks/use-toast';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { GuideInterface } from '@/components/coach/GuideInterface';

interface GrowthProgramInterfaceProps {
  onWeekSelect?: (week: ProgramWeek) => void;
}

export const GrowthProgramInterface: React.FC<GrowthProgramInterfaceProps> = ({
  onWeekSelect
}) => {
  const [currentProgram, setCurrentProgram] = useState<GrowthProgram | null>(null);
  const [programWeeks, setProgramWeeks] = useState<ProgramWeek[]>([]);
  const [selectedWeek, setSelectedWeek] = useState<ProgramWeek | null>(null);
  const [showDomainSelector, setShowDomainSelector] = useState(false);
  const [showGuide, setShowGuide] = useState(true); // Start with guide visible
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const { user } = useAuth();
  const { blueprintData } = useBlueprintCache();
  const { toast } = useToast();
  
  // Program-aware coach for intelligent guidance
  const { messages, isLoading: coachLoading, sendMessage, resetConversation, initializeConversation } = useProgramAwareCoach();

  useEffect(() => {
    loadCurrentProgram();
  }, [user]);

  // Initialize conversation appropriately
  useEffect(() => {
    if (user && !loading) {
      initializeConversation();
    }
  }, [user, loading, initializeConversation]);

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
      
      if (currentProgram) {
        await growthProgramService.updateProgramProgress(currentProgram.id, { 
          status: 'completed',
          actual_completion: new Date().toISOString()
        });
      }
      
      const program = await growthProgramService.createProgram(user.id, domain, blueprintData);
      setCurrentProgram(program);
      
      const weeks = await growthProgramService.generateWeeklyProgram(program);
      setProgramWeeks(weeks);
      
      await growthProgramService.updateProgramProgress(program.id, { status: 'active' });
      
      setShowDomainSelector(false);
      
      // Send gentle celebration message to guide
      sendMessage(`I just created my ${domain.replace('_', ' ')} growth program. I'm feeling a mix of excitement and maybe some uncertainty. How should I approach this journey?`);
      
      toast({
        title: "New Growth Program Created!",
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

  const handleStartNewProgram = () => {
    setShowDomainSelector(true);
    sendMessage("I'm thinking about starting a new growth program in a different area of my life. Can you help me think through what might be calling to me right now?");
  };

  const handleCancelNewProgram = () => {
    setShowDomainSelector(false);
  };

  const handleWeekSelect = (week: ProgramWeek) => {
    if (!week.is_unlocked) {
      sendMessage(`I'm interested in Week ${week.week_number}: ${week.theme.replace('_', ' ')}, but it's still locked. What do I need to complete to unlock this week?`);
      return;
    }
    
    if (onWeekSelect) {
      onWeekSelect(week);
    } else {
      setSelectedWeek(week);
    }
  };

  const handleMarkWeekComplete = async (weekNumber: number) => {
    if (!currentProgram) return;
    
    try {
      const nextWeek = Math.min(weekNumber + 1, currentProgram.total_weeks);
      await growthProgramService.updateProgramProgress(currentProgram.id, {
        current_week: nextWeek
      });
      
      await loadCurrentProgram();
      setSelectedWeek(null);
      
      // Send completion celebration to guide
      sendMessage(`I just completed Week ${weekNumber}! I'm feeling accomplished. What should I focus on for Week ${nextWeek}? Help me prepare mentally and practically for the next phase.`);
      
      toast({
        title: "Week Completed!",
        description: `Great job completing Week ${weekNumber}! Week ${nextWeek} is now unlocked.`,
      });
    } catch (error) {
      console.error('Error completing week:', error);
      toast({
        title: "Error",
        description: "There was an issue marking the week as complete.",
        variant: "destructive"
      });
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

  if (showDomainSelector) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Domain Selection */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">Start New Growth Program</h3>
              <p className="text-sm text-muted-foreground">
                Choose a different life area to focus on
              </p>
            </div>
            <Button variant="outline" onClick={handleCancelNewProgram}>
              Cancel
            </Button>
          </div>
          <GrowthProgramStarter onDomainSelect={handleCreateProgram} loading={creating} />
        </div>
        
        {/* Intelligent Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-soul-purple" />
              Your Growth Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <GuideInterface
                messages={messages}
                isLoading={coachLoading}
                onSendMessage={sendMessage}
                messagesEndRef={React.createRef()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (selectedWeek) {
    return (
      <WeekDetailView
        week={selectedWeek}
        onBack={() => setSelectedWeek(null)}
        onMarkComplete={handleMarkWeekComplete}
      />
    );
  }

  if (!currentProgram) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Creation Guide */}
        <div className="space-y-4">
          <GrowthProgramStarter onDomainSelect={handleCreateProgram} loading={creating} />
        </div>
        
        {/* Intelligent Guide */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Sparkles className="h-5 w-5 mr-2 text-soul-purple" />
              Your Growth Guide
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <GuideInterface
                messages={messages}
                isLoading={coachLoading}
                onSendMessage={sendMessage}
                messagesEndRef={React.createRef()}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const programInfo = getProgramTypeInfo(currentProgram.program_type);
  const progressPercentage = (currentProgram.current_week / currentProgram.total_weeks) * 100;

  return (
    <div className="space-y-6">
      {/* Toggle for Guide */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">Your Growth Journey</h2>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowGuide(!showGuide)}
          className="flex items-center gap-2"
        >
          <MessageSquare className="h-4 w-4" />
          {showGuide ? 'Hide Guide' : 'Show Guide'}
        </Button>
      </div>

      <div className={`grid gap-6 ${showGuide ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Program Content */}
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
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="capitalize">
                    {currentProgram.status}
                  </Badge>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={handleStartNewProgram}
                    className="text-xs"
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New Program
                  </Button>
                </div>
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

          {/* Weekly Journey */}
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
                    onClick={() => handleWeekSelect(week)}
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

        {/* Intelligent Growth Guide */}
        {showGuide && (
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Sparkles className="h-5 w-5 mr-2 text-soul-purple" />
                Your Growth Guide
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                I'm here to listen, understand, and gently guide you through your journey
              </p>
            </CardHeader>
            <CardContent>
              <div className="h-96">
                <GuideInterface
                  messages={messages}
                  isLoading={coachLoading}
                  onSendMessage={sendMessage}
                  messagesEndRef={React.createRef()}
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
