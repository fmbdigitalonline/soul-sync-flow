import { LifeDomain } from '@/types/growth-program';
import { enhancedCareerCoachingService } from './enhanced-career-coaching-service';
import { eventBusService, CAREER_EVENTS } from './event-bus-service';

export interface CareerDiscoveryContext {
  userId: string;
  sessionId: string;
  discoveredStatus: string | null;
  statusConfidence: number;
  explorationPhase: 'status_discovery' | 'values_exploration' | 'path_mapping' | 'action_planning';
  discoveredValues: string[];
  blockers: string[];
  strengths: string[];
  emotionalSignals: string[];
  userFrustrationLevel: number;
}

class CareerDiscoveryService {
  private contexts = new Map<string, CareerDiscoveryContext>();

  async initializeDiscovery(userId: string, sessionId: string): Promise<CareerDiscoveryContext> {
    const context: CareerDiscoveryContext = {
      userId,
      sessionId,
      discoveredStatus: null,
      statusConfidence: 0,
      explorationPhase: 'status_discovery',
      discoveredValues: [],
      blockers: [],
      strengths: [],
      emotionalSignals: [],
      userFrustrationLevel: 0
    };

    this.contexts.set(sessionId, context);
    console.log('🔍 Career discovery context initialized');
    return context;
  }

  async processDiscoveryMessage(
    message: string,
    sessionId: string
  ): Promise<{
    response: string;
    context: CareerDiscoveryContext;
    phaseComplete: boolean;
    readyForProgram: boolean;
  }> {
    let context = this.contexts.get(sessionId);
    if (!context) {
      throw new Error('Career discovery context not found');
    }

    // Detect emotional signals and frustration
    this.extractEmotionalSignals(message, context);

    // Use enhanced career coaching for status detection
    const careerResponse = await enhancedCareerCoachingService.processCareerMessage(
      message,
      context.userId,
      sessionId
    );

    // Update context with discovered information
    context.discoveredStatus = careerResponse.careerContext.currentStatus.primaryStatus.status;
    context.statusConfidence = careerResponse.careerContext.currentStatus.primaryStatus.confidence;

    // Extract insights from message
    this.extractInsights(message, context);

    // Generate contextual response based on emotional state and content
    const { response, phaseComplete, readyForProgram } = this.generateEmotionallyAwareResponse(context, message);

    // Advance phase if complete
    if (phaseComplete) {
      context.explorationPhase = this.getNextPhase(context.explorationPhase);
    }

    this.contexts.set(sessionId, context);

    return {
      response,
      context,
      phaseComplete,
      readyForProgram
    };
  }

