import { supabase } from '@/integrations/supabase/client';
import { LifeDomain, LifeWheelAssessment } from '@/types/growth-program';

interface DomainInterdependency {
  from_domain: string;
  to_domain: string;
  relationship_type: string;
  strength: number;
}

interface JourneyStep {
  step: number;
  domain: LifeDomain;
  reason: string;
  expectedImpact: number;
  prerequisites?: LifeDomain[];
}

interface ProgressiveJourneyPlan {
  startingDomain: LifeDomain;
  suggestedPath: JourneyStep[];
  estimatedTimeWeeks: number;
  totalExpectedImpact: number;
  riskFactors: string[];
  successMetrics: string[];
}

export class ProgressiveJourneyOrchestrator {
  private static interdependencies: DomainInterdependency[] = [];
  private static initialized = false;

  static async initialize() {
    if (this.initialized) return;
    
    try {
      const { data, error } = await supabase
        .from('domain_interdependencies')
        .select('*');
      
      if (error) throw error;
      this.interdependencies = data || [];
      this.initialized = true;
      
      console.log('✅ Progressive Journey Orchestrator initialized with', this.interdependencies.length, 'interdependencies');
    } catch (error) {
      console.error('❌ Error initializing Progressive Journey Orchestrator:', error);
    }
  }

  static async generateJourneyPlan(
    startingDomain: LifeDomain,
    currentAssessments: LifeWheelAssessment[] = [],
    maxSteps: number = 4
  ): Promise<ProgressiveJourneyPlan> {
    await this.initialize();

    const plan: ProgressiveJourneyPlan = {
      startingDomain,
      suggestedPath: [],
      estimatedTimeWeeks: 0,
      totalExpectedImpact: 0,
      riskFactors: [],
      successMetrics: []
    };

    // Step 1: Analyze starting domain
    const startingStep: JourneyStep = {
      step: 1,
      domain: startingDomain,
      reason: 'Primary focus area selected by user',
      expectedImpact: 8.0
    };
    plan.suggestedPath.push(startingStep);

    // Step 2: Find strongly connected domains
    const strongConnections = this.findStrongConnections(startingDomain, 0.7);
    
    // Step 3: Identify high-impact expansion opportunities
    const expansionOpportunities = this.identifyExpansionOpportunities(
      startingDomain,
      currentAssessments,
      strongConnections
    );

    // Step 4: Create progressive path
    const remainingSteps = Math.min(maxSteps - 1, expansionOpportunities.length);
    expansionOpportunities.slice(0, remainingSteps).forEach((opportunity, index) => {
      plan.suggestedPath.push({
        step: index + 2,
        domain: opportunity.domain,
        reason: opportunity.reason,
        expectedImpact: opportunity.impact,
        prerequisites: opportunity.prerequisites
      });
    });

    // Step 5: Calculate metrics
    plan.estimatedTimeWeeks = this.calculateTimeEstimate(plan.suggestedPath);
    plan.totalExpectedImpact = this.calculateTotalImpact(plan.suggestedPath);
    plan.riskFactors = this.identifyRiskFactors(plan.suggestedPath);
    plan.successMetrics = this.generateSuccessMetrics(plan.suggestedPath);

    return plan;
  }

  static getSuggestedNextDomains(
    completedDomains: LifeDomain[],
    currentAssessments: LifeWheelAssessment[] = [],
    limit: number = 3
  ): Array<{
    domain: LifeDomain;
    reason: string;
    strength: number;
    expectedImpact: number;
    dependencies: LifeDomain[];
  }> {
    if (!this.initialized) return [];

    const suggestions: Array<{
      domain: LifeDomain;
      reason: string;
      strength: number;
      expectedImpact: number;
      dependencies: LifeDomain[];
    }> = [];

    // Find interdependencies from completed domains
    completedDomains.forEach(completedDomain => {
      const connections = this.interdependencies.filter(
        dep => dep.from_domain === completedDomain && 
               !completedDomains.includes(dep.to_domain as LifeDomain) &&
               dep.strength > 0.5
      );

      connections.forEach(connection => {
        const existingSuggestion = suggestions.find(s => s.domain === connection.to_domain);
        
        if (existingSuggestion) {
          // Strengthen existing suggestion
          existingSuggestion.strength = Math.max(existingSuggestion.strength, connection.strength);
          existingSuggestion.dependencies.push(completedDomain);
        } else {
          // Add new suggestion
          suggestions.push({
            domain: connection.to_domain as LifeDomain,
            reason: this.generateSuggestionReason(connection),
            strength: connection.strength,
            expectedImpact: this.calculateExpectedImpact(connection, currentAssessments),
            dependencies: [completedDomain]
          });
        }
      });
    });

    // Sort by strength and impact, return top suggestions
    return suggestions
      .sort((a, b) => (b.strength * b.expectedImpact) - (a.strength * a.expectedImpact))
      .slice(0, limit);
  }

