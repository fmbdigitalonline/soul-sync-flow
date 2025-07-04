import { supabase } from "@/integrations/supabase/client";
import { LifeDomain } from '@/types/growth-program';
import { enhancedAICoachService } from './enhanced-ai-coach-service';
import { careerDiscoveryService } from './career-discovery-service';

// Define Message interface locally since it's not exported from ai-coach-service
export interface Message {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
}

export interface BeliefDrillingResponse {
  response: string;
  keyInsights: string[];
  coreChallenges: string[];
  nextQuestions: string[];
  progressPercentage: number;
  sessionComplete: boolean;
}

class ProgramAwareCoachService {
  // Step 3: Service Instance Isolation - Separate caches by context
  private conversationCache = new Map<string, any>();
  private activeConversations = new Set<string>();
  private contextIsolatedCaches = new Map<string, Map<string, any>>();
  private contextIsolatedActiveSessions = new Map<string, Set<string>>();

  async initializeForUser(userId: string, pageContext: string = 'spiritual-growth') {
    console.log("🎯 VFP-Graph Program-Aware Coach: Initializing for user", userId, "with context:", pageContext);
    
    // Step 3: Service Instance Isolation - Initialize context-specific caches
    if (!this.contextIsolatedCaches.has(pageContext)) {
      this.contextIsolatedCaches.set(pageContext, new Map());
      this.contextIsolatedActiveSessions.set(pageContext, new Set());
    }
    
    // Set the enhanced AI coach service to use the current user
    await enhancedAICoachService.setCurrentUser(userId);
    
    console.log("✅ Program-aware coach initialized with enhanced AI integration for context:", pageContext);
  }

  async initializeBeliefDrilling(
    domain: LifeDomain,
    userId: string,
    sessionId: string,
    pageContext: string = 'spiritual-growth'
  ): Promise<BeliefDrillingResponse> {
    console.log("🎯 Initializing belief drilling with discovery-first approach for:", domain, "in context:", pageContext);

    // Step 3: Service Instance Isolation - Use context-specific active sessions
    const contextSessions = this.contextIsolatedActiveSessions.get(pageContext) || new Set();
    
    // Prevent duplicate initialization
    if (contextSessions.has(sessionId)) {
      console.log("⚠️ Session already active, returning cached response");
      return this.getCachedResponse(sessionId, pageContext);
    }

    contextSessions.add(sessionId);
    this.contextIsolatedActiveSessions.set(pageContext, contextSessions);

    try {
      // Use career discovery service for initial context if available
      let careerContext = {};
      if (careerDiscoveryService && typeof careerDiscoveryService.initializeDiscovery === 'function') {
        const discoveryContext = await careerDiscoveryService.initializeDiscovery(userId, sessionId);
        careerContext = discoveryContext || {};
      }
      console.log("✅ Career discovery completed:", careerContext);

      // Generate personalized greeting using enhanced AI coach
      const greetingResponse = await this.generatePersonalizedGreeting(domain, careerContext);

      const response: BeliefDrillingResponse = {
        response: greetingResponse,
        keyInsights: [],
        coreChallenges: [],
        nextQuestions: [],
        progressPercentage: 5,
        sessionComplete: false
      };

      // Step 3: Service Instance Isolation - Cache response in context-specific cache
      const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
      contextCache.set(sessionId, {
        domain,
        userId,
        pageContext,
        careerContext,
        lastResponse: response,
        messageCount: 1,
        discoveredInsights: [],
        hasContext: true,
        program: null,
        week: null,
        stage: 'initial'
      });
      this.contextIsolatedCaches.set(pageContext, contextCache);

      return response;
    } catch (error) {
      console.error("❌ Error initializing belief drilling:", error);
      const contextSessions = this.contextIsolatedActiveSessions.get(pageContext) || new Set();
      contextSessions.delete(sessionId);
      this.contextIsolatedActiveSessions.set(pageContext, contextSessions);
      
      // Fallback response
      return {
        response: `Welcome to your ${domain} growth journey. I'm here to help you explore this area of your life. What's on your mind today?`,
        keyInsights: [],
        coreChallenges: [],
        nextQuestions: [],
        progressPercentage: 5,
        sessionComplete: false
      };
    }
  }

  private async generatePersonalizedGreeting(domain: LifeDomain, careerContext: any): Promise<string> {
    const contextualPrompt = `Based on career context: ${JSON.stringify(careerContext, null, 2)}\n\nGenerate a warm, personalized greeting for someone starting their ${domain} growth journey.`;
    
    try {
      const response = await enhancedAICoachService.sendMessage(
        contextualPrompt,
        `greeting_${Date.now()}`,
        true, // Use persona
        "guide",
        "en"
      );
      
      return response.response;
    } catch (error) {
      console.error("Error generating personalized greeting:", error);
      return `Welcome to your ${domain} growth journey. I'm here to help you explore and grow in this important area of your life.`;
    }
  }

