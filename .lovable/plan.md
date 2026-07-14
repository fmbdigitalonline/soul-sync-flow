One file changes: `supabase/functions/companion-oracle-conversation/index.ts`.

## Task 1 — Truth guard for empty behavioral memory

**Detect empty memory** (right after `behavioralContext` is loaded, ~line 1847):
```ts
const hasNoMemory =
  (behavioralContext.patterns?.length ?? 0) === 0 &&
  (behavioralContext.memories?.length ?? 0) === 0;
```

**(a) Strip "BEHAVIORAL EVIDENCE" from the selected role template.** After `const roleBlock = getRoleForIntent(...)` (~line 1870), when `hasNoMemory` is true, remove any numbered line beginning with "BEHAVIORAL EVIDENCE" (and the equivalent "BEHAVIORAL VALIDATION" line in ALIGNED_ACTION) from `roleBlock`, and renumber the remaining steps (2, 3, 4 → 2, 3). Regex-based, applied only to the returned string — the template functions themselves are untouched so memory-present replies keep the step.

**(b) Append a truth-guard line to the system prompt.** After `systemPrompt = await generateHybridPrompt();` (~line 1933), if `hasNoMemory`:
```
systemPrompt += '\n\nMEMORY TRUTH GUARD: This user has NO conversation memory yet. NEVER claim to see patterns "in your memory" or reference past behavior — you have only their chart. Speaking from the chart is enough.';
```

**FIRST CONTACT hard cap.** In the FIRST CONTACT DIRECTIVE (line ~1957), change:
- `- 2 to 4 sentences total.` → `- HARD LIMIT: 2 to 4 sentences total.`

## Task 2 — Question-ration counter

Insert after `systemPrompt = await generateHybridPrompt();` (before FIRST CONTACT block) so it runs on every oracle reply:
```ts
const last3Assistant = (finalHistory || [])
  .filter(m => m.role === 'assistant')
  .slice(-3);
const endsInQ = last3Assistant.filter(m =>
  typeof m.content === 'string' && m.content.trim().endsWith('?')
).length;
if (endsInQ >= 2) {
  systemPrompt += '\n\nQUESTION RATION: Your recent replies all ended in questions. End this one with a statement.';
}
```

## Out of scope
No frontend changes. No changes to `getRoleForIntent` template definitions themselves (mutation applied to the returned string only, so memory-present flows are unaffected). No DB writes. No new imports.
