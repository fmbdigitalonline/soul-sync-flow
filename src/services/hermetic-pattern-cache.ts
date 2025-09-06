import { supabase } from '@/integrations/supabase/client';

export interface HermeticPattern {
  id: string;
  patternType: string;
  keywords: string[];
  hermetic_advice: string;
  embedding?: number[];
  confidence: number;
  category: 'shadow_work' | 'projection' | 'resistance' | 'limiting_belief';
}

export interface CacheStats {
  hitCount: number;
  missCount: number;
  hitRate: number;
  cacheSize: number;
  memoryUsage: number;
}

/**
 * HermeticPatternCache - Pre-computed embeddings for 80% faster hermetic retrieval
 * Target: 750ms → 5ms lookup time for cached patterns
 */
export class HermeticPatternCache {
  private static cache = new Map<string, HermeticPattern>();
  private static embeddingCache = new Map<string, number[]>();
  private static stats: CacheStats = { hitCount: 0, missCount: 0, hitRate: 0, cacheSize: 0, memoryUsage: 0 };
  private static initialized = false;
  private static maxCacheSize = 200; // Limit for memory management
  private static initPromise: Promise<void> | null = null;

  /**
   * Initialize cache with most common shadow patterns
   * Called during app initialization for optimal performance
   */
  static async initialize(): Promise<void> {
    if (this.initialized || this.initPromise) {
      return this.initPromise || Promise.resolve();
    }

    this.initPromise = this._doInitialize();
    return this.initPromise;
  }

  private static async _doInitialize(): Promise<void> {
    try {
      console.log('🚀 HermeticPatternCache: Initializing cache with common patterns');
      
      // Pre-populate with most common patterns based on shadow detection patterns
      const commonPatterns = [
        // Emotional triggers
        { pattern: 'overwhelmed', category: 'shadow_work' as const, advice: 'Notice when overwhelm arises. Take three deep breaths and identify one small next step.' },
        { pattern: 'frustrated', category: 'shadow_work' as const, advice: 'Frustration often signals unmet expectations. What expectation might you need to adjust?' },
        { pattern: 'anxious', category: 'shadow_work' as const, advice: 'Anxiety points to future concerns. Bring your attention to what you can control in this moment.' },
        
        // Projection patterns  
        { pattern: 'they always', category: 'projection' as const, advice: 'Notice the certainty in "always." How might this quality exist within you?' },
        { pattern: 'people never', category: 'projection' as const, advice: 'Universal statements about others often reveal our own inner landscape. What are you noticing about yourself?' },
        
        // Resistance patterns
        { pattern: 'i should', category: 'resistance' as const, advice: '"Should" implies resistance to what is. What would acceptance look like here?' },
        { pattern: 'i have to', category: 'resistance' as const, advice: 'Obligation language creates internal resistance. What would choosing this path feel like instead?' },
        
        // Limiting beliefs
        { pattern: 'i cant do', category: 'limiting_belief' as const, advice: 'Notice the absolute nature of "can\'t." What small step toward this goal might be possible?' },
        { pattern: 'im not good', category: 'limiting_belief' as const, advice: 'This belief may be protecting you from something. What would happen if it weren\'t completely true?' }
      ];

      // Cache these patterns with mock embeddings for fast lookup
      for (const patternData of commonPatterns) {
        const pattern: HermeticPattern = {
          id: `cached_${patternData.pattern.replace(/\s+/g, '_')}`,
          patternType: patternData.pattern,
          keywords: patternData.pattern.split(' '),
          hermetic_advice: patternData.advice,
          confidence: 0.85,
          category: patternData.category,
          embedding: this.generateMockEmbedding(patternData.pattern) // Fast mock embedding
        };
        
        this.cache.set(patternData.pattern, pattern);
        if (pattern.embedding) {
          this.embeddingCache.set(patternData.pattern, pattern.embedding);
        }
      }
      
      this.updateStats();
      this.initialized = true;
      
      console.log(`✅ HermeticPatternCache: Initialized with ${this.cache.size} patterns`);
      
    } catch (error) {
      console.error('🚨 HermeticPatternCache initialization error:', error);
      this.initialized = true; // Don't block app if cache fails
    }
  }

