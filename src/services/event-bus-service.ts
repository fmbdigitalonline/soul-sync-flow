
export interface EventData {
  [key: string]: any;
}

export interface SystemEvent {
  type: string;
  data: EventData;
  timestamp: number;
  source: string;
  userId?: string;
  sessionId?: string;
}

export type EventHandler = (event: SystemEvent) => void | Promise<void>;

class EventBusService {
  private handlers = new Map<string, EventHandler[]>();
  private eventHistory: SystemEvent[] = [];
  private maxHistorySize = 100;

  // Subscribe to events
  subscribe(eventType: string, handler: EventHandler): () => void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, []);
    }
    
    this.handlers.get(eventType)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.handlers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  // Publish events
  async publish(eventType: string, data: EventData, source: string = 'unknown', userId?: string, sessionId?: string): Promise<void> {
    const event: SystemEvent = {
      type: eventType,
      data,
      timestamp: Date.now(),
      source,
      userId,
      sessionId
    };

    // Store in history
    this.eventHistory.push(event);
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }

    // Notify handlers
    const handlers = this.handlers.get(eventType) || [];
    const promises = handlers.map(handler => {
      try {
        return Promise.resolve(handler(event));
      } catch (error) {
        console.error(`Event handler error for ${eventType}:`, error);
        return Promise.resolve();
      }
    });

    await Promise.allSettled(promises);
    console.log(`📡 Event published: ${eventType}`, data);
  }

  // Get recent events
  getRecentEvents(eventType?: string, limit: number = 10): SystemEvent[] {
    let events = this.eventHistory;
    
    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }
    
    return events.slice(-limit);
  }

  // Clear event history
  clearHistory(): void {
    this.eventHistory = [];
  }

  // Get all event types currently subscribed to
  getSubscribedEventTypes(): string[] {
    return Array.from(this.handlers.keys());
  }
}

export const eventBusService = new EventBusService();

// Career-specific event types
export const CAREER_EVENTS = {
  STATUS_DETECTED: 'career.status.detected',
  STATUS_CONFIRMED: 'career.status.confirmed',
  STATUS_CHANGED: 'career.status.changed',
  DISCOVERY_STARTED: 'career.discovery.started',
  EXPLORATION_PROGRESS: 'career.exploration.progress',
  JOB_SEARCH_UPDATE: 'career.job_search.update',
  CAREER_CONFUSION: 'career.confusion.detected',
  CAREER_BREAKTHROUGH: 'career.breakthrough.achieved'
} as const;
