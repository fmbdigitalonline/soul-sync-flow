
import { enhancedAICoachService } from './enhanced-ai-coach-service';
import { hacsRoutingService } from './hacs-routing-service';

// Import AgentType from the correct location
type AgentType = "coach" | "guide" | "blend";

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
    agentType: AgentType = "guide",
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
   * Preserve existing methods from original service
   */
  setCurrentUser(userId: string) {
    return this.originalService.setCurrentUser(userId);
  }

  updateUserBlueprint(blueprintData: any) {
    return this.originalService.updateUserBlueprint(blueprintData);
  }

  createNewSession(agentType: AgentType): string {
    return this.originalService.createNewSession(agentType);
  }

  // Remove non-existent methods that were causing errors
  // The original service doesn't have these methods, so we don't expose them
}

// Export singleton instance that preserves all functionality while adding HACS routing
export const hacsEnhancedAICoachService = new HACSEnhancedAICoachService();
