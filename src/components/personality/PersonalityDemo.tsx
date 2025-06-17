
import React, { useState } from 'react';
import { CosmicCard } from '@/components/ui/cosmic-card';
import { Button } from '@/components/ui/button';
import { PersonalityEngine } from '@/services/personality-engine';
import { personalityEnrichmentService } from '@/services/personality-enrichment-service';
import { LayeredBlueprint } from '@/types/personality-modules';

const PersonalityDemo = () => {
  const [selectedProfile, setSelectedProfile] = useState<string>('');
  const [generatedPrompt, setGeneratedPrompt] = useState<string>('');

  // Sample personality profiles to demonstrate differences
  const sampleProfiles: Record<string, Partial<LayeredBlueprint>> = {
    entpGenerator: {
      cognitiveTemperamental: {
        mbtiType: 'ENTP',
        functions: ['Ne', 'Ti', 'Fe', 'Si'],
        dominantFunction: 'Extraverted Intuition (Ne)',
        auxiliaryFunction: 'Introverted Thinking (Ti)',
        cognitiveStack: ['Ne', 'Ti', 'Fe', 'Si'],
        taskApproach: 'innovative and exploratory',
        communicationStyle: 'enthusiastic and idea-rich',
        decisionMaking: 'rapid pattern recognition with logical analysis',
        informationProcessing: 'big picture connections with detailed verification'
      },
      energyDecisionStrategy: {
        humanDesignType: 'Generator',
        authority: 'Sacral',
        decisionStyle: 'gut response and energetic alignment',
        pacing: 'sustainable building with bursts',
        energyType: 'sustainable life force',
        strategy: 'respond to life with sacral guidance',
        profile: '3/5',
        centers: ['Sacral defined', 'Throat defined'],
        gates: ['Gate 34 - Power', 'Gate 5 - Fixed Rhythms'],
        channels: ['Channel 34-57 - Power']
      },
      motivationBeliefEngine: {
        mindset: 'growth-oriented innovator',
        motivation: ['discovery', 'impact', 'variety'],
        stateManagement: 'energy through excitement and novelty',
        excitementCompass: 'follow highest excitement through responsive building',
        frequencyAlignment: 'authentic innovation with sustainable energy',
        coreBeliefs: ['possibilities are endless', 'growth through exploration'],
        drivingForces: ['novelty', 'understanding', 'contribution'],
        beliefInterface: ['curiosity leads to truth', 'collaboration amplifies innovation'],
        resistancePatterns: ['routine resistance', 'completion anxiety']
      },
      coreValuesNarrative: {
        lifePath: 3,
        meaningfulAreas: ['creativity', 'communication', 'innovation'],
        anchoringVision: 'becoming a catalyst for positive change',
        northStar: 'innovative contribution to collective growth',
        lifeThemes: ['creative expression', 'authentic communication'],
        valueSystem: 'growth through authentic self-expression',
        missionStatement: 'inspire others through creative innovation',
        purposeAlignment: 'aligned when creating and sharing new possibilities'
      }
    },
    isfcProjector: {
      cognitiveTemperamental: {
        mbtiType: 'ISFJ',
        functions: ['Si', 'Fe', 'Ti', 'Ne'],
        dominantFunction: 'Introverted Sensing (Si)',
        auxiliaryFunction: 'Extraverted Feeling (Fe)',
        cognitiveStack: ['Si', 'Fe', 'Ti', 'Ne'],
        taskApproach: 'thorough and service-oriented',
        communicationStyle: 'warm and considerate',
        decisionMaking: 'careful consideration with people impact',
        informationProcessing: 'detailed experience with harmony awareness'
      },
      energyDecisionStrategy: {
        humanDesignType: 'Projector',
        authority: 'Emotional',
        decisionStyle: 'wait for emotional wave clarity and recognition',
        pacing: 'burst energy with rest cycles',
        energyType: 'focused guidance energy',
        strategy: 'wait for recognition and invitation',
        profile: '2/4',
        centers: ['Solar Plexus defined', 'Spleen defined'],
        gates: ['Gate 49 - Revolution', 'Gate 19 - Wanting'],
        channels: ['Channel 49-19 - Synthesis']
      },
      motivationBeliefEngine: {
        mindset: 'service-oriented guide',
        motivation: ['helping others', 'harmony', 'security'],
        stateManagement: 'energy through meaningful service and recognition',
        excitementCompass: 'follow excitement when recognized and invited',
        frequencyAlignment: 'authentic service with emotional wisdom',
        coreBeliefs: ['people matter most', 'steady service creates value'],
        drivingForces: ['support', 'stability', 'care'],
        beliefInterface: ['love heals all', 'patient service transforms lives'],
        resistancePatterns: ['overwhelm from others needs', 'recognition seeking']
      },
      coreValuesNarrative: {
        lifePath: 6,
        meaningfulAreas: ['service', 'relationships', 'healing'],
        anchoringVision: 'creating safe healing spaces for growth',
        northStar: 'nurturing guide for others growth',
        lifeThemes: ['compassionate service', 'harmonious relationships'],
        valueSystem: 'love and service as foundation of meaningful life',
        missionStatement: 'create safe spaces for others to flourish',
        purposeAlignment: 'aligned when helping others feel supported and valued'
      }
    }
  };

  const generatePersonalizedPrompt = (profileKey: string, mode: 'coach' | 'guide' | 'blend') => {
    const profile = sampleProfiles[profileKey];
    if (!profile) return '';

    // Enrich the profile with timing and proactive context
    const enrichedProfile = {
      ...profile,
      timingOverlays: {
        currentTransits: personalityEnrichmentService.calculateCurrentTransits(profile),
        seasonalInfluences: ['spring activation', 'new beginnings'],
        cyclicalPatterns: ['quarterly review cycles', 'lunar awareness'],
        optimalTimings: ['morning clarity', 'evening reflection'],
        energyWeather: 'stable with growth opportunities'
      },
      proactiveContext: personalityEnrichmentService.generateProactiveContext(profile)
    };

    const engine = new PersonalityEngine();
    engine.updateBlueprint(enrichedProfile);
    return engine.generateSystemPrompt(mode);
  };

  const handleGeneratePrompt = (profileKey: string, mode: 'coach' | 'guide' | 'blend') => {
    const prompt = generatePersonalizedPrompt(profileKey, mode);
    setSelectedProfile(profileKey);
    setGeneratedPrompt(prompt);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <CosmicCard className="p-4 sm:p-6">
        <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">Personality System Demo</h2>
        <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6 leading-relaxed">
          This demonstrates how the same AI agent generates completely different personalities
          based on real user blueprint data. Each profile uses actual MBTI cognitive functions,
          Human Design types, and numerology to create unique coaching approaches.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4 sm:mb-6">
          <CosmicCard className="p-3 sm:p-4">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">ENTP Generator (Life Path 3)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Innovative, energetic, idea-driven with sustainable building energy
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                onClick={() => handleGeneratePrompt('entpGenerator', 'coach')}
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
              >
                Generate Soul Coach Prompt
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleGeneratePrompt('entpGenerator', 'guide')}
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
              >
                Generate Soul Guide Prompt
              </Button>
            </div>
          </CosmicCard>

          <CosmicCard className="p-3 sm:p-4">
            <h3 className="font-semibold mb-2 text-sm sm:text-base">ISFJ Projector (Life Path 6)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4 leading-relaxed">
              Service-oriented, detail-focused with guidance energy and emotional authority
            </p>
            <div className="flex flex-col gap-2">
              <Button 
                size="sm" 
                onClick={() => handleGeneratePrompt('isfcProjector', 'coach')}
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
              >
                Generate Soul Coach Prompt
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleGeneratePrompt('isfcProjector', 'guide')}
                className="w-full text-xs sm:text-sm h-8 sm:h-9"
              >
                Generate Soul Guide Prompt
              </Button>
            </div>
          </CosmicCard>
        </div>
      </CosmicCard>

      {generatedPrompt && (
        <CosmicCard className="p-4 sm:p-6">
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
            Generated AI System Prompt for {selectedProfile}
          </h3>
          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg max-h-64 sm:max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-xs sm:text-sm leading-relaxed break-words">
              {generatedPrompt}
            </pre>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 sm:mt-4 leading-relaxed">
            Notice how the AI's personality, communication style, strategies, and advice
            are completely tailored to this specific user's cognitive functions, energy type,
            decision-making style, and life themes. This is not hardcoded - it's dynamically
            generated from real personality data.
          </p>
        </CosmicCard>
      )}
    </div>
  );
};

export default PersonalityDemo;
