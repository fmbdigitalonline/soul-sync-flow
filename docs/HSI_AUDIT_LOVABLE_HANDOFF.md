# Handoff — complete the HSI audit (production half)

**For:** Lovable · **From:** Claude, branch `claude/phase-2-constitution-audit-ljvcov`
**Read first:** `docs/HSI_PRODUCTION_WIRING_AUDIT.md` (the static half) and `SOULSYNC_RUNTIME_CONSTITUTION.md` (the governing law).

I completed the parts answerable from code. Two things need your access, not mine: **the database** and **edge-function invocation logs**. This handoff is evidence-gathering plus one schema repair. It is **not** authorisation to re-plumb the reply path.

---

## What is already established (do not re-derive)

1. Only two code paths insert into `hermetic_structured_intelligence`. One (`src/services/hermetic-intelligence-extractor.ts`) has **zero consumers**. The other, `supabase/functions/extract-hermetic-intelligence`, is invoked from three dev panels only — `HermeticPipelineValidator.tsx`, `ExtractionControlPanel.tsx`, `ServiceTester.tsx` — all under `/test-hermetic-intelligence`, a route with no link from any navigation.
2. `buildStructuredIntelligenceSpine` reads **5 of 19** dimensions; the other 14 cannot reach a reply.
3. The spine's worst-case serialisation is 1,486 chars against `CHAR_CAP = 1400`, and the trim loop pops from the end — so `crisis_handling` is dropped systematically, not randomly.
4. Per-turn context is ~74% raw framework material, ~22% personal model. The framework inputs are uncapped; the synthesis has a hard ceiling.

---

# Task 1 — Population (SQL, read-only)

```sql
-- coverage
select count(*) as hsi_rows, count(distinct user_id) as users_with_hsi
from hermetic_structured_intelligence;

select count(distinct user_id) as users_with_report from personality_reports;

-- freshness
select date_trunc('month', created_at) as month, count(*)
from hermetic_structured_intelligence group by 1 order by 1;

-- confidence distribution
select round(extraction_confidence::numeric, 1) as confidence, count(*)
from hermetic_structured_intelligence group by 1 order by 1;

-- extraction versions in the wild
select extraction_version, count(*)
from hermetic_structured_intelligence group by 1 order by 2 desc;
```

**Report:** the raw numbers. Do not interpret them into a plan.

---

# Task 2 — Dimension integrity (SQL, read-only)

`jsonb_typeof(v) = 'string'` is the scalar-error-string check from open bug 12: a dimension holding a bare string is damaged, not merely empty. That distinction is the point of this query.

```sql
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

**Flag especially** the five the reply path actually reads: `execution_bias`, `behavioral_triggers`, `temporal_biology`, `identity_constructs`, `crisis_handling`. A high `scalar_string` count on any of those means the Twin's personal model is damaged where it is actually used.

---

# Task 3 — Invocation logs

From edge-function logs, for the last 90 days:

- `extract-hermetic-intelligence` — invocation count, success/error split. **The static analysis predicts near-zero and only from manual dev-panel use. Confirm or refute it.**
- `unified-brain-processor` — look for errors on the `hermetic_structured_intelligence` select (see Task 4). Expect a PostgREST column error on every call that reaches line 407.
- `companion-oracle-conversation` — the `📐 SPINE: ~N tokens injected` breadcrumb. Report the distribution of `lines:` and `source:`. This tells us how often the spine is present at all, and whether it comes from the blob column or the typed table.

**If the logs contradict the static analysis, the logs win** (rule 8). Say so plainly.

---

# Task 4 — One repair (code change, authorised)

`supabase/functions/unified-brain-processor/index.ts:407-408` selects eight columns:

```
identity_constructs, behavioral_triggers, attachment_style, cognitive_functions,
shadow_patterns, core_wounds, defense_mechanisms, communication_style
```

**Four do not exist** in `hermetic_structured_intelligence`: `shadow_patterns`, `core_wounds`, `defense_mechanisms`, `communication_style`. PostgREST rejects a select naming unknown columns, so this returns an error — the unified brain receives **no** HSI at all, not a partial row.

Change the select to the four columns that exist:

```
identity_constructs, behavioral_triggers, attachment_style, cognitive_functions
```

Then check the consuming code for references to the four removed names and handle their absence explicitly rather than letting them read as `undefined`.

**Why this is authorised ahead of the rest:** it is a repair of a read that is failing today, not a change to what the Twin sees. Nothing downstream gains data it did not previously have — it stops losing data it was supposed to have. If the consumer genuinely needs shadow/wound/defense data, that is a schema question, and it goes back to the founder rather than being invented in a migration.

Migration checklist for this change, in your PR (Runtime Constitution rule 4):
1. What replaces it? — the corrected four-column select.
2. What gets removed? — four non-existent column names.
3. Who owns this? — `unified-brain-processor`, sole reader of these columns.
4. How do we know the old path is dead? — the PostgREST error disappears from the logs.
5. What test proves it? — a successful invocation returning a row, in the logs.

---

# What NOT to do in this handoff

Explicitly out of scope. Doing any of these before the evidence lands would repeat the pattern three audits have already found:

- ❌ Do not raise `CHAR_CAP` or uncap the spine.
- ❌ Do not add dimensions to `buildStructuredIntelligenceSpine`.
- ❌ Do not wire `extract-hermetic-intelligence` into onboarding or report generation.
- ❌ Do not change `calculateContextBudget`.
- ❌ Do not touch `factsSection`, `extractFirstSentences`, or the retrieval path.
- ❌ Do not build a synthesis engine, policy layer, or new service.
- ❌ Do not apply `docs/RUNTIME_CONSTITUTION_V2_SPEC.md` in the same PR — that is separate work with its own acceptance tests.

The reason for the ceiling: if the tables turn out to be empty or damaged, wiring them ships a Twin that speaks from nothing, confidently. Population and integrity decide whether the next step is **wire**, **repair**, or **replace parts** — and only evidence gets to decide that.

---

# Deliverable

A PR containing:

1. The Task 4 repair, with its five migration answers.
2. A markdown file — `docs/HSI_AUDIT_PRODUCTION_EVIDENCE.md` — holding the raw output of Tasks 1–3. Numbers and log excerpts, no interpretation.
3. One sentence at the end naming which verdict the evidence supports: **wire**, **repair**, or **replace parts** — and nothing beyond that sentence.

Then stop. The founder decides what happens next.
