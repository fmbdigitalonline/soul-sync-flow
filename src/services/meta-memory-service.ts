
import { tieredMemoryGraph } from "./tiered-memory-graph";
import { agentCommunicationService, CrossModePattern } from "./agent-communication-service";

export interface MetaInsight {
  id: string;
  type: 'integration_opportunity' | 'pattern_evolution' | 'mode_preference' | 'holistic_trend';
  content: string;
  confidence: number;
  supportingEvidence: string[];
  generatedAt: Date;
  relevantModes: ('growth' | 'dreams')[];
}

export interface HolisticUserProfile {
  dominantMode: 'growth' | 'dreams' | 'balanced';
  integrationStyle: 'sequential' | 'parallel' | 'adaptive';
  preferredTransitions: {
    growth_to_dreams: string[];
    dreams_to_growth: string[];
  };
  metaPatterns: string[];
  lastUpdated: Date;
}

class MetaMemoryService {
  private userId: string | null = null;
  private userProfile: HolisticUserProfile | null = null;
  private metaInsights: MetaInsight[] = [];

  async initialize(userId: string) {
    this.userId = userId;
    await this.loadUserProfile();
    console.log("🧠 Meta Memory Service initialized with holistic profile");
  }

  // Generate meta-insights by analyzing cross-mode patterns
  async generateMetaInsights(): Promise<MetaInsight[]> {
    if (!this.userId) return [];

    const contextSummaries = await agentCommunicationService.getAgentContextSummaries();
    const crossModePatterns = contextSummaries.crossModePatterns;
    const newInsights: MetaInsight[] = [];

    // Analyze integration opportunities
    for (const pattern of crossModePatterns) {
      if (pattern.growthRelevance > 0.6 && pattern.dreamsRelevance > 0.6) {
        const insight: MetaInsight = {
          id: `integration_${pattern.id}_${Date.now()}`,
          type: 'integration_opportunity',
          content: `Strong integration opportunity detected: ${pattern.pattern}. Both spiritual growth and goal achievement aspects are highly relevant.`,
          confidence: Math.min(pattern.growthRelevance, pattern.dreamsRelevance),
          supportingEvidence: pattern.examples,
          generatedAt: new Date(),
          relevantModes: ['growth', 'dreams']
        };
        newInsights.push(insight);
      }
    }

    // Analyze mode preferences based on frequency
    const totalPatterns = crossModePatterns.reduce((sum, p) => sum + p.frequency, 0);
    if (totalPatterns > 0) {
      const growthWeight = crossModePatterns.reduce((sum, p) => sum + (p.frequency * p.growthRelevance), 0) / totalPatterns;
      const dreamsWeight = crossModePatterns.reduce((sum, p) => sum + (p.frequency * p.dreamsRelevance), 0) / totalPatterns;

      if (Math.abs(growthWeight - dreamsWeight) > 0.3) {
        const dominantMode = growthWeight > dreamsWeight ? 'growth' : 'dreams';
        const insight: MetaInsight = {
          id: `preference_${dominantMode}_${Date.now()}`,
          type: 'mode_preference',
          content: `User shows stronger affinity for ${dominantMode} mode (${dominantMode === 'growth' ? growthWeight : dreamsWeight}) based on conversation patterns.`,
          confidence: Math.abs(growthWeight - dreamsWeight),
          supportingEvidence: crossModePatterns.map(p => `${p.pattern} (freq: ${p.frequency})`),
          generatedAt: new Date(),
          relevantModes: [dominantMode]
        };
        newInsights.push(insight);
      }
    }

    // Store new insights
    for (const insight of newInsights) {
      await this.storeMetaInsight(insight);
    }

    this.metaInsights.push(...newInsights);
    await this.updateUserProfile();

    return newInsights;
  }

