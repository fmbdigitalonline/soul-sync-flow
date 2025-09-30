import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Dim } from '@/services/xp-progression-service';

/**
 * Client-side hook for emitting XP events
 * 
 * This provides a React-friendly interface for awarding XP from the frontend.
 * Most XP awards should happen from edge functions, but this is useful for
 * client-side events like UI interactions, learning clicks, etc.
 */
export function useXPEventEmitter() {
  const emitXPEvent = useCallback(async (
    userId: string,
    dims: Partial<Record<Dim, number>>,
    quality: number,
    kinds: string[],
    source: string
  ): Promise<{ success: boolean; deltaXP?: number; error?: string }> => {
    try {
      const { data, error } = await supabase.functions.invoke('xp-award-service', {
        body: {
          userId,
          dims,
          quality: Math.max(0, Math.min(1, quality)),
          kinds,
          source
        }
      });

      if (error) {
        console.error('❌ XP Event emission failed:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ XP Event emitted:', { dims, quality, kinds, deltaXP: data?.deltaXP });
      return { success: true, deltaXP: data?.deltaXP };
    } catch (error) {
      console.error('❌ XP Event error:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }, []);

  return { emitXPEvent };
}
