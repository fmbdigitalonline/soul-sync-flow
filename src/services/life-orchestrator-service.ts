/**
 * Life Orchestrator Service - Core Life Operating System
 * Manages multi-domain gap analysis, prioritization, and coordination
 */

import { supabase } from '@/integrations/supabase/client';
import { openAIAgentOrchestrator } from './openai-agent-orchestrator';
import { blueprintEmbeddingService } from './blueprint-embedding-service';
import { LayeredBlueprint } from '@/types/personality-modules';
import { 
  LifeDomain, 
  LifeWheelAssessment, 
  DomainGap, 
  DomainSynergy, 
  LifeOrchestratorPlan,
  DomainInterdependency 
} from '@/types/growth-program';

export class LifeOrchestratorService {
  // Core Life Wheel Management
  async getUserLifeWheel(userId: string): Promise<LifeWheelAssessment[]> {
    console.log('🎯 Fetching user life wheel assessments');
    
    const { data, error } = await supabase
      .from('life_wheel_assessments')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('❌ Error fetching life wheel:', error);
      throw error;
    }

    return (data || []) as LifeWheelAssessment[];
  }

  async updateDomainAssessment(
    userId: string,
    domain: LifeDomain,
    current_score: number,
    desired_score: number,
    importance_rating: number = 5,
    notes?: string
  ): Promise<LifeWheelAssessment> {
    console.log(`🔄 Updating assessment for domain: ${domain}`);

    // Check if assessment exists
    const { data: existing } = await supabase
      .from('life_wheel_assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('domain', domain)
      .maybeSingle();

    const assessmentData = {
      user_id: userId,
      domain,
      current_score,
      desired_score,
      importance_rating,
      notes
    };

    if (existing) {
      // Update existing assessment
      const { data, error } = await supabase
        .from('life_wheel_assessments')
        .update(assessmentData)
        .eq('id', existing.id)
        .select()
        .single();

      if (error) throw error;
      return data as LifeWheelAssessment;
    } else {
      // Create new assessment
      const { data, error } = await supabase
        .from('life_wheel_assessments')
        .insert(assessmentData)
        .select()
        .single();

      if (error) throw error;
      return data as LifeWheelAssessment;
    }
  }

  // Gap Analysis Engine
  async calculateDomainGaps(userId: string): Promise<DomainGap[]> {
    console.log('📊 Calculating domain gaps with priority scoring');

    const [assessments, blueprint, interdependencies] = await Promise.all([
      this.getUserLifeWheel(userId),
      this.getUserBlueprint(userId),
      this.getDomainInterdependencies()
    ]);

    const gaps: DomainGap[] = [];

    for (const assessment of assessments) {
      if (assessment.gap_size <= 0) continue; // Skip domains that don't need improvement

      const blueprintAlignment = await this.calculateBlueprintAlignment(
        assessment.domain,
        blueprint
      );

      const interdependencyBoost = this.calculateInterdependencyBoost(
        assessment.domain,
        assessments,
        interdependencies
      );

      // Priority formula: (Gap Size * 0.4) + (Importance * 0.3) + (Blueprint Match * 0.2) + (Interdependency Boost * 0.1)
      const priority_score = 
        (assessment.gap_size * 0.4) +
        (assessment.importance_rating * 0.3) +
        (blueprintAlignment * 0.2) +
        (interdependencyBoost * 0.1);

      gaps.push({
        domain: assessment.domain,
        current_score: assessment.current_score,
        desired_score: assessment.desired_score,
        gap_size: assessment.gap_size,
        importance_rating: assessment.importance_rating,
        priority_score,
        blueprint_alignment: blueprintAlignment,
        interdependency_boost: interdependencyBoost
      });
    }

    return gaps.sort((a, b) => b.priority_score - a.priority_score);
  }

  // Life Orchestrator Planning
  async generateLifeOrchestratorPlan(
    userId: string,
    maxDomains: number = 3
  ): Promise<LifeOrchestratorPlan> {
    console.log('🎭 Generating Life Orchestrator Plan');

    const [gaps, blueprint, synergies] = await Promise.all([
      this.calculateDomainGaps(userId),
      this.getUserBlueprint(userId),
      this.analyzeDomainSynergies(userId)
    ]);

    // Get top gaps (limited by maxDomains)
    const topGaps = gaps.slice(0, maxDomains);
    const recommendedFocus = topGaps.map(gap => gap.domain);

    // Find synergy opportunities among selected domains
    const synergyOpportunities = synergies.filter(synergy =>
      recommendedFocus.includes(synergy.from_domain) &&
      recommendedFocus.includes(synergy.to_domain)
    );

    // Use Life Orchestrator Agent to create strategy
    const agentPlan = await this.orchestrateMultiDomainStrategy(
      topGaps,
      blueprint,
      synergyOpportunities
    );

    return {
      top_gaps: topGaps,
      recommended_focus: recommendedFocus,
      synergy_opportunities: synergyOpportunities,
      multi_domain_strategy: agentPlan.strategy,
      reasoning: agentPlan.reasoning
    };
  }

  // Private Helper Methods
  private async getUserBlueprint(userId: string): Promise<LayeredBlueprint | null> {
    const { data, error } = await supabase
      .from('blueprints')
      .select('*')
      .eq('user_id', userId)
      .eq('is_active', true)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    // Transform to LayeredBlueprint format (simplified for now)
    return {
      cognitiveTemperamental: data.cognition_mbti || {},
      energyDecisionStrategy: data.energy_strategy_human_design || {},
      motivationBeliefEngine: data.bashar_suite || {},
      coreValuesNarrative: data.values_life_path || {},
      publicArchetype: data.archetype_western || {},
      generationalCode: data.archetype_chinese || {},
      // ... other blueprint fields with defaults
    } as LayeredBlueprint;
  }

  private async getDomainInterdependencies(): Promise<DomainInterdependency[]> {
    const { data, error } = await supabase
      .from('domain_interdependencies')
      .select('*');

    if (error) {
      console.error('❌ Error fetching interdependencies:', error);
      return [];
    }

    return (data || []) as DomainInterdependency[];
  }

  private async calculateBlueprintAlignment(
    domain: LifeDomain,
    blueprint: LayeredBlueprint | null
  ): Promise<number> {
    if (!blueprint) return 5.0; // Default neutral alignment

    // Simple alignment calculation based on blueprint data
    // This would be more sophisticated in production
    const domainAlignmentMap: Record<LifeDomain, number> = {
      'career': blueprint.energyDecisionStrategy?.energyType === 'Generator' ? 8.0 : 6.0,
      'relationships': blueprint.cognitiveTemperamental?.mbtiType?.includes('F') ? 8.0 : 6.0,
      'creativity': blueprint.publicArchetype?.sunSign ? 7.0 : 5.0,
      'spirituality': 7.0,
      'health': 8.0,
      'energy': 9.0,
      'finances': 6.0,
      'wellbeing': 7.0,
      'home_family': 6.0,
      'personal_growth': 8.0,
      'productivity': 7.0,
      'stress': 5.0,
      'education_learning': 7.0,
      'social_community': blueprint.cognitiveTemperamental?.mbtiType?.includes('E') ? 8.0 : 6.0,
      'recreation_fun': 6.0,
      'environment_living': 6.0,
      'contribution_service': blueprint.cognitiveTemperamental?.mbtiType?.includes('F') ? 8.0 : 6.0,
      'adventure_travel': 6.0,
      'physical_fitness': 7.0
    };

    return domainAlignmentMap[domain] || 5.0;
  }

  private calculateInterdependencyBoost(
    domain: LifeDomain,
    assessments: LifeWheelAssessment[],
    interdependencies: DomainInterdependency[]
  ): number {
    // Calculate boost based on other domains that support this one
    let boost = 0;

    for (const dep of interdependencies) {
      if (dep.to_domain === domain && dep.relationship_type === 'supports') {
        const fromAssessment = assessments.find(a => a.domain === dep.from_domain);
        if (fromAssessment && fromAssessment.current_score > 6) {
          boost += dep.strength * 2; // Higher scores in supporting domains boost this domain
        }
      }
    }

    return Math.min(boost, 5.0); // Cap at 5.0
  }

  private async analyzeDomainSynergies(userId: string): Promise<DomainSynergy[]> {
    const interdependencies = await this.getDomainInterdependencies();
    
    return interdependencies.map(dep => ({
      from_domain: dep.from_domain,
      to_domain: dep.to_domain,
      relationship_type: dep.relationship_type,
      strength: dep.strength
    }));
  }

  private async orchestrateMultiDomainStrategy(
    topGaps: DomainGap[],
    blueprint: LayeredBlueprint | null,
    synergies: DomainSynergy[]
  ): Promise<{ strategy: any; reasoning: string }> {
    console.log('🤖 Using Life Orchestrator Agent for multi-domain strategy');

    try {
      const response = await openAIAgentOrchestrator.runAgent('life_orchestrator', [
        {
          role: 'user',
          content: `Generate a multi-domain growth strategy:\n\nTop Gaps: ${JSON.stringify(topGaps, null, 2)}\nBlueprint Context: ${JSON.stringify(blueprint?.cognitiveTemperamental, null, 2)}\nDomain Synergies: ${JSON.stringify(synergies, null, 2)}\n\nCreate a coordinated approach that:\n1. Prioritizes the highest-leverage domain as primary\n2. Identifies 1-2 supporting domains that create synergy\n3. Suggests a timeline and coordination approach\n4. Explains the reasoning behind the strategy\n\nReturn JSON format:\n{\n  "primary_domain": "domain_name",\n  "supporting_domains": ["domain1", "domain2"],\n  "timeline_weeks": 8,\n  "coordination_approach": "description"\n}`
        }
      ]);

      // Parse the agent response
      const parsed = this.parseAgentResponse(response);
      
      return {
        strategy: {
          primary_domain: parsed.primary_domain || topGaps[0]?.domain,
          supporting_domains: parsed.supporting_domains || [],
          timeline_weeks: parsed.timeline_weeks || 8,
          coordination_approach: parsed.coordination_approach || 'Sequential focus with synergy tracking'
        },
        reasoning: response
      };

    } catch (error) {
      console.error('❌ Agent orchestration failed:', error);
      
      // Fallback strategy
      return {
        strategy: {
          primary_domain: topGaps[0]?.domain || 'wellbeing',
          supporting_domains: topGaps.slice(1, 3).map(g => g.domain),
          timeline_weeks: 8,
          coordination_approach: 'Focus on highest-priority domain with gradual integration of supporting areas'
        },
        reasoning: 'Generated fallback strategy due to agent unavailability'
      };
    }
  }

  private parseAgentResponse(response: string): any {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    } catch (error) {
      console.warn('⚠️ Failed to parse agent response as JSON');
    }
    
    return {}; // Return empty object as fallback
  }

  // Check if user needs life wheel assessment
  async needsLifeWheelAssessment(userId: string): Promise<boolean> {
    const assessments = await this.getUserLifeWheel(userId);
    return assessments.length === 0;
  }

  // Get suggested domains for initial assessment
  getSuggestedDomains(): LifeDomain[] {
    return [
      'career',
      'relationships', 
      'finances',
      'health',
      'personal_growth',
      'spirituality',
      'creativity',
      'wellbeing',
      'energy',
      'home_family',
      'social_community',
      'recreation_fun',
      'education_learning',
      'contribution_service',
      'physical_fitness',
      'environment_living',
      'adventure_travel',
      'productivity',
      'stress'
    ];
  }
}

export const lifeOrchestratorService = new LifeOrchestratorService();
