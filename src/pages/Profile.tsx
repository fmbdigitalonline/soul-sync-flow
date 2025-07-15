
import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { Settings, LogOut, ArrowUpRight, Bell, Moon, Sun, Check } from "lucide-react";
import { FocusToggle } from "@/components/ui/focus-toggle";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useBlueprintData } from "@/hooks/use-blueprint-data";
import { calculateWeeklyInsights, WeeklyInsights } from "@/services/insights-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";

const Profile = () => {
  const { toast } = useToast();
  const { t } = useLanguage();
  const [darkMode, setDarkMode] = useState(false);
  const [weeklyInsights, setWeeklyInsights] = useState<WeeklyInsights | null>(null);
  
  const { 
    profile, 
    statistics, 
    goals, 
    loading: profileLoading, 
    error: profileError,
    logActivity,
    updateGoalProgress 
  } = useUserProfile();
  
  const { 
    blueprintData, 
    loading: blueprintLoading,
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage 
  } = useBlueprintData();

  useEffect(() => {
    const fetchInsights = async () => {
      const insights = await calculateWeeklyInsights();
      setWeeklyInsights(insights);
    };
    
    fetchInsights();
  }, []);

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: t('nav.signOut'),
        description: t('profile.logoutSuccess'),
      });
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: t('error'),
        description: t('profile.logoutError'),
        variant: "destructive"
      });
    }
  };

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
    
    toast({
      title: checked ? t('profile.darkModeEnabled') : t('profile.lightModeEnabled'),
      description: checked 
        ? t('profile.darkModeDescription')
        : t('profile.lightModeDescription'),
      duration: 2000,
    });
  };

  const handleTaskComplete = async () => {
    await logActivity('task_completed', { source: 'profile_page' }, 10);
    
    toast({
      title: t('profile.taskCompleted'),
      description: t('profile.taskCompletedDescription'),
      icon: <Check className="h-4 w-4 text-green-500" />,
      duration: 2000,
    });
  };

  const loading = profileLoading || blueprintLoading;

  if (loading) {
    return (
      <MainLayout>
        <div className="p-6 max-w-md mx-auto">
          <div className="flex flex-col items-center text-center mb-6">
            <div className="h-20 w-20 mb-4 bg-gray-200 rounded-full animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
            <div className="h-4 w-48 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (profileError) {
    return (
      <MainLayout>
        <div className="p-6 max-w-md mx-auto">
          <CosmicCard className="p-6 text-center">
            <p className="text-destructive">{t('profile.errorLoading')}: {profileError}</p>
          </CosmicCard>
        </div>
      </MainLayout>
    );
  }

  const displayName = profile?.display_name || getDisplayName();
  const personalityTraits = getPersonalityTraits();
  const blueprintCompletion = getBlueprintCompletionPercentage();
  const activeGoals = goals.filter(g => g.status === 'active');

  return (
    <MainLayout>
      <div className="p-6 max-w-md mx-auto">
        <div className="flex flex-col items-center text-center mb-6">
          <Avatar className="h-20 w-20 mb-4 shadow-soft-ui">
            <AvatarImage src={profile?.avatar_url || undefined} alt={displayName} />
            <AvatarFallback>{displayName.charAt(0).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h1 className="text-2xl font-bold font-heading mb-1">{displayName}</h1>
          <div className="flex items-center space-x-2 mt-1">
            {personalityTraits.map((trait, index) => (
              <Badge key={index} variant="outline" className="bg-soul-teal bg-opacity-20">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-6 rounded-comfort">
            <TabsTrigger value="stats" className="text-base">{t('profile.stats')}</TabsTrigger>
            <TabsTrigger value="goals" className="text-base">{t('profile.goals')}</TabsTrigger>
            <TabsTrigger value="settings" className="text-base">{t('profile.settings')}</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stats" className="space-y-grid-16">
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">{t('profile.growthJourney')}</h2>
              
              <div className="space-y-grid-16">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">{t('profile.blueprintCompletion')}</span>
                    <span className="text-base font-medium">{blueprintCompletion}%</span>
                  </div>
                  <Progress value={blueprintCompletion} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">{t('profile.activeGoals')}</span>
                    <span className="text-base font-medium">{activeGoals.length}/{goals.length}</span>
                  </div>
                  <Progress value={goals.length > 0 ? (activeGoals.length / goals.length) * 100 : 0} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">{t('profile.tasksCompleted')}</span>
                    <span className="text-base font-medium">{statistics?.tasks_completed || 0}</span>
                  </div>
                  <Progress value={Math.min((statistics?.tasks_completed || 0) * 4, 100)} className="h-2" />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-base">{t('profile.coachConversations')}</span>
                    <span className="text-base font-medium">{statistics?.coach_conversations || 0}</span>
                  </div>
                  <Progress value={Math.min((statistics?.coach_conversations || 0) * 8, 100)} className="h-2" />
                </div>
              </div>
            </CosmicCard>
            
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">{t('profile.weeklyInsights')}</h2>
              
              <div className="space-y-grid-8">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">{t('profile.mostProductiveDay')}</p>
                    <p className="text-sm text-muted-foreground">{weeklyInsights?.mostProductiveDay || t('profile.wednesday')}</p>
                  </div>
                  <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
                    {weeklyInsights?.improvementTrend || '+0%'}
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">{t('profile.energyPeaks')}</p>
                    <p className="text-sm text-muted-foreground">{weeklyInsights?.energyPeaks || t('profile.morningPeaks')}</p>
                  </div>
                  <Badge className="bg-soul-teal bg-opacity-20 text-teal-800 hover:bg-soul-teal hover:bg-opacity-20">{t('profile.aligned')}</Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium">{t('profile.focusSessions')}</p>
                    <p className="text-sm text-muted-foreground">{weeklyInsights?.focusSessionsThisWeek || 0} {t('profile.thisWeek')}</p>
                  </div>
                  <Badge className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                    +{statistics?.focus_sessions_completed || 0}
                  </Badge>
                </div>
              </div>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="goals" className="space-y-grid-16">
            {goals.length > 0 ? (
              goals.map((goal) => (
                <GoalCard 
                  key={goal.id}
                  goal={goal}
                  onComplete={handleTaskComplete}
                  onProgressUpdate={(progress) => updateGoalProgress(goal.id, progress)}
                />
              ))
            ) : (
              <CosmicCard className="p-6 text-center rounded-comfort">
                <p className="text-muted-foreground mb-4">{t('profile.noGoals')}</p>
                <p className="text-sm text-muted-foreground">{t('profile.createFirstGoal')}</p>
              </CosmicCard>
            )}
            
            <CosmicCard className="text-center p-4 rounded-comfort">
              <Button
                variant="ghost"
                className="text-soul-teal w-full flex items-center justify-center interactive-element"
              >
                <ArrowUpRight className="mr-2 h-4 w-4" />
                {t('profile.viewAllGoals')}
              </Button>
            </CosmicCard>
          </TabsContent>
          
          <TabsContent value="settings" className="space-y-grid-16">
            <CosmicCard className="p-6 rounded-comfort">
              <h2 className="font-heading font-medium mb-4">{t('profile.appSettings')}</h2>
              
              <div className="space-y-grid-16">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    <Label htmlFor="notifications" className="text-base">{t('profile.notifications')}</Label>
                  </div>
                  <Switch id="notifications" defaultChecked />
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {darkMode ? 
                      <Moon className="h-5 w-5 text-muted-foreground" /> : 
                      <Sun className="h-5 w-5 text-muted-foreground" />
                    }
                    <Label htmlFor="dark-mode" className="text-base">{t('profile.darkMode')}</Label>
                  </div>
                  <Switch 
                    id="dark-mode" 
                    checked={darkMode} 
                    onCheckedChange={toggleDarkMode} 
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <FocusToggle />
                </div>
                
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex items-center justify-between cursor-pointer interactive-element hover:bg-muted p-2 rounded-md">
                        <div className="flex items-center space-x-3">
                          <Settings className="h-5 w-5 text-muted-foreground" />
                          <span className="text-base">{t('profile.accountSettings')}</span>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{t('profile.accountSettingsTooltip')}</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </CosmicCard>
            
            <CosmicCard className="text-center p-4 rounded-comfort">
              <Button
                variant="ghost"
                className="text-destructive w-full flex items-center justify-center interactive-element"
                onClick={handleLogout}
              >
                <LogOut className="mr-2 h-4 w-4" />
                {t('nav.signOut')}
              </Button>
            </CosmicCard>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

interface GoalCardProps {
  goal: any;
  onComplete?: () => void;
  onProgressUpdate?: (progress: number) => void;
}

const GoalCard = ({ goal, onComplete, onProgressUpdate }: GoalCardProps) => {
  const { t } = useLanguage();
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return "bg-green-100 text-green-800";
      case 'paused':
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-green-100 text-green-800";
    }
  };

  const handleComplete = () => {
    if (onProgressUpdate) {
      onProgressUpdate(100);
    }
    if (onComplete) {
      onComplete();
    }
  };

  return (
    <CosmicCard className="p-6 rounded-comfort">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium font-heading">{goal.title}</h3>
        <Badge className={getStatusColor(goal.status)}>
          {goal.status === 'active' ? t('profile.onTrack') : t(`profile.status.${goal.status}`)}
        </Badge>
      </div>
      
      <div className="space-y-2 mb-3">
        <div className="flex justify-between text-sm">
          <span>{t('profile.progress')}</span>
          <span>{goal.progress}%</span>
        </div>
        <Progress value={goal.progress} className="h-2" />
      </div>
      
      <div className="flex justify-between items-center">
        <div className="flex flex-wrap gap-1">
          {goal.aligned_traits.map((trait: string, index: number) => (
            <Badge key={index} variant="outline" className="bg-secondary text-xs">
              {trait}
            </Badge>
          ))}
        </div>
        
        {goal.progress < 100 && (
          <Button 
            size="sm" 
            variant="outline"
            className="ml-2 interactive-element"
            onClick={handleComplete}
          >
            <Check className="h-4 w-4 mr-1" /> {t('profile.complete')}
          </Button>
        )}
      </div>
    </CosmicCard>
  );
};

export default Profile;
