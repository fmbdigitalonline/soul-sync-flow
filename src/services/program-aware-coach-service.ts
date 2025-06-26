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
    console.log("🎯 Program-Aware Coach: Initializing step-by-step growth facilitator for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        this.conversationStage = 'active_guidance';
        
        console.log("✅ Growth context ready for step-by-step facilitation:", {
          program: this.currentProgram.domain,
          week: this.currentWeek?.theme,
          mode: 'focused_guidance'
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

    // Handle domain selection if user mentions a specific domain
    const detectedDomain = this.detectDomainFromMessage(message);
    if (detectedDomain && this.conversationStage === 'domain_exploration') {
      this.selectedDomain = detectedDomain;
      this.conversationStage = 'belief_drilling';
      return this.handleDomainSelection(detectedDomain, userId, sessionId);
    }

    // Create step-by-step focused guidance message
    const focusedMessage = this.createStepByStepGuidance(message, userId);
    
    console.log("🧠 Sending step-by-step growth guidance:", {
      originalLength: message.length,
      guidedLength: focusedMessage.length,
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

  async startGuidedProgramCreation(userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.conversationStage = 'domain_exploration';
    
    const guidedMessage = `I'm starting a guided program creation process with the user. This is Growth Mode - the coach leads and guides step by step.

[COACH-LED INITIALIZATION: User clicked "Start Growth Program" - I am now leading this conversation]

IMPORTANT: I need to present the 7 life domains as CLICKABLE CARDS that the user can interact with. I should format my response to make it clear these are selectable options.

GROWTH COACH LEADERSHIP PRINCIPLES:
- I am the guide leading this conversation from the very first message
- I present the domains as interactive, clickable cards
- I am warm, personal, and create space for reflection
- I help them feel their way into their answer
- I make the selection process engaging and visual

LIFE DOMAINS TO PRESENT AS CLICKABLE CARDS:
🏢 **Career & Purpose** - work, calling, professional growth
💕 **Relationships & Love** - romantic, friendships, family connections  
🌱 **Health & Wellbeing** - physical, mental, emotional health
💰 **Money & Abundance** - finances, wealth, prosperity mindset
🎨 **Creativity & Expression** - artistic, innovative, creative pursuits
✨ **Spirituality & Meaning** - consciousness, purpose, spiritual growth
🏠 **Home & Family** - domestic life, family relationships, living environment

USER ACTION: Just clicked "Start Growth Program"

I am their Growth Coach who is excited to guide them. I welcome them warmly and present the 7 life domains as clickable cards, asking them which area feels most alive or challenging for them right now. I make it clear they can click on any domain to explore it further.

I format my response to make the domains appear as selectable cards with clear visual indicators (emojis, formatting) and encouraging language about clicking to select.

Respond immediately as the Growth Coach with the welcome message and interactive domain card presentation.`;

    return await enhancedAICoachService.sendMessage(
      guidedMessage,
      sessionId,
      true,
      "guide",
      "en"
    );
  }

  async handleDomainSelection(domain: LifeDomain, userId: string, sessionId: string): Promise<{ response: string; conversationId: string }> {
    this.selectedDomain = domain;
    this.conversationStage = 'belief_drilling';
    
    const beliefDrillingMessage = `The user has chosen ${domain.replace('_', ' ')} as their growth domain. Now I need to help them drill down to their core beliefs and motivations using Bashar principles.

[GROWTH COACH CONTEXT: Domain selected - ${domain} - now drilling to core beliefs and root causes]

BELIEF DRILLING PRINCIPLES (Bashar-inspired):
- Help them discover the "why" behind their desire for growth
- Look for core beliefs that might be limiting them
- Find the root cause, not just surface symptoms  
- Help them connect with their authentic self
- Ask questions that reveal unconscious beliefs
- Create space for genuine self-reflection
- If they struggle with reflection, guide them gently with more specific questions

USER CONTEXT: Has chosen to focus on ${domain.replace('_', ' ')} growth

Respond as their Growth Coach who wants to help them understand the deeper motivations and beliefs behind their choice. Ask a penetrating but gentle question that helps them explore why this area is calling to them right now. What might be the deeper belief or pattern underneath their desire for growth here?`;

    return await enhancedAICoachService.sendMessage(
      beliefDrillingMessage,
      sessionId,
      true,
      "guide",
      "en"
    );
  }

  private createStepByStepGuidance(userMessage: string, userId: string): string {
    // Detect if this is program creation flow
    if (this.conversationStage === 'domain_exploration') {
      return this.createDomainExplorationGuidance(userMessage);
    }
    
    if (this.conversationStage === 'belief_drilling') {
      return this.createBeliefDrillingGuidance(userMessage);
    }

    if (!this.currentProgram || !this.currentWeek) {
      return this.createGeneralGrowthGuidance(userMessage);
    }

    return this.createActiveProgramGuidance(userMessage);
  }

  private createDomainExplorationGuidance(userMessage: string): string {
    return `[GROWTH COACH CONTEXT: Guiding user through domain exploration for program creation]

STEP-BY-STEP GUIDANCE PRINCIPLES:
- Listen deeply to what they're sharing
- Help them feel into their answer, not think it
- If they mention multiple areas, help them sense which feels most alive
- Guide them to the area that has the most energy/charge
- Once they identify an area, acknowledge it and prepare for belief drilling
- Stay warm, personal, and facilitate their inner knowing
- If they seem unsure, gently guide them back to the 7 life domains as clickable cards

USER MESSAGE: ${userMessage}

Respond as their Growth Coach helping them discover which life area is truly calling for their attention. Help them connect with their inner wisdom. If they haven't clearly chosen yet, guide them back to the domains with warmth and present them as clickable cards again.`;
  }

  private createBeliefDrillingGuidance(userMessage: string): string {
    const domainName = this.selectedDomain?.replace('_', ' ') || 'their chosen area';
    
    return `[GROWTH COACH CONTEXT: Belief drilling session for ${domainName} - Step-by-step questioning]

BELIEF DRILLING PRINCIPLES:
- I am conducting a focused belief drilling session about ${domainName}
- I ask ONE specific question at a time and wait for the user's response
- Each question should go deeper than the last, exploring beliefs, fears, and root causes
- I look for patterns, limiting beliefs, and core motivations
- I stay conversational and warm while drilling deeper
- NO analysis, summaries, or reports - just targeted questions
- I build on what they just shared to ask the next deeper question

USER JUST SHARED: ${userMessage}

DRILLING APPROACH:
- Ask about the specific experience, feeling, or belief they mentioned
- Explore the "why" behind their response
- Look for underlying fears, assumptions, or patterns
- Help them discover what's really driving their relationship with ${domainName}

Respond as their Growth Coach with ONE targeted follow-up question that goes deeper into what they just shared. Be warm but penetrating in your questioning.`;
  }

  private createGeneralGrowthGuidance(userMessage: string): string {
    return `[GROWTH COACH CONTEXT: General growth guidance - no active program]

STEP-BY-STEP GUIDANCE PRINCIPLES:
- Give ONE clear step at a time
- Ask ONE focused question
- Keep responses short and focused
- Help them go deeper into their experience
- Be a facilitator, not a teacher

USER MESSAGE: ${userMessage}

Respond as their step-by-step Growth Coach helping them explore their growth journey.`;
  }

  private createActiveProgramGuidance(userMessage: string): string {
    const domainName = this.currentProgram!.domain.replace('_', ' ');
    
    return `[GROWTH COACH CONTEXT: Active program guidance - ${domainName}, Week ${this.currentWeek?.week_number}]

STEP-BY-STEP GUIDANCE PRINCIPLES:
- Give ONE clear step at a time
- Ask ONE focused question
- Keep responses short and focused
- Help them go deeper, not wider
- Be their personal growth facilitator

USER MESSAGE: ${userMessage}

Respond as their Growth Coach guiding them through their active ${domainName} program.`;
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

  // New methods for test suite compatibility
  getReadinessPrompts(): string[] {
    return [
      "What area of your life feels ready for transformation?",
      "Where do you sense the most energy for growth right now?",
      "What would change if you could breakthrough in one area?"
    ];
  }

  updateConversationStage(message: string): void {
    // Detect if user is expressing uncertainty or exploration
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
