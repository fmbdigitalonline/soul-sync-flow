# Fix: white screen on /companion

## Cause (verified)
`src/components/hacs/HACSChatInterface.tsx` line 149 calls `useHermeticReportStatus()`, but that file has no import for it. The hook exists at `src/hooks/use-hermetic-report-status.ts` and returns `isGenerating` / `progress`; every other consumer (FloatingHACSOrb, PersonalityReportViewer, use-hacs-insights) imports it from `@/hooks/use-hermetic-report-status`. The missing import throws on mount, which is the ErrorBoundary screen you see.

## Change
Add one import line to `HACSChatInterface.tsx`:

```ts
import { useHermeticReportStatus } from "@/hooks/use-hermetic-report-status";
```

No other files, no logic, no hooks internals, no edge functions.

## Verification
Run the TypeScript check, then load `/companion` headless and confirm the chat renders and the ReferenceError is gone from the console.
