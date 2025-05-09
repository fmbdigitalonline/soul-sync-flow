
import { BlueprintData } from "./blueprint-service";

// Example blueprint for Feurion
export const exampleFeurionBlueprint: BlueprintData = {
  _meta: {
    generation_method: "example",
    model_version: "1.0",
    generation_date: "2023-01-01",
    birth_data: {},
    schema_version: "1.0",
  },
  user_meta: {
    full_name: "Feurion Michael Banel",
    preferred_name: "Feurion",
    birth_date: "1978-02-12",
    birth_time_local: "22:00",
    birth_location: "Paramaribo, Suriname",
    timezone: "America/Paramaribo"
  },
  cognition_mbti: {
    type: "ENTP-A",
    core_keywords: ["Inventive", "Debater", "Assertive"],
    dominant_function: "Extraverted Intuition (Ne)",
    auxiliary_function: "Introverted Thinking (Ti)"
  },
  energy_strategy_human_design: {
    type: "Projector",
    profile: "6/2 (Role‑Model / Hermit)",
    authority: "Splenic",
    strategy: "Wait for the invitation",
    definition: "Split",
    not_self_theme: "Bitterness",
    life_purpose: "Guide others; share wisdom through lived experience",
    centers: {
      root: false,
      sacral: false,
      spleen: true,
      solar_plexus: false,
      heart: false,
      throat: false,
      ajna: false,
      head: false,
      g: false,
    },
    gates: {
      unconscious_design: [
        "14.2","8.2","55.3","48.6","21.6","20.2",
        "44.3","33.1","52.2","29.6","44.6","5.5","57.1"
      ],
      conscious_personality: [
        "49.6","4.6","27.2","18.4","17.4","13.1",
        "30.6","62.4","12.4","29.4","1.4","26.2","57.2"
      ]
    }
  },
  bashar_suite: {
    belief_interface: {
      principle: "Circumstances are neutral; beliefs give them meaning → emotion.",
      reframe_prompt: "What story am I telling and how does it feel?"
    },
    excitement_compass: {
      principle: "Act on the option with the highest excitement you can take now, with zero insistence on outcome."
    },
    frequency_alignment: {
      quick_ritual: "Three deep exhales + 10‑sec vivid visualisation of completed action."
    }
  },
  values_life_path: {
    life_path_number: 3,
    life_path_keyword: "Creative Communicator",
    life_path_description: "Express joy and creativity through communication",
    birth_day_number: 12,
    birth_day_meaning: "Detail-oriented and analytical",
    personal_year: 5,
    expression_number: 11,
    expression_keyword: "Inspirational Visionary (Master)",
    soul_urge_number: 8,
    soul_urge_keyword: "Ambitious Manifestor",
    personality_number: 3
  },
  archetype_western: {
    sun_sign: "Aquarius ♒︎",
    sun_keyword: "Innovative Humanitarian",
    sun_dates: "January 20 - February 18",
    sun_element: "Air",
    sun_qualities: "Fixed, Progressive, Intellectual",
    moon_sign: "Taurus ♉︎ (early degree, 01°)",
    moon_keyword: "Grounded Sensuality",
    moon_element: "Earth",
    rising_sign: "Virgo ♍︎",
    aspects: [
      {
        planet: "Sun",
        aspect: "Conjunction",
        planet2: "Mercury",
        orb: "2°"
      },
      {
        planet: "Moon",
        aspect: "Trine",
        planet2: "Venus",
        orb: "3°"
      }
    ],
    houses: {
      "1": { sign: "Virgo", house: "1st House" },
      "2": { sign: "Libra", house: "2nd House" }
    }
  },
  archetype_chinese: {
    animal: "Horse",
    element: "Earth",
    yin_yang: "Yang",
    keyword: "Energetic Trailblazer",
    element_characteristic: "Stable, nurturing, and reliable",
    personality_profile: "Confident, enthusiastic, and natural leaders",
    compatibility: {
      best: ["Tiger", "Goat", "Dog"],
      worst: ["Rat", "Ox", "Rooster"]
    }
  },
  timing_overlays: {
    current_transits: [],
    notes: "Populate live via ephemeris."
  },
  goal_stack: [],
  task_graph: {},
  belief_logs: [],
  excitement_scores: [],
  vibration_check_ins: []
};

// Add more example blueprints as needed
export const blueprintExamples = {
  feurion: exampleFeurionBlueprint,
  // Add more examples as needed
};

// Function to load an example blueprint
export const loadExampleBlueprint = (name: keyof typeof blueprintExamples) => {
  return blueprintExamples[name];
};

// Function to import a blueprint from JSON
export const importBlueprintFromJson = (jsonString: string): { data: BlueprintData | null; error?: string } => {
  try {
    const parsed = JSON.parse(jsonString);
    return { data: parsed as BlueprintData };
  } catch (err) {
    return { 
      data: null, 
      error: err instanceof Error ? err.message : "Failed to parse blueprint JSON" 
    };
  }
};
