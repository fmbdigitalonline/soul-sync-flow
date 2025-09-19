/**
 * Conversation Summary Service - Reflective Memory (Directive 2: Test-First)
 * Maintains running summary of conversation context and key points
 */

import { supabase } from '@/integrations/supabase/client';
import { turnBufferService } from './turn-buffer-service';

export interface ConversationSummary {
  id: string;
  session_id: string;
  user_id: string;
  key_points: string[];
  emotional_tone: string;
  open_questions: string[];
  main_topics: string[];
  user_goals: string[];
  current_challenges: string[];
  created_at: Date;
  updated_at: Date;
  word_count: number;
}

export class ConversationSummaryService {
  private static instance: ConversationSummaryService;
  private summaryCache: Map<string, ConversationSummary> = new Map();

  static getInstance(): ConversationSummaryService {
    if (!this.instance) {
      this.instance = new ConversationSummaryService();
    }
    return this.instance;
  }

  /**
   * Generate or update conversation summary after each turn
   * Directive 2: Test case - Input: user message + context, Expected: structured summary with key points
   */
  async updateSummary(
    sessionId: string, 
    userId: string, 
    latestUserMessage: string, 
    latestAIResponse?: string
  ): Promise<ConversationSummary | null> {
    
    console.log('📝 SUMMARY SERVICE: Updating conversation summary');
    
    try {
      // Get recent turns for context
      const recentTurns = turnBufferService.getRecentTurns(sessionId);
      
      // Get existing summary or create new one
      let existingSummary = await this.getSummary(sessionId, userId);
      
      // Extract key information from latest exchange
      const extractedInfo = this.extractKeyInformation(
        latestUserMessage, 
        latestAIResponse, 
        recentTurns
      );

      const updatedSummary: ConversationSummary = {
        id: existingSummary?.id || `summary_${Date.now()}`,
        session_id: sessionId,
        user_id: userId,
        key_points: this.mergeKeyPoints(existingSummary?.key_points || [], extractedInfo.keyPoints),
        emotional_tone: extractedInfo.emotionalTone,
        open_questions: this.mergeOpenQuestions(existingSummary?.open_questions || [], extractedInfo.openQuestions),
        main_topics: this.mergeTopics(existingSummary?.main_topics || [], extractedInfo.topics),
        user_goals: this.mergeGoals(existingSummary?.user_goals || [], extractedInfo.goals),
        current_challenges: this.mergeChallenges(existingSummary?.current_challenges || [], extractedInfo.challenges),
        created_at: existingSummary?.created_at || new Date(),
        updated_at: new Date(),
        word_count: this.calculateWordCount(recentTurns)
      };

      // Store in database
      await this.storeSummary(updatedSummary);
      
      // Cache for quick access
      this.summaryCache.set(sessionId, updatedSummary);
      
      console.log('✅ SUMMARY SERVICE: Summary updated successfully', {
        keyPoints: updatedSummary.key_points.length,
        topics: updatedSummary.main_topics.length,
        emotionalTone: updatedSummary.emotional_tone
      });
      
      return updatedSummary;
      
    } catch (error) {
      console.error('❌ SUMMARY SERVICE: Failed to update summary:', error);
      return null;
    }
  }

  /**
   * Get current conversation summary
   */
  async getSummary(sessionId: string, userId: string): Promise<ConversationSummary | null> {
    // Check cache first
    if (this.summaryCache.has(sessionId)) {
      return this.summaryCache.get(sessionId)!;
    }

    try {
      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('session_id', sessionId)
        .eq('user_id', userId)
        .eq('memory_type', 'conversation_summary')
        .maybeSingle();

      if (error) {
        console.error('❌ SUMMARY SERVICE: Database error:', error);
        return null;
      }

      if (data?.memory_data) {
        const memoryData = data.memory_data as any;
        const summary: ConversationSummary = {
          id: data.id,
          session_id: sessionId,
          user_id: userId,
          key_points: memoryData.key_points || [],
          emotional_tone: memoryData.emotional_tone || 'neutraal',
          open_questions: memoryData.open_questions || [],
          main_topics: memoryData.main_topics || [],
          user_goals: memoryData.user_goals || [],
          current_challenges: memoryData.current_challenges || [],
          word_count: memoryData.word_count || 0,
          created_at: new Date(data.created_at),
          updated_at: new Date(data.created_at) // Fallback to created_at
        };
        
        this.summaryCache.set(sessionId, summary);
        return summary;
      }
      
      return null;
    } catch (error) {
      console.error('❌ SUMMARY SERVICE: Error retrieving summary:', error);
      return null;
    }
  }

