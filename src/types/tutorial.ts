export interface TutorialStep {
  id: string;
  title: string;
  content: string;
  showContinue: boolean;
  isComplete?: boolean;
}

export interface TutorialState {
  isActive: boolean;
  currentStep: number;
  steps: TutorialStep[];
  completed: boolean;
}