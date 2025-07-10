
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
  pie_score: number;  // Added PIE
  vfp_score: number;  // Added VFP
  tmg_score: number;  // Added TMG
  interaction_count: number;
  created_at: string;
  updated_at: string;
}

// Complete HACS module definitions with the missing ones
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
        setIntelligence(data);
      } else {
        // Create initial intelligence record with all 11 modules
        const initialData = {
          user_id: user.id,
          overall_intelligence: 10,
          nik_score: 10,
          cpsr_score: 10,
          tws_score: 10,
          hfme_score: 10,
          dpem_score: 10,
          cnr_score: 10,
          bpsc_score: 10,
          acs_score: 10,
          pie_score: 10,  // Initialize PIE
          vfp_score: 10,  // Initialize VFP
          tmg_score: 10,  // Initialize TMG
          interaction_count: 0
        };

        const { data: newData, error: insertError } = await supabase
          .from('hacs_intelligence')
          .insert(initialData)
          .select()
          .single();

        if (insertError) throw insertError;
        setIntelligence(newData);
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
      const { data, error } = await supabase
        .from('hacs_intelligence')
        .update({
          ...updates,
          interaction_count: intelligence.interaction_count + 1
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;
      setIntelligence(data);
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