  /**
   * Generate reflection summary for user - what they've been saying
   */
  async generateReflectionSummary(sessionId: string, userId: string): Promise<string> {
    const summary = await this.getSummary(sessionId, userId);
    const recentTurns = turnBufferService.getRecentTurns(sessionId);
    
    if (!summary && recentTurns.length === 0) {
      return "We zijn net begonnen met praten. Ik heb nog geen eerdere context om samen te vatten.";
    }

    const userMessages = recentTurns.filter(turn => turn.speaker === 'user');
    
    let reflection = "Hier is wat je de hele tijd hebt gezegd:\n\n";
    
    if (summary) {
      reflection += `**Hoofdthema's:** ${summary.main_topics.join(', ')}\n\n`;
      
      if (summary.current_challenges.length > 0) {
        reflection += `**Huidige uitdagingen:** ${summary.current_challenges.join(', ')}\n\n`;
      }
      
      if (summary.user_goals.length > 0) {
        reflection += `**Doelen die je noemde:** ${summary.user_goals.join(', ')}\n\n`;
      }
      
      reflection += `**Belangrijke punten:** ${summary.key_points.slice(-5).join(', ')}\n\n`;
      
      if (summary.open_questions.length > 0) {
        reflection += `**Open vragen:** ${summary.open_questions.join(', ')}\n\n`;
      }
      
      reflection += `**Emotionele toon:** ${summary.emotional_tone}\n\n`;
    }
    
    // Add recent context
    if (userMessages.length > 0) {
      reflection += "**Recente berichten van jou:**\n";
      userMessages.slice(-3).forEach((turn, index) => {
        reflection += `${index + 1}. \"${turn.text}\"\n`;
      });
    }
    
    return reflection;
  }

  private extractKeyInformation(userMessage: string, aiResponse?: string, recentTurns?: any[]) {
    const lowerMessage = userMessage.toLowerCase();
    
    // Extract topics
    const topics = this.extractTopics(userMessage);
    
    // Extract emotional tone
    const emotionalTone = this.detectEmotionalTone(userMessage);
    
    // Extract goals
    const goals = this.extractGoals(userMessage);
    
    // Extract challenges
    const challenges = this.extractChallenges(userMessage);
    
    // Extract questions
    const openQuestions = this.extractQuestions(userMessage);
    
    // Key points from this turn
    const keyPoints = [
      `Gebruiker zei: \"${userMessage.substring(0, 100)}${userMessage.length > 100 ? '...' : ''}\"`
    ];

    return {
      keyPoints,
      emotionalTone,
      openQuestions,
      topics,
      goals,
      challenges
    };
  }

  private detectEmotionalTone(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('gefrustreerd') || lowerMessage.includes('boos') || lowerMessage.includes('geïrriteerd')) {
      return 'gefrustreerd';
    }
    if (lowerMessage.includes('blij') || lowerMessage.includes('enthousiast') || lowerMessage.includes('positief')) {
      return 'positief';
    }
    if (lowerMessage.includes('verdrietig') || lowerMessage.includes('teleurgesteld') || lowerMessage.includes('down')) {
      return 'kwetsbaar';
    }
    if (lowerMessage.includes('verward') || lowerMessage.includes('onduidelijk') || lowerMessage.includes('weet niet')) {
      return 'zoekend_naar_steun';
    }
    if (lowerMessage.includes('vastzitten') || lowerMessage.includes('stuck') || lowerMessage.includes('niet verder')) {
      return 'vastgelopen';
    }
    
