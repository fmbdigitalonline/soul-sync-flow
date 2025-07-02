
interface ConversationContext {
  agentType: 'coach' | 'guide' | 'blend';
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
    'o3-mini': {
      maxTokens: 1200,
      temperature: 0.6,
      costPerToken: 0.00002,
      layer: 'core_brain' as const,
      costTier: 'standard' as const
    },
    // TMG + ACS Layers
    'gpt-4o-mini': {
      maxTokens: 1000,
      temperature: 0.5,
      costPerToken: 0.00001,
      layer: 'acs' as const,
      costTier: 'economy' as const
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

    // Core Brain Layer - Deep personality integration
    if (this.requiresCoreLayer(context)) {
      const model = context.complexity === 'high' ? 'gpt-4o' : 'o3-mini';
      return this.buildSelection(model, 'Deep personality integration required');
    }

    // PIE Layer - Symbolic insights and emotional patterns
    if (this.requiresPIELayer(context)) {
      const model = context.importance > 8 ? 'gpt-4o' : 'gpt-4.1-mini';
      return this.buildSelection(model, 'Proactive insight generation needed');
    }

    // Exploration Coach Layer - Growth and emotional themes
    if (this.requiresExplorationLayer(context)) {
      const model = context.sessionType === 'onboarding' || context.emotionalThemes ? 'gpt-4o' : 'gpt-4o-mini';
      return this.buildSelection(model, 'Exploration coaching required');
    }

    // TMG Layer - Memory operations
    if (this.requiresTMGLayer(context)) {
      return this.buildSelection('gpt-4o-mini', 'Memory graph operations');
    }

    // ACS Layer - Default for state switching and routine interactions
    return this.buildSelection('gpt-4o-mini', 'Routine interaction with adaptive context');
  }

  private requiresCoreLayer(context: ConversationContext): boolean {
    return context.blueprintHeavy || 
           (context.agentType === 'guide' && context.complexity !== 'low') ||
           context.turnNumber <= 3;
  }

  private requiresPIELayer(context: ConversationContext): boolean {
    return context.importance > 6 || 
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
        suggestions.push(`Consider using ${usage.model === 'gpt-4o' ? 'o3-mini' : 'gpt-4o-mini'} for routine ${usage.model} calls`);
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
