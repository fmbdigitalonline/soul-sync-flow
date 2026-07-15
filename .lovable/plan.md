## Goal

Retire the Azure OpenAI path for edge functions and route every chat + embeddings call through direct OpenAI (`api.openai.com`), reusing the fallback branch that already exists in `supabase/functions/_shared/azure-openai.ts`.

Side effect this unblocks: the intent classifier (`gpt-4.1-nano`) starts working immediately — no missing-deployment 404 — because OpenAI has that model natively.

## Preconditions (must resolve before any code/secret change)

`fetch_secrets` shows the project currently has:

- `AZURE_OPENAI_KEY`, `AZURE_OPENAI_ENDPOINT`, `AZURE_OPENAI_API_VERSION`
- `AZURE_OPENAI_EMBEDDINGS_KEY`, `AZURE_OPENAI_EMBEDDINGS_ENDPOINT`
- `LOVABLE_API_KEY` (managed)
- **`OPENAI_API_KEY` is NOT set.**

The helper's fallback throws `"Neither Azure OpenAI nor OpenAI API key is configured"` when Azure is disabled and no `OPENAI_API_KEY` is present. So the switch order matters — if we delete Azure vars first, every AI edge function breaks in the interval before the OpenAI key arrives.

**Order (atomic-ish):**

1. `add_secret(["OPENAI_API_KEY"])` — you paste the key into the secure form. I verify with a probe call while Azure is still active (the helper still prefers Azure, so this proves the key lands without changing behavior yet).
2. Only after the key is confirmed present: delete the five `AZURE_*` secrets (via the secrets UI — I'll flag which ones). At that point `isAzureConfigured()` and the embeddings-configured check both flip to false and the helper's direct-OpenAI branch takes over.
3. No redeploy needed — the helper reads env at each request.

## Code changes

None required for the switch itself. The fallback path in `azure-openai.ts` already handles both chat (`https://api.openai.com/v1/chat/completions`) and embeddings (`https://api.openai.com/v1/embeddings`).

Two tiny cleanups I'll do in the same PR for hygiene, only after the switch is verified working:

- Remove the boot-time `console.log`s that reference Azure endpoints so they don't produce misleading `NOT configured` lines every cold start.
- Leave the `MODEL_TO_DEPLOYMENT` map in place — it's a no-op on the direct path (getDeploymentName is only called in the Azure branch), and keeping it means we can flip back to Azure later just by re-adding the secrets.

Explicitly NOT changing:
- Model IDs in code (`gpt-4.1-mini-2025-04-14`, `gpt-4.1-nano`, `text-embedding-3-small`, `gpt-4.1-mini`) — all are valid on OpenAI direct.
- The helper's exported surface (`callChatCompletion`, `callEmbeddings`, `isAzureConfigured`) — no caller changes.

## Verification

While log ingestion is up (it is right now — the 15:56:12 probe delivered markers), I'll verify by probing three paths and reading the logs:

1. **Chat** — `POST /companion-oracle-conversation` with a minimal payload; expect `⚡ OpenAI Direct (fallback): gpt-4.1-mini-2025-04-14` in logs and a 200 response.
2. **Intent classifier** — the same call also triggers `classifyIntent` → expect `🧭 INTENT: { intent: ..., ms: ... }` (success, not the current `HTTP error → regex fallback { status: 404 }`).
3. **Embeddings** — `POST /openai-embeddings` with a short input; expect `⚡ OpenAI Embeddings Direct (fallback)` and `Successfully generated embedding, length: 1536`.

If any of the three fails, I roll back by re-adding the Azure secrets (values retained by the user out of band; I do NOT store them).

## Non-code follow-ups

- **Memory update.** The Core rule "All AI uses Azure OpenAI. Model names must exactly match Azure deployments" is now false. I'll update `mem://index.md` to say "All AI uses direct OpenAI (api.openai.com). Azure path retired 2026-07-15; helper fallback retained for optional re-enable." Constitution's Directive 5 (expose your work) — I'll paste the diff.
- **Cost / rate-limit posture.** Direct OpenAI usage is billed on your OpenAI account (not workspace credits), and rate limits are your OpenAI org's tier, not Azure's PTUs. Worth knowing but not blocking.
- **Azure resource.** I don't touch anything on the `multimodalhacsbrain` Azure resource. If you also want to deprovision it, that's a separate manual step in the Azure portal.

## Not in scope

- Migrating to the Lovable AI Gateway (`ai.gateway.lovable.dev`) — different provider surface entirely; ask separately if you want that path.
- The `conversation_state_tracking` RLS gap and `blueprint_text_embeddings` missing rows — both pre-existing, unrelated.

## Deliverables

1. `OPENAI_API_KEY` present in project secrets.
2. Five `AZURE_*` secrets removed.
3. Three verification log lines (chat, intent, embeddings) pasted into the chat as proof.
4. Updated `mem://index.md` Core section.
5. Optional hygiene commit removing the two Azure boot logs from `_shared/azure-openai.ts` (after verification).
