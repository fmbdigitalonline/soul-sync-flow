/**
 * useHelpHistory — Slice I.
 * Pulls the user's most recent task_assistance_responses to power the
 * Insights section of the Coach panel. Real data only (Directive 1).
 */

import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface HelpHistoryEntry {
  id: string;
  title: string;
  when: string;
}

export function useHelpHistory(limit = 12): HelpHistoryEntry[] {
  const [entries, setEntries] = useState<HelpHistoryEntry[]>([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        const { data, error } = await supabase
          .from('task_assistance_responses')
          .select('id, title, content, help_type, created_at')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(limit);
        if (error) {
          console.warn('useHelpHistory: query failed', error.message);
          return;
        }
        if (cancelled) return;
        setEntries(
          (data ?? []).map((row: any) => ({
            id: String(row.id),
            title:
              row.title?.trim() ||
              (typeof row.content === 'string' ? row.content.slice(0, 80) : row.help_type) ||
              'Help',
            when: row.created_at
              ? new Date(row.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                })
              : '',
          })),
        );
      } catch (err) {
        console.warn('useHelpHistory: unexpected error', err);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [limit]);

  return entries;
}