
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek, LifeDomain } from "@/types/growth-program";

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;
  private conversationStage: 'welcome' | 'domain_exploration' | 'belief_drilling' | 'program_creation' | 'active_guidance' = 'welcome';
  private selectedDomain: LifeDomain | null = null;
  private beliefExplorationData: any = {};

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

  async sendProgramAwareMessage(
    message: string,
    sessionId: string,
    userId: string,
    usePersona: boolean = true
  ): Promise<{ response: string; conversationId: string }> {
    // Ensure we have current program context
    if (!this.currentProgram) {
      await this.initializeForUser(userId);
    }

    // Create simple, focused guidance message
    const focusedMessage = this.createFocusedGuidance(message, userId);
    
    console.log("🧠 Sending focused growth guidance:", {
      stage: this.conversationStage,
      hasContext: !!this.currentProgram
    });

    return await enhancedAICoachService.sendMessage(
      focusedMessage,
      sessionId,
      usePersona,
      "guide",
      "en"
    );
  }

  async initializeBeliefDrilling(domain: LifeDomain, userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.selectedDomain = domain;
    this.conversationStage = 'belief_drilling';
    
    const simplePrompt = `I want to understand why you chose ${domain.replace('_', ' ')} for growth. What draws you to focus on this area of your life right now?`;

    return await enhancedAICoachService.sendMessage(
      simplePrompt,
      sessionId,
      true,
      "guide",
      "en"
    );
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

  private createFocusedGuidance(userMessage: string, userId: string): string {
    // Simple, focused prompts based on conversation stage
    if (this.conversationStage === 'belief_drilling') {
      return `Continue exploring their beliefs about ${this.selectedDomain?.replace('_', ' ')}. They said: "${userMessage}". Ask ONE follow-up question that goes deeper. Be warm and conversational.`;
    }
    
    if (this.conversationStage === 'domain_exploration') {
      return `Help them choose a growth area. They said: "${userMessage}". Guide them warmly toward one of the 7 life domains: career, relationships, wellbeing, finances, creativity, spirituality, or home & family.`;
    }

    if (!this.currentProgram) {
      return `Help with their growth journey. They said: "${userMessage}". Give ONE helpful response or ask ONE focused question.`;
    }

    const domainName = this.currentProgram!.domain.replace('_', ' ');
    return `They're working on ${domainName} growth. They said: "${userMessage}". Give ONE helpful response about their ${domainName} journey.`;
  }

  getCurrentContext() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      hasContext: !!(this.currentProgram && this.currentWeek),
      stage: this.conversationStage,
      selectedDomain: this.selectedDomain
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