  private getCachedResponse(sessionId: string, pageContext: string = 'spiritual-growth'): BeliefDrillingResponse {
    // Step 3: Service Instance Isolation - Get cached response from context-specific cache
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    const cached = contextCache.get(sessionId);
    if (cached?.lastResponse) {
      return cached.lastResponse;
    }
    
    return {
      response: "Let's continue our conversation. What would you like to explore?",
      keyInsights: [],
      coreChallenges: [],
      nextQuestions: [],
      progressPercentage: 10,
      sessionComplete: false
    };
  }

  async sendProgramAwareMessage(
    message: string,
    sessionId: string,  
    userId: string,
    useEnhancedBrain: boolean = true,
    pageContext: string = 'spiritual-growth'
  ): Promise<BeliefDrillingResponse> {
    console.log("🎯 VFP-Graph Program-Aware Coach: Processing message with enhanced brain integration");

    try {
      // Step 3: Service Instance Isolation - Get cached conversation context from context-specific cache
      const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
      const conversationContext = contextCache.get(sessionId) || {};
      const { domain, careerContext } = conversationContext;

      // Use enhanced AI coach service with full brain innovations (ACS, VFP, PIE, TMG)
      if (useEnhancedBrain) {
        console.log("🧠 Using enhanced AI coach with 4 brain innovations");
        
        // Update career discovery context with new message if service is available
        let updatedCareerContext = careerContext || {};
        if (careerDiscoveryService && typeof careerDiscoveryService.processDiscoveryMessage === 'function') {
          try {
            const discoveryResult = await careerDiscoveryService.processDiscoveryMessage(message, sessionId);
            updatedCareerContext = discoveryResult.context || {};
          } catch (error) {
            console.log("Career discovery not available, using existing context");
            updatedCareerContext = careerContext || {};
          }
        }
        
        // Create context-rich prompt for enhanced AI coach
        const enhancedPrompt = this.createEnhancedPrompt(message, domain, updatedCareerContext, conversationContext);
        
        const aiResponse = await enhancedAICoachService.sendMessage(
          enhancedPrompt,
          sessionId,
          true, // Use persona for personalization
          "guide", // Use guide mode for growth conversations
          "en"
        );

        // Parse response and extract insights
        const parsedResponse = this.parseCoachResponse(aiResponse.response);
        
        // Step 3: Service Instance Isolation - Update context-specific conversation cache
        this.updateConversationCache(sessionId, {
          ...conversationContext,
          lastMessage: message,
          lastResponse: parsedResponse,
          messageCount: (conversationContext.messageCount || 0) + 1,
          careerContext: updatedCareerContext,
          discoveredInsights: this.extractInsights(aiResponse.response),
          stage: this.determineConversationStage(conversationContext.messageCount || 0),
          pageContext
        }, pageContext);

        // Step 4: Domain-Specific Conversation Storage - Save with dynamic domain
        await this.saveConversationStateWithRetry(sessionId, userId, message, parsedResponse.response, pageContext);

        return parsedResponse;
      }

      // Fallback to basic response if enhanced brain fails
      console.log("⚠️ Falling back to basic response generation");
      return this.generateBasicResponse(message, conversationContext);

    } catch (error) {
      console.error("❌ Error in program-aware message processing:", error);
      
      // Error recovery - provide meaningful response
      const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
      
      return {
        response: "I understand you're exploring this area. Could you tell me more about what's specifically on your mind right now?",
        keyInsights: [],
        coreChallenges: [],
        nextQuestions: ["What aspect would you like to explore first?"],
        progressPercentage: (contextCache.get(sessionId)?.messageCount || 0) * 10,
        sessionComplete: false
      };
    }
  }

  private createEnhancedPrompt(message: string, domain: LifeDomain, careerContext: any, conversationContext: any): string {
    return `You are an expert ${domain} coach with access to the user's personality blueprint and career context. 

Career Context: ${JSON.stringify(careerContext, null, 2)}
Conversation History: ${conversationContext.messageCount || 0} messages exchanged
Domain Focus: ${domain}
Current Stage: ${conversationContext.stage || 'initial'}

User Message: "${message}"

Provide a personalized, insightful response that:
1. Acknowledges their specific situation
2. Offers deep, actionable guidance
3. Asks thoughtful follow-up questions
4. Shows you're truly listening and understanding their unique context

Be conversational, empathetic, and avoid generic responses. Draw from their personality traits and career situation to make this highly relevant to them.`;
  }

