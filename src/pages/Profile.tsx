import React, { useState, useEffect } from "react";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { FocusToggle } from "@/components/ui/focus-toggle";
import {
  Sparkles, Compass, MessageSquare, Bell, Moon, Sun, LogOut,
  ChevronRight, Check, Shield, Pencil, TrendingUp,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TwinNameSettings } from "@/components/profile/TwinNameSettings";
import { useTwinName } from "@/hooks/use-twin-name";
import { myJourneyService, type MyJourney } from "@/services/my-journey-service";

type Tab = "journey" | "growth" | "settings";

const Profile = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { twinName } = useTwinName();

  const [tab, setTab] = useState<Tab>("journey");
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [journey, setJourney] = useState<MyJourney | null>(null);

  const { profile, statistics, goals, loading: profileLoading } = useUserProfile();
  const {
    loading: blueprintLoading,
    getPersonalityTraits,
    getDisplayName,
    getBlueprintCompletionPercentage,
  } = useOptimizedBlueprintData();

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    myJourneyService.getMyJourney(user.id, language === "nl" ? "nl" : "en").then((j) => {
      if (!cancelled) setJourney(j);
    });
    return () => { cancelled = true; };
  }, [user, language]);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      toast({ title: t("error"), description: t("profile.logoutError"), variant: "destructive" });
    }
  };

  const loading = profileLoading || blueprintLoading;
  const displayName = profile?.display_name || getDisplayName || "Friend";
  const traits: string[] = getPersonalityTraits || [];
  const blueprintPct = getBlueprintCompletionPercentage || 0;
  const activeGoals = goals.filter((g) => g.status === "active");
  const conversations = statistics?.coach_conversations ?? journey?.turningPoints.length ?? 0;
  const nl = language === "nl";

  const twinLabel = twinName?.name || (nl ? "je Twin" : "your Twin");
  const programCount = journey ? journey.programs.length : activeGoals.length;
  const insightCount = journey ? journey.patterns.length : 0;
  const reflection = journey?.patterns[0]?.text || journey?.trajectory;

  if (loading) {
    return (
      <MainLayout>
        <div className="ss min-h-screen" style={{ background: "var(--ss-canvas)" }}>
          <div className="max-w-md mx-auto p-6 flex flex-col items-center gap-4 pt-16">
            <div className="ss-avatar animate-pulse" style={{ background: "var(--ss-line)" }} />
            <div className="h-5 w-32 rounded-full animate-pulse" style={{ background: "var(--ss-line)" }} />
          </div>
        </div>
      </MainLayout>
    );
  }

  const segLabels: Record<Tab, string> = {
    journey: nl ? "Mijn Reis" : "My Journey",
    growth: nl ? "Groei" : "Growth",
    settings: nl ? "Instellingen" : "Settings",
  };

  return (
    <MainLayout>
      <div className="ss min-h-screen" style={{ background: "var(--ss-canvas)" }}>
        <div className="max-w-md mx-auto px-5 pt-8 pb-16 flex flex-col gap-5">

          {/* Identity */}
          <div className="flex flex-col items-center text-center gap-2.5">
            <div className="ss-avatar">{displayName.charAt(0).toUpperCase()}</div>
            <h1 className="text-[25px] font-semibold tracking-tight" style={{ color: "var(--ss-ink)" }}>
              {displayName}
            </h1>
            {traits.length > 0 && (
              <div className="flex flex-wrap gap-2 justify-center">
                {traits.slice(0, 2).map((trait, i) => (
                  <span key={i} className={i === 0 ? "ss-chip ss-chip--lead" : "ss-chip"}>{trait}</span>
                ))}
              </div>
            )}
          </div>

          {/* Segmented control */}
          <div className="ss-seg">
            {(["journey", "growth", "settings"] as Tab[]).map((k) => (
              <button key={k} data-on={tab === k} onClick={() => setTab(k)}>{segLabels[k]}</button>
            ))}
          </div>

          {/* ---- MY JOURNEY ---- */}
          {tab === "journey" && (
            <div className="flex flex-col gap-4">
              {/* Twin relationship card */}
              <div className="ss-twin">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {nl ? "Je Twin" : "Your Twin"}</span>
                    <div className="text-[30px] font-semibold tracking-tight mt-2.5 mb-1" style={{ color: "var(--ss-accent-ink)" }}>
                      {twinLabel}
                    </div>
                    <div className="text-sm" style={{ color: "var(--ss-muted)" }}>
                      {nl ? `Jullie deelden ${conversations} gesprekken.` : `You've shared ${conversations} conversations.`}
                    </div>
                  </div>
                  <div className="ss-orb" />
                </div>
                <button
                  onClick={() => setTab("settings")}
                  className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold rounded-full px-4 py-2 border"
                  style={{ color: "var(--ss-accent-ink)", background: "var(--ss-card)", borderColor: "var(--ss-line)" }}
                >
                  <Pencil className="h-3.5 w-3.5" /> {nl ? "Hernoem je Twin" : "Rename your Twin"}
                </button>
              </div>

              {/* Journey overview */}
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-[20px] font-semibold tracking-tight">{nl ? "Mijn Reis" : "My Journey"}</div>
                    <div className="text-sm mt-0.5" style={{ color: "var(--ss-muted)" }}>
                      {nl ? "Je bent op een mooi pad." : "You're on a beautiful path."}
                    </div>
                  </div>
                  <TrendingUp className="h-5 w-5" style={{ color: "var(--ss-accent)" }} />
                </div>
                <div className="ss-quad">
                  <Stat label={nl ? "Blauwdruk" : "Blueprint"}
                        value={blueprintPct >= 100 ? (nl ? "Compleet" : "Complete") : `${blueprintPct}%`}
                        done={blueprintPct >= 100} />
                  <Stat label={nl ? "Programma's" : "Programs"} value={String(programCount)} unit={nl ? "actief" : "active"} />
                  <Stat label={nl ? "Inzichten" : "Insights"} value={String(insightCount)} unit={nl ? "ontdekt" : "discovered"} />
                  <Stat label={nl ? "Gesprekken" : "Conversations"} value={String(conversations)} unit={nl ? "totaal" : "shared"} />
                </div>
                {reflection && (
                  <div className="ss-reflection">
                    <div className="text-[15.5px] leading-relaxed" style={{ color: "var(--ss-ink)" }}>{reflection}</div>
                    <div className="text-xs mt-2" style={{ color: "var(--ss-faint)" }}>
                      {nl ? "Een reflectie uit je reis" : "A reflection from your journey"}
                    </div>
                  </div>
                )}
              </div>

              {/* Turning points */}
              {journey && journey.turningPoints.length > 0 && (
                <div className="ss-card">
                  <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {nl ? "Keerpunten" : "Turning points"}</span>
                  <div className="mt-3 flex flex-col gap-2.5">
                    {journey.turningPoints.slice(0, 3).map((e) => (
                      <div key={e.sessionId} className="text-sm truncate" style={{ color: "var(--ss-muted)" }}>· {e.title}</div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- GROWTH ---- */}
          {tab === "growth" && (
            <div className="flex flex-col gap-3">
              {journey && journey.programs.length > 0 ? (
                journey.programs.map((p, i) => (
                  <div key={i} className="ss-card flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-[15px] font-semibold truncate" style={{ color: "var(--ss-ink)" }}>{p.title}</div>
                      <div className="text-xs mt-0.5" style={{ color: "var(--ss-muted)" }}>
                        {p.kind === "transformation" ? (nl ? "Groeiprogramma" : "Growth journey") : (nl ? "Doel" : "Achievement")}
                        {p.domain ? ` · ${p.domain.replace(/_/g, " ")}` : ""}
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0" style={{ color: "var(--ss-faint)" }} />
                  </div>
                ))
              ) : (
                <div className="ss-card text-center">
                  <div className="text-sm" style={{ color: "var(--ss-muted)" }}>
                    {nl
                      ? "Nog geen programma's. Begin een gesprek met je Twin om er een te vormen."
                      : "No journeys yet. Start a conversation with your Twin to shape one."}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ---- SETTINGS ---- */}
          {tab === "settings" && (
            <div className="flex flex-col gap-4">
              <div>
                <div className="ss-group-label">{nl ? "Relatie" : "Relationship"}</div>
                <TwinNameSettings />
              </div>

              <div>
                <div className="ss-group-label">{nl ? "App" : "App"}</div>
                <div className="ss-rows">
                  <div className="ss-lrow">
                    <span className="ss-ic"><Bell className="h-[18px] w-[18px]" /></span>
                    <div className="flex-1 text-[14.5px] font-medium">{t("profile.notifications")}</div>
                    <Switch defaultChecked />
                  </div>
                  <div className="ss-lrow">
                    <span className="ss-ic">{darkMode ? <Moon className="h-[18px] w-[18px]" /> : <Sun className="h-[18px] w-[18px]" />}</span>
                    <div className="flex-1 text-[14.5px] font-medium">{t("profile.darkMode")}</div>
                    <Switch checked={darkMode} onCheckedChange={toggleDarkMode} />
                  </div>
                  <div className="ss-lrow">
                    <FocusToggle />
                  </div>
                </div>
              </div>

              <div>
                <div className="ss-group-label">{nl ? "Account" : "Account"}</div>
                <div className="ss-rows">
                  <div className="ss-lrow">
                    <span className="ss-ic"><Shield className="h-[18px] w-[18px]" /></span>
                    <div className="flex-1 text-[14.5px] font-medium">{nl ? "Privacy & gegevens" : "Privacy & data"}</div>
                    <ChevronRight className="h-[18px] w-[18px]" style={{ color: "var(--ss-faint)" }} />
                  </div>
                  <button onClick={handleLogout} className="ss-lrow w-full text-left">
                    <span className="ss-ic" style={{ background: "rgba(224,103,103,.12)", color: "var(--ss-danger)" }}>
                      <LogOut className="h-[18px] w-[18px]" />
                    </span>
                    <div className="flex-1 text-[14.5px] font-medium" style={{ color: "var(--ss-danger)" }}>{t("nav.signOut")}</div>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
};

const Stat: React.FC<{ label: string; value: string; unit?: string; done?: boolean }> = ({ label, value, unit, done }) => (
  <div className="ss-qcell">
    <div className="text-[12.5px]" style={{ color: "var(--ss-muted)" }}>{label}</div>
    {done ? (
      <div className="mt-1.5 inline-flex items-center gap-1.5 text-[18px] font-semibold" style={{ color: "var(--ss-green)" }}>
        <Check className="h-4 w-4" strokeWidth={2.6} /> {value}
      </div>
    ) : (
      <div className="mt-1.5 text-[21px] font-semibold tracking-tight tabular-nums" style={{ color: "var(--ss-ink)" }}>
        {value} {unit && <span className="text-[12.5px] font-medium" style={{ color: "var(--ss-muted)" }}>{unit}</span>}
      </div>
    )}
  </div>
);

export default Profile;
