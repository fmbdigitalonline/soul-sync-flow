import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { aiPersonalityReportService } from "@/services/ai-personality-report-service";
import { blueprintService } from "@/services/blueprint-service";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";

/**
 * Backfill the v1.0 standard personality report if a user has a blueprint
 * (and, typically, a hermetic v2.0 report) but no v1.0 row. Covers users whose
 * onboarding auto-trigger silently failed (e.g. before the missing
 * callChatCompletion import fix).
 *
 * Fires at most once per session per user; guarded by a localStorage flag so a
 * second attempt is delayed 24h even across reloads.
 */
const LS_KEY = (uid: string) => `standard_report_backfill_attempt_${uid}`;
const BACKOFF_MS = 24 * 60 * 60 * 1000;

export function useStandardReportBackfill() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const attempted = useRef(false);

  useEffect(() => {
    if (!user?.id || attempted.current) return;
    attempted.current = true;

    (async () => {
      try {
        // Debounce via localStorage
        const last = localStorage.getItem(LS_KEY(user.id));
        if (last && Date.now() - Number(last) < BACKOFF_MS) {
          console.log("⏭️ Standard report backfill: recent attempt, skipping");
          return;
        }

        // Only backfill if v1.0 report is genuinely missing
        const { data: existing } = await (supabase as any)
          .from("personality_reports")
          .select("id")
          .eq("user_id", user.id)
          .eq("blueprint_version", "1.0")
          .limit(1);
        if (existing && existing.length > 0) return;

        const bpRes = await blueprintService.getActiveBlueprintData();
        if (bpRes.error || !bpRes.data) {
          console.warn("Standard report backfill: no active blueprint");
          return;
        }

        console.log("🔧 Standard report backfill: triggering generation for", user.id);
        localStorage.setItem(LS_KEY(user.id), String(Date.now()));

        const result = await aiPersonalityReportService.generatePersonalityReport(
          bpRes.data,
          language,
        );
        if (result.success) {
          console.log("✅ Standard report backfill: generated");
        } else {
          console.error("❌ Standard report backfill failed:", result.error);
        }
      } catch (e) {
        console.error("❌ Standard report backfill exception:", e);
      }
    })();
  }, [user?.id, language]);
}