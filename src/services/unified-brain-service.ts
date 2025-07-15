
import { createClient } from '@supabase/supabase-js';
import { blueprintService } from './blueprint-service';
import { adaptiveContextScheduler } from './adaptive-context-scheduler';
import { PIEService } from './pie-service';
import { temporalWaveSynchronizer } from './hermetic-core/temporal-wave-synchronizer';
import { crossPlaneStateReflector } from './hermetic-core/cross-plane-state-reflector';

// Create placeholder services for missing modules
class VFPService {
  applyBlueprint(blueprint: any) {
    console.log('🧬 VFP: Applied blueprint');
  }
  
  getPersonality() {
    return { name: 'Default Personality' };
  }
}

class TMGService {
  // Placeholder for Tiered Memory Graph service
}

class NIKService {
  analyzeIntent(message: string) {
    return 'general_inquiry';
  }
}

interface LayeredBlueprint {
  id: string;
  [key: string]: any;
}

class UnifiedBrainService {
  private supabase = createClient(
    'https://qxaajirrqrcnmvtowjbg.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4YWFqaXJycXJjbm12dG93amJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDM5NzQ1NDcsImV4cCI6MjA1OTU1MDU0N30.HZRTlihPe3PNQVWxNHCrwjoa9R6Wvo8WOKlQVGunYIw'
  );

  private blueprintService = blueprintService;
  private contextScheduler = adaptiveContextScheduler;
  private pieService = new PIEService();
  private vfpService = new VFPService();
  private memoryService = new TMGService();
  private nikService = new NIKService();
  private isInitialized = false;
  private userId: string | null = null;
  private currentBlueprint: Partial<LayeredBlueprint> = {};
  private sessionMemory = new Map<string, any>();
  private memoryReflectionLock = false;
  private lastMemoryReflectionTime = 0;
  private memoryReflectionDebounceMs = 1000;
  private cognitiveSyncLock = false;
  private lastCognitiveSyncTime = 0;
  private cognitiveSyncDebounceMs = 500;

  async initialize(userId: string): Promise<void> {
    if (this.isInitialized) return;

    this.userId = userId;
    await this.loadActiveBlueprint(userId);
    this.startCognitiveCycles();
    this.isInitialized = true;
    console.log('🧠 Unified Brain Service initialized');
  }

  private async loadActiveBlueprint(userId: string): Promise<void> {
    try {
      const { data: blueprint, error } = await this.supabase
        .from('user_blueprints')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .single();

      if (error) {
        console.error('Error loading active blueprint:', error);
        return;
      }

      if (blueprint) {
        this.currentBlueprint = blueprint;
        this.vfpService.applyBlueprint(blueprint);
        console.log(`🧬 Applied blueprint: ${blueprint.id}`);
      } else {
        console.warn('No active blueprint found for user.');
      }
    } catch (error) {
      console.error('Unexpected error loading blueprint:', error);
    }
  }

  startCognitiveCycles(): void {
    temporalWaveSynchronizer.start();

    // Register TMG module for periodic memory reflection
    temporalWaveSynchronizer.registerModule('memory_reflection', 0.0167, () => {
      this.performMemoryReflection();
    });

    // Register CPSR module for periodic cognitive synchronization
    temporalWaveSynchronizer.registerModule('cognitive_sync', 0.0333, () => {
      this.performCognitiveSync();
    });

    // Subscribe to TWS cycle events for logging and diagnostics
    temporalWaveSynchronizer.onEvent('cycle_complete', (event) => {
      console.log(`⏰ TWS Cycle ${event.data?.cycleCount} completed`);
    });

    temporalWaveSynchronizer.onEvent('phase_start', (event) => {
      console.log(`⏰ Phase ${event.phase?.name} started`);
    });

    console.log('⏰ Cognitive cycles started');
  }

  stopCognitiveCycles(): void {
    temporalWaveSynchronizer.stop();
    console.log('Cognitive cycles stopped');
  }

  async processMessage(message: string, agentMode: string): Promise<any> {
    if (!this.isInitialized || !this.userId) {
      throw new Error('Unified Brain Service not initialized');
    }

    // 1. NIK - Neuro-Intent Kernel
    const intent = this.nikService.analyzeIntent(message);
    console.log(`🧠 Intent: ${intent}`);

    // 2. TMG - Tiered Memory Graph
    const memoryKey = `message_${Date.now()}`;
    this.sessionMemory.set(memoryKey, { message, intent, timestamp: Date.now() });
    console.log(`🧠 Stored message in session memory: ${memoryKey}`);

    // 3. CPSR - Cross-Plane State Reflector
    crossPlaneStateReflector.updateExternalState('user_input', message, 'user');
    crossPlaneStateReflector.updateInternalState('current_intent', intent, 'nik');

    // 4. ACS - Adaptive Context Scheduler
    const context = await this.contextScheduler.getContext(this.userId, agentMode);
    console.log(`📅 Context: ${context}`);

    // 5. VFP - Vector-Fusion Personality Graph
    const personality = this.vfpService.getPersonality();
    console.log(`🧬 Personality: ${personality?.name}`);

    // 6. PIE - Proactive Insight Engine
    const insights = await this.pieService.getCurrentInsights();
    console.log(`💡 Insights: ${insights.length} generated`);

    return {
      intent,
      memoryKey,
      context,
      personality,
      insights,
      response: "Processed through unified brain architecture"
    };
  }

