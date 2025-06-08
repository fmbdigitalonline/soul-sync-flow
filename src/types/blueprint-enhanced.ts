
export interface EnhancedBlueprintData extends BlueprintData {
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
