import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, Clock, Lock, Play, ArrowRight, Plus, RotateCcw, MessageSquare, Sparkles } from 'lucide-react';
import { GrowthProgram, ProgramWeek, LifeDomain } from '@/types/growth-program';
import { agentGrowthIntegration } from '@/services/agent-growth-integration';
import { useAuth } from '@/contexts/AuthContext';
import { useBlueprintCache } from '@/contexts/BlueprintCacheContext';
import { GrowthProgramStarter } from './GrowthProgramStarter';
import { WeekDetailView } from './WeekDetailView';
import { EnhancedProgramDisplay } from './EnhancedProgramDisplay';
import { useToast } from '@/hooks/use-toast';
import { useProgramAwareCoach } from '@/hooks/use-program-aware-coach';
import { GuideInterface } from '@/components/coach/GuideInterface';
import { supabase } from '@/integrations/supabase/client';

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
  const [creatingDomain, setCreatingDomain] = useState<LifeDomain | null>(null);
  const [apiStatus, setApiStatus] = useState<'checking' | 'ready' | 'error'>('checking');
  const [aiGeneratedContent, setAiGeneratedContent] = useState<any>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const { user } = useAuth();
  const { blueprintData } = useBlueprintCache();
  const { toast } = useToast();
  
  // Program-aware coach for intelligent guidance
  const { messages, isLoading: coachLoading, sendMessage, resetConversation, initializeConversation } = useProgramAwareCoach();

  // Check OpenAI API status on mount
  useEffect(() => {
    const checkAPIStatus = async () => {
      try {
        console.log('🔍 Checking OpenAI API status...');
        const { data, error } = await supabase.functions.invoke('openai-embeddings', {
          body: { query: 'test connection' }
        });
        
        if (error) {
          console.error('❌ API Status Check Failed:', error);
          setApiStatus('error');
        } else {
          console.log('✅ OpenAI API is working correctly');
          setApiStatus('ready');
        }
      } catch (error) {
        console.error('❌ API Status Check Error:', error);
        setApiStatus('error');
      }
    };

    checkAPIStatus();
  }, []);

  useEffect(() => {
    loadCurrentProgram();
  }, [user]);

  // Prevent auto-generation by checking if we're already creating
  useEffect(() => {
    if (creating || creatingDomain) {
      console.log('🚫 Program creation in progress, preventing new attempts');
    }
  }, [creating, creatingDomain]);

  // Initialize conversation appropriately
  useEffect(() => {
    if (user && !loading) {
      initializeConversation();
    }
  }, [user, loading, initializeConversation]);

  const loadCurrentProgram = async () => {
    if (!user) return;
    
    // Don't reload if we're currently creating a program
    if (creating || creatingDomain) {
      console.log('🚫 Skipping program load during creation');
      return;
    }
    
    try {
      setLoading(true);
      console.log('📊 Loading current program for user:', user.id);
      const program = await agentGrowthIntegration.getCurrentProgram(user.id);
      
      if (program) {
        setCurrentProgram(program);
        const weeks = await agentGrowthIntegration.generateWeeklyProgram(program);
        setProgramWeeks(weeks);
        
        // Extract AI-generated content for enhanced display
        await loadAIGeneratedContent(program);
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

    // Prevent multiple simultaneous calls for the same domain
    if (creating || creatingDomain === domain) {
      console.log('🚫 Program creation already in progress for domain:', domain);
      return;
    }
    
    try {
      setCreating(true);
      setCreatingDomain(domain);
      console.log('🚀 Creating growth program for domain:', domain);
      
      if (currentProgram) {
        await agentGrowthIntegration.updateProgramProgress(currentProgram.id, {
          status: 'completed',
          actual_completion: new Date().toISOString()
        });
      }
      
      const program = await agentGrowthIntegration.createProgram(user.id, domain, blueprintData);
      setCurrentProgram(program);
      
      const weeks = await agentGrowthIntegration.generateWeeklyProgram(program);
      setProgramWeeks(weeks);
      
      // Load AI-generated content for the new program
      await loadAIGeneratedContent(program);
      
      await agentGrowthIntegration.updateProgramProgress(program.id, { status: 'active' });
      
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
      setCreatingDomain(null);
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
      await agentGrowthIntegration.updateProgramProgress(currentProgram.id, {
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
      sprint: { label: 'AI Sprint Program', duration: '3 weeks', intensity: 'High' },
      standard: { label: 'AI Growth Program', duration: '6 weeks', intensity: 'Medium' },
      deep_dive: { label: 'AI Deep Dive Program', duration: '8 weeks', intensity: 'Deep' },
      light_touch: { label: 'AI Light Touch Program', duration: '4 weeks', intensity: 'Light' }
    };
    return info[programType] || { label: 'AI Agentic Program', duration: 'Dynamic', intensity: 'Adaptive' };
  };

  const loadAIGeneratedContent = async (program: GrowthProgram) => {
    try {
      console.log('📊 Loading AI-generated content for program:', program.id);
      
      // Use adaptation_history from the existing growth_programs table
      const { data, error } = await supabase
        .from('growth_programs')
        .select('adaptation_history')
        .eq('id', program.id)
        .maybeSingle();
      
      if (error) {
        console.error('❌ Error loading AI-generated content:', error);
        return;
      }
      
      if (data && data.adaptation_history && Array.isArray(data.adaptation_history)) {
        // Find evolution trajectory in adaptation history
        const evolutionRecord = data.adaptation_history.find((record: any) => {
          if (typeof record === 'object' && record !== null) {
            const changes = record.changes_made;
            return changes && (changes.evolution_trajectory || changes.week_plan);
          }
          return false;
        });
        
        if (evolutionRecord && typeof evolutionRecord === 'object' && !Array.isArray(evolutionRecord)) {
          console.log('✅ Found AI-generated content in adaptation history');
          const recordObj = evolutionRecord as { changes_made?: any };
          setAiGeneratedContent(recordObj.changes_made || evolutionRecord);
          setShowEnhancedView(true);
        } else {
          setShowEnhancedView(false);
        }
      } else {
        console.log('⚠️ No AI-generated content found, using standard view');
        setShowEnhancedView(false);
      }
    } catch (error) {
      console.error('❌ Error loading AI-generated content:', error);
      setShowEnhancedView(false);
    }
  };

  const parsePlanBranches = (content: any) => {
    if (!content || typeof content !== 'object') return [];
    
    const branches = [];
    const weekPlan = content.week_plan || '';
    
    // Extract Plan Branches from the AI content
    const branchPatterns = [
      /Plan Branch 1[:\s]*([^*\n]+)[\s\S]*?Strategy[:\s]*([^*\n]+)[\s\S]*?Action Steps[:\s]*([\s\S]*?)(?=\*\*Advantages|Advantages|Plan Branch 2|$)/gi,
      /Plan Branch 2[:\s]*([^*\n]+)[\s\S]*?Strategy[:\s]*([^*\n]+)[\s\S]*?Action Steps[:\s]*([\s\S]*?)(?=\*\*Advantages|Advantages|Plan Branch 3|$)/gi,
      /Plan Branch 3[:\s]*([^*\n]+)[\s\S]*?Strategy[:\s]*([^*\n]+)[\s\S]*?Action Steps[:\s]*([\s\S]*?)(?=\*\*Advantages|Advantages|$)/gi
    ];
    
    branchPatterns.forEach((pattern, index) => {
      const match = pattern.exec(weekPlan);
      if (match) {
        const [, title, strategy, actionStepsText] = match;
        
        // Extract action steps
        const actionSteps = extractListItems(actionStepsText);
        
        branches.push({
          title: title?.trim() || `Growth Plan Branch ${index + 1}`,
          strategy: strategy?.trim() || 'Strategic approach to growth',
          objectives: [`Build on recent progress`, `Honor natural rhythms`],
          actionSteps: actionSteps.length > 0 ? actionSteps : ['Engage in growth activities'],
          advantages: ['Personalized approach', 'Blueprint-aligned', 'Sustainable pace'],
          challenges: ['Requires commitment', 'Needs consistent effort'],
          isRecommended: index === 2 // Plan Branch 3 is usually recommended
        });
      }
    });
    
    // NO FALLBACK - Only use AI-generated content from agentic orchestrator
    // If no branches found, the system should use the raw agentic content
    if (branches.length === 0) {
      console.log('⚠️ No plan branches found in AI content - will show raw agentic content instead');
    }
    
    return branches;
  };

  const extractListItems = (text: string): string[] => {
    const items: string[] = [];
    
    // Try bullet points first
    const bulletMatches = text.match(/[-*]\s*\*\*([^*]+)\*\*[:\s]*([^*\n]+)/g);
    if (bulletMatches) {
      bulletMatches.forEach(match => {
        const cleaned = match.replace(/[-*]\s*\*\*([^*]+)\*\*[:\s]*/, '').trim();
        if (cleaned) items.push(cleaned);
      });
    }
    
    // Try numbered lists
    if (items.length === 0) {
      const numberedMatches = text.match(/\d+\.\s*([^\n]+)/g);
      if (numberedMatches) {
        numberedMatches.forEach(match => {
          const cleaned = match.replace(/\d+\.\s*/, '').trim();
          if (cleaned) items.push(cleaned);
        });
      }
    }
    
    return items.filter(item => item.length > 5).slice(0, 4);
  };

  const handleSelectPlanBranch = (branch: any) => {
    console.log('🎯 User selected plan branch:', branch.title);
    sendMessage(`I've chosen the "${branch.title}" approach. This feels right for me because of its ${branch.strategy.toLowerCase()}. How should I get started with this plan?`);
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
          <GrowthProgramStarter onDomainSelect={handleCreateProgram} loading={creating} creatingDomain={creatingDomain} />
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
          <GrowthProgramStarter onDomainSelect={handleCreateProgram} loading={creating} creatingDomain={creatingDomain} />
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

          {/* Enhanced Program Content or Weekly Journey */}
          {showEnhancedView && aiGeneratedContent ? (
            <EnhancedProgramDisplay
              program={currentProgram}
              planBranches={parsePlanBranches(aiGeneratedContent)}
              onSelectBranch={handleSelectPlanBranch}
            />
          ) : (
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
          )}
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
