
import { BlueprintData } from "@/services/blueprint-service";

export interface EnhancedBlueprintData extends BlueprintData {
  // Core enrichments for personalized guidance
  interaction_prefs: {
    support_style: "Directive" | "Socratic" | "Reflective" | "Collaborative";
    tone: "Warm-honest" | "Professional" | "Casual-friendly" | "Mystical" | "Scientific";
    emoji_usage: "Minimal" | "Moderate" | "Abundant";
    preferred_format: "Bullet-points" | "Paragraphs" | "Questions" | "Action-steps";
  };
  
  marketing_archetype: {
    primary: "Explorer" | "Hero" | "Sage" | "Creator" | "Caregiver" | "Magician" | "Ruler" | "Jester" | "Lover" | "Everyman" | "Innocent" | "Rebel";
    secondary?: string;
    brand_voice_keywords: string[];
  };
  
  goal_persona: "Productivity" | "Creativity" | "Relationships" | "Health" | "Spirituality" | "Career" | "Adventure";
  
  north_star: string; // User's mission/purpose statement
  
  enhanced_sections: {
    energy_identity: {
      facts: string[];
      narratives: {
        novice: string;
        amateur: string;
        pro: string;
      };
    };
    western_astrology: {
      facts: string[];
      narratives: {
        novice: string;
        amateur: string;
        pro: string;
      };
      aspects: Array<{
        planet1: string;
        planet2: string;
        aspect: string;
        orb: number;
        exact: boolean;
      }>;
      houses: Record<string, any>;
      retrogrades: string[];
    };
    human_design: {
      facts: string[];
      narratives: {
        novice: string;
        amateur: string;
        pro: string;
      };
      centers: Record<string, { defined: boolean; percentage: number }>;
      gates: Array<{ number: number; name: string; line: number }>;
      channels: Array<{ name: string; gates: number[] }>;
    };
    numerology: {
      facts: string[];
      narratives: {
        novice: string;
        amateur: string;
        pro: string;
      };
      calculations: Record<string, { value: number; method: string }>;
    };
    chinese_astrology: {
      facts: string[];
      narratives: {
        novice: string;
        amateur: string;
        pro: string;
      };
      four_pillars: {
        year: { animal: string; element: string };
        month: { animal: string; element: string };
        day: { animal: string; element: string };
        hour: { animal: string; element: string };
      };
    };
  };
}

export type ViewDepth = 'novice' | 'amateur' | 'pro';
