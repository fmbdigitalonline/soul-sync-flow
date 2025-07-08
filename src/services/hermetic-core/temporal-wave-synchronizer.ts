// Temporal Wave Synchronizer (TWS) - Cognitive Rhythm Management
// Implements Hermetic Principle of Rhythm ("Everything flows, out and in")

export interface CognitivePhase {
  name: string;
  duration: number; // milliseconds
  frequency: number; // Hz
  priority: number;
}

export interface CognitiveCycle {
  id: string;
  phases: CognitivePhase[];
  currentPhase: number;
  startTime: Date;
  cycleCount: number;
}

export type CycleEventType = 'phase_start' | 'phase_end' | 'cycle_complete' | 'rhythm_sync';

export interface CycleEvent {
  type: CycleEventType;
  phase?: CognitivePhase;
  cycleId: string;
  timestamp: Date;
  data?: any;
}

class TemporalWaveSynchronizer {
  private baseCycle: CognitiveCycle;
  private isRunning: boolean = false;
  private intervalId: NodeJS.Timeout | null = null;
  private eventListeners: Map<CycleEventType, ((event: CycleEvent) => void)[]> = new Map();
  private moduleTimers: Map<string, { frequency: number; lastTick: number; callback: () => void }> = new Map();

  constructor() {
    this.baseCycle = this.createDefaultCycle();
    this.initializeEventListeners();
  }

  // Create default cognitive cycle with key phases
  private createDefaultCycle(): CognitiveCycle {
    return {
      id: `cycle_${Date.now()}`,
      phases: [
        { name: 'perception', duration: 100, frequency: 10, priority: 1.0 },
        { name: 'analysis', duration: 200, frequency: 5, priority: 0.9 },
        { name: 'decision', duration: 150, frequency: 6.67, priority: 0.95 },
        { name: 'action', duration: 100, frequency: 10, priority: 1.0 },
        { name: 'reflection', duration: 50, frequency: 20, priority: 0.7 }
      ],
      currentPhase: 0,
      startTime: new Date(),
      cycleCount: 0
    };
  }

  // Start the temporal synchronization
  start(): void {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.baseCycle.startTime = new Date();
    this.baseCycle.cycleCount = 0;
    
    console.log('⏰ TWS: Starting cognitive rhythm cycles');
    this.runCognitiveCycle();
  }

  // Stop the temporal synchronization
  stop(): void {
    if (!this.isRunning) return;
    
    this.isRunning = false;
    if (this.intervalId) {
      clearTimeout(this.intervalId);
      this.intervalId = null;
    }
    
    console.log('⏰ TWS: Stopped cognitive rhythm cycles');
  }

  // Run a complete cognitive cycle
  private runCognitiveCycle(): void {
    if (!this.isRunning) return;

    const currentPhase = this.baseCycle.phases[this.baseCycle.currentPhase];
    
    // Emit phase start event
    this.emitEvent({
      type: 'phase_start',
      phase: currentPhase,
      cycleId: this.baseCycle.id,
      timestamp: new Date()
    });

    // Schedule phase end
    this.intervalId = setTimeout(() => {
      this.emitEvent({
        type: 'phase_end',
        phase: currentPhase,
        cycleId: this.baseCycle.id,
        timestamp: new Date()
      });

      // Move to next phase
      this.baseCycle.currentPhase++;
      
      if (this.baseCycle.currentPhase >= this.baseCycle.phases.length) {
        // Cycle complete
        this.baseCycle.currentPhase = 0;
        this.baseCycle.cycleCount++;
        
        this.emitEvent({
          type: 'cycle_complete',
          cycleId: this.baseCycle.id,
          timestamp: new Date(),
          data: { cycleCount: this.baseCycle.cycleCount }
        });

        // Periodic maintenance cycles
        if (this.baseCycle.cycleCount % 10 === 0) {
          this.runMaintenanceCycle();
        }
      }

      // Continue to next phase
      this.runCognitiveCycle();
    }, currentPhase.duration);

    // Trigger module timers for this phase
    this.triggerModuleTimers();
  }

  // Register module for periodic execution
  registerModule(moduleId: string, frequency: number, callback: () => void): void {
    this.moduleTimers.set(moduleId, {
      frequency,
      lastTick: Date.now(),
      callback
    });
    
    console.log(`⏰ TWS: Registered ${moduleId} at ${frequency}Hz`);
  }

