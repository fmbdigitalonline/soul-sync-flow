
import { supabase } from "@/integrations/supabase/client";
import { growthProgramService } from "./growth-program-service";
import { LifeDomain, GrowthProgram } from "@/types/growth-program";

interface BeliefData {
  domain: LifeDomain;
  conversations: any[];
  keyInsights: string[];
  coreChallenges: string[];
  rootCauses: string[];
}

// Create a minimal blueprint type for the growth program
interface BasicBlueprint {
  cognitiveTemperamental: {
    mbtiType: string;
    cognitiveStrengths: string[];
    temperamentTraits: string[];
  };
  energyDecisionStrategy: {
    humanDesignType: string;
    authority: string;
    strategy: string;
  };
  coreValuesNarrative: {
    lifePath: string;
    expressionNumber: string;
    personalityNumber: string;
    coreValues: string[];
  };
}

class GrowthProgramGenerationService {
  async generateProgram(
    userId: string, 
    domain: LifeDomain, 
    beliefData: BeliefData
  ): Promise<GrowthProgram> {
    console.log('🌱 Starting growth program generation for:', { userId, domain });
    
    try {
      // 1. Get user's blueprint for personalization
      const blueprint = await this.getUserBlueprint(userId);
      
      // 2. Create the base growth program
      const program = await growthProgramService.createProgram(
        userId,
        domain,
        blueprint as any // Type assertion for now
      );
      
      // 3. Customize program based on belief data
      const customizedProgram = await this.customizeProgram(program, beliefData);
      
      // 4. Activate the program
      await this.activateProgram(customizedProgram.id);
      
      console.log('✅ Growth program generation complete:', customizedProgram.id);
      return customizedProgram;
      
    } catch (error) {
      console.error('❌ Error in growth program generation:', error);
      throw new Error('Failed to generate growth program');
    }
  }

  private async getUserBlueprint(userId: string): Promise<BasicBlueprint> {
    // Try to get user's existing blueprint
    const { data: blueprintData, error } = await supabase
      .from('user_blueprints')
      .select('blueprint')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error('Error fetching blueprint:', error);
    }

    // If no blueprint found, create a basic one
    if (!blueprintData?.blueprint) {
      console.log('No blueprint found, creating basic blueprint for growth program');
      return this.createBasicBlueprint();
    }

