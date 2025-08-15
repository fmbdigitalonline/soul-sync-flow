interface FunnelData {
  painPoint: string;
  lifeSatisfaction: Record<string, number>;
  changeStyle: string;
  previousAttempts: string[];
  vision: string;
  completedAt: string;
}

const FUNNEL_DATA_KEY = 'lifeclarityFunnelData';

export const storeFunnelData = (data: Omit<FunnelData, 'completedAt'>) => {
  const funnelData: FunnelData = {
    ...data,
    completedAt: new Date().toISOString()
  };
  localStorage.setItem(FUNNEL_DATA_KEY, JSON.stringify(funnelData));
};

export const getFunnelData = (): FunnelData | null => {
  try {
    const stored = localStorage.getItem(FUNNEL_DATA_KEY);
    if (!stored) return null;
    return JSON.parse(stored);
  } catch (error) {
    console.error('Error retrieving funnel data:', error);
    return null;
  }
};

export const clearFunnelData = () => {
  localStorage.removeItem(FUNNEL_DATA_KEY);
};

export const hasFunnelData = (): boolean => {
  return !!getFunnelData();
};

export const getFunnelSummary = (data: FunnelData): string => {
  const painPoints: Record<string, string> = {
    stuck_career: "feeling stuck in career",
    relationship_struggles: "struggling with relationships",
    overwhelmed: "feeling overwhelmed",
    lost_purpose: "lost sense of purpose",
    financial_stress: "financial stress",
    health_energy: "health and energy issues"
  };

  const changeStyles: Record<string, string> = {
    understand_why: "needs to understand the why first",
    tell_me_what: "prefers direct guidance",
    explore_gradually: "wants gradual exploration",
    deep_transformation: "ready for deep transformation"
  };

  const painPointText = painPoints[data.painPoint] || data.painPoint;
  const changeStyleText = changeStyles[data.changeStyle] || data.changeStyle;
  
  return `User is ${painPointText} and ${changeStyleText}. Vision: "${data.vision.substring(0, 100)}${data.vision.length > 100 ? '...' : ''}"`;
};