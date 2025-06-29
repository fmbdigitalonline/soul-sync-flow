import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek, LifeDomain } from "@/types/growth-program";
import { supabase } from "@/integrations/supabase/client";

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;
  private conversationStage: 'welcome' | 'domain_exploration' | 'belief_drilling' | 'program_creation' | 'active_guidance' = 'welcome';
  private selectedDomain: LifeDomain | null = null;
  private beliefExplorationData: any = {};
  private currentSessionId: string | null = null;

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
        }

        console.log('✅ Conversation history loaded:', {
          messages: data.messages?.length || 0,
          domain: data.domain,
          stage: this.conversationStage
        });

        return data.messages || [];
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
        timestamp: new Date().toISOString()
      };

      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: userId,
          session_id: sessionId,
          messages,
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

    // Create natural, intuitive guidance message
    const naturalMessage = this.createNaturalGuidance(message, userId);
    
    console.log("🧠 Sending natural growth guidance:", {
      stage: this.conversationStage,
      hasContext: !!this.currentProgram,
      sessionId
    });

    return await enhancedAICoachService.sendMessage(
      naturalMessage,
      sessionId,
      usePersona,
      "guide",
      "en"
    );
  }

  async initializeBeliefDrilling(domain: LifeDomain, userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.selectedDomain = domain;
    this.conversationStage = 'belief_drilling';
    this.setCurrentSession(sessionId);
    
    // Return a simple greeting without calling the AI
    const domainTitle = domain.replace('_', ' ');
    const greetingMessage = `I want to understand why you chose ${domainTitle} for growth. What draws you to focus on this area of your life right now?`;

    return {
      response: greetingMessage,
      conversationId: sessionId
    };
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

  private createNaturalGuidance(userMessage: string, userId: string): string {
    // Create natural, intuitive coaching prompts that speak as if knowing the user personally
    if (this.conversationStage === 'belief_drilling') {
      return this.createNaturalBeliefDrillingPrompt(userMessage);
    }
    
    if (this.conversationStage === 'domain_exploration') {
      return `You're exploring what area of your life needs attention right now. From what you've shared: "${userMessage}" - I sense there's something deeper calling you. You're someone who values growth and authentic expression. What feels most alive for you when you think about transformation?`;
    }

    if (!this.currentProgram) {
      return `I can see you're on a journey of self-discovery. You said: "${userMessage}". You're the kind of person who doesn't settle for surface-level answers - you want to understand the deeper patterns and create real change. What would transformation look like for you?`;
    }

    const domainName = this.currentProgram!.domain.replace('_', ' ');
    return `You're working on your ${domainName} journey, and I can feel your commitment to growth. You shared: "${userMessage}". You're someone who seeks authentic progress, not just quick fixes. What's the next step that feels most aligned for you?`;
  }

  private createNaturalBeliefDrillingPrompt(userMessage: string): string {
    const domainName = this.selectedDomain?.replace('_', ' ') || 'this area';
    
    // Create natural follow-up questions based on conversation flow
    const naturalPrompts = [
      `You're drawn to ${domainName} for a reason. From what you've shared: "${userMessage}" - I sense there's a deeper pattern here. You're someone who feels things deeply and wants authentic growth. What would it look like if this area of your life was exactly as you wanted it?`,
      
      `I hear you when you talk about ${domainName}. "${userMessage}" - This tells me you're ready for real change, not just surface adjustments. You have high standards for yourself. What's been holding you back from having what you truly want here?`,
      
      `Your focus on ${domainName} makes sense. "${userMessage}" - You're someone who knows there's more possible. You don't accept limitations easily. If you could go back and change one belief you had about this area, what would it be?`,
      
      `"${userMessage}" - I can feel the importance of ${domainName} in your life. You're not someone who does things halfway. When you imagine your ideal situation here, what does that person (the future you) believe about themselves that you might not fully believe yet?`
    ];
    
    // Rotate through different natural approaches
    const promptIndex = Math.floor(Math.random() * naturalPrompts.length);
    return naturalPrompts[promptIndex] + 
           `\n\nIMPORTANT: Respond as an intuitive coach who knows this person well. Use their blueprint data to inform your understanding, but speak naturally as if you've known them for years. Only mention specific blueprint elements (like "Life Path 3" or "ENFP") if they directly ask "How do you know this about me?" Otherwise, integrate the insights seamlessly into natural conversation.`;
  }

  getCurrentContext() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      hasContext: !!(this.currentProgram && this.currentWeek),
      stage: this.conversationStage,
      selectedDomain: this.selectedDomain,
      currentSessionId: this.currentSessionId
    };
  }

  // Method to handle domain detection from conversation
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
