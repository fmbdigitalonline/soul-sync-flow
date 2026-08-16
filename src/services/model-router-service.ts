interface ConversationContext {
  agentType: 'coach' | 'guide' | 'blend' | 'dream';
  turnNumber: number;
  emotionalThemes: boolean;
  blueprintHeavy: boolean;
  userMood: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  importance: number;
  sessionType: 'onboarding' | 'routine' | 'crisis' | 'exploration';
}

interface ModelSelection {
  model: string;
  maxTokens: number;
  temperature: number | undefined;
  reasoning: string;
  layer: 'core_brain' | 'tmg' | 'pie' | 'acs' | 'exploration_coach' | 'optimized';
  costTier: 'premium' | 'standard' | 'economy' | 'low' | 'deprecated';
}

class ModelRouterService {
  private readonly MODEL_CONFIGS = {
    // Primary model for all operations.
    //
    // This name must match CHAT_MODEL in supabase/functions/_shared/model.ts.
    // The edge functions are the canonical owner; the frontend only repeats it
    // because it passes `modelOverride` and cannot import a Deno module. The
    // right end state is that the frontend stops naming a model at all and
    // lets the edge default apply — parked, not done here.
    'gpt-5.6-luna': {
      maxTokens: 2000,
      temperature: undefined, // Reasoning models reject temperature.
      costPerToken: 0.0000002,
      layer: 'optimized' as const,
      costTier: 'low' as const
    },
    'gpt-4.1-mini-2025-04-14': {
      maxTokens: 2000,
      temperature: undefined,
      costPerToken: 0.000001,
      layer: 'optimized' as const,
      costTier: 'deprecated' as const
    },
    // Legacy models (deprecated, kept for compatibility)
    'gpt-4o': {
      maxTokens: 1500,
      temperature: 0.7,
      costPerToken: 0.00003,
      layer: 'core_brain' as const,
      costTier: 'deprecated' as const
    },
    'gpt-4o-mini': {
      maxTokens: 1200,
      temperature: 0.6,
      costPerToken: 0.000001,
      layer: 'core_brain' as const,
      costTier: 'deprecated' as const
    },
    'o3-mini': {
      maxTokens: 1200,
      temperature: 0.6,
      costPerToken: 0.00002,
      layer: 'core_brain' as const,
      costTier: 'deprecated' as const
    },
    'gpt-4.1-mini': {
      maxTokens: 800,
      temperature: 0.4,
      costPerToken: 0.000008,
      layer: 'pie' as const,
      costTier: 'deprecated' as const
    }
  };

  selectModel(context: ConversationContext): ModelSelection {
    console.log('🎯 Model Router: Using the shared chat model for all requests:', context);

    // One model for everything. Not a router in practice — kept because its
    // ModelSelection shape is consumed downstream.
    return this.buildSelection('gpt-5.6-luna', 'Shared chat model');
  }

  private requiresPremiumModel(context: ConversationContext): boolean {
    return (context.importance > 9 && context.complexity === 'high' && context.emotionalThemes) ||
           context.sessionType === 'crisis';
  }

  private requiresCoreLayer(context: ConversationContext): boolean {
    return context.blueprintHeavy || 
           (context.agentType === 'guide' && context.complexity !== 'low') ||
           context.turnNumber <= 3;
  }

  private requiresPIELayer(context: ConversationContext): boolean {
    return context.importance > 7 || 
           context.sessionType === 'exploration' ||
           (context.emotionalThemes && context.complexity === 'high');
  }

  private requiresExplorationLayer(context: ConversationContext): boolean {
    return context.sessionType === 'onboarding' ||
           context.sessionType === 'crisis' ||
           (context.agentType === 'coach' && context.emotionalThemes);
  }

  private requiresTMGLayer(context: ConversationContext): boolean {
    return context.sessionType === 'routine' && 
           !context.emotionalThemes && 
           context.complexity === 'low';
  }

  private buildSelection(model: string, reasoning: string): ModelSelection {
    const config = this.MODEL_CONFIGS[model as keyof typeof this.MODEL_CONFIGS];
    
    if (!config) {
      console.warn(`⚠️ Unknown model ${model}, falling back to the shared chat model`);
      return this.buildSelection('gpt-5.6-luna', 'Fallback due to unknown model');
    }

    console.log(`✅ Selected ${model} (${config.layer} layer, ${config.costTier} tier): ${reasoning}`);

    return {
      model,
      maxTokens: config.maxTokens,
      temperature: config.temperature,
      reasoning,
      layer: config.layer,
      costTier: config.costTier
    };
  }

  escalateModel(currentModel: string, reason: 'user_feedback' | 'low_quality' | 'timeout'): ModelSelection {
    console.log(`🔄 Escalation requested but staying with the shared chat model due to: ${reason}`);
    
    // No escalation: one model, chosen once.
    return this.buildSelection('gpt-5.6-luna', `Staying with the shared chat model despite ${reason}`);
  }

  // Cost optimization suggestions
  suggestOptimization(currentUsage: { model: string; tokensUsed: number; frequency: number }[]): string[] {
    const suggestions: string[] = [];

    for (const usage of currentUsage) {
      const config = this.MODEL_CONFIGS[usage.model as keyof typeof this.MODEL_CONFIGS];
      if (!config) continue;

      // High frequency usage - suggest optimization
      if (usage.frequency > 100) {
        suggestions.push(`High frequency detected for ${usage.model} - consider reviewing usage patterns`);
      }

      // High token usage - suggest compression
      if (usage.tokensUsed > 1500) {
        suggestions.push(`High token usage for ${usage.model} - consider compressing prompts`);
      }
    }

    return suggestions;
  }
}

export const modelRouterService = new ModelRouterService();
