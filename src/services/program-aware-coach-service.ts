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

// Helper function to safely extract recovery context
const extractRecoveryContext = (recoveryContext: Json): {
  inquiryPhase?: string;
  discoveredInsights?: string[];
} => {
  if (!recoveryContext || typeof recoveryContext !== 'object' || Array.isArray(recoveryContext)) {
    return {};
  }
  
  const context = recoveryContext as Record<string, any>;
  return {
    inquiryPhase: typeof context.inquiryPhase === 'string' ? context.inquiryPhase : undefined,
    discoveredInsights: Array.isArray(context.discoveredInsights) ? context.discoveredInsights : undefined
  };
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
  private questionCount: number = 0;

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
          const context = extractRecoveryContext(data.recovery_context);
          this.beliefExplorationData = data.recovery_context;
          this.inquiryPhase = (context.inquiryPhase as any) || 'discovery';
          this.discoveredInsights = context.discoveredInsights || [];
        }

        const messages = convertJsonToMessages(data.messages);
        this.questionCount = messages.filter(m => m.sender === 'assistant').length;
        
        console.log('✅ Conversation history loaded:', {
          messages: messages.length,
          domain: data.domain,
          stage: this.conversationStage,
          phase: this.inquiryPhase,
          insights: this.discoveredInsights.length,
          questionCount: this.questionCount
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
        questionCount: this.questionCount,
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
    this.questionCount++;

    // Create phase-appropriate response
    const response = this.createPhaseAwareResponse(message, userId);
    
    console.log("🧠 Generated phase-aware response:", {
      stage: this.conversationStage,
      phase: this.inquiryPhase,
      insights: this.discoveredInsights.length,
      questionCount: this.questionCount,
      sessionId
    });

    return {
      response,
      conversationId: sessionId
    };
  }

  async initializeBeliefDrilling(domain: LifeDomain, userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.selectedDomain = domain;
    this.conversationStage = 'belief_drilling';
    this.inquiryPhase = 'discovery';
    this.discoveredInsights = [];
    this.questionCount = 0;
    this.setCurrentSession(sessionId);
    
    // Start with Phase 1: Deep Discovery
    const domainTitle = this.getDomainTitle(domain);
    const openingQuestion = `I want to understand what's really going on with your ${domainTitle.toLowerCase()}. What's happening in this area of your life right now that made you choose it for growth?`;

    return {
      response: openingQuestion,
      conversationId: sessionId
    };
  }

  private processMessageForInsights(message: string) {
    const lowerMessage = message.toLowerCase();
    
    // Extract key insights from user responses
    const patterns = [
      { pattern: /because|since|due to|the reason/, insight: 'causal_reasoning' },
      { pattern: /always|never|usually|constantly|typically/, insight: 'pattern_identification' },
      { pattern: /feel|feeling|felt|emotion|mood/, insight: 'emotional_state' },
      { pattern: /should|must|have to|need to|supposed to/, insight: 'obligation_pressure' },
      { pattern: /can't|cannot|unable|impossible|stuck/, insight: 'perceived_limitation' },
      { pattern: /afraid|scared|worry|anxious|fear/, insight: 'fear_based' },
      { pattern: /want|need|desire|wish|hope/, insight: 'core_motivation' },
      { pattern: /tried|attempted|effort|worked on/, insight: 'past_attempts' },
      { pattern: /pressure|stress|overwhelm|burden/, insight: 'stress_factors' }
    ];

    patterns.forEach(({ pattern, insight }) => {
      if (pattern.test(lowerMessage) && !this.discoveredInsights.includes(insight)) {
        this.discoveredInsights.push(insight);
        console.log(`🔍 New insight discovered: ${insight}`);
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

  private createPhaseAwareResponse(userMessage: string, userId: string): string {
    const domainName = this.getDomainTitle(this.selectedDomain || 'career');
    
    if (this.inquiryPhase === 'discovery') {
      return this.createDiscoveryQuestion(userMessage, domainName);
    } else if (this.inquiryPhase === 'blueprint_analysis') {
      return this.createBlueprintAnalysisResponse(userMessage, domainName);
    } else {
      return this.createActionPlanningResponse(userMessage, domainName);
    }
  }

  private createDiscoveryQuestion(userMessage: string, domainName: string): string {
    // Phase 1: Deep Discovery - Direct questions without assumptions
    const discoveryQuestions = [
      `Tell me more about that. What does a typical day or week look like for you when it comes to ${domainName.toLowerCase()}?`,
      
      `Help me understand the specifics. What exactly happens (or doesn't happen) that makes this area feel challenging for you?`,
      
      `When did you first notice this pattern? What was different about ${domainName.toLowerCase()} before versus now?`,
      
      `What have you already tried to address this situation? What worked, what didn't, and what happened?`,
      
      `How does this situation with ${domainName.toLowerCase()} affect other parts of your life? What ripple effects do you notice?`,
      
      `If nothing changed, where do you see your ${domainName.toLowerCase()} heading in the next 6 months?`,
      
      `What would need to be different for you to feel genuinely satisfied with your ${domainName.toLowerCase()}?`
    ];

    // Cycle through different question approaches
    const questionIndex = Math.min(this.questionCount - 1, discoveryQuestions.length - 1);
    
    return discoveryQuestions[questionIndex];
  }

  private createBlueprintAnalysisResponse(userMessage: string, domainName: string): string {
    // Phase 2: Blueprint-Informed Analysis
    return `I'm starting to see some patterns here based on what you've shared about your ${domainName.toLowerCase()}. 

From our conversation, I can see themes around ${this.discoveredInsights.join(', ')}. Now I want to help you understand the deeper "why" behind these patterns by connecting them to your unique blueprint.

Based on your personality type and natural design, these patterns actually make sense. Let me explain how your natural traits might be contributing to your current situation - both the challenges and the strengths you can leverage.

What I'm noticing is that your blueprint suggests you operate in a way that might be clashing with conventional expectations around ${domainName.toLowerCase()}. Instead of seeing this as a flaw, let's reframe these patterns as workable aspects of who you are.

Can you tell me more about how you naturally prefer to approach tasks and decisions? This will help me connect your authentic operating style to what's happening in your ${domainName.toLowerCase()}.`;
  }

  private createActionPlanningResponse(userMessage: string, domainName: string): string {
    // Phase 3: Personalized Action Planning
    return `Now that we understand what's happening and why these patterns exist given your unique makeup, let's focus on practical strategies that will work WITH your natural design rather than against it.

Based on your insights (${this.discoveredInsights.join(', ')}) and understanding your blueprint, here are some personalized approaches for your ${domainName.toLowerCase()}:

1. **Honor Your Natural Rhythm**: Instead of forcing conventional approaches, let's create strategies that align with how you naturally operate.

2. **Leverage Your Strengths**: We've identified patterns that can actually become advantages when properly channeled.

3. **Sustainable Next Steps**: Rather than overwhelming changes, let's focus on small, consistent actions that feel authentic to you.

What resonates most with you from what we've discovered? And what feels like the most natural first step you could take in your ${domainName.toLowerCase()} that would honor your authentic way of being?

This will help us create a personalized growth program that works with your natural patterns rather than against them.`;
  }

  private getDomainTitle(domain: LifeDomain): string {
    const titles = {
      career: 'Career & Purpose',
      relationships: 'Relationships & Love',
      wellbeing: 'Health & Wellbeing',
      finances: 'Money & Abundance',
      creativity: 'Creativity & Expression',
      spirituality: 'Spirituality & Meaning',
      home_family: 'Home & Family'
    };
    return titles[domain] || 'Career & Purpose';
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
      discoveredInsights: this.discoveredInsights,
      questionCount: this.questionCount
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
