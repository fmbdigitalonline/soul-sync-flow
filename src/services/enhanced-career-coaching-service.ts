
import { careerStatusClassifier, CareerClassificationResult } from './career-status-classifier';
import { eventBusService, CAREER_EVENTS } from './event-bus-service';
import { adaptiveContextScheduler } from './adaptive-context-scheduler';
import { pieService } from './pie-service';
import { tieredMemoryGraph } from './tiered-memory-graph';
import { personalityVectorService } from './personality-vector-service';

export interface CareerCoachingContext {
  userId: string;
  sessionId: string;
  currentStatus: CareerClassificationResult;
  confirmationState: 'pending' | 'confirmed' | 'rejected';
  discoveryPhase: 'initial' | 'exploring' | 'focusing' | 'planning' | 'acting';
  personalityAlignment: any;
  conversationHistory: Array<{
    message: string;
    response: string;
    timestamp: number;
  }>;
}

class EnhancedCareerCoachingService {
  private activeContexts = new Map<string, CareerCoachingContext>();
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    // Subscribe to career events
    eventBusService.subscribe(CAREER_EVENTS.STATUS_DETECTED, this.handleStatusDetected.bind(this));
    eventBusService.subscribe(CAREER_EVENTS.STATUS_CONFIRMED, this.handleStatusConfirmed.bind(this));
    eventBusService.subscribe(CAREER_EVENTS.CAREER_CONFUSION, this.handleCareerConfusion.bind(this));