  // Get relevant meta-insights for Soul Companion
  getRelevantMetaInsights(limit: number = 3): MetaInsight[] {
    return this.metaInsights
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, limit);
  }

  // Update holistic user profile
  private async updateUserProfile(): Promise<void> {
    if (!this.userId) return;

    const contextSummaries = await agentCommunicationService.getAgentContextSummaries();
    const patterns = contextSummaries.crossModePatterns;

    // Calculate dominant mode
    const growthScore = patterns.reduce((sum, p) => sum + (p.frequency * p.growthRelevance), 0);
    const dreamsScore = patterns.reduce((sum, p) => sum + (p.frequency * p.dreamsRelevance), 0);
    
    let dominantMode: 'growth' | 'dreams' | 'balanced' = 'balanced';
    if (Math.abs(growthScore - dreamsScore) > 5) {
      dominantMode = growthScore > dreamsScore ? 'growth' : 'dreams';
    }

    // Determine integration style based on patterns
    const integrationStyle = this.determineIntegrationStyle(patterns);

    // Extract meta-patterns
    const metaPatterns = patterns
      .filter(p => p.frequency >= 3)
      .map(p => p.pattern);

    this.userProfile = {
      dominantMode,
      integrationStyle,
      preferredTransitions: {
        growth_to_dreams: this.extractTransitionTriggers(patterns, 'growth', 'dreams'),
        dreams_to_growth: this.extractTransitionTriggers(patterns, 'dreams', 'growth')
      },
      metaPatterns,
      lastUpdated: new Date()
    };

    // Store profile in persistent memory
    await this.storeUserProfile();
  }

  private determineIntegrationStyle(patterns: CrossModePattern[]): 'sequential' | 'parallel' | 'adaptive' {
    // Simple heuristic based on pattern characteristics
    const highIntegrationPatterns = patterns.filter(p => 
      p.growthRelevance > 0.7 && p.dreamsRelevance > 0.7
    );

    if (highIntegrationPatterns.length > patterns.length * 0.6) {
      return 'parallel'; // User tends to blend modes
    } else if (patterns.some(p => p.frequency > 10)) {
      return 'sequential'; // User has distinct mode preferences
    } else {
      return 'adaptive'; // User adapts based on context
    }
  }

  private extractTransitionTriggers(
    patterns: CrossModePattern[],
    fromMode: 'growth' | 'dreams',
    toMode: 'growth' | 'dreams'
  ): string[] {
    // Extract common triggers for mode transitions
    const relevantPatterns = patterns.filter(p => 
      p[`${fromMode}Relevance` as keyof CrossModePattern] > 0.5 &&
      p[`${toMode}Relevance` as keyof CrossModePattern] > 0.5
    );

    return relevantPatterns
      .slice(0, 3)
      .map(p => p.pattern);
  }

  private async storeMetaInsight(insight: MetaInsight): Promise<void> {
    if (!this.userId) return;

    try {
      await tieredMemoryGraph.storeInHotMemory(
        this.userId,
        `meta_insight_${insight.id}`,
        {
          ...insight,
          generatedAt: insight.generatedAt.toISOString()
        },
        8.0 // Very high importance for meta-insights
      );
    } catch (error) {
      console.error('Failed to store meta-insight:', error);
    }
  }

  private async loadUserProfile(): Promise<void> {
    // For now, initialize with default profile
    // In a full implementation, this would load from persistent storage
    this.userProfile = {
      dominantMode: 'balanced',
      integrationStyle: 'adaptive',
      preferredTransitions: {
        growth_to_dreams: [],
        dreams_to_growth: []
      },
      metaPatterns: [],
      lastUpdated: new Date()
    };
  }

  private async storeUserProfile(): Promise<void> {
    if (!this.userId || !this.userProfile) return;

    try {
      await tieredMemoryGraph.storeInHotMemory(
        this.userId,
        'holistic_user_profile',
        this.userProfile,
        9.0 // Highest importance for user profile
      );
    } catch (error) {
      console.error('Failed to store user profile:', error);
    }
  }

  getUserProfile(): HolisticUserProfile | null {
    return this.userProfile;
  }
}

export const metaMemoryService = new MetaMemoryService();
