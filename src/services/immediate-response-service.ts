/**
 * Immediate Response Service - Placeholder for Phase 1 Validation
 * Generates instant responses using cached data for <200ms response times
 */

export interface ImmediateResponseData {
  content: string;
  processingTime: number;
  dataSource: 'cached_blueprint' | 'cached_intelligence' | 'fallback';
}

export class ImmediateResponseService {
  static async generateImmediateResponse(
    content: string,
    userId: string,
    agentMode: string,
    accumulatedIntelligence?: any
  ): Promise<ImmediateResponseData> {
    const startTime = Date.now();
    
    console.log('🟢 IMMEDIATE RESPONSE SERVICE: Processing instant response', {
      userId,
      agentMode,
      messageLength: content.length,
      timestamp: new Date().toISOString()
    });

    try {
      // Import here to avoid circular dependencies
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Get cached blueprint data for personalized response
      const { data: blueprint, error: blueprintError } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      // Get cached intelligence scores
      const { data: intelligence, error: intelligenceError } = await supabase
        .from('hacs_intelligence')
        .select('module_scores, intelligence_level')
        .eq('user_id', userId)
        .maybeSingle();

      let responseContent: string;
      let dataSource: 'cached_blueprint' | 'cached_intelligence' | 'fallback';

      if (blueprint?.blueprint && !blueprintError) {
        // Use MBTI data for personalized immediate response
        const blueprintData = blueprint.blueprint as any;
        const mbtiType = blueprintData?.cognition_mbti?.type || 'Unknown';
        const userName = blueprintData?.user_meta?.preferred_name || 'there';
        
        responseContent = this.generatePersonalizedResponse(content, mbtiType, userName, agentMode, accumulatedIntelligence);
        dataSource = 'cached_blueprint';
        
        console.log('✅ IMMEDIATE RESPONSE: Using cached blueprint data + accumulated intelligence', { 
          mbtiType, 
          userName,
          hasAccumulatedIntelligence: !!accumulatedIntelligence 
        });
        
      } else if (intelligence && !intelligenceError) {
        // Use intelligence level for basic personalization
        const level = intelligence.intelligence_level || 0;
        responseContent = this.generateIntelligenceResponse(content, level, agentMode, accumulatedIntelligence);
        dataSource = 'cached_intelligence';
        
        console.log('✅ IMMEDIATE RESPONSE: Using cached intelligence data + accumulated intelligence', { 
          intelligenceLevel: level,
          hasAccumulatedIntelligence: !!accumulatedIntelligence 
        });
        
      } else {
        // Fallback to empathetic acknowledgment
        responseContent = this.generateFallbackResponse(content, agentMode);
        dataSource = 'fallback';
        
        console.log('⚠️ IMMEDIATE RESPONSE: Using fallback response', { 
          blueprintError: blueprintError?.message,
          intelligenceError: intelligenceError?.message 
        });
      }

      const response: ImmediateResponseData = {
        content: responseContent,
        processingTime: Date.now() - startTime,
        dataSource
      };

      console.log('✅ IMMEDIATE RESPONSE SERVICE: Response generated', {
        processingTime: response.processingTime,
        dataSource: response.dataSource,
        contentLength: response.content.length
      });

      return response;
      
    } catch (error) {
      console.error('❌ IMMEDIATE RESPONSE SERVICE: Error accessing cached data', error);
      
      const fallbackResponse: ImmediateResponseData = {
        content: this.generateFallbackResponse(content, agentMode),
        processingTime: Date.now() - startTime,
        dataSource: 'fallback'
      };
      
      return fallbackResponse;
    }
  }

  private static generatePersonalizedResponse(content: string, mbtiType: string, userName: string, agentMode: string, accumulatedIntelligence?: any): string {
    // ENHANCED WITH DEEP CONTEXT: Use accumulated intelligence to inform immediate response
    const hasDeepContext = accumulatedIntelligence && Object.keys(accumulatedIntelligence).length > 0;
    
    if (hasDeepContext) {
      console.log('🧠 ENHANCED RESPONSE: Using accumulated intelligence for deeper context');
      
      const contextualResponses = {
        'INTJ': `${userName}, I've been processing our conversation patterns and I can see how this connects to your systematic approach. Let me integrate what I've learned about your thinking style.`,
        'ENFP': `${userName}, based on our journey together, I can sense this aligns with your authentic path. There's a deeper pattern here that I'm seeing.`,
        'ISFJ': `${userName}, drawing from our conversations, I can tell this touches on something that matters deeply to you. Let me respond with the context I've built.`,
        'ESTP': `${userName}, knowing your action-oriented nature and what we've explored together, I can see exactly where you're going with this.`
      };
      
      return contextualResponses[mbtiType as keyof typeof contextualResponses] || 
             `${userName}, building on our conversation history, I can see how this fits into your larger picture. Let me respond with full context.`;
    }
    
    // Standard responses without deep context
    const responses = {
      'INTJ': `I can see you're processing something complex, ${userName}. Your strategic mind is probably already considering multiple angles - let me help you organize these thoughts.`,
      'ENFP': `${userName}, I sense the energy and possibility in what you're sharing. There's something meaningful here that we can explore together.`,
      'ISFJ': `Thank you for sharing this with me, ${userName}. I can tell this matters to you, and I want to make sure we address it thoughtfully.`,
      'ESTP': `${userName}, let's dive right into this. I'm here to help you tackle whatever's on your mind head-on.`
    };
    
    return responses[mbtiType as keyof typeof responses] || 
           `I hear you, ${userName}. Let me think about this while I process your message more deeply.`;
  }

  private static generateIntelligenceResponse(content: string, intelligenceLevel: number, agentMode: string, accumulatedIntelligence?: any): string {
    // ENHANCED WITH DEEP CONTEXT: Use accumulated intelligence for deeper responses
    const hasDeepContext = accumulatedIntelligence && Object.keys(accumulatedIntelligence).length > 0;
    
    if (hasDeepContext) {
      console.log('🧠 ENHANCED INTELLIGENCE RESPONSE: Leveraging accumulated insights');
      if (intelligenceLevel > 70) {
        return "Drawing from the patterns I've been analyzing in our conversations, I can see deeper connections in what you're sharing. Let me respond with full context.";
      } else if (intelligenceLevel > 30) {
        return "I've been building understanding from our interactions, and this connects to insights I've gathered. Let me integrate that context.";
      } else {
        return "Even from our brief interactions, I can see patterns forming. Let me use what I've learned to respond more meaningfully.";
      }
    }
    
    // Standard responses without deep context
    if (intelligenceLevel > 70) {
      return "I can see the depth in what you're sharing. Let me process this with the full context of our journey together.";
    } else if (intelligenceLevel > 30) {
      return "I'm listening carefully. Let me think about this while I gather more insight into your situation.";
    } else {
      return "Thank you for sharing that with me. I'm here to help - let me process this thoughtfully.";
    }
  }

  private static generateFallbackResponse(content: string, agentMode: string): string {
    return "I understand you've shared something important. Let me think about this while I process your message more deeply.";
  }
}