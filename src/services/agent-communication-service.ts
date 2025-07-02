import { growthBrainService } from "./growth-brain-service";
import { dreamsBrainService } from "./dreams-brain-service";
import { tieredMemoryGraph } from "./tiered-memory-graph";

export interface AgentInsight {
  agentType: 'growth' | 'dreams';
  insightType: 'pattern' | 'progress' | 'challenge' | 'opportunity';
  content: string;
  confidence: number;
  timestamp: Date;
  relevanceScore: number;
}

export interface CrossModePattern {
  id: string;
  pattern: string;
  growthRelevance: number;
  dreamsRelevance: number;
  frequency: number;
  lastSeen: Date;
  examples: string[];
}

export interface ModeTransitionRecommendation {
  suggestedMode: 'growth' | 'dreams';
  reason: string;
  confidence: number;
  triggers: string[];
  expectedBenefit: string;
}

class AgentCommunicationService {
  private userId: string | null = null;
  private crossModePatterns = new Map<string, CrossModePattern>();
  private recentInsights = new Map<string, AgentInsight[]>();

  async initialize(userId: string) {
    this.userId = userId;
    console.log("🔄 Agent Communication Service initialized for user:", userId);
  }

  // Thin API for agent-to-agent insights
  async shareInsightBetweenAgents(
    fromAgent: 'growth' | 'dreams',
    toAgent: 'growth' | 'dreams' | 'soul_companion',
    insight: Omit<AgentInsight, 'agentType' | 'timestamp'>
  ): Promise<void> {
    if (!this.userId) return;

    const fullInsight: AgentInsight = {
      ...insight,
      agentType: fromAgent,
      timestamp: new Date()
    };

    // Store insight in cross-agent memory
    const agentInsights = this.recentInsights.get(toAgent) || [];
    agentInsights.push(fullInsight);
    
    // Keep only last 10 insights per agent
    if (agentInsights.length > 10) {
      agentInsights.shift();
    }
    
    this.recentInsights.set(toAgent, agentInsights);

    // Store in persistent memory for meta-analysis
    await this.storeMetaInsight(fullInsight);

    console.log(`🔄 Insight shared from ${fromAgent} to ${toAgent}:`, insight.content);
  }

  // Get cross-mode insights for an agent
  getInsightsForAgent(agentType: 'growth' | 'dreams' | 'soul_companion'): AgentInsight[] {
    return this.recentInsights.get(agentType) || [];
  }

  // Analyze patterns across modes
  async analyzeCrossModePatterns(userMessage: string, currentMode: 'growth' | 'dreams'): Promise<CrossModePattern[]> {
    const patterns: CrossModePattern[] = [];
    
    // Simple pattern detection based on keywords and themes
    const growthKeywords = ['spiritual', 'growth', 'healing', 'reflection', 'inner', 'emotion'];
    const dreamsKeywords = ['goal', 'achieve', 'task', 'plan', 'action', 'productivity'];
    
    const messageWords = userMessage.toLowerCase().split(/\s+/);
    
    // Check for cross-mode patterns
    const hasGrowthWords = growthKeywords.some(keyword => 
      messageWords.some(word => word.includes(keyword))
    );
    const hasDreamsWords = dreamsKeywords.some(keyword => 
      messageWords.some(word => word.includes(keyword))
    );
    
    if (hasGrowthWords && hasDreamsWords) {
      const patternId = 'growth_dreams_integration';
      let pattern = this.crossModePatterns.get(patternId);
      
      if (!pattern) {
        pattern = {
          id: patternId,
          pattern: 'User expressing both spiritual growth and goal achievement themes',
          growthRelevance: 0.8,
          dreamsRelevance: 0.8,
          frequency: 1,
          lastSeen: new Date(),
          examples: [userMessage.slice(0, 100)]
        };
      } else {
        pattern.frequency += 1;
        pattern.lastSeen = new Date();
        pattern.examples.push(userMessage.slice(0, 100));
        if (pattern.examples.length > 5) pattern.examples.shift();
      }
      
      this.crossModePatterns.set(patternId, pattern);
      patterns.push(pattern);
    }
    
    return patterns;
  }

