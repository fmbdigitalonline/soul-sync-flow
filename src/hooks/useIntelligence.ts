
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface Intelligence {
  intelligence_level: number;
  interaction_count: number;
  module_scores: Record<string, number>;
}

export const useIntelligence = () => {
  const [intelligence, setIntelligence] = useState<Intelligence | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchIntelligence = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('hacs_intelligence')
          .select('*')
          .eq('user_id', user.id)
          .single();

        if (error && error.code !== 'PGRST116') {
          console.error('Error fetching intelligence:', error);
          return;
        }

        if (data) {
          setIntelligence(data);
        } else {
          // Create initial intelligence record
          const { data: newData, error: insertError } = await supabase
            .from('hacs_intelligence')
            .insert({
              user_id: user.id,
              intelligence_level: 65,
              interaction_count: 0,
              module_scores: {}
            })
            .select()
            .single();

          if (insertError) {
            console.error('Error creating intelligence record:', insertError);
          } else {
            setIntelligence(newData);
          }
        }
      } catch (error) {
        console.error('Unexpected error in useIntelligence:', error);
      }
    };

    fetchIntelligence();
  }, [user]);

  return { intelligence };
};
