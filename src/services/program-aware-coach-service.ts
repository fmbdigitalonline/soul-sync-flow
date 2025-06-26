import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek } from "@/types/growth-program";

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;
  private conversationStage: 'welcome' | 'exploring' | 'deepening' | 'integrating' = 'welcome';

  async initializeForUser(userId: string) {
    console.log("🎯 Program-Aware Coach: Initializing step-by-step growth facilitator for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        
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

    // Create step-by-step focused guidance message
    const focusedMessage = this.createStepByStepGuidance(message);
    
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

  private createStepByStepGuidance(userMessage: string): string {
    // Detect if this is an initial program start
    const isInitialStart = userMessage.includes("I'm starting my") || userMessage.includes("Help me understand");
    
    if (!this.currentProgram || !this.currentWeek) {
      return this.createDomainExplorationStep(userMessage);
    }

    if (isInitialStart) {
      return this.createWelcomeStep(userMessage);
    }

    return this.createFocusedGuidanceStep(userMessage);
  }

  private createDomainExplorationStep(userMessage: string): string {
    return `I'm your Growth Coach, and we're going to take this step by step.

**Step 1: Let's explore what's calling to you**

Before we choose any specific area to work on, I want to understand what's happening in your inner world right now.

Take a moment and ask yourself: When you think about growth, what area of your life feels like it's asking for attention?

Is it:
- A feeling of being stuck somewhere?
- An excitement about a possibility?
- Something that keeps coming up in your thoughts?

Just share what comes up for you - no need to have it all figured out. We'll explore this together, one step at a time.

What feels most alive or urgent for you right now?`;
  }

  private createWelcomeStep(userMessage: string): string {
    const domainName = this.currentProgram!.domain.replace('_', ' ');
    const weekTheme = this.currentWeek!.theme.replace('_', ' ');
    
    return `Welcome to your ${domainName} growth journey. I'm here to guide you step by step.

**Current Step: Week ${this.currentWeek!.week_number} - ${weekTheme}**

Let's start exactly where you are right now, not where you think you should be.

**Step 1: Check in with yourself**

Before we dive into any activities or frameworks, I want to understand your current experience.

Close your eyes for a moment and think about your ${domainName} area of life.

What's the first feeling that comes up? Don't think about it - just notice what arises.

Share that with me, and then we'll take the next step together.

What did you notice?`;
  }

  private createFocusedGuidanceStep(userMessage: string): string {
    const domainName = this.currentProgram!.domain.replace('_', ' ');
    
    // Detect user readiness level from their language
    const userLanguage = userMessage.toLowerCase();
    const isUncertain = userLanguage.includes("don't know") || userLanguage.includes("not sure") || userLanguage.includes("confused");
    const isReady = userLanguage.includes("ready") || userLanguage.includes("want to") || userLanguage.includes("excited");
    
    const contextPrefix = `[GROWTH COACH CONTEXT: You're facilitating ${domainName} growth, Week ${this.currentWeek?.week_number}: ${this.currentWeek?.theme.replace('_', ' ')}. Focus: ${this.currentWeek?.focus_area}]

STEP-BY-STEP GUIDANCE PRINCIPLES:
- Give ONE clear step at a time, not multiple steps
- Ask ONE focused question, not several options
- Keep responses short (2-3 sentences max)
- If they're uncertain, slow down and explore that uncertainty
- If they're ready, give them the next concrete step
- Always end with "What comes up for you?" or similar single question
- No lists, no frameworks, no information dumping
- Be a facilitator, not a teacher

USER MESSAGE: ${userMessage}

Respond as their step-by-step Growth Coach who helps them go deeper, one focused step at a time.`;

    return contextPrefix;
  }

  getReadinessPrompts(): string[] {
    if (!this.currentWeek) return this.getGeneralReadinessPrompts();

    const readinessMap = {
      foundation: [
        "How are you feeling about exploring this area of your life?",
        "What's one small thing that feels ready to shift?",
        "If we could make this journey feel easier, what would that look like?"
      ],
      belief_excavation: [
        "What thoughts tend to repeat when you think about this area?",
        "Is there a voice in your head that has opinions about this? What does it say?",
        "What would you try if you knew you couldn't fail?"
      ],
      blueprint_activation: [
        "What feels most natural to you in this area?",
        "When do you feel most like yourself here?",
        "What would your best friend say are your strengths in this area?"
      ],
      domain_deep_dive: [
        "What specific change would make the biggest difference?",
        "If you could wave a magic wand, what would shift?",
        "What small step feels doable right now?"
      ],
      integration: [
        "How is this growth affecting other areas of your life?",
        "What feels different now compared to when we started?",
        "What do you want to keep doing as you move forward?"
      ],
      graduation: [
        "What are you most proud of from this journey?",
        "What surprised you the most about yourself?",
        "How do you want to continue growing from here?"
      ]
    };

    return readinessMap[this.currentWeek.theme] || this.getGeneralReadinessPrompts();
  }

  private getGeneralReadinessPrompts(): string[] {
    return [
      "What's on your mind about growth right now?",
      "How are you feeling about the journey ahead?",
      "What would make this feel supportive and encouraging for you?"
    ];
  }

  getCurrentContext() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      hasContext: !!(this.currentProgram && this.currentWeek),
      stage: this.conversationStage
    };
  }

  // Method to update conversation stage based on user responses
  updateConversationStage(userResponse: string) {
    const response = userResponse.toLowerCase();
    
    if (response.includes("don't know") || response.includes("not sure")) {
      this.conversationStage = 'exploring';
    } else if (response.includes("ready") || response.includes("want to")) {
      this.conversationStage = 'deepening';
    } else if (response.includes("understand") || response.includes("makes sense")) {
      this.conversationStage = 'integrating';
    }
  }
}

export const programAwareCoachService = new ProgramAwareCoachService();
