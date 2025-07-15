
import type { VPGBlueprint } from "../unified-brain-context";

export interface PlaneState {
  external: Record<string, any>;
  internal: Record<string, any>;
  meta: Record<string, any>;
}

export interface StateChange {
  plane: 'external' | 'internal' | 'meta';
  key: string;
  value: any;
  source: string;
  timestamp: number;
}

type StateChangeListener = (change: StateChange) => void;

class CrossPlaneStateReflector {
  private externalState: Record<string, any> = {};
  private internalState: Record<string, any> = {};
  private metaState: Record<string, any> = {};
  private stateChangeListeners: StateChangeListener[] = [];
  private vgpBlueprint: VPGBlueprint | null = null;

  constructor() {
    console.log("🔄 Cross-Plane State Reflector: Initialized");
  }

  setBlueprintContext(blueprint: VPGBlueprint) {
    this.vgpBlueprint = blueprint;
    console.log("🧠 CPSR: VPG Blueprint context injected");
    
    // Apply blueprint-based internal constants
    this.updateInternalConstants();
  }

  private updateInternalConstants() {
    if (!this.vgpBlueprint) return;

    // Set internal constants based on blueprint personality traits
    const traits = this.vgpBlueprint.personality?.traits;
    if (traits) {
      this.internalState.personality_type = traits.cognitiveStyle || 'balanced';
      this.internalState.energy_strategy = traits.energyStrategy || 'sustainable';
      this.internalState.communication_preference = traits.communicationStyle || 'adaptive';
    }

    console.log("🔄 CPSR: Internal constants updated from blueprint");
  }

  updateExternalState(key: string, value: any, source: string = 'system') {
    this.externalState[key] = value;
    this.notifyStateChange('external', key, value, source);
    this.applyCorrespondenceRules(key, value);
  }

  updateInternalState(key: string, value: any, source: string = 'system') {
    this.internalState[key] = value;
    this.notifyStateChange('internal', key, value, source);
  }

  updateMetaState(key: string, value: any, source: string = 'system') {
    this.metaState[key] = value;
    this.notifyStateChange('meta', key, value, source);
  }

  private applyCorrespondenceRules(externalKey: string, externalValue: any) {
    // Hermetic principle: As above, so below
    const correspondenceMap: Record<string, string> = {
      'user_input': 'current_context',
      'system_mode': 'processing_mode',
      'session_id': 'active_session',
      'domain_context': 'active_domain'
    };

    const internalKey = correspondenceMap[externalKey];
    if (internalKey) {
      this.updateInternalState(internalKey, externalValue, 'correspondence_rule');
    }
  }

  getUnifiedState(): PlaneState {
    return {
      external: { ...this.externalState },
      internal: { ...this.internalState },
      meta: { ...this.metaState }
    };
  }

  reflectCurrentState(): PlaneState {
    return this.getUnifiedState();
  }

  synchronizePlanes() {
    // Force synchronization between planes
    Object.entries(this.externalState).forEach(([key, value]) => {
      this.applyCorrespondenceRules(key, value);
    });
    console.log("🔄 CPSR: Plane synchronization completed");
  }

  onStateChange(listener: StateChangeListener): () => void {
    this.stateChangeListeners.push(listener);
    return () => {
      const index = this.stateChangeListeners.indexOf(listener);
      if (index > -1) {
        this.stateChangeListeners.splice(index, 1);
      }
    };
  }

  private notifyStateChange(plane: 'external' | 'internal' | 'meta', key: string, value: any, source: string) {
    const change: StateChange = {
      plane,
      key,
      value,
      source,
      timestamp: Date.now()
    };

    this.stateChangeListeners.forEach(listener => {
      try {
        listener(change);
      } catch (error) {
        console.error("Error in state change listener:", error);
      }
    });
  }
}

export const crossPlaneStateReflector = new CrossPlaneStateReflector();
