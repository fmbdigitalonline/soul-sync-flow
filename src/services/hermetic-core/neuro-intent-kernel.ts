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
}

export interface IntentUpdate {
  type: 'new' | 'modify' | 'complete' | 'abandon';
  intent: Partial<Intent>;
  reason: string;
}

class NeuroIntentKernel {
  private currentIntent: Intent | null = null;
  private intentHistory: Intent[] = [];
  private listeners: ((intent: Intent | null) => void)[] = [];

  // Initialize intent from external command or internal generation
  setIntent(primary: string, context: Record<string, any> = {}, sessionId: string, domain: string): Intent {
    const intent: Intent = {
      id: `intent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      primary,
      subIntents: [],
      context,
      priority: 1.0,
      timestamp: new Date(),
      sessionId,
      domain
    };

    this.currentIntent = intent;
    this.intentHistory.push(intent);
    this.notifyListeners();
    
    console.log(`🧠 NIK: Set new intent "${primary}" for ${domain}`);
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

  // Persist intent across sessions/interruptions
  persistIntent(): string | null {
    if (!this.currentIntent) return null;
    
    const serialized = JSON.stringify(this.currentIntent);
    // In real implementation, store in TMG or persistent storage
    console.log(`🧠 NIK: Intent persisted for recovery`);
    return serialized;
  }

  // Restore intent from persistence
  restoreIntent(serializedIntent: string): Intent | null {
    try {
      const intent = JSON.parse(serializedIntent) as Intent;
      this.currentIntent = intent;
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