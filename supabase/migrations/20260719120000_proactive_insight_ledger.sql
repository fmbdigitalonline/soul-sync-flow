-- Proactive Intelligence Layer (Constitution v3.0): conversation_insights
-- becomes the system's insight LEDGER, not the user's inbox.
-- Lifecycle: candidate → validated → eligible → delivered →
-- accepted/dismissed → acted_on → resolved → stale.
-- pattern_key powers the guardian's "is it new?" check (dedupe across
-- deliveries); delivered_at powers cooldowns and resurfacing rules.

ALTER TABLE public.conversation_insights
  ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'candidate',
  ADD COLUMN IF NOT EXISTS pattern_key TEXT,
  ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMP WITH TIME ZONE;

CREATE INDEX IF NOT EXISTS idx_conversation_insights_ledger
  ON public.conversation_insights (user_id, pattern_key, status);

CREATE INDEX IF NOT EXISTS idx_conversation_insights_delivered
  ON public.conversation_insights (user_id, delivered_at DESC);
