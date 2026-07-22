import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "@/components/Layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Sparkles, Compass, MessageSquare, Bell, Moon, Sun, LogOut,
  ChevronRight, ChevronLeft, Check, Shield, Pencil, TrendingUp, BookOpen, Mic, ArrowRight,
} from "lucide-react";
import { useUserProfile } from "@/hooks/use-user-profile";
import { useOptimizedBlueprintData } from "@/hooks/use-optimized-blueprint-data";
import { calculateWeeklyInsights, WeeklyInsights } from "@/services/insights-service";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TwinNameSettings } from "@/components/profile/TwinNameSettings";
import { useTwinName } from "@/hooks/use-twin-name";
import { myJourneyService, type MyJourney } from "@/services/my-journey-service";
import { LifeWheel } from "@/components/journey/LifeWheel";
import { AlignmentSection } from "@/components/journey/AlignmentSection";

type Tab = "journey" | "growth" | "settings";
type DeepTab = "overview" | "patterns" | "turning";

const Profile = () => {
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { toast } = useToast();
  const { twinName } = useTwinName();
  const navigate = useNavigate();
  const nl = language === "nl";

  const [tab, setTab] = useState<Tab>("journey");
  const [deep, setDeep] = useState(false);
  const [deepTab, setDeepTab] = useState<DeepTab>("overview");
  const [darkMode, setDarkMode] = useState(() =>
    typeof document !== "undefined" && document.documentElement.classList.contains("dark"),
  );
  const [focusMode, setFocusMode] = useState(() =>
    typeof document !== "undefined" && document.body.classList.contains("focus-mode"),
  );
  const [journey, setJourney] = useState<MyJourney | null>(null);
  const [weekly, setWeekly] = useState<WeeklyInsights | null>(null);

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
    myJourneyService.getMyJourney(user.id, nl ? "nl" : "en").then((j) => { if (!cancelled) setJourney(j); });
    calculateWeeklyInsights().then((w) => { if (!cancelled) setWeekly(w); }).catch(() => {});
    return () => { cancelled = true; };
  }, [user, nl]);

  const toggleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.documentElement.classList.toggle("dark", checked);
  };
  const toggleFocusMode = (checked: boolean) => {
    setFocusMode(checked);
    document.body.classList.toggle("focus-mode", checked);
  };
  const handleLogout = async () => {
    try { await supabase.auth.signOut(); }
    catch { toast({ title: t("error"), description: t("profile.logoutError"), variant: "destructive" }); }
  };

  const loading = profileLoading || blueprintLoading;
  const displayName = profile?.display_name || getDisplayName || "Friend";
  const traits: string[] = getPersonalityTraits || [];
  const blueprintPct = getBlueprintCompletionPercentage || 0;
  const activeGoals = goals.filter((g) => g.status === "active");
  const conversations = statistics?.coach_conversations ?? journey?.turningPoints.length ?? 0;
  const twinLabel = twinName?.name || (nl ? "je Twin" : "your Twin");
  const programCount = journey ? journey.programs.length : activeGoals.length;
  const insightCount = journey ? journey.patterns.length : 0;
  const reflection = journey?.patterns[0]?.text || journey?.trajectory;

  if (loading) {
    return (
      <MainLayout>
        <div className="ss ss-page min-h-screen">
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
    growth: nl ? "Programma's" : "Programs",
    settings: nl ? "Instellingen" : "Settings",
  };

  return (
    <MainLayout>
      <div className="ss ss-page min-h-screen">
        <div className="max-w-md mx-auto px-5 pt-8 pb-16 flex flex-col gap-5">

          {/* ============ DEEP VIEW ============ */}
          {tab === "journey" && deep ? (
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <button onClick={() => setDeep(false)} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: "var(--ss-muted)" }}>
                  <ChevronLeft className="h-4 w-4" /> {nl ? "Terug" : "Back"}
                </button>
                <div className="text-[17px] font-semibold">{nl ? "Mijn Reis" : "My Journey"}</div>
                <span className="ss-chip" style={{ padding: "4px 11px" }}>{displayName}</span>
              </div>
              <div className="ss-seg">
                {(["overview", "patterns", "turning"] as DeepTab[]).map((k) => (
                  <button key={k} data-on={deepTab === k} onClick={() => setDeepTab(k)}>
                    {k === "overview" ? (nl ? "Overzicht" : "Overview") : k === "patterns" ? (nl ? "Patronen" : "Patterns") : (nl ? "Keerpunten" : "Turning points")}
                  </button>
                ))}
              </div>

              {deepTab === "overview" && (
                <>
                  {/* The honest life-wheel — the user's own balance ratings. */}
                  <LifeWheel />
                  {/* Complement: where activity actually is (observed, not rated). */}
                  {journey && journey.domains.length > 0 && (
                    <div className="ss-card">
                      <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {nl ? "Waar je aandacht naartoe gaat" : "Where your attention is going"}</span>
                      <div className="flex flex-wrap gap-1.5 mt-3">
                        {journey.domains.map((d) => (
                          <span key={d} className="ss-chip capitalize">{d.replace(/_/g, " ")}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {journey?.trajectory && (
                    <div className="ss-card">
                      <span className="ss-eyebrow"><TrendingUp className="h-3.5 w-3.5" /> {nl ? "Richting" : "Trajectory"}</span>
                      <div className="text-[15px] leading-relaxed mt-2" style={{ color: "var(--ss-ink)" }}>{journey.trajectory}</div>
                    </div>
                  )}
                </>
              )}

              {deepTab === "patterns" && (
                <div className="ss-card">
                  <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {nl ? "Wat steeds terugkeert" : "What keeps appearing"}</span>
                  {journey && journey.patterns.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      {journey.patterns.map((p, i) => (
                        <div key={i} className="text-sm leading-relaxed" style={{ color: "var(--ss-muted)" }}>· {p.text}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm mt-3" style={{ color: "var(--ss-faint)" }}>
                      {nl ? "Nog geen terugkerende patronen." : "No recurring patterns yet."}
                    </div>
                  )}
                </div>
              )}

              {deepTab === "turning" && (
                <div className="ss-card">
                  <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {nl ? "Keerpunten" : "Turning points"}</span>
                  {journey && journey.turningPoints.length > 0 ? (
                    <div className="mt-3 flex flex-col gap-2.5">
                      {journey.turningPoints.map((e) => (
                        <div key={e.sessionId} className="text-sm truncate" style={{ color: "var(--ss-muted)" }}>· {e.title}</div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-sm mt-3" style={{ color: "var(--ss-faint)" }}>
                      {nl ? "Je reis is nog pril." : "Your journey is still early."}
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Identity */}
              <div className="flex flex-col items-center text-center gap-2.5">
                <div className="ss-avatar">{displayName.charAt(0).toUpperCase()}</div>
                <h1 className="text-[25px] font-semibold tracking-tight" style={{ color: "var(--ss-ink)" }}>{displayName}</h1>
                {traits.length > 0 && (
                  <div className="flex flex-wrap gap-2 justify-center">
                    {traits.slice(0, 3).map((trait, i) => (
                      <span key={i} className={i === 0 ? "ss-chip ss-chip--lead" : "ss-chip"}>{trait}</span>
                    ))}
                  </div>
                )}
              </div>

              {/* ── PORTRAIT (persistent above the tabs): who walks beside you,
                     and where you are — the passport sequence. ── */}
              <div className="ss-twin">
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {nl ? "Je Twin" : "Your Twin"}</span>
                    <div className="text-[30px] font-semibold tracking-tight mt-2.5 mb-1" style={{ color: "var(--ss-accent-ink)" }}>{twinLabel}</div>
                    <div className="text-sm" style={{ color: "var(--ss-muted)" }}>
                      {conversations === 0
                        ? (nl ? "Jullie hebben nog niet gesproken." : "You haven't spoken yet.")
                        : (nl ? `Jullie deelden ${conversations} gesprekken.` : `You've shared ${conversations} conversations.`)}
                    </div>
                  </div>
                  <div className="ss-orb" />
                </div>
                <button onClick={() => setTab("settings")} className="mt-4 inline-flex items-center gap-1.5 text-[13.5px] font-semibold rounded-full px-4 py-2 border"
                  style={{ color: "var(--ss-accent-ink)", background: "var(--ss-card)", borderColor: "var(--ss-line)" }}>
                  <Pencil className="h-3.5 w-3.5" /> {nl ? "Hernoem je Twin" : "Rename your Twin"}
                </button>
              </div>

              {/* Where you are now — the narrative lead (persistent) */}
              <div className="px-1">
                <div className="text-[10px] font-semibold uppercase tracking-wider mb-1.5" style={{ color: "var(--ss-accent)" }}>
                  {nl ? "Waar je nu bent" : "Where you are now"}
                </div>
                <div className="text-[16px] leading-relaxed" style={{ color: reflection ? "var(--ss-ink)" : "var(--ss-muted)" }}>
                  {reflection || (nl ? "Je reis begint. Praat met je Twin en het verhaal ontvouwt zich hier." : "Your journey is beginning. Talk with your Twin and the story unfolds here.")}
                </div>
              </div>

              {/* Tabs — sub-navigation into detail */}
              <div className="ss-seg">
                {(["journey", "growth", "settings"] as Tab[]).map((k) => (
                  <button key={k} data-on={tab === k} onClick={() => { setTab(k); setDeep(false); }}>{segLabels[k]}</button>
                ))}
              </div>

              {/* ---- MY JOURNEY (details) ---- */}
              {tab === "journey" && (
                <div className="flex flex-col gap-4">
                  {/* Alignment (v3.6) — interpreted, never scored: the lead of
                      the journey. */}
                  <AlignmentSection
                    patterns={journey?.patterns}
                    onLearnMore={() => { setDeep(true); setDeepTab("overview"); }}
                  />
                  {/* Mountain hero → deep view */}
                  <button onClick={() => { setDeep(true); setDeepTab("overview"); }} className="ss-hero text-left">
                    <svg viewBox="0 0 360 168" preserveAspectRatio="xMidYMid slice" style={{ display: "block", width: "100%", height: 156 }}>
                      <defs>
                        <linearGradient id="pjSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#c9b6e6"/><stop offset=".6" stopColor="#e7c9d8"/><stop offset="1" stopColor="#f6d9c0"/></linearGradient>
                        <radialGradient id="pjSun" cx="52%" cy="72%" r="55%"><stop offset="0" stopColor="#fff4e2"/><stop offset=".4" stopColor="#ffe3c2" stopOpacity=".9"/><stop offset="1" stopColor="#ffe3c2" stopOpacity="0"/></radialGradient>
                      </defs>
                      <rect width="360" height="168" fill="url(#pjSky)"/>
                      <circle cx="188" cy="112" r="82" fill="url(#pjSun)"/>
                      <path d="M0 108 L52 76 L96 98 L150 64 L206 94 L260 70 L316 96 L360 80 L360 168 L0 168Z" fill="#b6a2d6" opacity=".85"/>
                      <path d="M0 126 L60 102 L118 122 L176 94 L238 120 L300 100 L360 118 L360 168 L0 168Z" fill="#9a83c6"/>
                      <path d="M0 142 L70 128 L150 144 L226 126 L300 142 L360 134 L360 168 L0 168Z" fill="#7b66ac"/>
                      <path d="M182 168 C176 152 200 142 190 126 C184 116 196 108 192 100" stroke="#efe6d4" strokeWidth="6" fill="none" opacity=".8" strokeLinecap="round"/>
                    </svg>
                    <div className="ss-hero-veil" />
                    <div className="ss-hero-cap">
                      <div className="text-[18px] font-semibold text-white">{nl ? "Jouw Reis" : "Your Journey"}</div>
                      <div className="text-[12.5px] text-white/90 mt-0.5">{nl ? "Een weerspiegeling van je ontwikkeling." : "A reflection of your life's evolution."}</div>
                      <span className="ss-hero-open">{nl ? "Open Mijn Reis" : "Open My Journey"} <ArrowRight className="h-3.5 w-3.5" /></span>
                    </div>
                  </button>

                  {/* The numbers — after the story */}
                  <div className="ss-quad">
                    <Stat label={nl ? "Blauwdruk" : "Blueprint"} value={blueprintPct >= 100 ? (nl ? "Compleet" : "Complete") : `${blueprintPct}%`} done={blueprintPct >= 100} />
                    <Stat label={nl ? "Programma's" : "Programs"} value={String(programCount)} unit={nl ? "actief" : "active"} />
                    <Stat label={nl ? "Inzichten" : "Insights"} value={String(insightCount)} unit={nl ? "ontdekt" : "discovered"} />
                    <Stat label={nl ? "Gesprekken" : "Conversations"} value={String(conversations)} unit={nl ? "totaal" : "shared"} />
                  </div>

                  {/* This Month */}
                  {weekly && (
                    <div className="ss-card">
                      <span className="ss-eyebrow" style={{ marginBottom: 14, display: "block" }}>{nl ? "Deze maand" : "This month"}</span>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <div className="text-xs" style={{ color: "var(--ss-muted)" }}>{nl ? "Meest productieve dag" : "Most productive day"}</div>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[16px] font-semibold">{weekly.mostProductiveDay || (nl ? "Zondag" : "Sunday")}</span>
                            {weekly.improvementTrend && (
                              <span className="text-[11.5px] font-semibold rounded-full px-2 py-0.5" style={{ color: "var(--ss-green)", background: "rgba(52,201,138,.13)" }}>{weekly.improvementTrend}</span>
                            )}
                          </div>
                        </div>
                        <div>
                          <div className="text-xs" style={{ color: "var(--ss-muted)" }}>{nl ? "Energie" : "Energy"}</div>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            <span className="text-[16px] font-semibold">{weekly.energyPeaks || (nl ? "Stabiel" : "Steady")}</span>
                            <TrendingUp className="h-4 w-4" style={{ color: "var(--ss-accent)" }} />
                          </div>
                        </div>
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
                        {nl ? "Nog geen programma's. Begin een gesprek met je Twin om er een te vormen." : "No journeys yet. Start a conversation with your Twin to shape one."}
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
                    <div className="flex flex-col gap-2">
                      <TwinNameSettings />
                      <div className="ss-rows">
                        <div className="ss-lrow">
                          <span className="ss-ic"><Mic className="h-[18px] w-[18px]" /></span>
                          <div className="flex-1">
                            <div className="text-[14.5px] font-medium">{nl ? "Stem & toon" : "Voice & tone"}</div>
                            <div className="text-[12.5px]" style={{ color: "var(--ss-muted)" }}>{nl ? "Kalm · warm · inzichtelijk" : "Calm · warm · insightful"}</div>
                          </div>
                        </div>
                        <button onClick={() => navigate("/companion")} className="ss-lrow w-full text-left">
                          <span className="ss-ic"><MessageSquare className="h-[18px] w-[18px]" /></span>
                          <div className="flex-1">
                            <div className="text-[14.5px] font-medium">{nl ? "Gespreksgeschiedenis" : "Conversation history"}</div>
                            <div className="text-[12.5px]" style={{ color: "var(--ss-muted)" }}>{nl ? "Eerdere gesprekken teruglezen" : "Revisit past episodes"}</div>
                          </div>
                          <ChevronRight className="h-[18px] w-[18px]" style={{ color: "var(--ss-faint)" }} />
                        </button>
                      </div>
                    </div>
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
                        <span className="ss-ic"><BookOpen className="h-[18px] w-[18px]" /></span>
                        <div className="flex-1">
                          <div className="text-[14.5px] font-medium">{nl ? "Focusmodus" : "Focus mode"}</div>
                          <div className="text-[12.5px]" style={{ color: "var(--ss-muted)" }}>{nl ? "Afleidingsvrij" : "Distraction-free"}</div>
                        </div>
                        <Switch checked={focusMode} onCheckedChange={toggleFocusMode} />
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
                        <span className="ss-ic" style={{ background: "rgba(224,103,103,.12)", color: "var(--ss-danger)" }}><LogOut className="h-[18px] w-[18px]" /></span>
                        <div className="flex-1 text-[14.5px] font-medium" style={{ color: "var(--ss-danger)" }}>{t("nav.signOut")}</div>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </>
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
