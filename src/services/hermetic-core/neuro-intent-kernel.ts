import type { VPGBlueprint } from "../unified-brain-context";

interface IntentAnalysis {
  intent: string;
  primary?: string;
  id?: string;
  confidence: number;
  priority?: number;
  coherenceScore?: number;
  context?: any;
  biasFactors: string[];
  contextualModifiers: Record<string, any>;
  subIntents?: any[];
  constraints?: any[];
  decomposition?: any[];
}

class NeuroIntentKernel {
  private currentUserId: string | null = null;
  private vgpBlueprint: VPGBlueprint | null = null;
  private intentHistory: IntentAnalysis[] = [];

  constructor() {
    console.log("🧠 Neuro Intent Kernel: Initialized");
  }

  setUserId(userId: string) {
    this.currentUserId = userId;
    console.log("👤 NIK: User set:", userId);
  }

  setBlueprintContext(blueprint: VPGBlueprint) {
    this.vgpBlueprint = blueprint;
    console.log("🧠 NIK: VPG Blueprint context injected");
  }

  async analyzeIntent(message: string): Promise<IntentAnalysis> {
    console.log("🎯 NIK: Analyzing intent for message:", message.substring(0, 50) + "...");

    // Basic intent classification
    const baseIntent = this.classifyBaseIntent(message);
    
    // Apply personality-based bias from VPG blueprint
    const biasedIntent = this.applyPersonalityBias(baseIntent, message);

    const analysis: IntentAnalysis = {
      intent: biasedIntent.intent,
      confidence: biasedIntent.confidence,
      biasFactors: biasedIntent.biasFactors,
      contextualModifiers: biasedIntent.contextualModifiers
    };

    this.intentHistory.push(analysis);
    
    // Keep only last 10 intents
    if (this.intentHistory.length > 10) {
      this.intentHistory = this.intentHistory.slice(-10);
    }

    console.log("✅ NIK: Intent analysis complete:", analysis.intent);
    return analysis;
  }

  // Backwards compatibility alias
  async processIntent(message: string): Promise<IntentAnalysis> {
    return this.analyzeIntent(message);
  }

  private classifyBaseIntent(message: string): { intent: string; confidence: number } {
    const lowerMessage = message.toLowerCase();

    // Task-related intents
    if (lowerMessage.includes('task') || lowerMessage.includes('work') || lowerMessage.includes('complete')) {
      return { intent: 'task_management', confidence: 0.8 };
    }

    // Goal-related intents
    if (lowerMessage.includes('goal') || lowerMessage.includes('achieve') || lowerMessage.includes('plan')) {
      return { intent: 'goal_setting', confidence: 0.8 };
    }

    // Help/guidance intents
    if (lowerMessage.includes('help') || lowerMessage.includes('guide') || lowerMessage.includes('how')) {
      return { intent: 'guidance_seeking', confidence: 0.7 };
    }

    // Emotional/support intents
    if (lowerMessage.includes('feel') || lowerMessage.includes('stuck') || lowerMessage.includes('frustrated')) {
      return { intent: 'emotional_support', confidence: 0.7 };
    }

    // Information intents
    if (lowerMessage.includes('what') || lowerMessage.includes('why') || lowerMessage.includes('explain')) {
      return { intent: 'information_seeking', confidence: 0.6 };
    }

    return { intent: 'general_conversation', confidence: 0.5 };
  }

  private applyPersonalityBias(baseIntent: { intent: string; confidence: number }, message: string): {
    intent: string;
    confidence: number;
    biasFactors: string[];
    contextualModifiers: Record<string, any>;
  } {
    if (!this.vgpBlueprint) {
      return {
        ...baseIntent,
        biasFactors: ['no_blueprint'],
        contextualModifiers: {}
      };
    }

    const traits = this.vgpBlueprint.personality?.traits;
    const biasFactors: string[] = [];
    const contextualModifiers: Record<string, any> = {};

    if (traits) {
      // Cognitive style bias
      if (traits.cognitiveStyle === 'analytical' && baseIntent.intent === 'guidance_seeking') {
        baseIntent.intent = 'structured_analysis';
        biasFactors.push('analytical_cognitive_style');
        contextualModifiers.preferredApproach = 'systematic';
      }

      // Energy strategy bias
      if (traits.energyStrategy === 'burst' && baseIntent.intent === 'task_management') {
        contextualModifiers.energyApproach = 'intensive_focused';
        biasFactors.push('burst_energy_strategy');
      }

      // Communication style bias
      if (traits.communicationStyle === 'direct' && baseIntent.intent === 'emotional_support') {
        contextualModifiers.communicationPreference = 'straightforward';
        biasFactors.push('direct_communication_style');
      }
    }

    return {
      ...baseIntent,
      biasFactors,
      contextualModifiers
    };
  }

  getIntentHistory(): IntentAnalysis[] {
    return [...this.intentHistory];
  }

  getStatus(): any {
    return {
      initialized: true,
      userId: this.currentUserId,
      blueprintLoaded: !!this.vgpBlueprint,
      intentHistoryCount: this.intentHistory.length
    };
  }

  // Additional methods required by components
  setIntent(intentOrContext: string | any, primary?: string, id?: string, priority?: number): IntentAnalysis {
    console.log("🎯 NIK: Setting intent:", intentOrContext);
    
    // Handle both string intent and object context
    const intent = typeof intentOrContext === 'string' ? intentOrContext : 'complex_intent';
    
    return {
      intent,
      primary: primary || intent,
      id: id || `intent-${Date.now()}`,
      confidence: 0.8,
      priority: priority || 1,
      coherenceScore: 0.9,
      context: typeof intentOrContext === 'object' ? intentOrContext : {},
      biasFactors: ['manual_set'],
      contextualModifiers: {},
      subIntents: [{ steps: ['step1', 'step2'], estimatedDuration: 30 }],
      constraints: [{ steps: [], estimatedDuration: 0 }],
      decomposition: [{ steps: ['analyze', 'execute'], estimatedDuration: 60 }]
    };
  }

  persistIntent(): Promise<void> {
    console.log("💾 NIK: Persisting intent");
    // Implementation would save to database
    return Promise.resolve();
  }

  restoreFromTMG(context?: any): Promise<IntentAnalysis | null> {
    console.log("🔄 NIK: Restoring from TMG");
    // Implementation would restore from Temporal Memory Graph
    return Promise.resolve({
      intent: 'restored',
      confidence: 0.7,
      biasFactors: ['tmg'],
      contextualModifiers: {}
    });
  }

  generateInternalIntent(context: any): IntentAnalysis {
    console.log("🔮 NIK: Generating internal intent");
    return {
      intent: 'internal_generated',
      confidence: 0.6,
      biasFactors: ['internal'],
      contextualModifiers: context
    };
  }

  getIntentState(): any {
    return {
      currentIntent: this.intentHistory[this.intentHistory.length - 1] || null,
      historyCount: this.intentHistory.length,
      lastUpdate: new Date().toISOString()
    };
  }
}

export const neuroIntentKernel = new NeuroIntentKernel();
