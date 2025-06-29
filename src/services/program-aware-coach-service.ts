import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek, LifeDomain } from "@/types/growth-program";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";
import { personalityVectorService } from "./personality-vector-service";

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
  private vfpGraphCache: { vector: Float32Array | null; summary: string | null } = { vector: null, summary: null };

  async initializeForUser(userId: string) {
    console.log("🎯 VFP-Graph Program-Aware Coach: Initializing for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      // Load VFP-Graph data for enhanced guidance
      await this.loadVFPGraphData(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        this.conversationStage = 'active_guidance';
        
        console.log("✅ VFP-Graph Growth context ready:", {
          program: this.currentProgram.domain,
          week: this.currentWeek?.theme,
          vfpGraphEnabled: !!this.vfpGraphCache.vector,
          personalitySummary: this.vfpGraphCache.summary
        });
      }
    } catch (error) {
      console.error("❌ Error initializing VFP-Graph growth facilitator:", error);
    }
  }

  private async loadVFPGraphData(userId: string) {
    try {
      console.log("🧠 Loading VFP-Graph data for program-aware coaching...");
      
      this.vfpGraphCache.vector = await personalityVectorService.getVector(userId);
      this.vfpGraphCache.summary = await personalityVectorService.getPersonaSummary(userId);
      
      console.log(`✅ VFP-Graph data loaded: ${this.vfpGraphCache.summary}`);
    } catch (error) {
      console.error("❌ Error loading VFP-Graph data:", error);
      this.vfpGraphCache = { vector: null, summary: null };
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
    
    // Ensure we have current program context and VFP-Graph data
    if (!this.currentProgram) {
      await this.initializeForUser(userId);
    }

    // Process the message and determine inquiry phase
    this.processMessageForInsights(message);
    this.questionCount++;

    // Create VFP-Graph enhanced contextual response
    const response = this.createVFPGraphEnhancedResponse(message, userId);
    
    console.log("🧠 Generated VFP-Graph enhanced contextual response:", {
      stage: this.conversationStage,
      phase: this.inquiryPhase,
      insights: this.discoveredInsights.length,
      questionCount: this.questionCount,
      vfpGraphEnabled: !!this.vfpGraphCache.vector,
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

  private createVFPGraphEnhancedResponse(userMessage: string, userId: string): string {
    const domainName = this.getDomainTitle(this.selectedDomain || 'career');
    const lowerMessage = userMessage.toLowerCase();
    
    // Get VFP-Graph personality insights
    const personalityContext = this.getVFPGraphPersonalityContext();
    
    if (this.inquiryPhase === 'discovery') {
      return this.createVFPGraphDiscoveryResponse(userMessage, domainName, lowerMessage, personalityContext);
    } else if (this.inquiryPhase === 'blueprint_analysis') {
      return this.createVFPGraphBlueprintResponse(userMessage, domainName, personalityContext);
    } else {
      return this.createVFPGraphActionResponse(userMessage, domainName, personalityContext);
    }
  }

  private getVFPGraphPersonalityContext(): {
    energyLevel: string;
    dominantTrait: string;
    communicationStyle: string;
    hasVFPGraph: boolean;
  } {
    if (!this.vfpGraphCache.vector) {
      return {
        energyLevel: 'balanced',
        dominantTrait: 'adaptable',
        communicationStyle: 'balanced',
        hasVFPGraph: false
      };
    }

    const vector = this.vfpGraphCache.vector;
    
    // Analyze vector for personality insights
    const vectorMagnitude = Math.sqrt(Array.from(vector).reduce((sum, val) => sum + val * val, 0));
    const mbtiSection = Array.from(vector.slice(0, 32));
    const hdSection = Array.from(vector.slice(32, 96));
    
    const energyLevel = vectorMagnitude > 80 ? 'high-intensity' : 
                      vectorMagnitude > 60 ? 'moderate-energy' : 'calm-steady';
    
    const mbtiStrength = mbtiSection.reduce((sum, val) => sum + Math.abs(val), 0) / 32;
    const hdStrength = hdSection.reduce((sum, val) => sum + Math.abs(val), 0) / 64;
    
    const dominantTrait = mbtiStrength > hdStrength ? 'analytical' : 'intuitive';
    const communicationStyle = mbtiStrength > 0.7 ? 'direct' : 
                              hdStrength > 0.7 ? 'experiential' : 'balanced';

    return {
      energyLevel,
      dominantTrait,
      communicationStyle,
      hasVFPGraph: true
    };
  }

  private createVFPGraphDiscoveryResponse(
    userMessage: string, 
    domainName: string, 
    lowerMessage: string, 
    personalityContext: any
  ): string {
    const { energyLevel, dominantTrait, communicationStyle, hasVFPGraph } = personalityContext;
    
    // Adapt response style based on VFP-Graph insights
    const responseIntensity = energyLevel === 'high-intensity' ? 'energetically' : 
                             energyLevel === 'calm-steady' ? 'gently' : 'thoughtfully';
    
    const questioningStyle = dominantTrait === 'analytical' ? 'specific and structured' : 'open and exploratory';

    // Handle expressions of struggle with VFP-Graph personalization
    if (lowerMessage.includes("can't find") || lowerMessage.includes("why can't i")) {
      if (domainName.toLowerCase().includes('relationship') || domainName.toLowerCase().includes('love')) {
        return `I can ${responseIntensity} feel the frustration and perhaps loneliness in that question. Not being able to find love is one of life's most challenging experiences.${hasVFPGraph ? ` Based on your unique personality pattern, I sense you process emotions ${dominantTrait === 'analytical' ? 'deeply and systematically' : 'intuitively and holistically'}.` : ''}

Tell me more about what that journey has looked like for you - are you actively trying to meet people but connections aren't forming the way you hope? Or does it feel more like you're not sure where or how to start? 

${dominantTrait === 'analytical' ? 'What specific patterns have you noticed in your dating experiences?' : 'What does "finding love" feel like to you in your heart?'}`;
      } else if (domainName.toLowerCase().includes('career')) {
        return `That feeling of being stuck without a clear career path can be really overwhelming.${hasVFPGraph ? ` Your personality profile suggests you approach challenges ${communicationStyle === 'direct' ? 'head-on with clear analysis' : communicationStyle === 'experiential' ? 'through hands-on exploration' : 'with thoughtful consideration'}.` : ''}

Help me understand your situation better - is this more about not knowing what kind of work would fulfill you, or have you tried things that didn't work out? 

${dominantTrait === 'analytical' ? 'What criteria are you using to evaluate potential career paths?' : 'What does having a meaningful career represent to you?'}`;
      }
    }

    // Handle expressions of confusion with personality-adapted clarity
    if (lowerMessage.includes("don't know") || lowerMessage.includes("confused") || lowerMessage.includes("how do you mean")) {
      return `Let me be more ${communicationStyle === 'direct' ? 'specific and direct' : 'clear and gentle'}. When you think about ${domainName.toLowerCase()}, what comes up for you emotionally?${hasVFPGraph ? ` Your personality pattern suggests you might process this ${dominantTrait === 'analytical' ? 'through logical analysis' : 'through felt experience'}.` : ''}

For example, do you feel frustrated, sad, hopeful, scared, or something else? And what specific situations or experiences in this area have left you feeling that way?`;
    }

    // Default empathic follow-up adapted to personality
    const followUpQuestions = [
      `I want to understand the full picture of what's happening with your ${domainName.toLowerCase()}.${hasVFPGraph ? ` Given your ${energyLevel} personality style, let's approach this ${questioningStyle}.` : ''} What emotions come up when you think about this area of your life?`,
      
      `Help me understand what's been most challenging about ${domainName.toLowerCase()} for you.${hasVFPGraph ? ` Your ${dominantTrait} nature suggests you likely have insights about this.` : ''} What specific situations or experiences have shaped how you feel about it now?`,
      
      `When you imagine ${domainName.toLowerCase()} working well in your life, what does that look like?${hasVFPGraph && energyLevel === 'high-intensity' ? ' I can sense your energy around this vision.' : ''} What would need to change for you to feel satisfied in this area?`,
      
      `Tell me about the story of your ${domainName.toLowerCase()}.${hasVFPGraph ? ` With your ${communicationStyle} communication style, help me understand` : ''} How did you get to where you are now? What key moments or experiences stand out?`
    ];

    const questionIndex = Math.min(this.questionCount - 1, followUpQuestions.length - 1);
    return followUpQuestions[questionIndex];
  }

  private createVFPGraphBlueprintResponse(userMessage: string, domainName: string, personalityContext: any): string {
    const { hasVFPGraph, dominantTrait, energyLevel } = personalityContext;
    
    return `I'm starting to see some powerful patterns here based on what you've shared about your ${domainName.toLowerCase()}.${hasVFPGraph ? ` Your unique VFP-Graph personality profile adds incredible depth to this analysis.` : ''} 

From our conversation, I can see themes around ${this.discoveredInsights.join(', ')}. Now I want to help you understand the deeper "why" behind these patterns${hasVFPGraph ? ` by connecting them to your 128-dimensional personality profile` : ' by connecting them to your unique blueprint'}.

${hasVFPGraph ? `Based on your VFP-Graph analysis, these patterns actually make perfect sense for someone with your ${dominantTrait} ${energyLevel} personality structure. Your vector shows specific traits that might be clashing with conventional expectations around ${domainName.toLowerCase()}.` : `Based on your personality type and natural design, these patterns actually make sense.`}

Instead of seeing this as a flaw, let's reframe these patterns as workable aspects of who you are.${hasVFPGraph ? ` Your personality vector suggests you operate in a way that might be different from mainstream approaches, and that's actually your strength.` : ''} 

Can you tell me more about how you naturally prefer to approach tasks and decisions? This will help me connect your authentic operating style to what's happening in your ${domainName.toLowerCase()}.`;
  }

  private createVFPGraphActionResponse(userMessage: string, domainName: string, personalityContext: any): string {
    const { hasVFPGraph, energyLevel, communicationStyle, dominantTrait } = personalityContext;
    
    return `Now that we understand what's happening and why these patterns exist given your unique makeup, let's focus on practical strategies that will work WITH your natural design rather than against it.${hasVFPGraph ? ` Your VFP-Graph profile gives us precise insights for this.` : ''}

Based on your insights (${this.discoveredInsights.join(', ')})${hasVFPGraph ? ` and your ${energyLevel} ${dominantTrait} personality vector` : ' and understanding your blueprint'}, here are some personalized approaches for your ${domainName.toLowerCase()}:

1. **Honor Your Natural Rhythm**: ${hasVFPGraph ? `Your personality vector shows you operate best with ${energyLevel === 'high-intensity' ? 'dynamic, high-energy approaches' : energyLevel === 'calm-steady' ? 'steady, consistent methods' : 'balanced, flexible strategies'}.` : 'Instead of forcing conventional approaches, let\'s create strategies that align with how you naturally operate.'}

2. **Leverage Your Strengths**: ${hasVFPGraph ? `Your ${dominantTrait} nature and ${communicationStyle} communication style are actually advantages when properly channeled.` : 'We\'ve identified patterns that can actually become advantages when properly channeled.'}

3. **Sustainable Next Steps**: ${hasVFPGraph ? `Based on your personality profile, you'll respond best to ${dominantTrait === 'analytical' ? 'structured, step-by-step progressions' : 'intuitive, flow-based approaches'}.` : 'Rather than overwhelming changes, let\'s focus on small, consistent actions that feel authentic to you.'}

What resonates most with you from what we've discovered?${hasVFPGraph ? ` And given your ${energyLevel} personality style, what feels like the most natural first step you could take in your ${domainName.toLowerCase()} that would honor your authentic way of being?` : ` And what feels like the most natural first step you could take in your ${domainName.toLowerCase()} that would honor your authentic way of being?`}

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

  // New VFP-Graph specific methods
  async recordVFPGraphFeedback(messageId: string, isPositive: boolean, userId: string): Promise<void> {
    try {
      await personalityVectorService.voteThumb(userId, messageId, isPositive);
      console.log(`✅ VFP-Graph feedback recorded via Program-Aware Coach: ${isPositive ? '👍' : '👎'}`);
    } catch (error) {
      console.error("❌ Error recording VFP-Graph feedback in Program-Aware Coach:", error);
    }
  }

  getVFPGraphStatus(): {
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
  } {
    return {
      isAvailable: !!this.vfpGraphCache.vector,
      vectorDimensions: this.vfpGraphCache.vector?.length || 0,
      personalitySummary: this.vfpGraphCache.summary || 'No personality data'
    };
  }
}

export const programAwareCoachService = new ProgramAwareCoachService();
