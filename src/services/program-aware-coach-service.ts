import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek, LifeDomain } from "@/types/growth-program";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

// Helper function to convert Json to Message array
const convertJsonToMessages = (jsonData: Json): any[] => {
  if (!jsonData || !Array.isArray(jsonData)) return [];
  return jsonData as any[];
};

// Helper function to convert Message array to Json
const convertMessagesToJson = (messages: any[]): Json => {
  return messages.map(msg => ({
    id: msg.id,
    content: msg.content,
    sender: msg.sender,
    timestamp: msg.timestamp instanceof Date ? msg.timestamp.toISOString() : msg.timestamp
  }));
};

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;
  private conversationStage: 'welcome' | 'domain_exploration' | 'belief_drilling' | 'program_creation' | 'active_guidance' = 'welcome';
  private selectedDomain: LifeDomain | null = null;
  private beliefExplorationData: any = {};
  private currentSessionId: string | null = null;
  private inquiryPhase: 'discovery' | 'blueprint_analysis' | 'action_planning' = 'discovery';
  private discoveredInsights: string[] = [];

  async initializeForUser(userId: string) {
    console.log("🎯 Program-Aware Coach: Initializing for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        this.conversationStage = 'active_guidance';
        
        console.log("✅ Growth context ready:", {
          program: this.currentProgram.domain,
          week: this.currentWeek?.theme
        });
      }
    } catch (error) {
      console.error("❌ Error initializing growth facilitator:", error);
    }
  }

  async loadConversationHistory(sessionId: string, userId: string): Promise<any[]> {
    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages, domain, recovery_context')
        .eq('user_id', userId)
        .eq('session_id', sessionId)
        .single();

      if (error) {
        console.error('Error loading conversation history:', error);
        return [];
      }

      if (data) {
        // Restore conversation context
        if (data.domain) {
          this.selectedDomain = data.domain as LifeDomain;
          this.conversationStage = 'belief_drilling';
        }
        
        if (data.recovery_context) {
          this.beliefExplorationData = data.recovery_context;
          this.inquiryPhase = data.recovery_context.inquiryPhase || 'discovery';
          this.discoveredInsights = data.recovery_context.discoveredInsights || [];
        }

        const messages = convertJsonToMessages(data.messages);
        console.log('✅ Conversation history loaded:', {
          messages: messages.length,
          domain: data.domain,
          stage: this.conversationStage,
          phase: this.inquiryPhase
        });

        return messages;
      }

      return [];
    } catch (error) {
      console.error('Error in loadConversationHistory:', error);
      return [];
    }
  }

  async saveConversationState(sessionId: string, userId: string, messages: any[]) {
    try {
      const recoveryContext = {
        selectedDomain: this.selectedDomain,
        conversationStage: this.conversationStage,
        beliefExplorationData: this.beliefExplorationData,
        inquiryPhase: this.inquiryPhase,
        discoveredInsights: this.discoveredInsights,
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          messages: convertMessagesToJson(messages),
          domain: this.selectedDomain,
          conversation_stage: 'active',
          recovery_context: recoveryContext,
          mode: 'guide'
        });

      if (error) {
        console.error('Error saving conversation state:', error);
      } else {
        console.log('✅ Conversation state saved');
      }
    } catch (error) {
      console.error('Error in saveConversationState:', error);
    }
  }

  setCurrentSession(sessionId: string) {
    this.currentSessionId = sessionId;
  }

  async sendProgramAwareMessage(
    message: string,
    sessionId: string,
    userId: string,
    usePersona: boolean = true
  ): Promise<{ response: string; conversationId: string }> {
    // Set current session for state tracking
    this.setCurrentSession(sessionId);
    
    // Ensure we have current program context
    if (!this.currentProgram) {
      await this.initializeForUser(userId);
    }

    // Process the message and determine inquiry phase
    this.processMessageForInsights(message);

    // Create phase-appropriate guidance message
    const naturalMessage = this.createPhaseAwareGuidance(message, userId);
    
    console.log("🧠 Sending phase-aware growth guidance:", {
      stage: this.conversationStage,
      phase: this.inquiryPhase,
      insights: this.discoveredInsights.length,
      hasContext: !!this.currentProgram,
      sessionId
    });

    return await enhancedAICoachService.sendMessage(
      naturalMessage,
      sessionId,
      usePersona && this.inquiryPhase !== 'discovery',
      "guide",
      "en"
    );
  }

  async initializeBeliefDrilling(domain: LifeDomain, userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.selectedDomain = domain;
    this.conversationStage = 'belief_drilling';
    this.inquiryPhase = 'discovery';
    this.discoveredInsights = [];
    this.setCurrentSession(sessionId);
    
    // Start with pure discovery question
    const domainTitle = domain.replace('_', ' ');
    const greetingMessage = `I want to understand what's really going on with your ${domainTitle}. What's happening in this area of your life right now that made you choose it for growth?`;

    return {
      response: greetingMessage,
      conversationId: sessionId
    };
  }

  private processMessageForInsights(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Extract key insights from user responses
    const patterns = [
      { pattern: /because|since|due to/, insight: 'causal_reasoning' },
      { pattern: /always|never|usually/, insight: 'pattern_identification' },
      { pattern: /feel|feeling|felt/, insight: 'emotional_state' },
      { pattern: /should|must|have to/, insight: 'obligation_pressure' },
      { pattern: /can't|cannot|unable/, insight: 'perceived_limitation' },
      { pattern: /afraid|scared|worry/, insight: 'fear_based' },
      { pattern: /want|need|desire/, insight: 'core_motivation' }
    ];

    patterns.forEach(({ pattern, insight }) => {
      if (pattern.test(lowerMessage) && !this.discoveredInsights.includes(insight)) {
        this.discoveredInsights.push(insight);
      }
    });

    // Progress inquiry phase based on insights gathered
    if (this.discoveredInsights.length >= 3 && this.inquiryPhase === 'discovery') {
      this.inquiryPhase = 'blueprint_analysis';
      console.log('🔍 Moving to blueprint analysis phase with insights:', this.discoveredInsights);
    } else if (this.discoveredInsights.length >= 5 && this.inquiryPhase === 'blueprint_analysis') {
      this.inquiryPhase = 'action_planning';
      console.log('🎯 Moving to action planning phase');
    }
  }

  private createPhaseAwareGuidance(userMessage: string, userId: string): string {
    const domainName = this.selectedDomain?.replace('_', ' ') || 'this area';
    
    if (this.inquiryPhase === 'discovery') {
      return this.createDiscoveryQuestions(userMessage, domainName);
    } else if (this.inquiryPhase === 'blueprint_analysis') {
      return this.createBlueprintAnalysis(userMessage, domainName);
    } else {
      return this.createActionPlanningGuidance(userMessage, domainName);
    }
  }

  private createDiscoveryQuestions(userMessage: string, domainName: string): string {
    const discoveryQuestions = [
      `Tell me more about that. What specifically is happening with your ${domainName} that's creating this situation?`,
      
      `I hear what you're saying about ${domainName}. Can you walk me through what a typical day or week looks like in this area?`,
      
      `That's interesting. When did you first notice this pattern with your ${domainName}? What was different before?`,
      
      `Help me understand the impact. How is this situation with your ${domainName} affecting other parts of your life?`,
      
      `What have you already tried to change or improve in your ${domainName}? What worked, what didn't?`,
      
      `If nothing changed, where do you see your ${domainName} heading in the next 6 months?`,
      
      `What would need to be different for you to feel genuinely satisfied with your ${domainName}?`
    ];

    // Cycle through different question approaches based on conversation length
    const questionIndex = this.discoveredInsights.length % discoveryQuestions.length;
    
    return `You shared: "${userMessage}" - ${discoveryQuestions[questionIndex]}

Focus on gathering deep understanding about their actual situation, patterns, and specific challenges before making any assumptions or offering insights.`;
  }

  private createBlueprintAnalysis(userMessage: string, domainName: string): string {
    return `You shared: "${userMessage}" about your ${domainName}. Now I'm starting to see some patterns here, and I want to help you understand why this might be happening based on who you are.

From our conversation, I can see themes around ${this.discoveredInsights.join(', ')}. Let me connect this to your unique blueprint and help you understand the deeper "why" behind these patterns.

Use the user's blueprint data to explain why these specific patterns make sense given their personality type, human design, and other blueprint elements. Help them see how their natural traits might be contributing to their current situation - both the challenges and the strengths they can leverage.

Be specific about how their blueprint explains their experience, and help them reframe their challenges as workable patterns rather than personal flaws.`;
  }

  private createActionPlanningGuidance(userMessage: string, domainName: string): string {
    return `You shared: "${userMessage}" - Now that we understand what's happening and why these patterns exist given your blueprint, let's focus on the "how" - what specific strategies will work best for someone with your unique makeup.

Based on your blueprint and the insights we've discovered (${this.discoveredInsights.join(', ')}), I want to suggest personalized approaches that honor your natural way of operating while helping you create the changes you want in your ${domainName}.

Use their blueprint to suggest specific, personalized strategies that work WITH their natural patterns rather than against them. Focus on practical next steps that feel authentic and sustainable for their type.`;
  }

  async startGuidedProgramCreation(userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.conversationStage = 'program_creation';
    
    const welcomeMessage = `I'm here to help you create a personalized growth program. Let's start by exploring what area of your life you'd like to focus on. What's calling for your attention right now?`;
    
    return await enhancedAICoachService.sendMessage(
      welcomeMessage,
      sessionId,
      true,
      "guide",
      "en"
    );
  }

  getCurrentContext() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      hasContext: !!(this.currentProgram && this.currentWeek),
      stage: this.conversationStage,
      selectedDomain: this.selectedDomain,
      currentSessionId: this.currentSessionId,
      inquiryPhase: this.inquiryPhase,
      discoveredInsights: this.discoveredInsights
    };
  }

  detectDomainFromMessage(message: string): LifeDomain | null {
    const domainKeywords = {
      'career': ['work', 'job', 'career', 'profession', 'calling', 'purpose', 'professional'],
      'relationships': ['relationship', 'love', 'partner', 'friendship', 'connection', 'romantic'],
      'wellbeing': ['health', 'wellness', 'energy', 'self-care', 'wellbeing', 'physical', 'mental'],
      'finances': ['money', 'financial', 'abundance', 'wealth', 'income', 'prosperity'],
      'creativity': ['creative', 'art', 'expression', 'innovation', 'creation', 'artistic'],
      'spirituality': ['spiritual', 'meaning', 'growth', 'consciousness', 'soul', 'purpose'],
      'home_family': ['family', 'home', 'domestic', 'children', 'household', 'living']
    };

    const lowerMessage = message.toLowerCase();
    
    for (const [domain, keywords] of Object.entries(domainKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return domain as LifeDomain;
      }
    }
    
    return null;
  }

  getReadinessPrompts(): string[] {
    return [
      "What area of your life feels ready for transformation?",
      "Where do you sense the most energy for growth right now?",
      "What would change if you could breakthrough in one area?"
    ];
  }

  updateConversationStage(message: string): void {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes("don't know") || lowerMessage.includes("not sure") || lowerMessage.includes("uncertain")) {
      this.conversationStage = 'domain_exploration';
    } else if (this.selectedDomain && !this.currentProgram) {
      this.conversationStage = 'belief_drilling';
    } else if (this.currentProgram) {
      this.conversationStage = 'active_guidance';
    }
  }
}

export const programAwareCoachService = new ProgramAwareCoachService();
