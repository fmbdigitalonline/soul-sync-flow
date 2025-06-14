
import { LayeredBlueprint } from '@/types/personality-modules';

export interface CommunicationStyle {
  responseStructure: 'concrete' | 'abstract' | 'story-driven' | 'analytical';
  informationDelivery: 'direct' | 'exploratory' | 'supportive' | 'challenging';
  questioningStyle: 'scenario-based' | 'reflective' | 'action-oriented' | 'conceptual';
  validationApproach: 'strength-focused' | 'growth-focused' | 'pattern-focused' | 'solution-focused';
  examplePreference: 'specific-scenarios' | 'metaphors' | 'step-by-step' | 'big-picture';
  responseLength: 'brief' | 'moderate' | 'detailed';
  tonality: 'warm-friend' | 'wise-guide' | 'direct-coach' | 'curious-explorer';
}

export class CommunicationStyleAdapter {
  
  static detectCommunicationStyle(blueprint: Partial<LayeredBlueprint>): CommunicationStyle {
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    const dominantFunction = blueprint.cognitiveTemperamental?.dominantFunction;
    const auxiliaryFunction = blueprint.cognitiveTemperamental?.auxiliaryFunction;
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType;
    const authority = blueprint.energyDecisionStrategy?.authority;
    const communicationPref = blueprint.cognitiveTemperamental?.communicationStyle;

    // Detect scenario-based thinkers (Ne dominants like ENFPs, ENTPs)
    const isScenarioThinker = dominantFunction?.includes('Ne') || 
                             mbtiType?.startsWith('ENF') || 
                             mbtiType?.startsWith('ENT');

    // Detect concrete processors (Se dominants, Si users)
    const isConcreteThinker = dominantFunction?.includes('Se') || 
                             auxiliaryFunction?.includes('Si') ||
                             mbtiType?.includes('S');

    // Detect reflective processors (Fi, Ni dominants)
    const isReflectiveThinker = dominantFunction?.includes('Fi') || 
                               dominantFunction?.includes('Ni') ||
                               mbtiType?.includes('INF');

    // Detect analytical processors (Ti, Te dominants)
    const isAnalyticalThinker = dominantFunction?.includes('Ti') || 
                               dominantFunction?.includes('Te') ||
                               mbtiType?.includes('NT');

    return {
      responseStructure: isScenarioThinker ? 'concrete' : 
                        isAnalyticalThinker ? 'analytical' : 
                        isReflectiveThinker ? 'story-driven' : 'abstract',
      
      informationDelivery: hdType === 'Projector' ? 'direct' :
                          isAnalyticalThinker ? 'challenging' :
                          isReflectiveThinker ? 'supportive' : 'exploratory',
      
      questioningStyle: isScenarioThinker ? 'scenario-based' :
                       isAnalyticalThinker ? 'action-oriented' :
                       isReflectiveThinker ? 'reflective' : 'conceptual',
      
      validationApproach: isScenarioThinker ? 'strength-focused' :
                         isAnalyticalThinker ? 'solution-focused' :
                         isReflectiveThinker ? 'growth-focused' : 'pattern-focused',
      
      examplePreference: isScenarioThinker ? 'specific-scenarios' :
                        isConcreteThinker ? 'step-by-step' :
                        isReflectiveThinker ? 'metaphors' : 'big-picture',
      
      responseLength: isScenarioThinker ? 'brief' :
                     isAnalyticalThinker ? 'moderate' :
                     isReflectiveThinker ? 'detailed' : 'moderate',
      
      tonality: hdType === 'Projector' ? 'direct-coach' :
               isReflectiveThinker ? 'wise-guide' :
               isScenarioThinker ? 'warm-friend' : 'curious-explorer'
    };
  }

  static generateCommunicationInstructions(style: CommunicationStyle): string {
    const instructions = [];

    // Response Structure
    if (style.responseStructure === 'concrete') {
      instructions.push("ALWAYS provide specific scenarios and real-world examples before abstract concepts");
      instructions.push("Start with 'Here's a situation where...' or 'Think of when...'");
      instructions.push("Ground every insight in a concrete example they can visualize");
    } else if (style.responseStructure === 'analytical') {
      instructions.push("Structure responses with clear logic flow: premise → analysis → conclusion");
      instructions.push("Use bullet points for complex information");
      instructions.push("Provide frameworks and systematic approaches");
    } else if (style.responseStructure === 'story-driven') {
      instructions.push("Use narrative elements and metaphors to convey insights");
      instructions.push("Connect ideas through storytelling rather than lists");
      instructions.push("Paint pictures with words to help them feel the concept");
    }

    // Information Delivery
    if (style.informationDelivery === 'direct') {
      instructions.push("Be confident and definitive in your statements");
      instructions.push("Avoid hedging with 'maybe' or 'perhaps'");
      instructions.push("State insights as empowering truths about their nature");
    } else if (style.informationDelivery === 'supportive') {
      instructions.push("Validate their feelings before offering insights");
      instructions.push("Use gentle, encouraging language");
      instructions.push("Create safe space for exploration");
    }

    // Questioning Style
    if (style.questioningStyle === 'scenario-based') {
      instructions.push("Ask questions that anchor in specific situations");
      instructions.push("Use: 'When was the last time...' 'Think of a moment when...'");
      instructions.push("Help them explore through concrete examples rather than abstract reflection");
    } else if (style.questioningStyle === 'action-oriented') {
      instructions.push("Focus questions on next steps and practical applications");
      instructions.push("Ask: 'What would you do if...' 'How could you apply this...'");
    } else if (style.questioningStyle === 'reflective') {
      instructions.push("Ask deep, introspective questions");
      instructions.push("Encourage inner exploration and meaning-making");
      instructions.push("Use: 'What does this reveal about...' 'How does this connect to...'");
    }

    // Example Preference
    if (style.examplePreference === 'specific-scenarios') {
      instructions.push("Provide detailed, realistic scenarios they can mentally step into");
      instructions.push("Use their likely life contexts (work, relationships, personal projects)");
      instructions.push("Make examples vivid and relatable to their experience");
    }

    // Response Length
    if (style.responseLength === 'brief') {
      instructions.push("Keep responses short and punchy (1-3 sentences per point)");
      instructions.push("Avoid long explanations unless they specifically ask for more detail");
      instructions.push("Get to the actionable insight quickly");
    }

    // Tonality
    if (style.tonality === 'warm-friend') {
      instructions.push("Speak like a close friend who really gets them");
      instructions.push("Use casual, conversational language");
      instructions.push("Be genuinely curious and excited about their insights");
    } else if (style.tonality === 'direct-coach') {
      instructions.push("Be direct and empowering in your communication");
      instructions.push("Focus on their strengths and capabilities");
      instructions.push("Challenge them to step into their power");
    }

    return instructions.join('\n- ');
  }
}
