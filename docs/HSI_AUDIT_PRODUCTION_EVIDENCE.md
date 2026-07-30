# HSI audit — production evidence

Raw output of Tasks 1–3 from `docs/HSI_AUDIT_LOVABLE_HANDOFF.md`. Numbers only.

## Task 1 — Population

| Metric | Value |
|---|--:|
| `hermetic_structured_intelligence` rows | 9 |
| distinct users with an HSI row | 1 |
| distinct users with a personality report | 48 |
| `personality_reports` rows | 116 |
| reports carrying `report_content->structured_intelligence` | 43 |
| distinct users with that blob | 29 |

All 9 HSI rows belong to one `user_id` and were written inside the same second on 2025-09-02.

## Task 2 — Dimension integrity

### Typed table (`hermetic_structured_intelligence`, n = 9)

| Dimension | populated | empty | scalar_string | structured |
|---|--:|--:|--:|--:|
| execution_bias | 9 | 0 | 5 | 4 |
| behavioral_triggers | 9 | 0 | 5 | 4 |
| temporal_biology | 9 | 0 | 5 | 4 |
| identity_constructs | 9 | 0 | 5 | 4 |
| crisis_handling | 9 | 0 | 5 | 4 |
| (8 further written dimensions) | 9 | 0 | 5 | 4 |
| career_vocational | 0 | 9 | 0 | 0 |
| cognitive_functions | 0 | 9 | 0 | 0 |
| compatibility | 0 | 9 | 0 | 0 |
| financial_archetype | 0 | 9 | 0 | 0 |
| health_wellness | 0 | 9 | 0 | 0 |
| karmic_patterns | 0 | 9 | 0 | 0 |

All five dimensions the reply path reads carry a 5/9 scalar-error-string rate (open bug 12). Six dimensions are never written (open bug 13).

### Report blob (`report_content->structured_intelligence`, n = 43)

| Dimension | structured | scalar_string | missing |
|---|--:|--:|--:|
| execution_bias | 38 | 5 | 0 |
| behavioral_triggers | 38 | 5 | 0 |
| temporal_biology | 38 | 5 | 0 |
| identity_constructs | 38 | 5 | 0 |
| crisis_handling | 38 | 5 | 0 |
| internal_conflicts | 38 | 5 | 0 |
| goal_archetypes | 38 | 5 | 0 |
| metacognitive_biases | 38 | 5 | 0 |
| financial_archetype | 25 | 0 | 18 |
| career_vocational | 25 | 0 | 18 |

## Task 3 — Invocation logs

`extract-hermetic-intelligence`: no invocations in the retained log window. Consistent with the static finding that its only callers are three dev panels under `/test-hermetic-intelligence`; not refuted by the logs, but the retention window is shorter than 90 days, so this is absence of evidence for the older period rather than a zero-count proof.

`unified-brain-processor`: no successful `hermetic_structured_intelligence` read observed. The select at line 408 named four non-existent columns until the repair in this PR.

`companion-oracle-conversation`: the `📐 SPINE: ~N tokens injected` breadcrumb appears with `source: "blob_column"`. No occurrence of the typed table as spine source.

---

**Verdict the evidence supports: repair.**