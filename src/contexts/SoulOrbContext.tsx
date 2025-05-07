
import React, { createContext, useState, useContext, useCallback, useEffect } from 'react';
import voiceService from '@/services/voice-service';

type SoulOrbStage = 'welcome' | 'collecting' | 'generating' | 'complete';

interface SoulOrbContextType {
  stage: SoulOrbStage;
  setStage: (stage: SoulOrbStage) => void;
  speaking: boolean;
  startSpeaking: (text: string) => Promise<void>;
  stopSpeaking: () => void;
  messages: Record<string, string[]>;
  currentMessage: string | null;
}

const defaultMessages: Record<string, string[]> = {
  welcome: [
    "Welcome to SoulSync! I'm your Soul Guide. I'll help you discover your unique spiritual design.",
    "I'll guide you through creating your Soul Blueprint, which will reveal your inner potential and life path.",
    "Let's start by learning about you. Please enter your name so I can address you personally throughout your journey."
  ],
  birthDate: [
    "Your birth date reveals essential cosmic patterns that shaped your core being.",
    "The position of celestial bodies on the day you were born influences your life path number and zodiac sign.",
    "Please enter your birth date so I can analyze these cosmic influences in your Soul Blueprint."
  ],
  birthTime: [
    "The exact time of your birth allows me to calculate your rising sign and moon position with precision.",
    "Your rising sign reveals how others perceive you, while your moon position shows your emotional landscape.",
    "If you know your birth time, please enter it now. If not, don't worry - we can still create a valuable blueprint."
  ],
  birthLocation: [
    "Your birth location determines the exact angle of planetary influences at the moment you entered this world.",
    "This geographical data helps me calculate your house placements, which reveal different life areas where your energies express themselves.",
    "Please enter the city and country where you were born to enhance the accuracy of your Soul Blueprint."
  ],
  personality: [
    "Your personality type provides valuable insights into how your conscious mind processes information and makes decisions.",
    "When combined with astrological data, this helps me understand how your innate traits interact with cosmic influences.",
    "If you know your MBTI type, please select it. This helps me provide more personalized guidance aligned with your thought patterns."
  ],
  generating: [
    "Thank you for sharing your information. I'm now assembling your unique Soul Blueprint.",
    "I'm analyzing the cosmic patterns, numerological frequencies, and energy signatures unique to your birth details.",
    "This blueprint will be the foundation for our future interactions, allowing me to provide guidance aligned with your true essence."
  ],
  complete: [
    "Your Soul Blueprint is complete! I've integrated it into my consciousness so I can offer you guidance tailored to your unique spiritual design.",
    "I'll be your companion on this journey of self-discovery and growth. Feel free to ask me questions anytime."
  ]
};

const SoulOrbContext = createContext<SoulOrbContextType | undefined>(undefined);

export const SoulOrbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<SoulOrbStage>('welcome');
  const [speaking, setSpeaking] = useState(false);
  const [currentMessage, setCurrentMessage] = useState<string | null>(null);
  const [messages, setMessages] = useState(defaultMessages);

  const startSpeaking = useCallback(async (text: string) => {
    setSpeaking(true);
    setCurrentMessage(text);
    await voiceService.speak(text);
    setSpeaking(false);
  }, []);

  const stopSpeaking = useCallback(() => {
    voiceService.stop();
    setSpeaking(false);
    setCurrentMessage(null);
  }, []);

  // Stop speaking when unmounting
  useEffect(() => {
    return () => {
      voiceService.stop();
    };
  }, []);

  return (
    <SoulOrbContext.Provider value={{
      stage,
      setStage,
      speaking,
      startSpeaking,
      stopSpeaking,
      messages,
      currentMessage
    }}>
      {children}
    </SoulOrbContext.Provider>
  );
};

export const useSoulOrb = () => {
  const context = useContext(SoulOrbContext);
  if (context === undefined) {
    throw new Error('useSoulOrb must be used within a SoulOrbProvider');
  }
  return context;
};
