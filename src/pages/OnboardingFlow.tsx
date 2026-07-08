import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CosmicCard } from "@/components/ui/cosmic-card";
import { GradientButton } from "@/components/ui/gradient-button";
import StarField from "@/components/ui/star-field";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { blueprintService, BlueprintData } from "@/services/blueprint-service";
import { supabase } from "@/integrations/supabase/client";
import { hermeticPersonalityReportService } from "@/services/hermetic-personality-report-service";
import { aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * OnboardingFlow — the 90-second path from birth data to first contact.
 *
 * Three screens, three principles per screen:
 *  1. Birth data   — one form, smart defaults, "I don't know my time" escape.
 *  2. The reveal   — progress starts at 20% (goal-gradient); the wait is the
 *                    show: real blueprint fragments materialize one by one.
 *  3. First contact — no tutorial, no path choice: straight into the chat,
 *                    where the companion speaks first.
 *
 * Replaces the 9-step wizard (src/pages/Onboarding.tsx — kept on disk,
 * unrouted). Name/personality/language questions move into the conversation;
 * full name stays here because numerology requires the birth name.
 */

type Phase = "form" | "reveal";

interface RevealFragment {
  label: string;
  value: string;
  whisper?: string;
}

/** Scripted stage lines shown while the chart is being computed. */
const CASTING_STAGES = [
  "Casting your chart…",
  "Reading your energy mechanics…",
  "Tracing your numbers…",
  "Listening for what most people miss…",
];

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user } = useAuth();
  const { language } = useLanguage();

  const [phase, setPhase] = useState<Phase>("form");

  // ------------------------------------------------------------------ form
  const [fullName, setFullName] = useState("");
  const [birthDate, setBirthDate] = useState("");
  const [birthTime, setBirthTime] = useState("");
  const [timeUnknown, setTimeUnknown] = useState(false);
  const [birthPlace, setBirthPlace] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // ---------------------------------------------------------------- reveal
  const [progress, setProgress] = useState(20); // never start at zero
  const [stageIndex, setStageIndex] = useState(0);
  const [fragments, setFragments] = useState<RevealFragment[]>([]);
  const [visibleCount, setVisibleCount] = useState(0);
  const [revealDone, setRevealDone] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const startedRef = useRef(false);

  const today = new Date().toISOString().split("T")[0];
  const formValid =
    fullName.trim().length >= 2 &&
    !!birthDate &&
    (timeUnknown || !!birthTime) &&
    birthPlace.trim().length >= 2;

  /** Extract the reveal-worthy facts from whatever the generator returned. */
  const extractFragments = (bp: BlueprintData): RevealFragment[] => {
    const hd = (bp as any).energy_strategy_human_design || (bp as any).human_design || {};
    const astro = (bp as any).archetype_western || (bp as any).astrology || {};
    const num = (bp as any).values_life_path || (bp as any).numerology || {};

    const out: RevealFragment[] = [];
    if (hd.type && hd.type !== "Unknown") {
      out.push({
        label: "Energy type",
        value: String(hd.type),
        whisper: "How your energy is built to move through the world.",
      });
    }
    if (hd.profile && hd.profile !== "Unknown") {
      out.push({
        label: "Profile",
        value: String(hd.profile),
        whisper: "The costume your purpose wears.",
      });
    }
    if (hd.authority && hd.authority !== "Unknown") {
      out.push({
        label: "Authority",
        value: String(hd.authority),
        whisper: "Where your real decisions come from — it's not your head.",
      });
    }
    if (astro.sun_sign && astro.sun_sign !== "Unknown") {
      out.push({ label: "Sun", value: String(astro.sun_sign) });
    }
    const lifePath = num.lifePathNumber ?? num.life_path_number ?? num.lifePath;
    if (lifePath) {
      out.push({
        label: "Life path",
        value: String(lifePath),
        whisper: "The lesson you keep being handed until you take it.",
      });
    }
    return out;
  };

  // Advance the scripted casting lines while generation runs.
  useEffect(() => {
    if (phase !== "reveal" || revealDone || genError) return;
    const id = window.setInterval(() => {
      setStageIndex((i) => Math.min(i + 1, CASTING_STAGES.length - 1));
      setProgress((p) => Math.min(p + 13, 85)); // crawls toward 85, never fakes 100
    }, 2200);
    return () => window.clearInterval(id);
  }, [phase, revealDone, genError]);

  // Stagger the fragment cards once they exist.
  useEffect(() => {
    if (fragments.length === 0 || visibleCount >= fragments.length) {
      if (fragments.length > 0 && visibleCount >= fragments.length) {
        const id = window.setTimeout(() => setRevealDone(true), 700);
        return () => window.clearTimeout(id);
      }
      return;
    }
    const id = window.setTimeout(() => setVisibleCount((c) => c + 1), 650);
    return () => window.clearTimeout(id);
  }, [fragments, visibleCount]);

  const beginGeneration = async () => {
    if (startedRef.current) return;
    startedRef.current = true;
    setGenError(null);

    const timezone =
      Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

    try {
      const { data, error, isPartial } =
        await blueprintService.generateBlueprintFromBirthData({
          full_name: fullName.trim(),
          birth_date: birthDate,
          birth_time_local: timeUnknown ? "12:00" : birthTime,
          birth_location: birthPlace.trim(),
          timezone,
        });

      if (error || !data) {
        throw new Error(error || "Your chart couldn't be cast. Try again?");
      }

      const { success, error: saveError } =
        await blueprintService.saveBlueprintData(data);
      if (!success) {
        throw new Error(saveError || "Your chart was cast but couldn't be saved. Try again?");
      }

      // Wake the oracle in the background — the companion needs embeddings.
      if (user?.id) {
        supabase.functions
          .invoke("trigger-blueprint-processing", {
            body: { userId: user.id, forceReprocess: true },
          })
          .catch((e) => console.warn("Oracle warm-up deferred:", e));

        // Kick off the hermetic deep-report in the background (same call the
        // old "Activate Steward" button used).
        hermeticPersonalityReportService
          .generateHermeticReport(data, language)
          .catch((e) => console.warn("Hermetic report generation deferred:", e));

        // Also kick off the user-facing standard personality report so the
        // Rapport tab is typically ready by the time the user gets there.
        // Non-blocking, but with a single retry on failure so a transient
        // gateway hiccup doesn't leave the user with no v1.0 report.
        (async () => {
          for (let attempt = 1; attempt <= 2; attempt++) {
            try {
              const res = await aiPersonalityReportService.generatePersonalityReport(data, language);
              if (res.success) {
                console.log(`✅ Standard report kicked (attempt ${attempt})`);
                localStorage.removeItem(`standard_report_pending_${user.id}`);
                return;
              }
              console.warn(`Standard report attempt ${attempt} failed:`, res.error);
            } catch (e) {
              console.warn(`Standard report attempt ${attempt} threw:`, e);
            }
            if (attempt === 1) await new Promise((r) => setTimeout(r, 5000));
          }
          // Both attempts failed — leave a marker so the /blueprint backfill
          // hook picks it up next time the user lands on that page.
          localStorage.setItem(`standard_report_pending_${user.id}`, String(Date.now()));
          console.error("❌ Standard report generation failed twice; deferred to backfill hook");
        })();
      }

      if (isPartial) {
        toast({
          title: "Chart cast with best available data",
          description: timeUnknown
            ? "An exact birth time will sharpen it — tell your companion if you ever find it."
            : "Some calculations used approximations. Your companion will refine them with you.",
        });
      }

      setProgress(100);
      const found = extractFragments(data);
      setFragments(
        found.length > 0
          ? found
          : [{ label: "Blueprint", value: "Cast", whisper: "Your companion is holding the details." }]
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something broke on our side.";
      console.error("Onboarding generation failed:", err);
      setGenError(message);
      startedRef.current = false; // allow retry
    }
  };

  const handleSubmit = async () => {
    if (!formValid || submitting) return;
    setSubmitting(true);
    setPhase("reveal");
    await beginGeneration();
    setSubmitting(false);
  };

  const handleRetry = async () => {
    setProgress(20);
    setStageIndex(0);
    await beginGeneration();
  };

  // ------------------------------------------------------------------ UI
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative">
      <StarField />

      {phase === "form" && (
        <CosmicCard className="w-full max-w-md p-6 sm:p-8 relative z-10" floating glow>
          {/* Goal-gradient: the account already exists — the first step is won. */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>Account created ✓</span>
              <span>20%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-soul-purple transition-all duration-700"
                style={{ width: "20%" }}
              />
            </div>
          </div>

          <h1 className="text-2xl font-bold font-display mb-1">
            <span className="gradient-text">Three things, then everything.</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Your chart is cast from the moment and place you arrived.
          </p>

          <div className="space-y-5">
            <div>
              <Label htmlFor="ob-name">Name on your birth certificate</Label>
              <Input
                id="ob-name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Your full birth name"
                autoComplete="name"
                autoFocus
              />
              <p className="text-xs text-muted-foreground mt-1">
                Your numbers are read from this name — nicknames come later.
              </p>
            </div>

            <div>
              <Label htmlFor="ob-date">Date of birth</Label>
              <Input
                id="ob-date"
                type="date"
                value={birthDate}
                max={today}
                min="1920-01-01"
                onChange={(e) => setBirthDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="ob-time">Time of birth</Label>
              <Input
                id="ob-time"
                type="time"
                value={birthTime}
                disabled={timeUnknown}
                onChange={(e) => setBirthTime(e.target.value)}
              />
              <button
                type="button"
                onClick={() => setTimeUnknown((v) => !v)}
                className={`mt-2 text-xs rounded-full px-3 py-1.5 border transition-colors ${
                  timeUnknown
                    ? "bg-soul-purple/15 border-soul-purple text-soul-purple"
                    : "border-muted text-muted-foreground hover:border-soul-purple/50"
                }`}
              >
                {timeUnknown ? "✓ I don't know my exact time" : "I don't know my exact time"}
              </button>
              {timeUnknown && (
                <p className="text-xs text-muted-foreground mt-1">
                  No problem — we'll read from midday. If you ever find it, your
                  companion will sharpen your chart.
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="ob-place">Place of birth</Label>
              <Input
                id="ob-place"
                value={birthPlace}
                onChange={(e) => setBirthPlace(e.target.value)}
                placeholder="City, country"
                autoComplete="off"
              />
            </div>
          </div>

          <GradientButton
            className="w-full mt-7"
            disabled={!formValid || submitting}
            onClick={handleSubmit}
          >
            Cast my chart — 60 seconds
          </GradientButton>
        </CosmicCard>
      )}

      {phase === "reveal" && (
        <CosmicCard className="w-full max-w-md p-6 sm:p-8 relative z-10" floating glow>
          <div className="mb-6">
            <div className="flex justify-between text-xs text-muted-foreground mb-1">
              <span>{progress >= 100 ? "Your chart is cast" : CASTING_STAGES[stageIndex]}</span>
              <span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-soul-purple transition-all duration-1000"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {genError ? (
            <div className="text-center py-6">
              <p className="text-sm text-foreground mb-1">{genError}</p>
              <p className="text-xs text-muted-foreground mb-5">
                Your details are still here — nothing was lost.
              </p>
              <GradientButton className="w-full" onClick={handleRetry}>
                Cast my chart again
              </GradientButton>
              <button
                type="button"
                onClick={() => setPhase("form")}
                className="mt-3 text-xs text-muted-foreground underline underline-offset-4"
              >
                Check my details
              </button>
            </div>
          ) : (
            <>
              <div className="space-y-3 min-h-[220px]">
                {fragments.slice(0, visibleCount).map((f) => (
                  <div
                    key={f.label}
                    className="rounded-xl border border-soul-purple/25 bg-soul-purple/5 px-4 py-3 animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs uppercase tracking-wider text-muted-foreground">
                        {f.label}
                      </span>
                      <span className="text-base font-semibold text-foreground">
                        {f.value}
                      </span>
                    </div>
                    {f.whisper && (
                      <p className="text-xs text-muted-foreground mt-1">{f.whisper}</p>
                    )}
                  </div>
                ))}

                {fragments.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center pt-16 animate-pulse">
                    Hold still — this is the part where you appear.
                  </p>
                )}
              </div>

              {revealDone && (
                <div className="mt-6 animate-in fade-in duration-700">
                  <p className="text-sm text-foreground mb-4 text-center">
                    There's more in here than fits on a card.
                    <br />
                    <span className="text-muted-foreground">
                      Your companion should be the one to tell you.
                    </span>
                  </p>
                  <GradientButton
                    className="w-full"
                    onClick={() => navigate("/companion?from=onboarding", { replace: true })}
                  >
                    Meet your companion
                  </GradientButton>
                </div>
              )}
            </>
          )}
        </CosmicCard>
      )}
    </div>
  );
};

export default OnboardingFlow;
