

import { BlueprintData } from './blueprint-service';

export const sampleBlueprints: BlueprintData[] = [
  {
    id: "sample-1",
    user_meta: {
      full_name: "Sample User",
      preferred_name: "Sam",
      birth_date: "1990-06-15",
      birth_time_local: "14:30",
      birth_location: "New York, NY, USA",
      timezone: "America/New_York",
      personality: "INFJ"
    },
    metadata: {
      engine: "sample",
      data_sources: {
        western: "calculated",
        chinese: "calculated", 
        numerology: "calculated",
        humanDesign: "calculated"
      },
      calculation_date: "2025-01-01T00:00:00Z",
      calculation_success: true,
      partial_calculation: false
    },
    energy_strategy_human_design: {
      type: "Generator",
      profile: "1/3",
      authority: "Sacral",
      strategy: "To Respond",
      definition: "Single",
      not_self_theme: "Frustration",
      life_purpose: "To find satisfaction through responding",
      gates: {
        unconscious_design: [],
        conscious_personality: []
      },
      centers: {},
      metadata: {}
    },
    cognition_mbti: {
      type: "INFJ",
      core_keywords: ["Insightful", "Idealistic", "Compassionate"],
      dominant_function: "Introverted Intuition (Ni)",
      auxiliary_function: "Extroverted Feeling (Fe)"
    },
    bashar_suite: {
      excitement_compass: {
        principle: "Follow your highest excitement"
      },
      belief_interface: {
        principle: "What you believe is what you experience",
        reframe_prompt: "What would I have to believe to experience this?"
      },
      frequency_alignment: {
        quick_ritual: "Visualize feeling the way you want to feel for 17 seconds"
      }
    },
    values_life_path: {
      lifePathNumber: 7,
      expressionNumber: 3,
      soulUrgeNumber: 5,
      birthdayNumber: 6,
      birthDay: 15,
      birthMonth: 6,
      birthYear: 1990,
      lifePathKeyword: "Seeker",
      expressionKeyword: "Creative Communicator",
      soulUrgeKeyword: "Freedom",
      birthdayKeyword: "Responsible"
    },
    archetype_western: {
      sun_sign: "Gemini",
      sun_keyword: "Communicator",
      moon_sign: "Pisces",
      moon_keyword: "Intuitive",
      rising_sign: "Virgo",
      source: "calculated",
      houses: {},
      aspects: []
    },
    archetype_chinese: {
      animal: "Horse",
      element: "Metal",
      yin_yang: "Yang",
      keyword: "Metal Horse",
      year: 1990
    },
    timing_overlays: {
      current_transits: [],
      notes: "Sample blueprint for demonstration"
    },
    goal_stack: [],
    belief_logs: [],
    astrology: {},
    human_design: {},
    numerology: {},
    mbti: {}
  }
];

export const exampleFeurionBlueprint: BlueprintData = sampleBlueprints[0];

export const importBlueprintFromJson = (jsonText: string): { data?: BlueprintData; error?: string } => {
  try {
    const parsed = JSON.parse(jsonText);
    return { data: parsed as BlueprintData };
  } catch (error) {
    return { error: "Invalid JSON format" };
  }
};