  async processConversation(messages: { role: string; content: string }[]): Promise<any> {
    // Process an entire conversation and extract key insights
    console.log(`Processing conversation with ${messages.length} messages`);
    return { conversationLength: messages.length };
  }

  // ADD MISSING METHODS

  getBrainHealth(): any {
    return {
      initialized: this.isInitialized,
      userId: this.userId,
      memorySystemActive: true,
      personalityEngineActive: true,
      acsSystemActive: true,
      sessionMemorySize: this.sessionMemory.size,
      cognitiveCyclesActive: temporalWaveSynchronizer.isRunning(),
      lastMemoryReflection: this.lastMemoryReflectionTime,
      lastCognitiveSync: this.lastCognitiveSyncTime
    };
  }

  async switchAgentMode(fromMode: string, toMode: string, sessionId: string): Promise<void> {
    console.log(`🔄 Switching agent mode: ${fromMode} → ${toMode} (session: ${sessionId})`);
    
    // Update CPSR with mode change
    crossPlaneStateReflector.updateExternalState('agent_mode', toMode, 'mode_switch');
    
    // Store mode transition in session memory
    this.sessionMemory.set(`mode_switch_${Date.now()}`, {
      fromMode,
      toMode,
      sessionId,
      timestamp: Date.now()
    });
  }

  getCPSRState(): any {
    return crossPlaneStateReflector.getCognitiveStats();
  }

  getNIKStatus(): any {
    return {
      active: true,
      lastIntent: 'general_inquiry',
      processedMessages: this.sessionMemory.size
    };
  }

  getTWSInfo(): any {
    return {
      isRunning: temporalWaveSynchronizer.isRunning(),
      registeredModules: temporalWaveSynchronizer.getRegisteredModules ? 
        temporalWaveSynchronizer.getRegisteredModules() : [],
      cycleCount: temporalWaveSynchronizer.getCycleCount ? 
        temporalWaveSynchronizer.getCycleCount() : 0
    };
  }

  async processMessageForModeHook(message: string, mode: string): Promise<any> {
    return this.processMessage(message, mode);
  }

  // Cognitive synchronization triggered during TWS cycles
  private performCognitiveSync(): void {
    // Circuit breaker: Prevent concurrent cognitive sync operations
    if (this.cognitiveSyncLock) {
      console.log('🔄 Cognitive sync already in progress, skipping');
      return;
    }
    
    // Debouncing: Don't sync too frequently
    const now = Date.now();
    if (now - this.lastCognitiveSyncTime < this.cognitiveSyncDebounceMs) {
      console.log('🔄 Cognitive sync debounced, skipping');
      return;
    }
    
    this.cognitiveSyncLock = true;
    this.lastCognitiveSyncTime = now;
    
    try {
      const sessionMetrics = {
        session_count: this.sessionMemory.size,
        active_cycles: crossPlaneStateReflector.getCognitiveStats().totalCycles,
        last_sync: new Date().toISOString()
      };

      // Update cognitive sync metrics - use TWS source to bypass recursive processing
      crossPlaneStateReflector.updateMetaState('cognitive_sync_metrics', sessionMetrics, 'tws_cognitive_sync');
      crossPlaneStateReflector.updateMetaState('system_health_monitor', { status: 'active', timestamp: Date.now() }, 'tws_monitor');
      
    } catch (error) {
      console.error('⏰ TWS: Error in cognitive sync:', error);
    } finally {
      this.cognitiveSyncLock = false;
    }
  }

  // Memory reflection triggered during TWS reflection phase
  private performMemoryReflection(): void {
    // Circuit breaker: Prevent concurrent memory reflections
    if (this.memoryReflectionLock) {
      console.log('🔄 Memory reflection already in progress, skipping');
      return;
    }
    
    // Debouncing: Don't reflect too frequently
    const now = Date.now();
    if (now - this.lastMemoryReflectionTime < this.memoryReflectionDebounceMs) {
      console.log('🔄 Memory reflection debounced, skipping');
      return;
    }
    
    this.memoryReflectionLock = true;
    this.lastMemoryReflectionTime = now;
    
    try {
      // Clean up old session memory entries (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      let cleanupCount = 0;
      
      for (const [key, entry] of this.sessionMemory.entries()) {
        if (entry.timestamp && entry.timestamp < oneHourAgo) {
          this.sessionMemory.delete(key);
          cleanupCount++;
        }
      }
      
      if (cleanupCount > 0) {
        console.log(`⏰ TWS: Cleaned up ${cleanupCount} old session memory entries`);
      }
      
      // Update reflection metrics - use source to bypass recursive processing
      crossPlaneStateReflector.updateMetaState('memory_cleanup_count', cleanupCount, 'memory_reflector');
      crossPlaneStateReflector.updateMetaState('memory_size', this.sessionMemory.size, 'memory_reflector');
      
    } catch (error) {
      console.error('⏰ TWS: Error in memory reflection:', error);
    } finally {
      this.memoryReflectionLock = false;
    }
  }

  getSessionMemorySize(): number {
    return this.sessionMemory.size;
  }

  clearSessionMemory(): void {
    this.sessionMemory.clear();
    console.log('Session memory cleared');
  }

  forceSynchronizePlanes(): void {
    crossPlaneStateReflector.synchronizePlanes();
    console.log('🔄 Forced plane synchronization');
  }
}

export const unifiedBrainService = new UnifiedBrainService();
