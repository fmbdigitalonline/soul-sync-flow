
import { pieService } from './pie-service';
import { tieredMemoryGraph } from './tiered-memory-graph';
import { adaptiveContextScheduler } from './adaptive-context-scheduler';
import { personalityVectorService } from './personality-vector-service';
import { enhancedCareerCoachingService } from './enhanced-career-coaching-service';
import { eventBusService, CAREER_EVENTS } from './event-bus-service';
import { LifeDomain } from '@/types/growth-program';

export interface RootCauseCandidate {
  id: string;
  description: string;
  confidence: number;
  emotionalResonance: number;
  patternStrength: number;
  beliefMappingScore: number;
  supportingEvidence: string[];
  requiredConfirmation: boolean;
}

export interface DepthAnalysis {
  overallDepth: number;
  emotionalDepth: number;
  patternDepth: number;
  beliefDepth: number;
  personalityAlignment: number;
  readyForProgram: boolean;
  nextRecommendedAction: string;
}

export interface BeliefMapping {
  coreBeliefs: Array<{
    belief: string;
    strength: number;
    isLimiting: boolean;
    connectedChallenges: string[];
  }>;
  beliefConflicts: Array<{
    belief1: string;
    belief2: string;
    conflictIntensity: number;
  }>;
  rootCauseConnections: Array<{
    rootCause: string;
    connectedBeliefs: string[];
    causalStrength: number;
  }>;
}

class GrowthIntelligenceFusionService {
  private userId: string | null = null;
  private domain: LifeDomain | null = null;
  private initialized = false;

  async initialize(userId: string, domain: LifeDomain): Promise<void> {
    console.log('🧠 Initializing Growth Intelligence Fusion for:', domain);
    
    this.userId = userId;
    this.domain = domain;
    
    // Initialize all intelligence systems
    await pieService.initialize(userId);
    await enhancedCareerCoachingService.initialize();
    
    // Subscribe to career events if we're in career domain
    if (domain === 'career') {
      this.setupCareerEventHandlers();
    }
    
    this.initialized = true;
    console.log('✅ Growth Intelligence Fusion initialized with enhanced career coaching');
  }

  private setupCareerEventHandlers(): void {
    eventBusService.subscribe(CAREER_EVENTS.STATUS_DETECTED, async (event) => {
      console.log('🎯 Fusion received career status:', event.data);
      
      // Update PIE with career status for better insights using correct data types
      try {
        await pieService.processUserData({
          id: `career_status_${Date.now()}`,
          userId: this.userId!,
          timestamp: new Date().toISOString(),
          dataType: 'sentiment', // Use existing PIE data type
          value: this.mapCareerStatusToValue(event.data.status),
          source: 'conversation_analysis', // Use existing PIE source type
          confidence: event.data.confidence,
          metadata: {
            status: event.data.status,
            needsConfirmation: event.data.needsConfirmation,
            careerContext: true // Add career context flag
          }
        });
      } catch (error) {
        console.error('Failed to update PIE with career status:', error);
      }
    });
  }

  private mapCareerStatusToValue(status: string): number {
    const statusValues = {
      'no_career': 0.1,
      'unemployed': 0.2,
      'job_searching': 0.4,
      'career_transition': 0.5,
      'employed_struggling': 0.3,
      'employed_satisfied': 0.8,
      'career_change': 0.6
    };
    return statusValues[status as keyof typeof statusValues] || 0.5;
  }

  // Enhanced conversation analysis with career awareness
  async analyzeConversationDepth(sessionId: string): Promise<DepthAnalysis> {
    if (!this.initialized || !this.userId) {
      throw new Error('Growth Intelligence Fusion not initialized');
    }

    console.log('🔍 Analyzing conversation depth with career intelligence');

    // Special handling for career domain
    if (this.domain === 'career') {
      return this.analyzeCareerConversationDepth(sessionId);
    }

    // Get data from all intelligence systems
    const [acsMetrics, pieInsights, tmgMemories, personalityVector] = await Promise.all([
      this.getACSMetrics(sessionId),
      this.getPIEPatterns(),
      this.getTMGBeliefData(sessionId),
      this.getPersonalityAlignment()
    ]);

    // Calculate depth scores
    const emotionalDepth = this.calculateEmotionalDepth(acsMetrics);
    const patternDepth = this.calculatePatternDepth(pieInsights);
    const beliefDepth = this.calculateBeliefDepth(tmgMemories);
    const personalityAlignment = this.calculatePersonalityAlignment(personalityVector);

    const overallDepth = (emotionalDepth + patternDepth + beliefDepth + personalityAlignment) / 4;
    
    const analysis: DepthAnalysis = {
      overallDepth,
      emotionalDepth,
      patternDepth,
      beliefDepth,
      personalityAlignment,
      readyForProgram: this.isReadyForProgram(overallDepth, emotionalDepth, patternDepth, beliefDepth),
      nextRecommendedAction: this.getNextRecommendedAction(overallDepth, emotionalDepth, patternDepth, beliefDepth)
    };

    console.log('📊 Depth Analysis Results:', analysis);
    return analysis;
  }