  private extractEmotionalSignals(message: string, context: CareerDiscoveryContext): void {
    const lowerMessage = message.toLowerCase();
    
    // Detect frustration and emotional signals
    const emotionalPatterns = [
      { pattern: /stuck|trapped|can't move/, signal: 'feeling_stuck', frustration: 2 },
      { pattern: /mad|angry|frustrated|frustrating/, signal: 'angry', frustration: 3 },
      { pattern: /why don't you listen|not listening|ignore/, signal: 'feeling_unheard', frustration: 4 },
      { pattern: /help|support|need/, signal: 'seeking_help', frustration: 1 },
      { pattern: /confused|don't know|unclear/, signal: 'confusion', frustration: 1 }
    ];

    emotionalPatterns.forEach(({ pattern, signal, frustration }) => {
      if (pattern.test(lowerMessage)) {
        if (!context.emotionalSignals.includes(signal)) {
          context.emotionalSignals.push(signal);
        }
        context.userFrustrationLevel = Math.max(context.userFrustrationLevel, frustration);
      }
    });
  }

  private extractInsights(message: string, context: CareerDiscoveryContext): void {
    const lowerMessage = message.toLowerCase();

    // Extract values
    const valuePatterns = [
      /value|important|matters|care about|meaningful/,
      /purpose|mission|impact|difference/,
      /creativity|innovation|building|creating/,
      /helping|service|support|contribution/,
      /learning|growth|development|mastery/,
      /autonomy|freedom|independence|flexibility/,
      /stability|security|consistency|reliability/
    ];

    valuePatterns.forEach(pattern => {
      if (pattern.test(lowerMessage)) {
        const valueMatch = lowerMessage.match(pattern);
        if (valueMatch && !context.discoveredValues.includes(valueMatch[0])) {
          context.discoveredValues.push(valueMatch[0]);
        }
      }
    });

    // Extract blockers
    const blockerPatterns = [
      /can't|cannot|unable|stuck|blocked/,
      /afraid|scared|fear|anxiety|worry/,
      /don't know|unsure|confused|uncertain/,
      /not good enough|inadequate|imposter/,
      /overwhelmed|stressed|burned out/
    ];

    blockerPatterns.forEach(pattern => {
      if (pattern.test(lowerMessage)) {
        const blockerMatch = lowerMessage.match(pattern);
        if (blockerMatch && !context.blockers.includes(blockerMatch[0])) {
          context.blockers.push(blockerMatch[0]);
        }
      }
    });

    // Extract strengths
    const strengthPatterns = [
      /good at|skilled|talented|strong|excel/,
      /enjoy|love|passionate|excited/,
      /natural|comes easily|intuitive/,
      /experience|background|expertise/
    ];

    strengthPatterns.forEach(pattern => {
      if (pattern.test(lowerMessage)) {
        const strengthMatch = lowerMessage.match(pattern);
        if (strengthMatch && !context.strengths.includes(strengthMatch[0])) {
          context.strengths.push(strengthMatch[0]);
        }
      }
    });
  }

  private generateEmotionallyAwareResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    // If user is showing high frustration, acknowledge it first
    if (context.userFrustrationLevel >= 3) {
      return this.generateFrustrationResponse(context, message);
    }

    // If user feels unheard, acknowledge that specifically
    if (context.emotionalSignals.includes('feeling_unheard')) {
      return this.generateListeningResponse(context, message);
    }

    // If user feels stuck, focus on that
    if (context.emotionalSignals.includes('feeling_stuck')) {
      return this.generateStuckResponse(context, message);
    }

    // Default to phase-based response
    return this.generatePhaseResponse(context, message);
  }

  private generateFrustrationResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    if (message.toLowerCase().includes('mad') || message.toLowerCase().includes('frustrating')) {
      return {
        response: `I can hear the frustration in your words, and I want you to know that makes complete sense. Being stuck in your career can feel maddening, especially when it feels like you're not being heard or understood.

Let me slow down and really listen to what you're telling me. You said you're "stuck" - that word tells me a lot. It sounds like you might feel trapped between where you are and where you want to be, but can't see a clear path forward.

Can you tell me more about what "stuck" feels like for you specifically? Is it that you don't know what direction to go, or that you know what you want but can't figure out how to get there?`,
        phaseComplete: false,
        readyForProgram: false
      };
    }

    return {
      response: `I hear you're feeling really frustrated right now, and that makes total sense. Career challenges can be incredibly draining and maddening.

Instead of asking you the same questions, let me acknowledge what you've already told me: you feel stuck in your career. That's real, and that's important information.

What would help most right now - would you like to talk about what's making you feel most trapped, or would you prefer to explore what might help you feel less stuck?`,
      phaseComplete: false,
      readyForProgram: false
    };
  }

  private generateListeningResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    return {
      response: `You're absolutely right, and I apologize. I wasn't truly listening to what you were telling me. You said you're "stuck" in your career, and instead of hearing that and responding to it, I kept asking generic questions.

Let me actually listen now: You feel stuck in your career. That's a real and difficult place to be. 

When you say "stuck," I'm wondering - does that mean you feel trapped in a job that isn't working for you? Or does it mean you're not sure what direction to take your career? Or something else entirely?

I want to understand YOUR specific situation, not just ask standard career questions.`,
      phaseComplete: true,
      readyForProgram: false
    };
  }

