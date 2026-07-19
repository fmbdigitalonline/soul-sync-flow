/**
 * insight-memory-service — the REAL write behind "Help me remember this"
 * (Constitution v2.6 Step 2; closes bug 7 — the old Save Insight chip was
 * a toast with no write).
 *
 * Writes to `user_session_memory`, the store the oracle's behavioral
 * memory context already reads every turn — so a remembered insight is
 * genuinely retrievable by the Twin, not archived into a table nobody
 * reads. `memory_data.summary` is deliberately set: the oracle's pattern
 * extraction surfaces `summary` into the conversation context.
 */

import { supabase } from '@/integrations/supabase/client';

export async function saveRememberedInsight(passage: string): Promise<{ ok: boolean; error?: string }> {
  const trimmed = passage.trim();
  if (!trimmed) return { ok: false, error: 'Nothing selected to remember.' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: 'Not signed in.' };

  const { error } = await supabase.from('user_session_memory').insert({
    user_id: user.id,
    session_id: `companion_${user.id}`,
    memory_type: 'insight',
    memory_data: {
      passage: trimmed,
      summary: trimmed,
      source: 'sentence_selection',
      saved_at: new Date().toISOString(),
    },
    context_summary: trimmed.slice(0, 200),
    importance_score: 8,
  });

  if (error) {
    console.error('❌ Remember-this write failed:', error);
    return { ok: false, error: error.message };
  }
  console.log('💭 Insight remembered (user_session_memory, type=insight)');
  return { ok: true };
}
