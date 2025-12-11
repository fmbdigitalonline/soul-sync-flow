import { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import MainLayout from "@/components/Layout/MainLayout";
import { PageContainer, PageHeader } from "@/components/Layout/PageContainer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from "@/components/ui/sheet";
import { useHACSInsights, type HACSInsight } from "@/hooks/use-hacs-insights";
import { useJourneyGoals } from "@/hooks/use-journey-goals";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  MessageCircle,
  ListChecks,
  Moon,
  Lightbulb,
  Clock,
  RefreshCw,
  ChevronRight,
  Map,
  Focus,
  Layers,
  BookOpen,
} from "lucide-react";


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

const Index = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { loadHistoricalInsights, currentInsight, insightQueue } = useHACSInsights();
  const { goals, isLoading: goalsLoading } = useJourneyGoals();

  const [recentActivities, setRecentActivities] = useState<ActivityItem[]>([]);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [activityLoading, setActivityLoading] = useState(false);
  const [guidanceInsight, setGuidanceInsight] = useState<HACSInsight | null>(null);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [hasLoadedGuidance, setHasLoadedGuidance] = useState(false);
  const [isToolsDrawerOpen, setIsToolsDrawerOpen] = useState(false);

  const friendlyName = useMemo(() => {
    return user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split("@")[0] || "Feurion";
  }, [user]);

  const dreamStats = useMemo(() => {
    const totalMilestones = goals.reduce((sum, goal) => sum + (goal.milestones?.length || 0), 0);
    const completedMilestones = goals.reduce(
      (sum, goal) => sum + (goal.milestones?.filter((m) => m.completed).length || 0),
      0
    );

    return {
      activeDreams: goals.length,
      milestones: totalMilestones,
      completed: completedMilestones,
    };
  }, [goals]);

  const mostRecentGoal = useMemo(() => {
    if (!goals.length) return null;
    return goals.find((goal) => (goal.progress ?? 0) < 100) || goals[0];
  }, [goals]);

  const formatRelativeTime = useCallback((dateString?: string | null) => {
    if (!dateString) return "";
    const now = new Date();
    const target = new Date(dateString);
    const diffMs = now.getTime() - target.getTime();
    const diffMinutes = Math.floor(diffMs / (1000 * 60));
    if (diffMinutes < 1) return "zojuist";
    if (diffMinutes < 60) return `${diffMinutes} min geleden`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} uur geleden`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} dag${diffDays === 1 ? "" : "en"} geleden`;
  }, []);

  const mapActivityToItem = useCallback((activity: any): ActivityItem => {
    const activityType = String(activity.activity_type || "").toLowerCase();
    const description =
      activity.activity_data?.summary || activity.activity_data?.message || activity.activity_data?.title || "";

    let type: ActivityType = "task";
    if (activityType.includes("conversation")) {
      type = "conversation";
    } else if (activityType.includes("dream") || activityType.includes("milestone")) {
      type = "dream";
    } else if (activityType.includes("insight") || activityType.includes("blueprint")) {
      type = "insight";
    }

    const titleByType: Record<ActivityType, string> = {
      conversation: "Gesprek met Metgezel",
      dream: "Droomvoortgang",
      task: "Takenlijst",
      insight: "Blueprint inzicht",
    };
    const actionPathByType: Record<ActivityType, string> = {
      conversation: "/companion",
      dream: "/dreams",
      task: "/tasks",
      insight: "/blueprint",
    };
    const actionLabelByType: Record<ActivityType, string> = {
      conversation: "Open gesprek",
      dream: "Bekijk droom",
      task: "Open taken",
      insight: "Bekijk inzicht",
    };

    const progressValue = activity.activity_data?.progress ?? activity.activity_data?.completion_percentage;

    return {
      id: activity.id,
      type,
      title: titleByType[type],
      description,
      timestamp: activity.created_at,
      actionLabel: actionLabelByType[type],
      actionPath: actionPathByType[type],
      progress: typeof progressValue === "number" ? Math.round(progressValue) : undefined,
    };
  }, []);

  const fetchActivityData = useCallback(async () => {
    if (!user) return;
    setActivityLoading(true);
    try {
      const { data: activitiesData } = await supabase
        .from("user_activities")
        .select("id, activity_type, activity_data, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(8);

      const mappedActivities = (activitiesData || []).map(mapActivityToItem);
      setRecentActivities(mappedActivities);
      setLastSynced(activitiesData?.[0]?.created_at || null);
    } catch (error) {
      console.error("Error loading activity data", error);
    } finally {
      setActivityLoading(false);
    }
  }, [mapActivityToItem, user]);

  useEffect(() => {
    if (!user) {
      setRecentActivities([]);
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

  const iconByType: Record<ActivityType, JSX.Element> = {
    conversation: <MessageCircle className="h-5 w-5 text-primary" />,
    dream: <Moon className="h-5 w-5 text-primary" />,
    task: <ListChecks className="h-5 w-5 text-primary" />,
    insight: <Lightbulb className="h-5 w-5 text-primary" />,
  };

  const quickActions = [
    {
      title: "Creëer & Ontleed",
      subtitle: "Start een nieuwe droom",
      icon: <Sparkles className="h-5 w-5" />,
      action: () => navigate("/dreams/create"),
    },
    {
      title: "Jouw Taken",
      subtitle: "Zie je volgende stappen",
      icon: <ListChecks className="h-5 w-5" />,
      action: () => navigate("/tasks"),
    },
    {
      title: "Reiskaart",
      subtitle: "Overzicht van mijlpalen",
      icon: <Map className="h-5 w-5" />,
      action: () => navigate("/dreams/journey"),
    },
    {
      title: "Focus Sessie",
      subtitle: "Ga in begeleide focusmodus",
      icon: <Focus className="h-5 w-5" />,
      action: () => navigate("/dreams/focus"),
    },
  ];

  const pendingMilestones = mostRecentGoal?.milestones?.filter((m) => !m.completed).length || 0;
  const completedMilestones = mostRecentGoal?.milestones?.filter((m) => m.completed).length || 0;
  const totalMilestones = mostRecentGoal?.milestones?.length || 0;

  const recentDreamActivity = useMemo(
    () => recentActivities.find((activity) => activity.type === "dream"),
    [recentActivities]
  );

  return (
    <MainLayout>
      <PageContainer maxWidth="content" className="py-10 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto space-y-8">
          <PageHeader
            title={`${friendlyName}, hier is je droomreis vandaag`}
            subtitle={`${dreamStats.activeDreams} actieve dromen · ${dreamStats.milestones} mijlpalen · ${dreamStats.completed} afgerond`}
            actions={
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>{lastSynced ? `Bijgewerkt ${formatRelativeTime(lastSynced)}` : "Net gesynchroniseerd"}</span>
              </div>
            }
          />

          <Card className="p-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Actieve dromen</p>
                <p className="text-3xl font-semibold">{goalsLoading ? "–" : dreamStats.activeDreams}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Mijlpalen</p>
                <p className="text-3xl font-semibold">{goalsLoading ? "–" : dreamStats.milestones}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Afgerond</p>
                <p className="text-3xl font-semibold text-primary">{goalsLoading ? "–" : dreamStats.completed}</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2 text-primary font-semibold">
                <Moon className="h-5 w-5" />
                <span>Ga verder met je droom</span>
              </div>
              {mostRecentGoal && (
                <Badge variant="secondary" className="uppercase tracking-wide">
                  {mostRecentGoal.category || "persoonlijk"}
                </Badge>
              )}
            </div>

            {mostRecentGoal ? (
              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold leading-tight">{mostRecentGoal.title}</h2>
                  <p className="text-muted-foreground text-sm">
                    {mostRecentGoal.description || "Je droom wacht op de volgende stap."}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Voortgang</span>
                    <span>{mostRecentGoal.progress ?? 0}%</span>
                  </div>
                  <Progress value={mostRecentGoal.progress ?? 0} />
                  <p className="text-sm text-muted-foreground">
                    {completedMilestones}/{totalMilestones || "?"} mijlpalen afgerond
                  </p>
                </div>

                <div className="rounded-2xl bg-accent/30 border border-accent/60 p-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold">Plannen klaar om te hervatten</p>
                    <p className="text-sm text-muted-foreground">
                      {pendingMilestones > 0
                        ? `${pendingMilestones} open ${pendingMilestones === 1 ? "mijlpaal" : "mijlpalen"} wachten op jou`
                        : "Alle plannen zijn up-to-date"}
                    </p>
                  </div>
                  <Layers className="h-5 w-5 text-primary" />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
                  <Button size="lg" className="h-touch px-6" onClick={() => navigate("/dreams/journey")}>
                    Plan hervatten
                  </Button>
                  <Button variant="outline" className="h-touch px-6" onClick={() => navigate("/tasks")}>
                    Bekijk alle taken
                  </Button>
                  <Button variant="ghost" className="h-touch px-4 text-primary" onClick={() => navigate("/dreams")}> 
                    Alle dromen
                  </Button>
                </div>
                {recentDreamActivity && (
                  <p className="text-xs text-muted-foreground">
                    Laatst bijgewerkt {formatRelativeTime(recentDreamActivity.timestamp)}
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <h2 className="text-xl font-semibold">Start je eerste droom</h2>
                <p className="text-muted-foreground text-sm">
                  Creëer een droom en wij tonen je voortgang, mijlpalen en volgende stap hier.
                </p>
                <Button size="lg" className="w-full sm:w-auto" onClick={() => navigate("/dreams/create")}>
                  Nieuwe droom starten
                </Button>
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Sparkles className="h-5 w-5" />
                  <span>Snelle acties</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {quickActions.map((action) => (
                    <button
                      key={action.title}
                      onClick={action.action}
                      className="group rounded-2xl border border-border/70 bg-card hover:border-primary/50 hover:shadow-sm transition-all p-3 text-left flex flex-col gap-2 min-h-[120px]"
                    >
                      <div className="flex items-center justify-between">
                        <span className="rounded-full bg-primary/10 text-primary p-2">{action.icon}</span>
                        <ChevronRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm">{action.title}</p>
                        <p className="text-xs text-muted-foreground">{action.subtitle}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-accent/40">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Lightbulb className="h-5 w-5" />
                  <span>Dagelijks inzicht</span>
                </div>
                <h3 className="text-lg font-semibold">
                  {guidanceInsight?.title || "Blijf in beweging"}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {guidanceInsight?.text ||
                    (insightsLoading
                      ? "We halen je droominzichten op..."
                      : "We delen hier een gericht inzicht zodra je blueprint- of droomactiviteit hebt.")}
                </p>
              </div>
            </Card>
          </div>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ListChecks className="h-5 w-5 text-primary" />
                <h3 className="text-xl font-semibold">Recente activiteit</h3>
              </div>
              {user && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={fetchActivityData}
                  disabled={activityLoading}
                  className="h-8 px-2"
                >
                  <RefreshCw className={cn("h-4 w-4", activityLoading && "animate-spin")} />
                </Button>
              )}
            </div>

            <div className="space-y-2">
              {recentActivities.length > 0 ? (
                recentActivities.slice(0, 3).map((activity) => (
                  <button
                    key={activity.id}
                    onClick={() => navigate(activity.actionPath)}
                    className="w-full text-left rounded-2xl border border-border/70 hover:border-primary/50 transition-all p-4 flex items-start gap-3"
                  >
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      {iconByType[activity.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm">{activity.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {activity.description || formatRelativeTime(activity.timestamp)}
                      </p>
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </button>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  {user
                    ? "Nog geen activiteit. Maak een droom of voltooi een taak om updates te zien."
                    : "Meld je aan om je recente droomactiviteiten te volgen."}
                </p>
              )}
            </div>
          </Card>

          <div className="flex justify-end">
            <Button variant="link" className="text-primary" onClick={() => setIsToolsDrawerOpen(true)}>
              Meer droomtools →
            </Button>
          </div>
        </div>
      </PageContainer>

      <Sheet open={isToolsDrawerOpen} onOpenChange={setIsToolsDrawerOpen}>
        <SheetContent className="w-full sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Alle droomtools</SheetTitle>
            <SheetDescription>Alles wat niet in de snelle acties past, vind je hier.</SheetDescription>
          </SheetHeader>

          <div className="mt-6 space-y-3">
            {["Ontdek Je Droom", "Blauwdruk Suggesties", "Gewoontes", "Succes Weergave"].map((tool) => (
              <div
                key={tool}
                className="flex items-center justify-between rounded-xl border border-border/70 p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <BookOpen className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-semibold text-sm">{tool}</p>
                    <p className="text-xs text-muted-foreground">Onderdeel van je uitgebreidere droomstack</p>
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <SheetClose asChild>
              <Button variant="ghost">Sluiten</Button>
            </SheetClose>
          </div>
        </SheetContent>
      </Sheet>
    </MainLayout>
  );
};

export default Index;
