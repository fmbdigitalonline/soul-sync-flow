# Hermetic report v3 — observation → synthesis → narration

**For:** Lovable (deploy + one verification run) · **Governing law:** `SOULSYNC_RUNTIME_CONSTITUTION.md`

Six frameworks discover. One synthesis relates them. The Twin speaks.

---

## What was wrong

31 specialists each wrote a complete 700–1500 word personality portrait of the
same person from the same blueprint. Two of them read side by side were ~85%
identical — inevitably, because nineteen full portraits of one person cannot
differ much.

What made them *look* different was framework vocabulary: one section talked
Hermetic law, another talked type, a third talked numbers. That is exactly the
vocabulary users told us said nothing to them. Remove the labels from that
arrangement and the sections collapse into each other; keep them and the report
speaks a language the reader does not.

A second function then read that prose *back* to recover the structure the first
agent already had. `buildStructuredIntelligence` did it with a bare
`JSON.parse(section.content)` inside a try/catch that fell back to
`{ analysis: <prose> }` — the most likely source of the scalar error strings in
`hermetic_structured_intelligence`.

## What replaces it

| Stage | Who | Produces |
|---|---|---|
| `system_translation` (5) | one framework lens each | structured observations |
| `hermetic_laws` (7) | one law lens each | structured observations |
| `gate_analysis` (~26) | one gate each | structured observations |
| `intelligence_extraction` (19) | one dimension each | structured observations |
| `cross_framework_synthesis` (1) | reads **every** lens at once | **the model** |
| `twin_narration` (~57) | the Twin, section by section | everything a person reads |
| `final_assembly` | — | `personality_reports`, `blueprint_version: '3.0'` |

A lens reports `{ observations, tensions, absences }` and is explicitly told
**not** to write a portrait of the whole person. `absences` — what this lens
looked for and did not find — is required, because a lens that admits its blind
spots is worth more than one that fills them.

## Three guards that are enforced, not requested

1. **Single-lens entries are dropped.** Every synthesis entry must name ≥2
   contributing lenses. Anything one lens saw alone is an observation, not a
   synthesis, and restating it is precisely how 31 portraits became 85%
   identical. The count is logged as `dropped_single_lens`.
2. **No distinctiveness claims anywhere.** Lenses, synthesis and Twin are all
   forbidden from calling anything rare, unique or exceptional. Nothing here has
   been compared against another person, so the claim has no ground. When the
   harness let a lens judge this for itself it invented distinctiveness twice out
   of two, once in framework terms it had been explicitly forbidden to use.
   Calibration against a population is a separate work item; until it exists the
   claim is suppressed.
3. **A derivation may never be stated as an observation.** The Twin has never met
   this person. "Dit is wat er in je blueprint zichtbaar wordt" is honest;
   "vorige week deed je dit" is fabrication. This is the one rule in the
   narration prompt marked as unable to bend.

## Nine synthesis mechanisms, not one

`convergence · tension · complementarity · paradox · recurring_theme · shadow ·
potential · direction · natural_strength`

Tension read best in the harness, which is exactly why it is one of nine rather
than the mechanism. A pipeline that only finds tensions produces a report where
every section says "you are pulled between X and Y" — the same monoculture,
different clothes.

## The synthesis derives a working model, not only meaning

`syntheses` answers **"what does this combination mean?"**. That produces a
portrait. A portrait is not something the Twin can hold while somebody is
talking to it — which is why the reports read well and the conversation does
not.

So the same synthesis step — no new agent, no new framework, no new store — now
also answers **"how does this combination appear to run?"** along four axes:

| Axis | Derives |
|---|---|
| `information_processing` | what gets through, what is discarded, what is needed before anything can be considered |
| `meaning_making` | what this person treats as significant, and what something has to connect to before it counts |
| `decision_making` | what happens between an option and a commitment, and what reliably stalls it |
| `action` | how intention becomes movement — what starts it, sustains it, stops it |

