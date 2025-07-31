import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { retrievalSidecarService } from '@/services/retrieval-sidecar-service';

export const useBlueprintFactsAutomation = (userId: string | undefined) => {
  useEffect(() => {
    if (!userId) return;

    // Listen for blueprint facts extraction triggers
    const subscription = supabase
      .channel('blueprint_facts_automation')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'user_activities',
          filter: `user_id=eq.${userId}`,
        },
        async (payload) => {
          const activity = payload.new;
          
          // Check if this is a blueprint facts extraction trigger
          if (activity.activity_type === 'blueprint_facts_extraction_triggered') {
            console.log('🔥 AUTO-TRIGGER: Blueprint facts extraction needed', activity);
            
            try {
              // Automatically trigger the ETL process
              const result = await retrievalSidecarService.extractBlueprintFacts(userId, true);
              
              if (result) {
                console.log('✅ AUTO-TRIGGER: Blueprint facts extraction completed successfully');
                
                // Log completion activity
                await supabase.from('user_activities').insert({
                  user_id: userId,
                  activity_type: 'blueprint_facts_extraction_completed',
                  activity_data: {
                    trigger_reason: 'automated',
                    blueprint_id: activity.activity_data?.blueprint_id,
                    timestamp: new Date().toISOString()
                  }
                });
              } else {
                console.error('❌ AUTO-TRIGGER: Blueprint facts extraction failed');
              }
            } catch (error) {
              console.error('❌ AUTO-TRIGGER: Error during automated extraction:', error);
            }
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);
};