  private generateStuckResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    return {
      response: `I hear you saying you're stuck, and I want to understand what that really means for you. "Stuck" can feel different for different people.

Some people feel stuck because they're in a job they don't like but don't know how to leave. Others feel stuck because they don't know what they want to do with their career at all. Some feel stuck because they know what they want but can't figure out how to get there.

What does "stuck" look like in your day-to-day life? What would it feel like if you weren't stuck anymore?`,
      phaseComplete: true,
      readyForProgram: false
    };
  }

  private generatePhaseResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    switch (context.explorationPhase) {
      case 'status_discovery':
        return this.generateStatusDiscoveryResponse(context, message);
      
      case 'values_exploration':
        return this.generateValuesExplorationResponse(context, message);
      
      case 'path_mapping':
        return this.generatePathMappingResponse(context, message);
      
      case 'action_planning':
        return this.generateActionPlanningResponse(context, message);
      
      default:
        return {
          response: "Let's continue exploring your career situation.",
          phaseComplete: false,
          readyForProgram: false
        };
    }
  }

  private generateStatusDiscoveryResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    const status = context.discoveredStatus;
    
    if (status === 'no_career') {
      return {
        response: `I understand you don't currently have a career. That's actually a position of possibility - we can explore what truly excites you without the constraints of an existing job. 

What activities or subjects make you lose track of time? When you imagine making a contribution to the world, what comes to mind?`,
        phaseComplete: context.statusConfidence > 0.7,
        readyForProgram: false
      };
    }

    if (status === 'unemployed') {
      return {
        response: `Being unemployed can bring both practical pressures and opportunities for clarity. How long has it been, and what's been the most challenging part of this transition? 

Also, thinking about your previous work - what did you enjoy most, and what would you want to be different?`,
        phaseComplete: context.statusConfidence > 0.7,
        readyForProgram: false
      };
    }

    // Default status discovery
    return {
      response: `Help me understand your current career situation better. What's the most important thing happening in your work life right now?`,
      phaseComplete: context.statusConfidence > 0.6,
      readyForProgram: false
    };
  }

  private generateValuesExplorationResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    if (context.discoveredValues.length < 3) {
      return {
        response: `Let's dig deeper into what matters to you. When you think about work or contribution, what makes something feel meaningful vs. just a paycheck? 

What kind of impact do you want to have - on people, problems, or the world?`,
        phaseComplete: false,
        readyForProgram: false
      };
    }

    return {
      response: `I'm seeing themes around ${context.discoveredValues.join(', ')} in what you value. Now, thinking about blockers - what stops you from moving toward work that honors these values? 

Is it practical concerns, self-doubt, unclear next steps, or something else?`,
      phaseComplete: true,
      readyForProgram: false
    };
  }

  private generatePathMappingResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    return {
      response: `Based on what you've shared - your values around ${context.discoveredValues.slice(0, 2).join(' and ')}, and the challenges with ${context.blockers.slice(0, 2).join(' and ')} - I'm starting to see a clearer picture.

What would need to change for you to feel confident taking the next step in your career? And what would that next step look like?`,
      phaseComplete: context.blockers.length >= 2,
      readyForProgram: context.blockers.length >= 2 && context.discoveredValues.length >= 3
    };
  }

  private generateActionPlanningResponse(
    context: CareerDiscoveryContext,
    message: string
  ): { response: string; phaseComplete: boolean; readyForProgram: boolean } {
    return {
      response: `We've uncovered a lot about your career situation, values, and what's been blocking you. You're ready for a personalized growth program that addresses your specific situation.

Would you like me to create a program that helps you ${this.getActionFocus(context)}?`,
      phaseComplete: true,
      readyForProgram: true
    };
  }

  private getActionFocus(context: CareerDiscoveryContext): string {
    const status = context.discoveredStatus;
    
    if (status === 'no_career') {
      return 'discover your path and build confidence to take action';
    }
    
    if (status === 'unemployed') {
      return 'navigate this transition and find aligned opportunities';
    }
    
    return 'overcome your blockers and create career satisfaction';
  }

  private getNextPhase(currentPhase: CareerDiscoveryContext['explorationPhase']): CareerDiscoveryContext['explorationPhase'] {
    const phases: CareerDiscoveryContext['explorationPhase'][] = [
      'status_discovery',
      'values_exploration', 
      'path_mapping',
      'action_planning'
    ];
    
    const currentIndex = phases.indexOf(currentPhase);
    return phases[Math.min(currentIndex + 1, phases.length - 1)];
  }

  getContext(sessionId: string): CareerDiscoveryContext | null {
    return this.contexts.get(sessionId) || null;
  }

  clearContext(sessionId: string): void {
    this.contexts.delete(sessionId);
  }
}

export const careerDiscoveryService = new CareerDiscoveryService();
