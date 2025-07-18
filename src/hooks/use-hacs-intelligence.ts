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

  // Authentic intelligence system - NO hardcoded boosts
  const checkBlueprintCompletion = useCallback(async (userId: string) => {
    // REMOVED: No more blueprint boosts - all users start at 0%
    console.log('Starting authentic learning at 0% intelligence');
    return 0;
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
        .maybeSingle();

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
        // Authentic intelligence system - start at 0%
        console.log('Creating authentic HACS intelligence starting at 0%');

        // All users start with zero intelligence - no boosts
        const initialModuleScores: ModuleScores = {
          NIK: 0,
          CPSR: 0,
          TWS: 0,
          HFME: 0,
          DPEM: 0,
          CNR: 0,
          BPSC: 0,
          ACS: 0,
          PIE: 0,
          VFP: 0,
          TMG: 0,
        };

        const { data: newIntelligence, error: createError } = await supabase
          .from('hacs_intelligence')
          .insert({
            id: crypto.randomUUID(), // Generate explicit ID
            user_id: user.id,
            intelligence_level: 0, // Start at 0% - no fake boosts
            module_scores: initialModuleScores as any,
            interaction_count: 0,
            last_update: new Date().toISOString(),
            pie_score: 0,
            vfp_score: 0,
            tmg_score: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (createError) throw createError;
        setIntelligence({
          ...newIntelligence,
          module_scores: initialModuleScores,
          pie_score: 0,
          vfp_score: 0,
          tmg_score: 0,
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to initialize intelligence');
      console.error('Failed to initialize HACS intelligence:', err);
    } finally {
      setLoading(false);
    }
  }, [checkBlueprintCompletion]);

  // Update intelligence level based on user interactions (enhanced with personality weighting)
  const updateIntelligenceWithPersonality = useCallback(async (
    moduleUpdates: Partial<ModuleScores>,
    interactionQuality: number = 1, // 0-1 multiplier for interaction quality
    personalityContext?: any // NEW: Optional personality context for weighting
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user || !intelligence) return;

      // Calculate new module scores with personality weighting
      const currentScores = intelligence.module_scores;
      const newModuleScores = { ...currentScores };
      
      Object.entries(moduleUpdates).forEach(([module, improvement]) => {
        const currentScore = newModuleScores[module as keyof ModuleScores] || 0;
        let adjustedImprovement = improvement * interactionQuality;
        
        // NEW: Apply personality weighting if context provided
        if (personalityContext) {
          adjustedImprovement = applyPersonalityWeighting(
            module, 
            adjustedImprovement, 
            personalityContext
          );
        }
        
        newModuleScores[module as keyof ModuleScores] = Math.min(100, currentScore + adjustedImprovement);
      });

      // Calculate overall intelligence level (average of all 11 modules)
      const moduleValues = Object.values(newModuleScores);
      const newIntelligenceLevel = moduleValues.reduce((sum, score) => sum + score, 0) / moduleValues.length;

      // Update database with UPSERT to prevent duplicate user errors
      const { data: updated, error: updateError } = await supabase
        .from('hacs_intelligence')
        .upsert({
          id: intelligence.id, // Include existing ID for proper UPSERT
          user_id: user.id,
          intelligence_level: Math.round(newIntelligenceLevel),
          module_scores: newModuleScores as any,
          interaction_count: intelligence.interaction_count + 1,
          last_update: new Date().toISOString(),
          pie_score: Math.round(newModuleScores.PIE),
          vfp_score: Math.round(newModuleScores.VFP),
          tmg_score: Math.round(newModuleScores.TMG),
          created_at: intelligence.created_at, // Preserve creation timestamp
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (updateError) {
        console.error('Failed to update HACS intelligence:', updateError);
        throw updateError;
      }

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

  // Keep original update method for backward compatibility
  const updateIntelligence = useCallback(async (
    moduleUpdates: Partial<ModuleScores>,
    interactionQuality: number = 1
  ) => {
    return updateIntelligenceWithPersonality(moduleUpdates, interactionQuality);
  }, [updateIntelligenceWithPersonality]);

  // NEW: Apply personality weighting to learning improvements
  const applyPersonalityWeighting = useCallback((
    module: string,
    improvement: number,
    personalityContext: any
  ): number => {
    // Default weighting
    let weightingFactor = 1.0;
    
    // Apply personality-specific learning multipliers
    const mbtiType = personalityContext?.cognitiveTemperamental?.mbtiType;
    const humanDesignType = personalityContext?.energyDecisionStrategy?.humanDesignType;
    
    // Adjust based on cognitive preferences
    if (mbtiType) {
      // Thinking types learn logic modules faster
      if (['NIK', 'CPSR', 'TWS'].includes(module) && mbtiType.includes('T')) {
        weightingFactor *= 1.2;
      }
      // Feeling types learn emotion/personality modules faster  
      if (['DPEM', 'CNR', 'ACS'].includes(module) && mbtiType.includes('F')) {
        weightingFactor *= 1.2;
      }
      // Intuitive types learn pattern modules faster
      if (['PIE', 'VFP', 'TMG'].includes(module) && mbtiType.includes('N')) {
        weightingFactor *= 1.15;
      }
    }
    
    // Adjust based on energy strategy
    if (humanDesignType === 'Generator' && ['ACS', 'PIE'].includes(module)) {
      weightingFactor *= 1.1; // Generators excel at response and creation
    } else if (humanDesignType === 'Projector' && ['CNR', 'HFME'].includes(module)) {
      weightingFactor *= 1.15; // Projectors excel at guidance and systems
    }
    
    return improvement * weightingFactor;
  }, []);

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
    updateIntelligenceWithPersonality, // NEW: Enhanced method with personality weighting
    recordConversationInteraction,
    getIntelligencePhase,
    isAutonomousUnlocked,
    getModuleInfo,
    refreshIntelligence: initializeIntelligence,
  };
};
