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

class CrossPlaneStateReflector {
  private state: PlaneState = {
    external: {},
    internal: {},
    meta: {}
  };
  
  private changeListeners: ((change: StateChange) => void)[] = [];
  private reflectionRules: Map<string, (change: StateChange) => StateChange[]> = new Map();

  constructor() {
    this.setupDefaultReflectionRules();
  }

  // Update external state (from environment, user, sensors)
  updateExternalState(key: string, value: any, source: string = 'external'): void {
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
    console.log(`🔄 CPSR: ${change.plane}.${change.key} = ${JSON.stringify(change.value).substring(0, 100)}`);
    
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

  // Apply reflected change without triggering infinite loops
  private applyReflectedChange(change: StateChange): void {
    this.state[change.plane][change.key] = change.value;
    console.log(`🔄 CPSR: Reflected ${change.plane}.${change.key} from correspondence rule`);
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
  onStateChange(listener: (change: StateChange) => void): () => void {
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
}

export const crossPlaneStateReflector = new CrossPlaneStateReflector();