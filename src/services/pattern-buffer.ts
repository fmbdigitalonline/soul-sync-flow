import { ShadowPattern } from './conversation-shadow-detector';

export interface PatternBufferEntry {
  pattern: ShadowPattern;
  timestamp: number;
  messageId: string;
  confidence: number;
}

export interface BufferStats {
  totalPatterns: number;
  memoryUsage: number; // bytes
  oldestEntry: number; // timestamp
  newestEntry: number; // timestamp
  averageConfidence: number;
}

/**
 * PatternBuffer - Rolling window memory management for 6-hour conversations
 * Target: Cap memory at 15MB regardless of session length
 */
export class PatternBuffer {
  private static buffer = new Map<string, PatternBufferEntry>();
  private static maxEntries = 20; // Limit for memory management
  private static maxAgeMs = 30 * 60 * 1000; // 30 minutes
  private static lastCleanup = Date.now();
  private static cleanupInterval = 5 * 60 * 1000; // 5 minutes

  /**
   * Add pattern to buffer with automatic memory management
   */
  static addPattern(pattern: ShadowPattern, messageId: string): void {
    const timestamp = Date.now();
    const entry: PatternBufferEntry = {
      pattern,
      timestamp,
      messageId,
      confidence: pattern.confidence
    };

    // Use pattern ID as key to avoid duplicates
    this.buffer.set(pattern.id, entry);

    // Automatic cleanup if needed
    this.performMaintenanceIfNeeded();
  }

  /**
   * Get recent patterns above confidence threshold
   */
  static getRecentPatterns(confidenceThreshold: number = 0.6, maxResults: number = 10): PatternBufferEntry[] {
    const now = Date.now();
    const cutoff = now - this.maxAgeMs;
    
    return Array.from(this.buffer.values())
      .filter(entry => entry.timestamp > cutoff && entry.confidence >= confidenceThreshold)
      .sort((a, b) => b.timestamp - a.timestamp) // Most recent first
      .slice(0, maxResults);
  }

  /**
   * Get patterns by type
   */
  static getPatternsByType(type: ShadowPattern['type'], maxResults: number = 5): PatternBufferEntry[] {
    const now = Date.now();
    const cutoff = now - this.maxAgeMs;
    
    return Array.from(this.buffer.values())
      .filter(entry => entry.timestamp > cutoff && entry.pattern.type === type)
      .sort((a, b) => b.confidence - a.confidence) // Highest confidence first
      .slice(0, maxResults);
  }

  /**
   * Check if similar pattern exists recently (to avoid duplicate notifications)
   */
  static hasSimilarRecentPattern(pattern: ShadowPattern, similarityWindow: number = 2 * 60 * 1000): boolean {
    const now = Date.now();
    const cutoff = now - similarityWindow;
    
    for (const entry of this.buffer.values()) {
      if (entry.timestamp > cutoff && 
          entry.pattern.type === pattern.type &&
          this.calculateSimilarity(entry.pattern, pattern) > 0.8) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Calculate similarity between patterns
   */
  private static calculateSimilarity(pattern1: ShadowPattern, pattern2: ShadowPattern): number {
    if (pattern1.type !== pattern2.type) return 0;
    
    // Simple text similarity for pattern matching
    const text1 = pattern1.pattern.toLowerCase();
    const text2 = pattern2.pattern.toLowerCase();
    
    if (text1 === text2) return 1;
    
    // Check for common keywords
    const words1 = text1.split(' ');
    const words2 = text2.split(' ');
    const commonWords = words1.filter(word => words2.includes(word));
    
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  /**
   * Perform maintenance if needed (automatic cleanup)
   */
  private static performMaintenanceIfNeeded(): void {
    const now = Date.now();
    
    // Size-based cleanup
    if (this.buffer.size > this.maxEntries) {
      this.performSizeBasedCleanup();
    }
    
    // Time-based cleanup (every 5 minutes)
    if (now - this.lastCleanup > this.cleanupInterval) {
      this.performTimeBasedCleanup();
      this.lastCleanup = now;
    }
  }

  /**
   * Remove oldest entries when buffer is full
   */
  private static performSizeBasedCleanup(): void {
    const entries = Array.from(this.buffer.entries());
    entries.sort((a, b) => a[1].timestamp - b[1].timestamp); // Oldest first
    
    const toRemove = entries.slice(0, entries.length - this.maxEntries + 5); // Keep some buffer
    
    for (const [key, _] of toRemove) {
      this.buffer.delete(key);
    }
    
    console.log(`🧹 PatternBuffer: Removed ${toRemove.length} old entries. Current size: ${this.buffer.size}`);
  }

  /**
   * Remove expired entries based on age
   */
  private static performTimeBasedCleanup(): void {
    const now = Date.now();
    const cutoff = now - this.maxAgeMs;
    let removedCount = 0;
    
    for (const [key, entry] of this.buffer.entries()) {
      if (entry.timestamp < cutoff) {
        this.buffer.delete(key);
        removedCount++;
      }
    }
    
    if (removedCount > 0) {
      console.log(`🧹 PatternBuffer: Removed ${removedCount} expired entries. Current size: ${this.buffer.size}`);
    }
  }

  /**
   * Get buffer statistics for monitoring
   */
  static getStats(): BufferStats {
    const entries = Array.from(this.buffer.values());
    
    if (entries.length === 0) {
      return {
        totalPatterns: 0,
        memoryUsage: 0,
        oldestEntry: 0,
        newestEntry: 0,
        averageConfidence: 0
      };
    }
    
    const timestamps = entries.map(e => e.timestamp);
    const confidences = entries.map(e => e.confidence);
    
    // Rough memory estimation (each entry ~1KB)
    const memoryUsage = entries.length * 1024;
    
    return {
      totalPatterns: entries.length,
      memoryUsage,
      oldestEntry: Math.min(...timestamps),
      newestEntry: Math.max(...timestamps),
      averageConfidence: confidences.reduce((a, b) => a + b, 0) / confidences.length
    };
  }

  /**
   * Get patterns for hermetic advice (highest confidence)
   */
  static getPatternsForAdvice(maxCount: number = 3): PatternBufferEntry[] {
    return Array.from(this.buffer.values())
      .filter(entry => entry.confidence > 0.7) // Only high-confidence patterns
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, maxCount);
  }

  /**
   * Clear all patterns (for testing or reset)
   */
  static clear(): void {
    this.buffer.clear();
    this.lastCleanup = Date.now();
    console.log('🧹 PatternBuffer: All patterns cleared');
  }

  /**
   * Force cleanup (manual trigger)
   */
  static forceCleanup(): void {
    this.performTimeBasedCleanup();
    this.performSizeBasedCleanup();
  }

  /**
   * Get session summary for insights
   */
  static getSessionSummary(): { 
    totalPatterns: number;
    patternsByType: Record<string, number>;
    topPatterns: PatternBufferEntry[];
  } {
    const entries = Array.from(this.buffer.values());
    const patternsByType: Record<string, number> = {};
    
    // Count patterns by type
    for (const entry of entries) {
      const type = entry.pattern.type;
      patternsByType[type] = (patternsByType[type] || 0) + 1;
    }
    
    // Get top patterns
    const topPatterns = entries
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 5);
    
    return {
      totalPatterns: entries.length,
      patternsByType,
      topPatterns
    };
  }
}