  static analyzeJourneyProgress(
    completedAssessments: LifeWheelAssessment[],
    journeyPlan: ProgressiveJourneyPlan
  ): {
    completionPercentage: number;
    nextRecommendedDomain: LifeDomain | null;
    progressInsights: string[];
    shouldAdjustPlan: boolean;
    adjustmentReasons?: string[];
  } {
    const completedDomains = completedAssessments.map(a => a.domain);
    const plannedDomains = journeyPlan.suggestedPath.map(step => step.domain);
    
    const completionPercentage = (completedDomains.length / plannedDomains.length) * 100;
    
    // Find next recommended domain from plan
    const nextStep = journeyPlan.suggestedPath.find(
      step => !completedDomains.includes(step.domain)
    );
    
    const progressInsights = this.generateProgressInsights(
      completedAssessments,
      journeyPlan
    );

    // Determine if plan should be adjusted
    const shouldAdjustPlan = this.shouldAdjustPlan(completedAssessments, journeyPlan);
    const adjustmentReasons = shouldAdjustPlan ? 
      this.getAdjustmentReasons(completedAssessments, journeyPlan) : undefined;

    return {
      completionPercentage: Math.round(completionPercentage),
      nextRecommendedDomain: nextStep?.domain || null,
      progressInsights,
      shouldAdjustPlan,
      adjustmentReasons
    };
  }

  private static findStrongConnections(domain: LifeDomain, threshold: number = 0.6): DomainInterdependency[] {
    return this.interdependencies.filter(
      dep => dep.from_domain === domain && dep.strength >= threshold
    );
  }

  private static identifyExpansionOpportunities(
    startingDomain: LifeDomain,
    currentAssessments: LifeWheelAssessment[],
    connections: DomainInterdependency[]
  ): Array<{
    domain: LifeDomain;
    reason: string;
    impact: number;
    prerequisites?: LifeDomain[];
  }> {
    const opportunities: Array<{
      domain: LifeDomain;
      reason: string;
      impact: number;
      prerequisites?: LifeDomain[];
    }> = [];

    connections.forEach(connection => {
      const targetDomain = connection.to_domain as LifeDomain;
      const assessment = currentAssessments.find(a => a.domain === targetDomain);
      
      // Calculate impact based on gap and connection strength
      const gap = assessment ? 
        (assessment.desired_score - assessment.current_score) : 3; // Default gap
      const impact = (gap * connection.strength * 2);
      
      opportunities.push({
        domain: targetDomain,
        reason: this.generateExpansionReason(connection, gap),
        impact,
        prerequisites: [startingDomain]
      });
    });

    return opportunities.sort((a, b) => b.impact - a.impact);
  }

  private static generateExpansionReason(connection: DomainInterdependency, gap: number): string {
    const relationshipReasons = {
      'synergistic': `Strong synergy with ${connection.from_domain.replace('_', ' ')} creates compound growth`,
      'foundational': `Provides essential foundation for ${connection.from_domain.replace('_', ' ')} improvements`,
      'amplifying': `Amplifies progress in ${connection.from_domain.replace('_', ' ')} through positive feedback`,
      'supporting': `Supports and stabilizes gains in ${connection.from_domain.replace('_', ' ')}`,
      'enabling': `Enables breakthrough potential in ${connection.from_domain.replace('_', ' ')}`
    };

    const baseReason = relationshipReasons[connection.relationship_type as keyof typeof relationshipReasons] ||
      `Closely connected to ${connection.from_domain.replace('_', ' ')}`;

    if (gap > 4) {
      return `${baseReason} • High growth potential (${gap}-point gap)`;
    } else if (gap > 2) {
      return `${baseReason} • Moderate improvement opportunity`;
    } else {
      return `${baseReason} • Optimization opportunity`;
    }
  }

  private static generateSuggestionReason(connection: DomainInterdependency): string {
    const templates = {
      'synergistic': `Creates powerful synergy with your ${connection.from_domain.replace('_', ' ')} focus`,
      'foundational': `Provides key foundation to support your ${connection.from_domain.replace('_', ' ')} growth`,
      'amplifying': `Amplifies your progress in ${connection.from_domain.replace('_', ' ')}`,
      'supporting': `Supports and reinforces your ${connection.from_domain.replace('_', ' ')} improvements`
    };

    return templates[connection.relationship_type as keyof typeof templates] ||
      `Highly connected to your ${connection.from_domain.replace('_', ' ')} development`;
  }

