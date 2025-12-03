import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BookOpen,
  Brain,
  Flame,
  LayoutDashboard,
  ListTodo,
  LogIn,
  MessagesSquare,
  Sparkles,
  Sunrise,
  Target,
  Wand2
} from "lucide-react";
import { toast } from "sonner";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageSection } from "@/components/Layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PersonalizedQuoteDisplay } from "@/components/ui/personalized-quote-display";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/contexts/AuthContext";
import { useSoulOrb } from "@/contexts/SoulOrbContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useTutorialFlow } from "@/hooks/use-tutorial-flow";
import { isAdminUser } from "@/utils/isAdminUser";
import { useConversationRecovery } from "@/hooks/use-conversation-recovery";
import { useResumableTasks } from "@/hooks/use-resumable-tasks";
import { useJourneyTracking } from "@/hooks/use-journey-tracking";
import { pieService } from "@/services/pie-service";
import { PIEInsight } from "@/types/pie-types";
import { TutorialModal } from "@/components/tutorial/TutorialModal";

interface ActivityItem {
  id: string;
  type: "conversation" | "task" | "dream" | "insight";
  title: string;
  detail: string;
  timestamp?: string;
  actionLabel: string;
  href: string;
  icon: JSX.Element;
}

const formatRelativeTime = (timestamp?: string) => {
  if (!timestamp) return "Just now";
  const date = new Date(timestamp);
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hrs ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
};

