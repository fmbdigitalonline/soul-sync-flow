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
  temperature: number;
  reasoning: string;
  layer: 'core_brain' | 'tmg' | 'pie' | 'acs' | 'exploration_coach';
  costTier: 'premium' | 'standard' | 'economy';
}

class ModelRouterService {
  private readonly MODEL_CONFIGS = {
    // Core Brain Layer - VFP-Graph + Personality Fusion
    'gpt-4o': {
      maxTokens: 1500,
      temperature: 0.7,
      costPerToken: 0.00003, // Approximate
      layer: 'core_brain' as const,
      costTier: 'premium' as const
    },
    'gpt-4o-mini': {
      maxTokens: 1200,
      temperature: 0.6,
      costPerToken: 0.000001, // Much cheaper
      layer: 'core_brain' as const,
      costTier: 'economy' as const
    },
    // TMG + ACS Layers (keeping existing entries for compatibility)
    'o3-mini': {
      maxTokens: 1200,
      temperature: 0.6,
      costPerToken: 0.00002,
      layer: 'core_brain' as const,
      costTier: 'standard' as const
    },
    // PIE Layer Alternative
    'gpt-4.1-mini': {
      maxTokens: 800,
      temperature: 0.4,
      costPerToken: 0.000008,
      layer: 'pie' as const,
      costTier: 'economy' as const
    }
  };

  selectModel(context: ConversationContext): ModelSelection {
    console.log('🎯 Model Router: Analyzing context:', context);

    // Only use premium gpt-4o for truly critical scenarios
    if (this.requiresPremiumModel(context)) {
      return this.buildSelection('gpt-4o', 'Critical complexity requires premium model');
    }

    // Core Brain Layer - Use gpt-4o-mini for most cases
    if (this.requiresCoreLayer(context)) {
      return this.buildSelection('gpt-4o-mini', 'Core brain layer with cost optimization');
    }

    // PIE Layer - Use cost-effective models
    if (this.requiresPIELayer(context)) {
      const model = context.importance > 9 ? 'gpt-4o' : 'gpt-4o-mini';
      return this.buildSelection(model, 'PIE layer with cost optimization');
    }

    // Exploration Coach Layer - Use gpt-4o-mini primarily
    if (this.requiresExplorationLayer(context)) {
      const model = context.sessionType === 'crisis' ? 'gpt-4o' : 'gpt-4o-mini';
      return this.buildSelection(model, 'Exploration coaching with cost optimization');
    }

    // TMG Layer - Always use economy tier
    if (this.requiresTMGLayer(context)) {
      return this.buildSelection('gpt-4o-mini', 'Memory operations with cost optimization');
    }

    // ACS Layer - Default to economy tier
    return this.buildSelection('gpt-4o-mini', 'Cost-optimized default interaction');
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
      console.warn(`⚠️ Unknown model ${model}, falling back to gpt-4o-mini`);
      return this.buildSelection('gpt-4o-mini', 'Fallback due to unknown model');
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

  // Escalation logic for quality failures
  escalateModel(currentModel: string, reason: 'user_feedback' | 'low_quality' | 'timeout'): ModelSelection {
    console.log(`🔄 Escalating from ${currentModel} due to: ${reason}`);

    const escalationMap: Record<string, string> = {
      'gpt-4o-mini': 'gpt-4o',
      'gpt-4.1-mini': 'gpt-4o',
      'o3-mini': 'gpt-4o',
      'gpt-4o': 'gpt-4o' // Already at top tier
    };

    const escalatedModel = escalationMap[currentModel] || 'gpt-4o';
    return this.buildSelection(escalatedModel, `Escalated from ${currentModel} due to ${reason}`);
  }

  // Cost optimization suggestions
  suggestOptimization(currentUsage: { model: string; tokensUsed: number; frequency: number }[]): string[] {
    const suggestions: string[] = [];

    for (const usage of currentUsage) {
      const config = this.MODEL_CONFIGS[usage.model as keyof typeof this.MODEL_CONFIGS];
      if (!config) continue;

      // High frequency, expensive model
      if (usage.frequency > 100 && config.costTier === 'premium') {
        suggestions.push(`Consider using gpt-4o-mini for routine ${usage.model} calls`);
      }

      // High token usage
      if (usage.tokensUsed > 1500 && config.costTier !== 'economy') {
        suggestions.push(`Compress prompts for ${usage.model} to reduce token usage`);
      }
    }

    return suggestions;
  }
}

export const modelRouterService = new ModelRouterService();
