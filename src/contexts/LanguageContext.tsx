
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface Translations {
  [key: string]: string | string[] | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    // Page Not Found
    notFound: {
      title: '404',
      message: 'It seems your soul journey has led you off the path',
      returnHome: 'Return to Your Journey'
    },
    // Dream Success Celebration
    celebration: {
      dreamReadyTitle: '🎯 Your Dream Journey is Ready!',
      dreamReadyDescription: 'I\'ve transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint'
    },
    // Application System Messages
    system: {
      loading: 'Loading...',
      authenticating: 'Checking authentication...',
      errorOccurred: 'Something went wrong',
      errorDescription: 'We encountered an unexpected error. Please try refreshing the page.',
      refreshPage: 'Refresh Page',
      unauthorized: 'Authentication required',
      redirectingToAuth: 'Redirecting to authentication...'
    },
    // Common Actions
    common: {
      loading: 'Loading',
      save: 'Save',
      cancel: 'Cancel',
      delete: 'Delete',
      edit: 'Edit',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      ok: 'OK',
      close: 'Close',
      back: 'Back',
      next: 'Next',
      previous: 'Previous',
      submit: 'Submit',
      reset: 'Reset',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      copy: 'Copy',
      paste: 'Paste',
      cut: 'Cut'
    },
    // Error Messages
    errors: {
      network: 'Network connection error',
      unauthorized: 'Unauthorized access',
      forbidden: 'Access forbidden',
      notFound: 'Page not found',
      serverError: 'Internal server error',
      validation: 'Validation error',
      required: 'This field is required',
      invalidEmail: 'Please enter a valid email address',
      invalidPassword: 'Password does not meet requirements',
      sessionExpired: 'Your session has expired'
    },
    // Global error key
    error: 'Error',
    // Navigation
    nav: {
      home: 'Home',
      growth: 'Growth',
      coach: 'Coach',
      companion: 'Companion',
      signIn: 'Sign In',
      signOut: 'Sign Out',
      blueprint: 'Blueprint',
      dreams: 'Dreams',
      profile: 'Profile',
      profile360: '360° Profile',
      adminDashboard: 'Admin Dashboard',
      testEnvironment: 'Test Environment'
    },
    // Index Page
    index: {
      welcome: 'Welcome to <span class="text-primary">SoulSync</span>',
      welcomeWithName: 'Welcome to <span class="text-primary">SoulSync</span>, {name}',
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
      signIn: 'Sign In',
      viewBlueprint: 'View Blueprint'
    },
    // Authentication Flow
    auth: {
      createAccount: 'Create Account',
      welcomeBack: 'Welcome Back',
      startJourney: 'Begin your personalized spiritual journey',
      continueJourney: 'Continue your spiritual growth journey',
      email: 'Email',
      password: 'Password',
      confirmPassword: 'Confirm Password',
      enterEmail: 'Enter your email address',
      enterPassword: 'Enter your password',
      confirmPasswordPlaceholder: 'Confirm your password',
      success: 'Success',
      signUpSuccess: 'Account created successfully! Check your email for verification.',
      signUpFailed: 'Failed to create account',
      welcomeBackMessage: 'You\'re successfully signed in',
      signInFailed: 'Failed to sign in',
      passwordsDontMatch: 'Passwords do not match',
      passwordTooShort: 'Password must be at least 6 characters',
      alreadyHaveAccount: 'Already have an account? Sign in',
      needAccount: 'Need an account? Sign up',
      signOutSuccess: 'Signed out successfully',
      signOutSuccessDescription: 'You have been safely signed out',
      signOutError: 'Sign out failed',
      signOutErrorDescription: 'Unable to sign out. Please try again.'
    }
  },
  nl: {
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    // Page Not Found
    notFound: {
      title: '404',
      message: 'Het lijkt erop dat je spirituele reis je van het pad heeft geleid',
      returnHome: 'Keer Terug naar Je Reis'
    },
    // Dream Success Celebration
    celebration: {
      dreamReadyTitle: '🎯 Je Droomreis is Klaar!',
      dreamReadyDescription: 'Ik heb "{goalTitle}" getransformeerd in een gepersonaliseerd, stap-voor-stap routekaart die je unieke ziel blauwdruk eert'
    },
    // Application System Messages
    system: {
      loading: 'Laden...',
      authenticating: 'Authenticatie controleren...',
      errorOccurred: 'Er is iets misgegaan',
      errorDescription: 'We hebben een onverwachte fout tegengekomen. Probeer de pagina te vernieuwen.',
      refreshPage: 'Pagina Vernieuwen',
      unauthorized: 'Authenticatie vereist',
      redirectingToAuth: 'Doorverwijzen naar authenticatie...'
    },
    // Common Actions
    common: {
      loading: 'Laden',
      save: 'Opslaan',
      cancel: 'Annuleren',
      delete: 'Verwijderen',
      edit: 'Bewerken',
      confirm: 'Bevestigen',
      yes: 'Ja',
      no: 'Nee',
      ok: 'OK',
      close: 'Sluiten',
      back: 'Terug',
      next: 'Volgende',
      previous: 'Vorige',
      submit: 'Versturen',
      reset: 'Resetten',
      search: 'Zoeken',
      filter: 'Filteren',
      sort: 'Sorteren',
      view: 'Bekijken',
      download: 'Downloaden',
      upload: 'Uploaden',
      copy: 'Kopiëren',
      paste: 'Plakken',
      cut: 'Knippen'
    },
    // Error Messages
    errors: {
      network: 'Netwerkverbindingsfout',
      unauthorized: 'Ongeautoriseerde toegang',
      forbidden: 'Toegang verboden',
      notFound: 'Pagina niet gevonden',
      serverError: 'Interne serverfout',
      validation: 'Validatiefout',
      required: 'Dit veld is verplicht',
      invalidEmail: 'Voer een geldig e-mailadres in',
      invalidPassword: 'Wachtwoord voldoet niet aan de vereisten',
      sessionExpired: 'Je sessie is verlopen'
    },
    // Global error key
    error: 'Fout',
    // Navigation
    nav: {
      home: 'Thuis',
      growth: 'Groei',
      coach: 'Coach',
      companion: 'Metgezel',
      signIn: 'Inloggen',
      signOut: 'Uitloggen',
      blueprint: 'Blauwdruk',
      dreams: 'Dromen',
      profile: 'Profiel',
      profile360: '360° Profiel',
      adminDashboard: 'Admin Dashboard',
      testEnvironment: 'Test Omgeving'
    },
    // Index Page
    index: {
      welcome: 'Welkom bij <span class="text-primary">SoulSync</span>',
      welcomeWithName: 'Welkom bij <span class="text-primary">SoulSync</span>, {name}',
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
      signIn: 'Inloggen',
      viewBlueprint: 'Bekijk Blauwdruk'
    },
    // Authentication Flow
    auth: {
      createAccount: 'Account Aanmaken',
      welcomeBack: 'Welkom Terug',
      startJourney: 'Begin je gepersonaliseerde spirituele reis',
      continueJourney: 'Zet je spirituele groeireis voort',
      email: 'E-mail',
      password: 'Wachtwoord',
      confirmPassword: 'Bevestig Wachtwoord',
      enterEmail: 'Voer je e-mailadres in',
      enterPassword: 'Voer je wachtwoord in',
      confirmPasswordPlaceholder: 'Bevestig je wachtwoord',
      success: 'Gelukt',
      signUpSuccess: 'Account succesvol aangemaakt! Controleer je e-mail voor verificatie.',
      signUpFailed: 'Account aanmaken mislukt',
      welcomeBackMessage: 'Je bent succesvol ingelogd',
      signInFailed: 'Inloggen mislukt',
      passwordsDontMatch: 'Wachtwoorden komen niet overeen',
      passwordTooShort: 'Wachtwoord moet minstens 6 tekens lang zijn',
      alreadyHaveAccount: 'Heb je al een account? Log in',
      needAccount: 'Heb je een account nodig? Meld je aan',
      signOutSuccess: 'Succesvol uitgelogd',
      signOutSuccessDescription: 'Je bent veilig uitgelogd',
      signOutError: 'Uitloggen mislukt',
      signOutErrorDescription: 'Kon niet uitloggen. Probeer het opnieuw.'
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
