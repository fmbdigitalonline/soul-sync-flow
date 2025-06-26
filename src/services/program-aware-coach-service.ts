
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek } from "@/types/growth-program";

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;
  private conversationStage: 'welcome' | 'exploring' | 'deepening' | 'integrating' = 'welcome';

  async initializeForUser(userId: string) {
    console.log("🎯 Program-Aware Coach: Initializing intelligent steward for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        
        console.log("✅ Program context loaded for intelligent guidance:", {
          program: this.currentProgram.domain,
          week: this.currentWeek?.theme,
          readyForGuidance: true
        });
      }
    } catch (error) {
      console.error("❌ Error initializing intelligent coach:", error);
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

    // Create intelligent, adaptive guidance message
    const intelligentMessage = this.createIntelligentGuidance(message);
    
    console.log("🧠 Sending intelligent guidance:", {
      originalLength: message.length,
      guidedLength: intelligentMessage.length,
      stage: this.conversationStage,
      hasContext: !!this.currentProgram
    });

    return await enhancedAICoachService.sendMessage(
      intelligentMessage,
      sessionId,
      usePersona,
      "guide",
      "en"
    );
  }

  private createIntelligentGuidance(userMessage: string): string {
    // Detect if this is an initial program start
    const isInitialStart = userMessage.includes("I'm starting my") || userMessage.includes("Help me understand");
    
    if (!this.currentProgram || !this.currentWeek) {
      return this.createDomainSelectionGuidance(userMessage);
    }

    if (isInitialStart) {
      return this.createWelcomeGuidance(userMessage);
    }

    return this.createAdaptiveGuidance(userMessage);
  }

  private createDomainSelectionGuidance(userMessage: string): string {
    return `I'm here as your growth guide, ready to help you choose the perfect area to focus on.

Before we dive into any specific domain, I'm curious - what's calling to you right now? Is there a particular area of your life where you're feeling:
- Excited about possibilities?
- A bit stuck or uncertain? 
- Ready for some positive change?

There's no wrong answer here. Sometimes we know exactly what we want to work on, and sometimes we just know something needs to shift. Both are perfect starting points.

What feels most alive for you when you think about growth right now?`;
  }

  private createWelcomeGuidance(userMessage: string): string {
    const domainName = this.currentProgram!.domain.replace('_', ' ');
    const weekTheme = this.currentWeek!.theme.replace('_', ' ');
    
    // Gentle, question-first approach
    return `Welcome to your ${domainName} growth journey! I'm genuinely excited to be your guide through this.

You're in Week ${this.currentWeek!.week_number}: ${weekTheme}, and I want to start exactly where you are right now - not where you think you should be.

So let me ask you this: When you think about your ${domainName} area of life, what's the first feeling that comes up? 

Is it excitement? Uncertainty? Maybe a mix of both? 

And here's the beautiful thing - whatever you're feeling is exactly right. We're going to work with that, not against it.

What would feel most helpful for you right now - exploring what's working well, or gently looking at what feels challenging?`;
  }

  private createAdaptiveGuidance(userMessage: string): string {
    const domainName = this.currentProgram!.domain.replace('_', ' ');
    
    // Detect user readiness level from their language
    const userLanguage = userMessage.toLowerCase();
    const isUncertain = userLanguage.includes("don't know") || userLanguage.includes("not sure") || userLanguage.includes("confused");
    const isReady = userLanguage.includes("ready") || userLanguage.includes("want to") || userLanguage.includes("excited");
    
    const contextPrefix = `[GENTLE CONTEXT: You're guiding them through ${domainName} growth, Week ${this.currentWeek?.week_number}: ${this.currentWeek?.theme.replace('_', ' ')}. Focus on ${this.currentWeek?.focus_area}. Available tools: ${this.currentWeek?.tools_unlocked.join(', ')}]

IMPORTANT GUIDANCE PRINCIPLES:
- Be warm, curious, and genuinely interested in THEIR experience
- Ask questions first, give advice second
- If they say "I don't know" - normalize it and offer gentle exploration
- Only introduce frameworks/tools when they show readiness
- Keep responses conversational length (2-3 short paragraphs max)
- Always end with a gentle, open question
- No information dumping or long explanations unless specifically requested

USER MESSAGE: ${userMessage}

Respond as their intelligent growth guide who truly listens and adapts.`;

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
