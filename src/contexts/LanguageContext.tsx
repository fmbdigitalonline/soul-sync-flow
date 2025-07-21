
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface Translations {
  [key: string]: string | string[] | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    nav: {
      home: 'Home',
      growth: 'Growth',
      coach: 'Coach',
      companion: 'Companion',
      signIn: 'Sign In'
    },
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    index: {
      welcome: 'Welcome to <span class="text-primary">SoulSync</span>',
      subtitle: 'Discover your authentic path through personalized AI guidance and spiritual growth tools.',
      rotatingMessages: [
        'Discover your authentic path through personalized AI guidance and spiritual growth tools.',
        'Transform your dreams into reality with AI-powered insights.',
        'Unlock your spiritual potential with personalized growth programs.',
        'Connect with your inner wisdom through advanced technology.'
      ],
      welcomeBackReady: 'Welcome back! Your personalized journey awaits.',
      createToGetStarted: 'Create your blueprint to unlock your personalized experience.',
      startingTutorial: 'Starting your personalized tour...',
      backToHome: '← Back to Home',
      dreams: 'Dreams',
      dreamsDesc: 'Transform your aspirations into actionable plans',
      growth: 'Growth',
      growthDesc: 'Spiritual development and personal evolution',
      companion: 'Companion', 
      companionDesc: 'AI-powered guidance and support',
      demo: 'View Demo',
      takeTour: 'Take Tour',
      startJourney: 'Start Your Journey',
      getStarted: 'Get Started',
      signIn: 'Sign In'
    },
    auth: {
      welcomeBack: 'Welcome Back',
      continueJourney: 'Continue your spiritual journey',
      email: 'Email',
      enterEmail: 'Enter your email',
      password: 'Password',
      enterPassword: 'Enter your password',
      confirmPassword: 'Confirm Password',
      enterConfirmPassword: 'Confirm your password',
      createAccount: 'Create Account',
      signUpSuccess: 'Account created successfully! Please check your email to verify your account.',
      passwordsDontMatch: 'Passwords don\'t match',
      passwordTooShort: 'Password must be at least 6 characters',
      needAccount: 'Need an account?',
      alreadyHaveAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      signUpTitle: 'Create Your Account',
      joinCommunity: 'Join our spiritual community'
    }
  },
  nl: {
    nav: {
      home: 'Thuis',
      growth: 'Groei',
      coach: 'Coach',
      companion: 'Metgezel',
      signIn: 'Inloggen'
    },
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    index: {
      welcome: 'Welkom bij <span class="text-primary">SoulSync</span>',
      subtitle: 'Ontdek je authentieke pad door gepersonaliseerde AI-begeleiding en spirituele groei-tools.',
      rotatingMessages: [
        'Ontdek je authentieke pad door gepersonaliseerde AI-begeleiding en spirituele groei-tools.',
        'Transformeer je dromen in realiteit met AI-gedreven inzichten.',
        'Ontsluit je spirituele potentieel met gepersonaliseerde groeiprogramma\'s.',
        'Verbind met je innerlijke wijsheid door geavanceerde technologie.'
      ],
      welcomeBackReady: 'Welkom terug! Je gepersonaliseerde reis wacht op je.',
      createToGetStarted: 'Maak je blauwdruk om je gepersonaliseerde ervaring te ontgrendelen.',
      startingTutorial: 'Je gepersonaliseerde tour wordt gestart...',
      backToHome: '← Terug naar Home',
      dreams: 'Dromen',
      dreamsDesc: 'Transformeer je aspiraties in uitvoerbare plannen',
      growth: 'Groei',
      growthDesc: 'Spirituele ontwikkeling en persoonlijke evolutie',
      companion: 'Metgezel',
      companionDesc: 'AI-gedreven begeleiding en ondersteuning',
      demo: 'Bekijk Demo',
      takeTour: 'Tour Nemen',
      startJourney: 'Begin Je Reis',
      getStarted: 'Aan de Slag',
      signIn: 'Inloggen'
    },
    auth: {
      welcomeBack: 'Welkom Terug',
      continueJourney: 'Zet je spirituele reis voort',
      email: 'E-mail',
      enterEmail: 'Voer je e-mail in',
      password: 'Wachtwoord',
      enterPassword: 'Voer je wachtwoord in',
      confirmPassword: 'Bevestig Wachtwoord',
      enterConfirmPassword: 'Bevestig je wachtwoord',
      createAccount: 'Account Aanmaken',
      signUpSuccess: 'Account succesvol aangemaakt! Controleer je e-mail om je account te verifiëren.',
      passwordsDontMatch: 'Wachtwoorden komen niet overeen',
      passwordTooShort: 'Wachtwoord moet minimaal 6 tekens bevatten',
      needAccount: 'Heb je een account nodig?',
      alreadyHaveAccount: 'Heb je al een account?',
      signUp: 'Registreren',
      signIn: 'Inloggen',
      signUpTitle: 'Maak Je Account Aan',
      joinCommunity: 'Word lid van onze spirituele gemeenschap'
    }
  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const getNestedValue = (obj: any, path: string): any => {
  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const saved = localStorage.getItem('soulsync-language');
    return (saved as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('soulsync-language', language);
  }, [language]);

  const t = (key: string): string => {
    const value = getNestedValue(translations[language], key);
    
    if (value !== undefined) {
      // Handle arrays by returning first element or joining them
      if (Array.isArray(value)) {
        return value[0] || key;
      }
      return typeof value === 'string' ? value : key;
    }
    
    // Fallback to English if current language doesn't have the key
    const fallbackValue = getNestedValue(translations.en, key);
    if (fallbackValue !== undefined) {
      console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
      if (Array.isArray(fallbackValue)) {
        return fallbackValue[0] || key;
      }
      return typeof fallbackValue === 'string' ? fallbackValue : key;
    }
    
    // Final fallback: return the key itself but log it
    console.error(`Translation missing for key "${key}" in both "${language}" and English`);
    return key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
