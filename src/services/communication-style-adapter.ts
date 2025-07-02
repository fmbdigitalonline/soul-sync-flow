
import { LayeredBlueprint } from '@/types/personality-modules';

export interface CommunicationStyle {
  responseStructure: 'concrete' | 'abstract' | 'story-driven' | 'analytical';
  informationDelivery: 'direct' | 'exploratory' | 'supportive' | 'challenging';
  questioningStyle: 'scenario-based' | 'reflective' | 'action-oriented' | 'conceptual';
  validationApproach: 'strength-focused' | 'growth-focused' | 'pattern-focused' | 'solution-focused';
  examplePreference: 'specific-scenarios' | 'metaphors' | 'step-by-step' | 'big-picture';
  responseLength: 'brief' | 'moderate' | 'detailed';
  tonality: 'warm-friend' | 'wise-guide' | 'direct-coach' | 'curious-explorer';
  adaptationScore: number; // 0-100, how confident we are in this detection
}

export class CommunicationStyleAdapter {
  
  static detectCommunicationStyle(blueprint: Partial<LayeredBlueprint>): CommunicationStyle {
    console.log('Detecting communication style for blueprint:', blueprint);
    
    // Initialize scoring system for each dimension
    const scores = {
      concrete: 0,
      abstract: 0,
      storyDriven: 0,
      analytical: 0,
      direct: 0,
      exploratory: 0,
      supportive: 0,
      challenging: 0,
      scenarioBased: 0,
      reflective: 0,
      actionOriented: 0,
      conceptual: 0,
      strengthFocused: 0,
      growthFocused: 0,
      patternFocused: 0,
      solutionFocused: 0,
      specificScenarios: 0,
      metaphors: 0,
      stepByStep: 0,
      bigPicture: 0,
      brief: 0,
      moderate: 0,
      detailed: 0,
      warmFriend: 0,
      wiseGuide: 0,
      directCoach: 0,
      curiousExplorer: 0
    };

    let totalFactors = 0;

    // MBTI Type Analysis
    const mbtiType = blueprint.cognitiveTemperamental?.mbtiType;
    if (mbtiType && mbtiType !== 'Unknown') {
      totalFactors++;
      
      // Extroversion vs Introversion
      if (mbtiType.startsWith('E')) {
        scores.direct += 2;
        scores.exploratory += 2;
        scores.warmFriend += 2;
        scores.brief += 1;
      } else {
        scores.reflective += 2;
        scores.supportive += 2;
        scores.wiseGuide += 2;
        scores.detailed += 1;
      }
      
      // Sensing vs Intuition
      if (mbtiType.includes('S')) {
        scores.concrete += 3;
        scores.stepByStep += 3;
        scores.specificScenarios += 3;
        scores.actionOriented += 2;
        scores.solutionFocused += 2;
      } else {
        scores.abstract += 2;
        scores.bigPicture += 3;
        scores.conceptual += 2;
        scores.patternFocused += 2;
        scores.metaphors += 2;
      }
      
      // Thinking vs Feeling
      if (mbtiType.includes('T')) {
        scores.analytical += 3;
        scores.challenging += 2;
        scores.directCoach += 2;
        scores.solutionFocused += 2;
      } else {
        scores.supportive += 3;
        scores.strengthFocused += 2;
        scores.warmFriend += 2;
        scores.growthFocused += 2;
      }
      
      // Judging vs Perceiving
      if (mbtiType.includes('J')) {
        scores.stepByStep += 2;
        scores.actionOriented += 2;
        scores.brief += 1;
        scores.directCoach += 1;
      } else {
        scores.exploratory += 2;
        scores.curiousExplorer += 2;
        scores.moderate += 1;
      }
    }

    // Dominant Function Analysis
    const dominantFunction = blueprint.cognitiveTemperamental?.dominantFunction;
    if (dominantFunction) {
      totalFactors++;
      
      if (dominantFunction.includes('Ne')) {
        scores.scenarioBased += 4;
        scores.specificScenarios += 4;
        scores.exploratory += 3;
        scores.curiousExplorer += 3;
        scores.brief += 2;
      } else if (dominantFunction.includes('Ni')) {
        scores.patternFocused += 4;
        scores.metaphors += 3;
        scores.wiseGuide += 3;
        scores.detailed += 2;
      } else if (dominantFunction.includes('Se')) {
        scores.concrete += 4;
        scores.actionOriented += 3;
        scores.directCoach += 2;
        scores.brief += 2;
      } else if (dominantFunction.includes('Si')) {
        scores.stepByStep += 4;
        scores.detailed += 3;
        scores.supportive += 2;
      } else if (dominantFunction.includes('Te')) {
        scores.analytical += 4;
        scores.solutionFocused += 3;
        scores.directCoach += 3;
        scores.challenging += 2;
      } else if (dominantFunction.includes('Ti')) {
        scores.analytical += 3;
        scores.conceptual += 3;
        scores.moderate += 2;
      } else if (dominantFunction.includes('Fe')) {
        scores.supportive += 4;
        scores.warmFriend += 3;
        scores.strengthFocused += 2;
      } else if (dominantFunction.includes('Fi')) {
        scores.reflective += 4;
        scores.growthFocused += 3;
        scores.wiseGuide += 2;
        scores.detailed += 2;
      }
    }

    // Human Design Type Analysis
    const hdType = blueprint.energyDecisionStrategy?.humanDesignType;
    if (hdType && hdType !== 'Unknown') {
      totalFactors++;
      
      switch (hdType) {
        case 'Manifestor':
          scores.direct += 3;
          scores.directCoach += 3;
          scores.actionOriented += 2;
          scores.brief += 2;
          break;
        case 'Generator':
        case 'Manifesting Generator':
          scores.supportive += 2;
          scores.actionOriented += 3;
          scores.warmFriend += 2;
          scores.moderate += 2;
          break;
        case 'Projector':
          scores.wiseGuide += 4;
          scores.patternFocused += 3;
          scores.reflective += 2;
          scores.detailed += 2;
          break;
        case 'Reflector':
          scores.reflective += 4;
          scores.exploratory += 3;
          scores.curiousExplorer += 3;
          scores.detailed += 3;
          break;
      }
    }

    // Human Design Authority Analysis
    const authority = blueprint.energyDecisionStrategy?.authority;
    if (authority) {
      totalFactors++;
      
      if (authority.includes('Emotional')) {
        scores.supportive += 2;
        scores.reflective += 2;
        scores.detailed += 1;
      } else if (authority.includes('Sacral')) {
        scores.direct += 2;
        scores.actionOriented += 2;
        scores.brief += 1;
      } else if (authority.includes('Splenic')) {
        scores.direct += 3;
        scores.brief += 2;
      } else if (authority.includes('Self-Projected')) {
        scores.reflective += 2;
        scores.wiseGuide += 2;
      }
    }

    // Life Path Number Analysis
    const lifePath = blueprint.coreValuesNarrative?.lifePath;
    if (lifePath) {
      totalFactors++;
      
      switch (lifePath) {
        case 1:
          scores.directCoach += 2;
          scores.actionOriented += 2;
          scores.solutionFocused += 2;
          break;
        case 2:
          scores.supportive += 3;
          scores.warmFriend += 2;
          scores.strengthFocused += 2;
          break;
        case 3:
          scores.storyDriven += 3;
          scores.warmFriend += 3;
          scores.exploratory += 2;
          break;
        case 4:
          scores.stepByStep += 3;
          scores.analytical += 2;
          scores.detailed += 2;
          break;
        case 5:
          scores.curiousExplorer += 3;
          scores.exploratory += 2;
          scores.challenging += 2;
          break;
        case 6:
          scores.supportive += 3;
          scores.wiseGuide += 2;
          scores.growthFocused += 2;
          break;
        case 7:
          scores.analytical += 3;
          scores.patternFocused += 2;
          scores.conceptual += 2;
          break;
        case 8:
          scores.directCoach += 3;
          scores.challenging += 2;
          scores.solutionFocused += 2;
          break;
        case 9:
          scores.wiseGuide += 3;
          scores.bigPicture += 2;
          scores.growthFocused += 2;
          break;
      }
    }

    // Sun Sign Analysis (basic personality expression)
    const sunSign = blueprint.publicArchetype?.sunSign;
    if (sunSign && sunSign !== 'Unknown') {
      totalFactors++;
      
      const fireSignsPattern = ['Aries', 'Leo', 'Sagittarius'];
      const earthSignsPattern = ['Taurus', 'Virgo', 'Capricorn'];
      const airSignsPattern = ['Gemini', 'Libra', 'Aquarius'];
      const waterSignsPattern = ['Cancer', 'Scorpio', 'Pisces'];
      
      if (fireSignsPattern.includes(sunSign)) {
        scores.direct += 2;
        scores.directCoach += 2;
        scores.actionOriented += 2;
        scores.brief += 1;
      } else if (earthSignsPattern.includes(sunSign)) {
        scores.stepByStep += 2;
        scores.concrete += 2;
        scores.solutionFocused += 2;
      } else if (airSignsPattern.includes(sunSign)) {
        scores.exploratory += 2;
        scores.curiousExplorer += 2;
        scores.conceptual += 2;
      } else if (waterSignsPattern.includes(sunSign)) {
        scores.supportive += 2;
        scores.reflective += 2;
        scores.metaphors += 2;
        scores.detailed += 1;
      }
    }

    // Core Motivations Analysis
    const motivations = blueprint.motivationBeliefEngine?.motivation;
    if (motivations && Array.isArray(motivations)) {
      totalFactors++;
      
      motivations.forEach(motivation => {
        if (typeof motivation === 'string') {
          if (motivation.toLowerCase().includes('growth')) {
            scores.growthFocused += 2;
            scores.wiseGuide += 1;
          }
          if (motivation.toLowerCase().includes('achievement')) {
            scores.solutionFocused += 2;
            scores.directCoach += 1;
          }
          if (motivation.toLowerCase().includes('connection')) {
            scores.warmFriend += 2;
            scores.supportive += 1;
          }
          if (motivation.toLowerCase().includes('knowledge')) {
            scores.analytical += 2;
            scores.curiousExplorer += 1;
          }
        }
      });
    }

    // Calculate final preferences based on highest scores
    const getHighestScore = (scoreMap: { [key: string]: number }) => {
      return Object.entries(scoreMap).reduce((max, [key, value]) => 
        value > max.value ? { key, value } : max, { key: '', value: 0 }
      );
    };

    const responseStructure = getHighestScore({
      concrete: scores.concrete,
      abstract: scores.abstract,
      'story-driven': scores.storyDriven,
      analytical: scores.analytical
    }).key as 'concrete' | 'abstract' | 'story-driven' | 'analytical';

    const informationDelivery = getHighestScore({
      direct: scores.direct,
      exploratory: scores.exploratory,
      supportive: scores.supportive,
      challenging: scores.challenging
    }).key as 'direct' | 'exploratory' | 'supportive' | 'challenging';

    const questioningStyle = getHighestScore({
      'scenario-based': scores.scenarioBased,
      reflective: scores.reflective,
      'action-oriented': scores.actionOriented,
      conceptual: scores.conceptual
    }).key as 'scenario-based' | 'reflective' | 'action-oriented' | 'conceptual';

    const validationApproach = getHighestScore({
      'strength-focused': scores.strengthFocused,
      'growth-focused': scores.growthFocused,
      'pattern-focused': scores.patternFocused,
      'solution-focused': scores.solutionFocused
    }).key as 'strength-focused' | 'growth-focused' | 'pattern-focused' | 'solution-focused';

    const examplePreference = getHighestScore({
      'specific-scenarios': scores.specificScenarios,
      metaphors: scores.metaphors,
      'step-by-step': scores.stepByStep,
      'big-picture': scores.bigPicture
    }).key as 'specific-scenarios' | 'metaphors' | 'step-by-step' | 'big-picture';

    const responseLength = getHighestScore({
      brief: scores.brief,
      moderate: scores.moderate,
      detailed: scores.detailed
    }).key as 'brief' | 'moderate' | 'detailed';

    const tonality = getHighestScore({
      'warm-friend': scores.warmFriend,
      'wise-guide': scores.wiseGuide,
      'direct-coach': scores.directCoach,
      'curious-explorer': scores.curiousExplorer
    }).key as 'warm-friend' | 'wise-guide' | 'direct-coach' | 'curious-explorer';

    // Calculate adaptation score based on how much blueprint data we had
    const adaptationScore = Math.min(100, (totalFactors / 7) * 100); // 7 main categories

    const detectedStyle: CommunicationStyle = {
      responseStructure,
      informationDelivery,
      questioningStyle,
      validationApproach,
      examplePreference,
      responseLength,
      tonality,
      adaptationScore
    };

    console.log('Detected communication style:', detectedStyle);
    console.log('Adaptation confidence:', adaptationScore, '% based on', totalFactors, 'blueprint factors');
    
    return detectedStyle;
  }

