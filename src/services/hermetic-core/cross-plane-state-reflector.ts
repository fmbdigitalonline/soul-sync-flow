// Cross-Plane State Reflector (CPSR) - State Synchronization
// Implements Hermetic Principle of Correspondence ("As Above, So Below")

export interface PlaneState {
  external: Record<string, any>; // Environment, user inputs, sensor data
  internal: Record<string, any>; // AI cognitive state, goals, context
  meta: Record<string, any>;     // System metrics, performance data
}

export interface StateChange {
  plane: 'external' | 'internal' | 'meta';
  key: string;
  value: any;
  timestamp: Date;
  source: string;
}

export interface ReflectionInsight {
  cycle: number;
  timestamp: Date;
  insights: string[];
  patterns: string[];
  tensions: string[];
  recommendations: string[];
}

class CrossPlaneStateReflector {
  private state: PlaneState = {
    external: {},
    internal: {},
    meta: {}
  };
  
  private changeListeners: ((change: StateChange) => void)[] = [];
  private reflectionRules: Map<string, (change: StateChange) => StateChange[]> = new Map();
  
  // Logging optimization properties
  private cognitiveCache: number = 0;
  private lastLoggedCycle: number = 0;
  private reflectionInsights: ReflectionInsight[] = [];
  private maxCyclesPerInput: number = 50;
  private currentInputCycles: number = 0;
  private currentInput: string | null = null;

  constructor() {
    this.setupDefaultReflectionRules();
  }

  // Update external state (from environment, user, sensors)
  updateExternalState(key: string, value: any, source: string = 'external'): void {
    // Reset cycle count for new input
    if (key === 'user_input' && value !== this.currentInput) {
      this.currentInput = value;
      this.currentInputCycles = 0;
    }

    const change: StateChange = {
      plane: 'external',
      key,
      value,
      timestamp: new Date(),
      source
    };

    this.state.external[key] = value;
    this.processStateChange(change);
  }

  // Update internal state (from cognitive modules)
  updateInternalState(key: string, value: any, source: string = 'internal'): void {
    const change: StateChange = {
      plane: 'internal',
      key,
      value,
      timestamp: new Date(),
      source
    };

    this.state.internal[key] = value;
    this.processStateChange(change);
  }

  // Update meta state (system performance, module states)
  updateMetaState(key: string, value: any, source: string = 'meta'): void {
    const change: StateChange = {
      plane: 'meta',
      key,
      value,
      timestamp: new Date(),
      source
    };

    this.state.meta[key] = value;
    this.processStateChange(change);
  }

  // Get state from any plane
  getState(plane: keyof PlaneState, key?: string): any {
    if (key) {
      return this.state[plane][key];
    }
    return { ...this.state[plane] };
  }

  // Get unified state view
  getUnifiedState(): PlaneState {
    return {
      external: { ...this.state.external },
      internal: { ...this.state.internal },
      meta: { ...this.state.meta }
    };
  }

  // Process state change and trigger reflections
  private processStateChange(change: StateChange): void {
    // Increment cognitive cycle count
    this.cognitiveCache++;
    this.currentInputCycles++;
    
    // Update meta state with current cycle count
    this.state.meta.cognitive_cycle_count = this.cognitiveCache;

    // Check max cycle ceiling to prevent infinite recursion
    if (this.currentInputCycles > this.maxCyclesPerInput) {
      console.warn(`🔄 CPSR: Max cycles reached (${this.maxCyclesPerInput}) for current input. Preventing infinite recursion.`);
      return;
    }

    // Throttled logging - only log every 100th cycle or significant changes
    const shouldLogCycle = (this.cognitiveCache % 100 === 0) || this.isSignificantChange(change);
    
    if (shouldLogCycle) {
      console.log(`🔄 CPSR: Cycle ${this.cognitiveCache} - ${change.plane}.${change.key} = ${JSON.stringify(change.value).substring(0, 50)}`);
      this.lastLoggedCycle = this.cognitiveCache;
    }

    // Generate reflection insights every 10 cycles
    if (this.cognitiveCache % 10 === 0) {
      this.generateReflectionInsight();
    }
    
    // Notify listeners
    this.changeListeners.forEach(listener => listener(change));
    
    // Apply reflection rules
    const reflectionKey = `${change.plane}.${change.key}`;
    const rule = this.reflectionRules.get(reflectionKey);
    
    if (rule) {
      const reflectedChanges = rule(change);
      reflectedChanges.forEach(reflectedChange => {
        this.applyReflectedChange(reflectedChange);
      });
    }

    // Apply general correspondence rules
    this.applyCorrespondenceRules(change);
  }

