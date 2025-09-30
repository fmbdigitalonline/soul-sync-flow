import { supabase } from '@/integrations/supabase/client';

/**
 * PHASE 3.5: VFP-Graph XP Integration
 * 
 * Awards XP when personality blueprints are processed and applied.
 * Maps blueprint completeness and coherence to PCP (Personality Coherence Practice) XP.
 */
export async function awardVFPProcessingXP(
  userId: string,
  blueprintExists: boolean,
  coherenceScore?: number
): Promise<void> {
  // Base PCP XP: 3 for blueprint processing, 1 for no blueprint
  const pcpXP = blueprintExists ? 3 : 1;
  const quality = coherenceScore || (blueprintExists ? 0.8 : 0.3);

  const kinds = blueprintExists 
    ? ['vfp.processing', 'personality.applied', 'blueprint.coherence']
    : ['vfp.processing', 'personality.minimal'];

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { PCP: pcpXP },
        quality,
        kinds,
        source: 'vfp-processing'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award VFP XP:', error);
    } else {
      console.log('✅ VFP Processing XP awarded:', { pcpXP, quality, blueprintExists, deltaXP: data?.deltaXP });
    }
  } catch (error) {
    console.error('❌ VFP XP integration error:', error);
  }
}

/**
 * Award XP for personality coherence improvements
 */
export async function awardCoherenceImprovementXP(
  userId: string,
  coherenceImprovement: number
): Promise<void> {
  // Scale coherence improvement (0-1) to PCP XP (0-3)
  const pcpXP = Math.min(3, coherenceImprovement * 3);
  const quality = coherenceImprovement;

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { PCP: pcpXP },
        quality,
        kinds: ['vfp.coherence', 'personality.improvement', 'alignment.increased'],
        source: 'vfp-coherence'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award coherence XP:', error);
    } else {
      console.log('✅ Coherence Improvement XP awarded:', { pcpXP, quality, deltaXP: data?.deltaXP });
    }
  } catch (error) {
    console.error('❌ Coherence XP integration error:', error);
  }
}
