import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface HacsIntelligence {
  id: string;
  user_id: string;
  intelligence_level: number;
  module_scores: ModuleScores;
  interaction_count: number;
  last_update: string;
  created_at: string;
  updated_at: string;
}

export interface ModuleScores {
  NIK: number;    // Neural Integration Kernel
  CPSR: number;   // Cognitive Pattern State Recognition
  TWS: number;    // Temporal Wisdom Synthesis
  HFME: number;   // Holistic Framework Management Engine
  DPEM: number;   // Dynamic Personality Expression Module
  CNR: number;    // Conflict Navigation & Resolution
  BPSC: number;   // Blueprint Personalization & Sync Center
  ACS: number;    // Adaptive Conversation System
}

export const useHacsIntelligence = () => {
  const [intelligence, setIntelligence] = useState<HacsIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Initialize or fetch user's HACS intelligence
  const initializeIntelligence = useCallback(async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Check if intelligence record exists
      const { data: existing, error: fetchError } = await supabase
        .from('hacs_intelligence')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') {
        throw fetchError;
      }

      if (existing) {
        setIntelligence({
          ...existing,
          module_scores: (existing.module_scores as unknown) as ModuleScores
        });
      } else {
        // Create initial intelligence record
        const initialModuleScores: ModuleScores = {
          NIK: 0,
          CPSR: 0,
          TWS: 0,
          HFME: 0,
          DPEM: 0,
          CNR: 0,
          BPSC: 0,
          ACS: 0,
        };

        const { data: newIntelligence, error: createError } = await supabase
          .from('hacs_intelligence')
          .insert({
            user_id: user.id,
            intelligence_level: 0,
            module_scores: initialModuleScores as any,
            interaction_count: 0,
          })
          .select()
          .single();

        if (createError) throw createError;
        setIntelligence({
          ...newIntelligence,
          module_scores: (newIntelligence.module_scores as unknown) as ModuleScores
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize intelligence');
      console.error('Failed to initialize HACS intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Update intelligence level based on user interactions
  const updateIntelligence = useCallback(async (
    moduleUpdates: Partial<ModuleScores>,
    interactionQuality: number = 1 // 0-1 multiplier for interaction quality
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !intelligence) return;

      // Calculate new module scores
      const currentScores = intelligence.module_scores;
      const newModuleScores = { ...currentScores };
      
      Object.entries(moduleUpdates).forEach(([module, improvement]) => {
        const currentScore = newModuleScores[module as keyof ModuleScores] || 0;
        const adjustedImprovement = improvement * interactionQuality;
        newModuleScores[module as keyof ModuleScores] = Math.min(100, currentScore + adjustedImprovement);
      });

      // Calculate overall intelligence level (average of all modules)
      const moduleValues = Object.values(newModuleScores);
      const newIntelligenceLevel = moduleValues.reduce((sum, score) => sum + score, 0) / moduleValues.length;

      // Update database
      const { data: updated, error: updateError } = await supabase
        .from('hacs_intelligence')
        .update({
          intelligence_level: newIntelligenceLevel,
          module_scores: newModuleScores as any,
          interaction_count: intelligence.interaction_count + 1,
          last_update: new Date().toISOString(),
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setIntelligence({
        ...updated,
        module_scores: (updated.module_scores as unknown) as ModuleScores
      });

      // Show level up notification if crossing major thresholds
      const oldLevel = Math.floor(intelligence.intelligence_level / 25);
      const newLevel = Math.floor(newIntelligenceLevel / 25);
      
      if (newLevel > oldLevel) {
        const phases = ['Awakening', 'Learning', 'Developing', 'Advanced'];
        if (newIntelligenceLevel >= 100) {
          toast({
            title: "🎉 Autonomous Intelligence Unlocked!",
            description: "Your HACS system has achieved full autonomous capability.",
            duration: 5000,
          });
        } else if (phases[newLevel]) {
          toast({
            title: `🧠 Intelligence Level Up!`,
            description: `Your HACS has evolved to the ${phases[newLevel]} phase.`,
            duration: 3000,
          });
        }
      }

    } catch (err) {
      console.error('Failed to update HACS intelligence:', err);
    }
  }, [intelligence, toast]);

  // Simulate learning from conversation quality
  const recordConversationInteraction = useCallback(async (
    messageContent: string,
    responseQuality: 'excellent' | 'good' | 'average' | 'poor' = 'average'
  ) => {
    const qualityMultipliers = {
      excellent: 1.0,
      good: 0.8,
      average: 0.5,
      poor: 0.2,
    };

    const baseImprovements: Partial<ModuleScores> = {
      NIK: 0.5, // Neural integration from processing
      CPSR: 0.3, // Pattern recognition from content analysis
      ACS: 0.8, // Conversation system from interaction
    };

    // Additional improvements based on content complexity
    if (messageContent.length > 100) {
      baseImprovements.TWS = 0.4; // Temporal wisdom from complex discussions
      baseImprovements.DPEM = 0.3; // Personality expression adaptation
    }

    if (messageContent.includes('?')) {
      baseImprovements.CNR = 0.2; // Conflict navigation from questions
    }

    await updateIntelligence(baseImprovements, qualityMultipliers[responseQuality]);
  }, [updateIntelligence]);

  // Get current intelligence phase
  const getIntelligencePhase = useCallback(() => {
    if (!intelligence) return 'Unknown';
    
    const level = intelligence.intelligence_level;
    if (level >= 100) return 'Autonomous';
    if (level >= 75) return 'Advanced';
    if (level >= 50) return 'Developing';
    if (level >= 25) return 'Learning';
    return 'Awakening';
  }, [intelligence]);

  // Check if autonomous intelligence is unlocked
  const isAutonomousUnlocked = useCallback(() => {
    return intelligence?.intelligence_level >= 100;
  }, [intelligence]);

  useEffect(() => {
    initializeIntelligence();
  }, [initializeIntelligence]);

  return {
    intelligence,
    loading,
    error,
    updateIntelligence,
    recordConversationInteraction,
    getIntelligencePhase,
    isAutonomousUnlocked,
    refreshIntelligence: initializeIntelligence,
  };
};