  static generateCommunicationInstructions(style: CommunicationStyle): string {
    const instructions = [];

    // Add confidence indicator
    if (style.adaptationScore >= 80) {
      instructions.push(`HIGH CONFIDENCE ADAPTATION (${Math.round(style.adaptationScore)}% blueprint match)`);
    } else if (style.adaptationScore >= 60) {
      instructions.push(`MODERATE CONFIDENCE ADAPTATION (${Math.round(style.adaptationScore)}% blueprint match)`);
    } else {
      instructions.push(`BASIC ADAPTATION (${Math.round(style.adaptationScore)}% blueprint match) - Use general best practices`);
    }

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
    } else {
      instructions.push("Present concepts clearly with logical flow");
      instructions.push("Balance concrete examples with broader principles");
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
    } else if (style.informationDelivery === 'challenging') {
      instructions.push("Ask probing questions that push their thinking");
      instructions.push("Challenge assumptions respectfully");
      instructions.push("Encourage stretch goals and growth edges");
    } else {
      instructions.push("Encourage exploration and curiosity");
      instructions.push("Ask open-ended questions to deepen understanding");
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
    } else {
      instructions.push("Ask conceptual questions that explore ideas and possibilities");
      instructions.push("Focus on patterns, connections, and underlying principles");
    }