### Completeness never outranks honesty — enforced

"All four axes, every time" is exactly the instruction that makes a model invent
the fourth one. So `insufficient_ground` is a first-class answer that costs the
model nothing: an axis the lenses do not support comes back marked unsupported,
and the normaliser **demotes** a thin entry rather than dropping it. Dropping
would report a hole where the model was being honest, and that pressure is what
teaches it to fill the slot next time.

*"decision_making: not enough signal"* is a usable working model. A
confident-sounding hypothesis assembled from too little is worse than a blank,
because anything downstream would take it as a starting belief and — the
constitution gives the model inertia — defend it against the person it is about.

Three different states, kept apart on the record:

| Field | Means |
|---|---|
| `processing_axes` | supported by ≥2 lenses |
| `processing_axes_insufficient` | honestly unsupported — **expected, not a defect** |
| `processing_axes_missing` | absent from the output — the only real gap, and the only one logged as a warning |

### The axes are not a seventh framework — stated, not enforced

The moment a reader is told they are "an information_processing type X", we have
rebuilt the labelling machine v3 exists to remove, in a vocabulary nobody speaks.
The Twin may say *"je lijkt eerst de vorm van iets te pakken, en pas daarna de
details"*; it may never say *"je information_processing is pattern-first"*.

This is a rule in the two prompts and **nowhere else on purpose.** It constrains
how a *consumer* uses the axes, and there is no consumer yet — the Twin does not
read the model in conversation, and the Living Blueprint does not refine it.
Writing enforcement machinery now would protect against behaviour nobody has
observed. What actually needs code is decided after a report has been read.

### These are hypotheses, and the shape says so

Nothing here has been observed. Six frameworks were read. So each entry is
phrased as what the configuration *suggests*, and it is stored as such:

```jsonc
structured_intelligence: {
  processing_model: [ { axis, status, hypothesis, lenses, would_look_like, confidence } ],
  processing_model_status: 'hypothesis',
  processing_model_basis: 'blueprint_derived',
}
```

`would_look_like` is the load-bearing field. A hypothesis with no observable
signature cannot be refined by lived evidence — it can only be repeated. "Rereads
the same message before replying" can be checked against a real week;
"processes deeply" cannot.

That is what hands the axes to the **Living Blueprint** without building
anything for it now. `SOULSYNC_CONSTITUTION.md` already ratifies the mechanism:
disagreement refines the model rather than overriding it, and the model has
inertia so it does not converge on whatever was last said. The report is the
Twin's opening guess; the relationship corrects it.

The two-lens rule applies here exactly as it does to `syntheses` — one lens
describing how somebody decides is that lens's opinion, not a model.

### What the Twin is told

The narration prompt now says the `processing_model` is the picture it is
holding, **not a section to summarise**. It shapes *how* things are said: if the
model suggests this person needs something to connect to before it counts, the
Twin connects it before saying it. With two limits — say "ik vermoed" and mean
it, and expect to be corrected out loud, because a model that cannot be told it
is wrong is not a mirror.

## The lens layer stays framework-specific — question closed

Once the mechanisms existed, an obvious next question appeared: should the
specialists be reorganised *by* mechanism — a tension agent, a convergence
agent, a shadow agent — instead of by framework?

**No, and this is not an open choice.** It is recorded here so it does not get
reopened as if it were.

The reason a lens is worth having is that a different esoteric tradition looks
at the same person differently *on purpose*. Human Design and numerology do not
disagree about a tension; they are not both looking at tension at all. Reassign
the specialists by mechanism and every one of them reads the whole blueprint
again through the same question, which is the arrangement v3 exists to remove —
31 writers covering everything — rebuilt with the labels swapped for mechanism
names. The six-framework identity lives in the lens layer or nowhere.

