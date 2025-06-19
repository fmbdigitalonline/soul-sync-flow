
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface DreamActivityLog {
  session_id: string;
  activity_type: string;
  activity_data: any;
  page_url?: string;
  user_agent?: string;
  correlation_id?: string;
  error_info?: any;
}

export interface TaskCoachSessionLog {
  session_id: string;
  task_id: string;
  task_title: string;
  session_start: Date;
  session_end?: Date;
  messages_count: number;
  actions_executed: number;
  session_data: any;
  performance_metrics?: any;
}

export interface CoachActionLog {
  session_id: string;
  action_type: string;
  action_payload: any;
  execution_result: any;
  execution_time_ms?: number;
  triggered_by: 'user_action' | 'auto_execution' | 'coach_response';
  duplicate_detection?: any;
  correlation_id?: string;
}

class DreamActivityLogger {
  private currentSessionId: string = uuidv4();
  private correlationId: string = uuidv4();
  private actionCache = new Map<string, number>();
  private lastActionTime = new Map<string, number>();
  private duplicateThreshold = 500; // 500ms to prevent duplicate actions
  
  constructor() {
    this.setupErrorLogging();
    this.logActivity('session_started', {
      session_id: this.currentSessionId,
      user_agent: navigator.userAgent,
      page_url: window.location.href
    });
  }

  private setupErrorLogging() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.logError('javascript_error', {
        message: event.message,
        filename: event.filename,
        line: event.lineno,
        column: event.colno,
        stack: event.error?.stack
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.logError('unhandled_promise_rejection', {
        reason: event.reason?.toString(),
        stack: event.reason?.stack
      });
    });
  }

  private generateActionKey(action_type: string, payload: any): string {
    return `${action_type}_${JSON.stringify(payload)}`;
  }

  private isDuplicateAction(action_type: string, payload: any): boolean {
    const actionKey = this.generateActionKey(action_type, payload);
    const now = Date.now();
    const lastTime = this.lastActionTime.get(actionKey);
    
    if (lastTime && (now - lastTime) < this.duplicateThreshold) {
      console.warn('🚫 Duplicate action detected and prevented:', action_type, payload);
      return true;
    }
    
    this.lastActionTime.set(actionKey, now);
    return false;
  }

  async logActivity(activity_type: string, activity_data: any = {}) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`📝 Dream Activity: ${activity_type}`, activity_data);

      const logData: DreamActivityLog = {
        session_id: this.currentSessionId,
        activity_type,
        activity_data: {
          ...activity_data,
          timestamp: new Date().toISOString(),
          correlation_id: this.correlationId
        },
        page_url: window.location.href,
        user_agent: navigator.userAgent,
        correlation_id: this.correlationId
      };

      const { error } = await supabase
        .from('dream_activity_logs')
        .insert({
          user_id: user.id,
          ...logData
        });

      if (error) {
        console.error('Failed to log dream activity:', error);
      }
    } catch (error) {
      console.error('Error in logActivity:', error);
    }
  }

  async logTaskCoachSession(sessionData: Partial<TaskCoachSessionLog>) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      console.log(`🎯 Task Coach Session:`, sessionData);

      const { error } = await supabase
        .from('task_coach_session_logs')
        .insert({
          user_id: user.id,
          session_id: this.currentSessionId,
          ...sessionData
        });

      if (error) {
        console.error('Failed to log task coach session:', error);
      }
    } catch (error) {
      console.error('Error in logTaskCoachSession:', error);
    }
  }

  async logCoachAction(actionData: CoachActionLog) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check for duplicate actions
      if (this.isDuplicateAction(actionData.action_type, actionData.action_payload)) {
        await this.logActivity('duplicate_action_prevented', {
          action_type: actionData.action_type,
          action_payload: actionData.action_payload,
          triggered_by: actionData.triggered_by
        });
        return false; // Action was prevented
      }

      console.log(`🎬 Coach Action: ${actionData.action_type}`, actionData);

      const startTime = Date.now();
      
      const { error } = await supabase
        .from('coach_action_logs')
        .insert({
          user_id: user.id,
          session_id: this.currentSessionId,
          correlation_id: this.correlationId,
          duplicate_detection: {
            action_key: this.generateActionKey(actionData.action_type, actionData.action_payload),
            timestamp: new Date().toISOString()
          },
          ...actionData,
          execution_time_ms: actionData.execution_time_ms || (Date.now() - startTime)
        });

      if (error) {
        console.error('Failed to log coach action:', error);
      }
      
      return true; // Action was logged successfully
    } catch (error) {
      console.error('Error in logCoachAction:', error);
      return false;
    }
  }

  async logError(error_type: string, error_info: any) {
    try {
      console.error(`❌ Dream Error: ${error_type}`, error_info);
      
      await this.logActivity('error_occurred', {
        error_type,
        error_info: {
          ...error_info,
          page_url: window.location.href,
          user_agent: navigator.userAgent,
          session_id: this.currentSessionId
        }
      });
    } catch (error) {
      console.error('Failed to log error:', error);
    }
  }

  // Anti-loop protection methods
  getActionFrequency(action_type: string): number {
    return this.actionCache.get(action_type) || 0;
  }

  incrementActionCount(action_type: string): void {
    const current = this.actionCache.get(action_type) || 0;
    this.actionCache.set(action_type, current + 1);
  }

  resetActionCounts(): void {
    this.actionCache.clear();
    this.lastActionTime.clear();
  }

  createNewSession(): void {
    this.currentSessionId = uuidv4();
    this.correlationId = uuidv4();
    this.resetActionCounts();
    this.logActivity('new_session_created', {
      previous_session: this.currentSessionId
    });
  }

  getCurrentSessionId(): string {
    return this.currentSessionId;
  }

  getCurrentCorrelationId(): string {
    return this.correlationId;
  }
}

export const dreamActivityLogger = new DreamActivityLogger();
