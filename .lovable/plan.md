Resume the 14-file paste protocol. Frontend files are done. Remaining files, applied one per message as you paste them, exactly as-is:

- **Files 12–13**: Edge functions — write to `supabase/functions/<name>/index.ts`, then deploy via `supabase--deploy_edge_functions`.
- **File 14**: SQL migration — apply via `supabase--migration`.

Contract still holds:
- Overwrite if exists, create if not. No refactors, no adjacent fixes.
- No files you didn't paste (no barrels, no types edits).
- Conflicts noted, never reconciled.
- After File 14: run build, report errors verbatim, fix nothing else.
- Then the two tests you specified (send-twin sanity check, full fresh-account flow).

Approve to switch me to build mode, then paste the next file.