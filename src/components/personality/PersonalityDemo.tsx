import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LayeredBlueprint } from "@/types/personality-modules";

const PersonalityDemo: React.FC = () => {
  // Sample blueprint for demo
  const sampleBlueprint: LayeredBlueprint = {
    cognitiveTemperamental: {
      mbtiType: "INTJ",
      functions: [],
      dominantFunction: "",
      auxiliaryFunction: "",
      cognitiveStack: [],
      taskApproach: "",
      communicationStyle: "",
      decisionMaking: "",
      informationProcessing: ""
    },
    publicArchetype: {
      sunSign: "Capricorn",
      socialStyle: "",
      publicVibe: "",
      publicPersona: "",
      leadershipStyle: "",
      socialMask: "",
      externalExpression: ""
    },
    energyDecisionStrategy: {
      humanDesignType: "Manifestor",
      authority: "",
      decisionStyle: "",
      pacing: "",
      energyType: "",
      strategy: "",
      profile: "",
      centers: [],
      gates: [],
      channels: []
    },
    coreValuesNarrative: {
      lifePath: 5,
      meaningfulAreas: [],
      anchoringVision: "",
      lifeThemes: [],
      valueSystem: "",
      northStar: "",
      missionStatement: "",
      purposeAlignment: "",
      core_values: []
    },
    generationalCode: {
      chineseZodiac: "Ox",
      element: "",
      cohortTint: "",
      generationalThemes: [],
      collectiveInfluence: ""
    },
    surfaceExpression: {
      observableStyle: "",
      realWorldImpact: "",
      behavioralSignatures: [],
      externalManifestations: []
    },
    marketingArchetype: {
      messagingStyle: "",
      socialHooks: [],
      brandPersonality: "",
      communicationPatterns: [],
      influenceStyle: ""
    },
    goalPersona: {
      currentMode: "guide",
      serviceRole: "",
      coachingTone: "",
      nudgeStyle: "",
      motivationApproach: ""
    },
    interactionPreferences: {
      rapportStyle: "",
      storyPreference: "",
      empathyLevel: "",
      conflictStyle: "",
      collaborationStyle: "",
      feedbackStyle: "",
      learningStyle: ""
    },
    timingOverlays: {
      currentTransits: [],
      seasonalInfluences: [],
      cyclicalPatterns: [],
      optimalTimings: [],
      energyWeather: ""
    },
    proactiveContext: {
      nudgeHistory: [],
      taskGraph: {},
      streaks: {},
      moodLog: [],
      recentPatterns: [],
      triggerEvents: []
    },
    user_meta: {},
    humorProfile: {
      primaryStyle: "witty-inventor",
      intensity: "moderate",
      appropriatenessLevel: "balanced",
      contextualAdaptation: {
        coaching: "witty-inventor",
        guidance: "witty-inventor",
        casual: "witty-inventor"
      },
      avoidancePatterns: [],
      signatureElements: []
    },
    voiceTokens: {
      pacing: {
        sentenceLength: "medium",
        pauseFrequency: "thoughtful",
        rhythmPattern: "steady"
      },
      expressiveness: {
        emojiFrequency: "rare",
        emphasisStyle: "subtle",
        exclamationTendency: "balanced"
      },
      vocabulary: {
        formalityLevel: "conversational",
        metaphorUsage: "occasional",
        technicalDepth: "balanced"
      },
      conversationStyle: {
        questionAsking: "exploratory",
        responseLength: "thorough",
        personalSharing: "relevant"
      },
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    },
    motivationBeliefEngine: {
      coreBeliefs: [
        "I am capable of achieving my goals",
        "Growth comes through challenges",
        "Authenticity leads to fulfillment"
      ],
      motivationalDrivers: [
        "Personal growth",
        "Creative expression", 
        "Meaningful connections"
      ],
      beliefPatterns: [
        "Optimistic outlook",
        "Solution-focused thinking",
        "Growth mindset"
      ],
      motivationTriggers: [
        "New challenges",
        "Creative opportunities",
        "Learning experiences"
      ],
      resistancePoints: [
        "Perfectionism",
        "Fear of judgment",
        "Overwhelming complexity"
      ],
      empowermentSources: [
        "Clear goals",
        "Supportive community",
        "Regular progress"
      ]
    }
  };

  // Another sample for contrast
  const sampleBlueprint2: LayeredBlueprint = {
    cognitiveTemperamental: {
      mbtiType: "ESFJ",
      functions: [],
      dominantFunction: "",
      auxiliaryFunction: "",
      cognitiveStack: [],
      taskApproach: "",
      communicationStyle: "",
      decisionMaking: "",
      informationProcessing: ""
    },
    publicArchetype: {
      sunSign: "Cancer",
      socialStyle: "",
      publicVibe: "",
      publicPersona: "",
      leadershipStyle: "",
      socialMask: "",
      externalExpression: ""
    },
    energyDecisionStrategy: {
      humanDesignType: "Generator",
      authority: "",
      decisionStyle: "",
      pacing: "",
      energyType: "",
      strategy: "",
      profile: "",
      centers: [],
      gates: [],
      channels: []
    },
    coreValuesNarrative: {
      lifePath: 2,
      meaningfulAreas: [],
      anchoringVision: "",
      lifeThemes: [],
      valueSystem: "",
      northStar: "",
      missionStatement: "",
      purposeAlignment: "",
      core_values: []
    },
    generationalCode: {
      chineseZodiac: "Rabbit",
      element: "",
      cohortTint: "",
      generationalThemes: [],
      collectiveInfluence: ""
    },
    surfaceExpression: {
      observableStyle: "",
      realWorldImpact: "",
      behavioralSignatures: [],
      externalManifestations: []
    },
    marketingArchetype: {
      messagingStyle: "",
      socialHooks: [],
      brandPersonality: "",
      communicationPatterns: [],
      influenceStyle: ""
    },
    goalPersona: {
      currentMode: "guide",
      serviceRole: "",
      coachingTone: "",
      nudgeStyle: "",
      motivationApproach: ""
    },
    interactionPreferences: {
      rapportStyle: "",
      storyPreference: "",
      empathyLevel: "",
      conflictStyle: "",
      collaborationStyle: "",
      feedbackStyle: "",
      learningStyle: ""
    },
    timingOverlays: {
      currentTransits: [],
      seasonalInfluences: [],
      cyclicalPatterns: [],
      optimalTimings: [],
      energyWeather: ""
    },
    proactiveContext: {
      nudgeHistory: [],
      taskGraph: {},
      streaks: {},
      moodLog: [],
      recentPatterns: [],
      triggerEvents: []
    },
    user_meta: {},
    humorProfile: {
      primaryStyle: "witty-inventor",
      intensity: "moderate",
      appropriatenessLevel: "balanced",
      contextualAdaptation: {
        coaching: "witty-inventor",
        guidance: "witty-inventor",
        casual: "witty-inventor"
      },
      avoidancePatterns: [],
      signatureElements: []
    },
    voiceTokens: {
      pacing: {
        sentenceLength: "medium",
        pauseFrequency: "thoughtful",
        rhythmPattern: "steady"
      },
      expressiveness: {
        emojiFrequency: "rare",
        emphasisStyle: "subtle",
        exclamationTendency: "balanced"
      },
      vocabulary: {
        formalityLevel: "conversational",
        metaphorUsage: "occasional",
        technicalDepth: "balanced"
      },
      conversationStyle: {
        questionAsking: "exploratory",
        responseLength: "thorough",
        personalSharing: "relevant"
      },
      signaturePhrases: [],
      greetingStyles: [],
      transitionWords: []
    },
    motivationBeliefEngine: {
      coreBeliefs: [
        "Stability provides security",
        "Preparation prevents problems", 
        "Relationships require nurturing"
      ],
      motivationalDrivers: [
        "Security and stability",
        "Family and relationships",
        "Service to others"
      ],
      beliefPatterns: [
        "Cautious planning",
        "Relationship-centered",
        "Traditional values"
      ],
      motivationTriggers: [
        "Helping others",
        "Building security",
        "Maintaining harmony"
      ],
      resistancePoints: [
        "Uncertainty",
        "Conflict",
        "Rapid change"
      ],
      empowermentSources: [
        "Stable routines",
        "Close relationships",
        "Clear expectations"
      ]
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Sample Personality Blueprint 1</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>MBTI: {sampleBlueprint.cognitiveTemperamental.mbtiType}</Badge>
          <Badge>Sun Sign: {sampleBlueprint.publicArchetype.sunSign}</Badge>
          <Badge>Life Path: {sampleBlueprint.coreValuesNarrative.lifePath}</Badge>
          <p>Core Beliefs: {sampleBlueprint.motivationBeliefEngine.coreBeliefs.join(", ")}</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sample Personality Blueprint 2</CardTitle>
        </CardHeader>
        <CardContent>
          <Badge>MBTI: {sampleBlueprint2.cognitiveTemperamental.mbtiType}</Badge>
          <Badge>Sun Sign: {sampleBlueprint2.publicArchetype.sunSign}</Badge>
          <Badge>Life Path: {sampleBlueprint2.coreValuesNarrative.lifePath}</Badge>
          <p>Core Beliefs: {sampleBlueprint2.motivationBeliefEngine.coreBeliefs.join(", ")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PersonalityDemo;