  private static calculateExpectedImpact(
    connection: DomainInterdependency,
    assessments: LifeWheelAssessment[]
  ): number {
    const targetAssessment = assessments.find(a => a.domain === connection.to_domain);
    const gap = targetAssessment ? 
      (targetAssessment.desired_score - targetAssessment.current_score) : 3;
    
    // Impact = gap * connection strength * relationship multiplier
    const relationshipMultipliers = {
      'synergistic': 1.5,
      'foundational': 1.3,
      'amplifying': 1.4,
      'supporting': 1.2,
      'enabling': 1.6
    };

    const multiplier = relationshipMultipliers[connection.relationship_type as keyof typeof relationshipMultipliers] || 1.0;
    
    return Math.min(10, gap * connection.strength * multiplier);
  }

  private static calculateTimeEstimate(path: JourneyStep[]): number {
    // Base time: 2 weeks per domain
    const baseTime = path.length * 2;
    
    // Add complexity based on interdependencies
    const complexityBonus = path.filter(step => step.prerequisites && step.prerequisites.length > 1).length;
    
    return baseTime + complexityBonus;
  }

  private static calculateTotalImpact(path: JourneyStep[]): number {
    return path.reduce((total, step) => total + step.expectedImpact, 0) / path.length;
  }

  private static identifyRiskFactors(path: JourneyStep[]): string[] {
    const risks: string[] = [];
    
    if (path.length > 4) {
      risks.push('Complex journey may require sustained commitment');
    }
    
    const hasHighDependencies = path.some(step => step.prerequisites && step.prerequisites.length > 2);
    if (hasHighDependencies) {
      risks.push('Some domains have multiple prerequisites that need attention');
    }
    
    const averageImpact = path.reduce((sum, step) => sum + step.expectedImpact, 0) / path.length;
    if (averageImpact < 6) {
      risks.push('Moderate expected impact - consider focusing on higher-leverage areas');
    }
    
    return risks;
  }

  private static generateSuccessMetrics(path: JourneyStep[]): string[] {
    return [
      `Complete assessment for all ${path.length} domains`,
      `Achieve 2+ point improvement in primary domain`,
      `Establish consistent practices across interconnected areas`,
      `Maintain progress momentum for ${this.calculateTimeEstimate(path)} weeks`
    ];
  }

  private static generateProgressInsights(
    assessments: LifeWheelAssessment[],
    plan: ProgressiveJourneyPlan
  ): string[] {
    const insights: string[] = [];
    const completedCount = assessments.length;
    const totalCount = plan.suggestedPath.length;
    
    if (completedCount === 1) {
      insights.push(`Great start! You've established your foundation in ${plan.startingDomain.replace('_', ' ')}`);
    } else if (completedCount === totalCount) {
      insights.push('Congratulations! You\'ve completed your progressive journey assessment');
    } else {
      insights.push(`Strong progress! ${completedCount} of ${totalCount} domains assessed`);
    }
    
    // Analyze gaps and patterns
    const highGaps = assessments.filter(a => (a.desired_score - a.current_score) > 3);
    if (highGaps.length > 0) {
      insights.push(`${highGaps.length} domains show high growth potential (3+ point gaps)`);
    }
    
    return insights;
  }

  private static shouldAdjustPlan(
    assessments: LifeWheelAssessment[],
    plan: ProgressiveJourneyPlan
  ): boolean {
    // Check if actual assessments reveal different priorities
    const highPriorityDomains = assessments
      .filter(a => (a.desired_score - a.current_score) * a.importance_rating > 20)
      .map(a => a.domain);
    
    const plannedDomains = plan.suggestedPath.slice(1).map(step => step.domain);
    
    // If high-priority domains aren't in the plan, suggest adjustment
    return highPriorityDomains.some(domain => !plannedDomains.includes(domain));
  }

  private static getAdjustmentReasons(
    assessments: LifeWheelAssessment[],
    plan: ProgressiveJourneyPlan
  ): string[] {
    const reasons: string[] = [];
    
    const highPriorityDomains = assessments
      .filter(a => (a.desired_score - a.current_score) * a.importance_rating > 20)
      .map(a => a.domain);
    
    const plannedDomains = plan.suggestedPath.slice(1).map(step => step.domain);
    const missingPriorities = highPriorityDomains.filter(domain => !plannedDomains.includes(domain));
    
    if (missingPriorities.length > 0) {
      reasons.push(`High-priority domains emerged: ${missingPriorities.map(d => d.replace('_', ' ')).join(', ')}`);
    }
    
    return reasons;
  }
}