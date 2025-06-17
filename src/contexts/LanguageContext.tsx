
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations = {
  en: {
    // Language names
    "language.english": "English",
    "language.dutch": "Dutch",
    
    // Common
    "back": "Back",
    "continue": "Continue",
    "skip": "Skip",
    "next": "Next",
    "previous": "Previous",
    "save": "Save",
    "cancel": "Cancel",
    "loading": "Loading...",
    "error": "Error",

    // Index page
    "index.welcome": "Welcome to <span class='text-soul-purple'>Soul Sync</span>",
    "index.subtitle": "Discover your authentic path through personalized AI guidance and spiritual growth tools.",
    "index.rotatingMessages": [
      "Discover your authentic path through personalized AI guidance",
      "Unlock your spiritual potential with ancient wisdom meets modern technology",
      "Transform your life with personalized cosmic insights and guidance",
      "Navigate your journey with AI-powered spiritual coaching"
    ],
    "index.dreams": "Dreams",
    "index.dreamsDesc": "Heart desires & manifestation",
    "index.growth": "Growth", 
    "index.growthDesc": "Inner wisdom & reflection",
    "index.companion": "Companion",
    "index.companionDesc": "AI guidance & support",
    "index.demo": "View Personality Demo",
    "index.backToHome": "← Back to Home",
    "index.getStarted": "Get Started",
    "index.signIn": "Sign In",
    "index.startJourney": "Start Your Journey",
    "index.takeTour": "Take Tour",
    "index.chatWithCompanion": "Chat with Companion",
    "index.welcomeBackReady": "Welcome back! Your spiritual companion is ready to guide you.",
    "index.createToGetStarted": "Create your cosmic blueprint to get started on your journey.",
    "index.startingTutorial": "Starting your guided tour...",

    // Goals
    "goals.primaryFocus": "What's your primary focus right now?",
    "goals.exploring": "I'm still exploring and figuring things out",
    "goals.personalGrowth": "Personal growth and self-improvement",
    "goals.careerSuccess": "Career success and professional development", 
    "goals.relationships": "Relationships and connection with others",
    "goals.healthWellness": "Health and wellness optimization",
    "goals.creativity": "Creative expression and artistic pursuits",
    "goals.spiritualDevelopment": "Spiritual development and inner peace",
    
    "goals.guidanceLevel": "How much guidance do you prefer?",
    "goals.lightTouch": "Light touch",
    "goals.structuredGuidance": "Structured guidance",
    "goals.guidance1": "Minimal guidance - I prefer to explore independently",
    "goals.guidance2": "Light guidance - Occasional suggestions when I ask",
    "goals.guidance3": "Balanced approach - Regular check-ins and advice",
    "goals.guidance4": "Active guidance - Frequent suggestions and structure",
    "goals.guidance5": "Full guidance - Comprehensive support and daily direction",
    
    "goals.yourSelections": "Your Selections",
    "goals.focus": "Focus:",
    "goals.guidanceLevelLabel": "Guidance Level:",
    "goals.completeSetup": "Complete Setup",
    "goals.saving": "Saving...",
    "goals.tryAgain": "Try Again",
    "goals.errorSaving": "Error saving preferences",

    // Personality
    "personality.energySource": "Where do you get your energy?",
    "personality.beingAlone": "Being alone",
    "personality.beingWithPeople": "Being with people",
    "personality.workspaceStyle": "How do you prefer your workspace?",
    "personality.tidyOrganized": "Tidy and organized",
    "personality.creativeChaos": "Creative chaos",
    "personality.planningStyle": "How do you approach planning?",
    "personality.bookInAdvance": "Book everything in advance",
    "personality.seeWhatHappens": "See what happens",
    "personality.quickQuestion": "Quick question ({current} of {total})",
    "personality.yourPersonalityProfile": "Your Personality Profile",
    "personality.likelyStyle": "Your likely style:",
    "personality.confidence": "{confidence}% confidence",
    "personality.topMbtiMatches": "Top MBTI matches:",
    "personality.howAccurate": "How accurate does this feel?",
    "personality.notQuiteRight": "Not quite right",
    "personality.spotOn": "Spot on!",
    "personality.outOfStars": "{rating}/5 stars",
    "personality.processing": "Processing...",
    "personality.continueWithProfile": "Continue with this profile",
    "personality.keepRefining": "We'll keep refining your profile as we learn more about you.",
  },
  nl: {
    // Language names
    "language.english": "Engels",
    "language.dutch": "Nederlands",
    
    // Common
    "back": "Terug",
    "continue": "Verder",
    "skip": "Overslaan",
    "next": "Volgende",
    "previous": "Vorige",
    "save": "Opslaan",
    "cancel": "Annuleren",
    "loading": "Laden...",
    "error": "Fout",

    // Index page
    "index.welcome": "Welkom bij <span class='text-soul-purple'>Soul Sync</span>",
    "index.subtitle": "Ontdek je authentieke pad door gepersonaliseerde AI-begeleiding en spirituele groeitools.",
    "index.rotatingMessages": [
      "Ontdek je authentieke pad door gepersonaliseerde AI-begeleiding",
      "Ontsluit je spirituele potentieel met oude wijsheid ontmoet moderne technologie",
      "Transformeer je leven met gepersonaliseerde kosmische inzichten en begeleiding",
      "Navigeer je reis met AI-aangedreven spirituele coaching"
    ],
    "index.dreams": "Dromen",
    "index.dreamsDesc": "Hartverlangens & manifestatie",
    "index.growth": "Groei",
    "index.growthDesc": "Innerlijke wijsheid & reflectie",
    "index.companion": "Metgezel",
    "index.companionDesc": "AI-begeleiding & ondersteuning",
    "index.demo": "Bekijk Persoonlijkheid Demo",
    "index.backToHome": "← Terug naar Home",
    "index.getStarted": "Begin",
    "index.signIn": "Inloggen",
    "index.startJourney": "Begin Je Reis",
    "index.takeTour": "Neem een Rondleiding",
    "index.chatWithCompanion": "Chat met Metgezel",
    "index.welcomeBackReady": "Welkom terug! Je spirituele metgezel is klaar om je te begeleiden.",
    "index.createToGetStarted": "Maak je kosmische blauwdruk om te beginnen aan je reis.",
    "index.startingTutorial": "Je begeleide tour wordt gestart...",

    // Goals
    "goals.primaryFocus": "Wat is je primaire focus op dit moment?",
    "goals.exploring": "Ik ben nog aan het verkennen en uitzoeken",
    "goals.personalGrowth": "Persoonlijke groei en zelfverbetering",
    "goals.careerSuccess": "Carrièresucces en professionele ontwikkeling",
    "goals.relationships": "Relaties en verbinding met anderen",
    "goals.healthWellness": "Gezondheid en wellness optimalisatie",
    "goals.creativity": "Creatieve expressie en artistieke bezigheden",
    "goals.spiritualDevelopment": "Spirituele ontwikkeling en innerlijke vrede",
    
    "goals.guidanceLevel": "Hoeveel begeleiding geef je de voorkeur?",
    "goals.lightTouch": "Lichte aanraking",
    "goals.structuredGuidance": "Gestructureerde begeleiding",
    "goals.guidance1": "Minimale begeleiding - Ik verkies zelfstandig te verkennen",
    "goals.guidance2": "Lichte begeleiding - Af en toe suggesties wanneer ik vraag",
    "goals.guidance3": "Gebalanceerde aanpak - Regelmatige check-ins en advies",
    "goals.guidance4": "Actieve begeleiding - Frequente suggesties en structuur",
    "goals.guidance5": "Volledige begeleiding - Uitgebreide ondersteuning en dagelijkse richting",
    
    "goals.yourSelections": "Je Selecties",
    "goals.focus": "Focus:",
    "goals.guidanceLevelLabel": "Begeleidingsniveau:",
    "goals.completeSetup": "Installatie Voltooien",
    "goals.saving": "Opslaan...",
    "goals.tryAgain": "Probeer Opnieuw",
    "goals.errorSaving": "Fout bij het opslaan van voorkeuren",

    // Personality
    "personality.energySource": "Waar haal je je energie vandaan?",
    "personality.beingAlone": "Alleen zijn",
    "personality.beingWithPeople": "Bij mensen zijn",
    "personality.workspaceStyle": "Hoe geef je de voorkeur aan je werkruimte?",
    "personality.tidyOrganized": "Netjes en georganiseerd",
    "personality.creativeChaos": "Creatieve chaos",
    "personality.planningStyle": "Hoe benader je planning?",
    "personality.bookInAdvance": "Alles van tevoren boeken",
    "personality.seeWhatHappens": "Kijken wat er gebeurt",
    "personality.quickQuestion": "Snelle vraag ({current} van {total})",
    "personality.yourPersonalityProfile": "Jouw Persoonlijkheidsprofiel",
    "personality.likelyStyle": "Je waarschijnlijke stijl:",
    "personality.confidence": "{confidence}% vertrouwen",
    "personality.topMbtiMatches": "Top MBTI overeenkomsten:",
    "personality.howAccurate": "Hoe accuraat voelt dit?",
    "personality.notQuiteRight": "Niet helemaal juist",
    "personality.spotOn": "Precies goed!",
    "personality.outOfStars": "{rating}/5 sterren",
    "personality.processing": "Verwerken...",
    "personality.continueWithProfile": "Ga verder met dit profiel",
    "personality.keepRefining": "We blijven je profiel verfijnen naarmate we meer over je leren.",
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string): any => {
    const keys = key.split('.');
    let value: any = translations[language];
    
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return translations.en[key as keyof typeof translations.en] || key;
      }
    }
    
    return value !== undefined ? value : translations.en[key as keyof typeof translations.en] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
