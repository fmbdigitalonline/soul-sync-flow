import { supabase } from '@/integrations/supabase/client';

/**
 * PHASE 3.7: Learning Interactions XP Integration
 * 
 * Awards XP for educational interactions and knowledge retention.
 * Maps interaction quality and knowledge retention to LVP (Learning Velocity Practice) XP.
 */
export async function awardLearningInteractionXP(
  userId: string,
  interactionQuality: number,
  knowledgeRetained: boolean,
  interactionType: string = 'general'
): Promise<void> {
  // Calculate LVP XP: interactionQuality * 2 (max 2 XP)
  const lvpXP = Math.min(2, interactionQuality * 2);
  const quality = interactionQuality;

  const kinds = knowledgeRetained
    ? ['learning.interaction', 'learning.retained', `learning.${interactionType}`]
    : ['learning.interaction', `learning.${interactionType}`];

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { LVP: lvpXP },
        quality,
        kinds,
        source: 'learning-interaction'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award learning XP:', error);
    } else {
      console.log('✅ Learning Interaction XP awarded:', { 
        lvpXP, 
        quality, 
        knowledgeRetained,
        deltaXP: data?.deltaXP 
      });
    }
  } catch (error) {
    console.error('❌ Learning XP integration error:', error);
  }
}

/**
 * Award XP for completing educational content
 */
export async function awardContentCompletionXP(
  userId: string,
  contentType: 'article' | 'video' | 'exercise' | 'course',
  completionQuality: number
): Promise<void> {
  const lvpXP = Math.min(2, completionQuality * 2);

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { LVP: lvpXP },
        quality: completionQuality,
        kinds: ['learning.content', `content.${contentType}`, 'learning.completion'],
        source: 'content-completion'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award content completion XP:', error);
    } else {
      console.log('✅ Content Completion XP awarded:', { lvpXP, contentType, deltaXP: data?.deltaXP });
    }
  } catch (error) {
    console.error('❌ Content XP integration error:', error);
  }
}

/**
 * Award XP for demonstrating knowledge application
 */
export async function awardKnowledgeApplicationXP(
  userId: string,
  applicationQuality: number,
  domain: string
): Promise<void> {
  const lvpXP = Math.min(3, applicationQuality * 3); // Higher cap for application

  try {
    const { data, error } = await supabase.functions.invoke('xp-award-service', {
      body: {
        userId,
        dims: { LVP: lvpXP },
        quality: applicationQuality,
        kinds: ['learning.application', `domain.${domain}`, 'knowledge.demonstrated'],
        source: 'knowledge-application'
      }
    });

    if (error) {
      console.error('⚠️ Failed to award application XP:', error);
    } else {
      console.log('✅ Knowledge Application XP awarded:', { lvpXP, domain, deltaXP: data?.deltaXP });
    }
  } catch (error) {
    console.error('❌ Application XP integration error:', error);
  }
}
