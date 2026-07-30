# HSI Production Wiring & Reply-Path Audit

**Scope:** the four questions authorised. **Method:** static analysis of the repo at `6f2d405`, arithmetic on the code's own constants. **Not method:** production data — I have no database access from this session.

**Runtime Constitution rule 10 applies to this document: it is a document, not ground truth.** Q1 and Q2 need production evidence before any irreversible action. Q3 and Q4 are deterministic from code and stand on their own.

| Q | Answerable statically? | Status |
|---|---|---|
| 1 · Production population | Invocation paths yes; row counts no | **Answered (paths) + SQL supplied** |
| 2 · Dimension integrity | No — needs rows | **SQL supplied, not answered** |
| 3 · Reply-path survival | Yes, fully deterministic | **Answered** |
| 4 · Competing-input ratio | Yes, from the code's own limits | **Answered** |

---

# Q1 · Production population

## What writes the table

Exactly two code paths `INSERT` into `hermetic_structured_intelligence`:

| Writer | Line | Reachable? |
|---|---|---|
| `supabase/functions/extract-hermetic-intelligence/index.ts` | 127-128 | only via the invocations below |
| `src/services/hermetic-intelligence-extractor.ts` | 116-117 | **0 consumers** — nothing imports this service |

## What invokes the extractor

| Caller | File | Nature |
|---|---|---|
| `HermeticPipelineValidator.tsx:239` | `src/components/hermetic-test/` | **dev test panel** |
| `ExtractionControlPanel.tsx:50` | `src/components/hermetic-test/` | **dev test panel** |
| `hermeticIntelligenceService.triggerExtraction()` | `src/services/hermetic-intelligence-service.ts:303` | called only by `ServiceTester.tsx` and `ExtractionControlPanel.tsx` — **both dev test panels** |

**Zero edge functions invoke it.** Onboarding does not. Report generation does not. `hermetic-background-orchestrator`, `hermetic-job-creator` and `hermetic-recovery` do not. There is no retry path because there is no automatic path to retry.

All three callers live under `src/components/hermetic-test/`, mounted at route `/test-hermetic-intelligence` — which has **no link from any navigation surface**, exactly like the three unreachable productivity environments found in the previous audit.

> **Finding 1.** The synthesis engine is a technical asset, not a production capability. The only way a user's HSI row exists is if someone opened a debug page and pressed a button.

## New defect found while tracing readers

`unified-brain-processor/index.ts:408` selects eight columns:

```
identity_constructs, behavioral_triggers, attachment_style, cognitive_functions,
shadow_patterns, core_wounds, defense_mechanisms, communication_style
```

**Four of those do not exist** in the table (`shadow_patterns`, `core_wounds`, `defense_mechanisms`, `communication_style`). PostgREST rejects a select naming unknown columns, so this read returns an error, not a partial row.

> **Finding 2.** The unified brain receives **no** HSI at all. This is a second, previously unrecorded instance of the column drift already logged as open bug 13 — and unlike bug 13 (which silently dropped two dimensions on write) this one fails the entire read.

## SQL for the production half — please run

```sql
-- 1. coverage: how many users have a row at all
select count(*) as hsi_rows,
       count(distinct user_id) as users_with_hsi
from hermetic_structured_intelligence;

select count(distinct user_id) as users_with_report
from personality_reports;

-- 2. freshness
select date_trunc('month', created_at) as month, count(*)
from hermetic_structured_intelligence group by 1 order by 1;

-- 3. confidence distribution
select round(extraction_confidence::numeric, 1) as confidence, count(*)
from hermetic_structured_intelligence group by 1 order by 1;
```

---

# Q2 · Dimension integrity — NOT ANSWERED

This requires rows. Per rule 8, I will not estimate it. Run this and the audit can be completed:

```sql
-- populated / null / scalar-error-string rate for each of the 19 dimensions
select
  d.dim,
  count(*) filter (where v is not null and v::text not in ('null','{}','""')) as populated,
  count(*) filter (where v is null or v::text in ('null','{}','""'))          as empty,
  count(*) filter (where jsonb_typeof(v) = 'string')                          as scalar_string,
  count(*) filter (where jsonb_typeof(v) = 'object')                          as structured
from hermetic_structured_intelligence h
cross join lateral (values
  ('execution_bias', h.execution_bias), ('behavioral_triggers', h.behavioral_triggers),
  ('temporal_biology', h.temporal_biology), ('identity_constructs', h.identity_constructs),
  ('crisis_handling', h.crisis_handling), ('adaptive_feedback', h.adaptive_feedback),
  ('attachment_style', h.attachment_style), ('career_vocational', h.career_vocational),
  ('cognitive_functions', h.cognitive_functions), ('compatibility', h.compatibility),
  ('financial_archetype', h.financial_archetype), ('goal_archetypes', h.goal_archetypes),
  ('health_wellness', h.health_wellness), ('identity_flexibility', h.identity_flexibility),
  ('internal_conflicts', h.internal_conflicts), ('karmic_patterns', h.karmic_patterns),
  ('linguistic_fingerprint', h.linguistic_fingerprint),
  ('metacognitive_biases', h.metacognitive_biases), ('spiritual_dimension', h.spiritual_dimension)
) as d(dim, v)
group by d.dim order by populated desc;
```

`jsonb_typeof(v) = 'string'` is the scalar-error-string check from open bug 12. A dimension with a high `scalar_string` count is damaged, not merely empty.

---

# Q3 · Reply-path survival — ANSWERED

## The funnel

```
19 stored dimensions
  → 5 read by buildStructuredIntelligenceSpine     (74% discarded here)
  → 6 serialised lines
  → trimmed from the END until ≤ 1400 chars
  → 1 system message
```