  private parseCoachResponse(response: string): BeliefDrillingResponse {
    // Simple parsing logic - can be enhanced with more sophisticated NLP
    const insights = this.extractInsights(response);
    const challenges = this.extractChallenges(response);
    const questions = this.extractQuestions(response);
    
    return {
      response,
      keyInsights: insights,
      coreChallenges: challenges,
      nextQuestions: questions,
      progressPercentage: Math.min(95, (insights.length + challenges.length) * 10),
      sessionComplete: false
    };
  }

  private extractInsights(text: string): string[] {
    // Look for insight patterns
    const insightPatterns = [
      /it seems like (.*?)(?:[.!?]|$)/gi,
      /i notice (.*?)(?:[.!?]|$)/gi,
      /what stands out (.*?)(?:[.!?]|$)/gi
    ];
    
    const insights: string[] = [];
    insightPatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        insights.push(...matches.slice(0, 2)); // Limit to 2 per pattern
      }
    });
    
    return insights.slice(0, 3); // Max 3 insights
  }

  private extractChallenges(text: string): string[] {
    // Look for challenge patterns
    const challengePatterns = [
      /challenge.*?is (.*?)(?:[.!?]|$)/gi,
      /difficult.*?because (.*?)(?:[.!?]|$)/gi,
      /struggle.*?with (.*?)(?:[.!?]|$)/gi
    ];
    
    const challenges: string[] = [];
    challengePatterns.forEach(pattern => {
      const matches = text.match(pattern);
      if (matches) {
        challenges.push(...matches.slice(0, 2));
      }
    });
    
    return challenges.slice(0, 3); // Max 3 challenges
  }

  private extractQuestions(text: string): string[] {
    // Extract questions from the response
    const questions = text.match(/[^.!?]*\?/g) || [];
    return questions.slice(0, 2); // Max 2 questions
  }

  private generateBasicResponse(message: string, context: any): BeliefDrillingResponse {
    return {
      response: `I hear you're exploring this area. Based on what you've shared: "${message}", I'd like to understand more about your specific situation. What feels most important to address right now?`,
      keyInsights: [`You mentioned: ${message.substring(0, 50)}...`],
      coreChallenges: [],
      nextQuestions: ["What would you like to focus on first?"],
      progressPercentage: 20,
      sessionComplete: false
    };
  }

  private updateConversationCache(sessionId: string, data: any, pageContext: string = 'spiritual-growth') {
    // Step 3: Service Instance Isolation - Update context-specific cache
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    contextCache.set(sessionId, {
      ...contextCache.get(sessionId),
      ...data,
      lastUpdated: new Date().toISOString()
    });
    this.contextIsolatedCaches.set(pageContext, contextCache);
  }

  private determineConversationStage(messageCount: number): string {
    if (messageCount <= 2) return 'initial';
    if (messageCount <= 5) return 'exploration';
    if (messageCount <= 10) return 'deepening';
    return 'integration';
  }

  // Step 4: Domain-Specific Conversation Storage - Fixed UPSERT with dynamic domain
  private async saveConversationStateWithRetry(
    sessionId: string,
    userId: string,
    userMessage: string,
    aiResponse: string,
    pageContext: string = 'spiritual-growth',
    maxRetries: number = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // Step 4: Domain-Specific Conversation Storage - Dynamic domain based on page context
        const domainMapping = {
          'spiritual-growth': 'personal_growth',
          'dreams': 'dream_coaching', 
          'coach': 'general_coaching',
          'relationships': 'relationships'
        };
        
        const dynamicDomain = domainMapping[pageContext as keyof typeof domainMapping] || 'general_coaching';
        
        // Use upsert to handle the unique constraint properly
        const { error } = await supabase
          .from('conversation_memory')
          .upsert({
            session_id: sessionId,
            user_id: userId,
            messages: [
              { content: userMessage, sender: 'user', timestamp: new Date().toISOString() },
              { content: aiResponse, sender: 'assistant', timestamp: new Date().toISOString() }
            ],
            mode: 'guide',
            domain: dynamicDomain, // Now dynamic based on page context
            conversation_stage: 'active',
            last_activity: new Date().toISOString(),
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'session_id,user_id', // Handle the unique constraint
            ignoreDuplicates: false // Update existing records
          });

        if (error) {
          throw error;
        }

        console.log("✅ Conversation state saved successfully");
        return;

      } catch (error: any) {
        console.error(`❌ Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          console.error("❌ All retry attempts failed, conversation state not saved");
          // Continue without saving - don't break the conversation flow
          return;
        }
        
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  async saveConversationState(sessionId: string, userId: string, messages: Message[], pageContext?: string): Promise<void> {
    // Extract page context from session ID if not provided
    const extractedContext = pageContext || this.extractPageContextFromSessionId(sessionId);
    
    // Delegate to the retry method
    if (messages.length >= 2) {
      const userMessage = messages[messages.length - 2];
      const aiMessage = messages[messages.length - 1];
      
      await this.saveConversationStateWithRetry(
        sessionId,
        userId,
        userMessage?.content || "",
        aiMessage?.content || "",
        extractedContext
      );
    }
  }

  private extractPageContextFromSessionId(sessionId: string): string {
    // Extract page context from session ID format: "pageContext_..."
    const parts = sessionId.split('_');
    const knownContexts = ['spiritual-growth', 'dreams', 'coach', 'relationships'];
    return knownContexts.includes(parts[0]) ? parts[0] : 'spiritual-growth';
  }

  async loadConversationHistory(sessionId: string, userId: string): Promise<Message[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .single();

      if (error) {
        console.log("No existing conversation found, starting fresh");
        return [];
      }

      const messages = (data.messages as any[]) || [];
      return messages.map((msg: any, index: number) => ({
        id: `${sessionId}_${index}`,
        content: msg.content || '',
        sender: msg.sender || 'user',
        timestamp: new Date(msg.timestamp || Date.now())
      }));

    } catch (error) {
      console.error("Error loading conversation history:", error);
      return [];
    }
  }

  getCurrentContext(pageContext: string = 'spiritual-growth') {
    // Step 3: Service Instance Isolation - Get context for specific page
    const contextSessions = this.contextIsolatedActiveSessions.get(pageContext) || new Set();
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    
    return {
      activeConversations: Array.from(contextSessions),
      cachedSessions: contextCache.size,
      enhancedBrainEnabled: true,
      pageContext,
      // Add missing properties that are expected by components
      discoveredInsights: this.getAllDiscoveredInsights(pageContext),
      hasContext: contextCache.size > 0,
      program: this.getCurrentProgram(pageContext),
      week: this.getCurrentWeek(pageContext),
      stage: this.getCurrentStage(pageContext)
    };
  }

  private getAllDiscoveredInsights(pageContext: string = 'spiritual-growth'): string[] {
    const allInsights: string[] = [];
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    for (const [sessionId, context] of contextCache.entries()) {
      if (context.discoveredInsights) {
        allInsights.push(...context.discoveredInsights);
      }
    }
    return allInsights;
  }

  private getCurrentProgram(pageContext: string = 'spiritual-growth'): any {
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    if (contextCache.size === 0) return null;
    const contexts = Array.from(contextCache.values());
    const latestContext = contexts[contexts.length - 1];
    return latestContext?.program || null;
  }

  private getCurrentWeek(pageContext: string = 'spiritual-growth'): any {
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    if (contextCache.size === 0) return null;
    const contexts = Array.from(contextCache.values());
    const latestContext = contexts[contexts.length - 1];
    return latestContext?.week || null;
  }

  private getCurrentStage(pageContext: string = 'spiritual-growth'): string {
    const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
    if (contextCache.size === 0) return 'initial';
    const contexts = Array.from(contextCache.values());
    const latestContext = contexts[contexts.length - 1];
    return latestContext?.stage || 'initial';
  }

  // Add missing methods that are referenced in other files
  async startGuidedProgramCreation(userId: string, sessionId: string): Promise<BeliefDrillingResponse> {
    return this.initializeBeliefDrilling('relationships', userId, sessionId);
  }

  async getReadinessPrompts(domain: LifeDomain): Promise<string[]> {
    return [
      "What feels most challenging in this area right now?",
      "What would success look like for you here?",
      "What patterns do you notice in this part of your life?"
    ];
  }

  async updateConversationStage(sessionId: string, stage: string): Promise<void> {
    const context = this.conversationCache.get(sessionId);
    if (context) {
      this.updateConversationCache(sessionId, { stage });
    }
  }

  // Step 3: Service Instance Isolation - Enhanced cleanup method
  clearSession(sessionId: string, pageContext?: string) {
    if (pageContext) {
      // Clear from specific context
      const contextSessions = this.contextIsolatedActiveSessions.get(pageContext) || new Set();
      const contextCache = this.contextIsolatedCaches.get(pageContext) || new Map();
      contextSessions.delete(sessionId);
      contextCache.delete(sessionId);
    } else {
      // Clear from all contexts (extract context from session ID)
      const extractedContext = this.extractPageContextFromSessionId(sessionId);
      this.clearSession(sessionId, extractedContext);
    }
    
    // Also clear from global caches (legacy support)
    this.activeConversations.delete(sessionId);
    this.conversationCache.delete(sessionId);
  }

  // Step 3: Service Instance Isolation - Clear all sessions for a specific context
  clearContextSessions(pageContext: string) {
    this.contextIsolatedActiveSessions.set(pageContext, new Set());
    this.contextIsolatedCaches.set(pageContext, new Map());
    console.log(`🧹 Cleared all sessions for context: ${pageContext}`);
  }
}

export const programAwareCoachService = new ProgramAwareCoachService();
