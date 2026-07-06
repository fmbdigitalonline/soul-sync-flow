# Wire hermetic deep-report generation into new onboarding

## Found
The old steward activation button (`StewardActivationCompletionScreen` → `FloatingHACSOrb` → `completeIntroductionWithReport` in `src/hooks/use-steward-introduction-enhanced.ts` line 229) calls:

```ts
hermeticPersonalityReportService.generateHermeticReport(blueprint, language)
```

from `src/services/hermetic-personality-report-service.ts` (the `generateHermeticReport` method, line 89). That's the single call that kicks off the deep hermetic report job.

## Change (one file only)
**`src/pages/OnboardingFlow.tsx`** — after `saveBlueprintData` succeeds (line 166), next to the existing `trigger-blueprint-processing` invoke block (lines 169–175), add a fire-and-forget call to `hermeticPersonalityReportService.generateHermeticReport(data, language)` with `.catch` logging. Non-blocking, no awaits, no other logic touched.

Specifically:

1. Add import: `import { hermeticPersonalityReportService } from "@/services/hermetic-personality-report-service";`
2. Pull `language` from the existing `useLanguage()` hook (add the hook call if not already present in the component).
3. Insert immediately after the oracle warm-up block:

```ts
// Kick off the hermetic deep-report in the background (same call the old
// "Activate Steward" button used).
hermeticPersonalityReportService
  .generateHermeticReport(data, language)
  .catch((e) => console.warn("Hermetic report generation deferred:", e));
```

Nothing else changes — no UI, no flow, no gating on the result.

## Verification
- Build passes.
- Fresh signup → onboarding → confirm console shows the report job was dispatched (or the deferred warning), and that no error blocks the casting-reveal screen.
