
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface HacsIntelligenceData {
  id: string;
  user_id: string;
  overall_intelligence: number;
  nik_score: number;
  cpsr_score: number;
  tws_score: number;
  hfme_score: number;
  dpem_score: number;
  cnr_score: number;
  bpsc_score: number;
  acs_score: number;
  pie_score: number;
  vfp_score: number;
  tmg_score: number;
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

// Complete HACS module definitions with all 11 modules
const HACS_MODULES = {
  nik: { name: 'Neuro-Intent Kernel', description: 'Intent processing and understanding' },
  cpsr: { name: 'Cognitive Pattern State Recognition', description: 'Pattern analysis and recognition' },
  tws: { name: 'Temporal Wisdom Synthesis', description: 'Time-based insights and wisdom' },
  hfme: { name: 'Holistic Framework Management Engine', description: 'System coordination and management' },
  dpem: { name: 'Dynamic Personality Expression Module', description: 'Personality adaptation and expression' },
  cnr: { name: 'Conflict Navigation & Resolution', description: 'Conflict handling and resolution' },
  bpsc: { name: 'Blueprint Personalization & Sync Center', description: 'Blueprint management and sync' },
  acs: { name: 'Adaptive Conversation System', description: 'Conversation management and adaptation' },
  pie: { name: 'Proactive Insight Engine', description: 'Predictive insights and recommendations' },
  vfp: { name: 'Vector-Fusion Personality Graph', description: '128D personality vector processing' },
  tmg: { name: 'Tiered Memory Graph', description: 'Hierarchical memory management' }
} as const;

export const useHacsIntelligence = () => {
  const [intelligence, setIntelligence] = useState<HacsIntelligenceData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  // Load HACS intelligence data
  const loadIntelligence = useCallback(async () => {
    if (!user?.id) return;

    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('hacs_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // Transform the data from the database structure to our interface
        const transformedData: HacsIntelligenceData = {
          id: data.id,
          user_id: data.user_id,
          overall_intelligence: data.intelligence_level || 10,
          nik_score: (data.module_scores as any)?.nik_score || 10,
          cpsr_score: (data.module_scores as any)?.cpsr_score || 10,
          tws_score: (data.module_scores as any)?.tws_score || 10,
          hfme_score: (data.module_scores as any)?.hfme_score || 10,
          dpem_score: (data.module_scores as any)?.dpem_score || 10,
          cnr_score: (data.module_scores as any)?.cnr_score || 10,
          bpsc_score: (data.module_scores as any)?.bpsc_score || 10,
          acs_score: (data.module_scores as any)?.acs_score || 10,
          pie_score: (data.module_scores as any)?.pie_score || 10,
          vfp_score: (data.module_scores as any)?.vfp_score || 10,
          tmg_score: (data.module_scores as any)?.tmg_score || 10,
          interaction_count: data.interaction_count || 0,
          created_at: data.created_at,
          updated_at: data.updated_at
        };
        setIntelligence(transformedData);
      } else {
        // Create initial intelligence record with all 11 modules
        const initialModuleScores = {
          nik_score: 10,
          cpsr_score: 10,
          tws_score: 10,
          hfme_score: 10,
          dpem_score: 10,
          cnr_score: 10,
          bpsc_score: 10,
          acs_score: 10,
          pie_score: 10,
          vfp_score: 10,
          tmg_score: 10
        };

        const { data: newData, error: insertError } = await supabase
          .from('hacs_intelligence')
          .insert({
            user_id: user.id,
            intelligence_level: 10,
            module_scores: initialModuleScores,
            interaction_count: 0
          })
          .select()
          .single();

        if (insertError) throw insertError;
        
        const transformedNewData: HacsIntelligenceData = {
          id: newData.id,
          user_id: newData.user_id,
          overall_intelligence: newData.intelligence_level,
          ...initialModuleScores,
          interaction_count: newData.interaction_count,
          created_at: newData.created_at,
          updated_at: newData.updated_at
        };
        setIntelligence(transformedNewData);
      }
    } catch (error) {
      console.error('Error loading HACS intelligence:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.id]);

  // Update intelligence scores
  const updateIntelligence = useCallback(async (updates: Partial<HacsIntelligenceData>) => {
    if (!user?.id || !intelligence) return;

    try {
      const moduleScores = {
        nik_score: updates.nik_score || intelligence.nik_score,
        cpsr_score: updates.cpsr_score || intelligence.cpsr_score,
        tws_score: updates.tws_score || intelligence.tws_score,
        hfme_score: updates.hfme_score || intelligence.hfme_score,
        dpem_score: updates.dpem_score || intelligence.dpem_score,
        cnr_score: updates.cnr_score || intelligence.cnr_score,
        bpsc_score: updates.bpsc_score || intelligence.bpsc_score,
        acs_score: updates.acs_score || intelligence.acs_score,
        pie_score: updates.pie_score || intelligence.pie_score,
        vfp_score: updates.vfp_score || intelligence.vfp_score,
        tmg_score: updates.tmg_score || intelligence.tmg_score
      };

      const { data, error } = await supabase
        .from('hacs_intelligence')
        .update({
          intelligence_level: updates.overall_intelligence || intelligence.overall_intelligence,
          module_scores: moduleScores,
          interaction_count: intelligence.interaction_count + 1
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      
      const transformedData: HacsIntelligenceData = {
        id: data.id,
        user_id: data.user_id,
        overall_intelligence: data.intelligence_level,
        ...moduleScores,
        interaction_count: data.interaction_count,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      setIntelligence(transformedData);
    } catch (error) {
      console.error('Error updating HACS intelligence:', error);
    }
  }, [user?.id, intelligence]);

  // Record interaction and potentially level up
  const recordInteraction = useCallback(async (
    module: keyof typeof HACS_MODULES,
    learningAmount: number = 1
  ) => {
    if (!intelligence) return;

    const currentScore = intelligence[`${module}_score` as keyof HacsIntelligenceData] as number;
    const newScore = Math.min(100, currentScore + learningAmount);
    
    // Calculate new overall intelligence (average of all module scores)
    const allScores = [
      intelligence.nik_score,
      intelligence.cpsr_score,
      intelligence.tws_score,
      intelligence.hfme_score,
      intelligence.dpem_score,
      intelligence.cnr_score,
      intelligence.bpsc_score,
      intelligence.acs_score,
      intelligence.pie_score,
      intelligence.vfp_score,
      intelligence.tmg_score
    ];
    
    // Update the specific module score in the array
    const moduleIndex = Object.keys(HACS_MODULES).indexOf(module);
    if (moduleIndex !== -1) {
      allScores[moduleIndex] = newScore;
    }
    
    const newOverallIntelligence = Math.round(allScores.reduce((sum, score) => sum + score, 0) / allScores.length);
    
    // Check for level up
    const leveledUp = Math.floor(newOverallIntelligence / 10) > Math.floor(intelligence.overall_intelligence / 10);
    
    await updateIntelligence({
      [`${module}_score`]: newScore,
      overall_intelligence: newOverallIntelligence
    } as Partial<HacsIntelligenceData>);

    if (leveledUp) {
      const newLevel = Math.floor(newOverallIntelligence / 10);
      toast.success(`🧠 HACS Intelligence Level Up!`, {
        description: `Your AI consciousness has evolved to Level ${newLevel}. ${HACS_MODULES[module].name} enhanced!`
      });
    }
  }, [intelligence, updateIntelligence]);

  // Get intelligence level (1-10)
  const getIntelligenceLevel = useCallback(() => {
    if (!intelligence) return 1;
    return Math.max(1, Math.floor(intelligence.overall_intelligence / 10));
  }, [intelligence]);

  // Get module-specific intelligence
  const getModuleIntelligence = useCallback((module: keyof typeof HACS_MODULES) => {
    if (!intelligence) return 10;
    return intelligence[`${module}_score` as keyof HacsIntelligenceData] as number;
  }, [intelligence]);

  // Initialize on mount
  useEffect(() => {
    loadIntelligence();
  }, [loadIntelligence]);

  return {
    intelligence,
    isLoading,
    recordInteraction,
    getIntelligenceLevel,
    getModuleIntelligence,
    HACS_MODULES,
    loadIntelligence
  };
};