  // Determine if a change is significant enough to log immediately
  private isSignificantChange(change: StateChange): boolean {
    const significantKeys = [
      'user_input', 'current_intent', 'system_mode', 'agent_mode',
      'domain_context', 'intervention_triggered', 'error_detected'
    ];
    
    return significantKeys.includes(change.key) || 
           change.source.includes('error') || 
           change.source.includes('intervention');
  }

  // Generate meaningful reflection insights
  private generateReflectionInsight(): void {
    const insights: string[] = [];
    const patterns: string[] = [];
    const tensions: string[] = [];
    const recommendations: string[] = [];

    // Analyze current state for insights
    const externalKeys = Object.keys(this.state.external);
    const internalKeys = Object.keys(this.state.internal);
    const metaKeys = Object.keys(this.state.meta);

    // Pattern detection
    if (externalKeys.includes('user_input') && internalKeys.includes('current_intent')) {
      patterns.push('User-Intent alignment active');
    }

    if (metaKeys.includes('system_load') && this.state.meta.system_load > 0.8) {
      tensions.push('High system load detected');
      recommendations.push('Consider load balancing');
    }

    // State coherence analysis
    const coherenceScore = this.calculateStateCoherence();
    if (coherenceScore < 0.7) {
      tensions.push(`Low state coherence: ${coherenceScore.toFixed(2)}`);
      recommendations.push('Review state synchronization');
    }

    // Memory efficiency insights
    const memorySize = this.state.meta.memory_size || 0;
    if (memorySize > 10) {
      insights.push(`Memory usage: ${memorySize} items`);
      recommendations.push('Consider memory cleanup');
    }

    // Active sessions monitoring
    const activeSessions = this.state.meta.active_sessions || 0;
    if (activeSessions > 1) {
      insights.push(`Multiple active sessions: ${activeSessions}`);
    }

    // Only log if we have meaningful insights
    if (insights.length > 0 || patterns.length > 0 || tensions.length > 0) {
      const reflection: ReflectionInsight = {
        cycle: this.cognitiveCache,
        timestamp: new Date(),
        insights,
        patterns,
        tensions,
        recommendations
      };

      this.reflectionInsights.push(reflection);
      
      // Keep only last 10 reflection insights
      if (this.reflectionInsights.length > 10) {
        this.reflectionInsights.shift();
      }

      console.log(`🪞 CPSR Reflection [Cycle ${this.cognitiveCache}]:`, {
        insights: insights.length > 0 ? insights : ['System operating normally'],
        patterns: patterns.length > 0 ? patterns : undefined,
        tensions: tensions.length > 0 ? tensions : undefined,
        recommendations: recommendations.length > 0 ? recommendations : undefined
      });
    }
  }

  // Calculate overall state coherence
  private calculateStateCoherence(): number {
    let coherenceScore = 1.0;
    
    // Check for state misalignments
    const externalMode = this.state.external.agent_mode;
    const internalMode = this.state.internal.active_mode;
    
    if (externalMode && internalMode && externalMode !== internalMode) {
      coherenceScore -= 0.2;
    }

    // Check for intent-context alignment
    const currentIntent = this.state.internal.current_intent;
    const domainContext = this.state.external.domain_context;
    
    if (currentIntent && domainContext && !currentIntent.includes(domainContext)) {
      coherenceScore -= 0.1;
    }

    // Check system health indicators
    const systemHealth = this.state.meta.overall_system_health;
    if (systemHealth && systemHealth < 0.8) {
      coherenceScore -= (1.0 - systemHealth) * 0.3;
    }

    return Math.max(0, coherenceScore);
  }

  // Apply reflected change without triggering infinite loops
  private applyReflectedChange(change: StateChange): void {
    this.state[change.plane][change.key] = change.value;
    
    // Only log significant reflected changes to avoid spam
    if (this.isSignificantChange(change)) {
      console.log(`🔄 CPSR: Reflected ${change.plane}.${change.key} from correspondence rule`);
    }
  }