  // Generate mode transition recommendations
  async generateModeTransitionRecommendation(
    currentMode: 'growth' | 'dreams' | 'soul_companion',
    userMessage: string,
    conversationHistory: string[]
  ): Promise<ModeTransitionRecommendation | null> {
    
    // Analyze recent conversation context
    const recentContext = conversationHistory.slice(-3).join(' ').toLowerCase();
    const currentMessage = userMessage.toLowerCase();
    
    // Growth mode indicators
    const growthIndicators = [
      'feel', 'emotion', 'spiritual', 'inner', 'reflection', 'healing', 
      'understand myself', 'personal growth', 'meditation', 'mindfulness'
    ];
    
    // Dreams mode indicators  
    const dreamsIndicators = [
      'goal', 'achieve', 'plan', 'task', 'deadline', 'productivity',
      'get things done', 'organize', 'schedule', 'complete', 'finish'
    ];
    
    const growthScore = growthIndicators.filter(indicator => 
      currentMessage.includes(indicator) || recentContext.includes(indicator)
    ).length;
    
    const dreamsScore = dreamsIndicators.filter(indicator => 
      currentMessage.includes(indicator) || recentContext.includes(indicator)
    ).length;
    
    // Generate recommendation based on mode mismatch
    if (currentMode === 'dreams' && growthScore > dreamsScore && growthScore >= 2) {
      return {
        suggestedMode: 'growth',
        reason: 'Your message indicates a need for emotional processing and inner reflection',
        confidence: Math.min(0.9, 0.5 + (growthScore * 0.1)),
        triggers: growthIndicators.filter(indicator => currentMessage.includes(indicator)),
        expectedBenefit: 'Deeper self-understanding and emotional healing guidance'
      };
    }
    
    if (currentMode === 'growth' && dreamsScore > growthScore && dreamsScore >= 2) {
      return {
        suggestedMode: 'dreams',
        reason: 'Your focus seems to be on concrete goals and actionable planning',
        confidence: Math.min(0.9, 0.5 + (dreamsScore * 0.1)),
        triggers: dreamsIndicators.filter(indicator => currentMessage.includes(indicator)),
        expectedBenefit: 'Strategic planning and productivity optimization support'
      };
    }
    
    return null;
  }

  // Store meta-insights in higher-order memory
  private async storeMetaInsight(insight: AgentInsight): Promise<void> {
    if (!this.userId) return;
    
    try {
      await tieredMemoryGraph.storeInHotMemory(
        this.userId,
        `meta_insight_${Date.now()}`,
        {
          type: 'cross_agent_insight',
          agentType: insight.agentType,
          insightType: insight.insightType,
          content: insight.content,
          confidence: insight.confidence,
          relevanceScore: insight.relevanceScore,
          timestamp: insight.timestamp.toISOString()
        },
        7.0 // High importance for meta-insights
      );
    } catch (error) {
      console.error('Failed to store meta-insight:', error);
    }
  }

  // Get agent context summaries for Soul Companion
  async getAgentContextSummaries(): Promise<{
    growth: any;
    dreams: any;
    crossModePatterns: CrossModePattern[];
  }> {
    const growthContext = growthBrainService.getGrowthContext();
    const dreamsContext = dreamsBrainService.getDreamsContext();
    
    return {
      growth: {
        ...growthContext,
        recentInsights: this.getInsightsForAgent('growth').slice(-3)
      },
      dreams: {
        ...dreamsContext,
        recentInsights: this.getInsightsForAgent('dreams').slice(-3)
      },
      crossModePatterns: Array.from(this.crossModePatterns.values())
        .sort((a, b) => b.frequency - a.frequency)
        .slice(0, 5)
    };
  }

  // Clear old patterns and insights (called periodically)
  cleanupOldData(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    
    // Clean up old patterns
    for (const [id, pattern] of this.crossModePatterns.entries()) {
      if (pattern.lastSeen < oneWeekAgo && pattern.frequency < 3) {
        this.crossModePatterns.delete(id);
      }
    }
    
    // Clean up old insights
    for (const [agent, insights] of this.recentInsights.entries()) {
      const recentInsights = insights.filter(insight => 
        insight.timestamp > oneWeekAgo
      );
      this.recentInsights.set(agent, recentInsights);
    }
    
    console.log("🧹 Agent communication service cleaned up old data");
  }
}

export const agentCommunicationService = new AgentCommunicationService();
