/**
 * LoadingCoordinator - Central state machine for managing all loading operations
 * Implements coordinated timeouts and prevents race conditions
 */

export type LoadingState = 
  | 'idle'
  | 'oracle_starting' 
  | 'oracle_streaming'
  | 'fallback_processing'
  | 'error_recovering'
  | 'ready';

export type LoadingSource = 'oracle' | 'streaming' | 'core' | 'background' | 'shadow_detection';

interface LoadingOperation {
  source: LoadingSource;
  startTime: number;
  timeout?: NodeJS.Timeout;
  abortController?: AbortController;
}

interface LoadingCoordinatorOptions {
  globalMaxDuration: number; // Maximum total loading time
  sourceTimeouts: Record<LoadingSource, number>; // Individual source timeouts
}

export class LoadingCoordinator {
  private state: LoadingState = 'idle';
  private operations = new Map<LoadingSource, LoadingOperation>();
  private globalTimeout: NodeJS.Timeout | null = null;
  private options: LoadingCoordinatorOptions;
  private listeners = new Set<(state: LoadingState) => void>();

  constructor(options: LoadingCoordinatorOptions) {
    this.options = options;
  }

  // Register a loading operation
  startOperation(source: LoadingSource): AbortController {
    console.log(`🔄 LoadingCoordinator: Starting ${source} operation`);
    
    // Clear any existing operation for this source
    this.clearOperation(source);
    
    const abortController = new AbortController();
    const startTime = Date.now();
    
    // Set individual source timeout
    const timeout = setTimeout(() => {
      console.warn(`⚠️ LoadingCoordinator: ${source} timeout after ${this.options.sourceTimeouts[source]}ms`);
      this.handleTimeout(source);
    }, this.options.sourceTimeouts[source]);
    
    this.operations.set(source, {
      source,
      startTime,
      timeout,
      abortController
    });
    
    // Start global timeout if this is the first operation
    if (this.operations.size === 1) {
      this.startGlobalTimeout();
    }
    
    this.updateState();
    console.log('📊 LoadingCoordinator: Active operations after start', this.getActiveOperations());
    return abortController;
  }

  // Complete a loading operation
  completeOperation(source: LoadingSource): void {
    console.log(`✅ LoadingCoordinator: Completing ${source} operation`);
    this.clearOperation(source);
    this.updateState();
    console.log('📊 LoadingCoordinator: Active operations after complete', this.getActiveOperations());
  }

  // Handle timeout for a specific source
  private handleTimeout(source: LoadingSource): void {
    console.warn(`🚨 LoadingCoordinator: ${source} timed out, clearing ALL operations`);
    
    // When any source times out, clear ALL operations to prevent race conditions
    this.clearAllOperations();
    this.setState('error_recovering');
    
    // Brief recovery period before returning to ready
    setTimeout(() => {
      this.setState('ready');
    }, 1000);
  }

  // Start global timeout that overrides all individual timeouts
  private startGlobalTimeout(): void {
    this.globalTimeout = setTimeout(() => {
      console.warn(`🚨 LoadingCoordinator: Global timeout after ${this.options.globalMaxDuration}ms, forcing recovery`);
      this.forceRecovery();
    }, this.options.globalMaxDuration);
  }

  // Force immediate recovery from any stuck state
  forceRecovery(): void {
    console.log('🔧 LoadingCoordinator: Forcing immediate recovery');
    this.clearAllOperations();
    this.setState('ready');
  }

  // Clear a specific operation
  private clearOperation(source: LoadingSource): void {
    const operation = this.operations.get(source);
    if (operation) {
      if (operation.timeout) {
        clearTimeout(operation.timeout);
      }
      if (operation.abortController) {
        operation.abortController.abort();
      }
      this.operations.delete(source);
    }
    
    // Clear global timeout if no operations remain
    if (this.operations.size === 0 && this.globalTimeout) {
      clearTimeout(this.globalTimeout);
      this.globalTimeout = null;
    }
  }

  // Clear all operations
  private clearAllOperations(): void {
    for (const source of this.operations.keys()) {
      this.clearOperation(source);
    }
  }

  // Update state based on current operations
  private updateState(): void {
    if (this.operations.size === 0) {
      this.setState('ready');
      return;
    }

    // Determine state based on active operations
    if (this.operations.has('oracle')) {
      if (this.operations.has('streaming')) {
        this.setState('oracle_streaming');
      } else {
        this.setState('oracle_starting');
      }
    } else if (this.operations.has('streaming')) {
      this.setState('oracle_streaming');
    } else if (this.operations.has('core') || this.operations.has('background')) {
      this.setState('fallback_processing');
    }
  }

  // Set state and notify listeners
  private setState(newState: LoadingState): void {
    if (this.state !== newState) {
      console.log(`🔄 LoadingCoordinator: State transition ${this.state} → ${newState}`);
      this.state = newState;
      this.notifyListeners();
    }
  }

  // Public getters
  getState(): LoadingState {
    return this.state;
  }

  getEffectiveLoadingState(): boolean {
    return this.state !== 'idle' && this.state !== 'ready';
  }

  getActiveOperations(): LoadingSource[] {
    return Array.from(this.operations.keys());
  }

  // Listener management
  addListener(listener: (state: LoadingState) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Cleanup
  destroy(): void {
    this.clearAllOperations();
    this.listeners.clear();
  }
}

// Create singleton instance with default configuration
// HMR-safe singleton factory
let __loadingCoordinatorSingleton: LoadingCoordinator | null = (globalThis as any).__loadingCoordinatorSingleton ?? null;

export const createLoadingCoordinator = (overrides?: Partial<LoadingCoordinatorOptions>): LoadingCoordinator => {
  const defaultOptions: LoadingCoordinatorOptions = {
    globalMaxDuration: 45000, // 45 seconds global max
    sourceTimeouts: {
      oracle: 30000,           // 30 seconds for Oracle
      streaming: 30000,        // 30 seconds for streaming
      core: 15000,             // 15 seconds for core operations
      background: 60000,       // 60 seconds for background operations
      shadow_detection: 100    // 100ms for shadow detection (performance critical)
    }
  };

  if (__loadingCoordinatorSingleton) {
    return __loadingCoordinatorSingleton;
  }
  __loadingCoordinatorSingleton = new LoadingCoordinator({ ...defaultOptions, ...overrides });
  (globalThis as any).__loadingCoordinatorSingleton = __loadingCoordinatorSingleton;
  return __loadingCoordinatorSingleton;
};