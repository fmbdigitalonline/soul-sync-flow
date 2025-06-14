
import React, { createContext, useState, useContext } from 'react';

// Define the context type
export type SoulOrbContextType = {
  stage: 'welcome' | 'collecting' | 'generating' | 'complete' | 'error';
  setStage: (stage: 'welcome' | 'collecting' | 'generating' | 'complete' | 'error') => void;
  speaking: boolean;
  startSpeaking: (message: string) => Promise<void>;
  stopSpeaking: () => void;
  messages: {
    welcome: string[];
    birthDate: string[];
    birthTime: string[];
    birthLocation: string[];
    personality: string[];
    generating: string[];
    complete: string[];
  };
  speak: (message: string) => void;  // Add the speak method
};

// Create the context with a default value
const SoulOrbContext = createContext<SoulOrbContextType | undefined>(undefined);

// Provider component
export const SoulOrbProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stage, setStage] = useState<'welcome' | 'collecting' | 'generating' | 'complete' | 'error'>('welcome');
  const [speaking, setSpeaking] = useState(false);

  // Collection of predefined messages for each stage
  const messages = {
    welcome: [
      "Welcome to SoulSync! I'm here to help you create your personal soul blueprint.",
      "Let's start your journey of self-discovery together. First, I'll need to know your name.",
      "Your name carries energy and vibration that influences your cosmic blueprint."
    ],
    birthDate: [
      "Your birth date contains important cosmic information.",
      "The day you were born reveals your life path number and zodiac sign."
    ],
    birthTime: [
      "Your birth time helps determine your ascendant and house placements.",
      "The more precise your birth time, the more accurate your blueprint will be."
    ],
    birthLocation: [
      "Where you were born matters! It affects the angle of the planets in your chart.",
      "Your birth location gives us the geographic coordinates for precise calculations."
    ],
    personality: [
      "Your personality type adds another dimension to your blueprint.",
      "This helps us understand how you process information and make decisions."
    ],
    generating: [
      "Generating your unique soul blueprint now...",
      "Analyzing cosmic patterns from the moment of your birth.",
      "Integrating multiple wisdom systems to create your complete profile."
    ],
    complete: [
      "Your soul blueprint is ready to explore!",
      "Let's discover your unique cosmic design together."
    ]
  };

  // Method to start speaking a message
  const startSpeaking = async (message: string): Promise<void> => {
    if (speaking) {
      stopSpeaking();
    }
    
    setSpeaking(true);
    
    // Simulate speech with a timer based on message length
    const speechDuration = message.length * 50; // roughly 50ms per character
    
    return new Promise((resolve) => {
      setTimeout(() => {
        setSpeaking(false);
        resolve();
      }, Math.min(speechDuration, 5000)); // Cap at 5 seconds max
    });
  };

  // Method to stop speaking
  const stopSpeaking = () => {
    setSpeaking(false);
  };
  
  // Enhanced speak method with better timing
  const speak = (message: string) => {
    if (speaking) {
      stopSpeaking();
    }
    
    console.log('🗣️ Soul Coach:', message); // Log for development
    setSpeaking(true);
    
    // Calculate speech duration based on message complexity
    const baseTime = 2000; // 2 second minimum
    const wordsPerMinute = 150; // Average speaking speed
    const words = message.split(' ').length;
    const calculatedDuration = Math.max(baseTime, (words / wordsPerMinute) * 60 * 1000);
    const speechDuration = Math.min(calculatedDuration, 8000); // Cap at 8 seconds max
    
    setTimeout(() => {
      setSpeaking(false);
    }, speechDuration);
  };

  const value = {
    stage,
    setStage,
    speaking,
    startSpeaking,
    stopSpeaking,
    messages,
    speak
  };

  return <SoulOrbContext.Provider value={value}>{children}</SoulOrbContext.Provider>;
};

// Custom hook for using the context
export const useSoulOrb = () => {
  const context = useContext(SoulOrbContext);
  if (context === undefined) {
    throw new Error('useSoulOrb must be used within a SoulOrbProvider');
  }
  return context;
};
