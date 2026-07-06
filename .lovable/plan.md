## What happened

Fresh signup landed on the old 9-step wizard, not the new 3-screen flow. In the code, `/onboarding` is already wired to `OnboardingFlow` (the new one) and `Auth.tsx` sends new signups there. So the routing itself is correct — what you saw is almost certainly one of these three, in likelihood order:

1. **You tested the published site, not the preview.** Frontend changes on Lovable only go live after clicking **Publish → Update**. Backend (edge functions, migrations) deploys automatically; the new `OnboardingFlow.tsx`, chat wiring, and DreamCard are frontend and do not ship to `soul-sync-flow.lovable.app` until you republish. The preview URL (`id-preview--…lovable.app`) always has the latest frontend.
2. **Email-confirmation link opened in a browser without the new build cached** — same root cause as #1 if you clicked the email link on the published domain.
3. Real bug (a stale route or a redirect I haven't found). I don't see evidence of this yet, but I'll rule it out with one check.

## Plan (once you switch me to build mode)

### Step 1 — Verify which build you saw (30 seconds, no code)

Open the **preview URL** in an incognito window, sign up fresh, and confirm the first screen is the birth-data form (name + date + time + place + "I don't know my time" chip). If yes → the code is fine, the "old flow" was just the un-republished production site, and the fix is: click **Publish → Update**.

### Step 2 — If preview also shows the old wizard

Then it's a real routing bug and I will:

- Grep every redirect/guard that can send an authenticated user without a blueprint to a route other than `/onboarding` (Index, ProtectedRoute, Dashboard, any "needs onboarding" hook).
- Check the email-confirmation `emailRedirectTo` actually lands on `/onboarding` and not through an intermediate page.
- Delete or unroute the legacy `src/pages/Onboarding.tsx` so it cannot be reached even accidentally.

### Step 3 — Give you one clean test recipe

A single copy-paste checklist that covers all three things you want to verify in one fresh account, in order:

1. **90-second onboarding** — fresh email on preview URL, stopwatch from submit-signup to landing in chat. Screens should be exactly: birth form → casting reveal with fragments → "Meet your companion" → chat.
2. **First contact + voice** — twin speaks first, references a real chart fact, then you send `"the job doesn't interest me, it's out of necessity and status."` — pass = ≤4 sentences, names "status", asks one question, no advice.
3. **Cards** — say `"I want to earn one million"` → answer its clarifying questions → say yes to break-down → a collapsed DreamCard with progress bar renders inline. If prose milestones appear instead, I check `companion-oracle-conversation` logs for the tool-call round and `user_goals` for a new row, and fix whichever side failed (most likely: Azure API version rejecting the `tools` param, or chat not in oracle mode).

### On the "which files to paste" question

You do not need to paste any files to me for testing — I can read the whole project. Only paste a file when: (a) you edited it in the Supabase dashboard directly (like the charter patch), or (b) you want me to review a specific version. For everything else, name the file and I'll open it.

### Deliverable of this plan

Either "publish and you're done" (if Step 1 passes) or a small routing fix + the legacy wizard removed (if Step 1 fails), plus the single test recipe above. DEV Note-Tested it -1 and two still old