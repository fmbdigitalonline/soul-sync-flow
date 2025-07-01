import { supabase } from "@/integrations/supabase/client";
import { PIEDataPoint, PIE_MINIMUM_DATA_POINTS } from "@/types/pie-types";
import { tieredMemoryGraph } from "./tiered-memory-graph";

class PIEDataCollectionService {
  private userId: string | null = null;
  private active = false;

  async initialize(userId: string): Promise<void> {
    console.log("📊 Initializing PIE Data Collection Service");
    this.userId = userId;
    this.active = true;
    
    // Start collecting baseline data from existing sources
    await this.collectBaselineData();
  }

  async storeDataPoint(dataPoint: PIEDataPoint): Promise<void> {
    if (!this.active) {
      console.log("📊 Data collection service not active, skipping store");
      return;
    }

    try {
      console.log(`📊 Storing PIE data point: ${dataPoint.dataType} = ${dataPoint.value} (ID: ${dataPoint.id})`);
      
      // Validate UUID format
      if (!dataPoint.id || !dataPoint.id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i)) {
        console.error("❌ Invalid UUID format for data point:", dataPoint.id);
        throw new Error(`Invalid UUID format: ${dataPoint.id}`);
      }

      // Map PIEDataPoint to database schema
      const dbDataPoint = {
        id: dataPoint.id,
        user_id: dataPoint.userId,
        timestamp: dataPoint.timestamp,
        data_type: dataPoint.dataType,
        value: dataPoint.value,
        raw_value: dataPoint.rawValue || null,
        source: dataPoint.source,
        confidence: dataPoint.confidence,
        metadata: dataPoint.metadata || {}
      };

      const { error } = await supabase
        .from('pie_user_data')
        .insert(dbDataPoint);

      if (error) {
        console.error("❌ Failed to store PIE data point:", error);
        throw error;
      }

      console.log(`✅ Successfully stored PIE data point: ${dataPoint.dataType} = ${dataPoint.value}`);
    } catch (error) {
      console.error("❌ Error storing PIE data point:", error);
      throw error;
    }
  }

  // Collect sentiment data from conversation history
  async collectSentimentFromConversations(): Promise<void> {
    if (!this.userId || !this.active) return;

    try {
      // Get recent conversations from TMG
      const recentMemories = await tieredMemoryGraph.getFromHotMemory(this.userId, 'global', 20);
      
      for (const memory of recentMemories) {
        if (memory.raw_content?.isUserMessage && memory.raw_content?.content) {
          const sentiment = this.analyzeSentiment(memory.raw_content.content);
          
          const dataPoint: PIEDataPoint = {
            id: crypto.randomUUID(), // FIXED: Use proper UUID generation
            userId: this.userId,
            timestamp: memory.created_at,
            dataType: 'sentiment',
            value: sentiment,
            source: 'conversation_analysis',
            confidence: 0.7,
            metadata: {
              messageId: memory.id,
              messageLength: memory.raw_content.content.length
            }
          };

          await this.storeDataPoint(dataPoint);
        }
      }
    } catch (error) {
      console.error("Failed to collect sentiment data:", error);
    }
  }

  // Simple sentiment analysis (would be enhanced with proper NLP)
  private analyzeSentiment(text: string): number {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'love', 'amazing', 'wonderful', 'fantastic', 'excited', 'motivated'];
    const negativeWords = ['bad', 'terrible', 'hate', 'sad', 'angry', 'frustrated', 'worried', 'stressed', 'difficult', 'struggling'];
    
    const words = text.toLowerCase().split(/\s+/);
    let score = 0;
    
    for (const word of words) {
      if (positiveWords.includes(word)) score += 1;
      if (negativeWords.includes(word)) score -= 1;
    }
    
    // Normalize to -1 to 1 scale
    return Math.max(-1, Math.min(1, score / Math.max(words.length / 10, 1)));
  }

  // Collect productivity data from task completion
  async collectProductivityData(taskId: string, completionTime: number, difficulty: string): Promise<void> {
    if (!this.userId || !this.active) return;

    // Convert completion metrics to productivity score
    const difficultyMultiplier = difficulty === 'high' ? 1.2 : difficulty === 'medium' ? 1.0 : 0.8;
    const timeScore = Math.max(0, 1 - (completionTime / 3600)); // Normalize by hour
    const productivityScore = timeScore * difficultyMultiplier;

    const dataPoint: PIEDataPoint = {
      id: crypto.randomUUID(), // FIXED: Use proper UUID generation
      userId: this.userId,
      timestamp: new Date().toISOString(),
      dataType: 'productivity',
      value: Math.min(1, productivityScore),
      source: 'activity_log',
      confidence: 0.8,
      metadata: {
        taskId,
        completionTime,
        difficulty
      }
    };

    await this.storeDataPoint(dataPoint);
  }

  // Collect mood data from mood tracker
  async collectMoodData(moodValue: number, source: string = 'user_input'): Promise<void> {
    if (!this.userId || !this.active) return;

    const dataPoint: PIEDataPoint = {
      id: crypto.randomUUID(), // FIXED: Use proper UUID generation
      userId: this.userId,
      timestamp: new Date().toISOString(),
      dataType: 'mood',
      value: moodValue / 10, // Normalize to 0-1 if coming from 1-10 scale
      source: source as any,
      confidence: 0.9, // High confidence for direct user input
      metadata: {
        rawMoodValue: moodValue
      }
    };

    await this.storeDataPoint(dataPoint);
  }

  // Check if we have minimum data for analysis
  async hasMinimumDataForAnalysis(userId: string, dataType: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('pie_user_data')
        .select('id')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .limit(PIE_MINIMUM_DATA_POINTS);

      if (error) throw error;

      return (data?.length || 0) >= PIE_MINIMUM_DATA_POINTS;
    } catch (error) {
      console.error("Error checking minimum data:", error);
      return false;
    }
  }

  // Get user data for pattern analysis
  async getUserData(userId: string, dataType: string, days: number = 90): Promise<PIEDataPoint[]> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - days);

      const { data, error } = await supabase
        .from('pie_user_data')
        .select('*')
        .eq('user_id', userId)
        .eq('data_type', dataType)
        .gte('timestamp', cutoffDate.toISOString())
        .order('timestamp', { ascending: true });

      if (error) throw error;

      // Map database records to PIEDataPoint interface with proper type casting
      return (data || []).map(record => ({
        id: record.id,
        userId: record.user_id,
        timestamp: record.timestamp,
        dataType: record.data_type as PIEDataPoint['dataType'],
        value: record.value,
        rawValue: record.raw_value,
        source: record.source as PIEDataPoint['source'],
        confidence: record.confidence,
        metadata: (record.metadata && typeof record.metadata === 'object' && !Array.isArray(record.metadata)) 
          ? record.metadata as Record<string, any>
          : {}
      }));
    } catch (error) {
      console.error("Error getting user data:", error);
      return [];
    }
  }

  // Collect baseline data from existing sources
  private async collectBaselineData(): Promise<void> {
    if (!this.userId) return;

    console.log("📊 Collecting baseline PIE data from existing sources");

    try {
      // Collect sentiment from recent conversations
      await this.collectSentimentFromConversations();
      
      console.log("✅ Baseline data collection completed");
    } catch (error) {
      console.error("Error collecting baseline data:", error);
    }
  }

  isActive(): boolean {
    return this.active;
  }

  async cleanup(): Promise<void> {
    console.log("📊 Cleaning up PIE Data Collection Service");
    this.active = false;
    this.userId = null;
  }
}

export const pieDataCollectionService = new PIEDataCollectionService();
