/**
 * Orb Presence Controller - State machine for managing orb location and mode
 * Implements the Singularity Principle: orb exists in only one place at a time
 */

export type OrbPresenceMode = 
  | 'floating'       // Default: corner position
  | 'chat_avatar'    // Inside chat as responder avatar
  | 'center_loading'; // Center of screen with loading bubble

export type LoadingOperation = 
  | 'chat_thinking'
  | 'dream_decomposition'
  | 'task_generation'
  | 'hermetic_generation'
  | 'log_processing'
  | 'general';

export interface OrbPresenceState {
  mode: OrbPresenceMode;
  loadingMessage?: string;
  loadingProgress?: number;
  activeOperation?: LoadingOperation;
  isThinking: boolean;
}

type OrbPresenceListener = (state: OrbPresenceState) => void;

// Default loading messages per operation
const LOADING_MESSAGES: Record<LoadingOperation, string> = {
  chat_thinking: 'Channeling wisdom...',
  dream_decomposition: 'Decomposing your dream...',
  task_generation: 'Generating tasks...',
  hermetic_generation: 'Deep synthesis in progress...',
  log_processing: 'Processing activity logs...',
  general: 'Thinking...'
};

class OrbPresenceController {
  private state: OrbPresenceState = {
    mode: 'floating',
    isThinking: false
  };
  
  private listeners = new Set<OrbPresenceListener>();
  private chatOpen = false;
  private activeLoadingOperations = new Map<LoadingOperation, { progress?: number }>();

  constructor() {
    console.log('🔮 OrbPresenceController: Initialized');
  }

  // Set chat open/closed state
  setChatOpen(isOpen: boolean): void {
    console.log(`🔮 OrbPresenceController: Chat ${isOpen ? 'opened' : 'closed'}`);
    this.chatOpen = isOpen;
    this.updateMode();
  }

  // Start a loading operation
  startLoading(operation: LoadingOperation, progress?: number): void {
    console.log(`🔮 OrbPresenceController: Starting ${operation} loading`);
    this.activeLoadingOperations.set(operation, { progress });
    this.updateMode();
  }

  // Update loading progress
  updateLoadingProgress(operation: LoadingOperation, progress: number): void {
    const existing = this.activeLoadingOperations.get(operation);
    if (existing) {
      existing.progress = progress;
      this.updateMode();
    }
  }

  // Complete a loading operation
  completeLoading(operation: LoadingOperation): void {
    console.log(`🔮 OrbPresenceController: Completing ${operation} loading`);
    this.activeLoadingOperations.delete(operation);
    this.updateMode();
  }

  // Get priority operation (for display purposes)
  private getPriorityOperation(): LoadingOperation | undefined {
    // Priority order: chat > hermetic > dream > task > log > general
    const priority: LoadingOperation[] = [
      'chat_thinking',
      'hermetic_generation',
      'dream_decomposition',
      'task_generation',
      'log_processing',
      'general'
    ];
    
    for (const op of priority) {
      if (this.activeLoadingOperations.has(op)) {
        return op;
      }
    }
    return undefined;
  }

  // Determine mode based on current state
  private updateMode(): void {
    const priorityOp = this.getPriorityOperation();
    const hasNonChatLoading = Array.from(this.activeLoadingOperations.keys())
      .some(op => op !== 'chat_thinking');
    
    let newMode: OrbPresenceMode;
    let loadingMessage: string | undefined;
    let loadingProgress: number | undefined;
    
    if (this.chatOpen && this.activeLoadingOperations.has('chat_thinking')) {
      // Singularity: orb morphs into chat avatar when chat is open and thinking
      newMode = 'chat_avatar';
      loadingMessage = LOADING_MESSAGES.chat_thinking;
    } else if (hasNonChatLoading && priorityOp && priorityOp !== 'chat_thinking') {
      // Center loading for non-chat operations
      newMode = 'center_loading';
      loadingMessage = LOADING_MESSAGES[priorityOp];
      loadingProgress = this.activeLoadingOperations.get(priorityOp)?.progress;
    } else {
      // Default floating state
      newMode = 'floating';
    }
    
    const newState: OrbPresenceState = {
      mode: newMode,
      loadingMessage,
      loadingProgress,
      activeOperation: priorityOp,
      isThinking: this.activeLoadingOperations.size > 0
    };
    
    // Only notify if state actually changed
    if (
      this.state.mode !== newState.mode ||
      this.state.loadingMessage !== newState.loadingMessage ||
      this.state.loadingProgress !== newState.loadingProgress ||
      this.state.isThinking !== newState.isThinking
    ) {
      console.log(`🔮 OrbPresenceController: Mode transition ${this.state.mode} → ${newState.mode}`, {
        chatOpen: this.chatOpen,
        activeOps: Array.from(this.activeLoadingOperations.keys()),
        loadingMessage: newState.loadingMessage
      });
      this.state = newState;
      this.notifyListeners();
    }
  }

  // Subscribe to state changes
  addListener(listener: OrbPresenceListener): () => void {
    this.listeners.add(listener);
    // Immediately call with current state
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notifyListeners(): void {
    this.listeners.forEach(listener => listener(this.state));
  }

  // Get current state
  getState(): OrbPresenceState {
    return { ...this.state };
  }

  // Check if chat is currently open
  isChatOpen(): boolean {
    return this.chatOpen;
  }

  // Cleanup
  destroy(): void {
    this.listeners.clear();
    this.activeLoadingOperations.clear();
  }
}

// HMR-safe singleton
let __orbPresenceControllerSingleton: OrbPresenceController | null = 
  (globalThis as any).__orbPresenceControllerSingleton ?? null;

export const getOrbPresenceController = (): OrbPresenceController => {
  if (!__orbPresenceControllerSingleton) {
    __orbPresenceControllerSingleton = new OrbPresenceController();
    (globalThis as any).__orbPresenceControllerSingleton = __orbPresenceControllerSingleton;
  }
  return __orbPresenceControllerSingleton;
};

export type { OrbPresenceController };