const Index = () => {
  const { user } = useAuth();
  const { speak } = useSoulOrb();
  const navigate = useNavigate();
  const [showDemo, setShowDemo] = useState(false);
  const [showTutorial, setShowTutorial] = useState(false);
  const { blueprintData, hasBlueprint, loading, getDisplayName } = useOptimizedBlueprintData();
  const { t, language } = useLanguage();
  const { tutorialState, startTutorial, continueTutorial, completeTutorial } = useTutorialFlow();
  const { availableRecoveries, loadAvailableRecoveries } = useConversationRecovery();
  const { resumableTasksByGoal } = useResumableTasks();
  const { productivityJourney, growthJourney } = useJourneyTracking();
  const [insights, setInsights] = useState<PIEInsight[]>([]);

  const fallbackInsight: PIEInsight = {
    id: "fallback",
    userId: user?.id || "",
    patternId: "",
    predictiveRuleId: "",
    title: "Focus on invitations, not initiation.",
    message: "Lean into your natural rhythm and respond to what lights you up.",
    insightType: "awareness",
    priority: "medium",
    triggerEvent: "daily_guidance",
    triggerTime: new Date().toISOString(),
    deliveryTime: new Date().toISOString(),
    expirationTime: new Date(Date.now() + 3600 * 1000).toISOString(),
    confidence: 1,
    delivered: false,
    acknowledged: false,
    communicationStyle: "concise",
    personalizedForBlueprint: true
  };

  const welcomeMessage = useMemo(() => {
    if (!user) return null;
    return hasBlueprint ? t("index.welcomeBackReady") : t("index.createToGetStarted");
  }, [user, hasBlueprint, t]);

  const subtitleMessages = useMemo(() => {
    if (user && hasBlueprint) {
      return [t("index.subtitle")];
    }
    const messages = t("index.rotatingMessages");
    if (Array.isArray(messages)) return messages;
    return [t("index.subtitle")];
  }, [t, language, user, hasBlueprint]);

  const userName = useMemo(() => {
    return (
      blueprintData?.user_meta?.preferred_name ||
      getDisplayName ||
      user?.user_metadata?.full_name ||
      user?.user_metadata?.name ||
      user?.email?.split("@")[0] ||
      "Friend"
    );
  }, [blueprintData, getDisplayName, user]);

  const currentSubtitle = useMemo(() => {
    return subtitleMessages[0] || t("index.subtitle");
  }, [subtitleMessages, t]);

  useEffect(() => {
    if (user && !loading && welcomeMessage) {
      const timer = setTimeout(() => speak(welcomeMessage), 1000);
      return () => clearTimeout(timer);
    }
  }, [user, loading, welcomeMessage, speak]);

  useEffect(() => {
    loadAvailableRecoveries();
  }, [loadAvailableRecoveries]);

  useEffect(() => {
    const loadInsights = async () => {
      if (!user?.id) return;
      try {
        await pieService.initialize(user.id);
        const allInsights = await pieService.getCurrentInsights();
        setInsights(allInsights.slice(0, 3));
      } catch (error) {
        console.error("Error loading insights", error);
        toast.error("Could not load insights");
      }
    };

    loadInsights();
  }, [user?.id]);

  const primaryContinuation = useMemo(() => {
    if (availableRecoveries.length > 0) {
      const convo = availableRecoveries[0];
      return {
        title: "Continue your conversation",
        subtitle: formatRelativeTime(convo.lastActivity),
        cta: "Resume",
        onClick: () => navigate(`/coach?session=${convo.sessionId}`),
        icon: <MessagesSquare className="h-5 w-5 text-orange-500" />,
        accent: "bg-orange-50"
      };
    }

    const milestone = growthJourney?.growth_milestones?.[0];
    if (milestone) {
      return {
        title: `Continue Dream Milestone: ${milestone.title || "Milestone"}`,
        subtitle: "Pick up where you paused",
        cta: "Resume",
        onClick: () => navigate("/dreams"),
        icon: <Flame className="h-5 w-5 text-purple-500" />,
        accent: "bg-purple-50"
      };
    }

    const goalTasks = Array.from(resumableTasksByGoal.values()).flat();
    if (goalTasks.length > 0) {
      const task = goalTasks[0];
      return {
        title: `Jump back into: ${task.title}`,
        subtitle: "Your progress is saved",
        cta: "Resume",
        onClick: () => navigate("/dreams/tasks"),
        icon: <Target className="h-5 w-5 text-teal-500" />,
        accent: "bg-teal-50"
      };
    }

    return {
      title: "Start something new",
      subtitle: "Choose where to focus next",
      cta: "Explore",
      onClick: () => navigate("/dashboard"),
      icon: <Sparkles className="h-5 w-5 text-indigo-500" />,
      accent: "bg-indigo-50"
    };
  }, [availableRecoveries, growthJourney?.growth_milestones, navigate, resumableTasksByGoal]);

  const activityItems = useMemo<ActivityItem[]>(() => {
    const items: ActivityItem[] = [];

    availableRecoveries.slice(0, 3).forEach((recovery, index) => {
      items.push({
        id: `conversation-${index}`,
        type: "conversation",
        title: "Conversation with Companion",
        detail: "Pick up the thread you started.",
        timestamp: recovery.lastActivity,
        actionLabel: "Open Conversation",
        href: `/coach?session=${recovery.sessionId}`,
        icon: <MessagesSquare className="h-4 w-4 text-blue-500" />
      });
    });

    const goalTasks = Array.from(resumableTasksByGoal.values()).flat();
    if (goalTasks.length > 0) {
      items.push({
        id: "task-update",
        type: "task",
        title: goalTasks[0].title,
        detail: "Task updated",
        timestamp: productivityJourney?.last_updated,
        actionLabel: "Open Task",
        href: "/dreams/tasks",
        icon: <ListTodo className="h-4 w-4 text-emerald-500" />
      });
    }

    if (growthJourney?.growth_milestones?.length) {
      items.push({
        id: "dream-progress",
        type: "dream",
        title: "Dream milestone unlocked",
        detail: growthJourney.growth_milestones[0]?.title || "New progress",
        timestamp: growthJourney.last_updated,
        actionLabel: "View Dream",
        href: "/dreams",
        icon: <Flame className="h-4 w-4 text-purple-500" />
      });
    }

    if (insights.length > 0) {
      items.push({
        id: "blueprint-insight",
        type: "insight",
        title: "Blueprint insight added",
        detail: insights[0].message,
        timestamp: insights[0].created_at || insights[0].updated_at,
        actionLabel: "View Insight",
        href: "/dashboard",
        icon: <BookOpen className="h-4 w-4 text-indigo-500" />
      });
    }

    return items
      .sort((a, b) => {
        const aTime = a.timestamp ? new Date(a.timestamp).getTime() : 0;
        const bTime = b.timestamp ? new Date(b.timestamp).getTime() : 0;
        return bTime - aTime;
      })
      .slice(0, 5);
  }, [availableRecoveries, resumableTasksByGoal, productivityJourney?.last_updated, growthJourney, insights]);

  const todaysGuidance = useMemo(() => {
    if (insights.length > 0) {
      return insights[0];
    }

    return fallbackInsight;
  }, [fallbackInsight, insights]);

  const handleTutorialStart = () => {
    if (!user) return;
    try {
      startTutorial();
      setShowTutorial(true);
    } catch (error) {
      console.error("Error starting tutorial", error);
    }
  };

  if (showDemo) {
    return (
      <MainLayout>
        <PageContainer>
          <Button variant="ghost" onClick={() => setShowDemo(false)} className="mb-4">
            {t("index.backToHome")}
          </Button>
          <div className="bg-muted/30 rounded-3xl p-6 text-sm text-muted-foreground">
            Demo mode is currently disabled on this surface.
          </div>
        </PageContainer>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <PageContainer maxWidth="saas" className="sm:min-h-screen flex flex-col bg-gradient-to-br from-background via-accent/5 to-primary/5 px-4 sm:px-0">
        <PageSection className="pb-4 sm:pb-8">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Welcome Back, {userName}</p>
              <h1 className="text-4xl sm:text-5xl font-bold font-cormorant gradient-text">SoulSync Home</h1>
              <p className="text-base text-muted-foreground">{currentSubtitle}</p>
            </div>
            {user && isAdminUser(user) && (
              <Button onClick={() => setShowDemo(true)} variant="outline" className="font-inter h-touch">
                <Brain className="h-5 w-5 mr-2" />
                {t("index.demoButton")}
              </Button>
            )}
          </div>
        </PageSection>

        <PageSection className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 items-start">
          <div className="space-y-6">
            <Card variant="elevated" className="relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-purple-500 to-blue-500" />
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Sunrise className="h-5 w-5 text-purple-500" />
                    <div>
                      <p className="text-sm text-muted-foreground">Your Quote of the Day</p>
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <p className="text-xs text-muted-foreground">Last synced 2 hrs ago</p>
                          </TooltipTrigger>
                          <TooltipContent>Synced across your devices</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <PersonalizedQuoteDisplay className="text-lg text-foreground font-inter" interval={4000} />
              </CardContent>
            </Card>

            <Card variant="elevated" className="border-primary/20 bg-card">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-2xl ${primaryContinuation.accent}`}>
                    <Flame className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Continue where you left off</p>
                    <CardTitle className="text-xl">{primaryContinuation.title}</CardTitle>
                    <CardDescription>{primaryContinuation.subtitle}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardFooter className="pt-0 flex flex-wrap gap-2">
                <Button size="lg" className="font-inter" onClick={primaryContinuation.onClick}>
                  {primaryContinuation.cta}
                </Button>
                {user ? (
                  <Button variant="outline" size="lg" className="font-inter" onClick={handleTutorialStart}>
                    <BookOpen className="h-5 w-5 mr-2" />
                    Take a tour
                  </Button>
                ) : (
                  <Button asChild variant="outline" size="lg" className="font-inter">
                    <Link to="/auth">
                      <LogIn className="h-5 w-5 mr-2" />
                      Sign in
                    </Link>
                  </Button>
                )}
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Sparkles className="h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm text-muted-foreground">Today’s Guidance</p>
                    <CardTitle className="text-xl">{todaysGuidance.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <p className="text-base text-muted-foreground">{todaysGuidance.message}</p>
              </CardContent>
              <CardFooter className="pt-0">
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")}>Expand</Button>
              </CardFooter>
            </Card>

            <Card variant="elevated">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Smart Shortcuts</CardTitle>
                </div>
                <CardDescription>Jump to your most common actions</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/coach")}>✨ Start a Conversation</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/blueprint")}>📘 View Blueprint Highlights</Button>
                <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/dreams/tasks")}>🌱 Check Growth Tasks</Button>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-3">
            <Card variant="elevated" className="sticky top-4">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <LayoutDashboard className="h-5 w-5 text-primary" />
                  <CardTitle className="text-lg">Recent Activity</CardTitle>
                </div>
                <CardDescription>The latest across conversations, tasks, dreams, and insights.</CardDescription>
              </CardHeader>
              <CardContent className="pt-0 space-y-4">
                {activityItems.length === 0 && (
                  <div className="text-sm text-muted-foreground bg-muted/30 rounded-2xl p-4">
                    No recent activity yet. Your journey updates will appear here.
                  </div>
                )}

                {activityItems.map(item => (
                  <div key={item.id} className="flex gap-3 p-3 rounded-2xl hover:bg-accent/10 transition">
                    <div className="mt-1">
                      <div className="h-10 w-10 rounded-2xl bg-muted flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium">{item.title}</p>
                        <span className="text-xs text-muted-foreground">{formatRelativeTime(item.timestamp)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2">{item.detail}</p>
                      <Button variant="ghost" size="sm" className="px-0" onClick={() => navigate(item.href)}>
                        {item.actionLabel}
                        <ArrowRight className="h-4 w-4 ml-2" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </PageSection>
      </PageContainer>

      {showTutorial && (
        <TutorialModal
          isOpen={showTutorial}
          onClose={() => setShowTutorial(false)}
          tutorialState={tutorialState}
          onContinue={continueTutorial}
          onComplete={completeTutorial}
        />
      )}
    </MainLayout>
  );
};

export default Index;