Differentiation is the synthesis step's job, not the specialists'. A lens
represents its own instrument well; the synthesis is what relates instruments to
each other. That is the same division `SOULSYNC_CONSTITUTION.md` v3.10 already
states as **Experts discover. The Twin speaks** — the experts stay
framework-bound, and none of them narrates.

```
6 frameworks / specialist perspectives
        ↓  structured observations
cross-framework synthesis
        ↓  nine mechanisms
Twin narration
```

Redistribution is an **alternative that needs evidence**, not a decision
pending. What would reopen it: reports where `byMechanism` stays collapsed onto
one or two mechanisms across several users *while* `lenses_failed` is empty and
`dropped_single_lens` is near zero — i.e. the lenses are reporting cleanly and
the synthesis still cannot find variety. Until that is measured, the current
shape stands.

## Non-overlap is assigned, not hoped for

Every narration section declares what it **covers** and what it must **avoid**
because a sibling owns it. The 13 report-level sections are joined by 7 law
sections, 5 system sections and one per gate; each lens section additionally
receives its own lens's raw observations, so a framework section is that
framework's contribution rather than a slice of the average.

Roughly 30,000 narrated words, down from ~90,000. Fewer words, more person —
31 writers each covering everything produced length; one writer covering
assigned ground produces a report.

## Migration checklist (rule 4)

1. **What replaces it?** — `observation-pipeline.ts` plus three role processors
   (`processLensObservation`, `processCrossFrameworkSynthesis`,
   `processNarrationSection`).
2. **What gets removed?** — all five prose prompt builders,
   `determineWritingStyle`, `combineRelevantSections`,
   `buildStructuredIntelligence`, the four `processSingle*` prose processors and
   the `synthesis_integration` stage. Deleted, not left beside the new path.
3. **Who owns this?** — `observation-pipeline.ts` is sole authority on all three
   prompt families and the narration plan.
4. **How do we know the old path is dead?** — no caller remains
   (`grep` for any removed symbol returns nothing), and reports are stamped
   `blueprint_version: '3.0'` with `generation_metadata.pipeline`.
5. **What test proves it?** — one generated report, read. See below.

## Coexistence

Existing 2.0 reports are untouched and keep working; nothing is regenerated
automatically. The report reader and `companion-oracle-conversation` filter on
`blueprint_version`, so **`'3.0'` must be added wherever `'2.0'` is currently
matched** before a 3.0 report becomes visible to the conversation. That wiring
is deliberately not in this change — it lands after the first report is read and
judged.

`hermetic-recovery` now refuses v3 jobs with a 409 instead of reassembling them.
It treats each sub-job's `content` as finished prose; under v3 that column holds
observations, so reassembly would store JSON fragments as narrative. Teaching
recovery to resume a v3 job at its stage is a real follow-up, not this work item.

## What to verify

Generate **one** report for the founder's account and check, in this order:

1. `generation_metadata.lenses_failed` is empty — if lenses are failing to return
   JSON, everything downstream is thin for a boring reason.
2. `dropped_single_lens` is small. A large number means the synthesis is
   restating lens observations and the guard is doing all the work.
3. `generation_metadata.syntheses` is 12–20, and `byMechanism` in the
   `🧩 SYNTHESIS` log is spread across mechanisms rather than piled on `tension`.
4. `unresolved` and `thin_ground` are **non-empty**. A model that found nothing
   contradictory and no weak ground is flattering itself.
5. `processing_axes_missing` is empty. `processing_axes_insufficient` may not be
   — that is the model being honest and is not a failure. Then read the axes on
   their own, **before any prose**: do they describe how somebody *runs*, or are
   they the syntheses restated? Could each `would_look_like` be checked against a
   real week? An axis that fails that is decoration.

   This reading decides the open question: which of the two agreed boundaries
   actually needs code. Do not write enforcement for either one before it.
6. Then read two sections and answer the only question that matters: does this
   say something true and specific, and does it sound like one voice?
