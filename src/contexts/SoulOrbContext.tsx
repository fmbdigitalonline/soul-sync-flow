
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
    "Let's start by learning about you. What's your name?"
  ],
  birthDate: [
    "Great! Now I need to know when you were born. Your birth date reveals important numerological and astrological patterns.",
    "Your birth date contains the cosmic imprint of planetary alignments that shape your core traits."
  ],
  birthTime: [
    "If you know your birth time, that will help me calculate your rising sign and moon position.",
    "The exact time you were born determines the precise positions of celestial bodies in your chart."
  ],
  birthLocation: [
    "Where were you born? Your birth location is essential for accurate astrological calculations.",
    "The geographical coordinates of your birth place help determine the houses in your chart."
  ],
  personality: [
    "If you know your personality type, that gives me additional insights to integrate with your cosmic blueprint.",
    "This helps me understand how your conscious mind interacts with your subconscious patterns."
  ],
  generating: [
    "Thank you for sharing your information. I'm now gathering cosmic data and assembling your Soul Blueprint.",
    "I'm analyzing planetary positions, numerological frequencies, and energy patterns unique to you.",
    "This blueprint will serve as our foundation for providing personalized guidance aligned with your true self."
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
