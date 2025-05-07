
export type VoiceOptions = {
  rate?: number;
  pitch?: number;
  volume?: number;
  voice?: SpeechSynthesisVoice;
};

class VoiceService {
  private static instance: VoiceService;
  private speaking: boolean = false;
  private defaultOptions: VoiceOptions = {
    rate: 1,
    pitch: 1,
    volume: 1,
  };

  private constructor() {
    // Singleton pattern
  }

  public static getInstance(): VoiceService {
    if (!VoiceService.instance) {
      VoiceService.instance = new VoiceService();
    }
    return VoiceService.instance;
  }

  public getVoices(): SpeechSynthesisVoice[] {
    return window.speechSynthesis.getVoices();
  }

  public async speak(text: string, options: VoiceOptions = {}): Promise<void> {
    // If browser doesn't support speech synthesis, return
    if (!window.speechSynthesis) {
      console.error('Speech synthesis not supported');
      return;
    }
    
    const opts = { ...this.defaultOptions, ...options };
    const utterance = new SpeechSynthesisUtterance(text);
    
    utterance.rate = opts.rate || 1;
    utterance.pitch = opts.pitch || 1;
    utterance.volume = opts.volume || 1;
    
    if (opts.voice) {
      utterance.voice = opts.voice;
    }
    
    this.speaking = true;

    // Make sure we get all available voices
    if (speechSynthesis.getVoices().length === 0) {
      await new Promise<void>((resolve) => {
        speechSynthesis.onvoiceschanged = () => {
          resolve();
        };
      });
    }

    // Try to find a female voice that sounds good
    if (!opts.voice) {
      const voices = speechSynthesis.getVoices();
      const femaleVoice = voices.find(voice => 
        (voice.name.includes('female') || 
         voice.name.includes('Samantha') ||
         voice.name.includes('Victoria')) && 
        voice.lang.includes('en')
      );
      if (femaleVoice) {
        utterance.voice = femaleVoice;
      }
    }

    return new Promise((resolve) => {
      utterance.onend = () => {
        this.speaking = false;
        resolve();
      };
      speechSynthesis.speak(utterance);
    });
  }

  public stop(): void {
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      this.speaking = false;
    }
  }

  public isSpeaking(): boolean {
    return this.speaking;
  }
}

export default VoiceService.getInstance();
