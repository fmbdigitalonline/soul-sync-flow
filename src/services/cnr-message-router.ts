// CNR Message Router Service
// Following SoulSync Principle 1: Never Break or Remove Functionality
// This routes CNR clarifying questions to the floating orb queue additively

import { conflictNavigationResolution, ClarifyingQuestion } from './hermetic-core/conflict-navigation-resolution';
import { ConversationMessageType, MessageTypeClassifier } from '../types/conversation-types';

export interface CNRRoutingEvent {
  type: 'clarification_generated' | 'clarification_answered' | 'conflict_resolved';
  data: {
    question?: ClarifyingQuestion;
    conflictId?: string;
    response?: any;
    timestamp: string;
  };
}

/**
 * CNR Message Router - Routes CNR clarifications to floating orb
 * Following SoulSync Principle 6: Integrate Within Current Unified Architecture
 */
export class CNRMessageRouter {
  private static instance: CNRMessageRouter;
  private routingListeners: ((event: CNRRoutingEvent) => void)[] = [];
  private isInitialized = false;

  static getInstance(): CNRMessageRouter {
    if (!CNRMessageRouter.instance) {
      CNRMessageRouter.instance = new CNRMessageRouter();
    }
    return CNRMessageRouter.instance;
  }

  /**
   * Initialize the router - Following SoulSync Principle 7: Build Transparently
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.log('🔄 CNR Router: Already initialized');
      return;
    }

    console.log('🔄 CNR Router: Initializing message routing to floating orb');
    
    // Check for existing CNR questions in conversations and route them
    await this.checkExistingCNRQuestions();
    
    this.isInitialized = true;
  }

  /**
   * Check for existing CNR questions in conversation data and route them
   * Following SoulSync Principle 2: No Hardcoded or Simulated Data
   */
  private async checkExistingCNRQuestions(): Promise<void> {
    try {
      console.log('🔍 CNR Router: Checking for existing CNR questions in conversations');
      
      // This would require Supabase access - for now, just check the CNR service
      await this.checkAndRoutePendingClarifications();
      
    } catch (error) {
      console.error('❌ CNR Router: Failed to check existing CNR questions:', error);
    }
  }

  /**
   * Check for pending CNR clarifications and route to floating orb
   * Following SoulSync Principle 2: No Hardcoded or Simulated Data
   */
  async checkAndRoutePendingClarifications(): Promise<ClarifyingQuestion[]> {
    try {
      console.log('🔍 CNR Router: Checking for pending clarifications');
      
      // Get real pending questions from CNR service
      const pendingQuestions = conflictNavigationResolution.getPendingQuestions();
      
      if (pendingQuestions.length === 0) {
        console.log('✅ CNR Router: No pending clarifications found');
        return [];
      }

      console.log(`🎯 CNR Router: Found ${pendingQuestions.length} pending clarifications - routing to floating orb`);
      
      // Route each question to floating orb
      for (const question of pendingQuestions) {
        await this.routeQuestionToFloatingOrb(question);
      }

      return pendingQuestions;

    } catch (error) {
      // Following SoulSync Principle 3: No Fallbacks That Mask Errors
      console.error('❌ CNR Router: Failed to check pending clarifications:', error);
      throw error;
    }
  }

  /**
   * Route individual question to floating orb - PUBLIC method for external routing
   * Following SoulSync Principle 7: Build Transparently, Not Silently
   */
  async routeQuestionToFloatingOrb(question: ClarifyingQuestion): Promise<void> {
    try {
      console.log(`🔄 CNR Router: Routing question "${question.question.substring(0, 50)}..." to floating orb`);

      // Classify the message type
      const messageType = MessageTypeClassifier.classifyMessage(
        question.question,
        'CNR',
        {
          conflictId: question.conflictId,
          isQuestion: true,
          expectedAnswerType: question.expectedAnswerType
        }
      );

      // Create routing event
      const routingEvent: CNRRoutingEvent = {
        type: 'clarification_generated',
        data: {
          question,
          conflictId: question.conflictId,
          timestamp: new Date().toISOString()
        }
      };

      // Notify all listeners (including floating orb)
      this.notifyListeners(routingEvent);

      console.log(`✅ CNR Router: Question routed successfully (${messageType})`);

    } catch (error) {
      console.error('❌ CNR Router: Failed to route question to floating orb:', error);
      throw error;
    }
  }