    return 'neutraal';
  }

  private extractTopics(message: string): string[] {
    const topics: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Common topics mentioned by user based on Dutch context
    const topicKeywords = {
      'energie': ['energie', 'moe', 'uitgeput', 'energiek'],
      'werk': ['werk', 'baan', 'carrière', 'collega'],
      'relaties': ['relatie', 'partner', 'vrienden', 'familie'],
      'geld': ['geld', 'financiën', 'inkomen', 'schulden'],
      'gezondheid': ['gezondheid', 'ziek', 'medicijn', 'dokter'],
      'dromen': ['droom', 'ambitie', 'doel', 'wens'],
      'creativiteit': ['creatief', 'kunst', 'schrijven', 'muziek'],
      'spiritualiteit': ['spiritueel', 'meditatie', 'bewustzijn']
    };

    for (const [topic, keywords] of Object.entries(topicKeywords)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        topics.push(topic);
      }
    }

    return topics;
  }

  private extractGoals(message: string): string[] {
    const goals: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    // Look for goal-indicating phrases
    const goalPatterns = [
      /ik wil (.*?)(?:[.!?]|$)/g,
      /mijn doel is (.*?)(?:[.!?]|$)/g,
      /ik hoop (.*?)(?:[.!?]|$)/g,
      /ik zou graag (.*?)(?:[.!?]|$)/g
    ];

    goalPatterns.forEach(pattern => {
      const matches = lowerMessage.matchAll(pattern);
      for (const match of matches) {
        if (match[1]) {
          goals.push(match[1].trim());
        }
      }
    });

    return goals;
  }

  private extractChallenges(message: string): string[] {
    const challenges: string[] = [];
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('probleem') || lowerMessage.includes('uitdaging') || 
        lowerMessage.includes('moeilijk') || lowerMessage.includes('struggle')) {
      // Extract the context around challenge words
      const challengeContext = message.substring(
        Math.max(0, lowerMessage.indexOf('probleem') - 20),
        Math.min(message.length, lowerMessage.indexOf('probleem') + 50)
      );
      challenges.push(challengeContext.trim());
    }

    return challenges;
  }

  private extractQuestions(message: string): string[] {
    const questions: string[] = [];
    const sentences = message.split(/[.!?]+/);
    
    sentences.forEach(sentence => {
      if (sentence.includes('?') || 
          sentence.toLowerCase().includes('hoe') || 
          sentence.toLowerCase().includes('wat') || 
          sentence.toLowerCase().includes('waarom')) {
        questions.push(sentence.trim());
      }
    });

    return questions.filter(q => q.length > 0);
  }

  private mergeKeyPoints(existing: string[], newPoints: string[]): string[] {
    const merged = [...existing, ...newPoints];
    // Keep only last 10 key points to avoid bloat
    return merged.slice(-10);
  }

  private mergeOpenQuestions(existing: string[], newQuestions: string[]): string[] {
    const merged = [...existing, ...newQuestions];
    // Remove duplicates and keep recent questions
    return [...new Set(merged)].slice(-5);
  }

  private mergeTopics(existing: string[], newTopics: string[]): string[] {
    return [...new Set([...existing, ...newTopics])];
  }

  private mergeGoals(existing: string[], newGoals: string[]): string[] {
    return [...new Set([...existing, ...newGoals])];
  }

  private mergeChallenges(existing: string[], newChallenges: string[]): string[] {
    const merged = [...existing, ...newChallenges];
    return [...new Set(merged)].slice(-5);
  }

  private calculateWordCount(turns: any[]): number {
    return turns.reduce((count, turn) => count + turn.text.split(' ').length, 0);
  }

  private async storeSummary(summary: ConversationSummary): Promise<void> {
    // Store in user_session_memory table for now
    const { error } = await supabase
      .from('user_session_memory')
      .upsert({
        user_id: summary.user_id,
        session_id: summary.session_id,
        memory_type: 'conversation_summary',
        memory_data: {
          key_points: summary.key_points,
          emotional_tone: summary.emotional_tone,
          open_questions: summary.open_questions,
          main_topics: summary.main_topics,
          user_goals: summary.user_goals,
          current_challenges: summary.current_challenges,
          word_count: summary.word_count
        },
        context_summary: `Conversation summary: ${summary.main_topics.join(', ')}`,
        importance_score: 8
      });

    if (error) {
      throw error;
    }
  }
}

export const conversationSummaryService = ConversationSummaryService.getInstance();