    return this.extractBasicBlueprint(blueprintData.blueprint);
  }

  private createBasicBlueprint(): BasicBlueprint {
    // Create a basic blueprint for users without complete personality data
    return {
      cognitiveTemperamental: {
        mbtiType: 'ENFP', // Default to growth-oriented type
        cognitiveStrengths: ['Intuition', 'Feeling'],
        temperamentTraits: ['Optimistic', 'Adaptable']
      },
      energyDecisionStrategy: {
        humanDesignType: 'Generator',
        authority: 'Sacral',
        strategy: 'Respond to life'
      },
      coreValuesNarrative: {
        lifePath: '3',
        expressionNumber: '5',
        personalityNumber: '1',
        coreValues: ['Growth', 'Authenticity', 'Connection']
      }
    };
  }

  private extractBasicBlueprint(fullBlueprint: any): BasicBlueprint {
    return {
      cognitiveTemperamental: {
        mbtiType: fullBlueprint?.cognitiveTemperamental?.mbtiType || 'ENFP',
        cognitiveStrengths: fullBlueprint?.cognitiveTemperamental?.cognitiveStrengths || ['Intuition', 'Feeling'],
        temperamentTraits: fullBlueprint?.cognitiveTemperamental?.temperamentTraits || ['Optimistic', 'Adaptable']
      },
      energyDecisionStrategy: {
        humanDesignType: fullBlueprint?.energyDecisionStrategy?.humanDesignType || 'Generator',
        authority: fullBlueprint?.energyDecisionStrategy?.authority || 'Sacral',
        strategy: fullBlueprint?.energyDecisionStrategy?.strategy || 'Respond to life'
      },
      coreValuesNarrative: {
        lifePath: fullBlueprint?.coreValuesNarrative?.lifePath?.toString() || '3',
        expressionNumber: fullBlueprint?.coreValuesNarrative?.expressionNumber?.toString() || '5',
        personalityNumber: fullBlueprint?.coreValuesNarrative?.personalityNumber?.toString() || '1',
        coreValues: fullBlueprint?.coreValuesNarrative?.coreValues || ['Growth', 'Authenticity', 'Connection']
      }
    };
  }

  private async customizeProgram(
    program: GrowthProgram, 
    beliefData: BeliefData
  ): Promise<GrowthProgram> {
    console.log('🎨 Customizing program based on belief data');
    
    // Extract customization insights from belief data
    const customizations = this.extractCustomizations(beliefData);
    
    // Update program with customizations
    const updatedProgram = {
      ...program,
      blueprint_params: {
        ...program.blueprint_params,
        customizations,
        beliefInsights: beliefData.keyInsights,
        coreChallenges: beliefData.coreChallenges,
        rootCauses: beliefData.rootCauses
      }
    };

    // Save customizations to database
    await growthProgramService.updateProgramProgress(program.id, {
      blueprint_params: updatedProgram.blueprint_params
    });

    return updatedProgram;
  }

  private extractCustomizations(beliefData: BeliefData) {
    const { keyInsights, coreChallenges, rootCauses } = beliefData;
    
    return {
      focusAreas: this.identifyFocusAreas(keyInsights, coreChallenges),
      intensityLevel: this.determineIntensityLevel(coreChallenges),
      supportNeeds: this.determineSupportNeeds(rootCauses),
      pacePreference: this.determinePacePreference(beliefData.conversations)
    };
  }

  private identifyFocusAreas(insights: string[], challenges: string[]): string[] {
    const focusAreas = [];
    const combinedText = [...insights, ...challenges].join(' ').toLowerCase();
    
    // Simple keyword analysis - could be enhanced with AI
    if (combinedText.includes('confidence') || combinedText.includes('self-doubt')) {
      focusAreas.push('confidence_building');
    }
    if (combinedText.includes('fear') || combinedText.includes('anxiety')) {
      focusAreas.push('fear_processing');
    }
    if (combinedText.includes('habit') || combinedText.includes('routine')) {
      focusAreas.push('habit_formation');
    }
    if (combinedText.includes('relationship') || combinedText.includes('connection')) {
      focusAreas.push('relationship_patterns');
    }
    
    return focusAreas.length > 0 ? focusAreas : ['general_growth'];
  }

  private determineIntensityLevel(challenges: string[]): 'gentle' | 'moderate' | 'intensive' {
    const challengeText = challenges.join(' ').toLowerCase();
    
    if (challengeText.includes('overwhelm') || challengeText.includes('stress')) {
      return 'gentle';
    }
    if (challengeText.includes('ready') || challengeText.includes('committed')) {
      return 'intensive';
    }
    
    return 'moderate';
  }

  private determineSupportNeeds(rootCauses: string[]): string[] {
    const supportNeeds = [];
    const causeText = rootCauses.join(' ').toLowerCase();
    
    if (causeText.includes('alone') || causeText.includes('isolated')) {
      supportNeeds.push('community');
    }
    if (causeText.includes('guidance') || causeText.includes('direction')) {
      supportNeeds.push('mentorship');
    }
    if (causeText.includes('accountability') || causeText.includes('consistent')) {
      supportNeeds.push('accountability');
    }
    
    return supportNeeds.length > 0 ? supportNeeds : ['self_guided'];
  }

  private determinePacePreference(conversations: any[]): 'slow' | 'steady' | 'rapid' {
    // Analyze conversation patterns to determine preferred pace
    const totalMessages = conversations.length;
    if (totalMessages === 0) return 'steady';
    
    const avgMessageLength = conversations.reduce((acc, conv) => {
      return acc + (conv.content?.length || 0);
    }, 0) / totalMessages;

    // More detailed responses suggest preference for depth over speed
    if (avgMessageLength > 200) return 'slow';
    if (avgMessageLength > 100) return 'steady';
    return 'rapid';
  }

  private async activateProgram(programId: string): Promise<void> {
    console.log('🔥 Activating growth program:', programId);
    
    await growthProgramService.updateProgramProgress(programId, {
      status: 'active'
    });
  }
}

export const growthProgramGenerationService = new GrowthProgramGenerationService();