`buildStructuredIntelligenceSpine` reads only:
`execution_bias · behavioral_triggers · temporal_biology · identity_constructs · crisis_handling`

**Fourteen dimensions never reach the conversation under any condition** — including `internal_conflicts`, `goal_archetypes`, `metacognitive_biases`, `financial_archetype` and `career_vocational`, which are precisely the dimensions a question like *"how do I become a millionaire"* would need.

## The cap, computed from the code's own clip limits

| Line | Source clip | Chars |
|---|--:|--:|
| header | — | 166 |
| `- Execution style:` | 180 | 199 |
| `- Completion pattern:` | 180 | 202 |
| `- Avoidance patterns:` | 3 × 90 | 298 |
| `- Cognitive peaks:` | 3 × 70 | 235 |
| `- Core narrative:` | 200 | 218 |
| `- Bounce-back ritual:` | 140 | 162 |
| **worst case** | | **1486** |

`CHAR_CAP` is 1400. The loop pops from the **end**.

> **Finding 3.** At full richness the block is 86 characters over budget and **`crisis_handling` is dropped systematically** — always, and only, the last dimension. It is not random truncation: it is a fixed serialisation order meeting a fixed cap, so one specific dimension is deleted whenever the other five are well populated. The richer the user's data, the more certain the loss.

---

# Q4 · Competing-input ratio — ANSWERED

## Fixed instruction blocks (measured from the literals)

| Block | Chars |
|---|--:|
| Hermetic primer scaffolding | 3,631 |
| Role block (ORACLE) | 1,926 |
| VOICE CHARTER | 1,803 |
| UNIVERSAL RULES | 1,585 |
| RESPONSE DISCIPLINE | 857 |
| ACTION CHARTER | 818 |
| RESPONSE GUIDELINES | 613 |
| SESSION CLOSE RULE | 503 |
| **total instruction** | **11,736** |

## Personal context on a default (MIXED) turn

Budgets are the code's own (`calculateContextBudget` default: 2 hermetic sections, 3 vector chunks, 2 behavioural memories).

| Input | Chars | Share |
|---|--:|--:|
| Vector chunks (uncapped, 3) | 2,100 | 26.0% |
| Hermetic report excerpts | 2,080 | 25.7% |
| Raw framework facts (**uncapped**) | 1,800 | 22.3% |
| **HSI synthesis (capped 1,400)** | **1,400** | **17.3%** |
| **Behavioural memories (2)** | **400** | **5.0%** |
| Profile lines | 300 | 3.7% |
| total | 8,080 | |

> **Finding 4.** The personal model — synthesis plus lived evidence — is **22.3%** of personal context. Raw framework material is **74.0%**. And the split is structural, not incidental: the framework inputs are *uncapped* while the synthesis carries a hard 1,400-character ceiling. As a user's blueprint grows richer, framework share rises and synthesis share falls.

Two aggravating factors already established:

- Behavioural patterns are filtered to `importance_score > 5` after the 2-item budget, so **patterns can be zero**. When memories and patterns are both zero, `hasNoMemory` strips the BEHAVIORAL EVIDENCE step out of the role block — the reply becomes **100% framework-derived by construction**.
- The Hermetic excerpts come from `extractFirstSentences(section, n)` — the **first** n sentences, not the most relevant. Of an 80,000-word report the reply sees the opening lines of 2–5 sections. This is truncation, not retrieval, which is why scanning the whole report would not change the answer.

## Why Human Design specifically

The always-on profile block renders three descriptions:

| System | Value | Kind |
|---|---|---|
| MBTI | `creative and inspiring explorer` | **adjective** |
| Sun sign | `innovative and humanitarian vision` | **adjective** |
| Human Design | `invitation-based wisdom sharing` | **strategy** |

Numerology is absent from the profile block entirely. And `generateVoiceStyle` adds two behavioural directives for Projectors — *"Recognize their need for recognition and invitation"*, *"Honor their role as a guide and wise advisor"* — that no other system receives.

> **Finding 5.** When the user asks a *how* question, Human Design is the only input in the profile that answers a *how*. This is prompt asymmetry, not model anchoring — a more actionable diagnosis, because it has line numbers.

---

# Conclusion

Of the three permitted verdicts — **Wire · Repair · Replace** — the static evidence supports:

## **WIRE, then REPAIR. Do not replace.**

**Wire** (Findings 1, 4, 5): the engine has no production invocation, its output is capped below the material it competes with, and 14 of 19 dimensions never reach the reply path. None of that is a design fault; it is an unfinished connection.

**Repair** (Finding 2, plus open bugs 12 and 13): column drift breaks the unified-brain read entirely and silently dropped two dimensions on write. Schema alignment is required before wiring, or the wiring carries the damage forward.

**Do not replace**: nothing in the static evidence suggests the stored synthesis is unusable. Whether it is *populated* and *valid* is Q2, and Q2 is unanswered.

## Gate before any of it

Per rule 4, no removal and no re-plumbing until the Q1/Q2 SQL has run. Specifically:

- If `users_with_hsi ≈ 0`, this is not a wiring job first — it is an extraction job first, and wiring an empty table would ship a Twin that speaks from nothing.
- If `scalar_string` rates are high on the five dimensions the spine reads, repair precedes wiring.

## What this audit deliberately does not propose

No new engine. No policy layer. No new permanent service. No retrieval redesign. No blanket increase to context budgets.

And explicitly **not** "uncap all 19 dimensions": that would repeat the current mistake with a better source. The target is *relevant* synthesised evidence per turn — a financial question wants `financial_archetype`, `goal_archetypes`, `execution_bias`, `internal_conflicts`; a relationship question wants `attachment_style`, `compatibility`. **Relevance selection is a separate problem from storage completeness and should be audited separately**, after Q2 establishes that the storage is sound.
