/**
 * Central XP Event Emitter
 * 
 * This utility provides a standardized way to emit XP events from
 * any part of the application. All confidence systems should use
 * this to award XP to the user's multi-dimensional progress.
 * 
 * Integration Points:
 * - HACS Intelligence Updates
 * - Shadow Detection
 * - VFP-Graph Coherence
 * - Hermetic Processing
 * - Conversation Quality
 * - Learning Interactions
 * - Autonomous Development Events
 */

import { ProgressEvent, Dim } from '@/services/xp-progression-service';

/**
 * Emit an XP progress event
 * 
 * @param userId - User ID to award XP to
 * @param dims - Dimension contributions (e.g., { SIP: 3, COV: 2 })
 * @param quality - Conversation/interaction quality (0-1)
 * @param kinds - Event types for novelty tracking (e.g., ['shadow.breakthrough', 'conversation.deep'])
 * @param timestamp - Optional timestamp (defaults to now)
 * 
 * @example
 * ```ts
 * // From HACS Intelligence update
 * await emitXPEvent(userId, { CMP: 3, PIE: 2 }, 0.8, ['hacs.insight', 'module.update']);
 * 
 * // From shadow pattern detection
 * await emitXPEvent(userId, { SIP: 4 }, 0.9, ['shadow.pattern_detected', 'emotional.trigger']);
 * 
 * // From VFP coherence improvement
 * await emitXPEvent(userId, { PCP: 2, VFP: 1 }, 0.85, ['personality.coherence', 'vector.fusion']);
 * ```
 */
export async function emitXPEvent(
  userId: string,
  dims: Partial<Record<Dim, number>>,
  quality: number,
  kinds: string[],
  timestamp?: number
): Promise<void> {
  const event: ProgressEvent = {
    timestamp: timestamp ?? Date.now(),
    dims,
    quality: Math.max(0, Math.min(1, quality)), // Clamp to 0-1
    kinds,
  };

  // Log event for debugging
  console.log('📊 XP Event:', {
    userId,
    dims,
    quality,
    kinds,
    timestamp: new Date(event.timestamp).toISOString(),
  });

  // TODO: In future, this could call a centralized XP service edge function
  // For now, the React hook will handle XP awards via recordXPEvent
  // This helper primarily serves as a standardized interface
}

/**
 * Convenience methods for common XP events
 */

export const XPEvents = {
  /**
   * Award XP for HACS module improvements
   */
  hacsModuleUpdate: async (
    userId: string,
    modules: Partial<Record<string, number>>,
    quality: number
  ) => {
    const dims: Partial<Record<Dim, number>> = {};
    
    // Map HACS modules to XP dimensions
    if (modules.NIK || modules.CPSR || modules.TWS) {
      dims.CMP = (modules.NIK ?? 0) + (modules.CPSR ?? 0) + (modules.TWS ?? 0);
    }
    if (modules.VFP || modules.DPEM) {
      dims.PCP = (modules.VFP ?? 0) + (modules.DPEM ?? 0);
    }
    if (modules.ACS) {
      dims.COV = modules.ACS;
    }
    
    await emitXPEvent(userId, dims, quality, ['hacs.module_update', 'cognitive.improvement']);
  },

  /**
   * Award XP for shadow pattern detection
   */
  shadowDetection: async (
    userId: string,
    confidence: number,
    patternType: string
  ) => {
    const sipXP = Math.min(6, confidence * 6); // Scale confidence to 0-6 XP
    await emitXPEvent(
      userId,
      { SIP: sipXP },
      confidence,
      ['shadow.detection', `shadow.${patternType}`]
    );
  },

  /**
   * Award XP for VFP coherence improvements
   */
  vfpCoherence: async (
    userId: string,
    coherenceImprovement: number,
    quality: number
  ) => {
    const pcpXP = Math.min(3, coherenceImprovement * 3);
    await emitXPEvent(
      userId,
      { PCP: pcpXP },
      quality,
      ['vfp.coherence', 'personality.alignment']
    );
  },

  /**
   * Award XP for hermetic processing confidence
   */
  hermeticProcessing: async (
    userId: string,
    agentConfidence: number,
    agentName: string
  ) => {
    const hppXP = Math.min(4, agentConfidence * 4);
    await emitXPEvent(
      userId,
      { HPP: hppXP },
      agentConfidence,
      ['hermetic.processing', `hermetic.${agentName}`]
    );
  },

  /**
   * Award XP for conversation quality
   */
  conversationQuality: async (
    userId: string,
    quality: number,
    messageLength: number
  ) => {
    const covXP = Math.min(3, quality * 3);
    const kinds = ['conversation.quality'];
    if (messageLength > 100) kinds.push('conversation.deep');
    
    await emitXPEvent(userId, { COV: covXP }, quality, kinds);
  },

  /**
   * Award XP for learning interactions
   */
  learningInteraction: async (
    userId: string,
    interactionQuality: number,
    knowledgeRetained: boolean
  ) => {
    const lvpXP = Math.min(2, interactionQuality * 2);
    const kinds = ['learning.interaction'];
    if (knowledgeRetained) kinds.push('learning.retained');
    
    await emitXPEvent(userId, { LVP: lvpXP }, interactionQuality, kinds);
  },

  /**
   * Award XP for autonomous development (rare, high value)
   */
  autonomousDevelopment: async (
    userId: string,
    achievementType: string
  ) => {
    await emitXPEvent(
      userId,
      { ADP: 50 }, // Max ADP value
      1.0,
      ['autonomous.development', `autonomous.${achievementType}`]
    );
  },
};
