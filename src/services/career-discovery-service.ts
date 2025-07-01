
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
      strengths: []
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

    // Determine next phase and response
    const { response, phaseComplete, readyForProgram } = this.generatePhaseResponse(context, message);

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
