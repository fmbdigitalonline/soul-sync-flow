// Neuro-Intent Kernel (NIK) - Persistent Intent Management
// Implements Hermetic Principle of Mentalism ("All is Mind")

export interface Intent {
  id: string;
  primary: string;
  subIntents: string[];
  context: Record<string, any>;
  priority: number;
  timestamp: Date;
  sessionId: string;
  domain: string;
  constraints?: string[];
  decomposition?: {
    steps: string[];
    dependencies: string[];
    estimatedDuration?: number;
  };
  semanticVector?: number[];
  coherenceScore?: number;
}

export interface IntentUpdate {
  type: 'new' | 'modify' | 'complete' | 'abandon' | 'evolve';
  intent: Partial<Intent>;
  reason: string;
  confidence?: number;
}

export interface IntentBroadcast {
  intent: Intent | null;
  moduleId: string;
  action: 'prioritize' | 'evaluate' | 'suggest' | 'monitor';
  metadata?: Record<string, any>;
}

class NeuroIntentKernel {
  private currentIntent: Intent | null = null;
  private intentHistory: Intent[] = [];
  private listeners: ((intent: Intent | null) => void)[] = [];
  private moduleListeners: Map<string, (broadcast: IntentBroadcast) => void> = new Map();
  private tmgReference: any = null;
  private internalGenerationEnabled: boolean = true;
  private lastUserActivity: Date = new Date();
  private intentSuggestions: string[] = [];

  // Initialize TMG reference for persistence
  setTMGReference(tmgReference: any): void {
    this.tmgReference = tmgReference;
    console.log('🧠 NIK: TMG reference set for intent persistence');
  }

  // Initialize intent from external command or internal generation
  setIntent(primary: string, context: Record<string, any> = {}, sessionId: string, domain: string): Intent {
    // Enhanced intent analysis with semantic decomposition
    const analyzedIntent = this.analyzeIntent(primary, context, domain);
    
    const intent: Intent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      primary: analyzedIntent.refinedPrimary,
      subIntents: analyzedIntent.subIntents,
      context: { ...context, ...analyzedIntent.extractedContext },
      priority: analyzedIntent.priority,
      timestamp: new Date(),
      sessionId,
      domain,
      constraints: analyzedIntent.constraints,
      decomposition: analyzedIntent.decomposition,
      semanticVector: analyzedIntent.semanticVector,
      coherenceScore: analyzedIntent.coherenceScore
    };

    this.currentIntent = intent;
    this.intentHistory.push(intent);
    
    // Persist to TMG immediately
    this.persistToTMG();
    
    // Broadcast to all registered modules
    this.broadcastToModules();
    
    this.notifyListeners();
    
