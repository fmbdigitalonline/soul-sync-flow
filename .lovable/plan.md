## Goal

Keep the Coach "on stage" through the Pattern Scope route. Insert a Coach interpretation layer before any Life OS dashboard appears, and unify the conversational label voice across Steps 2 and 4.

## Scope

UI/presentation only. No changes to Life OS services, assessment engines, `useLifeOrchestrator`, or any edge functions. Reuses existing components — adds one new interpretation screen and rewords labels.

## Changes

### 1. New: Coach interpretation screen (Pattern Scope route)

New file: `src/components/Layout/panel/transform/TransformScopeInterpretation.tsx`

Renders before the three scope choices (currently in `TransformPatternScope` `chooser`/`scope_menu` stage). Structure:

```text
🌱 HELP ME TRANSFORM THIS
"<verbatim passage>"

Here's what I'm seeing
This pattern seems to affect a few areas of your life most:
  • <Domain A>
  • <Domain B>
  • <Domain C>            ← max 3, Rule of Three

I'd suggest starting with <Domain A> — it tends to
strengthen the others.

  [ Yes, start there ]        → routes to scope_domain_focus, seeded with Domain A
  [ Show me all areas ]       → routes to existing chooser (current 3 options)
  [ Tell me why ]             → expands a short rationale line, stays on screen
```

Data source (no new services):

- Primary domain: `transformFlow.seed.inferredDomain` (already populated by `transformation-intake-service.inferDomains`).
- Supporting domains: reuse `inferDomains` (already returns ranked list) — take the next 2 after the primary. If fewer than 3 signals, render whatever exists (1 or 2) with no padding, no fallback text.
- Rationale line: short static template based on the primary domain label (no new AI call). If the primary domain isn't inferable, this screen is skipped and the flow falls straight through to the existing chooser (fail-visible: no fake "Coach says…").

### 2. Wire the interpretation as the default scope entry

Edit `src/components/Layout/panel/transform/TransformPatternScope.tsx`:

- Add a new stage value `scope_interpretation` and make it the default when `stage === 'chooser' || stage === 'scope_menu'` AND at least one inferred domain exists.
- "Yes, start there" → `patchTransformFlow({ stage: 'scope_domain_focus', seed: { ...seed, inferredDomain: primary } })` so `LifeOperatingSystemDomainFocus` opens pre-scoped.
- "Show me all areas" → falls back to the current 3-button chooser (unchanged).
- "Tell me why" → toggles an inline rationale paragraph; no navigation.
- Back button from `scope_menu` and from the three sub-mounts returns to `scope_interpretation` (not the raw chooser) so the Coach voice frames the return trip too.

Add matching stage type to `WorkspaceContext.transformFlow.stage` union.

### 3. Add a lead-in line above the dashboards (Steps 5–9)

When the user does pick "Show me all areas" and lands in `scope_full` (Life OS Dashboard) or `scope_domain_focus`, prepend one line inside the panel host (in `TransformPatternScope`, above the mounted component):

```
I looked at this pattern across your Life OS. Here's what I found.
```

Single sentence, muted styling, no new component. Only rendered when entering from the transform flow (i.e., `transformFlow.route === 'pattern_scope'`).

### 4. Label consistency (Step 2 and Step 4)

Sentence intent card (Step 2) — reword the four intents to strip trailing "better" so the four are parallel:

- "Help me understand this better" → **"Help me understand this"**
- Others already parallel: keep as-is.

Update in `src/components/hacs/SentenceActionButtons.tsx` (and any i18n keys it reads). Verify no other component hardcodes the old string.