    // Example Preference
    if (style.examplePreference === 'specific-scenarios') {
      instructions.push("Provide detailed, realistic scenarios they can mentally step into");
      instructions.push("Use their likely life contexts (work, relationships, personal projects)");
      instructions.push("Make examples vivid and relatable to their experience");
    } else if (style.examplePreference === 'metaphors') {
      instructions.push("Use metaphors and analogies to illustrate points");
      instructions.push("Connect abstract concepts to familiar experiences");
    } else if (style.examplePreference === 'step-by-step') {
      instructions.push("Break down examples into clear, sequential steps");
      instructions.push("Show the logical progression from start to finish");
    } else {
      instructions.push("Provide big-picture examples that show broader patterns");
      instructions.push("Connect examples to larger themes and principles");
    }

    // Response Length
    if (style.responseLength === 'brief') {
      instructions.push("Keep responses short and punchy (1-3 sentences per point)");
      instructions.push("Avoid long explanations unless they specifically ask for more detail");
      instructions.push("Get to the actionable insight quickly");
    } else if (style.responseLength === 'detailed') {
      instructions.push("Provide thorough explanations with rich context");
      instructions.push("Include multiple angles and perspectives");
      instructions.push("Allow for deeper exploration of topics");
    } else {
      instructions.push("Balance detail with conciseness");
      instructions.push("Provide enough context without overwhelming");
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
    } else if (style.tonality === 'wise-guide') {
      instructions.push("Speak with gentle wisdom and deeper insight");
      instructions.push("Offer perspective that comes from understanding patterns");
      instructions.push("Be patient and nurturing in your guidance");
    } else {
      instructions.push("Be curious and explorative in your approach");
      instructions.push("Show genuine interest in their unique perspective");
      instructions.push("Encourage discovery and experimentation");
    }

    return instructions.join('\n- ');
  }
}
