
import { enhancedAICoachService } from "./enhanced-ai-coach-service";
import { growthProgramService } from "./growth-program-service";
import { GrowthProgram, ProgramWeek } from "@/types/growth-program";

class ProgramAwareCoachService {
  private currentProgram: GrowthProgram | null = null;
  private currentWeek: ProgramWeek | null = null;

  async initializeForUser(userId: string) {
    console.log("🎯 Program-Aware Coach: Initializing for user", userId);
    
    try {
      this.currentProgram = await growthProgramService.getCurrentProgram(userId);
      
      if (this.currentProgram) {
        const weeks = await growthProgramService.generateWeeklyProgram(this.currentProgram);
        this.currentWeek = weeks.find(w => w.week_number === this.currentProgram!.current_week) || null;
        
        console.log("✅ Program context loaded:", {
          program: this.currentProgram.domain,
          week: this.currentWeek?.theme,
          focus: this.currentWeek?.focus_area
        });
      }
    } catch (error) {
      console.error("❌ Error initializing program context:", error);
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

    // Enhance message with program context
    const enhancedMessage = this.enhanceMessageWithContext(message);
    
    console.log("🎯 Sending program-aware message:", {
      originalMessage: message.substring(0, 50) + "...",
      hasContext: !!this.currentProgram,
      currentWeek: this.currentWeek?.week_number,
      theme: this.currentWeek?.theme
    });

    return await enhancedAICoachService.sendMessage(
      enhancedMessage,
      sessionId,
      usePersona,
      "guide",
      "en"
    );
  }

  private enhanceMessageWithContext(message: string): string {
    if (!this.currentProgram || !this.currentWeek) {
      return message;
    }

    const contextPrefix = `[PROGRAM CONTEXT]
Current Growth Program: ${this.currentProgram.domain.replace('_', ' ')} (Week ${this.currentWeek.week_number}/${this.currentProgram.total_weeks})
Week Theme: ${this.currentWeek.theme.replace('_', ' ')}
Focus Area: ${this.currentWeek.focus_area}
Available Tools: ${this.currentWeek.tools_unlocked.join(', ')}
Week Goals: ${this.currentWeek.completion_criteria.join('; ')}

Please keep this program context in mind when responding. The user is specifically working on their ${this.currentProgram.domain.replace('_', ' ')} growth journey.

[USER MESSAGE]
${message}`;

    return contextPrefix;
  }

  getReadinessPrompts(): string[] {
    if (!this.currentWeek) return [];

    const readinessMap = {
      foundation: [
        "How are you feeling about starting this growth journey?",
        "What's your current energy level for change right now?",
        "On a scale of 1-10, how ready do you feel to explore new perspectives?"
      ],
      belief_excavation: [
        "Have you noticed any recurring thoughts or patterns that might be limiting you?",
        "How comfortable are you with examining beliefs that might no longer serve you?",
        "Are you feeling ready to look at some deeper patterns in your life?"
      ],
      blueprint_activation: [
        "How connected do you feel to your natural strengths and talents?",
        "Are you curious about how your personality type influences your approach to growth?",
        "Would you like to explore how your unique blueprint can guide this journey?"
      ],
      domain_deep_dive: [
        "What specific changes are you most excited to make in this area?",
        "Are you ready to create concrete action steps for your transformation?",
        "How motivated do you feel to take bold action in this domain?"
      ],
      integration: [
        "How are you seeing connections between this growth area and other parts of your life?",
        "Are you ready to create lasting change that extends beyond this single focus area?",
        "What would sustainable integration look like for you?"
      ],
      graduation: [
        "What transformation are you most proud of from this journey?",
        "How ready do you feel to continue growing on your own?",
        "What would you like to celebrate about your progress?"
      ]
    };

    return readinessMap[this.currentWeek.theme] || [];
  }

  shouldIntroduceFramework(userMessage: string, framework: string): boolean {
    // Simple readiness detection based on user language
    const readinessIndicators = {
      bashar_laws: ['excited', 'passion', 'joy', 'follow my excitement', 'what excites me'],
      shadow_work: ['angry', 'frustrated', 'triggered', 'shadow', 'dark side', 'what I hate'],
      belief_work: ['believe', 'think I should', 'always', 'never', 'can\'t', 'impossible']
    };

    const indicators = readinessIndicators[framework] || [];
    const message = userMessage.toLowerCase();
    
    return indicators.some(indicator => message.includes(indicator));
  }

  getCurrentContext() {
    return {
      program: this.currentProgram,
      week: this.currentWeek,
      hasContext: !!(this.currentProgram && this.currentWeek)
    };
  }
}

export const programAwareCoachService = new ProgramAwareCoachService();