    this.initialized = true;
    console.log('🚀 Enhanced Career Coaching Service initialized');
  }

  async processCareerMessage(
    message: string,
    userId: string,
    sessionId: string,
    conversationHistory: any[] = []
  ): Promise<{
    response: string;
    needsConfirmation: boolean;
    followUpQuestions: string[];
    careerContext: CareerCoachingContext;
  }> {
    await this.initialize();

    // Classify career status
    const classification = careerStatusClassifier.classifyCareerStatus(message);
    
    // Get or create context
    let context = this.activeContexts.get(sessionId);
    if (!context) {
      context = await this.createCareerContext(userId, sessionId, classification);
      this.activeContexts.set(sessionId, context);
    }

    // Update context with new classification
    context.currentStatus = classification;
    context.conversationHistory.push({
      message,
      response: '', // Will be filled later
      timestamp: Date.now()
    });

    // Emit career status event
    await eventBusService.publish(
      CAREER_EVENTS.STATUS_DETECTED,
      {
        status: classification.primaryStatus.status,
        confidence: classification.primaryStatus.confidence,
        needsConfirmation: classification.needsConfirmation,
        message
      },
      'career-coaching-service',
      userId,
      sessionId
    );

    // Generate appropriate response
    const response = await this.generateCareerResponse(context, message);
    
    // Update conversation history
    context.conversationHistory[context.conversationHistory.length - 1].response = response.response;

    // Store in TMG with career context
    await this.storeCareerMemory(userId, sessionId, message, response.response, classification);

    return response;
  }

  private async createCareerContext(
    userId: string,
    sessionId: string,
    classification: CareerClassificationResult
  ): Promise<CareerCoachingContext> {
    // Get personality alignment
    let personalityAlignment = null;
    try {
      personalityAlignment = await personalityVectorService.getVector(userId);
    } catch (error) {
      console.warn('Could not get personality vector for career context:', error);
    }

    return {
      userId,
      sessionId,
      currentStatus: classification,
      confirmationState: classification.needsConfirmation ? 'pending' : 'confirmed',
      discoveryPhase: 'initial',
      personalityAlignment,
      conversationHistory: []
    };
  }

  private async generateCareerResponse(
    context: CareerCoachingContext,
    message: string
  ): Promise<{
    response: string;
    needsConfirmation: boolean;
    followUpQuestions: string[];
    careerContext: CareerCoachingContext;
  }> {
    const { currentStatus, confirmationState, discoveryPhase } = context;

    let response = '';
    let needsConfirmation = false;
    let followUpQuestions: string[] = [];

    // Handle confirmation state first
    if (confirmationState === 'pending') {
      response = await this.generateConfirmationResponse(currentStatus, context);
      needsConfirmation = true;
    } else {
      // Generate status-appropriate response
      response = await this.generateContextualResponse(currentStatus, context, message);
      followUpQuestions = this.generateFollowUpQuestions(currentStatus, discoveryPhase);
    }

    // Enhance with personality insights if available
    if (context.personalityAlignment) {
      response = await this.enhanceWithPersonality(response, context);
    }

    return {
      response,
      needsConfirmation,
      followUpQuestions,
      careerContext: context
    };
  }

  private async generateConfirmationResponse(
    classification: CareerClassificationResult,
    context: CareerCoachingContext
  ): Promise<string> {
    const status = classification.primaryStatus.status;
    
    const confirmationPrompts = {
      no_career: "I want to make sure I understand correctly - you don't currently have a career or job, is that right? This actually gives us a clean slate to explore what truly excites you.",
      unemployed: "Let me confirm - you're currently unemployed? I understand this can be a challenging time, and I'm here to help you navigate both the practical and emotional aspects.",
      job_searching: "I hear that you're actively looking for work - is that accurate? Job searching can be its own full-time job, with unique stresses and opportunities.",
      career_transition: "It sounds like you're in the middle of a career change or transition - does that capture what's happening? These pivot points can be both exciting and uncertain.",
      employed_struggling: "I'm picking up that you have a job but it's causing you stress or dissatisfaction - is that what you're experiencing? Work struggles can affect so much more than just our 9-to-5.",
      employed_satisfied: "It seems like your career is generally going well - am I reading that right? Even when things are good, there's often room to grow or optimize."
    };

    return confirmationPrompts[status] || "I want to make sure I understand your career situation correctly before we dive deeper. Can you help me get a clearer picture?";
  }

  private async generateContextualResponse(
    classification: CareerClassificationResult,
    context: CareerCoachingContext,
    message: string
  ): Promise<string> {
    const status = classification.primaryStatus.status;
    const phase = context.discoveryPhase;

    // Get PIE insights for career context
    let pieInsights = [];
    try {
      pieInsights = await pieService.getInsightsForConversation('guide');
    } catch (error) {
      console.warn('Could not get PIE insights for career response:', error);
    }

    switch (status) {
      case 'no_career':
        return this.generateNoCareerResponse(phase, context, pieInsights);
      
      case 'unemployed':
        return this.generateUnemployedResponse(phase, context, pieInsights);
      
      case 'job_searching':
        return this.generateJobSearchResponse(phase, context, pieInsights);
      
      case 'career_transition':
        return this.generateTransitionResponse(phase, context, pieInsights);
      
      case 'employed_struggling':
        return this.generateStrugglingResponse(phase, context, pieInsights);
      
      case 'employed_satisfied':
        return this.generateSatisfiedResponse(phase, context, pieInsights);
      
      default:
        return "I'd love to understand more about your career situation. What's the most important thing happening in your work life right now?";
    }
  }

  private generateNoCareerResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    switch (phase) {
      case 'initial':
        return "Having no career right now is actually a unique position of freedom. Instead of fixing something that's broken, we get to discover what truly excites you. What activities or topics make you lose track of time?";
      
      case 'exploring':
        return "Let's explore what energizes you. When you imagine contributing to the world, what feels most meaningful? Don't worry about job titles or practicality yet.";
      
      default:
        return "Since you're starting fresh with your career, we have the luxury of exploring what genuinely excites you. What kind of impact do you want to make in the world?";
    }
  }

  private generateUnemployedResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    switch (phase) {
      case 'initial':
        return "Being unemployed brings both practical pressures and unexpected opportunities. How long has it been, and what's been the hardest part of this transition?";
      
      case 'exploring':
        return "While you're between jobs, this might be a chance to reflect on what you actually want from work. What did you like and dislike about your previous role?";
      
      default:
        return "Unemployment can be incredibly stressful, but it also creates space for clarity. What kind of work would make this challenging period feel worthwhile?";
    }
  }

  private generateJobSearchResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    return "Job searching is emotionally and mentally exhausting work. What type of roles are you pursuing, and how is the process affecting you?";
  }

  private generateTransitionResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    return "Career transitions take courage. What's driving this change for you - is it growth, dissatisfaction, or something else entirely?";
  }

  private generateStrugglingResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    return "Work struggles can drain your energy and affect everything else in life. What specifically is making your current job difficult?";
  }

  private generateSatisfiedResponse(phase: string, context: CareerCoachingContext, pieInsights: any[]): string {
    return "It's wonderful that your career is going well. What aspects are working best for you, and where do you see opportunities to grow even further?";
  }

  private generateFollowUpQuestions(classification: CareerClassificationResult, phase: string): string[] {
    const status = classification.primaryStatus.status;
    
    const questionSets = {
      no_career: [
        "What activities make you feel most alive and engaged?",
        "If money wasn't a factor, how would you spend your time?",
        "What problems in the world do you feel drawn to solving?"
      ],
      unemployed: [
        "What kind of work environment helps you thrive?",
        "What skills do you want to develop or use more?",
        "How are you taking care of yourself during this transition?"
      ],
      job_searching: [
        "What's your ideal work culture like?",
        "What are your non-negotiables in a new role?",
        "How are you staying motivated during the search?"
      ]
    };

    return questionSets[status] || [];
  }

  private async enhanceWithPersonality(response: string, context: CareerCoachingContext): Promise<string> {
    // This would integrate personality insights to adapt the response tone and approach
    // For now, return the original response
    return response;
  }

  private async storeCareerMemory(
    userId: string,
    sessionId: string,
    userMessage: string,
    aiResponse: string,
    classification: CareerClassificationResult
  ): Promise<void> {
    try {
      const memoryContent = {
        userMessage,
        aiResponse,
        careerStatus: classification.primaryStatus.status,
        confidence: classification.primaryStatus.confidence,
        timestamp: new Date().toISOString(),
        context: 'career_coaching'
      };

      await tieredMemoryGraph.storeInHotMemory(
        userId,
        sessionId,
        memoryContent,
        8.0 // High importance for career status revelations
      );
    } catch (error) {
      console.error('Failed to store career memory:', error);
    }
  }

  // Event handlers using correct ACS methods
  private async handleStatusDetected(event: any): Promise<void> {
    console.log('🎯 Career status detected:', event.data);
    
    // Influence ACS through feedback mechanism based on career status
    if (event.data.status === 'no_career') {
      // Signal positive engagement for exploration mode
      adaptiveContextScheduler.recordUserFeedback('positive', 'Career exploration mode activated');
    } else if (event.data.status === 'employed_struggling') {
      // Signal the need for supportive dialogue
      adaptiveContextScheduler.recordUserFeedback('neutral', 'Career support mode activated');
    }
  }

  private async handleStatusConfirmed(event: any): Promise<void> {
    console.log('✅ Career status confirmed:', event.data);
    
    const context = this.activeContexts.get(event.sessionId);
    if (context) {
      context.confirmationState = 'confirmed';
      context.discoveryPhase = 'exploring';
    }
    
    // Signal successful confirmation to ACS
    adaptiveContextScheduler.recordUserFeedback('positive', 'Career status confirmed');
  }

  private async handleCareerConfusion(event: any): Promise<void> {
    console.log('❓ Career confusion detected:', event.data);
    
    // Signal confusion to ACS for appropriate response adjustment
    adaptiveContextScheduler.recordUserFeedback('negative', 'Career status confusion detected');
  }

  // Public methods for confirmation handling
  async confirmCareerStatus(sessionId: string, confirmed: boolean): Promise<void> {
    const context = this.activeContexts.get(sessionId);
    if (!context) return;

    if (confirmed) {
      context.confirmationState = 'confirmed';
      await eventBusService.publish(
        CAREER_EVENTS.STATUS_CONFIRMED,
        { status: context.currentStatus.primaryStatus.status },
        'career-coaching-service',
        context.userId,
        sessionId
      );
      adaptiveContextScheduler.recordUserFeedback('positive', 'Career status confirmed');
    } else {
      context.confirmationState = 'rejected';
      adaptiveContextScheduler.recordUserFeedback('negative', 'Career status rejected');
      await eventBusService.publish(
        CAREER_EVENTS.CAREER_CONFUSION,
        { previousStatus: context.currentStatus.primaryStatus.status },
        'career-coaching-service',
        context.userId,
        sessionId
      );
    }
  }
}

export const enhancedCareerCoachingService = new EnhancedCareerCoachingService();