  /**
   * Process unified brain response for CNR clarifications
   * Following SoulSync Principle 1: Never Break or Remove Functionality
   */
  async processUnifiedBrainResponse(response: any): Promise<boolean> {
    try {
      console.log('🔍 CNR Router: Processing unified brain response for CNR content');
      
      // Check if response contains message classification
      if (!response.messageClassification) {
        console.log('✅ CNR Router: No message classification found - standard conversation');
        return false;
      }

      const classification = response.messageClassification;
      
      // Route CNR clarifications to floating orb
      if (classification.messageType === 'cnr_clarification') {
        console.log('🎯 CNR Router: Detected CNR clarification in response - routing to floating orb');
        
        // Check for any newly generated clarifications
        const pendingQuestions = await this.checkAndRoutePendingClarifications();
        
        // If no pending questions but response is classified as CNR, create from response
        if (pendingQuestions.length === 0 && classification.metadata?.cnrData) {
          await this.handleInlineeCNRClarification(response.response, classification.metadata.cnrData);
        }
        
        return true;
      }

      console.log(`✅ CNR Router: Response classified as ${classification.messageType} - no CNR routing needed`);
      return false;

    } catch (error) {
      console.error('❌ CNR Router: Failed to process unified brain response:', error);
      return false;
    }
  }

  /**
   * Handle CNR clarification detected in response text
   * Following SoulSync Principle 2: No Hardcoded or Simulated Data
   */
  private async handleInlineeCNRClarification(responseText: string, cnrData: any): Promise<void> {
    try {
      console.log('🔄 CNR Router: Creating clarification from inline response text');
      
      // Create a clarifying question from the response
      const clarifyingQuestion: ClarifyingQuestion = {
        id: cnrData.conflictId || `inline_${Date.now()}`,
        question: responseText,
        context: cnrData.context || 'personality_conflict_resolution',
        expectedAnswerType: cnrData.expectedAnswerType || 'text',
        options: cnrData.options,
        conflictId: cnrData.conflictId || `conflict_${Date.now()}`
      };

      // Route to floating orb
      await this.routeQuestionToFloatingOrb(clarifyingQuestion);

    } catch (error) {
      console.error('❌ CNR Router: Failed to handle inline CNR clarification:', error);
      throw error;
    }
  }

  /**
   * Register listener for CNR routing events
   * Following SoulSync Principle 6: Integrate Within Current Unified Architecture
   */
  onCNRRouting(listener: (event: CNRRoutingEvent) => void): () => void {
    console.log('🔄 CNR Router: Registering routing listener');
    this.routingListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.routingListeners.indexOf(listener);
      if (index > -1) {
        this.routingListeners.splice(index, 1);
        console.log('🔄 CNR Router: Routing listener unregistered');
      }
    };
  }

  /**
   * Process user answer to CNR clarification
   * Following SoulSync Principle 7: Build Transparently, Not Silently
   */
  async processUserAnswer(questionId: string, answer: any): Promise<boolean> {
    try {
      console.log(`🔄 CNR Router: Processing user answer for question ${questionId}`);
      
      // Route answer to CNR service
      const resolution = conflictNavigationResolution.processUserClarification(questionId, answer);
      
      if (resolution) {
        console.log(`✅ CNR Router: User answer processed - conflict resolved using ${resolution.method}`);
        
        // Notify listeners of resolution
        const event: CNRRoutingEvent = {
          type: 'conflict_resolved',
          data: {
            conflictId: questionId,
            response: answer,
            timestamp: new Date().toISOString()
          }
        };
        
        this.notifyListeners(event);
        return true;
      }

      console.log('⚠️ CNR Router: User answer could not be processed');
      return false;

    } catch (error) {
      console.error('❌ CNR Router: Failed to process user answer:', error);
      return false;
    }
  }

  /**
   * Get current CNR status for debugging
   * Following SoulSync Principle 7: Build Transparently, Not Silently
   */
  getStatus() {
    const cnrStatus = conflictNavigationResolution.getStatus();
    
    return {
      isInitialized: this.isInitialized,
      routingListeners: this.routingListeners.length,
      cnrStatus,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Notify all registered listeners
   */
  private notifyListeners(event: CNRRoutingEvent): void {
    console.log(`🔔 CNR Router: Notifying ${this.routingListeners.length} listeners of ${event.type}`);
    
    this.routingListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('❌ CNR Router: Listener error:', error);
      }
    });
  }
}

// Export singleton instance
export const cnrMessageRouter = CNRMessageRouter.getInstance();