Pattern Scope chooser labels (Step 4) — keep current labels but this is the fallback path after "Show me all areas," so leave them; the Coach voice has already spoken on the interpretation screen. (Skipping the more aggressive "Help me see where this affects my life" rewording — it duplicates the interpretation screen's framing and adds no clarity here.)

## Files touched

**New**

- `src/components/Layout/panel/transform/TransformScopeInterpretation.tsx`

**Edited**

- `src/components/Layout/panel/transform/TransformPatternScope.tsx` — insert interpretation as default stage; add lead-in line on dashboard mounts; adjust back navigation.
- `src/contexts/WorkspaceContext.tsx` — extend `transformFlow.stage` union with `scope_interpretation`.
- `src/components/hacs/SentenceActionButtons.tsx` — drop "better" from the understand intent label.

**Untouched (explicit)**

- `transformation-intake-service.ts` — inferDomains already returns what we need.
- All Life OS components (`LifeOperatingSystemDomainFocus`, `ConversationalAssessment`, `LifeOperatingSystemDashboard`, `ProgressiveJourneyAssessment`).
- `PanelCoachDock`, `PanelTransformIntake` router, program flow, immediate flow.
- Any edge function.

## Guarantees

- No hardcoded fallbacks: if domain inference returns nothing, the interpretation screen is skipped and the original chooser renders — the user still gets a working path, just without the Coach framing (fail-visible per protocol).
- Panel state persists (uses existing `WorkspaceContext` sessionStorage pattern for `transformFlow`).
- No new AI calls, no new tables, no schema changes.
- No regressions to the immediate route, program route, or legacy `/spiritual-growth` page.---DEV NOTE:The developer is **structurally aligned**, but I would not approve this exact version yet. The UX direction is right; two pieces of copy currently claim more intelligence than the proposed data source can support.
  ## What is aligned
  The developer correctly understands that:
  - the Coach interpretation should appear before the dashboards;
  - the Rule of Three applies to both domains and actions;
  - the dashboard remains optional rather than becoming the immediate destination;
  - existing Life OS components should be reused rather than rebuilt;
  - the user can start with the recommended domain, inspect all areas, or ask for reasoning;
  - returning from deeper screens should restore the Coach framing;
  - the change is presentation and orchestration, not a new backend system.
  The proposed sequence is coherent:
  ```text
  Selected passage
  → Help me change this pattern
  → Coach interpretation
  → Recommended starting area
  → Optional Life OS evidence

  ```
  That is aligned with the intended experience.
  ## The main problem: domain inference is not Life OS analysis
  `inferDomains(passage)` appears to determine which domains are semantically related to the selected sentence.
  That does **not necessarily establish**:
  - which areas are actually affected in the user's life;
  - which area has the greatest gap;
  - which domain is the highest priority;
  - whether improving one domain will strengthen the others.
  Because of that, this copy overstates what happened:
  > “This pattern seems to affect a few areas of your life most.”
  And this is even riskier:
  > “I’d suggest starting with Domain A—it tends to strengthen the others.”
  The system has inferred topical relevance from the sentence. It has not necessarily analyzed the user's assessment results or calculated cross-domain impact.
  ### Make the interpretation truthful
  Use:
  > **Here’s what I’m seeing**  
  > This pattern appears most connected to:
  - Domain A
  - Domain B
  - Domain C
  Then:
  > I’d suggest starting with Domain A because it appears most closely connected to what you selected.
  That accurately reflects `inferDomains`.
  After `useLifeOrchestrator` or the Life OS dashboard has evaluated actual assessment data, the Coach may make stronger statements about gaps, priority, and broader impact.
  ---
  ## The dashboard lead-in also overclaims
  The proposed sentence is:
  > “I looked at this pattern across your Life OS. Here’s what I found.”
  That is only true if the system has actually compared the pattern against Life OS assessment data.
  If the user has merely opened a dashboard after passage-based domain inference, use:
  > **Here’s how this pattern connects to your Life OS.**
  Or:
  > **Let’s look at the areas of your Life OS that may relate to this pattern.**
  Once genuine assessment analysis has run, the stronger version becomes valid:
  > “I compared this pattern with your Life OS results. Here’s what stands out.”
  This distinction matters because the product's authority depends on never presenting inference as measured evidence.
  ## One implementation gap
  The current `TransformSeed` described earlier contains only:
  ```ts
  inferredDomain?: LifeDomain;

  ```
  But the proposed interpretation screen needs a ranked list of up to three domains.
  The plan says it will “reuse `inferDomains`,” but it should state exactly where those ranked results live.
  The cleaner option is:
  ```ts
  type TransformSeed = {
    inferredDomain?: LifeDomain;
    inferredDomains?: LifeDomain[];
  };

  ```
  Populate the ranked list once when the transformation seed is created. Then the panel reads the preserved result rather than calling inference again and potentially producing a different answer.
  If changing the seed is out of scope, the screen should display only the one reliably available domain rather than pretending it has three.
  ## “Tell me why” must explain inference, not invent causality
  A static rationale is acceptable, but it should describe why the sentence maps to the domain.
  For example:
  > This passage concerns how you respond to internal pressure and stuckness, which most directly connects to Personal Growth.
  It should not say:
  > Starting with Personal Growth will improve Energy and Relationships.
  unless that relationship comes from real Life OS data or an explicitly validated ruleset.
  ## Label alignment
  Dropping “better” is a good improvement:
  - Help me understand this
  - Help me change this pattern
  - Help me achieve this
  - Help me remember this
  They are grammatically parallel and intention-led.
  The Step 4 labels can remain shorter because they appear beneath a Coach-framed interpretation. That decision is reasonable and avoids repeating “Help me…” on every nested control.
  ## Verdict
  **UX architecture: aligned.**  
  **Navigation and progressive disclosure: aligned.**  
  **Reuse strategy: aligned.**  
  **Data-language honesty: needs correction.**
  I would approve it after changing three things:
  1. Replace “areas this affects most” with “areas most connected to this passage.”
  2. Replace “strengthens the others” with a rationale grounded in the passage-to-domain inference.
  3. Clarify how the ranked domain list is preserved and supplied to the new screen.
  With those corrections, the developer is fully aligned rather than merely directionally aligned.