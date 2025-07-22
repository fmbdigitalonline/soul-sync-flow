// SoulSync Conversation Message Type System
// Following SoulSync Principle 1: Never Break or Remove Functionality
// This extends existing messageType field additively

export type ConversationMessageType = 
  | 'conversation'        // Standard conversation messages (default)
  | 'cnr_clarification'   // CNR clarifying questions for floating orb
  | 'system_insight'      // System-generated insights
  | 'micro_learning'      // HACS micro-learning questions
  | 'autonomous_text'     // Autonomous text generation
  | 'steward_introduction' // Steward introduction messages
  | 'vfp_feedback'        // VFP graph feedback requests

export interface CNRClarificationData {
  conflictId: string;
  expectedAnswerType: 'choice' | 'scale' | 'text' | 'priority';
  options?: string[];
  context: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ConversationRouting {
  targetChannel: 'main_conversation' | 'floating_orb' | 'insight_display' | 'notification';
  messageType: ConversationMessageType;
  metadata?: {
    cnrData?: CNRClarificationData;
    moduleSource?: string;
    priority?: number;
    requiresResponse?: boolean;
  };
}

// Message classification utilities
export class MessageTypeClassifier {
  
  /**
   * Classify message type based on content and source
   * Following SoulSync Principle 7: Build Transparently, Not Silently
   */
  static classifyMessage(
    content: string, 
    source: string, 
    context?: any
  ): ConversationMessageType {
    
    // Log classification for transparency
    console.log('🔍 Message Type Classifier:', { content: content.substring(0, 50), source, context });
    
    // CNR clarifying questions - route to floating orb
    if (source === 'CNR' && this.isClarifyingQuestion(content)) {
      console.log('✅ Classified as CNR clarification - routing to floating orb');
      return 'cnr_clarification';
    }
    
    // HACS micro-learning questions
    if (context?.isQuestion || content.includes('learning session')) {
      console.log('✅ Classified as micro-learning question');
      return 'micro_learning';
    }
    
    // System insights
    if (source.includes('insight') || content.includes('I noticed')) {
      console.log('✅ Classified as system insight');
      return 'system_insight';
    }
    
    // Default to conversation
    console.log('✅ Classified as standard conversation');
    return 'conversation';
  }
  
  /**
   * Determine target channel for message routing
   * Following SoulSync Principle 6: Integrate Within Current Unified Architecture
   */
  static determineTargetChannel(messageType: ConversationMessageType): ConversationRouting['targetChannel'] {
    
    switch (messageType) {
      case 'cnr_clarification':
        return 'floating_orb';
      case 'system_insight':
        return 'insight_display';
      case 'micro_learning':
        return 'floating_orb';
      case 'conversation':
      default:
        return 'main_conversation';
    }
  }
  
  /**
   * Create routing information for message
   * Following SoulSync Principle 2: No Hardcoded or Simulated Data
   */
  static createRouting(
    messageType: ConversationMessageType,
    metadata?: ConversationRouting['metadata']
  ): ConversationRouting {
    
    return {
      targetChannel: this.determineTargetChannel(messageType),
      messageType,
      metadata: metadata || {}
    };
  }
  
  /**
   * Check if content is a clarifying question
   * Following SoulSync Principle 7: Build Transparently, Not Silently
   */
  private static isClarifyingQuestion(content: string): boolean {
    const clarifyingPatterns = [
      'help me understand',
      'which better represents',
      'what would you say',
      'how would you describe',
      'which option',
      'can you clarify',
      'preference.*changed',
      'better represents how you feel'
    ];
    
    const isQuestion = clarifyingPatterns.some(pattern => 
      new RegExp(pattern, 'i').test(content)
    );
    
    if (isQuestion) {
      console.log('🎯 Detected clarifying question pattern in content');
    }
    
    return isQuestion;
  }
  
  /**
   * Extract CNR clarification data from message
   * Following SoulSync Principle 2: No Hardcoded or Simulated Data
   */
  static extractCNRData(content: string, context?: any): CNRClarificationData | null {
    
    if (!context?.conflictId) {
      console.log('⚠️ No conflict ID found in context - cannot extract CNR data');
      return null;
    }
    
    // Extract options if present
    const optionsMatch = content.match(/\[(.*?)\]/);
    const options = optionsMatch ? optionsMatch[1].split(',').map(s => s.trim()) : undefined;
    
    return {
      conflictId: context.conflictId,
      expectedAnswerType: this.determineAnswerType(content, options),
      options,
      context: context.conflictContext || 'personality_resolution',
      priority: this.determinePriority(content)
    };
  }
  
  /**
   * Determine expected answer type from question content
   */
  private static determineAnswerType(content: string, options?: string[]): CNRClarificationData['expectedAnswerType'] {
    
    if (options && options.length > 1) return 'choice';
    if (content.includes('scale') || content.includes('rate')) return 'scale';
    if (content.includes('priority') || content.includes('rank')) return 'priority';
    return 'text';
  }
  
  /**
   * Determine priority level from content urgency
   */
  private static determinePriority(content: string): CNRClarificationData['priority'] {
    
    if (content.includes('important') || content.includes('critical')) return 'high';
    if (content.includes('when you have time') || content.includes('optional')) return 'low';
    return 'medium';
  }
}

// Export for backward compatibility
export type { ConversationMessage } from '../hooks/use-hacs-conversation';