/**
 * Conversation State Detection Service
 * Implements intent routing for reflect vs plan vs close decisions
 * Integrates with existing memory and semantic systems
 */

import { supabase } from '@/integrations/supabase/client';

export interface ConversationState {
  isActive: boolean;
  userSatisfied: boolean;
  closureSignalDetected: boolean;
  lastInteractionType: 'gratitude' | 'closure' | 'continuation' | 'neutral';
  shouldAskQuestion: boolean;
  intent: 'reflect' | 'plan' | 'close' | 'neutral';
}

export class ConversationStateService {
  private static instance: ConversationStateService;

  static getInstance(): ConversationStateService {
    if (!this.instance) {
      this.instance = new ConversationStateService();
    }
    return this.instance;
  }

  /**
   * Detect conversation state and determine intent routing
   * Routes between reflect vs plan vs close based on user signals
   */
  detectConversationState(message: string, conversationHistory: any[] = []): ConversationState {
    // ✅ Layer 1: Defensive guard clause - prevent undefined.trim() crash
    if (!message || typeof message !== 'string') {
      console.error('❌ CONVERSATION STATE: Invalid message parameter', { 
        messageType: typeof message, 
        messageValue: message 
      });
      
      // Return neutral state instead of crashing
      return {
        isActive: false,
        userSatisfied: false,
        closureSignalDetected: false,
        lastInteractionType: 'neutral',
        shouldAskQuestion: false,
        intent: 'neutral'
      };
    }
    
    console.log('🎯 CONVERSATION STATE: Valid message received, analyzing...');
    const cleanMessage = message.trim().toLowerCase();
    
    // Gratitude patterns - strong signal for satisfaction
    const gratitudePatterns = [
      /\b(thank\s*you|thanks|thx|appreciate)\b/i,
      /\b(grateful|perfect|great|excellent)\b/i,
      /\b(exactly what i needed|that helps)\b/i
    ];

    // Closure patterns - direct signals for ending
    const closurePatterns = [
      /\b(that'?s\s*(it|all)|that is it)\b/i,
      /\b(for now|good for now)\b/i,
      /\b(no more|nothing else|i'?m done)\b/i,
      /\b(bye|goodbye|talk later|see you)\b/i,
      /\b(end|stop|enough)\b/i
    ];

    // Planning patterns - signals for action-oriented guidance  
    const planningPatterns = [
      /\b(what should i|what do you think i should|any suggestions|any advice)\b/i,
      /\b(recommend|suggest|what would you|what next|where do i go)\b/i,
      /\b(help me understand|guide me|show me the way)\b/i,
      /\b(please advise|your thoughts|what's your take)\b/i,
      /\b(any ideas|thoughts on|what do you suggest)\b/i,
      /\b(how do i|steps|action|plan|strategy)\b/i
    ];

    // Reflection patterns - signals for deeper exploration
    const reflectionPatterns = [
      /\b(tell me more|explain further|elaborate|go deeper)\b/i,
      /\b(what else|anything else|more about)\b/i,
      /\b(i want to know more|can you expand|give me more details)\b/i,
      /\b(help me explore|understand better|dive deeper)\b/i,
      /\b(what does this mean|significance|why)\b/i
    ];

    const hasGratitude = gratitudePatterns.some(pattern => pattern.test(cleanMessage));
    const hasClosure = closurePatterns.some(pattern => pattern.test(cleanMessage));
    const hasPlanning = planningPatterns.some(pattern => pattern.test(cleanMessage));
    const hasReflection = reflectionPatterns.some(pattern => pattern.test(cleanMessage));

    // Determine primary intent based on strongest signal
    let intent: 'reflect' | 'plan' | 'close' | 'neutral' = 'neutral';
    let lastInteractionType: 'gratitude' | 'closure' | 'continuation' | 'neutral' = 'neutral';
    
    if (hasGratitude && hasClosure) {
      intent = 'close';
      lastInteractionType = 'closure';
    } else if (hasClosure) {
      intent = 'close';
      lastInteractionType = 'closure';
    } else if (hasPlanning) {
      intent = 'plan';
      lastInteractionType = 'continuation';
    } else if (hasReflection) {
      intent = 'reflect';
      lastInteractionType = 'continuation';
    } else if (hasGratitude) {
      intent = 'neutral';
      lastInteractionType = 'gratitude';
    }

    // Calculate state flags
    const closureSignalDetected = hasGratitude || hasClosure;
    const userSatisfied = hasGratitude || (hasClosure && !hasPlanning && !hasReflection);
    const isActive = hasPlanning || hasReflection;
    const shouldAskQuestion = hasPlanning || hasReflection;

    return {
      isActive,
      userSatisfied,
      closureSignalDetected,
      lastInteractionType,
      shouldAskQuestion,
      intent
    };
  }

  /**
   * Store conversation state for progressive memory and intelligence learning
   */
  async storeConversationState(
    threadId: string,
    userId: string,
    state: ConversationState,
    userMessage: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('user_activities')
        .insert({
          user_id: userId,
          activity_type: 'conversation_state_detected',
          activity_data: {
            threadId,
            conversationState: {
              isActive: state.isActive,
              userSatisfied: state.userSatisfied,
              closureSignalDetected: state.closureSignalDetected,
              lastInteractionType: state.lastInteractionType,
              shouldAskQuestion: state.shouldAskQuestion,
              intent: state.intent
            },
            messageIntent: state.intent,
            userMessage: userMessage.substring(0, 100), // Store snippet for analysis
            timestamp: new Date().toISOString()
          }
        });

      if (error) {
        console.error('❌ CONVERSATION STATE: Failed to store state:', error);
        return false;
      }

      console.log('✅ CONVERSATION STATE: State stored for intelligence learning', {
        intent: state.intent,
        satisfied: state.userSatisfied,
        active: state.isActive
      });
      
      return true;
    } catch (error) {
      console.error('❌ CONVERSATION STATE: Storage error:', error);
      return false;
    }
  }
}

export const conversationStateService = ConversationStateService.getInstance();