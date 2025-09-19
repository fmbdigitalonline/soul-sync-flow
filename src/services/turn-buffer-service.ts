/**
 * Turn Buffer Service - Short-term Memory (Directive 1: Correctness)
 * Preserves last ~10 user+AI turns literally to prevent detail loss
 */

export interface Turn {
  id: string;
  speaker: 'user' | 'assistant';
  text: string;
  timestamp: Date;
  turn_id: string;
  emotional_state?: string;
  intent?: string;
}

export class TurnBufferService {
  private static instance: TurnBufferService;
  private turnBuffer: Map<string, Turn[]> = new Map();
  private readonly MAX_TURNS = 10;
  private readonly TTL_MINUTES = 30;

  static getInstance(): TurnBufferService {
    if (!this.instance) {
      this.instance = new TurnBufferService();
    }
    return this.instance;
  }

  /**
   * Add turn to buffer with validation
   */
  addTurn(sessionId: string, turn: Omit<Turn, 'id' | 'turn_id'>): void {
    if (!turn.text?.trim() || !sessionId?.trim()) {
      console.warn('⚠️ TURN BUFFER: Invalid turn data, skipping');
      return;
    }

    const fullTurn: Turn = {
      ...turn,
      id: `turn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      turn_id: `${sessionId}_${Date.now()}`,
      text: turn.text.trim()
    };

    const sessionTurns = this.turnBuffer.get(sessionId) || [];
    
    // Deduplication check
    const isDuplicate = sessionTurns.some(existing => 
      existing.text === fullTurn.text && 
      existing.speaker === fullTurn.speaker &&
      (Date.now() - existing.timestamp.getTime()) < 5000 // Within 5 seconds
    );

    if (isDuplicate) {
      console.log('🔄 TURN BUFFER: Duplicate turn detected, skipping');
      return;
    }

    sessionTurns.push(fullTurn);

    // Keep only last MAX_TURNS
    if (sessionTurns.length > this.MAX_TURNS) {
      sessionTurns.splice(0, sessionTurns.length - this.MAX_TURNS);
    }

    this.turnBuffer.set(sessionId, sessionTurns);
    console.log(`✅ TURN BUFFER: Added ${fullTurn.speaker} turn. Buffer size: ${sessionTurns.length}`);
  }

  /**
   * Get recent turns for context
   */
  getRecentTurns(sessionId: string, count: number = 10): Turn[] {
    const sessionTurns = this.turnBuffer.get(sessionId) || [];
    
    // Remove expired turns
    const now = Date.now();
    const validTurns = sessionTurns.filter(turn => 
      now - turn.timestamp.getTime() < this.TTL_MINUTES * 60 * 1000
    );

    this.turnBuffer.set(sessionId, validTurns);
    
    return validTurns.slice(-count);
  }

  /**
   * Get conversation context as formatted string
   */
  getContextSummary(sessionId: string): string {
    const turns = this.getRecentTurns(sessionId);
    
    if (turns.length === 0) {
      return "No recent conversation context available.";
    }

    const contextLines = turns.map(turn => {
      const timeAgo = this.formatTimeAgo(turn.timestamp);
      return `[${timeAgo}] ${turn.speaker === 'user' ? 'Je' : 'AI'}: ${turn.text}`;
    });

    return `Recente gesprekscontext (${turns.length} berichten):\n${contextLines.join('\n')}`;
  }

  /**
   * Clear buffer for session
   */
  clearSession(sessionId: string): void {
    this.turnBuffer.delete(sessionId);
    console.log(`🧹 TURN BUFFER: Cleared session ${sessionId}`);
  }

  /**
   * Get last user message for intent analysis
   */
  getLastUserMessage(sessionId: string): Turn | null {
    const turns = this.getRecentTurns(sessionId);
    const userTurns = turns.filter(turn => turn.speaker === 'user');
    return userTurns.length > 0 ? userTurns[userTurns.length - 1] : null;
  }

  private formatTimeAgo(date: Date): string {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    
    if (seconds < 60) return `${seconds}s geleden`;
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m geleden`;
    const hours = Math.floor(minutes / 60);
    return `${hours}h geleden`;
  }
}

export const turnBufferService = TurnBufferService.getInstance();
