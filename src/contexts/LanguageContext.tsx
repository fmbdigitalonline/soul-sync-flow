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
      signIn: 'Sign In',
      signOut: 'Sign Out'
    },
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    breadcrumbs: {
      home: 'Home',
      profile: 'Profile',
      settings: 'Settings',
      admin: 'Admin',
      blueprint: 'Blueprint',
      dreams: 'Dreams',
      growth: 'Growth',
      companion: 'Companion',
      user360: '360° Profile'
    },
    forms: {
      firstName: 'First Name',
      lastName: 'Last Name',
      phone: 'Phone',
      address: 'Address',
      city: 'City',
      country: 'Country',
      zipCode: 'ZIP Code',
      dateOfBirth: 'Date of Birth',
      gender: 'Gender',
      title: 'Title',
      description: 'Description',
      name: 'Name',
      message: 'Message'
    },
    admin: {
      title: 'Admin Dashboard',
      subtitle: 'Monitor and configure Soul Guide innovations',
      overview: 'Overview',
      users: 'Users',
      analytics: 'Analytics',
      health: 'Health',
      config: 'Configuration',
      settings: 'Settings',
      monitoring: 'Monitoring',
      pie: 'PIE',
      vfpGraph: 'VFP-Graph',
      tmg: 'TMG',
      acs: 'ACS',
      systemHealth: 'System Health',
      userManagement: 'User Management',
      realTimeMonitoring: 'Real-time monitoring'
    },
    time: {
      now: 'Now',
      today: 'Today',
      yesterday: 'Yesterday',
      tomorrow: 'Tomorrow',
      thisWeek: 'This Week',
      lastWeek: 'Last Week',
      nextWeek: 'Next Week',
      thisMonth: 'This Month',
      lastMonth: 'Last Month',
      nextMonth: 'Next Month',
      seconds: 'seconds',
      minutes: 'minutes',
      hours: 'hours',
      days: 'days',
      weeks: 'weeks',
      months: 'months',
      years: 'years',
      ago: 'ago',
      from: 'from',
      at: 'at',
      on: 'on',
      in: 'in'
    },
    status: {
      online: 'Online',
      offline: 'Offline',
      active: 'Active',
      inactive: 'Inactive',
      pending: 'Pending',
      processing: 'Processing',
      completed: 'Completed',
      failed: 'Failed',
      cancelled: 'Cancelled',
      paused: 'Paused',
      running: 'Running',
      stopped: 'Stopped',
      healthy: 'Healthy',
      warning: 'Warning',
      error: 'Error',
      available: 'Available',
      unavailable: 'Unavailable',
      connected: 'Connected',
      disconnected: 'Disconnected'
    },
    dreams: {
      journeyReady: '🎯 Your Dream Journey is Ready!',
      journeyDesc: 'I\'ve transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint',
      congratulations: '🎉 Congratulations! Your "{goalTitle}" journey is beautifully designed and ready to unfold.',
      milestonesCreated: 'I\'ve created {count} personalized milestones that align perfectly with your soul blueprint.',
      showRoadmap: 'Let me show you your complete roadmap! Each milestone is carefully timed and designed to work with your natural energy patterns and decision-making style.',
      upcomingMilestones: 'Here are your upcoming milestones. Notice how they\'re sequenced to build momentum and honor your {personality} nature.',
      specificTasks: 'I\'ve also created specific tasks for each milestone. These are optimized for your cognitive style and include blueprint-based reasoning to help you understand why each step matters.',
      readyToBegin: 'Ready to begin? I recommend starting with this first task - it\'s perfectly aligned with your blueprint and designed to create early momentum. Shall we dive in?',
      navigatingTo: '🎯 Navigating to {section} section',
      selectedMilestone: '🎯 Selected milestone: {title}',
      unique: 'unique'
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
      confirmPasswordPlaceholder: 'Confirm your password',
      createAccount: 'Create Account',
      signUpSuccess: 'Account created successfully! Please check your email to verify your account.',
      passwordsDontMatch: 'Passwords don\'t match',
      passwordTooShort: 'Password must be at least 6 characters',
      needAccount: 'Need an account?',
      alreadyHaveAccount: 'Already have an account?',
      signUp: 'Sign Up',
      signIn: 'Sign In',
      signUpTitle: 'Create Your Account',
      joinCommunity: 'Join our spiritual community',
      startJourney: 'Start your personalized journey of self-discovery and growth.',
      success: 'Success',
      signUpFailed: 'Sign up failed',
      signInFailed: 'Sign in failed',
      welcomeBackMessage: 'Welcome back! You have successfully signed in.',
      signOutSuccess: 'Signed out successfully',
      signOutSuccessDescription: 'You have been safely signed out of your account.',
      signOutError: 'Sign out failed',
      signOutErrorDescription: 'There was an error signing you out. Please try again.'
    },
    common: {
      loading: 'Loading...',
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
    errors: {
      network: 'Network connection error. Please check your connection and try again.',
      unauthorized: 'You are not authorized to access this resource.',
      forbidden: 'Access to this resource is forbidden.',
      notFound: 'The requested resource was not found.',
      serverError: 'An internal server error occurred. Please try again later.',
      validation: 'Please check your input and try again.',
      required: 'This field is required.',
      invalidEmail: 'Please enter a valid email address.',
      invalidPassword: 'Password must be at least 8 characters long.',
      sessionExpired: 'Your session has expired. Please sign in again.',
      unknown: 'An unexpected error occurred. Please try again.'
    },
    profile: {
      logoutSuccess: 'You have been successfully signed out.',
      logoutError: 'There was an error signing you out. Please try again.'
    },
    notFound: {
      title: '404',
      message: 'It seems your soul journey has led you off the path',
      returnButton: 'Return to Your Journey'
    },
    error: 'Error'
  },
  nl: {
    nav: {
      home: 'Thuis',
      growth: 'Groei',
      coach: 'Coach',
      companion: 'Metgezel',
      signIn: 'Inloggen',
      signOut: 'Uitloggen'
    },
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    breadcrumbs: {
      home: 'Thuis',
      profile: 'Profiel',
      settings: 'Instellingen',
      admin: 'Beheer',
      blueprint: 'Blauwdruk',
      dreams: 'Dromen',
      growth: 'Groei',
      companion: 'Metgezel',
      user360: '360° Profiel'
    },
    forms: {
      firstName: 'Voornaam',
      lastName: 'Achternaam',
      phone: 'Telefoon',
      address: 'Adres',
      city: 'Stad',
      country: 'Land',
      zipCode: 'Postcode',
      dateOfBirth: 'Geboortedatum',
      gender: 'Geslacht',
      title: 'Titel',
      description: 'Beschrijving',
      name: 'Naam',
      message: 'Bericht'
    },
    admin: {
      title: 'Beheer Dashboard',
      subtitle: 'Monitor en configureer Soul Guide innovaties',
      overview: 'Overzicht',
      users: 'Gebruikers',
      analytics: 'Analyses',
      health: 'Gezondheid',
      config: 'Configuratie',
      settings: 'Instellingen',
      monitoring: 'Monitoring',
      pie: 'PIE',
      vfpGraph: 'VFP-Graph',
      tmg: 'TMG',
      acs: 'ACS',
      systemHealth: 'Systeemgezondheid',
      userManagement: 'Gebruikersbeheer',
      realTimeMonitoring: 'Real-time monitoring'
    },
    time: {
      now: 'Nu',
      today: 'Vandaag',
      yesterday: 'Gisteren',
      tomorrow: 'Morgen',
      thisWeek: 'Deze Week',
      lastWeek: 'Vorige Week',
      nextWeek: 'Volgende Week',
      thisMonth: 'Deze Maand',
      lastMonth: 'Vorige Maand',
      nextMonth: 'Volgende Maand',
      seconds: 'seconden',
      minutes: 'minuten',
      hours: 'uren',
      days: 'dagen',
      weeks: 'weken',
      months: 'maanden',
      years: 'jaren',
      ago: 'geleden',
      from: 'van',
      at: 'om',
      on: 'op',
      in: 'over'
    },
    status: {
      online: 'Online',
      offline: 'Offline',
      active: 'Actief',
      inactive: 'Inactief',
      pending: 'In afwachting',
      processing: 'Verwerkend',
      completed: 'Voltooid',
      failed: 'Mislukt',
      cancelled: 'Geannuleerd',
      paused: 'Gepauzeerd',
      running: 'Actief',
      stopped: 'Gestopt',
      healthy: 'Gezond',
      warning: 'Waarschuwing',
      error: 'Fout',
      available: 'Beschikbaar',
      unavailable: 'Niet beschikbaar',
      connected: 'Verbonden',
      disconnected: 'Verbroken'
    },
    dreams: {
      journeyReady: '🎯 Je Droomreis is Klaar!',
      journeyDesc: 'Ik heb "{goalTitle}" getransformeerd in een gepersonaliseerd, stap-voor-stap roadmap dat jouw unieke ziel blauwdruk eert',
      congratulations: '🎉 Gefeliciteerd! Je "{goalTitle}" reis is prachtig ontworpen en klaar om te ontvouwen.',
      milestonesCreated: 'Ik heb {count} gepersonaliseerde mijlpalen gecreëerd die perfect aansluiten bij jouw ziel blauwdruk.',
      showRoadmap: 'Laat me je complete roadmap tonen! Elke mijlpaal is zorgvuldig getimed en ontworpen om te werken met jouw natuurlijke energiepatronen en besluitvormingsstijl.',
      upcomingMilestones: 'Hier zijn je aankomende mijlpalen. Merk op hoe ze zijn gesequenced om momentum op te bouwen en jouw {personality} natuur te eren.',
      specificTasks: 'Ik heb ook specifieke taken voor elke mijlpaal gecreëerd. Deze zijn geoptimaliseerd voor jouw cognitieve stijl en bevatten blauwdruk-gebaseerde redenering om je te helpen begrijpen waarom elke stap belangrijk is.',
      readyToBegin: 'Klaar om te beginnen? Ik raad aan om te starten met deze eerste taak - het is perfect afgestemd op jouw blauwdruk en ontworpen om vroege momentum te creëren. Zullen we erin duiken?',
      navigatingTo: '🎯 Navigeren naar {section} sectie',
      selectedMilestone: '🎯 Geselecteerde mijlpaal: {title}',
      unique: 'uniek'
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
      confirmPasswordPlaceholder: 'Bevestig je wachtwoord',
      createAccount: 'Account Aanmaken',
      signUpSuccess: 'Account succesvol aangemaakt! Controleer je e-mail om je account te verifiëren.',
      passwordsDontMatch: 'Wachtwoorden komen niet overeen',
      passwordTooShort: 'Wachtwoord moet minimaal 6 tekens bevatten',
      needAccount: 'Heb je een account nodig?',
      alreadyHaveAccount: 'Heb je al een account?',
      signUp: 'Registreren',
      signIn: 'Inloggen',
      signUpTitle: 'Maak Je Account Aan',
      joinCommunity: 'Word lid van onze spirituele gemeenschap',
      startJourney: 'Begin je gepersonaliseerde reis van zelfontdekking en groei.',
      success: 'Succes',
      signUpFailed: 'Registratie mislukt',
      signInFailed: 'Inloggen mislukt',
      welcomeBackMessage: 'Welkom terug! Je bent succesvol ingelogd.',
      signOutSuccess: 'Succesvol uitgelogd',
      signOutSuccessDescription: 'Je bent veilig uitgelogd van je account.',
      signOutError: 'Uitloggen mislukt',
      signOutErrorDescription: 'Er was een fout bij het uitloggen. Probeer het opnieuw.'
    },
    common: {
      loading: 'Laden...',
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
      submit: 'Verzenden',
      reset: 'Resetten',
      search: 'Zoeken',
      filter: 'Filteren',
      sort: 'Sorteren',
      view: 'Weergeven',
      download: 'Downloaden',
      upload: 'Uploaden',
      copy: 'Kopiëren',
      paste: 'Plakken',
      cut: 'Knippen'
    },
    errors: {
      network: 'Netwerkverbindingsfout. Controleer je verbinding en probeer opnieuw.',
      unauthorized: 'Je bent niet geautoriseerd om toegang te krijgen tot deze bron.',
      forbidden: 'Toegang tot deze bron is verboden.',
      notFound: 'De aangevraagde bron is niet gevonden.',
      serverError: 'Er is een interne serverfout opgetreden. Probeer het later opnieuw.',
      validation: 'Controleer je invoer en probeer opnieuw.',
      required: 'Dit veld is verplicht.',
      invalidEmail: 'Voer een geldig e-mailadres in.',
      invalidPassword: 'Wachtwoord moet minimaal 8 tekens lang zijn.',
      sessionExpired: 'Je sessie is verlopen. Log opnieuw in.',
      unknown: 'Er is een onverwachte fout opgetreden. Probeer het opnieuw.'
    },
    profile: {
      logoutSuccess: 'Je bent succesvol uitgelogd.',
      logoutError: 'Er was een fout bij het uitloggen. Probeer het opnieuw.'
    },
    notFound: {
      title: '404',
      message: 'Het lijkt erop dat je spirituele reis je van het pad heeft geleid',
      returnButton: 'Keer terug naar je reis'
    },
    error: 'Fout'
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
