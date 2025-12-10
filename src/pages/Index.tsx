import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { safeInterpolateTranslation } from "@/utils/sanitize";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageSection } from "@/components/Layout/PageContainer";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { TutorialModal } from "@/components/tutorial/TutorialModal";
import PersonalityDemo from "@/components/personality/PersonalityDemo";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { useHACSInsights, type HACSInsight } from "@/hooks/use-hacs-insights";
import { isAdminUser } from "@/utils/isAdminUser";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Sparkles, Brain, BookOpen, ArrowRight, LogIn, MessageCircle, ListChecks, Moon, Lightbulb, Clock, Flame, Compass, RefreshCw, ChevronRight, Play, Layers, Target, ShieldCheck, MapPinned, Bolt } from "lucide-react";
type ActivityType = "conversation" | "dream" | "task" | "insight";
interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp?: string;
  actionLabel: string;
  actionPath: string;
  progress?: number;
}
interface ContinueItem {
  type: ActivityType;
  title: string;
  lastActivity?: string;
  actionPath: string;
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
  const focusPill = guidanceInsight?.module || "Alignment";
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
  const mapActivityToItem = useCallback((activity: any): ActivityItem => {
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

    // Extract progress if available
    const progressValue = activity.activity_data?.progress ?? activity.activity_data?.completion_percentage;
    return {
      id: activity.id,
      type,
      title: titleByType[type],
      description: description,
      timestamp: activity.created_at,
      actionLabel: actionLabelByType[type],
      actionPath: actionPathByType[type],
      progress: typeof progressValue === 'number' ? Math.round(progressValue) : undefined
    };
  }, []);
  const deriveContinueItem = useCallback((conversation: any | null, activities: any[]): ContinueItem | null => {
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
      candidates.push({
        type: 'task',
        title: taskActivity.activity_data?.title ? `Resume "${taskActivity.activity_data.title}"` : 'Continue your task list',
        lastActivity: taskActivity.created_at,
        actionPath: '/tasks'
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
      const {
        data: activitiesData
      } = await supabase.from('user_activities').select('id, activity_type, activity_data, created_at').eq('user_id', user.id).order('created_at', {
        ascending: false
      }).limit(8);
      const mappedActivities = (activitiesData || []).map(mapActivityToItem);
      setRecentActivities(mappedActivities);
      setLastSynced(activitiesData?.[0]?.created_at || null);
      const {
        data: conversationData
      } = await supabase.from('conversation_memory').select('session_id, last_activity, recovery_context').eq('user_id', user.id).eq('conversation_stage', 'active').order('last_activity', {
        ascending: false
      }).limit(1);
      const conversation = conversationData?.[0] || null;
      const continueCandidate = deriveContinueItem(conversation, activitiesData || []);
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
  const moduleCards = [
    {
      title: "Quick Focus",
      description: "2–5 min resets to regain clarity.",
      image: "/assets/home/dashboard.jpg",
      action: () => navigate(user ? '/companion' : '/auth'),
      badge: "In Flow"
    },
    {
      title: "Full Assessment",
      description: "Capture your current state in depth.",
      image: "/assets/home/growth.jpg",
      action: () => navigate(user ? '/blueprint' : '/auth'),
      badge: "10%"
    },
    {
      title: "Guided Discovery",
      description: "Structured prompts to unpack insights.",
      image: "/assets/home/companion.jpg",
      action: () => navigate(user ? '/companion' : '/auth'),
      badge: "New"
    },
    {
      title: "Progressive Journey",
      description: "Step-by-step roadmap progression.",
      image: "/assets/home/tasks.jpg",
      action: () => navigate(user ? '/tasks' : '/auth'),
      badge: "42%"
    }
  ];

  const continueCards = [
    {
      title: "Life Operating System",
      status: continueItem?.type === 'task' ? 'In Progress' : user ? 'Set up next' : 'Preview',
      description: continueItem?.title || 'Reconnect your routines and priorities.',
      actionPath: continueItem?.actionPath || '/tasks',
      icon: <Layers className="h-4 w-4" />,
      badge: continueItem?.lastActivity ? `Updated ${formatRelativeTime(continueItem.lastActivity)}` : user ? 'Start' : 'Sign in'
    },
    {
      title: "Guided Discovery",
      status: guidanceInsight ? 'Ongoing' : user ? 'Ready' : 'Preview',
      description: guidanceInsight?.text || 'Pick up your reflective prompts.',
      actionPath: '/companion',
      icon: <Target className="h-4 w-4" />,
      badge: user ? focusPill : 'Sign in'
    },
    {
      title: "Progressive Journey",
      status: 'Milestones',
      description: 'Advance the next milestone in your roadmap.',
      actionPath: '/blueprint',
      icon: <MapPinned className="h-4 w-4" />,
      badge: user ? 'Next step' : 'Sign in'
    },
    {
      title: "Blueprint",
      status: hasBlueprint ? 'Active' : user ? 'Draft' : 'Preview',
      description: hasBlueprint ? 'Review your latest blueprint insights.' : 'Create your personal blueprint.',
      actionPath: '/blueprint',
      icon: <ShieldCheck className="h-4 w-4" />,
      badge: user ? hasBlueprint ? 'Synced' : 'Start' : 'Sign in'
    }
  ];

  return <MainLayout>
      <PageContainer maxWidth="saas" className="sm:min-h-screen flex flex-col justify-start sm:justify-center bg-gradient-to-br from-background via-accent/5 to-primary/5 px-4 sm:px-0">
        {/* Hero Section */}
        <PageSection className="mb-6 sm:mb-8">
          <Card className="rounded-3xl border border-primary/15 bg-gradient-to-br from-primary/5 via-background to-card shadow-lg">
            <div className="p-6 sm:p-8 flex flex-col gap-4">
              <div className="flex flex-wrap items-center gap-3 justify-between">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Badge variant="outline" className="bg-primary/10 border-primary/20 text-primary">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    {lastSynced ? `Last synced ${formatRelativeTime(lastSynced)}` : 'Synced just now'}
                  </Badge>
                  <Badge className="bg-emerald-500/15 text-emerald-700 border-emerald-100">Today’s Growth Focus</Badge>
                </div>
                <Badge variant="secondary" className="bg-primary text-primary-foreground shadow-sm">
                  <Flame className="h-4 w-4 mr-1" />
                  {focusPill}
                </Badge>
              </div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                <div className="flex-1 space-y-3">
                  <p className="text-sm text-muted-foreground">Welcome back</p>
                  <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text leading-tight">
                    {safeInterpolateTranslation(user ? t("index.welcomePlainWithName") : t("index.welcomePlain"), {
                    name: userName
                  })}
                  </h1>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <Bolt className="h-4 w-4 text-primary" />
                    <span>{currentSubtitle}</span>
                  </div>
                </div>
                <div className="w-full lg:w-auto flex flex-col items-start gap-3">
                  <div className="text-left text-sm text-muted-foreground">
                    {guidanceInsight?.text || 'Tap in for a focused session to keep your momentum today.'}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button size="lg" className="h-touch px-6" onClick={() => navigate(user ? continueItem?.actionPath || '/companion' : '/auth')}>
                      <Play className="h-4 w-4 mr-2" />
                      Resume now
                    </Button>
                    <Button variant="outline" size="lg" className="h-touch px-6" onClick={() => navigate('/blueprint')}>
                      View blueprint
                    </Button>
                  </div>
                </div>
              </div>
              <div className="bg-card border border-border/70 rounded-2xl p-4 shadow-inner">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs uppercase text-muted-foreground tracking-wide">Today’s Quote</p>
                    <PersonalizedQuoteDisplay className="text-lg sm:text-xl text-foreground/80 font-inter italic" interval={4000} />
                  </div>
                  <Button variant="ghost" size="sm" onClick={handleTutorialStart}>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Guided tour
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        </PageSection>

        <PageSection className="mb-8">
          <div className="rounded-3xl bg-card border border-border/70 p-6 sm:p-7 shadow-sm">
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Flame className="h-5 w-5" />
                <span>Continue Where You Left Off</span>
              </div>
                <Badge variant="outline" className="text-xs text-muted-foreground border-border/70">Multi-track</Badge>
              </div>
            <div className="grid gap-3 md:grid-cols-2">
              {continueCards.map(card => <div key={card.title} className="rounded-2xl border border-border/70 bg-muted/20 p-4 hover:bg-primary/5 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                          {card.icon}
                        </span>
                        <div className="space-y-0.5">
                          <p className="text-xs uppercase tracking-wide text-muted-foreground">{card.status}</p>
                          <h3 className="text-lg font-semibold text-foreground">{card.title}</h3>
                        </div>
                      </div>
                      <Badge variant="secondary" className="bg-white/80 text-primary border-border/70">{card.badge}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-3 mb-4">{card.description}</p>
                    <div className="flex items-center justify-between">
                      <Button variant="ghost" size="sm" className="px-0 text-primary" onClick={() => navigate(user ? card.actionPath : '/auth')}>
                        Resume
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-9" onClick={() => navigate(user ? card.actionPath : '/auth')}>
                        Open track
                      </Button>
                    </div>
                  </div>)}
            </div>
          </div>
        </PageSection>

        {/* Explore Modules */}
        <PageSection className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Compass className="h-5 w-5" />
              <span>Explore Growth Modules</span>
            </div>
            <Badge variant="outline" className="text-xs text-muted-foreground border-border/70">Curated</Badge>
          </div>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {moduleCards.map(card => <div key={card.title} className="group relative overflow-hidden rounded-3xl border border-border/70 shadow-md bg-card">
                <img src={card.image} alt={card.title} className="h-40 w-full object-cover transition duration-500 group-hover:scale-105" />
                <div className="absolute top-3 right-3">
                  <Badge className="bg-white/80 text-primary border-border/70 backdrop-blur">{card.badge}</Badge>
                </div>
                <div className="p-4 space-y-2">
                  <h3 className="text-lg font-semibold">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                  <Button variant="ghost" size="sm" className="px-0 text-primary" onClick={card.action}>
                    Open module
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>)}
          </div>
        </PageSection>

        {/* Recent Activity - Card Digest */}
        <PageSection className="mb-8">
          <div className="rounded-3xl border border-border/70 bg-card shadow-sm">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border/70">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Clock className="h-4 w-4" />
                <span>Recent Activity</span>
                {user && <Button variant="ghost" size="icon" onClick={fetchActivityData} disabled={activityLoading} className="h-8 w-8 ml-2">
                    <RefreshCw className={cn("h-4 w-4", activityLoading && "animate-spin")} />
                  </Button>}
              </div>
              {recentActivities.length > 3 && <Button variant="link" size="sm" onClick={() => navigate('/activity')} className="text-primary">
                  View all <ChevronRight className="h-4 w-4 ml-1" />
                </Button>}
            </div>
            <div className="divide-y divide-border/60">
              {recentActivities.length > 0 ? recentActivities.slice(0, 3).map(activity => <div key={activity.id} className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-accent/5 transition-colors" onClick={() => navigate(activity.actionPath)}>
                    <div className="w-11 h-11 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20">
                      {iconByType[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-semibold text-sm text-foreground">{activity.title}</div>
                        <span className="text-xs text-muted-foreground">{activity.timestamp ? formatRelativeTime(activity.timestamp) : ''}</span>
                      </div>
                      <div className="text-sm text-muted-foreground truncate">{activity.description || 'Tap to open details'}</div>
                    </div>
                    {activity.progress !== undefined && <div className="flex items-center gap-2 shrink-0">
                        <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-primary rounded-full transition-all" style={{
                      width: `${activity.progress}%`
                    }} />
                        </div>
                        <span className="text-sm text-muted-foreground w-10 text-right">{activity.progress}%</span>
                      </div>}
                    <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
                  </div>) : <div className="py-8 text-center text-muted-foreground">
                  {user ? 'No recent activity yet. Start a conversation or set a task to see updates here.' : 'Sign in to see your unified activity stream.'}
                </div>}
            </div>
          </div>
        </PageSection>

        <PageSection className="mb-8 grid gap-4 lg:grid-cols-2">
          <div className="rounded-2xl border border-border/70 bg-card p-6 shadow-sm flex flex-col gap-3">
            <div className="flex items-center gap-2 text-primary font-semibold">
              <Sparkles className="h-5 w-5" />
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
              <BookOpen className="h-5 w-5" />
              <span>Blueprint Highlights</span>
            </div>
            <p className="text-sm text-muted-foreground">Key anchors to revisit today.</p>
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Values & Focus</p>
                  <p className="text-xs text-muted-foreground">Stay aligned to your top priority.</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">Sync</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Active Tasks</p>
                  <p className="text-xs text-muted-foreground">Continue your current sprint.</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">3 open</Badge>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border/70 p-3 bg-muted/40">
                <div className="space-y-0.5">
                  <p className="text-sm font-semibold">Insights</p>
                  <p className="text-xs text-muted-foreground">Reflect on the latest takeaway.</p>
                </div>
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">New</Badge>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="ghost" size="sm" onClick={() => navigate('/blueprint')}>
                Open Blueprint
              </Button>
              <Button variant="outline" size="sm" onClick={() => navigate('/tasks')}>
                View Tasks
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