export interface StewardIntroductionStep {
  id: string;
  type: 'introduction' | 'capability' | 'confirmation';
  message: string;
  title: string;
  showContinue: boolean;
  isComplete?: boolean;
}

export interface StewardIntroductionState {
  isActive: boolean;
  currentStep: number;
  steps: StewardIntroductionStep[];
  completed: boolean;
}