  private async analyzeCareerConversationDepth(sessionId: string): Promise<DepthAnalysis> {
    console.log('💼 Analyzing career-specific conversation depth');

    // Get career-specific intelligence
    const [acsMetrics, pieInsights, tmgMemories, personalityVector] = await Promise.all([
      this.getACSMetrics(sessionId),
      this.getPIEPatterns(),
      this.getCareerTMGMemories(sessionId),
      this.getPersonalityAlignment()
    ]);

    // Enhanced career-specific depth calculation
    const careerClarityDepth = this.calculateCareerClarityDepth(tmgMemories);
    const explorationDepth = this.calculateExplorationDepth(pieInsights);
    const emotionalReadinessDepth = this.calculateEmotionalDepth(acsMetrics);
    const personalityAlignment = this.calculatePersonalityAlignment(personalityVector);

    const overallDepth = (careerClarityDepth + explorationDepth + emotionalReadinessDepth + personalityAlignment) / 4;

    return {
      overallDepth,
      emotionalDepth: emotionalReadinessDepth,
      patternDepth: explorationDepth,
      beliefDepth: careerClarityDepth,
      personalityAlignment,
      readyForProgram: this.isReadyForCareerProgram(overallDepth, careerClarityDepth, explorationDepth),
      nextRecommendedAction: this.getCareerRecommendedAction(overallDepth, careerClarityDepth, explorationDepth)
    };
  }

  private async getCareerTMGMemories(sessionId: string) {
    try {
      if (!this.userId) return [];
      const memories = await tieredMemoryGraph.getFromHotMemory(this.userId, sessionId, 20);
      
      // Filter for career-relevant memories
      return memories.filter(memory => {
        const content = memory.raw_content?.content?.toLowerCase() || '';
        const context = memory.raw_content?.context;
        return context === 'career_coaching' || 
               content.includes('career') || 
               content.includes('job') || 
               content.includes('work');
      });
    } catch (error) {
      console.warn('Could not get career TMG memories:', error);
      return [];
    }
  }

  private calculateCareerClarityDepth(memories: any[]): number {
    if (memories.length === 0) return 0;

    // Look for career status clarity indicators
    const clarityKeywords = ['no career', 'unemployed', 'job search', 'career change', 'want to', 'looking for'];
    const clarityMemories = memories.filter(memory => {
      const content = memory.raw_content?.content?.toLowerCase() || '';
      return clarityKeywords.some(keyword => content.includes(keyword));
    });

    const clarityRatio = clarityMemories.length / memories.length;
    const avgImportance = clarityMemories.reduce((sum, mem) => sum + (mem.importance_score || 5), 0) / Math.max(clarityMemories.length, 1);
    
    return Math.min(1, clarityRatio * (avgImportance / 10));
  }

  private calculateExplorationDepth(pieInsights: any[]): number {
    if (pieInsights.length === 0) return 0;

    // Look for exploration and discovery patterns
    const explorationInsights = pieInsights.filter(insight => 
      insight.type === 'career_exploration' || 
      insight.type === 'self_discovery' ||
      insight.priority === 'high'
    );

    const avgConfidence = explorationInsights.reduce((sum, insight) => sum + insight.confidence, 0) / Math.max(explorationInsights.length, 1);
    const explorationRatio = explorationInsights.length / pieInsights.length;

    return Math.min(1, avgConfidence * explorationRatio);
  }

  private isReadyForCareerProgram(overall: number, clarity: number, exploration: number): boolean {
    // Career programs need clarity about current status and some exploration
    return overall >= 0.5 && clarity >= 0.4 && exploration >= 0.3;
  }

