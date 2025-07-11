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
  pie_score: number;
  vfp_score: number;
  tmg_score: number;
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
  PIE: number;    // Predictive Intelligence Engine
  VFP: number;    // Vector Fusion Processor
  TMG: number;    // Temporal Memory Graph
}

export const useHacsIntelligence = () => {
  const [intelligence, setIntelligence] = useState<HacsIntelligence | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Check if user has blueprint to determine initial intelligence boost
  const checkBlueprintCompletion = useCallback(async (userId: string) => {
    try {
      const { data: blueprint } = await supabase
        .from('blueprints')
        .select('id')
        .eq('user_id', userId)
        .eq('is_active', true)
        .limit(1)
        .single();
      
      return blueprint ? 20 : 0; // 20% boost for users with blueprints
    } catch (error) {
      console.log('No blueprint found, starting at 0%');
      return 0;
    }
  }, []);

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
        // Safely parse module_scores with proper type checking
        const rawModuleScores = existing.module_scores;
        const moduleScores: ModuleScores = {
          NIK: (rawModuleScores as any)?.NIK || 0,
          CPSR: (rawModuleScores as any)?.CPSR || 0,
          TWS: (rawModuleScores as any)?.TWS || 0,
          HFME: (rawModuleScores as any)?.HFME || 0,
          DPEM: (rawModuleScores as any)?.DPEM || 0,
          CNR: (rawModuleScores as any)?.CNR || 0,
          BPSC: (rawModuleScores as any)?.BPSC || 0,
          ACS: (rawModuleScores as any)?.ACS || 0,
          PIE: existing.pie_score || 0,
          VFP: existing.vfp_score || 0,
          TMG: existing.tmg_score || 0,
        };

        setIntelligence({
          ...existing,
          module_scores: moduleScores,
          pie_score: existing.pie_score || 0,
          vfp_score: existing.vfp_score || 0,
          tmg_score: existing.tmg_score || 0,
        });
      } else {
        // Check blueprint completion for intelligence boost
        const initialIntelligenceLevel = await checkBlueprintCompletion(user.id);
        console.log('Initial intelligence level (blueprint boost):', initialIntelligenceLevel);

        // Create initial intelligence record with blueprint boost
        const baseScore = initialIntelligenceLevel * 0.1; // Distribute boost across modules
        const initialModuleScores: ModuleScores = {
          NIK: baseScore,
          CPSR: baseScore,
          TWS: baseScore,
          HFME: baseScore,
          DPEM: baseScore,
          CNR: baseScore,
          BPSC: baseScore,
          ACS: baseScore,
          PIE: baseScore,
          VFP: baseScore,
          TMG: baseScore,
        };

        const { data: newIntelligence, error: createError } = await supabase
          .from('hacs_intelligence')
          .insert({
            user_id: user.id,
            intelligence_level: initialIntelligenceLevel,
            module_scores: initialModuleScores as any,
            interaction_count: 0,
            pie_score: baseScore,
            vfp_score: baseScore,
            tmg_score: baseScore,
          })
          .select()
          .single();

        if (createError) throw createError;
        setIntelligence({
          ...newIntelligence,
          module_scores: initialModuleScores,
          pie_score: baseScore,
          vfp_score: baseScore,
          tmg_score: baseScore,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize intelligence');
      console.error('Failed to initialize HACS intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [checkBlueprintCompletion]);

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

      // Calculate overall intelligence level (average of all 11 modules)
      const moduleValues = Object.values(newModuleScores);
      const newIntelligenceLevel = moduleValues.reduce((sum, score) => sum + score, 0) / moduleValues.length;

      // Update database with all module scores
      const { data: updated, error: updateError } = await supabase
        .from('hacs_intelligence')
        .update({
          intelligence_level: newIntelligenceLevel,
          module_scores: newModuleScores as any,
          interaction_count: intelligence.interaction_count + 1,
          last_update: new Date().toISOString(),
          pie_score: newModuleScores.PIE,
          vfp_score: newModuleScores.VFP,
          tmg_score: newModuleScores.TMG,
        })
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setIntelligence({
        ...updated,
        module_scores: newModuleScores,
        pie_score: newModuleScores.PIE,
        vfp_score: newModuleScores.VFP,
        tmg_score: newModuleScores.TMG,
      });

      // Show level up notification if crossing major thresholds
      const oldLevel = Math.floor(intelligence.intelligence_level / 25);
      const newLevel = Math.floor(newIntelligenceLevel / 25);
      
      if (newLevel > oldLevel) {
        const phases = ['Awakening', 'Learning', 'Developing', 'Advanced'];
        if (newIntelligenceLevel >= 100) {
          toast({
            title: "🎉 Autonomous Intelligence Unlocked!",
            description: "Your HACS system has achieved full autonomous capability across all 11 modules.",
            duration: 5000,
          });
        } else if (phases[newLevel]) {
          toast({
            title: `🧠 Intelligence Level Up!`,
            description: `Your HACS has evolved to the ${phases[newLevel]} phase across all neural pathways.`,
            duration: 3000,
          });
        }
      }

    } catch (err) {
      console.error('Failed to update HACS intelligence:', err);
    }
  }, [intelligence, toast]);

  // Simulate learning from conversation quality with enhanced module training
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
      PIE: 0.4, // Predictive insights from conversation flow
      VFP: 0.3, // Vector processing from personality alignment
      TMG: 0.2, // Temporal memory from context retention
    };

    // Additional improvements based on content complexity
    if (messageContent.length > 100) {
      baseImprovements.TWS = 0.4; // Temporal wisdom from complex discussions
      baseImprovements.DPEM = 0.3; // Personality expression adaptation
      baseImprovements.HFME = 0.2; // Framework management
    }

    if (messageContent.includes('?')) {
      baseImprovements.CNR = 0.2; // Conflict navigation from questions
      baseImprovements.BPSC = 0.1; // Blueprint sync from personalization
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

  // Get all module names and descriptions
  const getModuleInfo = useCallback(() => {
    return [
      { key: 'NIK', name: 'Neural Integration Kernel', description: 'Core neural processing' },
      { key: 'CPSR', name: 'Cognitive Pattern State Recognition', description: 'Pattern recognition' },
      { key: 'TWS', name: 'Temporal Wisdom Synthesis', description: 'Wisdom integration' },
      { key: 'HFME', name: 'Holistic Framework Management Engine', description: 'Framework coordination' },
      { key: 'DPEM', name: 'Dynamic Personality Expression Module', description: 'Personality adaptation' },
      { key: 'CNR', name: 'Conflict Navigation & Resolution', description: 'Conflict resolution' },
      { key: 'BPSC', name: 'Blueprint Personalization & Sync Center', description: 'Blueprint integration' },
      { key: 'ACS', name: 'Adaptive Conversation System', description: 'Conversation flow' },
      { key: 'PIE', name: 'Predictive Intelligence Engine', description: 'Future insights' },
      { key: 'VFP', name: 'Vector Fusion Processor', description: 'Data fusion' },
      { key: 'TMG', name: 'Temporal Memory Graph', description: 'Memory connections' },
    ];
  }, []);

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
    getModuleInfo,
    refreshIntelligence: initializeIntelligence,
  };
};
