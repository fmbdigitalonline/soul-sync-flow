import type {
  ConflictResolveRequest,
  FeedbackWeightRequest,
  PersonaRequest,
  ProcessMessageRequest,
} from '../types/contracts.ts';

import { unifiedBrainService } from '../../src/services/unified-brain-service.ts';
import { personalityFusionService } from '../../src/services/personality-fusion-service.ts';
import { conflictNavigationResolution } from '../../src/services/hermetic-core/conflict-navigation-resolution.ts';

export class CoreEngineService {
  async processMessage(input: ProcessMessageRequest) {
    await unifiedBrainService.initialize(input.userId);

    return unifiedBrainService.processMessage(
      input.message,
      input.sessionId,
      input.agentMode ?? 'guide',
      (input.currentState as any) ?? 'NORMAL',
    );
  }

  async createPersona(input: PersonaRequest) {
    return personalityFusionService.generatePersonalityFusion(
      input.userId,
      input.mbtiType,
      input.gates,
      input.astroData,
    );
  }

  async resolve(input: ConflictResolveRequest) {
    return conflictNavigationResolution.resolveConflicts(
      input.conflicts.map((conflict, index) => ({
        id: `api-${index}-${Date.now()}`,
        type: conflict.type,
        frameworks: conflict.frameworks,
        conflictingData: conflict.conflictingData,
        severity: conflict.severity,
        detectedAt: new Date(),
        context: {
          sessionId: conflict.sessionId,
          currentMode: conflict.currentMode,
          userInput: conflict.userInput,
        },
      })),
    );
  }

  async updateWeightsFromFeedback(input: FeedbackWeightRequest) {
    return personalityFusionService.updateWeightsFromFeedback(
      input.userId,
      input.isPositive,
      input.contextVector,
    );
  }
}

export const coreEngineService = new CoreEngineService();
