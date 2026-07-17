# Intelligence Wiring Map — the nervous-system audit

*Companion to `PHASE2_WIRING_MAP.md` (which covered Dreams/journey/productivity/
growth). This map covers the intelligence layer itself: HACS, ACS, memory,
personality/hermetic, autonomy/proactive. Four read-only source audits,
Jul 16, 2026. Nothing was fixed; every bug here is reported per rule 2.*

**Why this exists (founder, Jul 15):** "we seem to sometimes not utilize every
neuron the system has, and reinvent the wheel." Confirmed. This map is the
anti-reinvention tool: before building any new classifier, model call, or
engine, consult §6 (reuse map) and §7 (registry of the dead).

---

## 1. Liveness ground truth

Routed surfaces (`src/App.tsx:66-152`): `/` (Index), `/auth`, `/onboarding`,
`/companion` (Coach), `/blueprint`, `/profile`, `/reports/view/:jobId`.
Everything else redirects to `/companion`; debug pages are DEV-gated.

**The live conversation turn:** `Coach.tsx` → `useHACSConversationAdapter`
→ `companion-oracle-conversation` (oracle), with `hacs-intelligent-conversation`
as the *error fallback only*. `FloatingHACSOrb` has **zero importers** — the
entire chain reachable only through it is dead. `/dashboard` is not routed —
everything mounted only there is dead.

## 2. Layer verdicts (one line each)

