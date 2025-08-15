
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
      redirectingToAuth: 'Redirecting to authentication...',
      soulIntelligence: 'Soul Intelligence',
      pureSoulIntelligence: 'Pure Soul Intelligence',
      soulSystemDiagnostics: 'Soul System Diagnostics',
      soulActive: 'Soul Active',
      soulProcessing: 'Soul Intelligence processing...',
      messageSoul: 'Message Soul Intelligence...'
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
      cut: 'Cut',
      notifications: 'Notifications',
      tryAgain: 'Try Again'
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
    // Modal translations
    modal: {
      readyToBegin: 'Ready to Work Together?',
      coachGuide: 'Your coach will collaborate with you on this task.',
      readyToFocus: 'Ready to tackle this together?',
      letsGo: "Start Task Collaboration"
    },
    // Cancel action (used by modal)
    cancel: 'Cancel',
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
      welcomePlain: 'Welcome to SoulSync',
      welcomePlainWithName: 'Welcome to SoulSync, {name}',
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
      demoButton: 'View Demo',
      takeTour: 'Take Tour',
      startJourney: 'Start Your Journey',
      getStarted: 'Get Started',
      signIn: 'Sign In',
      viewBlueprint: 'View Blueprint',
      dashboard: 'Dashboard',
      dashboardDesc: 'Overview of your progress and insights.',
      blueprint: 'Soul Blueprint',
      blueprintDesc: 'Explore your personal cosmic blueprint.',
      tasks: 'Tasks',
      tasksDesc: 'Focus on what matters with guided tasks.',
      profile: 'Profile',
      profileDesc: 'Manage your information and preferences.'
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
      signIn: 'Sign In',
      signOutError: 'Sign out failed',
      signOutErrorDescription: 'Unable to sign out. Please try again.'
    },
    // Dreams & Goals
    dreams: {
      whatsYourDream: 'What\'s your dream or goal?',
      placeholderDream: 'Enter your dream or goal here...',
      description: 'Transform your dreams into reality with AI-powered insights and personalized guidance.',
      getStarted: 'Get Started',
      trackProgress: 'Track your progress and celebrate your achievements',
      whyImportant: 'Why is this important to you?',
      placeholderWhy: 'Share what makes this dream meaningful to you...',
      category: 'Category',
      timeline: 'Timeline',
      creatingJourney: 'Creating Your Journey...',
      createJourney: 'Create My Journey',
      viewJourney: 'View My Journey'
    },
    // Goals & Categories
    goals: {
      categoryPersonal: 'Personal Growth',
      categoryCareer: 'Career & Professional',
      categoryHealth: 'Health & Wellness',
      categoryRelationships: 'Relationships',
      categoryCreative: 'Creative & Artistic',
      categoryFinancial: 'Financial',
      categorySpiritual: 'Spiritual & Mindfulness',
      targetDate: 'Target Date',
      timeframe: {
        oneMonth: '1 Month',
        threeMonths: '3 Months',
        sixMonths: '6 Months',
        oneYear: '1 Year',
        twoPlusYears: '2+ Years'
      },
      welcomeComplete: 'Welcome to Your Soul Journey!',
      welcomeCompleteDesc: 'Your personalized spiritual path is ready. Your Soul companion will guide you through insights, growth tools, and personalized recommendations.',
      // Onboarding goal selection
      primaryFocus: 'Personal Growth',
      exploring: 'Exploring my purpose and direction',
      personalGrowth: 'Personal growth and self-discovery',
      careerSuccess: 'Career development and success',
      relationships: 'Relationships and connections',
      healthWellness: 'Health and wellness',
      creativity: 'Creativity and self-expression',
      spiritualDevelopment: 'Spiritual development',
      guidanceLevel: 'How much guidance would you like?',
      lightTouch: 'Light touch - occasional insights',
      structuredGuidance: 'Structured guidance - regular support',
      completeSetup: 'Complete my setup'
    },
    // Personality Assessment
    personality: {
      energySource: 'Where do you get your energy?',
      workspaceStyle: 'What\'s your ideal workspace?',
      planningStyle: 'How do you prefer to plan?',
      beingAlone: 'Being alone to recharge',
      beingWithPeople: 'Being with people and socializing',
      tidyOrganized: 'Tidy and organized',
      creativeChaos: 'Creative chaos',
      bookInAdvance: 'Book everything in advance',
      seeWhatHappens: 'See what happens in the moment',
      yourPersonalityProfile: 'Your Personality Profile',
      likelyStyle: 'Based on your responses, your likely style is:',
      topMbtiMatches: 'Top MBTI personality matches:',
      howAccurate: 'How accurate does this feel?',
      notQuiteRight: 'Not quite right',
      spotOn: 'Spot on!',
      continueWithProfile: 'Continue with this profile',
      keepRefining: 'Keep refining'
    },
    // Blueprint section
    blueprint: {
      generated: 'Blueprint Generated',
      generatedDesc: 'Your personalized soul blueprint has been created'
    },
    // Onboarding Flow
    onboarding: {
      welcome: 'Welcome to Your Spiritual Journey',
      welcomeDesc: 'Discover your authentic path through personalized guidance and spiritual insights',
      beginJourney: 'Begin Your Journey',
      step: 'Step',
      of: 'of',
      whatsYourName: 'What\'s your name?',
      fullName: 'Full Name',
      fullNamePlaceholder: 'Enter your full name',
      whenWereBorn: 'When were you born?',
      birthDate: 'Birth Date',
      day: 'Day',
      month: 'Month',
      year: 'Year',
      selectExactDate: 'Please select your exact birth date for accurate insights',
      whatTimeWereBorn: 'What time were you born?',
      birthTime: 'Birth Time',
      birthTimeDesc: 'Your birth time helps create a more precise spiritual blueprint',
      whereWereBorn: 'Where were you born?',
      birthLocation: 'Birth Location',
      birthLocationPlaceholder: 'Enter your birth city and country',
      birthLocationDesc: 'Your birth location provides important astrological context',
      tellPersonality: 'Tell us about your personality',
      generatingBlueprint: 'Generating your unique spiritual blueprint...',
      choosePath: 'Choose your path',
      authRequired: 'Authentication Required',
      authRequiredDesc: 'Please sign in to continue your spiritual journey',
      devMode: 'Development Mode',
      back: 'Back',
      continue: 'Continue'
    },
    // Companion
    companion: {
      unauthTitle: 'Soul Companion',
      unauthSubtitle: 'Your personal Soul companion for integrated support and guidance.',
      getStarted: 'Get Started',
      pageTitle: 'Soul Companion',
      pageSubtitle: 'Your integrated Soul companion combining coaching and guidance',
      resetTitle: 'Reset Chat',
      clearConversation: 'Clear Conversation',
      systemStatus: 'System Status',
      resetToast: {
        title: 'Conversation Reset',
        description: 'Your companion conversation has been cleared.'
      },
      system: {
        blueprint: 'Blueprint',
        ready: 'Ready',
        partial: 'Partial',
        mode: 'Mode',
        companion: 'Companion',
        hacs: 'HACS',
        pureIntelligence: 'Pure Intelligence'
      }
    },
    // HACS
    hacs: {
      insight: 'HACS Insight',
      confidence: 'Confidence',
      showEvidence: 'Show Evidence',
      hideEvidence: 'Hide Evidence',
      dismiss: 'Dismiss',
      continue: 'Continue',
      gotIt: 'Got It',
      generated: 'Generated',
      loading: 'HACS Loading...',
      systemInitializing: 'System Initializing...',
      insightsQueue: '{current} of {total} insights'
    },
    // Personalized Quotes
    personalizedQuotes: {
      loading: 'Loading your personalized inspiration...',
      fallbackMessage: 'Your unique journey is unfolding perfectly.',
      personalizedText: 'Personalized for your unique blueprint',
      defaultText: 'Default inspiration quotes',
      generateMoreTitle: 'Generate more quotes',
      regenerating: 'Regenerating your personalized quotes...',
      regenerationSuccess: 'Generated {count} new personalized quotes!',
      regenerationError: 'Failed to regenerate quotes'
    },
    // Journey
    journey: {
      empty: {
        title: 'No Active Dream Journey',
        description: 'Create your first dream to see your personalized journey map'
      }
    },
    // Bedtime
    bedtime: {
      title: 'Bedtime Routine',
      description: 'Your next scheduled bedtime action to help you wind down for better sleep',
      loadingTitle: 'Finding Your Bedtime Action...',
      noActionsTitle: 'No Bedtime Actions Scheduled',
      noUpcoming: 'No upcoming bedtime routines found',
      suggestSetup: 'Consider setting up a bedtime routine to improve your sleep quality',
      nextActionTitle: 'Next Bedtime Action',
      overdue: 'Overdue',
      scheduled: 'Scheduled',
      markComplete: 'Mark Complete',
      completedNote: 'Completed bedtime routine',
      toast: {
        loadFailed: 'Failed to load bedtime action',
        completed: 'Bedtime action completed! Sweet dreams! 🌙',
        completeFailed: 'Failed to mark action as completed'
      },
      time: {
        todayAt: 'Today at {time}',
        tomorrowAt: 'Tomorrow at {time}',
        onDateAt: '{date} at {time}'
      }
    },
    // Months
    months: {
      january: 'January',
      february: 'February',
      march: 'March',
      april: 'April',
      may: 'May',
      june: 'June',
      july: 'July',
      august: 'August',
      september: 'September',
      october: 'October',
      november: 'November',
      december: 'December'
    },
    // Dashboard Page
    dashboardPage: {
      title: 'Soul Dashboard',
      signInPrompt: 'Please sign in to view your dashboard',
      signIn: 'Sign In',
      loading: 'Loading...',
      loadingDashboard: 'Loading dashboard...',
      overview: 'Overview',
      productivity: 'Productivity',
      growth: 'Growth',
      blueprint: 'Blueprint',
      user360: '360° Profile',
      pieHub: 'PIE Hub',
      welcomeTitle: 'Welcome to your Soul Dashboard',
      welcomeDesc: 'This is your personalized space to track your progress, gain insights, and connect with your inner self.',
      quickActions: 'Quick Actions',
      chatWithCoach: 'Chat with Coach',
      viewJourney: 'View Journey',
      view360Profile: 'View 360° Profile'
    },
    // Tasks Page
    tasks: {
      title: 'Productivity Mode',
      subtitle: 'Goal-focused achievement and task management',
      subtitleShort: 'Goal-focused achievement',
      getStarted: 'Get Started',
      todaysFocus: "Today's Focus",
      dailyGoals: 'Daily Goals',
      streakExample: 'Day 3 Streak',
      completeExample: '2 of 3 complete',
      aiGoals: 'AI Goals',
      planning: 'Planning',
      focus: 'Focus',
      habits: 'Habits',
      goals: 'Goals',
      coach: 'Coach',
      aiGoalAchievement: 'AI Goal Achievement',
      smartTracking: 'Smart goal tracking and progress',
      planningInterface: 'Planning Interface',
      organizeYourDay: 'Organize and structure your goals',
      focusTimer: 'Focus Timer',
      pomodoroDescription: 'Pomodoro technique for productivity',
      habitTracker: 'Habit Tracker',
      habitDesc: 'Build consistent daily routines',
      goalSetting: 'Goal Setting',
      goalDesc: 'Define and structure your objectives',
      productivityCoach: 'Productivity Coach',
      productivityCoachDesc: 'AI-powered goal achievement guidance',
      quickStart: 'Quick Start',
      qa1: 'Help me break down my biggest goal into actionable steps',
      qa2: 'Create a morning routine that aligns with my energy',
      qa3: 'Set up accountability for my weekly targets',
      qa4: 'Plan my most productive work blocks',
      generalCoaching: 'General Coaching',
      newConversation: 'New Conversation',
      newConversationStartedWith: 'New conversation started with {coach}',
      soulCoach: 'Soul Coach'
    },
    // User 360
    user360: {
      title: '360° Profile',
      subtitle: 'Unified view of your complete soul data ecosystem',
      loadingTitle: 'Loading Your Soul Profile',
      loadingDesc: 'Aggregating data from all systems...',
      errorTitle: 'Profile Loading Error',
      errorLead: 'Unable to load your 360° profile:',
      tryAgain: 'Try Again',
      forceSync: 'Force Sync',
      noProfileTitle: 'No Profile Data Available',
      noProfileLead: "Your 360° soul profile hasn't been generated yet. This usually happens when:",
      bulletNewUser: "You're a new user",
      bulletNoData: 'No data has been collected yet',
      bulletBlueprintProgress: 'Blueprint creation is still in progress',
      checkAgain: 'Check Again',
      updatedAt: 'Updated {time}',
      refresh: 'Refresh',
      sync: {
        live: 'Live Sync',
        offline: 'Offline'
      },
      availability: {
        title: 'Data Availability',
        desc: 'Real-time status of your soul data across all systems',
        overall: 'Overall Completeness',
        available: 'Available',
        noData: 'No Data'
      },
      cards: {
        sources: {
          title: 'Active Data Sources',
          desc: 'Systems contributing to your profile',
          none: 'No active data sources'
        },
        version: {
          title: 'Profile Version',
          desc: 'Current profile iteration',
          never: 'Never updated'
        },
        completeness: {
          title: 'Data Completeness',
          desc: 'Overall profile completeness',
          complete: 'Complete',
          partial: 'Partial',
          incomplete: 'Incomplete'
        },
        sync: {
          title: 'Real-Time Sync',
          desc: 'Live data synchronization status',
          active: 'Active',
          offline: 'Offline',
          last: 'Last sync: {time}'
        },
        summary: {
          title: 'Profile Data Summary',
          desc: 'Raw data aggregated from all systems (for debugging and transparency)'
        }
      }
    },

    // Spiritual Growth
    spiritualGrowth: {
      title: 'Spiritual Growth',
      subtitle: 'Choose how you want to engage today—coach, Life OS, program, or tools.',
      description: 'Unlock your spiritual growth journey with personalized guidance and tools.',
      getStarted: 'Get Started',
      ui: {
        backToOptions: 'Back to Options',
        heartCenteredCoach: 'Heart-Centered Coach',
        connectedReady: 'Connected & Ready',
        backToGrowthCoach: 'Back to Growth Coach',
        growthTools: 'Growth Tools',
        moodTracker: 'Mood Tracker',
        reflection: 'Reflection',
        insights: 'Insights',
        weeklyReview: 'Weekly Review',
        backToTools: 'Back to Tools'
      }
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
      redirectingToAuth: 'Doorverwijzen naar authenticatie...',
      soulIntelligence: 'Ziel Intelligentie',
      pureSoulIntelligence: 'Pure Ziel Intelligentie',
      soulSystemDiagnostics: 'Ziel Systeem Diagnostiek',
      soulActive: 'Ziel Actief',
      soulProcessing: 'Ziel Intelligentie verwerkt...',
      messageSoul: 'Bericht Ziel Intelligentie...'
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
      cut: 'Knippen',
      notifications: 'Meldingen'
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
    // Modal translations
    modal: {
      readyToBegin: 'Klaar om Samen te Werken?',
      coachGuide: 'Je coach zal met je samenwerken aan deze taak.',
      readyToFocus: 'Klaar om dit samen aan te pakken?',
      letsGo: "Start Taak Samenwerking"
    },
    // Cancel action (used by modal)
    cancel: 'Annuleren',
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
      welcomePlain: 'Welkom bij SoulSync',
      welcomePlainWithName: 'Welkom bij SoulSync, {name}',
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
      demoButton: 'Bekijk Demo',
      takeTour: 'Tour Nemen',
      startJourney: 'Begin Je Reis',
      getStarted: 'Aan de Slag',
      signIn: 'Inloggen',
      viewBlueprint: 'Bekijk Blauwdruk',
      dashboard: 'Dashboard',
      dashboardDesc: 'Overzicht van je voortgang en inzichten.',
      blueprint: 'Blauwdruk',
      blueprintDesc: 'Verken je persoonlijke kosmische blauwdruk.',
      tasks: 'Taken',
      tasksDesc: 'Focus op wat belangrijk is met begeleide taken.',
      profile: 'Profiel',
      profileDesc: 'Beheer je informatie en voorkeuren.'
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
      signIn: 'Inloggen',
      signOutError: 'Uitloggen mislukt',
      signOutErrorDescription: 'Kon niet uitloggen. Probeer het opnieuw.'
    },
    // Dreams & Goals
    dreams: {
      whatsYourDream: 'Wat is je droom of doel?',
      placeholderDream: 'Voer hier je droom of doel in...',
      description: 'Transformeer je dromen in realiteit met AI-gedreven inzichten en gepersonaliseerde begeleiding.',
      getStarted: 'Aan de Slag',
      trackProgress: 'Volg je voortgang en vier je prestaties',
      whyImportant: 'Waarom is dit belangrijk voor je?',
      placeholderWhy: 'Deel wat deze droom betekenisvol voor je maakt...',
      category: 'Categorie',
      timeline: 'Tijdlijn',
      creatingJourney: 'Je Reis Wordt Gemaakt...',
      createJourney: 'Mijn Reis Creëren',
      viewJourney: 'Mijn Reis Bekijken'
    },
    // Goals & Categories
    goals: {
      categoryPersonal: 'Persoonlijke Groei',
      categoryCareer: 'Carrière & Professioneel',
      categoryHealth: 'Gezondheid & Welzijn',
      categoryRelationships: 'Relaties',
      categoryCreative: 'Creatief & Artistiek',
      categoryFinancial: 'Financieel',
      categorySpiritual: 'Spiritueel & Mindfulness',
      targetDate: 'Streefdatum',
      timeframe: {
        oneMonth: '1 maand',
        threeMonths: '3 maanden',
        sixMonths: '6 maanden',
        oneYear: '1 jaar',
        twoPlusYears: '2+ jaar'
      },
      welcomeComplete: 'Welkom bij Je Spirituele Reis!',
      welcomeCompleteDesc: 'Je gepersonaliseerde spirituele pad is klaar. Je Soul metgezel zal je begeleiden door inzichten, groei-tools en gepersonaliseerde aanbevelingen.',
      // Onboarding doelselectie
      primaryFocus: 'Persoonlijke Groei',
      exploring: 'Mijn doel en richting verkennen',
      personalGrowth: 'Persoonlijke groei en zelfontdekking',
      careerSuccess: 'Carrièreontwikkeling en succes',
      relationships: 'Relaties en verbindingen',
      healthWellness: 'Gezondheid en welzijn',
      creativity: 'Creativiteit en zelfexpressie',
      spiritualDevelopment: 'Spirituele ontwikkeling',
      guidanceLevel: 'Hoeveel begeleiding wil je?',
      lightTouch: 'Lichte aanraking - incidentele inzichten',
      structuredGuidance: 'Gestructureerde begeleiding - regelmatige ondersteuning',
      completeSetup: 'Voltooi mijn setup'
    },
    // Persoonlijkheidsbeoordeling
    personality: {
      energySource: 'Waar haal je je energie vandaan?',
      workspaceStyle: 'Wat is jouw ideale werkplek?',
      planningStyle: 'Hoe plan je het liefst?',
      beingAlone: 'Alleen zijn om bij te tanken',
      beingWithPeople: 'Bij mensen zijn en socialiseren',
      tidyOrganized: 'Netjes en georganiseerd',
      creativeChaos: 'Creatieve chaos',
      bookInAdvance: 'Alles van tevoren plannen',
      seeWhatHappens: 'Kijken wat er gebeurt in het moment',
      yourPersonalityProfile: 'Je Persoonlijkheidsprofiel',
      likelyStyle: 'Op basis van je antwoorden is je waarschijnlijke stijl:',
      topMbtiMatches: 'Top MBTI persoonlijkheidsmatches:',
      howAccurate: 'Hoe accuraat voelt dit?',
      notQuiteRight: 'Niet helemaal juist',
      spotOn: 'Helemaal goed!',
      continueWithProfile: 'Doorgaan met dit profiel',
      keepRefining: 'Blijf verfijnen'
    },
    // Blauwdruk sectie
    blueprint: {
      generated: 'Blauwdruk Gegenereerd',
      generatedDesc: 'Je gepersonaliseerde zielblauwdruk is gemaakt'
    },
    // Onboarding Flow
    onboarding: {
      welcome: 'Welkom bij Je Spirituele Reis',
      welcomeDesc: 'Ontdek je authentieke pad door gepersonaliseerde begeleiding en spirituele inzichten',
      beginJourney: 'Begin Je Reis',
      step: 'Stap',
      of: 'van',
      whatsYourName: 'Wat is je naam?',
      fullName: 'Volledige Naam',
      fullNamePlaceholder: 'Voer je volledige naam in',
      whenWereBorn: 'Wanneer ben je geboren?',
      birthDate: 'Geboortedatum',
      day: 'Dag',
      month: 'Maand',
      year: 'Jaar',
      selectExactDate: 'Selecteer je exacte geboortedatum voor nauwkeurige inzichten',
      whatTimeWereBorn: 'Hoe laat ben je geboren?',
      birthTime: 'Geboortetijd',
      birthTimeDesc: 'Je geboortetijd helpt bij het creëren van een nauwkeurigere spirituele blauwdruk',
      whereWereBorn: 'Waar ben je geboren?',
      birthLocation: 'Geboorteplaats',
      birthLocationPlaceholder: 'Voer je geboortestad en land in',
      birthLocationDesc: 'Je geboorteplaats biedt belangrijke astrologische context',
      tellPersonality: 'Vertel ons over je persoonlijkheid',
      generatingBlueprint: 'Je unieke spirituele blauwdruk wordt gegenereerd...',
      choosePath: 'Kies je pad',
      authRequired: 'Authenticatie Vereist',
      authRequiredDesc: 'Meld je aan om je spirituele reis voort te zetten',
      devMode: 'Ontwikkelingsmodus',
      back: 'Terug',
      continue: 'Doorgaan'
    },
    // Metgezel
    companion: {
      unauthTitle: 'Metgezel',
      unauthSubtitle: 'Je persoonlijke metgezel voor integrale steun en begeleiding.',
      getStarted: 'Aan de Slag',
      pageTitle: 'Metgezel',
      pageSubtitle: 'Je geïntegreerde metgezel die coaching en begeleiding combineert',
      resetTitle: 'Chat resetten',
      clearConversation: 'Gesprek wissen',
      systemStatus: 'Systeemstatus',
      resetToast: {
        title: 'Gesprek gereset',
        description: 'Je metgezelgesprek is gewist.'
      },
      system: {
        blueprint: 'Blauwdruk',
        ready: 'Klaar',
        partial: 'Gedeeltelijk',
        mode: 'Modus',
        companion: 'Metgezel',
        hacs: 'HACS',
        pureIntelligence: 'Pure Intelligentie'
      }
    },
    // HACS
    hacs: {
      insight: 'HACS Inzicht',
      confidence: 'Vertrouwen',
      showEvidence: 'Toon Bewijs',
      hideEvidence: 'Verberg Bewijs',
      dismiss: 'Wegwijzen',
      continue: 'Doorgaan',
      gotIt: 'Begrepen',
      generated: 'Gegenereerd',
      loading: 'HACS Laden...',
      systemInitializing: 'Systeem initialiseren...',
      insightsQueue: '{current} van {total} inzichten'
    },
    // Gepersonaliseerde Citaten
    personalizedQuotes: {
      loading: 'Je gepersonaliseerde inspiratie laden...',
      fallbackMessage: 'Je unieke reis ontvouwt zich perfect.',
      personalizedText: 'Gepersonaliseerd voor je unieke blauwdruk',
      defaultText: 'Standaard inspiratiecitaten',
      generateMoreTitle: 'Genereer meer citaten',
      regenerating: 'Je gepersonaliseerde citaten worden opnieuw gegenereerd...',
      regenerationSuccess: '{count} nieuwe gepersonaliseerde citaten gegenereerd!',
      regenerationError: 'Kon citaten niet opnieuw genereren'
    },
    // Reis
    journey: {
      empty: {
        title: 'Geen Actieve Droomreis',
        description: 'Maak je eerste droom aan om je persoonlijke routekaart te zien'
      }
    },
    // Bedtijd
    bedtime: {
      title: 'Bedtijdroutine',
      description: 'Je volgende geplande bedtijd-actie om rustig af te bouwen voor betere slaap',
      loadingTitle: 'Je bedtijd-actie wordt opgehaald...',
      noActionsTitle: 'Geen bedtijd-acties gepland',
      noUpcoming: 'Geen aankomende bedtijdroutines gevonden',
      suggestSetup: 'Overweeg een bedtijdroutine in te stellen om je slaapkwaliteit te verbeteren',
      nextActionTitle: 'Volgende bedtijd-actie',
      overdue: 'Te laat',
      scheduled: 'Gepland',
      markComplete: 'Markeer als voltooid',
      completedNote: 'Bedtijdroutine voltooid',
      toast: {
        loadFailed: 'Kan bedtijd-actie niet laden',
        completed: 'Bedtijd-actie voltooid! Slaap lekker! 🌙',
        completeFailed: 'Kan actie niet als voltooid markeren'
      },
      time: {
        todayAt: 'Vandaag om {time}',
        tomorrowAt: 'Morgen om {time}',
        onDateAt: '{date} om {time}'
      }
    },
    // User 360
    user360: {
      title: '360° Profiel',
      subtitle: 'Geünificeerd overzicht van je complete zielsdata-ecosysteem',
      loadingTitle: 'Je profiel wordt geladen',
      loadingDesc: 'Data verzamelen uit alle systemen...',
      errorTitle: 'Fout bij laden van profiel',
      errorLead: 'Je 360°-profiel kan niet worden geladen:',
      tryAgain: 'Opnieuw proberen',
      forceSync: 'Forceer synchronisatie',
      noProfileTitle: 'Geen Profielgegevens Beschikbaar',
      noProfileLead: 'Je 360°-profiel is nog niet gegenereerd. Dit gebeurt meestal wanneer:',
      bulletNewUser: 'Je een nieuwe gebruiker bent',
      bulletNoData: 'Er nog geen gegevens zijn verzameld',
      bulletBlueprintProgress: 'De blauwdruk nog wordt aangemaakt',
      checkAgain: 'Opnieuw controleren',
      updatedAt: 'Bijgewerkt om {time}',
      refresh: 'Vernieuwen',
      sync: {
        live: 'Live synchronisatie',
        offline: 'Offline'
      },
      availability: {
        title: 'Databeschikbaarheid',
        desc: 'Realtime status van je zielsdata in alle systemen',
        overall: 'Algemene volledigheid',
        available: 'Beschikbaar',
        noData: 'Geen data'
      },
      cards: {
        sources: {
          title: 'Actieve databronnen',
          desc: 'Systemen die bijdragen aan je profiel',
          none: 'Geen actieve databronnen'
        },
        version: {
          title: 'Profielversie',
          desc: 'Huidige profieliteratie',
          never: 'Nooit bijgewerkt'
        },
        completeness: {
          title: 'Datavolledigheid',
          desc: 'Algemene volledigheid van het profiel',
          complete: 'Volledig',
          partial: 'Gedeeltelijk',
          incomplete: 'Onvolledig'
        },
        sync: {
          title: 'Realtime synchronisatie',
          desc: 'Status van live datasynchronisatie',
          active: 'Actief',
          offline: 'Offline',
          last: 'Laatste sync: {time}'
        },
        summary: {
          title: 'Samenvatting profieldata',
          desc: 'Ruwe data samengebracht uit alle systemen (voor debugging en transparantie)'
        }
      }
    },

    // Spirituele Groei
    spiritualGrowth: {
      title: 'Spirituele Groei',
      subtitle: 'Kies hoe je vandaag wilt werken—coach, Life OS, programma of tools.',
      description: 'Ontgrendel je groeireis met gepersonaliseerde begeleiding en tools.',
      getStarted: 'Aan de slag',
      ui: {
        backToOptions: 'Terug naar opties',
        heartCenteredCoach: 'Hartgedragen Coach',
        connectedReady: 'Verbonden & Klaar',
        backToGrowthCoach: 'Terug naar Groei-coach',
        growthTools: 'Groeitools',
        moodTracker: 'Stemmingsmeter',
        reflection: 'Reflectie',
        insights: 'Inzichten',
        weeklyReview: 'Wekelijkse review',
        backToTools: 'Terug naar tools'
      }
    },
    // Dashboard Pagina
    dashboardPage: {
      title: 'Ziels Dashboard',
      signInPrompt: 'Log in om je dashboard te bekijken',
      signIn: 'Inloggen',
      loading: 'Laden...',
      loadingDashboard: 'Dashboard laden...',
      overview: 'Overzicht',
      productivity: 'Productiviteit',
      growth: 'Groei',
      blueprint: 'Blauwdruk',
      user360: '360° Profiel',
      pieHub: 'PIE Hub',
      welcomeTitle: 'Welkom bij je Ziels Dashboard',
      welcomeDesc: 'Dit is jouw persoonlijke plek om je voortgang te volgen, inzichten te krijgen en te verbinden met je innerlijke zelf.',
      quickActions: 'Snelle acties',
      chatWithCoach: 'Chat met Coach',
      viewJourney: 'Bekijk Reis',
      view360Profile: 'Bekijk 360° Profiel'
    },
    // Taken Pagina
    tasks: {
      title: 'Productiviteitsmodus',
      subtitle: 'Doelgerichte resultaten en taakbeheer',
      subtitleShort: 'Doelgerichte resultaten',
      getStarted: 'Aan de slag',
      todaysFocus: 'Focus van vandaag',
      dailyGoals: 'Dagelijkse doelen',
      streakExample: 'Dag 3 reeks',
      completeExample: '2 van 3 voltooid',
      aiGoals: 'AI Doelen',
      planning: 'Planning',
      focus: 'Focus',
      habits: 'Gewoonten',
      goals: 'Doelen',
      coach: 'Coach',
      aiGoalAchievement: 'AI Doelrealisatie',
      smartTracking: 'Slimme doeltracking en voortgang',
      planningInterface: 'Planningsinterface',
      organizeYourDay: 'Organiseer en structureer je doelen',
      focusTimer: 'Focus Timer',
      pomodoroDescription: 'Pomodoro-techniek voor productiviteit',
      habitTracker: 'Gewoonten Tracker',
      habitDesc: 'Bouw consistente dagelijkse routines',
      goalSetting: 'Doelen stellen',
      goalDesc: 'Definieer en structureer je doelstellingen',
      productivityCoach: 'Productiviteitscoach',
      productivityCoachDesc: 'AI-ondersteunde begeleiding voor doelrealisatie',
      quickStart: 'Snelle start',
      qa1: 'Help me mijn grootste doel opdelen in concrete stappen',
      qa2: 'Maak een ochtendroutine die past bij mijn energie',
      qa3: 'Zorg voor accountability voor mijn wekelijkse doelen',
      qa4: 'Plan mijn meest productieve werkblokken',
      generalCoaching: 'Algemene coaching',
      newConversation: 'Nieuw gesprek',
      newConversationStartedWith: 'Nieuw gesprek gestart met {coach}',
      soulCoach: 'Zielscoach'
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