    console.log(`🧠 NIK: Set new intent "${analyzedIntent.refinedPrimary}" for ${domain} (coherence: ${analyzedIntent.coherenceScore?.toFixed(2)})`);
    return intent;
  }

  // Update existing intent (from external events or internal decisions)
  updateIntent(update: IntentUpdate): Intent | null {
    if (!this.currentIntent) return null;

    switch (update.type) {
      case 'modify':
        Object.assign(this.currentIntent, update.intent);
        this.currentIntent.timestamp = new Date();
        break;
      
      case 'complete':
      case 'abandon':
        console.log(`🧠 NIK: Intent ${update.type}d - ${update.reason}`);
        this.currentIntent = null;
        break;
      
      case 'new':
        if (update.intent.primary) {
          return this.setIntent(
            update.intent.primary,
            update.intent.context || {},
            update.intent.sessionId || this.currentIntent.sessionId,
            update.intent.domain || this.currentIntent.domain
          );
        }
        break;
    }

    this.notifyListeners();
    return this.currentIntent;
  }

  // Add sub-intent for decomposed goals
  addSubIntent(subIntent: string): void {
    if (!this.currentIntent) return;
    
    this.currentIntent.subIntents.push(subIntent);
    this.notifyListeners();
    console.log(`🧠 NIK: Added sub-intent "${subIntent}"`);
  }

  // Get current active intent
  getCurrentIntent(): Intent | null {
    return this.currentIntent;
  }

  // Check if intent matches current domain/session
  isIntentActive(sessionId?: string, domain?: string): boolean {
    if (!this.currentIntent) return false;
    
    if (sessionId && this.currentIntent.sessionId !== sessionId) return false;
    if (domain && this.currentIntent.domain !== domain) return false;
    
    return true;
  }

  // Enhanced intent analysis with semantic decomposition
  private analyzeIntent(primary: string, context: Record<string, any>, domain: string) {
    const lowerPrimary = primary.toLowerCase();
    
    // Semantic analysis and refinement
    let refinedPrimary = primary;
    let priority = 1.0;
    let constraints: string[] = [];
    let subIntents: string[] = [];
    let coherenceScore = 0.8; // Base coherence
    
    // Extract constraints from primary intent
    if (lowerPrimary.includes('urgent') || lowerPrimary.includes('asap')) {
      priority = 2.0;
      constraints.push('time_sensitive');
    }
    
    if (lowerPrimary.includes('carefully') || lowerPrimary.includes('precise')) {
      constraints.push('high_accuracy');
      coherenceScore += 0.1;
    }
    
    // Decompose complex intents
    const decomposition = this.decomposeIntent(primary, domain);
    if (decomposition.steps.length > 1) {
      subIntents = decomposition.steps.slice(1); // First step is the main intent
      coherenceScore += 0.1;
    }
    
    // Generate semantic vector (simplified representation)
    const semanticVector = this.generateSemanticVector(primary, context);
    
    // Extract additional context
    const extractedContext = this.extractContextualInfo(primary, context);
    
    return {
      refinedPrimary,
      priority,
      constraints,
      subIntents,
      decomposition,
      coherenceScore: Math.min(coherenceScore, 1.0),
      semanticVector,
      extractedContext
    };
  }

  // Decompose complex intents into steps
  private decomposeIntent(primary: string, domain: string) {
    const steps: string[] = [primary];
    const dependencies: string[] = [];
    let estimatedDuration = 300; // 5 minutes default
    
    const lowerPrimary = primary.toLowerCase();
    
    // Pattern-based decomposition
    if (lowerPrimary.includes('plan') && lowerPrimary.includes('project')) {
      steps.push('analyze requirements', 'create timeline', 'identify resources');
      dependencies.push('requirements_analysis', 'resource_availability');
      estimatedDuration = 1800; // 30 minutes
    } else if (lowerPrimary.includes('solve') && lowerPrimary.includes('problem')) {
      steps.push('understand problem', 'generate solutions', 'evaluate options');
      dependencies.push('problem_definition', 'context_analysis');
      estimatedDuration = 900; // 15 minutes
    } else if (lowerPrimary.includes('learn') || lowerPrimary.includes('understand')) {
      steps.push('gather information', 'process concepts', 'validate understanding');
      dependencies.push('information_sources', 'context_knowledge');
      estimatedDuration = 1200; // 20 minutes
    }
    
    return { steps, dependencies, estimatedDuration };
  }

  // Generate simplified semantic vector
  private generateSemanticVector(primary: string, context: Record<string, any>): number[] {
    // Simplified semantic encoding based on keywords and context
    const vector = new Array(16).fill(0);
    
    const keywords = primary.toLowerCase().split(' ');
    keywords.forEach((word, index) => {
      vector[index % 16] += word.length * 0.1;
    });
    
    // Factor in context
    if (context.agentMode === 'coach') vector[0] += 0.5;
    if (context.agentMode === 'guide') vector[1] += 0.5;
    
    return vector.map(v => Math.min(v, 1.0));
  }

  // Extract contextual information from intent
  private extractContextualInfo(primary: string, context: Record<string, any>): Record<string, any> {
    const extracted: Record<string, any> = {};
    
    const lowerPrimary = primary.toLowerCase();
    
    // Extract temporal information
    if (lowerPrimary.includes('today')) extracted.timeframe = 'today';
    if (lowerPrimary.includes('tomorrow')) extracted.timeframe = 'tomorrow';
    if (lowerPrimary.includes('week')) extracted.timeframe = 'week';
    
    // Extract emotional context
    if (lowerPrimary.includes('excited') || lowerPrimary.includes('eager')) {
      extracted.emotionalState = 'positive';
    }
    if (lowerPrimary.includes('worried') || lowerPrimary.includes('stressed')) {
      extracted.emotionalState = 'concerned';
    }
    
    // Extract domain-specific context
    if (lowerPrimary.includes('work') || lowerPrimary.includes('job')) {
      extracted.domain = 'professional';
    }
    if (lowerPrimary.includes('personal') || lowerPrimary.includes('life')) {
      extracted.domain = 'personal';
    }
    
    return extracted;
  }

  // Persist intent to TMG
  private async persistToTMG(): Promise<void> {
    if (!this.currentIntent || !this.tmgReference) return;
    
    try {
      const intentData = {
        id: this.currentIntent.id,
        content: this.currentIntent,
        isUserMessage: false,
        agentMode: this.currentIntent.domain,
        timestamp: this.currentIntent.timestamp.toISOString(),
        sessionContext: this.currentIntent.sessionId,
        intentType: 'active_intent'
      };
      
      await this.tmgReference.storeInHotMemory(
        'system', // Use system as user for intent storage
        this.currentIntent.sessionId,
        intentData,
        8.0 // High importance for active intents
      );
      
      console.log(`🧠 NIK: Intent persisted to TMG - "${this.currentIntent.primary}"`);
    } catch (error) {
      console.error('🧠 NIK: Failed to persist intent to TMG:', error);
    }
  }

  // Restore intent from TMG
  async restoreFromTMG(sessionId: string): Promise<Intent | null> {
    if (!this.tmgReference) return null;
    
    try {
      const memories = await this.tmgReference.getFromHotMemory('system', sessionId, 5);
      const intentMemory = memories.find((m: any) => 
        m.raw_content?.intentType === 'active_intent'
      );
      
      if (intentMemory?.raw_content?.content) {
        this.currentIntent = intentMemory.raw_content.content;
        this.broadcastToModules();
        this.notifyListeners();
        console.log(`🧠 NIK: Intent restored from TMG - "${this.currentIntent.primary}"`);
        return this.currentIntent;
      }
    } catch (error) {
      console.error('🧠 NIK: Failed to restore intent from TMG:', error);
    }
    
    return null;
  }

  // Share intent across modes for continuity
  shareIntentAcrossModes(targetModes: string[]): void {
    if (!this.currentIntent) return;
    
    targetModes.forEach(mode => {
      const crossModeIntent = {
        ...this.currentIntent,
        id: `${this.currentIntent.id}_${mode}`,
        domain: mode,
        context: {
          ...this.currentIntent.context,
          originalMode: this.currentIntent.domain,
          sharedAt: Date.now()
        }
      };
      
      // Broadcast to mode-specific listeners
      this.moduleListeners.forEach((listener, moduleId) => {
        if (moduleId.includes(mode)) {
          const broadcast: IntentBroadcast = {
            intent: crossModeIntent,
            moduleId,
            action: 'prioritize',
            metadata: {
              shared: true,
              originalDomain: this.currentIntent.domain,
              timestamp: Date.now()
            }
          };
          
          try {
            listener(broadcast);
          } catch (error) {
            console.error(`🧠 NIK: Failed to share intent to ${moduleId}:`, error);
          }
        }
      });
    });
    
    console.log(`🧠 NIK: Shared intent "${this.currentIntent.primary}" across ${targetModes.length} modes`);
  }

  // Broadcast intent to registered modules
  private broadcastToModules(): void {
    if (!this.currentIntent) return;
    
    this.moduleListeners.forEach((listener, moduleId) => {
      try {
        const broadcast: IntentBroadcast = {
          intent: this.currentIntent,
          moduleId,
          action: this.getBroadcastAction(moduleId),
          metadata: {
            coherenceScore: this.currentIntent.coherenceScore,
            priority: this.currentIntent.priority,
            timestamp: Date.now()
          }
        };
        
        listener(broadcast);
      } catch (error) {
        console.error(`🧠 NIK: Failed to broadcast to ${moduleId}:`, error);
      }
    });
    
    console.log(`🧠 NIK: Intent broadcast to ${this.moduleListeners.size} modules`);
  }

  // Determine appropriate action for each module
  private getBroadcastAction(moduleId: string): 'prioritize' | 'evaluate' | 'suggest' | 'monitor' {
    switch (moduleId) {
      case 'acs': return 'prioritize';
      case 'cnr': return 'evaluate';
      case 'pie': return 'suggest';
      case 'tmg': return 'monitor';
      default: return 'monitor';
    }
  }

  // Register module for intent broadcasts
  registerModule(moduleId: string, listener: (broadcast: IntentBroadcast) => void): void {
    this.moduleListeners.set(moduleId, listener);
    console.log(`🧠 NIK: Registered module "${moduleId}" for intent broadcasts`);
  }

  // Unregister module
  unregisterModule(moduleId: string): void {
    this.moduleListeners.delete(moduleId);
    console.log(`🧠 NIK: Unregistered module "${moduleId}"`);
  }

  // Internal intent generation based on patterns and observations
  generateInternalIntent(observations: Record<string, any>): Intent | null {
    if (!this.internalGenerationEnabled) return null;
    
    // Check if we should generate a new intent
    const timeSinceLastActivity = Date.now() - this.lastUserActivity.getTime();
    
    // Generate intent suggestions based on observations
    if (timeSinceLastActivity > 300000 && !this.currentIntent) { // 5 minutes of inactivity
      return this.suggestProactiveIntent(observations);
    }
    
    // Evolve current intent if it needs refinement
    if (this.currentIntent && this.shouldEvolveIntent(observations)) {
      return this.evolveCurrentIntent(observations);
    }
    
    return null;
  }

  // Suggest proactive intent during inactivity
  private suggestProactiveIntent(observations: Record<string, any>): Intent | null {
    const suggestions = [
      'check for pending tasks or reminders',
      'review recent progress and goals',
      'suggest productivity improvements',
      'offer mindfulness or reflection prompts'
    ];
    
    const selectedSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
    
    return {
      id: `internal_${Date.now()}`,
      primary: selectedSuggestion,
      subIntents: [],
      context: { ...observations, source: 'internal_generation' },
      priority: 0.5, // Lower priority for internal intents
      timestamp: new Date(),
      sessionId: observations.sessionId || 'default',
      domain: observations.domain || 'general',
      coherenceScore: 0.6
    };
  }

  // Check if current intent should evolve
  private shouldEvolveIntent(observations: Record<string, any>): boolean {
    if (!this.currentIntent) return false;
    
    // Evolve if intent is old and context has changed
    const intentAge = Date.now() - this.currentIntent.timestamp.getTime();
    return intentAge > 600000 && observations.contextChange; // 10 minutes + context change
  }

  // Evolve current intent based on new observations
  private evolveCurrentIntent(observations: Record<string, any>): Intent | null {
    if (!this.currentIntent) return null;
    
    const evolvedIntent = { ...this.currentIntent };
    evolvedIntent.id = `evolved_${Date.now()}`;
    evolvedIntent.primary = `${this.currentIntent.primary} (adapted)`;
    evolvedIntent.timestamp = new Date();
    evolvedIntent.context = { ...this.currentIntent.context, ...observations };
    
    return evolvedIntent;
  }

  // Update user activity timestamp
  updateUserActivity(): void {
    this.lastUserActivity = new Date();
  }

  // Persist intent across sessions/interruptions (legacy method - now uses TMG)
  persistIntent(): string | null {
    if (!this.currentIntent) return null;
    
    this.persistToTMG();
    const serialized = JSON.stringify(this.currentIntent);
    console.log(`🧠 NIK: Intent persisted for recovery`);
    return serialized;
  }

  // Restore intent from persistence (legacy method - now uses TMG)
  restoreIntent(serializedIntent: string): Intent | null {
    try {
      const intent = JSON.parse(serializedIntent) as Intent;
      this.currentIntent = intent;
      this.broadcastToModules();
      this.notifyListeners();
      console.log(`🧠 NIK: Intent restored - "${intent.primary}"`);
      return intent;
    } catch (error) {
      console.error('🧠 NIK: Failed to restore intent:', error);
      return null;
    }
  }

  // Subscribe to intent changes
  onIntentChange(listener: (intent: Intent | null) => void): () => void {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) this.listeners.splice(index, 1);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.currentIntent));
  }

  // Get intent state for other modules
  getIntentState() {
    return {
      hasActiveIntent: !!this.currentIntent,
      intent: this.currentIntent,
      intentCount: this.intentHistory.length,
      lastUpdate: this.currentIntent?.timestamp
    };
  }
}

export const neuroIntentKernel = new NeuroIntentKernel();