  // Setup default reflection rules
  private setupDefaultReflectionRules(): void {
    // External user input -> Internal current_topic
    this.reflectionRules.set('external.user_input', (change) => [
      {
        plane: 'internal',
        key: 'current_context',
        value: { user_input: change.value, timestamp: change.timestamp },
        timestamp: change.timestamp,
        source: 'cpsr_reflection'
      }
    ]);

    // Internal intent_change -> External intent_signal
    this.reflectionRules.set('internal.current_intent', (change) => [
      {
        plane: 'external',
        key: 'intent_signal',
        value: change.value,
        timestamp: change.timestamp,
        source: 'cpsr_reflection'
      }
    ]);

    // External context_switch -> Internal mode_change
    this.reflectionRules.set('external.domain_context', (change) => [
      {
        plane: 'internal',
        key: 'active_domain',
        value: change.value,
        timestamp: change.timestamp,
        source: 'cpsr_reflection'
      }
    ]);
  }

  // Apply general correspondence rules (as above, so below)
  private applyCorrespondenceRules(change: StateChange): void {
    // Macro-level changes reflect to micro-level
    if (change.key === 'system_mode' && change.plane === 'external') {
      this.updateInternalState('processing_mode', change.value, 'cpsr_correspondence');
    }

    // Micro-level changes aggregate to macro-level
    if (change.key.startsWith('module_') && change.plane === 'meta') {
      this.updateMetaState('overall_system_health', this.calculateSystemHealth(), 'cpsr_correspondence');
    }
  }

  // Calculate system health from module states
  private calculateSystemHealth(): number {
    const moduleStates = Object.entries(this.state.meta)
      .filter(([key]) => key.startsWith('module_'))
      .map(([, value]) => value);
    
    if (moduleStates.length === 0) return 1.0;
    
    const avgHealth = moduleStates.reduce((sum, state) => sum + (state?.health || 1.0), 0) / moduleStates.length;
    return Math.max(0, Math.min(1, avgHealth));
  }

  // Subscribe to state changes
  onStateChange(listener: (intent: StateChange | null) => void): () => void {
    this.changeListeners.push(listener);
    return () => {
      const index = this.changeListeners.indexOf(listener);
      if (index > -1) this.changeListeners.splice(index, 1);
    };
  }

  // Add custom reflection rule
  addReflectionRule(key: string, rule: (change: StateChange) => StateChange[]): void {
    this.reflectionRules.set(key, rule);
    console.log(`🔄 CPSR: Added reflection rule for ${key}`);
  }

  // Force synchronization between planes
  synchronizePlanes(): void {
    console.log('🔄 CPSR: Forcing plane synchronization');
    
    // Ensure critical correspondences are aligned
    const criticalMappings = [
      { from: 'external.current_mode', to: 'internal.active_mode' },
      { from: 'internal.current_intent', to: 'external.intent_signal' },
      { from: 'meta.system_load', to: 'internal.processing_capacity' }
    ];

    criticalMappings.forEach(({ from, to }) => {
      const [fromPlane, fromKey] = from.split('.') as [keyof PlaneState, string];
      const [toPlane, toKey] = to.split('.') as [keyof PlaneState, string];
      
      const value = this.state[fromPlane][fromKey];
      if (value !== undefined) {
        this.state[toPlane][toKey] = value;
      }
    });
  }

  // Get recent reflection insights
  getReflectionInsights(count: number = 5): ReflectionInsight[] {
    return this.reflectionInsights.slice(-count);
  }

  // Get cognitive cycle statistics
  getCognitiveStats(): {
    totalCycles: number;
    currentInputCycles: number;
    lastLoggedCycle: number;
    averageInsightsPerCycle: number;
    stateCoherence: number;
  } {
    return {
      totalCycles: this.cognitiveCache,
      currentInputCycles: this.currentInputCycles,
      lastLoggedCycle: this.lastLoggedCycle,
      averageInsightsPerCycle: this.reflectionInsights.length / Math.max(1, this.cognitiveCache / 10),
      stateCoherence: this.calculateStateCoherence()
    };
  }

  // Reset cycle count for new session/input
  resetCycles(): void {
    this.currentInputCycles = 0;
    this.currentInput = null;
    console.log('🔄 CPSR: Cycle count reset for new session');
  }

  // Set maximum cycles per input (for debugging/testing)
  setMaxCyclesPerInput(max: number): void {
    this.maxCyclesPerInput = max;
    console.log(`🔄 CPSR: Max cycles per input set to ${max}`);
  }
}

export const crossPlaneStateReflector = new CrossPlaneStateReflector();