  /**
   * Fast pattern lookup with 80% cache hit rate target
   */
  static async getHermeticAdvice(patternText: string): Promise<HermeticPattern | null> {
    await this.initialize();
    
    const cacheKey = patternText.toLowerCase();
    
    // Direct cache hit
    if (this.cache.has(cacheKey)) {
      this.stats.hitCount++;
      this.updateStats();
      return this.cache.get(cacheKey)!;
    }
    
    // Fuzzy matching for variations
    const fuzzyMatch = this.findFuzzyMatch(cacheKey);
    if (fuzzyMatch) {
      this.stats.hitCount++;
      this.updateStats();
      return fuzzyMatch;
    }
    
    // Cache miss - queue background hermetic retrieval
    this.stats.missCount++;
    this.updateStats();
    
    // Background fetch without blocking
    this.queueBackgroundFetch(patternText);
    
    return null;
  }

  /**
   * Fuzzy matching for pattern variations (e.g., "i'm frustrated" matches "frustrated")
   */
  private static findFuzzyMatch(patternText: string): HermeticPattern | null {
    for (const [key, pattern] of this.cache.entries()) {
      // Check if any keywords match
      if (pattern.keywords.some(keyword => patternText.includes(keyword))) {
        return pattern;
      }
      
      // Check if cached pattern is contained in the text
      if (patternText.includes(key) || key.includes(patternText)) {
        return pattern;
      }
    }
    
    return null;
  }

  /**
   * Background fetch for cache miss - doesn't block conversation flow
   */
  private static async queueBackgroundFetch(patternText: string): Promise<void> {
    try {
      // Simulate hermetic database lookup (replace with actual hermetic search)
      setTimeout(async () => {
        const hermetic_advice = await this.fetchFromHermeticDatabase(patternText);
        
        if (hermetic_advice && this.cache.size < this.maxCacheSize) {
          const pattern: HermeticPattern = {
            id: `fetched_${Date.now()}`,
            patternType: patternText,
            keywords: patternText.split(' '),
            hermetic_advice,
            confidence: 0.75,
            category: 'shadow_work', // Default category
            embedding: this.generateMockEmbedding(patternText)
          };
          
          this.cache.set(patternText.toLowerCase(), pattern);
          this.updateStats();
          
          console.log(`📦 HermeticPatternCache: Background cached pattern: ${patternText}`);
        }
      }, 0); // Async queue
      
    } catch (error) {
      console.error('🚨 Background fetch error:', error);
    }
  }

  /**
   * Simulate hermetic database lookup (replace with actual implementation)
   */
  private static async fetchFromHermeticDatabase(patternText: string): Promise<string | null> {
    try {
      // This would be replaced with actual vector search against hermetic database
      // For now, return a generic hermetic-style advice
      return `Observe this pattern of "${patternText}" without judgment. What wisdom does your inner knowing reveal about this experience?`;
    } catch (error) {
      console.error('🚨 Hermetic database fetch error:', error);
      return null;
    }
  }

  /**
   * Generate mock embedding for development (replace with actual embedding service)
   */
  private static generateMockEmbedding(text: string): number[] {
    // Simple hash-based mock embedding for consistent results
    const embedding: number[] = [];
    let hash = 0;
    
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    // Generate 384-dimensional mock embedding
    for (let i = 0; i < 384; i++) {
      embedding.push(Math.sin(hash * (i + 1)) * 0.1);
    }
    
    return embedding;
  }

  /**
   * Update cache statistics
   */
  private static updateStats(): void {
    const total = this.stats.hitCount + this.stats.missCount;
    this.stats.hitRate = total > 0 ? (this.stats.hitCount / total) * 100 : 0;
    this.stats.cacheSize = this.cache.size;
    
    // Estimate memory usage (rough calculation)
    this.stats.memoryUsage = this.cache.size * 2048; // ~2KB per cached pattern
  }

  /**
   * Get cache performance statistics
   */
  static getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Clear cache for memory management (called during cleanup)
   */
  static clearCache(): void {
    this.cache.clear();
    this.embeddingCache.clear();
    this.stats = { hitCount: 0, missCount: 0, hitRate: 0, cacheSize: 0, memoryUsage: 0 };
    this.initialized = false;
    this.initPromise = null;
    
    console.log('🧹 HermeticPatternCache: Cache cleared');
  }

  /**
   * Memory management - remove oldest entries if cache grows too large
   */
  static manageCacheSize(): void {
    if (this.cache.size > this.maxCacheSize) {
      // Simple LRU - remove first entries (oldest)
      const keysToRemove = Array.from(this.cache.keys()).slice(0, this.cache.size - this.maxCacheSize + 10);
      
      for (const key of keysToRemove) {
        this.cache.delete(key);
        this.embeddingCache.delete(key);
      }
      
      this.updateStats();
      console.log(`🧹 HermeticPatternCache: Removed ${keysToRemove.length} old entries. Current size: ${this.cache.size}`);
    }
  }
}