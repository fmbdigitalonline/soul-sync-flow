export interface StewardIntroductionStep {
  id: string;
  type: 'introduction' | 'capability' | 'confirmation';
  message: string;
  title: string;
  showContinue: boolean;
  isComplete?: boolean;
  audioUrl?: string;
}

export interface StewardIntroductionState {
  isActive: boolean;
  currentStep: number;
  steps: StewardIntroductionStep[];
  completed: boolean;
  audioMuted: boolean;
  currentAudio: HTMLAudioElement | null;
  isAudioPlaying: boolean;
}