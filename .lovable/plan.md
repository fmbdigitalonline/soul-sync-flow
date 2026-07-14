## Log verdict — pin worked, insert failed on a schema mismatch

The chain now runs end to end until the very last step:

```
🛠️ TOOL LOOP: calling decompose_goal { title:"Become a millionaire", timeframe:"5 years", category:"financial" }
🎯 PINNED DECOMPOSE: title journey { in:"Become a millionaire", out:"…", repaired:false }
🛠️ TOOL LOOP: decompose_goal returned { ok:false, error:"Could not find the 'timeframe' column of 'user_goals' in the schema cache" }
```

So: `tool_choice` pin worked, `openai-agent` returned enough milestones (the fail-path didn't trigger — we got past `milestones.length < 3`), and the insert *attempted*. PostgREST rejected it because `user_goals` has no `timeframe` column. Verified columns: `id, user_id, title, description, progress, status, aligned_traits, milestones, target_date, category, created_at, updated_at`. No `timeframe`.

That's why no row appears and no `dream_card` attachment ships — `insErr` short-circuits at line 2283 and the tool returns `{ ok:false, error }` instead of pushing the attachment.

### Fix (single link)

In `runCompanionTool` → `decompose_goal` branch (`companion-oracle-conversation/index.ts` ~line 2280), stop trying to insert `timeframe` and instead translate it to the real column, `target_date`. Also drop any other fields not in the schema. Concretely:

```ts
const targetDate = (() => {
  // args.timeframe examples: "5 years", "3 months", "12 weeks", "30 days"
  const m = /^(\d+)\s*(day|week|month|year)s?$/i.exec(String(args.timeframe || '').trim());
  if (!m) return null;
  const n = parseInt(m[1], 10);
  const unit = m[2].toLowerCase();
  const d = new Date();
  if (unit === 'day')   d.setDate(d.getDate() + n);
  if (unit === 'week')  d.setDate(d.getDate() + n * 7);
  if (unit === 'month') d.setMonth(d.getMonth() + n);
  if (unit === 'year')  d.setFullYear(d.getFullYear() + n);
  return d.toISOString().slice(0, 10); // date column
})();

const { data: inserted, error: insErr } = await supabase
  .from('user_goals')
  .insert({
    user_id: userId,
    title: args.title,
    description: args.description,
    category: args.category || 'personal',
    target_date: targetDate,
    milestones,
    progress: 0,
  })
  .select('id')
  .single();
```

If `args.timeframe` doesn't parse cleanly, insert `target_date: null` — the column is nullable and the card still renders from `milestones` + `progress`.

### Scope

- One file, one insert block edited: `supabase/functions/companion-oracle-conversation/index.ts` around line 2278–2282.
- No schema migration. The `timeframe` column was never there; the caller was guessing.
- No frontend changes (DreamCard already reads only `title`, `progress`, `milestones`).
- No `openai-agent` changes.

### Verify

Same recipe: new thread → goal → offer → "yes". Expect logs to show `🛠️ TOOL LOOP: decompose_goal returned { ok:true, goal_id:… }`, a new row in `user_goals`, and a `<DreamCard />` under the assistant message. -DEV NOTE-Apply your fix as proposed, with one change: make the timeframe parser tolerant — accept optional leading "in/within/binnen", Dutch units (jaar/jaren, maand/maanden, week/weken, dag/dagen), and decimals, e.g. `/(?:in|within|binnen)?\s*(\d+(?:[.,]\d+)?)\s*(day|dag|week|month|maand|year|jaar)/i` with plural-insensitive matching. Unparseable → `target_date: null` as you specified. Also ensure the model-facing tool description for `description` still says the timeframe belongs in it. Deploy, then the recipe: new thread → goal → offer → "yes".