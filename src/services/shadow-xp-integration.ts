import { supabase } from '@/integrations/supabase/client';
import { ShadowPattern } from './conversation-shadow-detector';

/**
 * PHASE 3.3: Shadow Detection XP Integration
 * 
 * Awards XP when shadow patterns are detected with sufficient confidence.
 * Maps pattern confidence and emotional intensity to SIP (Shadow Integration Practice) XP.
 */
export async function awardShadowDetectionXP(
  userId: string,
  pattern: ShadowPattern
): Promise<void> {
  // Only award XP for high-confidence patterns
  if (pattern.confidence < 0.6) {
    console.log('🔍 Shadow pattern confidence too low for XP:', pattern.confidence);
    return;
  }

  // Calculate SIP XP: confidence * emotionalIntensity * 6 (max 6 XP)
  const sipXP = Math.min(6, pattern.confidence * pattern.emotionalIntensity * 6);
  const quality = pattern.confidence;

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { SIP: sipXP },
        quality,
        kinds: [
          'shadow.detection',
          `shadow.${pattern.type}`,
          pattern.emotionalIntensity > 0.8 ? 'shadow.high_intensity' : 'shadow.moderate'
        ],
        source: 'shadow-detection'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award shadow detection XP:', error);
    } else {
      console.log('✅ Shadow Detection XP awarded:', { 
        sipXP, 
        quality, 
        patternType: pattern.type,
        deltaXP: data?.deltaXP 
      });
    }
  } catch (error) {
    console.error('❌ Shadow XP integration error:', error);
  }
}

/**
 * Call this from real-time shadow detector when patterns are found
 */
export async function awardLiveShadowXP(
  userId: string,
  patterns: ShadowPattern[]
): Promise<void> {
  for (const pattern of patterns) {
    await awardShadowDetectionXP(userId, pattern);
  }
}

/**
 * Batch award XP for multiple shadow patterns detected in one session
 */
export async function awardBatchShadowXP(
  userId: string,
  patterns: ShadowPattern[]
): Promise<void> {
  const highConfidencePatterns = patterns.filter(p => p.confidence >= 0.6);

  if (highConfidencePatterns.length === 0) {
    console.log('🔍 No high-confidence patterns for XP award');
    return;
  }

  // Calculate aggregate SIP XP (capped at 6 per pattern)
  const totalSipXP = Math.min(
    20, // Max 20 XP in one batch
    highConfidencePatterns.reduce((sum, p) => 
      sum + Math.min(6, p.confidence * p.emotionalIntensity * 6), 
      0
    )
  );

  const avgQuality = highConfidencePatterns.reduce((sum, p) => sum + p.confidence, 0) / highConfidencePatterns.length;

  const allKinds = [
    'shadow.detection.batch',
    ...new Set(highConfidencePatterns.map(p => `shadow.${p.type}`)),
    `shadow.count_${highConfidencePatterns.length}`
  ];

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { SIP: totalSipXP },
        quality: avgQuality,
        kinds: allKinds,
        source: 'shadow-detection-batch'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award batch shadow XP:', error);
    } else {
      console.log('✅ Batch Shadow XP awarded:', { 
        totalSipXP, 
        patternCount: highConfidencePatterns.length,
        deltaXP: data?.deltaXP 
      });
    }
  } catch (error) {
    console.error('❌ Batch shadow XP error:', error);
  }
}