  private getCareerRecommendedAction(overall: number, clarity: number, exploration: number): string {
    if (clarity < 0.4) return 'Continue exploring your current career situation and what you truly want';
    if (exploration < 0.3) return 'Dive deeper into what energizes and excites you about work';
    if (overall >= 0.5) return 'Ready to create a personalized career development plan';
    return 'Keep building clarity about your career direction and values';
  }

  // Enhanced root cause identification with career context
  async identifyRootCauseCandidates(sessionId: string): Promise<RootCauseCandidate[]> {
    if (!this.initialized || !this.userId) return [];

    console.log('🎯 Identifying root cause candidates with career intelligence');

    if (this.domain === 'career') {
      return this.identifyCareerRootCauses(sessionId);
    }

    const [acsData, piePatterns, beliefMaps] = await Promise.all([
      this.getACSEmotionalResonance(sessionId),
      this.getPIESignificantPatterns(),
      this.getBeliefMapping(sessionId)
    ]);

    const candidates: RootCauseCandidate[] = [];

    // Extract potential root causes from conversation patterns
    const conversationThemes = await this.extractConversationThemes(sessionId);
    
    for (const theme of conversationThemes) {
      const candidate: RootCauseCandidate = {
        id: `root_cause_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        description: theme.description,
        confidence: this.calculateRootCauseConfidence(theme, piePatterns, beliefMaps),
        emotionalResonance: this.getEmotionalResonanceScore(theme, acsData),
        patternStrength: this.getPatternStrengthScore(theme, piePatterns),
        beliefMappingScore: this.getBeliefMappingScore(theme, beliefMaps),
        supportingEvidence: theme.supportingEvidence,
        requiredConfirmation: true
      };

      // Only include high-confidence candidates
      if (candidate.confidence >= 0.6) {
        candidates.push(candidate);
      }
    }

    // Sort by confidence and emotional resonance
    candidates.sort((a, b) => {
      const scoreA = (a.confidence * 0.4) + (a.emotionalResonance * 0.3) + (a.patternStrength * 0.3);
      const scoreB = (b.confidence * 0.4) + (b.emotionalResonance * 0.3) + (b.patternStrength * 0.3);
      return scoreB - scoreA;
    });

    console.log(`✅ Identified ${candidates.length} root cause candidates`);
    return candidates.slice(0, 3); // Return top 3 candidates
  }

  private async identifyCareerRootCauses(sessionId: string): Promise<RootCauseCandidate[]> {
    console.log('💼 Identifying career-specific root causes');

    const candidates: RootCauseCandidate[] = [];
    const careerMemories = await this.getCareerTMGMemories(sessionId);
    
    // Career-specific root cause patterns
    const careerRootCauses = [
      {
        pattern: /no\s+(career|job)/i,
        description: "Lack of career direction or employment",
        category: "career_foundation"
      },
      {
        pattern: /don't\s+know\s+what\s+I\s+want/i,
        description: "Unclear about career desires and direction",
        category: "career_clarity"
      },
      {
        pattern: /hate\s+(my\s+)?(job|work)/i,
        description: "Deep dissatisfaction with current work situation",
        category: "job_misalignment"
      },
      {
        pattern: /afraid\s+of\s+(change|failure|success)/i,
        description: "Fear blocking career progression",
        category: "career_fear"
      },
      {
        pattern: /not\s+good\s+enough/i,
        description: "Self-worth issues affecting career confidence",
        category: "career_confidence"
      }
    ];

    for (const rootCause of careerRootCauses) {
      const evidence = careerMemories.filter(memory => {
        const content = memory.raw_content?.content || '';
        return rootCause.pattern.test(content);
      });

      if (evidence.length >= 1) {
        candidates.push({
          id: `career_root_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          description: rootCause.description,
          confidence: Math.min(0.9, evidence.length * 0.3 + 0.4),
          emotionalResonance: evidence.reduce((sum, e) => sum + (e.importance_score || 5), 0) / (evidence.length * 10),
          patternStrength: evidence.length / careerMemories.length,
          beliefMappingScore: 0.7, // Career beliefs are typically strong
          supportingEvidence: evidence.map(e => e.raw_content?.content || '').slice(0, 3),
          requiredConfirmation: true
        });
      }
    }

    return candidates.sort((a, b) => b.confidence - a.confidence).slice(0, 3);
  }

  // Create belief mapping from TMG data
  async getBeliefMapping(sessionId: string): Promise<BeliefMapping> {
    if (!this.userId) return { coreBeliefs: [], beliefConflicts: [], rootCauseConnections: [] };

    try {
      // Get belief-related memories from TMG
      const beliefMemories = await tieredMemoryGraph.getFromHotMemory(this.userId, sessionId, 50);
      
      const coreBeliefs = this.extractCoreBeliefs(beliefMemories);
      const beliefConflicts = this.identifyBeliefConflicts(coreBeliefs);
      const rootCauseConnections = this.mapBeliefToRootCauses(coreBeliefs);

      return {
        coreBeliefs,
        beliefConflicts,
        rootCauseConnections
      };
    } catch (error) {
      console.error('Error creating belief mapping:', error);
      return { coreBeliefs: [], beliefConflicts: [], rootCauseConnections: [] };
    }
  }

  // Helper methods for calculation
  private async getACSMetrics(sessionId: string) {
    try {
      const metrics = adaptiveContextScheduler.getMetrics();
      return metrics || { conversationVelocity: 0.5, successRate: 0, averageLatency: 0, stateTransitions: 0, userRepairRate: 0, sentimentTrend: 0 };
    } catch (error) {
      console.warn('Could not get ACS metrics:', error);
      return { conversationVelocity: 0.5, successRate: 0, averageLatency: 0, stateTransitions: 0, userRepairRate: 0, sentimentTrend: 0 };
    }
  }

  private async getPIEPatterns() {
    try {
      if (!this.userId) return [];
      return await pieService.getCurrentInsights();
    } catch (error) {
      console.warn('Could not get PIE patterns:', error);
      return [];
    }
  }

  private async getTMGBeliefData(sessionId: string) {
    try {
      if (!this.userId) return [];
      return await tieredMemoryGraph.getFromHotMemory(this.userId, sessionId, 20);
    } catch (error) {
      console.warn('Could not get TMG belief data:', error);
      return [];
    }
  }

  private async getPersonalityAlignment() {
    try {
      if (!this.userId) return null;
      return await personalityVectorService.getVector(this.userId);
    } catch (error) {
      console.warn('Could not get personality vector:', error);
      return null;
    }
  }

  private calculateEmotionalDepth(acsMetrics: any): number {
    // Use available ACS metrics properties
    const emotionalIntensity = acsMetrics.emotionalIntensity || 0;
    const engagementScore = acsMetrics.engagementScore || 0;
    const combinedScore = (emotionalIntensity + engagementScore) / 2;
    return Math.min(1, combinedScore);
  }

  private calculatePatternDepth(pieInsights: any[]): number {
    if (pieInsights.length === 0) return 0;
    
    // Calculate based on insight confidence and priority
    const avgConfidence = pieInsights.reduce((sum, insight) => sum + insight.confidence, 0) / pieInsights.length;
    const highPriorityCount = pieInsights.filter(i => i.priority === 'high' || i.priority === 'critical').length;
    
    return Math.min(1, (avgConfidence * 0.7) + (highPriorityCount / pieInsights.length * 0.3));
  }

  private calculateBeliefDepth(tmgMemories: any[]): number {
    if (tmgMemories.length === 0) return 0;
    
    // Look for belief-related content and importance scores
    const beliefKeywords = ['believe', 'think', 'feel', 'always', 'never', 'should', 'must'];
    const beliefMemories = tmgMemories.filter(memory => {
      const content = memory.raw_content?.content?.toLowerCase() || '';
      return beliefKeywords.some(keyword => content.includes(keyword));
    });
    
    const avgImportance = beliefMemories.reduce((sum, mem) => sum + (mem.importance_score || 5), 0) / Math.max(beliefMemories.length, 1);
    return Math.min(1, (beliefMemories.length / Math.max(tmgMemories.length, 1)) * (avgImportance / 10));
  }

  private calculatePersonalityAlignment(personalityVector: Float32Array | null): number {
    if (!personalityVector) return 0.5; // Default alignment
    
    // Simple alignment score based on vector magnitude
    const magnitude = Math.sqrt(personalityVector.reduce((sum, val) => sum + val * val, 0));
    return Math.min(1, magnitude / personalityVector.length);
  }

  private isReadyForProgram(overall: number, emotional: number, pattern: number, belief: number): boolean {
    // Require minimum thresholds in all areas
    return overall >= 0.6 && emotional >= 0.5 && pattern >= 0.4 && belief >= 0.4;
  }

  private getNextRecommendedAction(overall: number, emotional: number, pattern: number, belief: number): string {
    if (overall < 0.3) return 'Continue building rapport and exploring surface challenges';
    if (emotional < 0.5) return 'Dive deeper into emotional aspects and personal impact';
    if (pattern < 0.4) return 'Explore recurring patterns and themes';
    if (belief < 0.4) return 'Investigate underlying beliefs and assumptions';
    if (overall >= 0.6) return 'Ready to identify and confirm root causes';
    return 'Continue deepening the conversation across all dimensions';
  }

  private async extractConversationThemes(sessionId: string) {
    // Extract themes from conversation using TMG
    if (!this.userId) return [];
    
    const memories = await tieredMemoryGraph.getFromHotMemory(this.userId, sessionId, 30);
    const themes: Array<{ description: string; supportingEvidence: string[] }> = [];
    
    // Simple theme extraction (would be enhanced with NLP)
    const commonChallenges = [
      'fear of failure', 'perfectionism', 'self-doubt', 'lack of confidence',
      'overwhelming expectations', 'people pleasing', 'imposter syndrome',
      'fear of judgment', 'procrastination', 'analysis paralysis'
    ];
    
    for (const challenge of commonChallenges) {
      const evidence = memories.filter(memory => {
        const content = memory.raw_content?.content?.toLowerCase() || '';
        return content.includes(challenge.toLowerCase()) || this.isRelatedContent(content, challenge);
      });
      
      if (evidence.length >= 2) {
        themes.push({
          description: `Core challenge around ${challenge}`,
          supportingEvidence: evidence.map(e => e.raw_content?.content || '').slice(0, 3)
        });
      }
    }
    
    return themes;
  }

  private isRelatedContent(content: string, challenge: string): boolean {
    // Simple keyword matching (would be enhanced with semantic similarity)
    const relatedTerms: { [key: string]: string[] } = {
      'fear of failure': ['afraid', 'scared', 'worried', 'fail', 'mistake'],
      'perfectionism': ['perfect', 'flawless', 'exactly right', 'not good enough'],
      'self-doubt': ['doubt', 'unsure', 'questioning', 'uncertain'],
      // Add more mappings...
    };
    
    const terms = relatedTerms[challenge] || [];
    return terms.some(term => content.includes(term));
  }

  private calculateRootCauseConfidence(theme: any, piePatterns: any[], beliefMaps: BeliefMapping): number {
    // Combine multiple confidence signals
    let confidence = 0.3; // Base confidence
    
    // Boost confidence based on supporting evidence
    confidence += Math.min(0.3, theme.supportingEvidence.length * 0.1);
    
    // Boost confidence based on PIE pattern alignment
    const relatedPatterns = piePatterns.filter(p => 
      p.title.toLowerCase().includes(theme.description.toLowerCase()) ||
      theme.description.toLowerCase().includes(p.title.toLowerCase())
    );
    confidence += Math.min(0.2, relatedPatterns.length * 0.1);
    
    // Boost confidence based on belief mapping connections
    const relatedBeliefs = beliefMaps.coreBeliefs.filter(b => 
      b.connectedChallenges.some(challenge => 
        challenge.toLowerCase().includes(theme.description.toLowerCase())
      )
    );
    confidence += Math.min(0.2, relatedBeliefs.length * 0.05);
    
    return Math.min(1, confidence);
  }

  private getEmotionalResonanceScore(theme: any, acsData: any): number {
    // Calculate emotional resonance based on ACS metrics when theme was discussed
    const emotionalIntensity = acsData.emotionalIntensity || 0;
    const engagementScore = acsData.engagementScore || 0;
    return Math.min(1, (emotionalIntensity + engagementScore) / 2);
  }

  private getPatternStrengthScore(theme: any, piePatterns: any[]): number {
    const relatedPatterns = piePatterns.filter(p => 
      p.title.toLowerCase().includes(theme.description.toLowerCase())
    );
    
    if (relatedPatterns.length === 0) return 0;
    
    const avgConfidence = relatedPatterns.reduce((sum, p) => sum + p.confidence, 0) / relatedPatterns.length;
    return avgConfidence;
  }

  private getBeliefMappingScore(theme: any, beliefMaps: BeliefMapping): number {
    const relatedConnections = beliefMaps.rootCauseConnections.filter(conn =>
      conn.rootCause.toLowerCase().includes(theme.description.toLowerCase())
    );
    
    if (relatedConnections.length === 0) return 0;
    
    const avgStrength = relatedConnections.reduce((sum, conn) => sum + conn.causalStrength, 0) / relatedConnections.length;
    return avgStrength;
  }

  private extractCoreBeliefs(memories: any[]) {
    // Extract core beliefs from conversation memories
    const beliefs: BeliefMapping['coreBeliefs'] = [];
    
    const beliefPatterns = [
      /I (always|never|can't|should|must|have to)/gi,
      /People (always|never|should|are)/gi,
      /Life is (hard|unfair|difficult|easy)/gi,
      /(Success|Money|Love|Happiness) (is|means|requires)/gi
    ];
    
    for (const memory of memories) {
      const content = memory.raw_content?.content || '';
      
      for (const pattern of beliefPatterns) {
        const matches = content.match(pattern);
        if (matches) {
          for (const match of matches) {
            beliefs.push({
              belief: match,
              strength: memory.importance_score / 10,
              isLimiting: this.isLimitingBelief(match),
              connectedChallenges: []
            });
          }
        }
      }
    }
    
    return beliefs.slice(0, 10); // Limit to top 10 beliefs
  }

  private isLimitingBelief(belief: string): boolean {
    const limitingWords = ['never', 'can\'t', 'always', 'impossible', 'too hard', 'not good enough'];
    return limitingWords.some(word => belief.toLowerCase().includes(word));
  }

  private identifyBeliefConflicts(coreBeliefs: BeliefMapping['coreBeliefs']) {
    const conflicts: BeliefMapping['beliefConflicts'] = [];
    
    for (let i = 0; i < coreBeliefs.length; i++) {
      for (let j = i + 1; j < coreBeliefs.length; j++) {
        const belief1 = coreBeliefs[i];
        const belief2 = coreBeliefs[j];
        
        // Simple conflict detection (would be enhanced with NLP)
        if (this.beliefsConflict(belief1.belief, belief2.belief)) {
          conflicts.push({
            belief1: belief1.belief,
            belief2: belief2.belief,
            conflictIntensity: (belief1.strength + belief2.strength) / 2
          });
        }
      }
    }
    
    return conflicts;
  }

  private beliefsConflict(belief1: string, belief2: string): boolean {
    // Simple conflict detection
    const opposites = [
      ['always', 'never'],
      ['can', 'can\'t'],
      ['should', 'shouldn\'t'],
      ['easy', 'hard'],
      ['good', 'bad']
    ];
    
    for (const [word1, word2] of opposites) {
      if ((belief1.includes(word1) && belief2.includes(word2)) ||
          (belief1.includes(word2) && belief2.includes(word1))) {
        return true;
      }
    }
    
    return false;
  }

  private mapBeliefToRootCauses(coreBeliefs: BeliefMapping['coreBeliefs']) {
    // Map beliefs to potential root causes
    return coreBeliefs
      .filter(belief => belief.isLimiting)
      .map(belief => ({
        rootCause: `Limiting belief: ${belief.belief}`,
        connectedBeliefs: [belief.belief],
        causalStrength: belief.strength
      }));
  }

  // Get PIE patterns with high significance
  private async getPIESignificantPatterns() {
    try {
      const insights = await this.getPIEPatterns();
      return insights.filter(insight => 
        insight.confidence >= 0.7 && 
        (insight.priority === 'high' || insight.priority === 'critical')
      );
    } catch (error) {
      console.warn('Could not get significant PIE patterns:', error);
      return [];
    }
  }

  private async getACSEmotionalResonance(sessionId: string) {
    try {
      const metrics = await this.getACSMetrics(sessionId);
      return {
        resonanceScore: (metrics.conversationVelocity || 0) + (metrics.successRate || 0),
        emotionalIntensity: metrics.conversationVelocity || 0,
        engagementLevel: metrics.successRate || 0
      };
    } catch (error) {
      console.warn('Could not get ACS emotional resonance:', error);
      return { resonanceScore: 0, emotionalIntensity: 0, engagementLevel: 0 };
    }
  }

  async cleanup(): Promise<void> {
    console.log('🧠 Cleaning up Growth Intelligence Fusion');
    this.initialized = false;
    this.userId = null;
    this.domain = null;
  }
}

export const growthIntelligenceFusionService = new GrowthIntelligenceFusionService();