| Layer | Verdict |
|---|---|
| ACS (client stack) | **Dead end-to-end.** Keyword-counter detection, patent-evidence harnesses, config endpoints that don't exist. Nothing load-bearing. |
| Live turn-state detection | Three parallel detectors run per turn: nano `classifyIntent` (new, primary), `_shared/conversation-phase-tracker` (regex clusters — its *closure*/*meta_dialogue* handling IS load-bearing), client `conversation-state-service` (redundant). |
| HACS "intelligence" | A counter, not learning — four writers with fixed increments/keyword bonuses; the one **validated** path (`hacs-response-analysis`, LLM judge) is dormant. Level number is meaningless; the judge is gold. |
| Memory | One authoritative store does not exist: conversation text persisted in **4 shapes** per turn; semantic message search **broken since birth**; TMG = one real tier (hot cache) + two aspirational; the thread bug is a 3-defect chain (§4.1). |
| Personality engines | Mostly legacy/hollow (vector = adjective generator; seven-layer = lookup-table sketch); the real assets are the fusion-service conflict→clarifying-question machinery and the blueprint-facts ETL + pgvector retrieval. |
| Hermetic pipeline | Live and real (relay-race orchestrator) BUT: structured intelligence stored as prose blobs (JSON.parse always fails), HSI table filled **manual-only**, all 20 analyst edge functions dead (dimensions recreated as inline prompts). |
| Autonomy/proactive | Decision cores are `Math.random()` (autonomous-orchestrator, insight selection); generators/budgets/ledgers are real but disconnected; **no scheduler exists anywhere** — every "autonomous" trigger ever built was a client-side random roll. |
| XP | Real ledger (`user_xp_events`), split brain: server and client disagree on init (1200 vs 0), percent math (sigmoid vs linear), caps, and gates. Live companion turns award nothing client-side; unified-brain double-run awards HPP **twice**. |

## 3. Anatomy of one companion turn (why it feels heavy)

Seven distinct writers touch 9+ tables per exchange:
1. `conversation_memory` row A — client, `session_id=threadId`, **`mode` defaults to `'guide'`** ← bug §4.1
2. `conversation_memory` row B + `hacs_conversations` — client, `session_id=companion_${userId}`, `mode='companion'`
3. `conversation_messages` — oracle inline dual-write (the dedicated `store-conversation-message` fn is dead)
4. `message_embeddings` — written every turn, **never readable** (§4.4)
5. `unified-brain-processor` run #1 — client `BackgroundIntelligenceService` (its stored product is read by nobody on the live path)
6. `unified-brain-processor` run #2 — oracle `waitUntil` (same tables again; double HPP XP)
7. Conversation state persisted twice (client → `user_activities`, oracle → `conversation_state_tracking`)

Plus three intent/state detectors on the same message (§2). Retrieval sidecar
runs with **no timeout** inside the turn (`oracle:1319`).

## 4. Bugs found in live paths (report, don't fix — prioritized)

1. **Thread memory (open bug #1, SERIOUS) — root-caused, 3 defects:**
   (a) the live writer `conversationMemoryService.storeMessage`
   (conversation-memory-service.ts:166-177) never sets `mode` → rows default
   `'guide'`; the oracle's STEP 1 reads `.eq('mode','companion')`
   (oracle:1102-1110) → **misses permanently, every turn**. (b) STEP 2
   fallback loads the latest `mode='companion'` row for the user *of any age*
   (oracle:1122-1146) → the 6-day-old transcript. (c) client
   `getProgressiveIntelligentContext` is a hardcoded-empty stub
   (conversation-memory-service.ts:229-254) → `conversationHistory: []` sent
   every turn. **Fix surface:** make `conversation_messages` (already
   dual-written, keyed by threadId) the authoritative read; set
   `mode:'companion'`+threadId in the writer during migration; delete the
   any-age fallback. Also: `conversation_threads` rows are never closed —
   one eternal thread per mode.
2. **Structured-intelligence data-contract fracture:** the live orchestrator
   requests 700-900 words of PROSE per dimension, then
   `buildStructuredIntelligence` does `JSON.parse` which **always fails** →
   `{analysis: "<prose>"}` blobs (hermetic-background-orchestrator:1525-1538).
   The oracle spine expects typed fields (`execution_bias.preferred_style`);
   only legacy rows have them. The only typed schema in the repo sits in the
   DEAD client orchestrator (`hermetic-report-orchestrator.ts:671-745`).
   **And** `extract-hermetic-intelligence` (which fills the HSI table the
   spine + decompose read) is **manual-only** — not wired into finalize.
3. **`cognition_mbti` never populated:** hardcoded `"Unknown"` at
   `blueprint-service.ts:351`; the correct mapper exists
   (`mbti-data-repair-service.ts:85-121`) but reads the wrong table
   (`blueprints` vs `user_blueprints`) → no-ops. Hermetic pipeline has no
   `likelyType` fallback (unlike oracle/openai-agent) → reports and writing
   styles generated with MBTI "Unknown"; `cognitive-functions-analyst` +
   the live inline prompt have **no insufficient-data branch** → fabrication
   risk realized as stored fact.
4. **`search-similar-messages` broken as written** (invalid PostgREST vector
   syntax, index.ts:40-53) → always 500 → semantic recall silently `[]`
   forever. The correct SQL fn `search_similar_messages` exists unused
   (migration 20250807183115:234-253).
5. **`hacs-coach-conversation` cannot boot** — duplicate
   `const supabaseServiceKey` (index.ts:170,172), SyntaxError. Unnoticed
   because its caller is unrouted.
6. **Oracle behavioral-memory scorer reads a nonexistent column**
   (`memory_content` vs actual `memory_data`, oracle:611-655) → relevance
   always 0, caught-and-swallowed.
7. **Fallback second brain:** on oracle failure, users silently drop to
   `hacs-intelligent-conversation` — its own duplicated (stale) Voice
   Charter, own store, own intelligence writes. Divergent personality on
   exactly the turns where the system already failed once.
8. **XP split brain** (§2 table). Also `immediate-response-service` output is
   computed then **discarded** (adapter:458-478); `hermeticAdvice` behind the
   one-insight budget is 9 canned strings (`hermetic-pattern-cache.ts:51-68`),
   not the hermetic report.

## 5. The organs that are GOLD (dormant or misplaced, engine-ready)

- **`hacs-response-analysis`** — strict-JSON LLM judge; only writes when
  `validatedLearning: true`. The one honest learning path in the stack.
- **`generateAutonomousQuestion`** (hacs-intelligent-conversation:552-732) —
  adaptive dimension targeting, difficulty ladder, dedup.
- **`_shared/conversation-phase-tracker`** — `allowed_next_clusters` +
  opening rules = a hand-written "legal next moves" prior with evidence.
- **`semantic-blueprint-search`** (91 lines) + `blueprint_text_embeddings`
  (pgvector over the 92k-word hermetic report) + `match_blueprint_chunks` RPC.
- **`blueprint_facts` ETL + `fetchFacts`** (retrieval-sidecar:73-184) — typed,
  citable first-layer facts.
- **`store-conversation-message`** (dead) — auth'd idempotent event upsert
  with client-id reconciliation.
- **`memory-service`** — honest CRUD: `micro_action_reminders` lifecycle,
  `generateWelcomeMessage` ("last time we spoke about X").
- **`user_xp_events`** — append-only ledger with `kinds[]/quality/note`.
- **`SubconsciousOrbController`** — clean state machine with listeners,
  auto-timeout, thin hook.
- **`personality-fusion-service.detectConflicts` + clarifying questions**
  (:174-243) — framework-disagreement → targeted question.
- **`regenerate-quotes`** — the one working "generate personality-informed
  copy offline, store, surface later" pattern.
- **`conversational-assessment`** — twin-driven transcript → strict-JSON →
  typed table, end-to-end.
- **Coach.tsx `insightBudgetUsedRef`** — the one-insight budget exists;
  needs to move server-side and become durable.

## 6. Reuse map — roadmap job → existing organs (consult BEFORE building)

| Job | Use these | Don't build |
|---|---|---|
| **ChoiceCard dealer** | The proven OfferCard rail (oracle:2316-2460) generalized: closed chip registry as tool enum; phase-tracker `allowed_next_clusters` as the legal-moves prior; `classifyIntent` decline verdict (already suppresses force-triggers) ; crisis suppression from HSI `crisis_handling` + per-turn shadow cue (both already loaded in-turn); declined-card back-off pattern from production-acs-service:178-185; timing/style maps from personality-engine:176-205 + unified-brain-context:259-309. `autonomous-orchestrator` itself: interface worth copying, decision core is `Math.random()` — discard. | A new intervention engine. |
| **Why-line retrieval** | `semantic-blueprint-search` + `match_blueprint_chunks` (corpus already embedded); `blueprint_facts` for claims with `citations`. Add the timeout the sidecar never had (~700ms race, fall back to no citation). | A 4th corpus-search implementation (already 4 exist). |
| **Conversational MBTI** | `conversational-assessment` pattern (transcript→JSON→table) + `generateAutonomousQuestion` (adaptive asking) + `hacs-response-analysis` (validated scoring) + `mbti-data-repair-service.buildMBTIStructure` as writer (after table fix) + fusion-service clarifying questions for tie-breaks. | A new assessment engine. |
| **Day-2 proactive message** | Generator: `hacs-autonomous-text` (needs de-hardcoding 'ENFP Aquarius' fallback). Copy pattern: `regenerate-quotes`. Composer: `generateWelcomeMessage`. Delivery: `initiateFirstContact` pattern (speak-first client injection). Open-loop source: `conversation_insights` (written every session, barely read). Budget: smart-insight-controller cooldowns, persisted. **Missing piece everywhere: a real scheduler** (pg_cron or login-time check) — build only that. | Generator, composer, budget, delivery. |
| **One-insight budget** | Coach.tsx session ref (exists) → move into oracle (it already tracks once-per-session offer state); durable via DB. Note: `hacs-authentic-insights` is a second UNBUDGETED writer to `conversation_insights` — gate or retire. | A new budget system. |
| **Fork telemetry** | `store-conversation-message`'s idempotent upsert shape repointed at a `choice_events` table (or `user_xp_events` kinds `fork.dealt/chosen/declined`); the oracle's confirm/decline classifier already judges reactions — persist per card. Downstream sink: `pie_predictive_rules` (real code, dormant). | New event infra. |
| **FocusCard sessions** | `SubconsciousOrbController` state machine (rename states: idle→armed→running→checkpoint→complete); `hacs-coach-conversation`'s productivity state detection + style prompts (fix the SyntaxError or lift the code out); acs-enhanced-state-detection's idle timer for "session went quiet" nudges; PomodoroTimer (first map) as timer seed. | A new session framework. |
| **First-contact fact selection** (bug 10) | All plumbing exists unwired: deterministic selector over `blueprint_facts` ranked by tension class (authority > profile > gate-shadow), ~50 lines next to oracle:2015; spine takes over when HSI exists. | LLM-only selection over thin context (that's the current bug). |
| **Report fact fidelity** | Insert a `fact_fidelity` relay stage before `finalizeReport`'s insert (orchestrator:1173) validating claims against `blueprint_facts`; reuse the dead orchestrator's typed `getDimensionSchema` to make dimensions request real JSON. | A post-hoc runtime guard (too late by then). |
| **Today pin** | `micro_action_reminders` CRUD (working, RLS'd) + first map's date-window filter + `conversation_state_tracking` for "where we left off". | New reminder store. |

## 7. Registry of the dead (do not rebuild; retire deliberately)

**Dead client stacks:** entire ACS client stack (scheduler, enhanced-state,
evidence-collection, real-ai-integration, production-acs + both hooks),
autonomous-orchestrator + use-autonomous-orchestration,
predictive-intelligence-engine, enhanced-pie-agent-service (16 stub methods),
voice-service + voice-token-generator, learning/shadow-xp-integration
(clean but unimported), tmg-patent-evidence (pollutes real tables with
synthetic rows), enhanced-memory-coach-integration, personality-error-handler,
personality-enrichment-service, hermetic-report-orchestrator (client),
intelligence-report-orchestrator, hermetic-intelligence-extractor
(keyword-grep fake), seven-layer engine (practically), FloatingHACSOrb chain,
UnifiedCoachInterface, use-hacs-pure/coach/growth/micro-learning/autonomy/
diagnostics hooks.

**Dead edge functions:** all 20 `*-analyst` + `ai-analyst-call`,
store-conversation-message (shape worth reusing), hacs-autonomous-text
(untriggered), hacs-coach-conversation (broken), hacs-growth-conversation
(unrouted UI), ai-coach/ai-coach-stream on the twin path (fallback layer for
legacy coach flows only; client-supplied system prompts = trust smell).

**Duplicates to collapse (when scheduled, not ad hoc):** two conversation
brains (oracle vs hacs-intelligent-conversation, duplicated Voice Charter);
double unified-brain run per turn; three turn-state detectors; four
corpus-search implementations; four conversation-text stores; two
shadow-detector copies (client vs `_shared`); two XP maths; two TMG copies;
two module-score taxonomies writing one column; two `DialogueState` type
definitions; client hermetic-intelligence-bridge duplicating oracle server
context assembly.

## 8. Proposed rule of engagement (for v2.3 ratification, founder's call)

> **Consult before building:** any new classifier, model call, engine, store,
> or scheduler must name — in the PR description — which assets in
> `INTELLIGENCE_WIRING_MAP.md` §5-6 were considered, and why each doesn't
> fit. Bypassing a live organ is a decision with a stated reason, never an
> accident. New intelligence that duplicates a §7 corpse must instead revive
> or formally retire it.

*Maintenance: this map was generated from source on Jul 16, 2026. It drifts
the moment code changes; re-verify load-bearing claims (file:line) against
source before acting on them (constitution rule 8).*
