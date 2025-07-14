
import { enhancedAICoachService } from './enhanced-ai-coach-service';
import { hacsRoutingService } from './hacs-routing-service';

/**
 * HACS-Enhanced AI Coach Service
 * Wraps the existing enhanced AI coach service to route all calls through HACS
 * for intelligence learning while preserving all existing functionality
 */
class HACSEnhancedAICoachService {
  private originalService = enhancedAICoachService;

  /**
   * CRITICAL: Override sendStreamingMessage to route through HACS
   * This ensures all streaming conversations contribute to intelligence learning
   */
  async sendStreamingMessage(
    message: string,
    sessionId: string,
    usePersonalization: boolean = true,
    agentType: string = "guide",
    language: string = "en",
    callbacks: {
      onChunk?: (chunk: string) => void;
      onComplete?: (fullContent: string) => void;
      onError?: (error: Error) => void;
    } = {},
    userDisplayName: string = 'friend'
  ): Promise<void> {
    console.log('🔄 HACS Enhanced AI Coach: Routing streaming message through HACS');
    
    // Route through HACS for intelligence learning
    await hacsRoutingService.routeStreamingMessage({
      message,
      sessionId,
      agentType,
      language,
      userDisplayName,
      includeBlueprint: usePersonalization,
      temperature: 0.7,
      maxTokens: 1000
    }, callbacks);
  }

  /**
   * Preserve all other methods from original service
   */
  setCurrentUser(userId: string) {
    return this.originalService.setCurrentUser(userId);
  }

  updateUserBlueprint(blueprintData: any) {
    return this.originalService.updateUserBlueprint(blueprintData);
  }

  createNewSession(agentType: string): string {
    return this.originalService.createNewSession(agentType);
  }

  getCurrentUser() {
    return this.originalService.getCurrentUser();
  }

  getUserBlueprint() {
    return this.originalService.getUserBlueprint();
  }

  getPersonalityContext(blueprintData: any) {
    return this.originalService.getPersonalityContext(blueprintData);
  }

  buildSystemPrompt(
    agentType: string,
    blueprintData: any,
    personalityContext: any,
    language: string,
    userDisplayName: string
  ) {
    return this.originalService.buildSystemPrompt(
      agentType,
      blueprintData,
      personalityContext,
      language,
      userDisplayName
    );
  }
}

// Export singleton instance that preserves all functionality while adding HACS routing
export const hacsEnhancedAICoachService = new HACSEnhancedAICoachService();