  // Unregister module
  unregisterModule(moduleId: string): void {
    this.moduleTimers.delete(moduleId);
    console.log(`⏰ TWS: Unregistered ${moduleId}`);
  }

  // Trigger module timers based on their frequencies
  private triggerModuleTimers(): void {
    const now = Date.now();
    
    this.moduleTimers.forEach((timer, moduleId) => {
      const interval = 1000 / timer.frequency; // Convert Hz to ms
      
      if (now - timer.lastTick >= interval) {
        try {
          timer.callback();
          timer.lastTick = now;
        } catch (error) {
          console.error(`⏰ TWS: Error in ${moduleId} timer:`, error);
        }
      }
    });
  }

  // Run special maintenance cycle
  private runMaintenanceCycle(): void {
    console.log('⏰ TWS: Running maintenance cycle');
    
    this.emitEvent({
      type: 'rhythm_sync',
      cycleId: this.baseCycle.id,
      timestamp: new Date(),
      data: { type: 'maintenance', cycleCount: this.baseCycle.cycleCount }
    });
  }

  // Get current phase information
  getCurrentPhase(): CognitivePhase {
    return this.baseCycle.phases[this.baseCycle.currentPhase];
  }

  // Get cycle timing information
  getCycleInfo() {
    return {
      currentPhase: this.getCurrentPhase(),
      cycleCount: this.baseCycle.cycleCount,
      isRunning: this.isRunning,
      totalDuration: this.baseCycle.phases.reduce((sum, phase) => sum + phase.duration, 0),
      uptime: this.isRunning ? Date.now() - this.baseCycle.startTime.getTime() : 0
    };
  }

  // Adjust phase timing dynamically
  adjustPhaseTiming(phaseName: string, newDuration: number): void {
    const phase = this.baseCycle.phases.find(p => p.name === phaseName);
    if (phase) {
      phase.duration = newDuration;
      phase.frequency = 1000 / newDuration;
      console.log(`⏰ TWS: Adjusted ${phaseName} phase to ${newDuration}ms`);
    }
  }

  // Synchronize with external timing
  syncToExternalClock(externalTimestamp: number): void {
    const drift = Date.now() - externalTimestamp;
    if (Math.abs(drift) > 100) { // 100ms tolerance
      console.log(`⏰ TWS: Syncing to external clock, drift: ${drift}ms`);
      // Adjust timing gradually to prevent shock
      this.baseCycle.phases.forEach(phase => {
        phase.duration += Math.sign(drift) * Math.min(Math.abs(drift) * 0.1, 10);
      });
    }
  }

  // Event system
  private initializeEventListeners(): void {
    this.eventListeners.set('phase_start', []);
    this.eventListeners.set('phase_end', []);
    this.eventListeners.set('cycle_complete', []);
    this.eventListeners.set('rhythm_sync', []);
  }

  onEvent(eventType: CycleEventType, listener: (event: CycleEvent) => void): () => void {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.push(listener);
    this.eventListeners.set(eventType, listeners);

    return () => {
      const updatedListeners = this.eventListeners.get(eventType) || [];
      const index = updatedListeners.indexOf(listener);
      if (index > -1) updatedListeners.splice(index, 1);
      this.eventListeners.set(eventType, updatedListeners);
    };
  }

  private emitEvent(event: CycleEvent): void {
    const listeners = this.eventListeners.get(event.type) || [];
    listeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error(`⏰ TWS: Error in event listener for ${event.type}:`, error);
      }
    });
  }

  // Enforce rhythm pattern (alternating behavior)
  enforceRhythmPattern(pattern: 'focus-rest' | 'scan-focus' | 'learn-act'): void {
    switch (pattern) {
      case 'focus-rest':
        // Alternate between intense processing and lighter phases
        this.baseCycle.phases.forEach((phase, index) => {
          phase.priority = index % 2 === 0 ? 1.0 : 0.6;
        });
        break;
        
      case 'scan-focus':
        // Broad scanning followed by focused analysis
        this.adjustPhaseTiming('perception', 150);
        this.adjustPhaseTiming('analysis', 300);
        break;
        
      case 'learn-act':
        // Learning phases followed by action phases
        this.adjustPhaseTiming('reflection', 100);
        this.adjustPhaseTiming('action', 80);
        break;
    }
    
    console.log(`⏰ TWS: Applied rhythm pattern: ${pattern}`);
  }
}

export const temporalWaveSynchronizer = new TemporalWaveSynchronizer();