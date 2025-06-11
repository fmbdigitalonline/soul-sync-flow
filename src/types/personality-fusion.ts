
export interface PersonalityScores {
  blueprint_id: string;
  big5: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  big5_confidence: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mbti_probabilities: Record<string, number>;
  enneagram_probabilities?: Record<string, number>;
  last_updated: string;
}

export interface PersonalityAnswer {
  id: string;
  blueprint_id: string;
  item_code: string;
  answer: string;
  created_at: string;
}

export interface PersonalityProfile {
  bigFive: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  confidence: {
    openness: number;
    conscientiousness: number;
    extraversion: number;
    agreeableness: number;
    neuroticism: number;
  };
  mbtiProbabilities: Record<string, number>;
  likelyType: string;
  description: string;
  userConfidence?: number;
  microAnswers?: Array<{
    key: string;
    value: number;
  }>;
  timestamp?: string;
}
