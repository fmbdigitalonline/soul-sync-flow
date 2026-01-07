import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/sanitize";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageSection } from "@/components/Layout/PageContainer";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import { Button } from "@/components/ui/button";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { useHACSInsights, type HACSInsight } from "@/hooks/use-hacs-insights";
import { isAdminUser } from "@/utils/isAdminUser";
import { supabase } from "@/integrations/supabase/client";
import { workingInstructionsPersistenceService } from "@/services/working-instructions-persistence-service";
import { cn } from "@/lib/utils";
import { Sparkles, Brain, BookOpen, ArrowRight, LogIn, MessageCircle, ListChecks, Moon, Lightbulb, Clock, Flame, Compass, RefreshCw, ChevronRight } from "lucide-react";
type ActivityType = "conversation" | "dream" | "task" | "insight";
interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp?: string;
  actionLabel: string;
  actionPath: string;
  actionState?: {
    resumeTaskId?: string;
    resumeGoalId?: string;
    resumeTaskTitle?: string;
    resumeTaskDescription?: string;
  };
  progress?: number;
}
interface ContinueItem {
  type: ActivityType;
  title: string;
  lastActivity?: string;
  actionPath: string;
  actionState?: {
    resumeTaskId?: string;
    resumeGoalId?: string;
    resumeTaskTitle?: string;
    resumeTaskDescription?: string;
  };
}
const Index = () => {
  const {
    user
  } = useAuth();
  const {
    speak
  } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const {
    blueprintData,
    hasBlueprint,
    loading,
    getDisplayName
  } = useOptimizedBlueprintData();
  const {
    t,
    language
  } = useLanguage();
  const {
    tutorialState,
    startTutorial,
    continueTutorial,
    completeTutorial
  } = useTutorialFlow();
  const {
    loadHistoricalInsights,
    currentInsight,
    insightQueue
  } = useHACSInsights();
  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [continueItem, setContinueItem] = useState<ContinueItem | null>(null);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [guidanceInsight, setGuidanceInsight] = useState<HACSInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [hasLoadedGuidance, setHasLoadedGuidance] = useState(false);
  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    if (hasBlueprint) {
      return t("index.welcomeBackReady");
    } else {
      return t("index.createToGetStarted");
    }
  }, [user, hasBlueprint, t]);
  const subtitleMessages = useMemo(() => {
    if (user && hasBlueprint) {
      return [t("index.subtitle")];
    }
    const messages = t("index.rotatingMessages");
    if (Array.isArray(messages)) {
      return messages;
    }
    return [t("index.subtitle")];
  }, [t, language, user, hasBlueprint]);
  const userName = useMemo(() => {
    return blueprintData?.user_meta?.preferred_name || getDisplayName || user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Friend';
  }, [blueprintData, getDisplayName, user]);
  const currentSubtitle = useMemo(() => {
    return subtitleMessages[0] || t("index.subtitle");
  }, [subtitleMessages, t]);
  useEffect(() => {
    if (user && !loading && welcomeMessage) {
      const timer = setTimeout(() => {
        speak(welcomeMessage);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, welcomeMessage, speak]);
  const handleTutorialStart = () => {
    if (!user) {
      return;
    }
    try {
      startTutorial();
      setShowTutorial(true);
    } catch (error) {
      console.error('🎭 ERROR in handleTutorialStart:', error);
    }
  };
  const formatRelativeTime = useCallback((dateString?: string | null) => {
    if (!dateString) return '';
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return 'just now';
    if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }, []);
  const mapActivityToItem = useCallback((activity: any, fallbackContext?: { taskId: string; goalId: string } | null): ActivityItem => {
    const activityType = String(activity.activity_type || '').toLowerCase();
    const description = activity.activity_data?.summary || activity.activity_data?.message || activity.activity_data?.title || '';
    let type: ActivityType = 'task';
    if (activityType.includes('conversation')) {
      type = 'conversation';
    } else if (activityType.includes('dream') || activityType.includes('milestone')) {
      type = 'dream';
    } else if (activityType.includes('insight') || activityType.includes('blueprint')) {
      type = 'insight';
    }
    const titleByType: Record<ActivityType, string> = {
      conversation: 'Conversation with Companion',
      dream: 'Dream Progress',
      task: 'Task Updated',
      insight: 'Blueprint Insight Added'
    };
    const actionPathByType: Record<ActivityType, string> = {
      conversation: '/companion',
      dream: '/dreams',
      task: '/tasks',
      insight: '/blueprint'
    };
    const actionLabelByType: Record<ActivityType, string> = {
      conversation: 'Open Conversation',
      dream: 'View Dream',
      task: 'Open Task',
      insight: 'View Insight'
    };

    const taskId = activity.activity_data?.task_id
      || activity.activity_data?.taskId
      || activity.activity_data?.task?.id
      || activity.task_id;
    const goalId = activity.activity_data?.goal_id
      || activity.activity_data?.goalId
      || activity.activity_data?.goal?.id
      || activity.goal_id;
    const resolvedTaskId = taskId || fallbackContext?.taskId;
    const resolvedGoalId = goalId || fallbackContext?.goalId;
    const taskActionPath = resolvedTaskId ? '/dreams/journey' : actionPathByType.task;
    const taskActionPath = taskId ? '/dreams/journey' : actionPathByType.task;

    // Extract progress if available
    const progressValue = activity.activity_data?.progress ?? activity.activity_data?.completion_percentage;
    return {
      id: activity.id,
      type,
      title: titleByType[type],
      description: description,
      timestamp: activity.created_at,
      actionLabel: actionLabelByType[type],
      actionPath: type === 'task' ? taskActionPath : actionPathByType[type],
      actionState: type === 'task' && resolvedTaskId ? {
        resumeTaskId: String(resolvedTaskId),
        resumeGoalId: resolvedGoalId ? String(resolvedGoalId) : undefined,
        resumeTaskTitle: activity.activity_data?.title || activity.activity_data?.task?.title,
        resumeTaskDescription: activity.activity_data?.description || activity.activity_data?.task?.description
      actionState: type === 'task' && taskId ? {
        resumeTaskId: String(taskId),
        resumeGoalId: goalId ? String(goalId) : undefined
      } : undefined,
      progress: typeof progressValue === 'number' ? Math.round(progressValue) : undefined
    };
  }, []);
  const deriveContinueItem = useCallback((conversation: any | null, activities: any[], fallbackContext?: { taskId: string; goalId: string } | null): ContinueItem | null => {
    const candidates: ContinueItem[] = [];
    if (conversation) {
      candidates.push({
        type: 'conversation',
        title: `Continue your conversation${conversation.recovery_context?.companionName ? ` with ${conversation.recovery_context.companionName}` : ' with Metgezel'}`,
        lastActivity: conversation.last_activity,
        actionPath: '/companion'
      });
    }
    const dreamActivity = activities.find(act => {
      const actType = String(act.activity_type || '').toLowerCase();
      return actType.includes('dream') || actType.includes('milestone');
    });
    if (dreamActivity) {
      candidates.push({
        type: 'dream',
        title: `Continue Dream Milestone${dreamActivity.activity_data?.title ? `: "${dreamActivity.activity_data.title}"` : ''}`,
        lastActivity: dreamActivity.created_at,
        actionPath: '/dreams'
      });
    }
    const taskActivity = activities.find(act => String(act.activity_type || '').toLowerCase().includes('task'));
    if (taskActivity) {
      const taskId = taskActivity.activity_data?.task_id
        || taskActivity.activity_data?.taskId
        || taskActivity.activity_data?.task?.id
        || taskActivity.task_id;
      const goalId = taskActivity.activity_data?.goal_id
        || taskActivity.activity_data?.goalId
        || taskActivity.activity_data?.goal?.id
        || taskActivity.goal_id;
      const resolvedTaskId = taskId || fallbackContext?.taskId;
      const resolvedGoalId = goalId || fallbackContext?.goalId;
      candidates.push({
        type: 'task',
        title: taskActivity.activity_data?.title ? `Resume "${taskActivity.activity_data.title}"` : 'Continue your task list',
        lastActivity: taskActivity.created_at,
        actionPath: resolvedTaskId ? '/dreams/journey' : '/tasks',
        actionState: resolvedTaskId ? {
          resumeTaskId: String(resolvedTaskId),
          resumeGoalId: resolvedGoalId ? String(resolvedGoalId) : undefined,
          resumeTaskTitle: taskActivity.activity_data?.title || taskActivity.activity_data?.task?.title,
          resumeTaskDescription: taskActivity.activity_data?.description || taskActivity.activity_data?.task?.description
        actionPath: taskId ? '/dreams/journey' : '/tasks',
        actionState: taskId ? {
          resumeTaskId: String(taskId),
          resumeGoalId: goalId ? String(goalId) : undefined
        } : undefined
      });
    }
    if (candidates.length === 0) return null;
    return candidates.sort((a, b) => {
      const aTime = a.lastActivity ? new Date(a.lastActivity).getTime() : 0;
      const bTime = b.lastActivity ? new Date(b.lastActivity).getTime() : 0;
      return bTime - aTime;
    })[0];
  }, []);
  const fetchActivityData = useCallback(async () => {
    if (!user) return;
    setActivityLoading(true);
    try {
      const fallbackContext = await workingInstructionsPersistenceService.getMostRecentInstructionContext().catch(error => {
        console.error('Error loading instruction fallback context', error);
        return null;
      });
      const {
        data: activitiesData
      } = await supabase.from('user_activities').select('id, activity_type, activity_data, created_at').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(8);
      const mappedActivities = (activitiesData || []).map(activity => mapActivityToItem(activity, fallbackContext));
      setRecentActivities(mappedActivities);
      setLastSynced(activitiesData?.[0]?.created_at || null);
      const {
        data: conversationData
      } = await supabase.from('conversation_memory').select('session_id, last_activity, recovery_context').eq('user_id', user.id).eq('conversation_stage', 'active').order('last_activity', {
        ascending: false
      }).limit(1);
      const conversation = conversationData?.[0] || null;
      const continueCandidate = deriveContinueItem(conversation, activitiesData || [], fallbackContext);
      setContinueItem(continueCandidate);
    } catch (error) {
      console.error('Error loading activity data', error);
    } finally {
      setActivityLoading(false);
    }
  }, [deriveContinueItem, mapActivityToItem, user]);
  useEffect(() => {
    if (!user) {
      setRecentActivities([]);
      setContinueItem(null);
      return;
    }
    fetchActivityData();
  }, [fetchActivityData, user]);
  useEffect(() => {
    if (!user) {
      setGuidanceInsight(null);
      setHasLoadedGuidance(false);
      return;
    }
    let isActive = true;
    const syncGuidance = async () => {
      if (!hasLoadedGuidance) {
        setInsightsLoading(true);
        try {
          const historical = await loadHistoricalInsights();
          if (!isActive) return;
          const candidate = currentInsight || insightQueue[0] || historical[0] || null;
          setGuidanceInsight(candidate || null);
          setHasLoadedGuidance(true);
        } finally {
          if (isActive) setInsightsLoading(false);
        }
      } else {
        const candidate = currentInsight || insightQueue[0];
        if (candidate && isActive) {
          setGuidanceInsight(candidate);
        }
      }
    };
    syncGuidance();
    return () => {
      isActive = false;
    };
  }, [currentInsight, hasLoadedGuidance, insightQueue, loadHistoricalInsights, user]);
  if (showDemo) {
    return <MainLayout>
        <PageContainer>
          <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4">
            {t("index.backToHome")}
          </Button>
          <PersonalityDemo />
        </PageContainer>
      </MainLayout>;
  }
  const iconByType: Record<ActivityType, JSX.Element> = {
    conversation: <MessageCircle className="h-5 w-5 text-primary" />,
    dream: <Moon className="h-5 w-5 text-primary" />,
    task: <ListChecks className="h-5 w-5 text-primary" />,
    insight: <Lightbulb className="h-5 w-5 text-primary" />
  };
  return <MainLayout>
      <PageContainer maxWidth="saas" className="sm:min-h-screen flex flex-col justify-start sm:justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 px-4 sm:px-0">
        {/* Hero Section */}
        <PageSection className="mb-6 sm:mb-8">
          <div className="flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                
                <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">
                  {safeInterpolateTranslation(user ? t("index.welcomePlainWithName") : t("index.welcomePlain"), {
                  name: userName
                })}
                </h1>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground" title="Last synced from your latest activity">
                <Clock className="h-4 w-4" />
                <span>{lastSynced ? `Last synced ${formatRelativeTime(lastSynced)}` : 'Last synced moments ago'}</span>
              </div>
            </div>

            {/* Quote - no card wrapper */}
            <div className="mt-2">
              <p className="text-sm text-muted-foreground mb-1">Your Quote of the Day</p>
              <PersonalizedQuoteDisplay className="text-xl sm:text-2xl text-foreground/80 font-inter italic" interval={4000} />
            </div>
          </div>
        </PageSection>

        {user && <PageSection className="mb-8">
            <div className="rounded-2xl bg-primary/10 border border-primary/20 p-6 sm:p-8 shadow-sm">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-primary font-semibold">
                    <Flame className="h-5 w-5" />
                    <span>Continue Where You Left Off</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-semibold text-foreground">
                    {continueItem?.title || 'You are all caught up'}
                  </h2>
                  <p className="text-muted-foreground text-sm">
                    {continueItem?.lastActivity ? `Last activity ${formatRelativeTime(continueItem.lastActivity)}` : 'Pick a focus to jump back in and keep momentum.'}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    size="lg"
                    onClick={() => {
                      if (!continueItem) return;
                      navigate(
                        continueItem.actionPath,
                        continueItem.actionState ? { state: continueItem.actionState } : undefined
                      );
                    }}
                    disabled={!continueItem}
                    className="font-inter h-touch px-8"
                  >
                    Resume
                  </Button>
                </div>
              </div>
            </div>
          </PageSection>}

        {/* Recent Activity - Clean List Layout */}
        <PageSection className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-semibold">Recent Activity</h3>
              {user && <Button variant="ghost" size="sm" onClick={fetchActivityData} disabled={activityLoading} className="h-8 w-8 p-0">
                  <RefreshCw className={cn("h-4 w-4", activityLoading && "animate-spin")} />
                </Button>}
            </div>
            {recentActivities.length > 3 && <Button variant="link" size="sm" onClick={() => navigate('/activity')} className="text-primary">
                View all <ChevronRight className="h-4 w-4 ml-1" />
              </Button>}
          </div>
          
          <div className="space-y-0">
            {recentActivities.length > 0 ? recentActivities.slice(0, 3).map((activity, idx) => <div
                key={activity.id}
                className={cn("flex items-center gap-4 py-4 cursor-pointer hover:bg-muted/30 transition-colors rounded-lg px-2 -mx-2", idx !== Math.min(2, recentActivities.length - 1) && "border-b border-border/30")}
                onClick={() => navigate(activity.actionPath, activity.actionState ? {
                state: activity.actionState
              } : undefined)}
              >
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                  {iconByType[activity.type]}
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">{activity.title}</div>
                  <div className="text-sm text-muted-foreground truncate">
                    {activity.description || formatRelativeTime(activity.timestamp)}
                  </div>
                </div>
                
                {/* Progress Bar */}
                {activity.progress !== undefined && <div className="flex items-center gap-2 shrink-0">
                    <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all" style={{
                  width: `${activity.progress}%`
                }} />
                    </div>
                    <span className="text-sm text-muted-foreground w-10 text-right">
                      {activity.progress}%
                    </span>
                  </div>}
                
                {/* Arrow */}
                <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
              </div>) : <div className="py-8 text-center text-muted-foreground">
                {user ? 'No recent activity yet. Start a conversation or set a task to see updates here.' : 'Sign in to see your unified activity stream.'}
              </div>}
          </div>
        </PageSection>

        <PageSection className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Compass className="h-5 w-5" />
              <span>Today's Guidance</span>
            </div>
            <p className="text-lg font-medium">{guidanceInsight?.text || currentSubtitle}</p>
            <p className="text-sm text-muted-foreground">
              {guidanceInsight ? `Source: ${guidanceInsight.module} · ${formatRelativeTime(guidanceInsight.timestamp?.toString())}` : insightsLoading ? 'Gathering your latest insights…' : 'We will surface blueprint insights and conversation highlights here once you engage.'}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/blueprint')} disabled={!guidanceInsight && insightsLoading}>
                {guidanceInsight ? 'Expand' : 'Blueprint'}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleTutorialStart}>
                Take tour
              </Button>
            </div>
          </div>

          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Sparkles className="h-5 w-5" />
              <span>Smart Shortcuts</span>
            </div>
            <p className="text-sm text-muted-foreground">Jump straight into the three core flows.</p>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => navigate('/companion')}>
                <MessageCircle className="h-5 w-5 mr-2" />
                Start a Conversation
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => navigate('/blueprint')}>
                <BookOpen className="h-5 w-5 mr-2" />
                View Blueprint Highlights
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3" onClick={() => navigate('/tasks')}>
                <ListChecks className="h-5 w-5 mr-2" />
                Check Growth Tasks
              </Button>
            </div>
          </div>
        </PageSection>

        {!user && <PageSection className="mb-8 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-2xl font-semibold">Get started with SoulSync</h3>
              <p className="text-muted-foreground">Create an account to track conversations, dreams, and growth tasks in one hub.</p>
            </div>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Button onClick={() => navigate('/get-started')} size="lg" className="font-inter h-touch px-8">
                <ArrowRight className="h-5 w-5 mr-2" />
                {t('index.getStarted')}
              </Button>
              <Button asChild variant="outline" size="lg" className="font-inter h-touch px-8">
                <Link to="/auth">
                  <LogIn className="h-5 w-5 mr-2" />
                  {t('auth.signIn')}
                </Link>
              </Button>
            </div>
          </PageSection>}

        {user && isAdminUser(user) && <div className="flex justify-center mb-8">
            <Button onClick={() => setShowDemo(true)} variant="outline" className="font-inter h-touch">
              <Brain className="h-5 w-5 mr-2" />
              {t('index.demoButton')}
            </Button>
          </div>}
      </PageContainer>

      {showTutorial && <TutorialModal isOpen={showTutorial} onClose={() => setShowTutorial(false)} tutorialState={tutorialState} onContinue={continueTutorial} onComplete={completeTutorial} />}
    </MainLayout>;
};
export default Index;
