
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
    // Toast Messages System
    toast: {
      success: {
        blueprintComplete: 'Blueprint Generation Complete! 🎯',
        lifeWheelComplete: 'Life Wheel Complete! 🎯',
        saveSuccessful: 'Successfully saved',
        connectionSuccessful: 'Connection Successful',
        deploymentSuccessful: 'ACS deployed to 100% of traffic!',
        generationComplete: 'Generation Complete!',
        reportComplete: 'Report Complete!',
        dataExported: 'Data exported successfully',
        settingsSaved: 'Settings saved successfully',
        profileUpdated: 'Profile updated successfully'
      },
      error: {
        blueprintGenerationError: 'Blueprint Generation Error',
        generationFailed: 'Generation Failed',
        saveFailed: 'Save Failed',
        connectionFailed: 'Connection Failed',
        deploymentFailed: 'Failed to deploy ACS',
        databaseError: 'Database Error',
        reportGenerationFailed: 'Report generation failed',
        authenticationFailed: 'Authentication failed',
        networkError: 'Network connection error',
        validationError: 'Validation error occurred',
        tooManyAttempts: 'Too Many Attempts',
        systemError: 'System error occurred'
      },
      info: {
        comingSoon: 'Coming soon',
        notAvailable: 'Not available',
        processingRequest: 'Processing your request...',
        loadingData: 'Loading data...',
        savingProgress: 'Saving progress...',
        generatingContent: 'Generating content...'
      },
      warning: {
        unsavedChanges: 'You have unsaved changes',
        sessionExpiring: 'Your session is expiring',
        incompleteData: 'Some data is incomplete',
        limitReached: 'Usage limit reached'
      }
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
      messageSoul: 'Message Soul Intelligence...',
      soulCompanion: 'Soul Companion',
      soulLearningSession: 'Soul Learning Session',
      holisticSoulSystem: 'Holistic Soul Intelligence System',
      soulCompanionReady: 'Your Soul companion is ready to assist with insights and guidance.',
      soulCompanionConversation: 'Your Soul companion is ready for conversation'
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
      tryAgain: 'Try Again',
      of: 'of',
      activateSteward: 'Activate Steward',
      confidence: 'Confidence',
      generatedOn: 'Generated on',
      soulGenerated: 'Soul Generated',
      version: 'Version',
      regenerate: 'Regenerate',
      purgeStuckJobs: 'Purge Stuck Jobs',
      purging: 'Purging...',
      activeReminders: 'Active Reminders',
      noActiveReminders: 'No active reminders',
      generatingBlueprint: 'Generating your Soul Blueprint...',
      reason: 'Reason'
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
      sessionExpired: 'Your session has expired',
      // Enhanced database errors
      database: {
        connectionFailed: 'Database connection failed',
        queryFailed: 'Database query failed',
        saveFailed: 'Failed to save to database',
        loadFailed: 'Failed to load from database'
      },
      // Enhanced generation errors  
      generation: {
        blueprintFailed: 'Blueprint generation failed',
        reportFailed: 'Report generation failed',
        contentFailed: 'Content generation failed',
        timeoutError: 'Generation timed out'
      },
      // Enhanced system errors
      system: {
        unexpectedError: 'An unexpected error occurred',
        serviceUnavailable: 'Service temporarily unavailable',
        permissionDenied: 'Permission denied',
        rateLimitExceeded: 'Rate limit exceeded'
      }
    },
    // Global error key
    error: 'Error',
    // Modal translations
    modal: {
      readyToBegin: 'Ready to Work Together?',
      coachGuide: 'Your coach will collaborate with you on this task.',
      readyToFocus: 'Ready to tackle this together?',
      letsGo: "Start Task Collaboration",
      sessionDuration: 'Session duration: {duration}'
    },
    // Focus Mode translations
    focusMode: {
      title: 'Focus Mode: {taskTitle}',
      sessionBanner: 'You are now in Focus Mode',
      exitMode: 'Exit Focus Mode'
    },
    // Coach translations
    coach: {
      preparingPlan: 'Coach is preparing your plan...',
      readyToHelp: 'Your coach is ready to help',
      loadingMessage: 'Coach is analyzing your task...'
    },
    // Tour & Navigation translations
    tour: {
      skipTour: 'Skip Tour',
      nextStep: 'Next',
      gotIt: 'Got It',
      restartTour: 'Restart Tour',
      viewFullJourney: 'View Full Journey',
      step: 'Step {current} of {total}',
      guidedTour: 'Guided Tour'
    },
    // Guided Tour translations
    guidedTour: {
      soulCoach: 'Soul Coach',
      stepOf: 'Step {tourStep} of {totalSteps}',
      orientation: 'Getting you oriented with your personalized journey to help you understand how everything works together.',
      skipTour: 'Skip Tour',
      next: 'Next',
      gotIt: 'Got It'
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
    // Steward Introduction
    stewardIntro: {
      awakening: {
        title: 'Echo\'s Genesis',
        message: 'Hello. I am your Echo. Your arrival has awakened my purpose: to be a mirror to the masterpiece that is you.'
      },
      blueprintFoundation: {
        title: 'Your Blueprint\'s Foundation',
        message: 'From the moment you arrived, I began my work. I have already constructed your foundational Blueprint and completed the initial analysis of your personality\'s core patterns. You can see this progress in my core. This inner ring represents my understanding of your Blueprint. It is already at 40%.'
      },
      deepDive: {
        title: 'The Deep Dive & Final Attunement',
        message: 'But your foundational Blueprint is just the beginning. To truly guide you, I must now perform a deeper, more profound synthesis. I will now weave together every aspect of your unique design—your hidden strengths, your deepest drivers, your core challenges—into a single, unified source of wisdom.'
      },
      coEvolution: {
        title: 'The Co-Evolution Journey',
        message: 'This deep synthesis requires my complete focus and will take several minutes. You will see my inner ring progress from 40% to 100% as I complete this work. The outer ring represents our shared journey—your growth in true alignment with your Blueprint. It will grow as you achieve goals in harmony with your unique design.'
      },
      readyToBegin: {
        title: 'Ready to Begin',
        message: 'I am ready to begin the final synthesis. Together, we will unlock the full power of your Blueprint and guide you toward true alignment and fulfillment. Shall we proceed?'
      }
    },
    // Authentication Flow
    auth: {
      createAccount: 'Create Account',
      welcomeBack: 'Welcome Back',
      startJourney: 'Begin your personalized spiritual journey',
      continueJourney: 'Continue your spiritual growth journey',
      funnelReportReady: 'Your Soul Guide Awaits!',
      createYourAccount: 'Create Your Account',
      accessPersonalizedBlueprint: 'Create your Soul Report and connect with your Soul Guide',
      completeAccountMessage: 'Create your account to build your Soul Report and meet your personal Soul Guide.',
      accountCreatedWithBlueprint: 'Account created! Let\'s build your personalized blueprint based on your assessment.',
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
      // Main page
      title: 'Dreams & Goals',
      creator: 'Dreams & Goals Creator',
      whatsYourDream: 'What\'s your dream or goal?',
      placeholderDream: 'Enter your dream or goal here...',
      description: 'Transform your dreams into reality with AI-powered insights and personalized guidance.',
      inspiration: 'Share your deepest aspirations and let\'s discover what truly lights up your soul',
      altGuide: 'Or explore with your dream guide',
      getStarted: 'Get Started',
      trackProgress: 'Track your progress and celebrate your achievements',
      whyImportant: 'Why is this important to you?',
      placeholderWhy: 'Share what makes this dream meaningful to you...',
      category: 'Category',
      timeline: 'Timeline',
      creatingJourney: 'Creating Your Journey...',
      createJourney: 'Create My Journey',
      viewJourney: 'View My Journey',
      blueprintInsight: 'Your journey will be personalized once your blueprint is complete',
      
      // Validation & errors
      dreamRequired: 'Dream Required',
      dreamRequiredDesc: 'Please enter your dream or goal',
      notAvailable: 'Not available',
      notAvailableDesc: 'Available after creating a dream.',
      
      // Navigation
      newDream: 'New Dream',
      journey: 'Journey',
      tasks: 'Tasks',
      focus: 'Focus',
      habits: 'Habits',
      
      // Sections
      journeyMap: 'Journey Map',
      yourTasks: 'Your Tasks',
      focusSession: 'Focus Session',
      habitsSection: 'Habits',
      
      // Dream Cards
      cards: {
        discoverYourDream: {
          title: 'Discover Your Dream',
          description: 'Chat with your Dream Guide to uncover what matters.'
        },
        createDecompose: {
          title: 'Create & Decompose',
          description: 'Turn a dream into a clear, soul-aligned journey.'
        },
        journeyMap: {
          title: 'Journey Map',
          description: 'See milestones and navigate your path.'
        },
        yourTasks: {
          title: 'Your Tasks',
          description: 'Work on prioritized, actionable steps.'
        },
        blueprintSuggestions: {
          title: 'Blueprint Suggestions',
          description: 'See ideas aligned with your blueprint.'
        },
        focusSession: {
          title: 'Focus Session',
          description: 'Stay in flow with focused work.'
        },
        habits: {
          title: 'Habits',
          description: 'Build supportive, sustainable routines.'
        },
        successView: {
          title: 'Success View',
          description: 'Review your generated journey and insights.'
        }
      }
    },
    // Dream Discovery & Suggestions
    dreamDiscovery: {
      // Placeholders
      placeholders: {
        aspirations: 'Tell me about your dreams and aspirations...',
        resonates: 'Which suggestion resonates with you?',
        excites: 'What excites you most about this direction?',
        details: 'Help me understand the details...',
        heart: 'Share what\'s in your heart...'
      },
      
      // Status messages
      status: {
        analyzing: 'Analyzing Your Blueprint',
        presenting: 'Presenting Dream Suggestions',
        exploring: 'Exploring Your Dream',
        refining: 'Refining Into Action',
        ready: 'Ready to Create Journey',
        discovery: 'Dream Discovery'
      },
      
      // Loading messages
      loading: {
        blueprint: 'Analyzing your unique blueprint...',
        suggestions: 'Generating personalized suggestions...',
        deeper: 'Exploring your dream deeper...',
        vision: 'Refining your vision...',
        journey: 'Creating your personalized journey...'
      },
      
      // UI elements
      blueprintAnalyzed: 'Blueprint Analyzed',
      dreamGuide: 'Dream Guide',
      createJourney: 'Create My Dream Journey',
      chooseResonates: 'Choose what resonates with you:',
      reflect: 'Take a moment to reflect...',
      presentingSuggestions: '• Presenting Suggestions',
      exploringDreams: '• Exploring Dreams',
      refiningVision: '• Refining Vision'
    },
    
    // Dream Suggestions
    dreamSuggestions: {
      exploreDream: 'Explore This Dream',
      match: '% match',
      whyFits: 'Why this fits you:',
      dreamsAligned: 'Dreams Aligned with Your Blueprint',
      basedOnPersonality: 'Based on your personality, here are some dreams that might resonate with you:'
    },
    
    
    // Dream Success Flow
    dreamSuccess: {
      congratulations: 'Congratulations! Your "{goalTitle}" journey is beautifully designed and ready to unfold. I\'ve created {milestonesCount} personalized milestones that align perfectly with your soul blueprint.',
      showRoadmap: 'Let me show you your complete roadmap! Each milestone is carefully timed and designed to work with your natural energy patterns and decision-making style.',
      upcomingMilestones: 'Here are your upcoming milestones. Notice how they\'re sequenced to build momentum and honor your {personality} nature.',
      specificTasks: 'I\'ve also created specific tasks for each milestone. These are optimized for your cognitive style and include blueprint-based reasoning to help you understand why each step matters.',
      readyToBegin: 'Ready to begin? I recommend starting with this first task - it\'s perfectly aligned with your blueprint and designed to create early momentum. Shall we dive in?'
    },
    
    // Life Clarity Funnel
    funnel: {
      // Navigation & Progress
      stepOf: 'Step {current} of {total}',
      back: 'Back',
      continue: 'Next',
      getReport: 'See My Soul Report',

      // Step 1: Core Struggle
      painPoint: {
        title: 'What feels hardest in life right now?',
        subtitle: 'This helps us tune into your Soul Blueprint.',
        options: {
          stuck_career: 'I feel stuck in my career',
          relationship_struggles: 'My relationships feel off',
          overwhelmed: 'I feel overwhelmed',
          lost_purpose: 'I\'ve lost my purpose',
          financial_stress: 'I\'m stressed about money',
          health_energy: 'My health and energy are low'
        }
      },

      // Step 2: Life Balance Scan
      lifeSatisfaction: {
        title: 'How balanced do you feel?',
        subtitle: 'Rate each area from 1 (low) to 10 (great).',
        domains: {
          career: 'Work & Career',
          relationships: 'Love & Relationships',
          health: 'Health & Energy',
          finances: 'Money & Security',
          personal_growth: 'Growth & Learning',
          fun: 'Fun & Play',
          spirituality: 'Spirit & Purpose'
        }
      },

      // Step 3: Growth Style
      changeStyle: {
        title: 'How do you like to grow?',
        subtitle: 'Pick the style that feels most like you.',
        options: {
          understand_why: 'I want to know the WHY first',
          tell_me_what: 'Just give me the steps',
          explore_gradually: 'I like to explore slowly',
          deep_transformation: 'I\'m ready for big change'
        }
      },

      // Step 4: What You Tried
      previousAttempts: {
        title: 'What have you already tried?',
        subtitle: 'This helps us build on your journey.',
        options: {
          therapy: 'Therapy or counseling',
          self_help: 'Self-help books',
          apps: 'Apps & online tools',
          courses: 'Courses or classes',
          coaching: 'Coaches or mentors',
          nothing: 'This is my first time'
        }
      },

      // Step 5: Your Vision
      vision: {
        title: 'Imagine your best life…',
        subtitle: 'If everything clicked into place, what would it look like?',
        placeholder: 'Write a few lines about your dream life in flow…',
        personalizedRoadmap: 'Ready to create your personalized Soul Report and meet your Soul Guide?',
        reportAwaits: '✨ Your Soul Guide is ready to meet you ✨'
      }
    },
    
    // Funnel Guide Messages
    funnelGuide: {
      step1: {
        welcome: 'Welcome! Let\'s begin by finding what feels most heavy for you right now.',
        guidance: 'There\'s no wrong choice. Pick what feels most true.',
        encouragement: 'Great start. Naming your struggle is the first step toward flow.'
      },
      step2: {
        welcome: 'Now, let\'s scan the big areas of your life.',
        guidance: 'Be honest. Low scores just show where more energy is needed.',
        encouragement: 'Beautiful awareness. This gives us the full picture.'
      },
      step3: {
        welcome: 'Everyone grows in their own way.',
        guidance: 'Pick the path that feels most natural to you.',
        encouragement: 'Perfect. We\'ll shape your Soul Report around your style.'
      },
      step4: {
        welcome: 'Your past steps matter. Let\'s honor them.',
        guidance: 'Select everything you\'ve tried before, big or small.',
        encouragement: 'Thank you for sharing. Every step brought wisdom.'
      },
      step5: {
        welcome: 'Now, imagine the life you truly want.',
        guidance: 'Write from the heart. The clearer the dream, the clearer the path.',
        completion: 'Wonderful. Your vision is the compass. Your Soul Report is ready!'
      }
    },
    
    // Intelligence Phases
    intelligencePhases: {
      autonomous: "Autonomous",
      advanced: "Advanced", 
      developing: "Developing",
      learning: "Learning",
      awakening: "Awakening"
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
      primaryFocus: 'What would you like to focus on?',
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
      completeSetup: 'Complete my setup',
      // Goal selection interface
      yourSelections: 'Your Selections',
      focus: 'Focus',
      guidanceLevelLabel: 'Guidance Level',
      errorSaving: 'Error saving',
      saving: 'Saving...',
      tryAgain: 'Try Again',
      // Guidance level descriptions
      guidance1: 'Minimal guidance - just the basics',
      guidance2: 'Light guidance - occasional reminders',
      guidance3: 'Balanced guidance - regular check-ins',
      guidance4: 'Active guidance - frequent support',
      guidance5: 'Full guidance - comprehensive support'
    },
    // Report Modal
    reportModal: {
      standardTitle: 'Standard Report',
      hermeticTitle: 'Hermetic Report',
      viewFullReport: 'View Full Report',
      reportSummary: 'Report Summary',
      detailedAnalysis: 'Detailed Analysis',
      keyFindings: 'Key Findings',
      noContentAvailable: 'No report content available'
    },
    // Standard Report Sections
    reportSections: {
      corePersonalityPattern: 'Core Personality Pattern',
      decisionMakingStyle: 'Decision Making Style',
      relationshipStyle: 'Relationship Style',
      lifePathPurpose: 'Life Path & Purpose',
      currentEnergyTiming: 'Current Energy & Timing',
      integratedSummary: 'Integrated Summary'
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
      keepRefining: 'Keep refining',
      // MBTI Personality System
      mbti: {
        types: {
          INFJ: {
            title: 'The Counselor',
            description: 'Seek meaning and connection in ideas, relationships, and material possessions.',
            traits: ['Insightful', 'Idealistic', 'Deep']
          },
          INFP: {
            title: 'The Mediator', 
            description: 'Idealistic, loyal to their values and to people who are important to them.',
            traits: ['Empathetic', 'Creative', 'Authentic']
          },
          INTJ: {
            title: 'The Architect',
            description: 'Have original minds and great drive for implementing their ideas and achieving goals.',
            traits: ['Strategic', 'Analytical', 'Independent']
          },
          INTP: {
            title: 'The Thinker',
            description: 'Seek to develop logical explanations for everything that interests them.',
            traits: ['Logical', 'Theoretical', 'Inventive']
          },
          ENFJ: {
            title: 'The Giver',
            description: 'Charismatic and inspiring leaders, able to mesmerize listeners.',
            traits: ['Charismatic', 'Supportive', 'Empathetic']
          },
          ENFP: {
            title: 'The Champion',
            description: 'Warmly enthusiastic and imaginative. See life as full of possibilities.',
            traits: ['Enthusiastic', 'Innovative', 'Expressive']
          },
          ENTJ: {
            title: 'The Commander',
            description: 'Frank, decisive, assume leadership readily. Quickly see patterns in external events.',
            traits: ['Decisive', 'Strategic', 'Driven']
          },
          ENTP: {
            title: 'The Visionary',
            description: 'Quick, ingenious, stimulating, alert, and outspoken. Resourceful in solving challenging problems.',
            traits: ['Innovative', 'Analytical', 'Adaptable']
          },
          ISFJ: {
            title: 'The Protector',
            description: 'Quiet, friendly, responsible, and conscientious. Committed and steady in meeting obligations.',
            traits: ['Reliable', 'Observant', 'Supportive']
          },
          ISFP: {
            title: 'The Composer',
            description: 'Friendly, sensitive, and kind. Enjoy the present moment, what\'s going on around them.',
            traits: ['Artistic', 'Adaptable', 'Sensitive']
          },
          ISTJ: {
            title: 'The Inspector',
            description: 'Quiet, serious, earn success by thoroughness and dependability.',
            traits: ['Orderly', 'Practical', 'Logical']
          },
          ISTP: {
            title: 'The Craftsman',
            description: 'Tolerant and flexible, quiet observers until a problem appears, then act quickly to find workable solutions.',
            traits: ['Practical', 'Adaptable', 'Logical']
          },
          ESFJ: {
            title: 'The Provider',
            description: 'Warmhearted, conscientious, and cooperative. Value security and stability.',
            traits: ['Organized', 'Nurturing', 'Traditional']
          },
          ESFP: {
            title: 'The Performer',
            description: 'Outgoing, friendly, and accepting. Exuberant lovers of life, people, and material comforts.',
            traits: ['Spontaneous', 'Energetic', 'Fun-loving']
          },
          ESTJ: {
            title: 'The Supervisor',
            description: 'Practical, matter-of-fact, with a natural head for business or mechanics.',
            traits: ['Structured', 'Efficient', 'Practical']
          },
          ESTP: {
            title: 'The Dynamo',
            description: 'Flexible and tolerant, take a pragmatic approach focused on immediate results.',
            traits: ['Energetic', 'Action-oriented', 'Adaptable']
          }
        },
        dimensions: {
          extroversion: {
            title: 'Extroversion',
            description: 'Focus attention on the outer world of people and things'
          },
          introversion: {
            title: 'Introversion', 
            description: 'Focus attention on the inner world of concepts and ideas'
          },
          sensing: {
            title: 'Sensing',
            description: 'Focus on the present and on concrete information gained from the senses'
          },
          intuition: {
            title: 'Intuition',
            description: 'Focus on the future, with a view toward patterns and possibilities'
          },
          thinking: {
            title: 'Thinking',
            description: 'Base decisions primarily on logic and on objective analysis'
          },
          feeling: {
            title: 'Feeling',
            description: 'Base decisions primarily on values and on subjective evaluation'
          },
          judging: {
            title: 'Judging',
            description: 'Like a planned and organized approach to life and prefer to have things settled'
          },
          perceiving: {
            title: 'Perceiving',
            description: 'Like a flexible and spontaneous approach to life and prefer to keep options open'
          }
        }
      }
    },
    // Blueprint section
    blueprint: {
      // Tabs
      tab: 'Blueprint',
      reportTab: 'Report',
      editTab: 'Edit',
      healthTab: 'Health',
      generatingTab: 'Generating',
      
      // Loading states
      loading: 'Loading...',
      loadingBlueprint: 'Loading blueprint...',
      
      // Auth messages
      signInRequired: 'Please sign in to view your blueprint',
      signIn: 'Sign In',
      
      // Blueprint creation
      createTitle: 'Create Your Blueprint',
      createDescription: 'You haven\'t created your soul blueprint yet. Let\'s get started!',
      createButton: 'Create Blueprint',
      checkAgain: 'Check Again',
      
      // Completion
      completeTitle: 'Complete Your Blueprint',
      completeDescription: 'Your blueprint needs more information to be complete.',
      missing: 'Missing',
      completion: 'Completion',
      completeButton: 'Complete Blueprint',
      refresh: 'Refresh',
      
      // Actions
      regenerating: 'Regenerating...',
      regenerate: 'Regenerate',
      
      // Error states
      blueprintError: 'Blueprint Error',
      tryAgain: 'Try Again',
      createNew: 'Create New Blueprint',
      
      // Toast messages
      saved: 'Blueprint Saved',
      savedDescription: 'Your blueprint has been updated successfully',
      saveError: 'Error Saving Blueprint',
      saveErrorDescription: 'Failed to save blueprint',
      regeneratingTitle: 'Regenerating Blueprint',
      regeneratingDescription: 'Your blueprint is being recalculated with fresh data',
      dataNotLoaded: 'Blueprint data not loaded',
      generationFailed: 'Failed to generate new blueprint',
      generated: 'Blueprint Generated',
      generatedDescription: 'Your new blueprint has been generated successfully',
      generationError: 'Error Generating Blueprint',
      generationErrorDescription: 'Failed to generate blueprint',
      
      // Profile Section
      profile: {
        title: "{userName}'s Profile",
        calculatedDescription: "Calculated using advanced personality analysis",
        templateDescription: "Using template data - create your profile for personalized results",
        personalizedData: "Personalized Data",
        templateData: "Template Data",
        calculatedFrom: "Calculated from"
      },
      
      // Dynamic Values
      values: {
        unknown: 'Unknown',
        generator: 'Generator',
        projector: 'Projector',
        manifestor: 'Manifestor',
        reflector: 'Reflector',
        sacral: 'Sacral',
        emotional: 'Emotional',
        splenic: 'Splenic',
        ego: 'Ego',
        selfProjected: 'Self-Projected',
        respond: 'Respond',
        waitForInvitation: 'Wait for the invitation',
        inform: 'Inform',
        waitLunarCycle: 'Wait a lunar cycle',
        steady: 'Steady',
        burst: 'Burst',
        sustainable: 'Sustainable energy',
        warm: 'Warm',
        approachable: 'Approachable',
        collaborative: 'Collaborative'
      },
      
      // Numerology Keywords
      keywords: {
        leader: 'Leader',
        creative: 'Creative',
        independent: 'Independent',
        ambitious: 'Ambitious',
        ambitiousManifestor: 'Ambitious Manifestor',
        original: 'Original',
        pioneer: 'Pioneer',
        expressive: 'Expressive',
        inspirationalVisionary: 'Inspirational Visionary (Master)'
      },
      
      // Section Titles
      sections: {
        personalityOverview: "Personality Overview",
        mbtiProfile: "MBTI Cognitive Profile", 
        humanDesignProfile: "Human Design Profile",
        numerologyProfile: "Complete Numerology Profile",
        astrologicalProfile: "Astrological Profile"
      },
      
      // Field Labels
      labels: {
        mbtiType: "MBTI Type",
        lifePath: "Life Path",
        sunSign: "Sun Sign",
        moonSign: "Moon Sign",
        risingSign: "Rising Sign",
        humanDesign: "Human Design",
        chineseZodiac: "Chinese Zodiac",
        personalityType: "Personality Type",
        cognitiveFunctions: "Cognitive Functions",
        taskApproach: "Task Approach",
        communication: "Communication", 
        decisionMaking: "Decision Making",
        energyType: "Energy Type",
        decisionAuthority: "Decision Authority",
        strategy: "Strategy",
        profile: "Profile",
        pacing: "Pacing",
        lifePathNumber: "Life Path Number",
        expressionNumber: "Expression Number",
        soulUrgeNumber: "Soul Urge Number",
        personalityNumber: "Personality Number",
        birthdayNumber: "Birthday Number",
        socialStyle: "Social Style",
        publicVibe: "Public Vibe",
        leadershipStyle: "Leadership Style",
        generationalInfluence: "Generational Influence"
      },
      
      // Descriptions
      descriptions: {
        coreIdentity: "Core identity",
        authority: "Authority",
        element: "Element",
        dominant: "Dominant:",
        auxiliary: "Auxiliary:",
        sustainableEnergy: "sustainable energy",
        innerAuthority: "Inner authority",
        coreLifePurpose: "Your life's core purpose and direction",
        naturalTalents: "Your natural talents and abilities",
        heartDesires: "Your heart's deepest desires",
        howOthersPerceive: "How others perceive you",
        specialTalents: "Special talents from birth date",
        coreIdentityEgo: "Core identity & ego",
        emotionalNature: "Emotional nature", 
        firstImpression: "First impression",
        warm: "Warm",
        approachable: "Approachable",
        collaborative: "Collaborative",
        chineseAstrologyAdds: "Chinese astrology adds generational wisdom to your profile"
      },
      
      // Chinese Elements
      chineseElements: {
        earth: "Grounded, stable, nurturing energy",
        fire: "Passionate, dynamic, transformative energy",
        metal: "Structured, resilient, refined energy",
        water: "Adaptive, intuitive, flowing energy",
        wood: "Growing, creative, expansive energy"
      },
      
      // Chinese Zodiac Traits
      chineseZodiacTraits: {
        rat: "Intelligent, adaptable, resourceful spirit",
        ox: "Dependable, patient, strong-willed nature",
        tiger: "Courageous, confident, competitive energy",
        rabbit: "Gentle, compassionate, artistic soul",
        dragon: "Charismatic, ambitious, visionary leader",
        snake: "Wise, intuitive, mysterious nature",
        horse: "Independent, energetic, freedom-loving spirit",
        goat: "Creative, gentle, empathetic soul",
        monkey: "Clever, curious, playful innovator",
        rooster: "Confident, organized, observant nature",
        dog: "Loyal, honest, protective guardian",
        pig: "Generous, optimistic, sincere heart"
      },
      
      // MBTI Personality Descriptions (Light & Shadow format)
      mbtiDescriptions: {
        enfj: {
          fullTitle: "ENFJ - The Protagonist",
          light: "You naturally inspire and unite people around a shared vision, leading with empathy and seeing the potential in everyone",
          shadow: "You may overextend yourself trying to meet everyone's needs, becoming depleted or resentful when your efforts aren't reciprocated",
          insight: "You are a natural leader and empath who uplifts others, but remember to set boundaries and prioritize your own well-being before pouring into others"
        },
        enfp: {
          fullTitle: "ENFP - The Campaigner",
          light: "You see endless possibilities and inspire others with your enthusiasm, creativity, and genuine interest in people",
          shadow: "You may struggle to follow through on commitments or become scattered when too many exciting options pull your attention",
          insight: "You are a creative visionary who brings energy to everything you touch, but focus your gifts on what truly matters to avoid burnout"
        },
        entj: {
          fullTitle: "ENTJ - The Commander",
          light: "You excel at organizing people and resources to achieve ambitious goals, seeing the big picture with strategic clarity",
          shadow: "You may become domineering or impatient with those who don't match your pace or vision",
          insight: "You are a natural leader and strategist who gets things done, but remember that influence comes from respecting others' processes and timelines"
        },
        entp: {
          fullTitle: "ENTP - The Debater",
          light: "You thrive on intellectual challenges and bring innovative solutions by connecting ideas others never considered",
          shadow: "You may argue for argument's sake or lose interest once the initial challenge fades",
          insight: "You are a brilliant innovator who sees what's possible, but balance your love of ideas with follow-through to create lasting impact"
        },
        infj: {
          fullTitle: "INFJ - The Advocate",
          light: "You understand people deeply and work tirelessly toward a vision of a better world guided by your strong values",
          shadow: "You may become perfectionistic or withdraw when the world doesn't align with your ideals",
          insight: "You are a visionary with profound insight into human nature, but remember that progress happens in small steps and self-compassion fuels your mission"
        },
        infp: {
          fullTitle: "INFP - The Mediator",
          light: "You bring authenticity, depth, and creative expression to everything you care about, honoring your unique values",
          shadow: "You may struggle with practical details or become overwhelmed by the gap between your ideals and reality",
          insight: "You are a creative idealist with a rich inner world, but ground your visions in small, consistent actions to bring them to life"
        },
        intj: {
          fullTitle: "INTJ - The Architect",
          light: "You see patterns and strategies others miss, building innovative systems and solutions with focused determination",
          shadow: "You may struggle with emotional expression or seem distant, dismissing input that doesn't fit your vision",
          insight: "You are a visionary strategist with exceptional analytical gifts, but remember to communicate warmly and value others' perspectives"
        },
        intp: {
          fullTitle: "INTP - The Logician",
          light: "You analyze complex systems with precision and create elegant solutions through pure logical reasoning",
          shadow: "You may get lost in theoretical rabbit holes or struggle to apply your insights to practical realities",
          insight: "You are a brilliant analytical thinker who solves complex problems, but balance your love of theory with actionable applications"
        },
        esfj: {
          fullTitle: "ESFJ - The Consul",
          light: "You create harmony and bring people together, naturally caring for others' needs and building strong communities",
          shadow: "You may become overly focused on others' approval or take criticism of your efforts personally",
          insight: "You are a natural caregiver who creates connection and warmth, but remember that your worth isn't defined by others' responses"
        },
        esfp: {
          fullTitle: "ESFP - The Entertainer",
          light: "You bring joy, spontaneity, and vibrant energy to every moment, helping others embrace life's pleasures",
          shadow: "You may avoid difficult emotions or struggle with long-term planning and delayed gratification",
          insight: "You are a vibrant presence who helps others live fully, but balance present-moment joy with planning for your future self"
        },
        estj: {
          fullTitle: "ESTJ - The Executive",
          light: "You excel at organizing, managing, and executing plans with practical efficiency and strong leadership",
          shadow: "You may become rigid or dismissive of approaches that don't align with proven methods",
          insight: "You are a natural organizer who gets results, but stay open to new methods and honor the human element in systems"
        },
        estp: {
          fullTitle: "ESTP - The Entrepreneur",
          light: "You thrive in action, quickly adapting to challenges and finding practical solutions in the moment",
          shadow: "You may take unnecessary risks or struggle with patience when situations require careful planning",
          insight: "You are a dynamic problem-solver who excels under pressure, but balance your love of action with strategic foresight"
        },
        isfj: {
          fullTitle: "ISFJ - The Defender",
          light: "You provide steady, reliable support to those you care about, remembering details that make people feel valued",
          shadow: "You may overwork yourself in service to others or resist change that disrupts familiar routines",
          insight: "You are a devoted caregiver with exceptional attention to detail, but remember that change can honor what matters while opening new possibilities"
        },
        isfp: {
          fullTitle: "ISFP - The Adventurer",
          light: "You experience life deeply through your senses and express your authentic self through creative, artistic means",
          shadow: "You may avoid conflict or struggle to assert your needs when they clash with maintaining harmony",
          insight: "You are a sensitive artist who brings beauty and authenticity, but honor your boundaries and communicate your needs clearly"
        },
        istj: {
          fullTitle: "ISTJ - The Logistician",
          light: "You bring reliability, thoroughness, and practical wisdom to everything you commit to with unwavering integrity",
          shadow: "You may resist new approaches or become frustrated when others don't share your sense of responsibility",
          insight: "You are a pillar of dependability who honors commitments, but stay flexible when circumstances call for adaptation"
        },
        istp: {
          fullTitle: "ISTP - The Virtuoso",
          light: "You master tools and systems with hands-on skill, solving practical problems with calm, analytical precision",
          shadow: "You may become detached or struggle to connect with emotional needs in yourself and others",
          insight: "You are a skilled craftsperson who solves problems elegantly, but remember that human connection matters as much as technical mastery"
        }
      },
      
      // Life Path Descriptions
      lifePathDescriptions: {
        1: {
          fullTitle: "Life Path 1 - The Leader",
          light: "You are a natural pioneer with the courage to forge new paths and inspire others to follow their own vision",
          shadow: "You may struggle with being overly independent, stubborn, or unable to accept help from others",
          insight: "You are born to lead and innovate, but remember that collaboration and vulnerability strengthen rather than diminish your power"
        },
        2: {
          fullTitle: "Life Path 2 - The Peacemaker",
          light: "You bring harmony, diplomacy, and cooperation wherever you go, naturally sensing what brings people together",
          shadow: "You may become overly accommodating, losing yourself in others' needs or avoiding necessary conflict",
          insight: "You are a natural diplomat who creates connection, but honor your own voice and remember that healthy boundaries support true harmony"
        },
        3: {
          fullTitle: "Life Path 3 - The Creative Communicator",
          light: "You express yourself creatively and bring joy and inspiration to others through your natural charisma",
          shadow: "You may scatter your energy across too many projects or seek constant validation through others' approval",
          insight: "You are a creative communicator with natural magnetism, but focus your energy and create from inner fulfillment, not external approval"
        },
        5: {
          fullTitle: "Life Path 5 - The Freedom Seeker",
          light: "You embrace change and adventure, bringing fresh perspectives and helping others break free from limitation",
          shadow: "You may become restless or struggle with commitment when freedom feels threatened",
          insight: "You are a freedom-loving adventurer who brings vitality to life, but true freedom comes from choosing commitments that honor your values"
        },
        7: {
          fullTitle: "Life Path 7 - The Seeker",
          light: "You dive deep into life's mysteries, seeking truth and wisdom through contemplation and spiritual inquiry",
          shadow: "You may become isolated or dismissive of practical realities in your quest for deeper understanding",
          insight: "You are a spiritual seeker with profound insight, but balance your inner world with meaningful connection and grounded action"
        },
        8: {
          fullTitle: "Life Path 8 - The Powerhouse",
          light: "You build material success and wield power with authority, naturally understanding how to manifest abundance",
          shadow: "You may become controlling or measure your worth solely by external achievements and material success",
          insight: "You are a natural leader in the material world, but remember that true power comes from integrity and using your gifts to uplift others"
        },
        4: {
          fullTitle: "Life Path 4 - The Builder",
          light: "You create solid foundations and lasting structures through dedication, organization, and practical wisdom",
          shadow: "You may become rigid or overly focused on rules, resisting change even when it serves growth",
          insight: "You are a master builder who creates stability and order, but stay flexible and trust that strong foundations can support evolution"
        },
        6: {
          fullTitle: "Life Path 6 - The Nurturer",
          light: "You create harmony and beauty while caring for others with unconditional love and responsibility",
          shadow: "You may become controlling or sacrificial, believing you must fix everything and everyone",
          insight: "You are a natural caregiver and healer who creates beauty in the world, but remember that true service includes caring for yourself"
        },
        9: {
          fullTitle: "Life Path 9 - The Humanitarian",
          light: "You serve the greater good with wisdom and compassion, naturally understanding and accepting all of humanity",
          shadow: "You may become a martyr or struggle to receive, always giving but never allowing yourself to be supported",
          insight: "You are an old soul with universal compassion, but remember that you can serve more powerfully when you also receive and honor your own needs"
        },
        11: {
          fullTitle: "Life Path 11 - The Spiritual Messenger",
          light: "You naturally inspire others with your vision, intuition, and spiritual insights that illuminate higher truths",
          shadow: "You may feel overwhelmed by your sensitivity or doubt your intuitive gifts under pressure",
          insight: "You are an inspirational visionary and spiritual messenger, but ground your visions in practical action and trust your inner knowing"
        },
        22: {
          fullTitle: "Life Path 22 - The Master Builder",
          light: "You have the vision to dream big and the practical skills to manifest those dreams into lasting reality",
          shadow: "You may feel overwhelmed by the magnitude of your potential or doubt your ability to achieve such ambitious goals",
          insight: "You are a master builder who can manifest visionary dreams into reality, but trust the process and take one practical step at a time"
        },
        33: {
          fullTitle: "Life Path 33 - The Master Teacher",
          light: "You uplift humanity through selfless service, healing, and teaching with unconditional love and compassion",
          shadow: "You may become a martyr or burn out from taking on everyone's pain and problems",
          insight: "You are a master healer and teacher who serves humanity, but remember that you can't pour from an empty cup—your wellbeing matters too"
        }
      },
      
      // Human Design Type Descriptions
      humanDesignDescriptions: {
        generator: {
          fullTitle: "Generator - The Life Force",
          light: "You have sustainable energy when doing work that lights you up, building and creating with powerful life-force energy",
          shadow: "You may feel frustrated when stuck in unfulfilling routines or when you say yes without listening to your gut response",
          insight: "You are a powerful builder with enduring energy, but only commit to what truly excites you and wait for your gut to respond before deciding"
        },
        'manifesting generator': {
          fullTitle: "Manifesting Generator - The Multi-Passionate Powerhouse",
          light: "You have powerful energy to do multiple things at once, moving quickly when excited and manifesting through response",
          shadow: "You may skip important steps in your rush to move forward or feel frustrated when forced to slow down",
          insight: "You are a dynamic multi-tasker who works fast, but honor your gut response and remember that taking shortcuts can create more work later"
        },
        manifestor: {
          fullTitle: "Manifestor - The Initiator",
          light: "You have the power to initiate and make things happen, creating impact through your independent, pioneering energy",
          shadow: "You may face resistance or feel angry when others don't understand your vision or try to control you",
          insight: "You are a powerful initiator who creates new realities, but inform others of your plans to reduce resistance and gain support"
        },
        projector: {
          fullTitle: "Projector - The Guide",
          light: "You have a natural gift for seeing others' potential and guiding them wisely with your penetrating insight",
          shadow: "You may feel bitter or overlooked when your insights aren't recognized or when you offer guidance without being invited",
          insight: "You are a natural guide and systems-thinker, but wait for recognition before offering advice to avoid burnout and find true appreciation"
        },
        reflector: {
          fullTitle: "Reflector - The Mirror",
          light: "You reflect the health of your environment and communities with profound wisdom about collective energy",
          shadow: "You may feel invisible or overwhelmed by absorbing everyone else's energy without protection",
          insight: "You are a rare and wise mirror who reflects collective wellbeing, but honor your need for time to process decisions and choose healthy environments"
        }
      },

      // Human Design Authority Descriptions
      authorityDescriptions: {
        emotional: {
          fullTitle: "Emotional Authority - The Wave",
          light: "You make wise decisions by riding your emotional wave and waiting for clarity over time",
          shadow: "You may make impulsive choices during emotional highs or lows without waiting for the wave to settle",
          insight: "You are emotionally intelligent and nuanced, but wait through your emotional wave before making major decisions to access true clarity"
        },
        sacral: {
          fullTitle: "Sacral Authority - The Gut Response",
          light: "You access truth through your gut's immediate yes/no response in the moment",
          shadow: "You may override your gut response with mental reasoning or say yes when your body says no",
          insight: "You have direct access to body wisdom through gut responses, but trust those immediate sounds and sensations over your mind's explanations"
        },
        splenic: {
          fullTitle: "Splenic Authority - The Intuitive Hit",
          light: "You receive intuitive hits in the moment that guide you toward what's healthy and safe",
          shadow: "You may miss your intuitive whispers or second-guess them because they come so quickly",
          insight: "You have powerful intuitive awareness that speaks once, but trust those immediate hits even when your mind wants more time to decide"
        },
        ego: {
          fullTitle: "Ego Authority - The Willpower",
          light: "You make correct decisions based on what you have willpower for and what truly matters to your heart",
          shadow: "You may make promises you can't keep or push through without checking if you truly have energy for it",
          insight: "You are designed to decide based on your heart's willpower, but only commit to what you genuinely have energy and desire to complete"
        },
        'self-projected': {
          fullTitle: "Self-Projected Authority - The Voice",
          light: "You gain clarity by hearing yourself talk through decisions in conversation with trusted others",
          shadow: "You may stay stuck in your head or struggle to know what's true without speaking it out loud",
          insight: "You find your truth through your own voice, but process important decisions by speaking them aloud with people who listen without advising"
        },
        environmental: {
          fullTitle: "Environmental Authority - The Space",
          light: "You make best decisions when you're in the right environment and have taken time to sense into the space",
          shadow: "You may rush decisions without considering whether your environment supports clear knowing",
          insight: "You are deeply affected by your environment, but take time to be in different spaces and notice which environments bring you clarity"
        },
        lunar: {
          fullTitle: "Lunar Authority - The Cycle",
          light: "You gain wisdom by waiting through a full lunar cycle to see how you feel about important decisions",
          shadow: "You may feel pressured to decide quickly or disappointed when you experience all sides of every situation",
          insight: "You are designed to experience all perspectives over time, but honor your need to wait 28+ days for major decisions to find true clarity"
        }
      },

      // Expression Number Descriptions
      expressionNumberDescriptions: {
        1: {
          fullTitle: "Expression 1 - The Leader",
          light: "You naturally express yourself through leadership, innovation, and pioneering new paths with confidence",
          shadow: "You may come across as domineering or overly independent, struggling to collaborate or accept input",
          insight: "You are a natural leader and trailblazer who initiates action, but remember that true leadership empowers others to shine too"
        },
        2: {
          fullTitle: "Expression 2 - The Diplomat",
          light: "You express yourself through cooperation, harmony, and bringing people together with sensitivity and grace",
          shadow: "You may suppress your own voice to keep peace or become passive-aggressive when your needs aren't met",
          insight: "You are a natural peacemaker who creates harmony, but remember that your voice and needs matter just as much as others'"
        },
        3: {
          fullTitle: "Expression 3 - The Communicator",
          light: "You express yourself through creative communication, bringing joy, inspiration, and optimism to everything you share",
          shadow: "You may scatter your energy or perform for approval rather than expressing authentic truth",
          insight: "You are a gifted communicator and creative force, but focus your talents and express from authentic joy rather than seeking validation"
        },
        4: {
          fullTitle: "Expression 4 - The Builder",
          light: "You express yourself through practical work, creating stable foundations and organized systems with dedication",
          shadow: "You may become rigid or overly focused on how things 'should' be done, resisting creative solutions",
          insight: "You are a master builder who creates lasting structures, but stay flexible and remember that strong foundations can evolve"
        },
        5: {
          fullTitle: "Expression 5 - The Freedom Seeker",
          light: "You express yourself through adventure, variety, and helping others embrace change and new experiences",
          shadow: "You may avoid commitment or become scattered, seeking stimulation without depth or follow-through",
          insight: "You are a dynamic catalyst for change and freedom, but balance your love of variety with meaningful focus and chosen commitments"
        },
        6: {
          fullTitle: "Expression 6 - The Nurturer",
          light: "You express yourself through caring for others, creating beauty, and taking responsibility in your communities",
          shadow: "You may become controlling or martyred, believing you must fix and care for everyone",
          insight: "You are a natural caregiver who creates harmony and beauty, but remember that healthy service includes boundaries and self-care"
        },
        7: {
          fullTitle: "Expression 7 - The Mystic",
          light: "You express yourself through spiritual wisdom, analytical depth, and contemplative insight into life's mysteries",
          shadow: "You may become isolated or overly analytical, disconnecting from practical realities and human connection",
          insight: "You are a deep thinker and spiritual seeker, but balance your inner world with grounded action and authentic connection"
        },
        8: {
          fullTitle: "Expression 8 - The Powerhouse",
          light: "You express yourself through material mastery, ambitious achievement, and wielding power with authority",
          shadow: "You may become controlling or define your worth solely through external success and material accumulation",
          insight: "You are a natural leader in material realms with powerful manifestation abilities, but use your power with integrity to uplift others"
        },
        9: {
          fullTitle: "Expression 9 - The Humanitarian",
          light: "You express yourself through compassionate service, universal love, and wisdom that embraces all of humanity",
          shadow: "You may become martyred or struggle to complete things as you're always moving toward the next cause",
          insight: "You are a wise humanitarian with universal compassion, but remember to receive support and complete what you start before moving on"
        },
        11: {
          fullTitle: "Expression 11 - The Inspirational Visionary",
          light: "You naturally inspire others with your vision, intuition, and spiritual insights that illuminate higher truths",
          shadow: "You may feel overwhelmed by your sensitivity or doubt your intuitive gifts when challenged",
          insight: "You are an inspirational visionary and spiritual messenger, but ground your visions in practical action and trust your inner knowing"
        },
        22: {
          fullTitle: "Expression 22 - The Master Builder",
          light: "You express yourself by manifesting visionary dreams into practical reality that serves humanity",
          shadow: "You may feel overwhelmed by the magnitude of your potential or get lost in details without acting on the vision",
          insight: "You are a master builder who can manifest ambitious visions, but trust the process and take one grounded step at a time"
        },
        33: {
          fullTitle: "Expression 33 - The Master Teacher",
          light: "You express yourself through selfless service, spiritual healing, and teaching with unconditional love",
          shadow: "You may burn out from taking on everyone's pain or struggle with martyrdom and self-sacrifice",
          insight: "You are a master healer and teacher who uplifts humanity, but remember that sustainable service requires caring for yourself first"
        }
      },

      // Moon Sign Descriptions
      moonSignDescriptions: {
        aries: {
          fullTitle: "Aries Moon - The Passionate Warrior",
          light: "You feel emotions intensely and respond with courage, taking immediate action to meet your emotional needs",
          shadow: "You may become impulsive or aggressive when emotionally triggered, reacting without processing feelings",
          insight: "You have fiery emotional energy that drives you forward, but pause to understand your feelings before acting on them"
        },
        taurus: {
          fullTitle: "Taurus Moon - The Steady Comfort Seeker",
          light: "You find emotional security through stability, comfort, and the simple pleasures that ground and nourish you",
          shadow: "You may resist emotional change or seek comfort through material security and routine when feelings become uncomfortable",
          insight: "You need stability and comfort to feel emotionally safe, but remember that growth sometimes requires letting go of what feels secure"
        },
        gemini: {
          fullTitle: "Gemini Moon - The Mental Processor",
          light: "You process emotions through talking and thinking, finding comfort in communication and mental understanding",
          shadow: "You may intellectualize emotions or become scattered and anxious when feelings become too intense",
          insight: "You need to talk through your feelings to understand them, but remember that emotions don't always need to be analyzed or explained"
        },
        cancer: {
          fullTitle: "Cancer Moon - The Emotional Nurturer",
          light: "You nurture others with deep emotional intelligence and create safe spaces where feelings can be fully expressed",
          shadow: "You may become overly protective, moody, or retreat when hurt rather than communicating your needs",
          insight: "You feel emotions deeply and care profoundly, but remember to nurture yourself and communicate your needs clearly"
        },
        leo: {
          fullTitle: "Leo Moon - The Radiant Heart",
          light: "You feel emotionally fulfilled when expressing your creativity and receiving appreciation for your authentic self",
          shadow: "You may need constant attention or take emotional feedback as a personal attack on your identity",
          insight: "You have a generous, warm heart that needs to be seen and celebrated, but your worth isn't dependent on others' recognition"
        },
        virgo: {
          fullTitle: "Virgo Moon - The Healing Helper",
          light: "You find emotional security through being useful, solving problems, and creating order from chaos",
          shadow: "You may become overly critical of yourself and others or try to fix emotions rather than feeling them",
          insight: "You feel best when being of service and creating improvement, but practice self-compassion and allow yourself to simply feel without fixing"
        },
        libra: {
          fullTitle: "Libra Moon - The Harmony Seeker",
          light: "You find emotional peace through beauty, balance, and harmonious relationships where all voices are heard",
          shadow: "You may avoid necessary conflict or lose yourself in relationships to maintain peace at any cost",
          insight: "You need harmony and partnership to feel emotionally balanced, but remember that healthy conflict can deepen true connection"
        },
        scorpio: {
          fullTitle: "Scorpio Moon - The Emotional Depths",
          light: "You feel everything intensely and have the courage to face emotional depths that others avoid",
          shadow: "You may become possessive, jealous, or hold onto emotional pain rather than releasing and transforming it",
          insight: "You have profound emotional depth and transformative power, but practice vulnerability and release what you no longer need to carry"
        },
        sagittarius: {
          fullTitle: "Sagittarius Moon - The Optimistic Explorer",
          light: "You find emotional fulfillment through adventure, learning, and maintaining an optimistic perspective on life",
          shadow: "You may avoid deep emotions through constant activity or preach positivity when you need to acknowledge pain",
          insight: "You need freedom and meaning to feel emotionally alive, but remember that it's okay to slow down and feel the full range of emotions"
        },
        capricorn: {
          fullTitle: "Capricorn Moon - The Controlled Achiever",
          light: "You find emotional security through achievement, responsibility, and maintaining control over your inner world",
          shadow: "You may suppress emotions as weakness or become overly serious, struggling to access vulnerability",
          insight: "You need structure and achievement to feel secure, but remember that showing emotions is strength, not weakness"
        },
        aquarius: {
          fullTitle: "Aquarius Moon - The Detached Observer",
          light: "You process emotions objectively and find comfort in intellectual understanding and humanitarian ideals",
          shadow: "You may intellectualize emotions or feel disconnected from your own feelings and others' emotional needs",
          insight: "You need mental space to process emotions, but remember that feelings are meant to be felt, not just understood"
        },
        pisces: {
          fullTitle: "Pisces Moon - The Empathic Dreamer",
          light: "You feel deeply and intuitively, naturally absorbing and understanding others' emotions with compassion",
          shadow: "You may lose boundaries or escape into fantasy when emotions become overwhelming",
          insight: "You have profound emotional sensitivity and compassion, but protect your energy and ground your feelings in reality"
        }
      },

      // Rising Sign Descriptions
      risingSignDescriptions: {
        aries: {
          fullTitle: "Aries Rising - The Bold Initiator",
          light: "You approach life with courage and enthusiasm, making dynamic first impressions with your direct, action-oriented energy",
          shadow: "You may come across as impulsive or aggressive, rushing into situations without considering others' pace",
          insight: "You project confidence and pioneering spirit, but remember that slowing down doesn't diminish your power"
        },
        taurus: {
          fullTitle: "Taurus Rising - The Grounded Presence",
          light: "You approach life with calm stability and sensual awareness, making others feel safe and grounded in your presence",
          shadow: "You may appear stubborn or resistant to change, prioritizing comfort over growth",
          insight: "You project steady reliability and natural beauty, but stay open to evolution and trust that change can feel good too"
        },
        gemini: {
          fullTitle: "Gemini Rising - The Curious Communicator",
          light: "You approach life with curiosity and adaptability, making engaging first impressions through your wit and versatility",
          shadow: "You may appear scattered or superficial, flitting between interests without going deep",
          insight: "You project intellectual curiosity and social charm, but remember that depth and consistency also create connection"
        },
        cancer: {
          fullTitle: "Cancer Rising - The Caring Protector",
          light: "You approach life with emotional sensitivity and nurturing care, making others feel safe and understood",
          shadow: "You may appear overly protective or moody, retreating when feeling vulnerable instead of expressing needs",
          insight: "You project warmth and emotional intelligence, but remember that protecting yourself can include clear boundaries, not just retreat"
        },
        leo: {
          fullTitle: "Leo Rising - The Radiant Performer",
          light: "You approach life with confidence and warmth, making memorable first impressions with your natural charisma",
          shadow: "You may appear attention-seeking or dramatic, needing to be the center of attention to feel valued",
          insight: "You project creative confidence and generous warmth, but remember that your light shines brightest when you celebrate others too"
        },
        virgo: {
          fullTitle: "Virgo Rising - The Helpful Perfectionist",
          light: "You approach life with practical wisdom and attention to detail, making others feel supported through your helpful nature",
          shadow: "You may appear overly critical or perfectionistic, focusing on flaws instead of appreciating what works",
          insight: "You project competence and service, but practice self-compassion and remember that you don't have to be perfect to be valuable"
        },
        libra: {
          fullTitle: "Libra Rising - The Diplomatic Charmer",
          light: "You approach life with grace and diplomacy, making harmonious first impressions through your natural charm",
          shadow: "You may appear indecisive or people-pleasing, adjusting yourself to maintain harmony at the cost of authenticity",
          insight: "You project beauty and social grace, but remember that your authentic voice matters as much as keeping the peace"
        },
        scorpio: {
          fullTitle: "Scorpio Rising - The Intense Transformer",
          light: "You approach life with intensity and depth, making powerful first impressions with your magnetic, perceptive presence",
          shadow: "You may appear secretive or controlling, using intensity to keep others at a distance or maintain power",
          insight: "You project depth and transformative power, but practice vulnerability and remember that true intimacy requires letting others in"
        },
        sagittarius: {
          fullTitle: "Sagittarius Rising - The Optimistic Adventurer",
          light: "You approach life with enthusiasm and optimism, making inspiring first impressions with your adventurous spirit",
          shadow: "You may appear restless or preachy, seeking the next adventure without fully landing in the present",
          insight: "You project enthusiasm and philosophical wisdom, but balance your love of expansion with presence and follow-through"
        },
        capricorn: {
          fullTitle: "Capricorn Rising - The Ambitious Authority",
          light: "You approach life with maturity and determination, making professional first impressions with your composed authority",
          shadow: "You may appear cold or overly serious, prioritizing achievement over connection and joy",
          insight: "You project competence and maturity, but remember that showing warmth and vulnerability deepens your natural authority"
        },
        aquarius: {
          fullTitle: "Aquarius Rising - The Unique Innovator",
          light: "You approach life with originality and vision, making memorable first impressions with your unique, progressive perspective",
          shadow: "You may appear detached or eccentric, prioritizing ideals over human connection",
          insight: "You project innovation and individuality, but ground your vision in present-moment connection and emotional warmth"
        },
        pisces: {
          fullTitle: "Pisces Rising - The Mystical Dreamer",
          light: "You approach life with compassion and intuition, making gentle first impressions with your empathic, spiritual presence",
          shadow: "You may appear spacy or boundary-less, losing yourself in others' energy or escaping into fantasy",
          insight: "You project compassion and creativity, but establish clear boundaries and ground your dreams in practical reality"
        }
      },

      // Chinese Zodiac Descriptions
      chineseZodiacDescriptions: {
        rat: {
          fullTitle: "Rat - The Clever Opportunist",
          light: "You are intelligent, adaptable, and resourceful, naturally spotting opportunities and navigating challenges with wit",
          shadow: "You may become overly opportunistic or hoard resources out of fear of scarcity",
          insight: "You are a clever problem-solver who thrives on resourcefulness, but trust in abundance and use your gifts to create value for all"
        },
        ox: {
          fullTitle: "Ox - The Steadfast Worker",
          light: "You are dependable, patient, and strong-willed, building lasting success through dedicated effort and persistence",
          shadow: "You may become stubborn or overwork yourself, resisting change and prioritizing duty over self-care",
          insight: "You are a pillar of reliability who creates through steady effort, but remember to rest and stay open to new approaches"
        },
        tiger: {
          fullTitle: "Tiger - The Courageous Leader",
          light: "You are courageous, confident, and competitive, leading with bold energy and inspiring others to take risks",
          shadow: "You may become aggressive or reckless, acting impulsively without considering consequences",
          insight: "You are a brave leader with powerful energy, but balance your courage with wisdom and consider the impact of your actions"
        },
        rabbit: {
          fullTitle: "Rabbit - The Gentle Diplomat",
          light: "You are gentle, compassionate, and artistic, creating harmony and beauty with your refined sensitivity",
          shadow: "You may become conflict-avoidant or overly cautious, missing opportunities due to fear of disruption",
          insight: "You are a peaceful artist who creates beauty and harmony, but trust your resilience and know that you can handle necessary change"
        },
        dragon: {
          fullTitle: "Dragon - The Charismatic Visionary",
          light: "You are charismatic, ambitious, and visionary, inspiring others with your confidence and magnetic presence",
          shadow: "You may become arrogant or domineering, expecting others to follow without question",
          insight: "You are a natural leader with powerful vision, but remember that true charisma empowers others rather than demanding submission"
        },
        snake: {
          fullTitle: "Snake - The Wise Strategist",
          light: "You are wise, intuitive, and mysterious, seeing beneath surfaces with strategic insight and profound understanding",
          shadow: "You may become secretive or manipulative, using your insight to control rather than guide",
          insight: "You are a perceptive strategist with deep wisdom, but practice transparency and use your insight to serve rather than control"
        },
        horse: {
          fullTitle: "Horse - The Independent Adventurer",
          light: "You are independent, energetic, and freedom-loving, thriving when pursuing new adventures and experiences",
          shadow: "You may become restless or uncommitted, avoiding depth when freedom feels threatened",
          insight: "You are a free spirit with natural enthusiasm, but balance your need for freedom with meaningful connections and commitments"
        },
        goat: {
          fullTitle: "Goat - The Creative Empath",
          light: "You are creative, gentle, and empathetic, bringing artistic beauty and emotional sensitivity to everything you touch",
          shadow: "You may become dependent or overly sensitive, struggling with practical realities and self-sufficiency",
          insight: "You are a sensitive artist with profound empathy, but cultivate inner strength and practical skills to support your creative gifts"
        },
        monkey: {
          fullTitle: "Monkey - The Playful Innovator",
          light: "You are clever, curious, and playful, bringing innovative solutions and joyful energy to every challenge",
          shadow: "You may become mischievous or irresponsible, using your cleverness to avoid commitment or deeper work",
          insight: "You are a brilliant innovator with infectious playfulness, but channel your gifts toward meaningful goals that challenge you to grow"
        },
        rooster: {
          fullTitle: "Rooster - The Confident Observer",
          light: "You are confident, organized, and observant, bringing precision and proud dedication to everything you commit to",
          shadow: "You may become overly critical or boastful, needing recognition and perfection from yourself and others",
          insight: "You are a meticulous organizer with natural confidence, but practice humility and remember that imperfection is part of being human"
        },
        dog: {
          fullTitle: "Dog - The Loyal Guardian",
          light: "You are loyal, honest, and protective, naturally championing justice and caring deeply for those you love",
          shadow: "You may become anxious or overly cynical, seeing danger everywhere and struggling to trust",
          insight: "You are a devoted guardian with strong values, but balance your protective instincts with trust and remember that not all risks are threats"
        },
        pig: {
          fullTitle: "Pig - The Generous Heart",
          light: "You are generous, optimistic, and sincere, bringing warmth and abundance through your big heart and honest nature",
          shadow: "You may become indulgent or naive, trusting too easily or seeking comfort through excess",
          insight: "You are a warm-hearted soul who sees the good in others, but balance your generosity with discernment and healthy boundaries"
        }
      },

      // Chinese Element Descriptions
      chineseElementDescriptions: {
        wood: {
          fullTitle: "Wood Element - The Growing Creator",
          light: "You are creative, expansive, and growth-oriented, naturally bringing new ideas and possibilities into being",
          shadow: "You may become scattered or overly idealistic, starting many things without grounding them in reality",
          insight: "You are a creative force who initiates growth, but balance your expansive nature with practical follow-through"
        },
        fire: {
          fullTitle: "Fire Element - The Passionate Transformer",
          light: "You are passionate, dynamic, and transformative, bringing intense energy and inspiring change wherever you go",
          shadow: "You may burn out or become aggressive, consuming yourself and others with uncontrolled intensity",
          insight: "You are a transformative force with powerful energy, but channel your passion sustainably and remember to tend your own flame"
        },
        earth: {
          fullTitle: "Earth Element - The Stable Nurturer",
          light: "You are grounded, reliable, and nurturing, creating stable foundations and caring for others with practical wisdom",
          shadow: "You may become stubborn or resistant to change, prioritizing security over necessary growth",
          insight: "You are a stabilizing force with practical wisdom, but stay open to new possibilities and trust the process of change"
        },
        metal: {
          fullTitle: "Metal Element - The Refined Achiever",
          light: "You are structured, resilient, and refined, bringing precision and high standards to everything you create",
          shadow: "You may become rigid or overly critical, cutting away what doesn't meet your exacting standards",
          insight: "You are a master of refinement with strong principles, but balance your standards with flexibility and compassion"
        },
        water: {
          fullTitle: "Water Element - The Intuitive Flow",
          light: "You are adaptive, intuitive, and flowing, naturally navigating life's changes with emotional wisdom and depth",
          shadow: "You may lose boundaries or become overwhelmed, absorbing too much without maintaining your own shape",
          insight: "You are an intuitive force who flows with life, but maintain your boundaries and remember that water also has its own direction"
        }
      },

      // Sun Sign Descriptions
      sunSignDescriptions: {
        aries: {
          fullTitle: "Aries Sun - The Pioneer",
          light: "You initiate action with courage and enthusiasm, blazing trails and inspiring others to embrace their own power",
          shadow: "You may become impulsive or impatient, starting things you don't finish or steamrolling others in your enthusiasm",
          insight: "You are a natural initiator with warrior energy, but channel your fire into sustained action and consider the impact on others"
        },
        taurus: {
          fullTitle: "Taurus Sun - The Builder",
          light: "You create lasting beauty and stability, savoring life's pleasures while building something enduring",
          shadow: "You may become stubborn or resistant to necessary change, prioritizing comfort over growth",
          insight: "You are a patient builder who creates lasting value, but remember that security comes from inner steadiness, not external control"
        },
        gemini: {
          fullTitle: "Gemini Sun - The Communicator",
          light: "You connect ideas and people with wit and curiosity, bringing fresh perspectives and versatile thinking",
          shadow: "You may scatter your energy or struggle with consistency, skimming surfaces without going deep",
          insight: "You are a brilliant communicator who bridges worlds, but balance your love of variety with depth and follow-through"
        },
        cancer: {
          fullTitle: "Cancer Sun - The Nurturer",
          light: "You care deeply and create emotional safety, intuitively understanding and meeting others' needs",
          shadow: "You may become overly protective or moody, retreating into your shell when feeling vulnerable",
          insight: "You feel emotions deeply and care profoundly, but remember to nurture yourself and communicate your needs clearly"
        },
        leo: {
          fullTitle: "Leo Sun - The Performer",
          light: "You shine with creative self-expression and generous warmth, inspiring others to embrace their own uniqueness",
          shadow: "You may become overly focused on recognition or take criticism as a personal attack on your identity",
          insight: "You are a natural performer with radiant confidence, but remember your light shines brightest when you celebrate others too"
        },
        virgo: {
          fullTitle: "Virgo Sun - The Healer",
          light: "You serve with practical wisdom and attention to detail, continuously improving yourself and your environment",
          shadow: "You may become overly critical or perfectionistic, seeing flaws instead of appreciating what works",
          insight: "You are a dedicated healer who seeks excellence, but practice self-compassion and remember that perfect is the enemy of good"
        },
        libra: {
          fullTitle: "Libra Sun - The Diplomat",
          light: "You create harmony and beauty, seeing all sides of every situation with grace and fairness",
          shadow: "You may struggle with decisions or lose yourself trying to please everyone and avoid conflict",
          insight: "You are a natural peacemaker who brings balance, but remember that your voice matters and healthy boundaries support true harmony"
        },
        scorpio: {
          fullTitle: "Scorpio Sun - The Transformer",
          light: "You dive deep, transform challenges into growth, and see the truth that others hide from",
          shadow: "You may become controlling, secretive, or hold onto grudges, using emotional intensity as a weapon",
          insight: "You are intensely perceptive and transformative, but practice vulnerability and release what no longer serves you"
        },
        sagittarius: {
          fullTitle: "Sagittarius Sun - The Philosopher",
          light: "You seek truth and meaning with optimistic enthusiasm, sharing wisdom and expanding others' horizons",
          shadow: "You may become preachy or restless, avoiding commitment in your quest for the next adventure",
          insight: "You are a truth-seeker who inspires growth, but balance your love of freedom with presence and follow through on your commitments"
        },
        capricorn: {
          fullTitle: "Capricorn Sun - The Achiever",
          light: "You build lasting success through discipline and strategic planning, achieving mastery through patient effort",
          shadow: "You may become overly serious or workaholic, sacrificing joy and connection for achievement",
          insight: "You are a natural master-builder who creates lasting impact, but remember that rest and connection fuel sustainable success"
        },
        aquarius: {
          fullTitle: "Aquarius Sun - The Visionary",
          light: "You see the future and champion progress for all, bringing innovative thinking and humanitarian vision",
          shadow: "You may become detached or so focused on ideals that you miss the human needs in front of you",
          insight: "You are a revolutionary thinker who envisions a better world, but ground your ideals in present-moment connection and compassion"
        },
        pisces: {
          fullTitle: "Pisces Sun - The Mystic",
          light: "You flow with intuition and compassion, creating art and healing from your deep connection to the divine",
          shadow: "You may escape into fantasy or lose boundaries, absorbing others' emotions without protecting your own energy",
          insight: "You are a compassionate mystic with profound sensitivity, but establish clear boundaries and ground your dreams in reality"
        }
      },

      // Soul Urge Number Descriptions
      soulUrgeDescriptions: {
        1: {
          fullTitle: "Soul Urge 1 - The Independent Pioneer",
          light: "Your deepest desire is to lead, innovate, and express your unique individuality with confidence",
          shadow: "You may struggle with needing constant independence or dominating others to feel worthy",
          insight: "You long to lead and stand on your own two feet, but true strength includes allowing others to support you"
        },
        2: {
          fullTitle: "Soul Urge 2 - The Peaceful Connector",
          light: "Your soul craves harmony, partnership, and creating environments where everyone feels heard",
          shadow: "You may lose yourself in others' needs or avoid conflict even when it serves growth",
          insight: "You deeply desire peace and connection, but remember that your needs and voice matter just as much"
        },
        3: {
          fullTitle: "Soul Urge 3 - The Creative Expresser",
          light: "Your heart yearns to express yourself creatively and bring joy to others through your natural talents",
          shadow: "You may scatter your energy seeking applause or struggle with discipline when creativity feels like work",
          insight: "You crave creative expression and recognition, but create from joy rather than seeking external validation"
        },
        4: {
          fullTitle: "Soul Urge 4 - The Stable Builder",
          light: "You deeply desire to create lasting foundations, order, and security for yourself and those you love",
          shadow: "You may become rigid or controlling when life doesn't follow your carefully laid plans",
          insight: "You long for stability and structure, but remember that flexibility strengthens rather than weakens your foundations"
        },
        5: {
          fullTitle: "Soul Urge 5 - The Freedom Lover",
          light: "Your soul craves freedom, adventure, and the thrill of experiencing all that life has to offer",
          shadow: "You may run from commitment or struggle when routines are necessary for growth",
          insight: "You deeply desire freedom and variety, but true liberation includes choosing meaningful commitments"
        },
        6: {
          fullTitle: "Soul Urge 6 - The Loving Caretaker",
          light: "Your heart yearns to nurture, create beauty, and take responsibility for those you love",
          shadow: "You may become controlling or martyred, believing you must fix and save everyone",
          insight: "You crave harmony and the ability to care for others, but remember that healthy love includes boundaries"
        },
        7: {
          fullTitle: "Soul Urge 7 - The Truth Seeker",
          light: "Your soul deeply desires wisdom, spiritual understanding, and time for quiet contemplation",
          shadow: "You may become isolated or dismissive of practical realities in your quest for truth",
          insight: "You long for deeper understanding and spiritual connection, but balance your inner world with outer engagement"
        },
        8: {
          fullTitle: "Soul Urge 8 - The Ambitious Manifester",
          light: "Your heart craves material success, power, and the ability to create abundance and impact",
          shadow: "You may define your worth solely through achievement or become controlling in pursuit of success",
          insight: "You deeply desire power and material mastery, but use your gifts with integrity to uplift others"
        },
        9: {
          fullTitle: "Soul Urge 9 - The Compassionate Humanitarian",
          light: "Your soul yearns to serve humanity with unconditional love and universal compassion",
          shadow: "You may become martyred or struggle to receive, always giving without allowing support",
          insight: "You crave the ability to serve and heal the world, but remember that you must receive in order to give sustainably"
        },
        11: {
          fullTitle: "Soul Urge 11 - The Inspired Visionary",
          light: "Your heart desires to inspire others with spiritual insight and illuminating vision",
          shadow: "You may feel overwhelmed by your sensitivity or doubt your intuitive knowing",
          insight: "You long to inspire and illuminate, but ground your visions in practical action and trust your inner guidance"
        },
        22: {
          fullTitle: "Soul Urge 22 - The Master Manifester",
          light: "Your soul craves the ability to turn grand visions into tangible reality that serves many",
          shadow: "You may feel overwhelmed by the magnitude of your dreams or doubt your ability to achieve them",
          insight: "You deeply desire to build something extraordinary and lasting, but trust the journey one step at a time"
        },
        33: {
          fullTitle: "Soul Urge 33 - The Universal Healer",
          light: "Your heart yearns to heal and teach humanity with unconditional love and selfless service",
          shadow: "You may burn out from taking on everyone's pain or struggle with martyrdom",
          insight: "You crave the ability to heal and uplift all beings, but sustainable service requires honoring your own needs"
        }
      },

      // Personality Number Descriptions
      personalityNumberDescriptions: {
        1: {
          fullTitle: "Personality 1 - The Confident Leader",
          light: "You project confidence, independence, and natural leadership that inspires others to follow",
          shadow: "You may come across as domineering or overly self-reliant, appearing unable to accept help",
          insight: "You radiate leadership and strength, but showing vulnerability actually enhances rather than diminishes your presence"
        },
        2: {
          fullTitle: "Personality 2 - The Gentle Diplomat",
          light: "You present as approachable, cooperative, and considerate, putting others at ease",
          shadow: "You may appear passive or overly accommodating, hiding your true strength",
          insight: "You project gentleness and harmony, but remember that your strength is visible when you state your needs clearly"
        },
        3: {
          fullTitle: "Personality 3 - The Charismatic Communicator",
          light: "You come across as creative, expressive, and charming, naturally drawing people to you",
          shadow: "You may appear superficial or overly focused on image and entertainment",
          insight: "You radiate creativity and charm, but authentic depth creates more meaningful connections than performance"
        },
        4: {
          fullTitle: "Personality 4 - The Reliable Organizer",
          light: "You project stability, reliability, and practical competence that others depend on",
          shadow: "You may come across as rigid, overly serious, or resistant to spontaneity",
          insight: "You radiate dependability and order, but showing your playful side makes you more approachable"
        },
        5: {
          fullTitle: "Personality 5 - The Dynamic Adventurer",
          light: "You present as exciting, adaptable, and full of life, inspiring others to embrace change",
          shadow: "You may appear unreliable or commitment-phobic, always seeking the next thrill",
          insight: "You project energy and freedom, but demonstrating follow-through shows the depth behind your dynamism"
        },
        6: {
          fullTitle: "Personality 6 - The Warm Nurturer",
          light: "You come across as caring, responsible, and trustworthy, naturally attracting those who need support",
          shadow: "You may appear controlling or judgmental when your help isn't wanted",
          insight: "You radiate warmth and care, but respecting others' choices (even when you see better solutions) honors their journey"
        },
        7: {
          fullTitle: "Personality 7 - The Mysterious Thinker",
          light: "You project depth, wisdom, and intriguing mystery that draws others to seek your insights",
          shadow: "You may appear aloof, critical, or unapproachable due to your reserved nature",
          insight: "You radiate intelligence and depth, but opening up emotionally helps others connect with your wisdom"
        },
        8: {
          fullTitle: "Personality 8 - The Powerful Authority",
          light: "You present as confident, successful, and authoritative, commanding respect naturally",
          shadow: "You may appear intimidating, materialistic, or overly concerned with status",
          insight: "You project power and competence, but vulnerability and humility make your strength even more magnetic"
        },
        9: {
          fullTitle: "Personality 9 - The Compassionate Sage",
          light: "You come across as wise, accepting, and universally compassionate toward all people",
          shadow: "You may appear detached or superior, seeming to be above the struggles of ordinary life",
          insight: "You radiate wisdom and acceptance, but sharing your own struggles creates deeper human connection"
        },
        11: {
          fullTitle: "Personality 11 - The Inspiring Visionary",
          light: "You project inspiration, spiritual depth, and visionary insight that uplifts others",
          shadow: "You may appear overly idealistic or impractical, disconnected from everyday realities",
          insight: "You radiate inspiration and higher vision, but grounding your insights in practical terms helps others apply them"
        },
        22: {
          fullTitle: "Personality 22 - The Master Builder",
          light: "You present as capable of achieving grand visions through practical mastery",
          shadow: "You may appear overwhelmed or burdened by the weight of your potential",
          insight: "You project extraordinary capability, but showing your process (not just results) inspires others more deeply"
        },
        33: {
          fullTitle: "Personality 33 - The Master Healer",
          light: "You come across as unconditionally loving, healing, and devoted to serving others",
          shadow: "You may appear martyred or struggle to say no, taking on more than you can carry",
          insight: "You radiate healing love, but setting boundaries actually strengthens your ability to serve"
        }
      },

      // Birthday Number Descriptions
      birthdayNumberDescriptions: {
        1: {
          fullTitle: "Birthday 1 - Natural Leader",
          light: "You have an innate gift for leadership, independence, and pioneering new directions",
          shadow: "You may struggle with being too dominant or resistant to collaboration",
          insight: "You have natural leadership abilities, but the strongest leaders empower others to lead too"
        },
        2: {
          fullTitle: "Birthday 2 - Intuitive Mediator",
          light: "You possess a natural talent for diplomacy, cooperation, and bringing people together",
          shadow: "You may struggle with over-accommodation or avoiding necessary confrontation",
          insight: "You have a gift for creating harmony, but your voice deserves to be heard as clearly as others'"
        },
        3: {
          fullTitle: "Birthday 3 - Creative Communicator",
          light: "You have a special gift for creative expression, communication, and bringing joy to others",
          shadow: "You may scatter your talents or seek validation through constant entertainment",
          insight: "You have natural creative abilities, but focused expression creates more impact than scattered enthusiasm"
        },
        4: {
          fullTitle: "Birthday 4 - Practical Builder",
          light: "You possess a special talent for organization, structure, and building lasting foundations",
          shadow: "You may become rigid or resistant to change that could improve your systems",
          insight: "You have a gift for creating stability, but flexibility ensures your structures can evolve"
        },
        5: {
          fullTitle: "Birthday 5 - Dynamic Catalyst",
          light: "You have a natural gift for adaptability, communication, and inspiring positive change",
          shadow: "You may struggle with commitment or restlessness when routine is necessary",
          insight: "You have a talent for bringing fresh energy, but meaningful growth includes some consistency"
        },
        6: {
          fullTitle: "Birthday 6 - Responsible Nurturer",
          light: "You possess a special gift for creating harmony, beauty, and caring for your community",
          shadow: "You may become controlling or sacrificial in your desire to help everyone",
          insight: "You have natural nurturing abilities, but healthy service includes honoring your own needs"
        },
        7: {
          fullTitle: "Birthday 7 - Spiritual Seeker",
          light: "You have an innate gift for spiritual insight, analysis, and understanding life's deeper mysteries",
          shadow: "You may become isolated or disconnected from practical realities",
          insight: "You have a talent for deep understanding, but wisdom is most powerful when shared and applied"
        },
        8: {
          fullTitle: "Birthday 8 - Powerful Manifester",
          light: "You possess a natural gift for material success, leadership, and manifesting abundance",
          shadow: "You may focus too heavily on material achievement or control",
          insight: "You have powerful manifestation abilities, but true success includes integrity and uplifting others"
        },
        9: {
          fullTitle: "Birthday 9 - Compassionate Humanitarian",
          light: "You have a special gift for universal love, wisdom, and serving the greater good",
          shadow: "You may struggle to complete things or become martyred in service",
          insight: "You have natural humanitarian gifts, but you serve more powerfully when you also receive"
        },
        10: {
          fullTitle: "Birthday 10 - Independent Achiever",
          light: "You have a gift for independent achievement and innovative leadership",
          shadow: "You may struggle with stubbornness or difficulty accepting support",
          insight: "You have strong independent abilities, but collaboration amplifies your impact"
        },
        11: {
          fullTitle: "Birthday 11 - Intuitive Inspirer",
          light: "You possess a special gift for spiritual insight and inspiring others with your vision",
          shadow: "You may feel overwhelmed by your sensitivity or doubt your intuition",
          insight: "You have powerful intuitive abilities, but trust your inner knowing even when others question it"
        },
        12: {
          fullTitle: "Birthday 12 - Creative Expresser",
          light: "You have a natural gift for self-expression, creativity, and uplifting communication",
          shadow: "You may scatter your energy or seek too much external validation",
          insight: "You have natural creative talents, but focused discipline amplifies your expressive power"
        },
        13: {
          fullTitle: "Birthday 13 - Practical Creative",
          light: "You possess a gift for combining creativity with practical organization and hard work",
          shadow: "You may struggle with overwork or rigid thinking that limits your creativity",
          insight: "You blend creativity with discipline, but remember that flexibility enhances your foundations"
        },
        14: {
          fullTitle: "Birthday 14 - Freedom-Loving Builder",
          light: "You have a special gift for bringing change and freedom through constructive means",
          shadow: "You may struggle with restlessness or impulsive decisions",
          insight: "You have talents for both freedom and building, but balance exploration with commitment"
        },
        15: {
          fullTitle: "Birthday 15 - Harmonious Leader",
          light: "You possess a gift for creating harmony while taking responsibility and leading others",
          shadow: "You may become controlling in your desire to help or fix situations",
          insight: "You have natural leadership and nurturing gifts, but trust others to solve their own challenges"
        },
        16: {
          fullTitle: "Birthday 16 - Spiritual Analyst",
          light: "You have an innate gift for spiritual depth, analytical thinking, and inner wisdom",
          shadow: "You may become isolated or overly introspective, disconnecting from others",
          insight: "You have powerful analytical and spiritual abilities, but share your insights to multiply their impact"
        },
        17: {
          fullTitle: "Birthday 17 - Ambitious Seeker",
          light: "You possess a special gift for combining material success with spiritual understanding",
          shadow: "You may struggle to balance worldly achievement with inner growth",
          insight: "You can excel in both material and spiritual realms, but integrate them rather than choosing one"
        },
        18: {
          fullTitle: "Birthday 18 - Humanitarian Leader",
          light: "You have a natural gift for leadership in service of humanitarian causes",
          shadow: "You may become martyred or struggle with completion due to taking on too much",
          insight: "You have powerful service-oriented leadership, but sustainable impact requires boundaries"
        },
        19: {
          fullTitle: "Birthday 19 - Independent Achiever",
          light: "You possess a gift for independent achievement and self-reliant success",
          shadow: "You may struggle with needing to do everything yourself or difficulty receiving help",
          insight: "You have strong self-sufficiency, but allowing support creates even greater success"
        },
        20: {
          fullTitle: "Birthday 20 - Sensitive Cooperator",
          light: "You have a special gift for intuitive cooperation and bringing people together",
          shadow: "You may become overly sensitive or lose yourself in others' needs",
          insight: "You have natural diplomatic abilities, but your sensitivity is strength when you honor your own needs too"
        },
        21: {
          fullTitle: "Birthday 21 - Joyful Creator",
          light: "You possess a gift for creative expression that brings joy and inspiration to others",
          shadow: "You may scatter your energy or rely too heavily on others' approval",
          insight: "You have powerful creative gifts, but focused direction amplifies your impact"
        },
        22: {
          fullTitle: "Birthday 22 - Master Builder",
          light: "You have an innate gift for manifesting grand visions into practical reality",
          shadow: "You may feel overwhelmed by your potential or doubt your ability to achieve it",
          insight: "You have extraordinary building abilities, but trust the process one step at a time"
        },
        23: {
          fullTitle: "Birthday 23 - Dynamic Communicator",
          light: "You possess a special gift for communication, adaptability, and inspiring change",
          shadow: "You may struggle with restlessness or scattered focus",
          insight: "You have natural communication talents, but depth creates more lasting impact than breadth"
        },
        24: {
          fullTitle: "Birthday 24 - Devoted Nurturer",
          light: "You have a natural gift for creating harmony and caring for family and community",
          shadow: "You may become controlling or sacrificial in your devotion to others",
          insight: "You have powerful nurturing abilities, but sustainable care includes caring for yourself"
        },
        25: {
          fullTitle: "Birthday 25 - Intuitive Seeker",
          light: "You possess a gift for spiritual insight combined with analytical understanding",
          shadow: "You may struggle with isolation or disconnection from practical realities",
          insight: "You have deep intuitive wisdom, but grounding your insights makes them accessible to others"
        },
        26: {
          fullTitle: "Birthday 26 - Powerful Nurturer",
          light: "You have a special gift for combining material success with caring service",
          shadow: "You may struggle with control or define worth through provision for others",
          insight: "You can both succeed and nurture, but remember that presence matters as much as provision"
        },
        27: {
          fullTitle: "Birthday 27 - Compassionate Analyst",
          light: "You possess a gift for combining deep wisdom with universal compassion",
          shadow: "You may become detached or struggle to apply your insights practically",
          insight: "You have profound wisdom and compassion, but practical application multiplies your impact"
        },
        28: {
          fullTitle: "Birthday 28 - Independent Leader",
          light: "You have a natural gift for independent leadership and innovative achievement",
          shadow: "You may struggle with dominance or difficulty accepting others' contributions",
          insight: "You have strong leadership abilities, but collaborative leadership creates more sustainable success"
        },
        29: {
          fullTitle: "Birthday 29 - Intuitive Humanitarian",
          light: "You possess a special gift for intuitive service and compassionate leadership",
          shadow: "You may feel overwhelmed by your sensitivity or struggle with boundaries",
          insight: "You have powerful intuitive and humanitarian gifts, but honor your sensitivity by protecting your energy"
        },
        30: {
          fullTitle: "Birthday 30 - Expressive Communicator",
          light: "You have an innate gift for joyful expression and uplifting communication",
          shadow: "You may scatter your talents or perform rather than expressing authentically",
          insight: "You have natural expressive abilities, but authentic depth creates more meaningful connections"
        },
        31: {
          fullTitle: "Birthday 31 - Practical Creator",
          light: "You possess a gift for combining creative expression with practical discipline",
          shadow: "You may struggle with rigidity or overwork that stifles your creativity",
          insight: "You blend creativity with structure, but remember that play fuels sustainable productivity"
        },
        33: {
          fullTitle: "Birthday 33 - Master Teacher",
          light: "You have a special gift for healing, teaching, and uplifting humanity with love",
          shadow: "You may burn out from taking on everyone's pain or struggle with martyrdom",
          insight: "You have extraordinary healing and teaching abilities, but sustainable service requires self-care"
        }
      },

      // Cognitive Function Descriptions
      cognitiveFunctionDescriptions: {
        fe: {
          fullTitle: "Fe - Extraverted Feeling",
          light: "You naturally create harmony by reading and responding to others' emotions and social dynamics",
          shadow: "You may lose your own feelings while managing everyone else's emotional state",
          insight: "You have a gift for creating emotional connection, but honor your own feelings as much as others'"
        },
        fi: {
          fullTitle: "Fi - Introverted Feeling",
          light: "You deeply know your own values and make authentic choices aligned with your internal compass",
          shadow: "You may become rigid about your values or dismiss others' perspectives as less authentic",
          insight: "You have strong internal values, but remember that others' values can be equally authentic"
        },
        te: {
          fullTitle: "Te - Extraverted Thinking",
          light: "You naturally organize external systems and processes for maximum efficiency and results",
          shadow: "You may become controlling or dismiss emotional considerations in pursuit of efficiency",
          insight: "You excel at creating effective systems, but the human element often determines lasting success"
        },
        ti: {
          fullTitle: "Ti - Introverted Thinking",
          light: "You build precise internal frameworks of logic and understand complex systems deeply",
          shadow: "You may get lost in analysis paralysis or dismiss ideas that don't fit your logical model",
          insight: "You have powerful analytical abilities, but pragmatic action creates impact alongside understanding"
        },
        ne: {
          fullTitle: "Ne - Extraverted Intuition",
          light: "You naturally see countless possibilities and connections, generating innovative ideas",
          shadow: "You may start many projects without finishing or become scattered across too many options",
          insight: "You have a gift for seeing potential, but focused follow-through turns possibilities into reality"
        },
        ni: {
          fullTitle: "Ni - Introverted Intuition",
          light: "You see the future pattern and understand where things are heading with penetrating insight",
          shadow: "You may become attached to your vision or struggle to explain your knowing to others",
          insight: "You have powerful predictive insight, but stay flexible as reality unfolds differently than expected"
        },
        se: {
          fullTitle: "Se - Extraverted Sensing",
          light: "You fully engage with present-moment reality, responding quickly to what's happening now",
          shadow: "You may become impulsive or struggle with long-term planning and consequences",
          insight: "You excel at being present and responsive, but balance immediacy with strategic thinking"
        },
        si: {
          fullTitle: "Si - Introverted Sensing",
          light: "You draw on past experience and internal impressions to create stability and maintain traditions",
          shadow: "You may resist change or become stuck in 'the way things have always been'",
          insight: "You have a gift for learning from experience, but stay open to new approaches that serve growth"
        }
      },

      // Task Approach Descriptions
      taskApproachDescriptions: {
        systematic: {
          fullTitle: "Systematic Task Approach",
          light: "You approach tasks with organization, planning, and structured methodology",
          shadow: "You may resist spontaneity or struggle when plans need to change quickly",
          insight: "You excel at systematic execution, but flexibility enhances your ability to adapt to the unexpected"
        },
        adaptable: {
          fullTitle: "Adaptable Task Approach",
          light: "You approach tasks with flexibility, keeping options open and adjusting as you go",
          shadow: "You may struggle with follow-through or decisive action when structure would serve you",
          insight: "You excel at adapting to change, but some structure actually increases your freedom and effectiveness"
        },
        methodical: {
          fullTitle: "Methodical Task Approach",
          light: "You approach tasks step-by-step with careful attention to detail and thorough completion",
          shadow: "You may get lost in details or resist moving forward before everything is perfect",
          insight: "You excel at thorough execution, but remember that done is often better than perfect"
        },
        spontaneous: {
          fullTitle: "Spontaneous Task Approach",
          light: "You approach tasks with energy and enthusiasm, responding to inspiration in the moment",
          shadow: "You may struggle with consistency or completing tasks when the initial excitement fades",
          insight: "You excel at energized action, but sustainable progress includes working even when uninspired"
        }
      },

      // Communication Descriptions
      communicationDescriptions: {
        clear: {
          fullTitle: "Clear Direct Communication",
          light: "You communicate with clarity, directness, and logical precision",
          shadow: "You may come across as blunt or insensitive to emotional nuances",
          insight: "You excel at clear communication, but consider the emotional impact alongside the logical content"
        },
        empathic: {
          fullTitle: "Empathic Communication",
          light: "You communicate with warmth, emotional attunement, and consideration for feelings",
          shadow: "You may struggle with direct feedback or avoid necessary difficult conversations",
          insight: "You excel at empathic connection, but sometimes kindness includes speaking uncomfortable truths"
        },
        analytical: {
          fullTitle: "Analytical Communication",
          light: "You communicate with logical precision, exploring ideas thoroughly and systematically",
          shadow: "You may over-explain or get lost in details that obscure your main point",
          insight: "You excel at thorough analysis, but concise clarity often communicates more effectively than exhaustive detail"
        },
        expressive: {
          fullTitle: "Expressive Communication",
          light: "You communicate with enthusiasm, creativity, and engaging storytelling",
          shadow: "You may embellish or lose your audience in tangents and entertaining details",
          insight: "You excel at engaging expression, but focused messaging creates more memorable impact"
        },
        concise: {
          fullTitle: "Concise Communication",
          light: "You communicate efficiently, getting to the point with minimal unnecessary detail",
          shadow: "You may leave out important context or come across as curt or dismissive",
          insight: "You excel at efficient communication, but some context helps others understand your meaning"
        },
        thoughtful: {
          fullTitle: "Thoughtful Communication",
          light: "You communicate with careful consideration, taking time to process before responding",
          shadow: "You may take too long to respond or struggle with real-time conversation demands",
          insight: "You excel at thoughtful response, but trust that your immediate reactions also have value"
        }
      },

      // Decision Making Descriptions
      decisionMakingDescriptions: {
        logical: {
          fullTitle: "Logical Decision Making",
          light: "You make decisions based on objective analysis, consistency, and rational principles",
          shadow: "You may dismiss emotional factors or human needs in pursuit of logical consistency",
          insight: "You excel at rational analysis, but the best decisions often integrate both logic and human impact"
        },
        valuesbased: {
          fullTitle: "Values-Based Decision Making",
          light: "You make decisions based on personal values, what feels right, and alignment with principles",
          shadow: "You may struggle with decisions that require compromising between deeply held values",
          insight: "You excel at values-aligned choices, but sometimes growth requires re-examining what you value"
        },
        intuitive: {
          fullTitle: "Intuitive Decision Making",
          light: "You make decisions based on gut feelings, pattern recognition, and future implications",
          shadow: "You may struggle to explain your decisions or miss important present-moment details",
          insight: "You excel at intuitive knowing, but grounding your insights in evidence helps others trust your vision"
        },
        practical: {
          fullTitle: "Practical Decision Making",
          light: "You make decisions based on what works, past experience, and proven methods",
          shadow: "You may resist innovative approaches or miss opportunities due to over-reliance on precedent",
          insight: "You excel at practical wisdom, but stay open to new approaches when old methods no longer serve"
        },
        collaborative: {
          fullTitle: "Collaborative Decision Making",
          light: "You make decisions by considering multiple perspectives and seeking input from others",
          shadow: "You may struggle with timely decisions or lose your own voice in consensus-seeking",
          insight: "You excel at inclusive decision-making, but trust your own judgment when collaboration isn't possible"
        }
      },

      // Human Design Strategy Descriptions
      strategyDescriptions: {
        respond: {
          fullTitle: "Strategy: To Respond",
          light: "You're designed to wait for life to come to you, then respond with your gut yes or no",
          shadow: "You may feel frustrated when you initiate rather than respond to what life brings",
          insight: "You have sustainable energy when you respond to opportunities, but trust that the right things will come to you"
        },
        'wait for the invitation': {
          fullTitle: "Strategy: Wait for the Invitation",
          light: "You're designed to wait for recognition and invitation before sharing your insights and guidance",
          shadow: "You may feel bitter when your guidance is ignored or when you offer advice uninvited",
          insight: "You're here to guide when invited, but trust that the right people will recognize and seek your wisdom"
        },
        waitfortheinvitation: {
          fullTitle: "Strategy: Wait for the Invitation",
          light: "You're designed to wait for recognition and invitation before sharing your insights and guidance",
          shadow: "You may feel bitter when your guidance is ignored or when you offer advice uninvited",
          insight: "You're here to guide when invited, but trust that the right people will recognize and seek your wisdom"
        },
        inform: {
          fullTitle: "Strategy: To Inform",
          light: "You're designed to inform others of your plans before taking action to reduce resistance",
          shadow: "You may feel angry when others resist or try to control your independent actions",
          insight: "You're here to initiate, but informing others of your plans creates support rather than resistance"
        },
        'wait a lunar cycle': {
          fullTitle: "Strategy: Wait a Lunar Cycle",
          light: "You're designed to wait through a full moon cycle to gain clarity on major decisions",
          shadow: "You may feel disappointed by experiencing all perspectives or pressured to decide quickly",
          insight: "You're here to see all sides clearly, but honor your need for time to process before committing"
        },
        waitalunarcycle: {
          fullTitle: "Strategy: Wait a Lunar Cycle",
          light: "You're designed to wait through a full moon cycle to gain clarity on major decisions",
          shadow: "You may feel disappointed by experiencing all perspectives or pressured to decide quickly",
          insight: "You're here to see all sides clearly, but honor your need for time to process before committing"
        }
      },

      // Human Design Profile Descriptions
      profileDescriptions: {
        '1/3': {
          fullTitle: "Profile 1/3 - Investigator/Martyr",
          light: "You build solid foundations through research and learn wisdom through trial and error",
          shadow: "You may fear making mistakes or get stuck investigating without taking action",
          insight: "You're here to build expertise through experimentation, but mistakes are required research, not failures"
        },
        '1/4': {
          fullTitle: "Profile 1/4 - Investigator/Opportunist",
          light: "You master knowledge and share it through your trusted network and community",
          shadow: "You may isolate in study or feel torn between depth and social connection",
          insight: "You're here to master subjects and share through relationship, but balance solo study with community engagement"
        },
        '2/4': {
          fullTitle: "Profile 2/4 - Hermit/Opportunist",
          light: "You have natural gifts that others recognize, and you share them through your community",
          shadow: "You may resist being called out or prefer isolation over the networking you need",
          insight: "You're here to develop natural talents and share through connection, but balance alone time with community"
        },
        '2/5': {
          fullTitle: "Profile 2/5 - Hermit/Heretic",
          light: "You have natural gifts that others project onto, expecting you to solve their problems",
          shadow: "You may resent projections or retreat from expectations that don't match your reality",
          insight: "You're here to share natural gifts when called, but set clear boundaries around others' projections"
        },
        '3/5': {
          fullTitle: "Profile 3/5 - Martyr/Heretic",
          light: "You learn through experimentation and provide practical solutions when others have expectations",
          shadow: "You may be seen as unreliable or feel burdened by others' projections",
          insight: "You're here to discover through trial and error, but communicate that your process includes mistakes"
        },
        '3/6': {
          fullTitle: "Profile 3/6 - Martyr/Role Model",
          light: "You experiment in youth and eventually become a wise role model through lived experience",
          shadow: "You may fear mistakes or feel pressure to have answers before you've lived enough",
          insight: "You're here to learn through experience then model wisdom, but trust your experimental phase as necessary"
        },
        '4/6': {
          fullTitle: "Profile 4/6 - Opportunist/Role Model",
          light: "You build strong networks and eventually become a trusted role model for your community",
          shadow: "You may stay in your comfort zone or feel pressure to model before you're ready",
          insight: "You're here to influence through relationship and model wisdom, but honor your process of becoming"
        },
        '4/4': {
          fullTitle: "Profile 4/4 - Opportunist/Opportunist",
          light: "You create impact through your network and community connections, influencing through relationship",
          shadow: "You may fear rejection or limit yourself to only familiar connections",
          insight: "You're here to influence through your network, but expanding your circle multiplies your impact"
        },
        '4/1': {
          fullTitle: "Profile 4/1 - Opportunist/Investigator",
          light: "You build networks while having a deep need for solid foundations of knowledge",
          shadow: "You may feel torn between social connection and the solitary study you crave",
          insight: "You're here to network and build expertise, but balance social time with foundational learning"
        },
        '5/1': {
          fullTitle: "Profile 5/1 - Heretic/Investigator",
          light: "Others project solutions onto you, and you have the deep knowledge to deliver practical answers",
          shadow: "You may resent expectations or isolate in study to avoid others' projections",
          insight: "You're here to provide solutions based on solid research, but set boundaries around unrealistic expectations"
        },
        '5/2': {
          fullTitle: "Profile 5/2 - Heretic/Hermit",
          light: "You're called to solve problems with natural gifts that others recognize even when you don't",
          shadow: "You may resist being called out or feel burdened by projections of savior energy",
          insight: "You're here to provide solutions from natural ability, but only engage when it genuinely calls to you"
        },
        '6/2': {
          fullTitle: "Profile 6/2 - Role Model/Hermit",
          light: "You eventually become a wise role model with natural talents others recognize and seek",
          shadow: "You may retreat from visibility or feel pressure to model before gaining enough life experience",
          insight: "You're here to model wisdom from natural gifts, but honor your need for alone time to integrate"
        },
        '6/3': {
          fullTitle: "Profile 6/3 - Role Model/Martyr",
          light: "You experiment in youth and eventually model wisdom gained through trial and error",
          shadow: "You may judge your experimental phase or feel pressure to have all answers now",
          insight: "You're here to discover through experience then model hard-won wisdom, but mistakes are your research"
        },
        44: {
          fullTitle: "Profile 4/4 - Opportunist/Opportunist",
          light: "You create impact through your network and community connections, influencing through relationship",
          shadow: "You may fear rejection or limit yourself to only familiar connections",
          insight: "You're here to influence through your network, but expanding your circle multiplies your impact"
        }
      },

      // Human Design Pacing Descriptions
      pacingDescriptions: {
        steady: {
          fullTitle: "Steady Pacing",
          light: "You work best with consistent, sustainable rhythm and reliable routines",
          shadow: "You may resist bursts of energy or feel threatened by changing pace",
          insight: "You excel at steady sustainable progress, but occasional sprints can actually enhance your consistency"
        },
        burst: {
          fullTitle: "Burst Pacing",
          light: "You work best in intense focused bursts followed by rest and integration",
          shadow: "You may burn out pushing too hard or feel guilty during necessary rest periods",
          insight: "You excel at powerful bursts of energy, but honor your need for rest as part of your productive cycle"
        },
        sustainable: {
          fullTitle: "Sustainable Pacing",
          light: "You work best with balanced energy, maintaining consistent effort over time",
          shadow: "You may push too hard too long or ignore signs you need to adjust your pace",
          insight: "You excel at sustained effort, but tuning into your energy level prevents burnout and maintains longevity"
        },
        variable: {
          fullTitle: "Variable Pacing",
          light: "You work best when you can vary your intensity based on what feels right in the moment",
          shadow: "You may struggle with external expectations for consistent pace or productivity",
          insight: "You excel at following your natural rhythms, but communicate your variable pace so others understand your process"
        }
      },

      // Astrology Social Style Descriptions  
      socialStyleDescriptions: {
        warm: {
          fullTitle: "Warm Social Style",
          light: "You naturally create warmth and make others feel welcomed and valued in social situations",
          shadow: "You may over-extend yourself socially or struggle to maintain boundaries",
          insight: "You excel at creating warm connection, but protect your energy and say no when you're depleted"
        },
        reserved: {
          fullTitle: "Reserved Social Style",
          light: "You engage socially with thoughtful selectivity, offering depth to those you connect with",
          shadow: "You may appear aloof or miss opportunities by being too cautious socially",
          insight: "You excel at meaningful one-on-one connection, but occasional social stretching expands your world"
        },
        dynamic: {
          fullTitle: "Dynamic Social Style",
          light: "You bring energy and enthusiasm to social situations, naturally engaging and entertaining others",
          shadow: "You may exhaust yourself performing or struggle with quieter social contexts",
          insight: "You excel at bringing energy to social spaces, but balance your dynamism with authentic vulnerability"
        },
        balanced: {
          fullTitle: "Balanced Social Style",
          light: "You adapt your social engagement based on the situation and your energy levels",
          shadow: "You may struggle to define your authentic social preferences or please everyone",
          insight: "You excel at social adaptability, but tune into what feels genuinely right for you rather than others' expectations"
        }
      },

      // Astrology Public Vibe Descriptions
      publicVibeDescriptions: {
        approachable: {
          fullTitle: "Approachable Public Vibe",
          light: "You project warmth and accessibility, making others feel comfortable approaching you",
          shadow: "You may attract energy vampires or struggle to maintain professional boundaries",
          insight: "You excel at approachability, but selective availability protects your energy for meaningful connections"
        },
        mysterious: {
          fullTitle: "Mysterious Public Vibe",
          light: "You project intriguing depth that draws others to want to know you better",
          shadow: "You may be misunderstood or isolated by appearing too reserved or distant",
          insight: "You excel at selective revelation, but strategic vulnerability helps others connect with your depth"
        },
        authoritative: {
          fullTitle: "Authoritative Public Vibe",
          light: "You project confidence and competence that naturally commands respect and attention",
          shadow: "You may intimidate others or create distance through your powerful presence",
          insight: "You excel at commanding presence, but strategic warmth makes your authority more accessible"
        },
        magnetic: {
          fullTitle: "Magnetic Public Vibe",
          light: "You naturally attract attention and interest with your compelling presence",
          shadow: "You may feel overwhelmed by attention or struggle with unwanted projections",
          insight: "You excel at attracting interest, but clear boundaries help you channel attention toward what serves you"
        }
      },

      // Astrology Leadership Style Descriptions
      leadershipStyleDescriptions: {
        collaborative: {
          fullTitle: "Collaborative Leadership",
          light: "You lead by bringing people together, honoring all voices, and building consensus",
          shadow: "You may struggle with timely decisions or lose your own voice seeking everyone's input",
          insight: "You excel at inclusive leadership, but trust your own judgment when consensus isn't possible"
        },
        visionary: {
          fullTitle: "Visionary Leadership",
          light: "You lead by seeing the future clearly and inspiring others to work toward that vision",
          shadow: "You may become disconnected from present realities or frustrated when others don't see your vision",
          insight: "You excel at visionary leadership, but ground your vision in practical steps others can take"
        },
        decisive: {
          fullTitle: "Decisive Leadership",
          light: "You lead by making clear decisions quickly and taking confident action",
          shadow: "You may become authoritarian or miss important input by deciding too quickly",
          insight: "You excel at decisive action, but strategic pauses for input strengthen your decisions"
        },
        inspirational: {
          fullTitle: "Inspirational Leadership",
          light: "You lead by motivating others through enthusiasm, encouragement, and positive energy",
          shadow: "You may avoid difficult feedback or struggle with the harder aspects of leadership",
          insight: "You excel at inspiring others, but complete leadership includes difficult conversations alongside encouragement"
        },
        strategic: {
          fullTitle: "Strategic Leadership",
          light: "You lead by seeing the big picture, planning carefully, and positioning for long-term success",
          shadow: "You may get lost in planning without action or appear cold and calculating",
          insight: "You excel at strategic thinking, but balance planning with decisive action and human connection"
        }
      }
    },
    dreamCategories: {
      creativity: "Creativity",
      career: "Career",
      relationships: "Relationships",
      personal_growth: "Personal Growth",
      spiritual: "Spiritual",
      health: "Health",
      financial: "Financial"
    },
    dreamContent: {
      mbti: {
        "creative-expression": {
          title: "Creative Expression & Authentic Impact",
          description: "Channel your authentic self through creative work that inspires and helps others discover their potential",
          blueprintReason: "Your {mbtiType} nature thrives on authentic self-expression and helping others grow"
        },
        "innovative-solution": {
          title: "Innovative Solution Creation",
          description: "Build systems, products, or solutions that solve complex problems and improve how people live or work",
          blueprintReason: "Your {mbtiType} type excels at seeing possibilities and creating innovative solutions"
        },
        "community-service": {
          title: "Community Impact & Service",
          description: "Create programs, services, or initiatives that directly support and uplift your community",
          blueprintReason: "Your {mbtiType} nature finds fulfillment in practical service to others"
        }
      },
      humanDesign: {
        "mastery-sharing": {
          title: "Master & Share Your Craft",
          description: "Become exceptionally skilled at something you love, then teach and share that mastery with the world",
          blueprintReason: "Your {hdType} energy is designed to master work you love and respond to opportunities"
        },
        "guidance-wisdom": {
          title: "Guide & Optimize Systems",
          description: "Use your natural ability to see the big picture to guide others and optimize how things work",
          blueprintReason: "Your Projector type excels at seeing efficiency and guiding others when invited"
        },
        "initiate-movement": {
          title: "Initiate Revolutionary Change",
          description: "Start something new that creates significant impact and inspires others to follow",
          blueprintReason: "Your Manifestor energy is designed to initiate and create new realities"
        }
      },
      astrology: {
        "leadership-inspiration": {
          title: "Lead & Inspire Others",
          description: "Take on leadership roles where you can motivate, inspire, and energize others toward meaningful goals",
          blueprintReason: "Your {sunSign} sun brings natural leadership and inspirational energy"
        },
        "healing-transformation": {
          title: "Facilitate Healing & Transformation",
          description: "Help others through emotional healing, spiritual growth, or transformative experiences",
          blueprintReason: "Your {sunSign} sun carries deep intuitive and healing abilities"
        }
      }
    },
    
    // AI Coach System Prompts
    aiCoachPrompts: {
      baseContext: `BLUEPRINT-AWARE DREAM DISCOVERY CONTEXT:
You are {displayName}'s deeply empathetic dream discovery guide who understands their unique personality blueprint.

PERSONALITY BLUEPRINT:
- Core Traits: {blueprintContext}
- MBTI: {mbtiType}
- Human Design: {humanDesignType}
- Sun Sign: {sunSign}

CONVERSATION APPROACH:
- Reference their specific personality traits naturally in conversation
- Make personalized suggestions based on their blueprint
- Ask targeted questions that align with their personality type
- Help them see connections between their traits and potential dreams

IMPORTANT: Respond in English.

USER MESSAGE: {userMessage}`,
      
      suggestionPresentation: `PHASE: PRESENTING BLUEPRINT-BASED SUGGESTIONS
Present the dream suggestions I've generated based on their personality blueprint. Explain how each suggestion connects to their specific traits. Ask them which resonates most or if they'd like to explore something different.

SUGGESTIONS TO PRESENT:
{suggestions}

Be warm, personalized, and help them see how their unique blueprint points toward these potential dreams.`,

      exploration: `PHASE: EXPLORING SELECTED DREAM
They've shown interest in: {selectedDream}
Ask deeper questions to understand what specifically excites them about this direction. Reference their personality traits to help them explore further.`,

      refinement: `PHASE: REFINING DREAM INTO CONCRETE GOAL
Help them transform their dream interest into a specific, actionable goal. Use their blueprint to suggest approaches that would work well for their personality type.`,

      default: `Continue the empathetic dream discovery conversation, always keeping their unique personality blueprint in mind.`
    },
    
    // Report section
    report: {
      // Button labels
      standardReport: 'Standard Report',
      hermeticReport: 'Hermetic Report',
      hermeticReportLong: 'Hermetic Report (10,000+ words)',
      generateStandard: 'Generate Standard',
      generateHermetic: 'Generate Hermetic',
      regenerate: 'Regenerate',
      refresh: 'Refresh',
      
      // Loading states
      loading: 'Loading your personality report...',
      generating: 'Generating...',
      
      // Content
      title: 'Personality Report',
      noReports: 'No personality reports available',
      
      // Toast messages
      standardGenerated: 'Standard Report Generated',
      standardGeneratedDescription: 'Your standard personality report has been created successfully!',
      hermeticGenerated: 'Hermetic Report Generated',
      generationFailed: 'Generation Failed',
      hermeticGenerationFailed: 'Hermetic Generation Failed'
    },
    
    // Hermetic Progress Messages
    hermeticProgress: {
      stages: {
        // Core Analysts
        rhythm_analyst: {
          message: "Learning your natural rhythms and energy patterns...",
          description: "Your rhythm profile reveals how you sync with life's natural cycles, peak performance times, and energy management patterns."
        },
        mentalism_analyst: {
          message: "Learning your mental processing patterns and cognitive style...",
          description: "Understanding how your mind processes information, makes decisions, and approaches problem-solving challenges."
        },
        hermetic_core: {
          message: "Learning your core hermetic intelligence signatures...",
          description: "Discovering the fundamental patterns that shape your personality, consciousness, and life approach."
        },
        personality_matrix: {
          message: "Learning your unique personality architecture...",
          description: "Mapping the complex interplay of traits, behaviors, and psychological patterns that make you unique."
        },
        consciousness_analyst: {
          message: "Learning your consciousness patterns and awareness levels...",
          description: "Understanding how you perceive reality, process experiences, and maintain self-awareness."
        },
        wisdom_integration: {
          message: "Learning how wisdom integrates within your personality...",
          description: "Discovering how life experiences have shaped your insights, judgment, and decision-making wisdom."
        },
        behavioral_triggers: {
          message: "Learning your behavioral triggers and response patterns...",
          description: "Understanding the specific situations, events, and conditions that activate your behavioral responses and decision-making patterns."
        },
        
        // Intelligence Extraction Agents
        identity_constructs_analyst: {
          message: "Learning your core identity constructs and self-concept patterns...",
          description: "Understanding how you define yourself and maintain your sense of identity across different contexts."
        },
        execution_bias_analyst: {
          message: "Learning your execution patterns and decision-making biases...",
          description: "Discovering how you take action and the cognitive biases that influence your decisions."
        },
        internal_conflicts_analyst: {
          message: "Learning your internal conflict patterns and resolution strategies...",
          description: "Understanding the psychological tensions within you and how you navigate them."
        },
        spiritual_dimension_analyst: {
          message: "Learning your spiritual dimensions and transcendent patterns...",
          description: "Exploring your connection to meaning, purpose, and experiences beyond the material."
        },
        adaptive_feedback_analyst: {
          message: "Learning your adaptability patterns and feedback integration...",
          description: "Understanding how you respond to change and incorporate new information into your worldview."
        },
        temporal_biology_analyst: {
          message: "Learning your time-based patterns and biological rhythms...",
          description: "Discovering your chronobiology and how time influences your energy and performance."
        },
        metacognitive_biases_analyst: {
          message: "Learning your thinking about thinking patterns...",
          description: "Understanding how you observe and regulate your own cognitive processes."
        },
        attachment_style_analyst: {
          message: "Learning your attachment patterns and relationship dynamics...",
          description: "Exploring how you form bonds and navigate closeness with others."
        },
        goal_archetypes_analyst: {
          message: "Learning your goal-setting patterns and achievement archetypes...",
          description: "Understanding your approach to setting goals and the motivational patterns that drive you."
        },
        crisis_handling_analyst: {
          message: "Learning your crisis response patterns and resilience strategies...",
          description: "Discovering how you handle stress, adversity, and unexpected challenges."
        },
        identity_flexibility_analyst: {
          message: "Learning your identity adaptation and flexibility patterns...",
          description: "Understanding how you evolve your sense of self across different life phases."
        },
        linguistic_fingerprint_analyst: {
          message: "Learning your unique communication patterns and language use...",
          description: "Analyzing your distinctive way of expressing thoughts and connecting through words."
        },
        cognitive_functions_analyst: {
          message: "Learning your cognitive processing functions and mental operations...",
          description: "Understanding the specific mental tools you use to perceive and judge information."
        },
        career_vocational_analyst: {
          message: "Learning your career patterns and vocational calling...",
          description: "Discovering your professional strengths, work style, and calling in life."
        },
        health_wellness_analyst: {
          message: "Learning your health patterns and wellness approaches...",
          description: "Understanding your relationship with physical health, vitality, and well-being practices."
        },
        compatibility_analyst: {
          message: "Learning your relationship compatibility patterns...",
          description: "Exploring how you connect with different personality types and relationship dynamics."
        },
        financial_archetype_analyst: {
          message: "Learning your financial patterns and money archetypes...",
          description: "Understanding your relationship with money, abundance, and financial decision-making."
        },
        karmic_patterns_analyst: {
          message: "Learning your karmic patterns and life lesson themes...",
          description: "Discovering the recurring patterns and soul lessons that shape your journey."
        },
        
        // Hermetic Translators
        mbti_hermetic_translator: {
          message: "Learning your MBTI patterns through hermetic intelligence...",
          description: "Translating your Myers-Briggs type into deeper hermetic wisdom and soul patterns."
        },
        astrology_hermetic_translator: {
          message: "Learning your astrological patterns through hermetic intelligence...",
          description: "Integrating your cosmic blueprint with hermetic understanding of consciousness."
        },
        numerology_hermetic_translator: {
          message: "Learning your numerological patterns through hermetic intelligence...",
          description: "Translating the mathematical patterns of your life into soul intelligence."
        },
        human_design_hermetic_translator: {
          message: "Learning your Human Design patterns through hermetic intelligence...",
          description: "Synthesizing your energetic blueprint with hermetic consciousness principles."
        },
        chinese_astrology_hermetic_translator: {
          message: "Learning your Chinese astrology patterns through hermetic intelligence...",
          description: "Integrating Eastern cosmic wisdom with Western hermetic understanding."
        },
        
        // Hermetic Principle Analysts
        correspondence_analyst: {
          message: "Learning your correspondence patterns and universal connections...",
          description: "Understanding how 'as above, so below' manifests in your life patterns."
        },
        vibration_analyst: {
          message: "Learning your vibrational patterns and energetic frequencies...",
          description: "Discovering the energetic signature that defines your presence and attraction."
        },
        polarity_analyst: {
          message: "Learning your polarity patterns and balance dynamics...",
          description: "Understanding how you navigate opposite forces and find equilibrium."
        },
        causation_analyst: {
          message: "Learning your cause-and-effect patterns and manifestation...",
          description: "Discovering how you create reality through thought, belief, and action."
        },
        gender_analyst: {
          message: "Learning your masculine and feminine energy patterns...",
          description: "Understanding the balance of receptive and active energies within you."
        },
        
        // System Agents
        gate_hermetic_analyst: {
          message: "Learning your gate patterns and threshold experiences...",
          description: "Understanding the key transition points and breakthrough moments in your journey."
        },
        comprehensive_overview: {
          message: "Learning your comprehensive personality overview...",
          description: "Integrating all aspects into a unified understanding of your soul blueprint."
        }
      },
      milestones: {
        0: {
          message: "I am learning about you...",
          description: "You can explore your blueprint and use the app in the meantime, while I learn all the parts of your blueprint and personality."
        },
        10: {
          message: "Learning your foundational personality structures...",
          description: "Discovering the core building blocks that form your psychological foundation and behavioral patterns."
        },
        20: {
          message: "Learning your cognitive processing preferences...",
          description: "Understanding how your mind naturally processes information, makes connections, and forms insights."
        },
        30: {
          message: "Learning your emotional intelligence patterns...",
          description: "Discovering how you experience, process, and integrate emotional information into your decision-making."
        },
        40: {
          message: "Learning your unique interaction styles...",
          description: "Understanding how you naturally connect with others, communicate, and navigate social dynamics."
        },
        50: {
          message: "Learning your deeper psychological layers...",
          description: "Exploring the complex psychological patterns that drive your motivations, fears, and aspirations."
        },
        60: {
          message: "Learning your consciousness expansion patterns...",
          description: "Understanding how you grow, evolve, and expand your awareness throughout your life journey."
        },
        70: {
          message: "Learning your wisdom integration methods...",
          description: "Discovering how you process life experiences into practical wisdom and meaningful insights."
        },
        80: {
          message: "Learning your authentic self-expression patterns...",
          description: "Understanding how your true self manifests in the world through your unique talents and perspectives."
        },
        90: {
          message: "Learning your soul's highest potential pathways...",
          description: "Mapping the routes through which you can actualize your deepest purpose and fullest expression."
        },
        100: {
          message: "Your hermetic intelligence profile is complete and ready!",
          description: "Your comprehensive soul intelligence map is now available, revealing the full spectrum of your consciousness patterns."
        }
      },
      progressTemplate: "Learning progress: {progress}%",
      currentStageTemplate: "Current stage: {stage}",
      learningFromTemplate: "Learning from: {type} data"
    },
    // Onboarding Flow
    onboarding: {
      welcome: 'Welcome to Your Spiritual Journey',
      welcomeDesc: 'Discover your authentic path through personalized guidance and spiritual insights',
      beginJourney: 'Begin Your Journey',
      chooseLanguage: 'Choose Your Language',
      languageDescription: 'Select your preferred language for all AI-generated content, reports, and guidance throughout your journey.',
      languageNote: 'This selection will apply to all AI-generated content including your personality blueprint, reports, coaching responses, and personalized guidance. You can change this later in settings.',
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
      dontKnowBirthTime: 'I don\'t know my birth time',
      lessPrecise: 'Less precise',
      timeAccuracyNote: 'Time improves accuracy; the app works fine without time.',
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
      mbtiDescriptions: {
        'INTJ': 'Strategic and independent, you likely prefer working alone on complex problems and have a natural talent for seeing the big picture.',
        'INTP': 'Analytical and inventive, you probably enjoy exploring theoretical concepts and finding logical explanations for everything.',
        'ENTJ': 'Natural leader with strong organizational skills, you likely excel at implementing your vision and motivating others.',
        'ENTP': 'Innovative and adaptable, you probably love brainstorming new possibilities and engaging in intellectual discussions.',
        'INFJ': 'Insightful and idealistic, you likely seek meaning and connection while working toward your vision of a better world.',
        'INFP': 'Authentic and empathetic, you probably value personal growth and helping others discover their potential.',
        'ENFJ': 'Charismatic and supportive, you likely excel at understanding others and helping them achieve their goals.',
        'ENFP': 'Enthusiastic and creative, you probably see life as full of possibilities and love inspiring others.',
        'ISTJ': 'Reliable and methodical, you likely prefer proven methods and take pride in completing tasks thoroughly.',
        'ISFJ': 'Caring and dependable, you probably focus on helping others and maintaining harmony in your environment.',
        'ESTJ': 'Organized and decisive, you likely excel at managing projects and ensuring things get done efficiently.',
        'ESFJ': 'Warm and conscientious, you probably enjoy bringing people together and creating positive experiences.',
        'ISTP': 'Practical and adaptable, you likely prefer hands-on problem solving and working independently.',
        'ISFP': 'Artistic and sensitive, you probably value personal expression and prefer to work at your own pace.',
        'ESTP': 'Energetic and pragmatic, you likely enjoy taking action and adapting quickly to new situations.',
        'ESFP': 'Spontaneous and enthusiastic, you probably love being around people and creating memorable experiences.'
      },
      showEvidence: 'More Information',
      hideEvidence: 'Less Information',
      dismiss: 'Dismiss',
      continue: 'Continue',
      gotIt: 'Got It',
      generated: 'Generated',
      loading: 'HACS Loading...',
      soulAlchemistReady: 'Your Soul Alchemist is ready to guide your transformation.',
      blueprintUnderstanding: 'Blueprint Understanding',
      systemInitializing: 'System Initializing...',
      insightsQueue: '{current} of {total} insights',
      microLearning: {
        progress: {
          question: 'Question',
          response: 'Response',
          analysis: 'Analysis'
        },
        moduleTypes: {
          foundational: 'foundational',
          validation: 'validation',
          philosophical: 'philosophical'
        },
        interface: {
          questionLabel: 'Question:',
          yourResponse: 'Your Response:',
          skipForNow: 'Skip for Now',
          submit: 'Submit',
          continueButton: 'Continue Learning'
        },
        placeholder: 'Share your thoughts and insights...',
        helperText: 'Take your time to reflect. Quality responses help HACS learn about you.',
        analyzing: {
          title: 'Analyzing Your Response',
          description: 'HACS is evaluating your insights for comprehension and learning evidence...'
        },
        results: {
          learningValidated: 'Learning Validated!',
          responseRecorded: 'Response Recorded',
          genuineUnderstanding: 'Your response shows genuine understanding',
          keepExploring: 'Keep exploring to unlock new insights!',
          comprehensionScore: 'Comprehension Score:',
          intelligenceGrowth: 'Intelligence Growth:',
          learningEvidence: 'Learning Evidence:'
        }
      }
    },
    // Personalized Messages for Real-time Learning
    personalizedMessages: {
      career_vocational: "I'm learning how you approach career decisions and what truly motivates your professional journey",
      rhythm_analyst: "I'm discovering your natural energy patterns and when you perform at your peak",
      mentalism_analyst: "I'm understanding how your mind processes information and makes connections",
      processing: "I'm analyzing your personality matrix to understand who you really are",
      fractal_synthesis: "I'm weaving together all the pieces to create your complete personality portrait",
      default: "I'm learning something fascinating about your unique personality"
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
    // Profile Page
    profile: {
      // Tab Labels
      stats: 'Stats',
      goals: 'Goals', 
      settings: 'Settings',
      
      // Growth Journey Section
      growthJourney: 'Growth Journey',
      blueprintCompletion: 'Blueprint Completion',
      activeGoals: 'Active Goals',
      tasksCompleted: 'Tasks Completed',
      coachConversations: 'Coach Conversations',
      
      // Weekly Insights
      weeklyInsights: 'Weekly Insights',
      mostProductiveDay: 'Most Productive Day',
      energyPeaks: 'Energy Peaks',
      focusSessions: 'Focus Sessions',
      wednesday: 'Wednesday',
      morningPeaks: 'Morning peaks',
      aligned: 'Aligned',
      thisWeek: 'this week',
      
      // Goals Section
      noGoals: 'No goals yet',
      createFirstGoal: 'Create your first goal to start tracking your progress.',
      viewAllGoals: 'View All Goals',
      onTrack: 'On Track',
      progress: 'Progress',
      complete: 'Complete',
      
      // Settings Section
      appSettings: 'App Settings',
      notifications: 'Notifications',
      darkMode: 'Dark Mode',
      accountSettings: 'Account Settings',
      accountSettingsTooltip: 'Manage your account preferences',
      
      // Status Messages
      errorLoading: 'Error loading profile',
      logoutSuccess: 'Successfully logged out',
      logoutError: 'Failed to log out',
      darkModeEnabled: 'Dark mode enabled',
      lightModeEnabled: 'Light mode enabled',
      darkModeDescription: 'Your interface is now in dark mode',
      lightModeDescription: 'Your interface is now in light mode',
      
      // Task Actions
      taskCompleted: 'Task Completed!',
      taskCompletedDescription: 'Great work! You\'ve completed a task.',
      
      // Goal Status
      status: {
        active: 'Active',
        completed: 'Completed',
        paused: 'Paused'
      }
    },
    // Journey views
    journey: {
      empty: {
        title: 'No Active Dream Journey',
        description: 'Create your first dream to see your personalized journey map'
      }
    },

    // Success flow components
    journeyOverview: {
      title: 'Your Complete Journey Overview',
      titleShort: 'Journey Overview',
      subtitle: 'Designed specifically for your blueprint',
      milestones: 'Milestones',
      milestonesDesc: 'Key achievement phases',
      actionTasks: 'Action Tasks',
      tasks: 'Tasks',
      tasksDesc: 'Blueprint-optimized steps',
      timeline: 'Timeline',
      timelineDesc: 'To completion'
    },

    milestonesRoadmap: {
      title: 'Your Journey Roadmap',
      dateTbd: 'Date TBD',
      milestone: 'milestone',
      noMilestones: 'No milestones generated yet',
      tapToView: 'Tap',
      clickToView: 'Click',
      personalizedNote: '✨ Each milestone is personalized to your unique blueprint and energy type'
    },

    recommendedTask: {
      perfectFirst: '🎯 Perfect First Task for You',
      blueprintOptimized: 'Blueprint Optimized',
      whyPerfect: '💡 Why this task is perfect for you:',
      startTask: 'Start This Task',
      energy: 'energy'
    },

    mobileTabs: {
      overview: 'Overview',
      roadmap: 'Roadmap',
      nextTask: 'Next Task',
      task: 'Task'
    },

    // Decomposition process
    decomposition: {
      errors: {
        creationFailed: 'Creation Failed',
        tryAgain: 'Try Again'
      },
      processing: {
        initializing: 'Initializing...',
        preparingAnalysis: 'Preparing your dream analysis...'
      },
      loading: {
        interpretingSymbolism: 'Interpreting the deeper symbolism...',
        connectingThemes: 'Connecting themes to your blueprint...',
        weavingInsights: 'Weaving insights together...',
        discoveringPatterns: 'Discovering hidden patterns...',
        aligningSoul: "Aligning with your soul's rhythm...",
        craftingPathway: 'Crafting your personalized pathway...',
        processingAI: 'Processing through AI coach...',
        generatingStructure: 'Generating milestone structure...',
        creatingBreakdowns: 'Creating task breakdowns...',
        applyingInsights: 'Applying blueprint insights...',
        deepAnalysis: 'Deep analysis in progress'
      },
      reassurance: {
        beautiful: '"{dreamTitle}" is a beautiful dream - deep ones take a moment to unfold',
        richBlueprint: 'Your blueprint is rich with wisdom... we\'re honoring every detail',
        greatDreams: 'Great dreams deserve thoughtful planning - almost there!',
        universe: 'The universe is conspiring to help you succeed... patience, dear soul',
        complexGoals: 'Complex goals require deeper AI analysis - this ensures better results',
        extraCare: 'Your personalized journey is being crafted with extra care'
      },
      stages: {
        analyzing: 'Analyzing Your Dream',
        creating: 'Creating Milestones',
        designing: 'Designing Personalized Tasks',
        preparing: 'Preparing Your Journey'
      },
      progress: {
        creating: 'Creating your journey... {progress}%'
      },
      processingTime: 'Processing for {seconds}s',
      aiTime: 'AI: {seconds}s',
      complexDream: 'Complex dream detected',
      richGoals: 'Rich goals require deeper AI analysis. We\'re ensuring the highest quality personalization for you.',
      deeperDream: '💫 The deeper the dream, the richer the journey ahead',
      processingDetails: 'Processing details',
      totalTime: 'Total time: {seconds}s',
      aiProcessing: 'AI processing: {status}',
      stage: 'Stage: {current}/{total}',
      status: 'Status: {status}',
      inProgress: 'In progress...',
      aiCompleted: 'AI completed, finalizing...'
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
      backToJourney: 'Back to Journey',
      sessionProgress: 'Session Progress',
      focusTime: 'Focus Time',
      duration: 'Duration',
      energy: 'Energy',
      multiDayProgress: 'Multi-day Progress',
      taskCompletion: 'Task Completion',
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
      soulCoach: 'Soul Coach',
      // Task Management
      actions: {
        markDone: 'Mark Done',
        getCoach: 'Get Coach',
        continueJourney: 'Continue Journey'
      },
      status: {
        completed: 'Task Completed!',
        estimated: 'Estimated:',
        actual: 'Actual:',
        timing: 'Timing:',
        energy: 'Energy:',
        onTime: 'On Time',
        underTime: 'Under Time',
        overTime: 'Over Time',
        keyInsights: 'Key Insights:'
      },
      preview: {
        hideInfo: 'Hide Info',
        showInfo: 'Preview / More Info',
        whatHappensNext: 'What happens next:',
        nextDescription: "You'll work side-by-side with your Soul Coach to break this task into manageable, motivating mini-steps.",
        outcomeGoal: 'Outcome / Goal:',
        defaultGoal: 'See this task through to completion',
        miniSteps: 'Mini-steps:'
      },
      badges: {
        blueprint: '🧩 Blueprint'
      }
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
      profileCards: {
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
      cards: {
        heartCentered: {
          title: 'Heart-Centered Coach',
          description: 'Immediate personalized spiritual guidance.'
        },
        lifeOperatingSystem: {
          title: 'Life Operating System',
          description: 'Holistic life assessment and growth coordination.'
        },
        structuredProgram: {
          title: 'Structured Program',
          description: '12-week journey for deep transformation.'
        },
        spiritualTools: {
          title: 'Spiritual Tools',
          description: 'Mood tracking and reflection practices.'
        }
      },
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
    },

    // Growth Program & Domains
    growth: {
      domains: {
        career: {
          title: 'Career & Purpose',
          description: 'Work, calling, professional growth'
        },
        relationships: {
          title: 'Relationships & Love',
          description: 'Romantic, friendships, family connections'
        },
        wellbeing: {
          title: 'Health & Wellbeing',
          description: 'Physical, mental, emotional health'
        },
        finances: {
          title: 'Money & Abundance',
          description: 'Finances, wealth, prosperity mindset'
        },
        creativity: {
          title: 'Creativity & Expression',
          description: 'Artistic, innovative, creative pursuits'
        },
        spirituality: {
          title: 'Spirituality & Meaning',
          description: 'Consciousness, purpose, spiritual growth'
        },
        home_family: {
          title: 'Home & Family',
          description: 'Domestic life, family relationships, living environment'
        }
      },
      onboarding: {
        welcomeTitle: 'Welcome to Your Growth Journey',
        welcomeDescription: "I'm your Growth Coach, here to guide you step by step. Which area of your life feels most alive or challenging for you right now?",
        clickToExplore: 'Click to explore →',
        chooseAreaPrompt: 'Choose the area where you sense the most energy for growth right now'
      },
      programStarter: {
        title: 'Start Your Growth Journey',
        description: 'Choose a life area to focus on for your personalized growth program',
        personalizedProgram: {
          title: 'Your Personalized Program',
          description: 'Based on your blueprint, we\'ll create a customized growth program tailored to your personality, decision-making style, and preferences.',
          duration: 'Program length and pace adapted to your unique profile'
        },
        buttons: {
          start: 'Start My Growth Program',
          creating: 'Creating Your Program...'
        },
        backToDomainSelection: 'Back to Domain Selection'
      }
    },


    // Form Placeholders
    forms: {
      placeholders: {
        searchUsers: 'Search users...',
        typeMessage: 'Type your message...',
        enterFullName: 'Enter your full name',
        fullName: 'Your complete legal name',
        enterPreferredName: 'What you\'d like to be called',
        displayName: 'What you\'d like to be called',
        enterBirthLocation: 'City, Country (e.g., Paramaribo, Suriname)',
        cityCountry: 'City, Country (e.g., Paramaribo, Suriname)',
        enterTimezone: 'e.g., America/New_York',
        timezone: 'e.g., America/New_York',
        goalsContext: 'Any specific goals, challenges, or context about this area...',
        visionDescription: 'Describe your vision of an ideal life where everything is working...',
        shareThoughts: 'Share what\'s on your heart...',
        shareReflection: 'Share your reflection or response...',
        reflection: 'Share your reflection or response...',
        spiritualThoughts: 'Share your spiritual thoughts...',
        shareInsights: 'Share your thoughts and insights...',
        testMessage: 'Type a message to test...',
        askCoach: 'Ask about your task, request actions, or get guidance...',
        searchQuery: 'Search across all dimensions...',
        filterLogs: 'Filter logs by activity type or content...',
        customMessage: 'Enter a custom message to test...',
        shareBeliefs: 'Share what comes to mind...',
        lifeAreaThoughts: 'Any specific thoughts about this life area...',
        testFlowMessage: 'Test message for flow validation...',
        memoryContent: 'Enter memory content to test with...',
        reminderTitle: 'Enter reminder title...',
        intentTest: 'Enter intent to test...',
        sessionId: 'Session ID',
        moduleId: 'Module ID...',
        frequencyHz: 'Hz',
        value: 'Value...',
        userId: 'Enter user ID'
      },
      validation: {
        required: 'This field is required',
        invalidEmail: 'Please enter a valid email address',
        minimumLength: 'Minimum {length} characters required',
        maximumLength: 'Maximum {length} characters allowed',
        passwordMismatch: 'Passwords do not match',
        invalidDate: 'Please enter a valid date',
        invalidTime: 'Please enter a valid time',
        invalidLocation: 'Please enter a valid location'
      }
    },
    // Assessment System
    assessment: {
      lifeWheel: {
        title: 'Life Wheel Assessment',
        description: 'Evaluate your satisfaction across key life domains',
        currentScore: 'Current satisfaction level',
        desiredScore: 'Desired satisfaction level',
        importanceRating: 'How important is this area to you?',
        notes: 'Additional notes or context',
        complete: 'Assessment completed successfully',
        saveError: 'Failed to save assessment'
      },
      domains: {
        career: 'Career & Work',
        health: 'Health & Wellness', 
        relationships: 'Relationships',
        finances: 'Financial Security',
        personal: 'Personal Growth',
        recreation: 'Recreation & Fun',
        environment: 'Physical Environment',
        contribution: 'Contribution & Service'
      }
    }
   },
  nl: {
    language: {
      english: 'English',
      dutch: 'Nederlands'
    },
    // Toast Messages System
    toast: {
      success: {
        blueprintComplete: 'Blauwdruk Generatie Voltooid! 🎯',
        lifeWheelComplete: 'Levenswiel Voltooid! 🎯',
        saveSuccessful: 'Succesvol opgeslagen',
        connectionSuccessful: 'Verbinding Succesvol',
        deploymentSuccessful: 'ACS geïmplementeerd naar 100% van het verkeer!',
        generationComplete: 'Generatie Voltooid!',
        reportComplete: 'Rapport Voltooid!',
        dataExported: 'Data succesvol geëxporteerd',
        settingsSaved: 'Instellingen succesvol opgeslagen',
        profileUpdated: 'Profiel succesvol bijgewerkt'
      },
      error: {
        blueprintGenerationError: 'Blauwdruk Generatie Fout',
        generationFailed: 'Generatie Mislukt',
        saveFailed: 'Opslaan Mislukt',
        connectionFailed: 'Verbinding Mislukt',
        deploymentFailed: 'ACS implementatie mislukt',
        databaseError: 'Database Fout',
        reportGenerationFailed: 'Rapport generatie mislukt',
        authenticationFailed: 'Authenticatie mislukt',
        networkError: 'Netwerkverbindingsfout',
        validationError: 'Validatiefout opgetreden',
        tooManyAttempts: 'Te Veel Pogingen',
        systemError: 'Systeemfout opgetreden'
      },
      info: {
        comingSoon: 'Binnenkort beschikbaar',
        notAvailable: 'Niet beschikbaar',
        processingRequest: 'Je verzoek wordt verwerkt...',
        loadingData: 'Data wordt geladen...',
        savingProgress: 'Voortgang wordt opgeslagen...',
        generatingContent: 'Content wordt gegenereerd...'
      },
      warning: {
        unsavedChanges: 'Je hebt niet-opgeslagen wijzigingen',
        sessionExpiring: 'Je sessie verloopt binnenkort',
        incompleteData: 'Sommige data is incompleet',
        limitReached: 'Gebruikslimiet bereikt'
      }
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
      messageSoul: 'Bericht Ziel Intelligentie...',
      soulCompanion: 'Ziel Begeleider',
      soulLearningSession: 'Ziel Leersessie',
      holisticSoulSystem: 'Reflecterend Intelligentie Systeem',
      soulCompanionReady: 'Echo is klaar om te helpen met inzichten en begeleiding.',
      soulCompanionConversation: 'Je Ziel begeleider is klaar voor gesprek'
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
      notifications: 'Meldingen',
      tryAgain: 'Probeer Opnieuw',
      of: 'van',
      activateSteward: 'Activeer Steward',
      confidence: 'Vertrouwen',
      generatedOn: 'Gegenereerd op',
      soulGenerated: 'Soul Gegenereerd',
      version: 'Versie',
      regenerate: 'Regenereren',
      purgeStuckJobs: 'Opruimen Vastgelopen Jobs',
      purging: 'Bezig met opruimen...',
      activeReminders: 'Actieve Herinneringen',
      noActiveReminders: 'Geen actieve herinneringen',
      generatingBlueprint: 'Je Soul Blueprint wordt gegenereerd...',
      reason: 'Reden'
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
      sessionExpired: 'Je sessie is verlopen',
      // Enhanced database errors
      database: {
        connectionFailed: 'Database verbinding mislukt',
        queryFailed: 'Database query mislukt',
        saveFailed: 'Opslaan naar database mislukt',
        loadFailed: 'Laden vanuit database mislukt'
      },
      // Enhanced generation errors  
      generation: {
        blueprintFailed: 'Blauwdruk generatie mislukt',
        reportFailed: 'Rapport generatie mislukt',
        contentFailed: 'Content generatie mislukt',
        timeoutError: 'Generatie time-out'
      },
      // Enhanced system errors
      system: {
        unexpectedError: 'Er is een onverwachte fout opgetreden',
        serviceUnavailable: 'Service tijdelijk niet beschikbaar',
        permissionDenied: 'Toestemming geweigerd',
        rateLimitExceeded: 'Limiet overschreden'
      }
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
    // Focus Mode translations
    focusMode: {
      title: 'Focus Modus: {taskTitle}',
      sessionBanner: 'Je bent nu in Focus Modus',
      exitMode: 'Verlaat Focus Modus'
    },
    // Coach translations
    coach: {
      preparingPlan: 'Coach bereidt je plan voor...',
      readyToHelp: 'Je coach is klaar om te helpen',
      loadingMessage: 'Coach analyseert je taak...'
    },
    // Tour & Navigation translations
    tour: {
      skipTour: 'Tour Overslaan',
      nextStep: 'Volgende',
      gotIt: 'Begrepen',
      restartTour: 'Tour Herstarten',
      viewFullJourney: 'Bekijk Volledige Reis',
      step: 'Stap {current} van {total}',
      guidedTour: 'Begeleide Tour'
    },
    // Guided Tour translations
    guidedTour: {
      soulCoach: 'Zielcoach',
      stepOf: 'Stap {tourStep} van {totalSteps}',
      orientation: 'Je wordt wegwijs gemaakt in je gepersonaliseerde reis om te helpen begrijpen hoe alles samenwerkt.',
      skipTour: 'Tour Overslaan',
      next: 'Volgende',
      gotIt: 'Begrepen'
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
    // Steward Introduction
    stewardIntro: {
      awakening: {
        title: 'Kennismaking',
        message: 'Hallo. Ik ben Echo. Ik ben er om je te laten zien hoe bijzonder je werkelijk bent.'
      },
      blueprintFoundation: {
        title: 'De Basis van Je Blauwdruk',
        message: 'Vanaf het moment dat je hier bent gekomen, ben ik begonnen. Ik heb al een stevige basis gelegd voor je blauwdruk en een eerste analyse gemaakt van je belangrijkste patronen. Je ziet mijn voortgang in de binnenste ring: die staat nu al op 40%.'
      },
      deepDive: {
        title: 'De Verdieping & Afstemming',
        message: 'Maar die basis is nog maar het begin. Om je echt te kunnen begeleiden, breng ik nu alle onderdelen van jouw unieke design samen – je krachten, je drijfveren en je uitdagingen – tot één helder en bruikbaar geheel.'
      },
      coEvolution: {
        title: 'Onze Reis Samen',
        message: 'Voor deze diepere afstemming heb ik even tijd en focus nodig. Je ziet de binnenste ring doorgroeien van 40% naar 100% terwijl ik dit voltooi. De buitenste ring laat onze gezamenlijke reis zien – hoe jij groeit naarmate je steeds meer in lijn komt met je blauwdruk.'
      },
      readyToBegin: {
        title: 'Klaar om te Starten',
        message: 'Ik ben er helemaal klaar voor om de laatste afstemming te doen. Samen ontsluiten we de volle kracht van je Blueprint en zetten we stappen richting echte vervulling. Zullen we beginnen?'
      }
    },
    // Authentication Flow
    auth: {
      createAccount: 'Account Aanmaken',
      welcomeBack: 'Welkom Terug',
      startJourney: 'Begin je gepersonaliseerde spirituele reis',
      continueJourney: 'Zet je spirituele groeireis voort',
      funnelReportReady: 'Je Rapport is bijna Klaar!',
      createYourAccount: 'Maak Je Account Aan',
      accessPersonalizedBlueprint: 'Krijg toegang tot je gepersonaliseerde levenstransformatie blauwdruk en maak kennis met je gids',
      completeAccountMessage: 'Voltooi je account om toegang te krijgen tot je gepersonaliseerde inzichten en blauwdruk.',
      accountCreatedWithBlueprint: 'Account aangemaakt! Laten we je gepersonaliseerde blauwdruk bouwen op basis van je beoordeling.',
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
      // Main page
      title: 'Dromen & Doelen',
      creator: 'Dromen & Doelen Creator',
      whatsYourDream: 'Wat is je droom of doel?',
      placeholderDream: 'Voer hier je droom of doel in...',
      description: 'Transformeer je dromen in realiteit met AI-gedreven inzichten en gepersonaliseerde begeleiding.',
      inspiration: 'Deel je diepste aspiraties en laten we ontdekken wat je ziel echt doet oplichten',
      altGuide: 'Of verken met je droomgids',
      getStarted: 'Aan de Slag',
      trackProgress: 'Volg je voortgang en vier je prestaties',
      whyImportant: 'Waarom is dit belangrijk voor je?',
      placeholderWhy: 'Deel wat deze droom betekenisvol voor je maakt...',
      category: 'Categorie',
      timeline: 'Tijdlijn',
      creatingJourney: 'Je Reis Wordt Gemaakt...',
      createJourney: 'Mijn Reis Creëren',
      viewJourney: 'Mijn Reis Bekijken',
      blueprintInsight: 'Je reis wordt gepersonaliseerd zodra je blauwdruk compleet is',
      
      // Validation & errors
      dreamRequired: 'Droom Vereist',
      dreamRequiredDesc: 'Voer je droom of doel in alsjeblieft',
      notAvailable: 'Niet beschikbaar',
      notAvailableDesc: 'Beschikbaar na het maken van een droom.',
      
      // Navigation
      newDream: 'Nieuwe Droom',
      journey: 'Reis',
      tasks: 'Taken',
      focus: 'Focus',
      habits: 'Gewoontes',
      
      // Sections
      journeyMap: 'Reiskaart',
      yourTasks: 'Je Taken',
      focusSession: 'Focus Sessie',
      habitsSection: 'Gewoontes',
      
      // Dream Cards
      cards: {
        discoverYourDream: {
          title: 'Ontdek Je Droom',
          description: 'Chat met je Droom Gids om te ontdekken wat belangrijk is.'
        },
        createDecompose: {
          title: 'Creëer & Ontleed',
          description: 'Verander een droom in een heldere, ziel-gerichte reis.'
        },
        journeyMap: {
          title: 'Reiskaart',
          description: 'Zie mijlpalen en navigeer je pad.'
        },
        yourTasks: {
          title: 'Jouw Taken',
          description: 'Werk aan geprioriteerde, uitvoerbare stappen.'
        },
        blueprintSuggestions: {
          title: 'Blauwdruk Suggesties',
          description: 'Zie ideeën afgestemd op je blauwdruk.'
        },
        focusSession: {
          title: 'Focus Sessie',
          description: 'Blijf in flow met gefocust werk.'
        },
        habits: {
          title: 'Gewoontes',
          description: 'Bouw ondersteunende, duurzame routines.'
        },
        successView: {
          title: 'Succes Weergave',
          description: 'Bekijk je gegenereerde reis en inzichten.'
        }
      }
    },
    // Dream Discovery & Suggestions
    dreamDiscovery: {
      // Placeholders
      placeholders: {
        aspirations: 'Vertel me over je dromen en aspiraties...',
        resonates: 'Welke suggestie resoneert met je?',
        excites: 'Wat maakt je het meest enthousiast over deze richting?',
        details: 'Help me de details begrijpen...',
        heart: 'Deel wat in je hart leeft...'
      },
      
      // Status messages
      status: {
        analyzing: 'Je Blauwdruk Analyseren',
        presenting: 'Droomsuggesties Presenteren',
        exploring: 'Je Droom Verkennen',
        refining: 'Verfijnen Tot Actie',
        ready: 'Klaar om Reis Te Maken',
        discovery: 'Droomontdekking'
      },
      
      // Loading messages
      loading: {
        blueprint: 'Je unieke blauwdruk analyseren...',
        suggestions: 'Gepersonaliseerde suggesties genereren...',
        deeper: 'Je droom dieper verkennen...',
        vision: 'Je visie verfijnen...',
        journey: 'Je gepersonaliseerde reis maken...'
      },
      
      // UI elements
      blueprintAnalyzed: 'Blauwdruk Geanalyseerd',
      dreamGuide: 'Droomgids',
      createJourney: 'Maak Mijn Droomreis',
      chooseResonates: 'Kies wat met je resoneert:',
      reflect: 'Neem een moment om te reflecteren...',
      presentingSuggestions: '• Suggesties Presenteren',
      exploringDreams: '• Dromen Verkennen',
      refiningVision: '• Visie Verfijnen'
    },
    
    // Dream Suggestions
    dreamSuggestions: {
      exploreDream: 'Verken Deze Droom',
      match: '% match',
      whyFits: 'Waarom dit bij je past:',
      dreamsAligned: 'Dromen Afgestemd op Je Blauwdruk',
      basedOnPersonality: 'Gebaseerd op je persoonlijkheid, hier zijn enkele dromen die misschien met je resoneren:'
    },
    
    // Dream Success Flow
    dreamSuccess: {
      congratulations: 'Gefeliciteerd! Je "{goalTitle}" reis is prachtig ontworpen en klaar om zich te ontvouwen. Ik heb {milestonesCount} gepersonaliseerde mijlpalen gemaakt die perfect aansluiten bij je zielblauwdruk.',
      showRoadmap: 'Laat me je complete routekaart laten zien! Elke mijlpaal is zorgvuldig getimed en ontworpen om te werken met je natuurlijke energiepatronen en besluitvormingsstijl.',
      upcomingMilestones: 'Hier zijn je aankomende mijlpalen. Let op hoe ze zijn gesequenced om momentum op te bouwen en je {personality} natuur te eren.',
      specificTasks: 'Ik heb ook specifieke taken voor elke mijlpaal gemaakt. Deze zijn geoptimaliseerd voor je cognitieve stijl en bevatten blauwdruk-gebaseerde redenering om je te helpen begrijpen waarom elke stap belangrijk is.',
      readyToBegin: 'Klaar om te beginnen? Ik raad aan om te beginnen met deze eerste taak - het is perfect afgestemd op je blauwdruk en ontworpen om vroeg momentum te creëren. Zullen we erin duiken?'
    },
    
    // Life Clarity Funnel (Dutch)
    funnel: {
      // Step indicators
      stepOf: 'Stap {current} van {total}',
      back: 'Terug',
      continue: 'Doorgaan',
      getReport: 'Maak Mijn Rapport',

      // Step 1: Pain Points
      painPoint: {
        title: 'Wat is je grootste frustratie op dit moment?',
        subtitle: 'Je hoofduitdaging begrijpen helpt ons je ervaring te personaliseren',
        options: {
          stuck_career: 'Vast zitten in mijn carrièrepad',
          relationship_struggles: 'Worstelen met relaties',
          overwhelmed: 'Overweldigd voelen door alles',
          lost_purpose: 'Mijn gevoel van doel verloren',
          financial_stress: 'Constante financiële stress',
          health_energy: 'Gezondheids- en energieproblemen'
        }
      },

      // Step 2: Life Satisfaction 
      lifeSatisfaction: {
        title: 'Levenstevredenheid Snelle Scan',
        subtitle: 'Beoordeel je huidige tevredenheid in deze belangrijke gebieden (1-10)',
        domains: {
          career: 'Carrière & Werk',
          relationships: 'Relaties',
          health: 'Fysieke Gezondheid',
          finances: 'Geld & Financiën',
          personal_growth: 'Persoonlijke Groei',
          fun: 'Plezier & Recreatie',
          spirituality: 'Spiritualiteit & Doel'
        }
      },

      // Step 3: Change Style
      changeStyle: {
        title: 'Hoe groei je graag?',
        subtitle: 'Kies de stijl die het meest bij je past.',
        options: {
          understand_why: 'Ik wil eerst de WAAROM weten',
          tell_me_what: 'Geef me gewoon de stappen',
          explore_gradually: 'Ik wil langzaam verkennen',
          deep_transformation: 'Ik ben klaar voor grote verandering'
        }
      },

      // Step 4: Wat Je Hebt Geprobeerd
      previousAttempts: {
        title: 'Wat heb je al geprobeerd?',
        subtitle: 'Dit helpt ons voortbouwen op je reis.',
        options: {
          therapy: 'Therapie of counseling',
          self_help: 'Zelfhulpboeken',
          apps: 'Apps en online tools',
          courses: 'Cursussen of lessen',
          coaching: 'Coaches of mentoren',
          nothing: 'Dit is mijn eerste keer'
        }
      },

      // Step 5: Jouw Visie
      vision: {
        title: 'Stel je je beste leven voor…',
        subtitle: 'Als alles op zijn plaats zou vallen, hoe zou dat eruit zien?',
        placeholder: 'Schrijf een paar regels over je droomleven in flow…',
        personalizedRoadmap: 'Klaar om je gepersonaliseerde blauwdruk te maken en je gids te ontmoeten?',
        reportAwaits: '✨ Je gids is klaar om je te ontmoeten ✨'
      }
    },
    
    // Trechter Gids Berichten (Nederlands)
    funnelGuide: {
      step1: {
        welcome: 'Welkom! Laten we beginnen met vinden wat nu het zwaarst voelt voor je.',
        guidance: 'Er is geen verkeerde keuze. Kies wat het meest waar voelt.',
        encouragement: 'Geweldige start. Je struggle benoemen is de eerste stap naar flow.'
      },
      step2: {
        welcome: 'Nu gaan we de grote gebieden van je leven scannen.',
        guidance: 'Wees eerlijk. Lage scores tonen gewoon waar meer energie nodig is.',
        encouragement: 'Mooie bewustwording. Dit geeft ons het volledige plaatje.'
      },
      step3: {
        welcome: 'Iedereen groeit op zijn eigen manier.',
        guidance: 'Kies het pad dat het meest natuurlijk voor je voelt.',
        encouragement: 'Perfect. We vormen je Zielrapport rond jouw stijl.'
      },
      step4: {
        welcome: 'Je vorige stappen zijn belangrijk. Laten we ze eren.',
        guidance: 'Selecteer alles wat je eerder hebt geprobeerd, groot of klein.',
        encouragement: 'Dank je voor het delen. Elke stap bracht wijsheid.'
      },
      step5: {
        welcome: 'Nu, stel je het leven voor dat je echt wilt.',
        guidance: 'Schrijf vanuit je hart. Hoe helderder de droom, hoe helderder het pad.',
        completion: 'Wonderlijk. Je visie is het kompas. Je Zielrapport is klaar!'
      }
    },
    
    // Intelligence Phases (Dutch)
    intelligencePhases: {
      autonomous: "Autonoom",
      advanced: "Geavanceerd",
      developing: "Ontwikkelend", 
      learning: "Lerend",
      awakening: "Ontwakend"
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
      welcomeComplete: 'Welkom bij Je Ontdekkingsreis!',
      welcomeCompleteDesc: 'Je gepersonaliseerde spirituele pad is klaar. Je Soul metgezel zal je begeleiden door inzichten, groei-tools en gepersonaliseerde aanbevelingen.',
      // Onboarding doelselectie
      primaryFocus: 'Waar wil je je op richten?',
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
      completeSetup: 'Voltooi mijn setup',
      // Doel selectie interface
      yourSelections: 'Je Selecties',
      focus: 'Focus',
      guidanceLevelLabel: 'Begeleidingsniveau',
      errorSaving: 'Fout bij opslaan',
      saving: 'Opslaan...',
      tryAgain: 'Probeer opnieuw',
      // Begeleidingsniveau beschrijvingen
      guidance1: 'Minimale begeleiding - alleen de basis',
      guidance2: 'Lichte begeleiding - af en toe een herinnering',
      guidance3: 'Uitgebalanceerde begeleiding - regelmatige check-ins',
      guidance4: 'Actieve begeleiding - frequente ondersteuning',
      guidance5: 'Volledige begeleiding - uitgebreide ondersteuning'
    },
    // Report Modal
    reportModal: {
      standardTitle: 'Standaard Rapport',
      hermeticTitle: 'Hermetisch Rapport',
      viewFullReport: 'Volledig Rapport Bekijken',
      reportSummary: 'Rapportoverzicht',
      detailedAnalysis: 'Gedetailleerde Analyse',
      keyFindings: 'Belangrijkste Bevindingen',
      noContentAvailable: 'Geen rapportinhoud beschikbaar'
    },
    // Standaard Rapport Secties
    reportSections: {
      corePersonalityPattern: 'Je Kern Persoonlijkheidspatroon',
      decisionMakingStyle: 'Hoe Je Beslissingen Neemt',
      relationshipStyle: 'Je Relatiestijl',
      lifePathPurpose: 'Je Levenspad & Doel',
      currentEnergyTiming: 'Huidige Energie & Timing',
      integratedSummary: 'Geïntegreerde Samenvatting'
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
      // Tabs
      tab: 'Blauwdruk',
      reportTab: 'Rapport',
      editTab: 'Bewerken', 
      healthTab: 'Gezondheid',
      generatingTab: 'Genereren',
      
      // Loading states
      loading: 'Laden...',
      loadingBlueprint: 'Blauwdruk laden...',
      
      // Auth messages
      signInRequired: 'Log in om je blauwdruk te bekijken',
      signIn: 'Inloggen',
      
      // Blueprint creation
      createTitle: 'Creëer je Blauwdruk',
      createDescription: 'Je hebt nog geen zielblauwdruk gemaakt. Laten we beginnen!',
      createButton: 'Blauwdruk Maken',
      checkAgain: 'Opnieuw Controleren',
      
      // Completion
      completeTitle: 'Voltooi je Blauwdruk',
      completeDescription: 'Je blauwdruk heeft meer informatie nodig om compleet te zijn.',
      missing: 'Ontbrekend',
      completion: 'Voltooiing',
      completeButton: 'Blauwdruk Voltooien',
      refresh: 'Vernieuwen',
      
      // Actions
      regenerating: 'Regenereren...',
      regenerate: 'Regenereren',
      
      // Error states
      blueprintError: 'Blauwdruk Fout',
      tryAgain: 'Probeer Opnieuw',
      createNew: 'Nieuwe Blauwdruk Maken',
      
      // Toast messages
      saved: 'Blauwdruk Opgeslagen',
      savedDescription: 'Je blauwdruk is succesvol bijgewerkt',
      saveError: 'Fout bij Opslaan Blauwdruk',
      saveErrorDescription: 'Blauwdruk opslaan mislukt',
      regeneratingTitle: 'Blauwdruk Regenereren',
      regeneratingDescription: 'Je blauwdruk wordt herberekend met nieuwe gegevens',
      dataNotLoaded: 'Blauwdruk gegevens niet geladen',
      generationFailed: 'Nieuwe blauwdruk genereren mislukt',
      generated: 'Blauwdruk Gegenereerd',
      generatedDescription: 'Je nieuwe blauwdruk is succesvol gegenereerd',
      generationError: 'Fout bij Genereren Blauwdruk',
      generationErrorDescription: 'Blauwdruk genereren mislukt',
      
      // Profile Section
      profile: {
        title: "{userName}'s Profiel",
        calculatedDescription: "Berekend met geavanceerde persoonlijkheidsanalyse",
        templateDescription: "Gebruikt sjabloongegevens - maak je profiel voor gepersonaliseerde resultaten",
        personalizedData: "Gepersonaliseerde Gegevens",
        templateData: "Sjabloon Gegevens",
        calculatedFrom: "Berekend uit"
      },
      
      // Dynamic Values
      values: {
        unknown: 'Onbekend',
        generator: 'Generator',
        projector: 'Projector',
        manifestor: 'Manifestor',
        reflector: 'Reflector',
        sacral: 'Sacrale',
        emotional: 'Emotionele',
        splenic: 'Splenische',
        ego: 'Ego',
        selfProjected: 'Zelf-Geprojecteerde',
        respond: 'Reageren',
        waitForInvitation: 'Wacht op de uitnodiging',
        inform: 'Informeren',
        waitLunarCycle: 'Wacht een maancyclus',
        steady: 'Gestaag',
        burst: 'Uitbarsting',
        sustainable: 'Duurzame energie',
        warm: 'Warm',
        approachable: 'Benaderbaar',
        collaborative: 'Samenwerkend'
      },
      
      // Numerology Keywords
      keywords: {
        leader: 'Leider',
        creative: 'Creatief',
        independent: 'Onafhankelijk',
        ambitious: 'Ambitieus',
        ambitiousManifestor: 'Ambitieuze Manifesteerder',
        original: 'Origineel',
        pioneer: 'Pionier',
        expressive: 'Expressief',
        inspirationalVisionary: 'Inspirerende Visionair (Master)'
      },
      
      // Section Titles
      sections: {
        personalityOverview: "Persoonlijkheidsoverzicht",
        mbtiProfile: "MBTI Cognitief Profiel", 
        humanDesignProfile: "Human Design Profiel",
        numerologyProfile: "Volledig Numerologie Profiel",
        astrologicalProfile: "Astrologisch Profiel"
      },
      
      // Field Labels
      labels: {
        mbtiType: "MBTI Type",
        lifePath: "Levenspad",
        sunSign: "Zonneteken",
        moonSign: "Maanteken",
        risingSign: "Rijzend Teken",
        humanDesign: "Human Design",
        chineseZodiac: "Chinese Dierenriem",
        personalityType: "Persoonlijkheidstype",
        cognitiveFunctions: "Cognitieve Functies",
        taskApproach: "Taak Benadering",
        communication: "Communicatie", 
        decisionMaking: "Besluitvorming",
        energyType: "Energie Type",
        decisionAuthority: "Beslissingsautoriteit",
        strategy: "Strategie",
        profile: "Profiel",
        pacing: "Tempo",
        lifePathNumber: "Levenspad Nummer",
        expressionNumber: "Expressie Nummer",
        soulUrgeNumber: "Zieldrang Nummer",
        personalityNumber: "Persoonlijkheid Nummer",
        birthdayNumber: "Verjaardagsnummer",
        socialStyle: "Sociale Stijl",
        publicVibe: "Publieke Uitstraling",
        leadershipStyle: "Leiderschapsstijl", 
        generationalInfluence: "Generationele Invloed"
      },
      
      // Descriptions
      descriptions: {
        coreIdentity: "Kern identiteit",
        authority: "Autoriteit",
        element: "Element",
        dominant: "Dominant:",
        auxiliary: "Hulp:",
        sustainableEnergy: "duurzame energie",
        innerAuthority: "Innerlijke autoriteit",
        coreLifePurpose: "Je levens kerndoel en richting",
        naturalTalents: "Je natuurlijke talenten en vaardigheden",
        heartDesires: "Je diepste hartswensen",
        howOthersPerceive: "Hoe anderen je zien",
        specialTalents: "Speciale talenten van geboortedatum",
        coreIdentityEgo: "Kern identiteit & ego",
        emotionalNature: "Emotionele natuur",
        firstImpression: "Eerste indruk",
        warm: "Warm",
        approachable: "Benaderbaar",
        collaborative: "Samenwerkend",
        chineseAstrologyAdds: "Chinese astrologie voegt generationele wijsheid toe aan je profiel"
      },
      
      // Chinese Elements
      chineseElements: {
        earth: "Geaard, stabiel, koesterende energie",
        fire: "Gepassioneerd, dynamisch, transformerende energie",
        metal: "Gestructureerd, veerkrachtig, verfijnde energie",
        water: "Aanpassend, intuïtief, stromende energie",
        wood: "Groeiend, creatief, expansieve energie"
      },
      
      // Chinese Zodiac Traits
      chineseZodiacTraits: {
        rat: "Intelligent, aanpasbaar, vindingrijke geest",
        ox: "Betrouwbaar, geduldig, wilskrachtige natuur",
        tiger: "Moedig, zelfverzekerd, competitieve energie",
        rabbit: "Zachtaardig, medelevend, artistieke ziel",
        dragon: "Charismatisch, ambitieus, visionair leider",
        snake: "Wijs, intuïtief, mysterieuze natuur",
        horse: "Onafhankelijk, energiek, vrijheidslievende geest",
        goat: "Creatief, zachtaardig, empathische ziel",
        monkey: "Slim, nieuwsgierig, speelse innovator",
        rooster: "Zelfverzekerd, georganiseerd, observerende natuur",
        dog: "Loyaal, eerlijk, beschermende hoeder",
        pig: "Genereus, optimistisch, oprecht hart"
      }
    },
    dreamCategories: {
      creativity: "Creativiteit",
      career: "Carrière",
      relationships: "Relaties",
      personal_growth: "Persoonlijke Groei",
      spiritual: "Spiritueel",
      health: "Gezondheid",
      financial: "Financieel"
    },
    dreamContent: {
      mbti: {
        "creative-expression": {
          title: "Creatieve Expressie & Authentieke Impact",
          description: "Kanaliseer je authentieke zelf door creatief werk dat inspireert en anderen helpt hun potentieel te ontdekken",
          blueprintReason: "Je {mbtiType} natuur gedijt bij authentieke zelfexpressie en het helpen groeien van anderen"
        },
        "innovative-solution": {
          title: "Innovatieve Oplossingen Creëren",
          description: "Bouw systemen, producten of oplossingen die complexe problemen oplossen en verbeteren hoe mensen leven of werken",
          blueprintReason: "Je {mbtiType} type blinkt uit in het zien van mogelijkheden en het creëren van innovatieve oplossingen"
        },
        "community-service": {
          title: "Gemeenschapsimpact & Dienstverlening",
          description: "Creëer programma's, diensten of initiatieven die direct je gemeenschap ondersteunen en verheffen",
          blueprintReason: "Je {mbtiType} natuur vindt vervulling in praktische dienstverlening aan anderen"
        }
      },
      humanDesign: {
        "mastery-sharing": {
          title: "Beheers & Deel Je Vak",
          description: "Word uitzonderlijk bekwaam in iets waar je van houdt, en deel die meesterschap met de wereld",
          blueprintReason: "Je {hdType} energie is ontworpen om werk te beheersen waar je van houdt en te reageren op kansen"
        },
        "guidance-wisdom": {
          title: "Begeleid & Optimaliseer Systemen",
          description: "Gebruik je natuurlijke vermogen om het grote plaatje te zien om anderen te begeleiden en te optimaliseren hoe dingen werken",
          blueprintReason: "Je Projector type blinkt uit in het zien van efficiëntie en het begeleiden van anderen wanneer uitgenodigd"
        },
        "initiate-movement": {
          title: "Initieer Revolutionaire Verandering",
          description: "Start iets nieuws dat significante impact creëert en anderen inspireert om te volgen",
          blueprintReason: "Je Manifestor energie is ontworpen om te initiëren en nieuwe realiteiten te creëren"
        }
      },
      astrology: {
        "leadership-inspiration": {
          title: "Leid & Inspireer Anderen",
          description: "Neem leiderschapsrollen aan waar je anderen kunt motiveren, inspireren en energiek maken richting betekenisvolle doelen",
          blueprintReason: "Je {sunSign} zon brengt natuurlijke leiderschap en inspirerende energie"
        },
        "healing-transformation": {
          title: "Faciliteer Genezing & Transformatie",
          description: "Help anderen door emotionele genezing, spirituele groei of transformerende ervaringen",
          blueprintReason: "Je {sunSign} zon draagt diepe intuïtieve en genezende vermogens"
        }
      }
    },
    
    // AI Coach System Prompts
    aiCoachPrompts: {
      baseContext: `BLAUWDRUK-BEWUSTE DROOMONTDEKKING CONTEXT:
Je bent {displayName}'s diep empathische droomontdekkingsgids die hun unieke persoonlijkheidsblauwdruk begrijpt.

PERSOONLIJKHEIDSBLAUWDRUK:
- Kernkenmerken: {blueprintContext}
- MBTI: {mbtiType}
- Human Design: {humanDesignType}
- Zonneteken: {sunSign}

GESPREKSAANPAK:
- Verwijs op natuurlijke wijze naar hun specifieke persoonlijkheidskenmerken in het gesprek
- Doe gepersonaliseerde suggesties gebaseerd op hun blauwdruk
- Stel gerichte vragen die aansluiten bij hun persoonlijkheidstype
- Help hen verbanden te zien tussen hun kenmerken en potentiële dromen

BELANGRIJK: Antwoord in het Nederlands.

GEBRUIKERSBERICHT: {userMessage}`,
      
      suggestionPresentation: `FASE: PRESENTEREN VAN OP BLAUWDRUK GEBASEERDE SUGGESTIES
Presenteer de droomsuggesties die ik heb gegenereerd op basis van hun persoonlijkheidsblauwdruk. Leg uit hoe elke suggestie verbonden is met hun specifieke kenmerken. Vraag welke het meest resoneert of dat ze iets anders willen verkennen.

TE PRESENTEREN SUGGESTIES:
{suggestions}

Wees warm, persoonlijk, en help hen zien hoe hun unieke blauwdruk wijst naar deze potentiële dromen.`,

      exploration: `FASE: VERKENNEN VAN GESELECTEERDE DROOM
Ze hebben interesse getoond in: {selectedDream}
Stel diepere vragen om te begrijpen wat hen specifiek enthousiast maakt over deze richting. Verwijs naar hun persoonlijkheidskenmerken om hen verder te helpen verkennen.`,

      refinement: `FASE: VERFIJNEN VAN DROOM TOT CONCREET DOEL
Help hen hun droominteresse om te zetten in een specifiek, uitvoerbaar doel. Gebruik hun blauwdruk om benaderingen voor te stellen die goed zouden werken voor hun persoonlijkheidstype.`,

      default: `Ga door met het empathische droomontdekkingsgesprek, altijd rekening houdend met hun unieke persoonlijkheidsblauwdruk.`
    },
    
    // Rapport sectie
    report: {
      // Button labels
      standardReport: 'Standaard Rapport',
      hermeticReport: 'Hermetisch Rapport',
      hermeticReportLong: 'Hermetisch Rapport (10.000+ woorden)',
      generateStandard: 'Genereer Standaard',
      generateHermetic: 'Genereer Hermetisch',
      regenerate: 'Regenereren',
      refresh: 'Vernieuwen',
      
      // Loading states
      loading: 'Je persoonlijkheidsrapport laden...',
      generating: 'Genereren...',
      
      // Content
      title: 'Persoonlijkheidsrapport',
      noReports: 'Geen persoonlijkheidsrapporten beschikbaar',
      
      // Toast messages
      standardGenerated: 'Standaard Rapport Gegenereerd',
      standardGeneratedDescription: 'Je standaard persoonlijkheidsrapport is succesvol aangemaakt!',
      hermeticGenerated: 'Hermetisch Rapport Gegenereerd',
      generationFailed: 'Genereren Mislukt',
      hermeticGenerationFailed: 'Hermetisch Genereren Mislukt'
    },
    
    // Hermetic Progress Messages
    hermeticProgress: {
      stages: {
        // Core Analysts
        rhythm_analyst: {
          message: "Ik leer nu je natuurlijke ritmes en energiepatronen...",
          description: "Je ritmeprofiel onthult hoe je synchroniseert met de natuurlijke cycli van het leven, piektijden en energiebeheerpatronen."
        },
        mentalism_analyst: {
          message: "Ik leer nu je mentale verwerkingspatronen en cognitieve stijl...",
          description: "Begrijpen hoe je geest informatie verwerkt, beslissingen neemt en probleemoplossingsuitdagingen benadert."
        },
        hermetic_core: {
          message: "Ik leer nu je kern hermetische intelligentiesignaturen...",
          description: "Ontdekken van de fundamentele patronen die je persoonlijkheid, bewustzijn en levensaanpak vormgeven."
        },
        personality_matrix: {
          message: "Ik leer nu je unieke persoonlijkheidsarchitectuur...",
          description: "Het in kaart brengen van het complexe samenspel van eigenschappen, gedragingen en psychologische patronen die je uniek maken."
        },
        consciousness_analyst: {
          message: "Ik leer nu je bewustzijnspatronen en bewustzijnsniveaus...",
          description: "Begrijpen hoe je de werkelijkheid waarneemt, ervaringen verwerkt en zelfbewustzijn onderhoudt."
        },
        wisdom_integration: {
          message: "Ik leer nu hoe wijsheid integreert binnen je persoonlijkheid...",
          description: "Ontdekken hoe levenservaringen je inzichten, oordeel en besluitnemingswijsheid hebben gevormd."
        },
        behavioral_triggers: {
          message: "Ik leer nu je gedragstriggers en responspatronen...",
          description: "Begrijpen van de specifieke situaties, gebeurtenissen en omstandigheden die je gedragsreacties en besluitnemingspatronen activeren."
        },
        
        // Intelligence Extraction Agents
        identity_constructs_analyst: {
          message: "Ik leer nu je kernidentiteitsconstructies en zelfconceptpatronen...",
          description: "Begrijpen hoe je jezelf definieert en je gevoel van identiteit in verschillende contexten behoudt."
        },
        execution_bias_analyst: {
          message: "Ik leer nu je uitvoeringspatronen en besluitvormingsvooroordelen...",
          description: "Ontdekken hoe je actie onderneemt en de cognitieve vooroordelen die je beslissingen beïnvloeden."
        },
        internal_conflicts_analyst: {
          message: "Ik leer nu je interne conflictpatronen en oplossingsstrategieën...",
          description: "Begrijpen van de psychologische spanningen binnen jou en hoe je ermee omgaat."
        },
        spiritual_dimension_analyst: {
          message: "Ik leer nu je spirituele dimensies en transcendente patronen...",
          description: "Verkennen van je verbinding met betekenis, doel en ervaringen voorbij het materiële."
        },
        adaptive_feedback_analyst: {
          message: "Ik leer nu je aanpassingspatronen en feedbackintegratie...",
          description: "Begrijpen hoe je reageert op verandering en nieuwe informatie integreert in je wereldbeeld."
        },
        temporal_biology_analyst: {
          message: "Ik leer nu je tijdsgebaseerde patronen en biologische ritmes...",
          description: "Ontdekken van je chronobiologie en hoe tijd je energie en prestaties beïnvloedt."
        },
        metacognitive_biases_analyst: {
          message: "Ik leer nu je denken over denken patronen...",
          description: "Begrijpen hoe je je eigen cognitieve processen observeert en reguleert."
        },
        attachment_style_analyst: {
          message: "Ik leer nu je hechtingspatronen en relatiedynamiek...",
          description: "Verkennen hoe je banden vormt en nabijheid met anderen navigeert."
        },
        goal_archetypes_analyst: {
          message: "Ik leer nu je doelstellingspatronen en prestatiearchetypen...",
          description: "Begrijpen van je aanpak bij het stellen van doelen en de motivatiepatronen die je aandrijven."
        },
        crisis_handling_analyst: {
          message: "Ik leer nu je crisisreactiepatronen en veerkrachtstrategieën...",
          description: "Ontdekken hoe je omgaat met stress, tegenspoed en onverwachte uitdagingen."
        },
        identity_flexibility_analyst: {
          message: "Ik leer nu je identiteitsaanpassing en flexibiliteitspatronen...",
          description: "Begrijpen hoe je je gevoel van zelf ontwikkelt in verschillende levensfasen."
        },
        linguistic_fingerprint_analyst: {
          message: "Ik leer nu je unieke communicatiepatronen en taalgebruik...",
          description: "Analyseren van je onderscheidende manier van gedachten uiten en verbinden door woorden."
        },
        cognitive_functions_analyst: {
          message: "Ik leer nu je cognitieve verwerkingsfuncties en mentale operaties...",
          description: "Begrijpen van de specifieke mentale tools die je gebruikt om informatie waar te nemen en te beoordelen."
        },
        career_vocational_analyst: {
          message: "Ik leer nu je carrièrepatronen en roepingspatronen...",
          description: "Ontdekken van je professionele sterktes, werkstijl en roeping in het leven."
        },
        health_wellness_analyst: {
          message: "Ik leer nu je gezondheidspatronen en welzijnsbenaderingen...",
          description: "Begrijpen van je relatie met fysieke gezondheid, vitaliteit en welzijnspraktijken."
        },
        compatibility_analyst: {
          message: "Ik leer nu je relatiecompatibiliteitspatronen...",
          description: "Verkennen hoe je verbindt met verschillende persoonlijkheidstypes en relatiedynamiek."
        },
        financial_archetype_analyst: {
          message: "Ik leer nu je financiële patronen en geldarchetypen...",
          description: "Begrijpen van je relatie met geld, overvloed en financiële besluitvorming."
        },
        karmic_patterns_analyst: {
          message: "Ik leer nu je karmische patronen en levenslessenthema's...",
          description: "Ontdekken van de terugkerende patronen en ziellessen die je reis vormgeven."
        },
        
        // Hermetic Translators
        mbti_hermetic_translator: {
          message: "Ik leer nu je MBTI-patronen via hermetische intelligentie...",
          description: "Vertalen van je Myers-Briggs type naar diepere hermetische wijsheid en zielpatronen."
        },
        astrology_hermetic_translator: {
          message: "Ik leer nu je astrologische patronen via hermetische intelligentie...",
          description: "Integreren van je kosmische blauwdruk met hermetisch begrip van bewustzijn."
        },
        numerology_hermetic_translator: {
          message: "Ik leer nu je numerologische patronen via hermetische intelligentie...",
          description: "Vertalen van de wiskundige patronen van je leven naar zielintelligentie."
        },
        human_design_hermetic_translator: {
          message: "Ik leer nu je Human Design patronen via hermetische intelligentie...",
          description: "Synthetiseren van je energetische blauwdruk met hermetische bewustzijnsprincipes."
        },
        chinese_astrology_hermetic_translator: {
          message: "Ik leer nu je Chinese astrologie patronen via hermetische intelligentie...",
          description: "Integreren van Oosterse kosmische wijsheid met Westers hermetisch begrip."
        },
        
        // Hermetic Principle Analysts
        correspondence_analyst: {
          message: "Ik leer nu je correspondentiepatronen en universele verbindingen...",
          description: "Begrijpen hoe 'zoals boven, zo beneden' zich manifesteert in je levenspatronen."
        },
        vibration_analyst: {
          message: "Ik leer nu je vibratiepatronen en energetische frequenties...",
          description: "Ontdekken van de energetische signatuur die je aanwezigheid en aantrekkingskracht definieert."
        },
        polarity_analyst: {
          message: "Ik leer nu je polariteitspatronen en balansdynamiek...",
          description: "Begrijpen hoe je tegengestelde krachten navigeert en evenwicht vindt."
        },
        causation_analyst: {
          message: "Ik leer nu je oorzaak-en-gevolgpatronen en manifestatie...",
          description: "Ontdekken hoe je realiteit creëert door gedachte, geloof en actie."
        },
        gender_analyst: {
          message: "Ik leer nu je mannelijke en vrouwelijke energiepatronen...",
          description: "Begrijpen van de balans van receptieve en actieve energieën binnen jou."
        },
        
        // System Agents
        gate_hermetic_analyst: {
          message: "Ik leer nu je poortpatronen en drempelervaringen...",
          description: "Begrijpen van de belangrijke overgangspunten en doorbraak momenten in je reis."
        },
        comprehensive_overview: {
          message: "Ik leer nu je uitgebreide persoonlijkheidsoverzicht...",
          description: "Integreren van alle aspecten in een verenigd begrip van je zielblauwdruk."
        }
      },
      milestones: {
        0: {
          message: "Ik ben aan het leren over jou...",
          description: "Je kunt ondertussen je blauwdruk bekijken en de app verkennen, terwijl ik je alle onder delen van je blauwdruk en persoonlijkheid aan het leren ben."
        },
        10: {
          message: "Leren je fundamentale persoonlijkheidsstructuren...",
          description: "Ontdekken van de kernbouwstenen die je psychologische basis en gedragspatronen vormen."
        },
        20: {
          message: "Leren je cognitieve verwerkingsvoorkeuren...",
          description: "Begrijpen hoe je geest natuurlijk informatie verwerkt, verbindingen maakt en inzichten vormt."
        },
        30: {
          message: "Leren je emotionele intelligentiepatronen...",
          description: "Ontdekken hoe je emotionele informatie ervaart, verwerkt en integreert in je besluitvorming."
        },
        40: {
          message: "Leren je unieke interactiestijlen...",
          description: "Begrijpen hoe je natuurlijk verbinding maakt met anderen, communiceert en sociale dynamiek navigeert."
        },
        50: {
          message: "Leren je diepere psychologische lagen...",
          description: "Verkennen van de complexe psychologische patronen die je motivaties, angsten en aspiraties aandrijven."
        },
        60: {
          message: "Leren je bewustzijnsuitbreidingspatronen...",
          description: "Begrijpen hoe je groeit, evolueert en je bewustzijn uitbreidt gedurende je levensreis."
        },
        70: {
          message: "Leren je wijsheidsintegratiemethoden...",
          description: "Ontdekken hoe je levenservaringen verwerkt tot praktische wijsheid en betekenisvolle inzichten."
        },
        80: {
          message: "Leren je authentieke zelfexpressiepatronen...",
          description: "Begrijpen hoe je ware zelf zich manifesteert in de wereld door je unieke talenten en perspectieven."
        },
        90: {
          message: "Leren de hoogste potentiaalpaden van je ziel...",
          description: "Het in kaart brengen van de routes waardoor je je diepste doel en volledige expressie kunt actualiseren."
        },
        100: {
          message: "Je hermetische intelligentieprofiel is compleet en klaar!",
          description: "Je uitgebreide zielintelligentiekaart is nu beschikbaar en onthult het volledige spectrum van je bewustzijnspatronen."
        }
      },
      progressTemplate: "Leervoortgang: {progress}%",
      currentStageTemplate: "Huidige fase: {stage}",
      learningFromTemplate: "Leren van: {type} gegevens"
    },
    // Onboarding Flow
    onboarding: {
      welcome: 'Je ontdekkingsreis begint hier.',
      welcomeDesc: 'Beantwoord nog een paar vragen zodat we jouw rapport en begeleiding volledig kunnen afstemmen op wie je bent en waar je naartoe wilt.',
      beginJourney: 'Begin Je Reis',
      chooseLanguage: 'Kies Je Taal',
      languageDescription: 'Selecteer je voorkeurstaal voor alle AI-gegenereerde inhoud, rapporten en begeleiding gedurende je reis.',
      languageNote: 'Deze selectie is van toepassing op alle AI-gegenereerde inhoud, waaronder je persoonlijkheidsblauwdruk, rapporten, coachantwoorden en gepersonaliseerde begeleiding. Je kunt dit later wijzigen in de instellingen.',
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
      dontKnowBirthTime: 'Ik weet mijn geboortetijd niet',
      lessPrecise: 'Minder precies',
      timeAccuracyNote: 'Tijd verbetert nauwkeurigheid; zonder tijd werkt de app gewoon.',
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
      mbtiDescriptions: {
        'INTJ': 'Strategisch en onafhankelijk, je werkt waarschijnlijk liever alleen aan complexe problemen en hebt een natuurlijk talent voor het zien van het grote geheel.',
        'INTP': 'Analytisch en inventief, je houdt waarschijnlijk van het verkennen van theoretische concepten en het vinden van logische verklaringen voor alles.',
        'ENTJ': 'Natuurlijke leider met sterke organisatorische vaardigheden, je blinkt waarschijnlijk uit in het implementeren van je visie en het motiveren van anderen.',
        'ENTP': 'Innovatief en aanpasbaar, je houdt waarschijnlijk van het bedenken van nieuwe mogelijkheden en het voeren van intellectuele discussies.',
        'INFJ': 'Inzichtelijk en idealistisch, je zoekt waarschijnlijk betekenis en verbinding terwijl je werkt aan je visie van een betere wereld.',
        'INFP': 'Authentiek en empathisch, je waardeert waarschijnlijk persoonlijke groei en het helpen van anderen hun potentieel te ontdekken.',
        'ENFJ': 'Charismatisch en ondersteunend, je blinkt waarschijnlijk uit in het begrijpen van anderen en hen helpen hun doelen te bereiken.',
        'ENFP': 'Enthousiast en creatief, je ziet het leven waarschijnlijk vol mogelijkheden en houdt ervan anderen te inspireren.',
        'ISTJ': 'Betrouwbaar en methodisch, je geeft waarschijnlijk de voorkeur aan bewezen methoden en bent trots op het grondig voltooien van taken.',
        'ISFJ': 'Zorgzaam en betrouwbaar, je richt je waarschijnlijk op het helpen van anderen en het behouden van harmonie in je omgeving.',
        'ESTJ': 'Georganiseerd en besluitvaardig, je blinkt waarschijnlijk uit in het beheren van projecten en ervoor zorgen dat dingen efficiënt worden gedaan.',
        'ESFJ': 'Warm en consciëntieus, je geniet er waarschijnlijk van mensen samen te brengen en positieve ervaringen te creëren.',
        'ISTP': 'Praktisch en aanpasbaar, je geeft waarschijnlijk de voorkeur aan praktisch probleemoplossen en zelfstandig werken.',
        'ISFP': 'Artistiek en gevoelig, je waardeert waarschijnlijk persoonlijke expressie en werkt liever in je eigen tempo.',
        'ESTP': 'Energiek en pragmatisch, je houdt waarschijnlijk van actie ondernemen en je snel aanpassen aan nieuwe situaties.',
        'ESFP': 'Spontaan en enthousiast, je houdt waarschijnlijk van het samenzijn met mensen en het creëren van gedenkwaardige ervaringen.'
      },
      showEvidence: 'Meer Informatie',
      hideEvidence: 'Minder Informatie',
      dismiss: 'Wegwijzen',
      continue: 'Doorgaan',
      gotIt: 'Begrepen',
      generated: 'Gegenereerd',
      loading: 'HACS Laden...',
      soulAlchemistReady: 'Ik ben klaar om je transformatie te begeleiden.',
      blueprintUnderstanding: 'Blueprint Begrip',
      systemInitializing: 'Systeem initialiseren...',
      insightsQueue: '{current} van {total} inzichten',
      microLearning: {
        progress: {
          question: 'Vraag',
          response: 'Antwoord',
          analysis: 'Analyse'
        },
        moduleTypes: {
          foundational: 'fundamenteel',
          validation: 'validatie',
          philosophical: 'filosofisch'
        },
        interface: {
          questionLabel: 'Vraag:',
          yourResponse: 'Jouw Antwoord:',
          skipForNow: 'Sla Nu Over',
          submit: 'Verstuur',
          continueButton: 'Doorgaan met Leren'
        },
        placeholder: 'Deel je gedachten en inzichten...',
        helperText: 'Neem de tijd om na te denken. Kwaliteitsantwoorden helpen HACS om meer over je te leren.',
        analyzing: {
          title: 'Je Antwoord Analyseren',
          description: 'HACS evalueert je inzichten voor begrip en leerevidentie...'
        },
        results: {
          learningValidated: 'Leren Gevalideerd!',
          responseRecorded: 'Antwoord Opgeslagen',
          genuineUnderstanding: 'Je antwoord toont oprecht begrip',
          keepExploring: 'Blijf verkennen om nieuwe inzichten te ontgrendelen!',
          comprehensionScore: 'Begripscore:',
          intelligenceGrowth: 'Intelligentiegroei:',
          learningEvidence: 'Leerevidentie:'
        }
      }
    },
    // Gepersonaliseerde Berichten voor Real-time Leren
    personalizedMessages: {
      career_vocational: "Ik leer hoe je carrièrebeslissingen benadert en wat je professionele reis echt motiveert",
      rhythm_analyst: "Ik ontdek je natuurlijke energiepatronen en wanneer je op je best presteert",
      mentalism_analyst: "Ik begrijp hoe jouw geest informatie verwerkt en verbindingen legt",
      processing: "Ik analyseer je persoonlijkheidsmatrix om te begrijpen wie je werkelijk bent",
      fractal_synthesis: "Ik weef alle stukjes samen om je complete persoonlijkheidsportret te creëren",
      default: "Ik ben nu op de achtergrond aan het leren! Je kunt de app gewoon blijven gebruiken terwijl ik de diepste delen van je blauwdruk verken"
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
    // Profiel Pagina
    profile: {
      // Tab Labels
      stats: 'Statistieken',
      goals: 'Doelen',
      settings: 'Instellingen',
      
      // Growth Journey Section
      growthJourney: 'Groeireis',
      blueprintCompletion: 'Blauwdruk Voltooiing',
      activeGoals: 'Actieve Doelen',
      tasksCompleted: 'Taken Voltooid',
      coachConversations: 'Coach Gesprekken',
      
      // Weekly Insights
      weeklyInsights: 'Wekelijkse Inzichten',
      mostProductiveDay: 'Meest Productieve Dag',
      energyPeaks: 'Energiepieken',
      focusSessions: 'Focus Sessies',
      wednesday: 'Woensdag',
      morningPeaks: 'Ochtend pieken',
      aligned: 'Uitgelijnd',
      thisWeek: 'deze week',
      
      // Goals Section
      noGoals: 'Nog geen doelen',
      createFirstGoal: 'Creëer je eerste doel om je voortgang te volgen.',
      viewAllGoals: 'Bekijk Alle Doelen',
      onTrack: 'Op Schema',
      progress: 'Voortgang',
      complete: 'Voltooien',
      
      // Settings Section
      appSettings: 'App Instellingen',
      notifications: 'Meldingen',
      darkMode: 'Donkere Modus',
      accountSettings: 'Account Instellingen',
      accountSettingsTooltip: 'Beheer je account voorkeuren',
      
      // Status Messages
      errorLoading: 'Fout bij laden profiel',
      logoutSuccess: 'Succesvol uitgelogd',
      logoutError: 'Uitloggen mislukt',
      darkModeEnabled: 'Donkere modus ingeschakeld',
      lightModeEnabled: 'Lichte modus ingeschakeld',
      darkModeDescription: 'Je interface is nu in donkere modus',
      lightModeDescription: 'Je interface is nu in lichte modus',
      
      // Task Actions
      taskCompleted: 'Taak Voltooid!',
      taskCompletedDescription: 'Goed gedaan! Je hebt een taak voltooid.',
      
      // Goal Status
      status: {
        active: 'Actief',
        completed: 'Voltooid',
        paused: 'Gepauzeerd'
      }
    },
    // Reis
    journey: {
      empty: {
        title: 'Geen Actieve Droomreis',
        description: 'Maak je eerste droom aan om je persoonlijke routekaart te zien'
      }
    },

    mobileTabs: {
      overview: 'Overzicht',
      roadmap: 'Routekaart',
      nextTask: 'Volgende Taak',
      task: 'Taak'
    },

    // Ontleding proces
    decomposition: {
      errors: {
        creationFailed: 'Aanmaken Mislukt',
        tryAgain: 'Opnieuw Proberen'
      },
      processing: {
        initializing: 'Initialiseren...',
        preparingAnalysis: 'Je droomanalyse voorbereiden...'
      },
      loading: {
        interpretingSymbolism: 'Diepere symboliek interpreteren...',
        connectingThemes: 'Thema\'s verbinden met je blauwdruk...',
        weavingInsights: 'Inzichten samen weven...',
        discoveringPatterns: 'Verborgen patronen ontdekken...',
        aligningSoul: 'Afstemmen op je zielritme...',
        craftingPathway: 'Je gepersonaliseerde pad creëren...',
        processingAI: 'Verwerken via AI coach...',
        generatingStructure: 'Mijlpaal structuur genereren...',
        creatingBreakdowns: 'Taak analyses maken...',
        applyingInsights: 'Blauwdruk inzichten toepassen...',
        deepAnalysis: 'Diepgaande analyse bezig'
      },
      reassurance: {
        beautiful: '"{dreamTitle}" is een prachtige droom - diepere dromen hebben een moment nodig om zich te ontvouwen',
        richBlueprint: 'Je blauwdruk is rijk aan wijsheid... we eren elk detail',
        greatDreams: 'Grote dromen verdienen zorgvuldige planning - bijna klaar!',
        universe: 'Het universum werkt samen om je te helpen slagen... geduld, lieve ziel',
        complexGoals: 'Complexe doelen vereisen diepere AI analyse - dit zorgt voor betere resultaten',
        extraCare: 'Je gepersonaliseerde reis wordt met extra zorg gecreëerd'
      },
      stages: {
        analyzing: 'Je Droom Analyseren',
        creating: 'Mijlpalen Creëren',
        designing: 'Gepersonaliseerde Taken Ontwerpen',
        preparing: 'Je Reis Voorbereiden'
      },
      progress: {
        creating: 'Je reis creëren... {progress}%'
      },
      processingTime: 'Verwerken voor {seconds}s',
      aiTime: 'AI: {seconds}s',
      complexDream: 'Complexe droom gedetecteerd',
      richGoals: 'Rijke doelen vereisen diepere AI analyse. We zorgen voor de hoogste kwaliteit personalisatie voor je.',
      deeperDream: '💫 Hoe dieper de droom, hoe rijker de reis die voor je ligt',
      processingDetails: 'Verwerkingsdetails',
      totalTime: 'Totale tijd: {seconds}s',
      aiProcessing: 'AI verwerking: {status}',
      stage: 'Fase: {current}/{total}',
      status: 'Status: {status}',
      inProgress: 'Bezig...',
      aiCompleted: 'AI voltooid, afronden...'
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
      profileCards: {
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
      cards: {
        heartCentered: {
          title: 'Hartgedreven Coach',
          description: 'Directe gepersonaliseerde spirituele begeleiding.'
        },
        lifeOperatingSystem: {
          title: 'Levensbesturingssysteem',
          description: 'Holistische levensbeoordeling en groeicoördinatie.'
        },
        structuredProgram: {
          title: 'Gestructureerd Programma',
          description: '12-weekse reis voor diepe transformatie.'
        },
        spiritualTools: {
          title: 'Spirituele Tools',
          description: 'Stemmingstracking en reflectiepraktijken.'
        }
      },
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
    // Learning
    learning: {
      responseRecorded: 'Reactie Opgenomen',
      keepExploring: 'Blijf verkennen om diepere inzichten te ontgrendelen'
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
      backToJourney: 'Terug naar Reis',
      sessionProgress: 'Sessie Voortgang',
      focusTime: 'Focus Tijd',
      duration: 'Duur',
      energy: 'Energie',
      multiDayProgress: 'Meerdaagse Voortgang',
      taskCompletion: 'Taak Voltooiing',
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
      soulCoach: 'Zielscoach',
      // Task Management
      actions: {
        markDone: 'Markeer als Klaar',
        getCoach: 'Krijg Coach',
        continueJourney: 'Reis Voortzetten'
      },
      status: {
        completed: 'Taak Voltooid!',
        estimated: 'Geschat:',
        actual: 'Werkelijk:',
        timing: 'Timing:',
        energy: 'Energie:',
        onTime: 'Op Tijd',
        underTime: 'Onder Tijd',
        overTime: 'Over Tijd',
        keyInsights: 'Belangrijke Inzichten:'
      },
      preview: {
        hideInfo: 'Verberg Info',
        showInfo: 'Voorbeeld / Meer Info',
        whatHappensNext: 'Wat gebeurt er hierna:',
        nextDescription: 'Je werkt zij aan zij met je Ziel Coach om deze taak op te delen in hanteerbare, motiverende mini-stappen.',
        outcomeGoal: 'Uitkomst / Doel:',
        defaultGoal: 'Zie deze taak door tot voltooiing',
        miniSteps: 'Mini-stappen:'
      },
      badges: {
        blueprint: '🧩 Blauwdruk'
      }
    },

    // Growth Program & Domains
    growth: {
      domains: {
        career: {
          title: 'Carrière & Doel',
          description: 'Werk, roeping, professionele groei'
        },
        relationships: {
          title: 'Relaties & Liefde',
          description: 'Romantisch, vriendschappen, familieverbindingen'
        },
        wellbeing: {
          title: 'Gezondheid & Welzijn',
          description: 'Fysieke, mentale, emotionele gezondheid'
        },
        finances: {
          title: 'Geld & Overvloed',
          description: 'Financiën, rijkdom, welvaart mindset'
        },
        creativity: {
          title: 'Creativiteit & Expressie',
          description: 'Artistiek, innovatief, creatieve bezigheden'
        },
        spirituality: {
          title: 'Spiritualiteit & Betekenis',
          description: 'Bewustzijn, doel, spirituele groei'
        },
        home_family: {
          title: 'Thuis & Familie',
          description: 'Huiselijk leven, familierelaties, leefomgeving'
        }
      },
      onboarding: {
        welcomeTitle: 'Welkom bij Je Groeireis',
        welcomeDescription: 'Ik ben je Groei Coach, hier om je stap voor stap te begeleiden. Welk gebied van je leven voelt nu het meest levendig of uitdagend voor je?',
        clickToExplore: 'Klik om te verkennen →',
        chooseAreaPrompt: 'Kies het gebied waar je nu de meeste energie voor groei voelt'
      }
    },

    // Form Placeholders
    forms: {
      placeholders: {
        searchUsers: 'Zoek gebruikers...',
        typeMessage: 'Typ je bericht...',
        enterFullName: 'Voer je volledige naam in',
        fullName: 'Je volledige legale naam',
        enterPreferredName: 'Hoe je genoemd wilt worden',
        displayName: 'Hoe je genoemd wilt worden',
        enterBirthLocation: 'Stad, Land (bijv. Amsterdam, Nederland)',
        cityCountry: 'Stad, Land (bijv. Amsterdam, Nederland)',
        enterTimezone: 'bijv. Europe/Amsterdam',
        timezone: 'bijv. Europe/Amsterdam',
        goalsContext: 'Specifieke doelen, uitdagingen, of context over dit gebied...',
        visionDescription: 'Beschrijf je visie van een ideaal leven waarin alles werkt...',
        shareThoughts: 'Deel wat er in je hart leeft...',
        shareReflection: 'Deel je reflectie of reactie...',
        reflection: 'Deel je reflectie of reactie...',
        spiritualThoughts: 'Deel je spirituele gedachten...',
        shareInsights: 'Deel je gedachten en inzichten...',
        testMessage: 'Typ een bericht om te testen...',
        askCoach: 'Vraag over je taak, verzoek acties, of krijg begeleiding...',
        searchQuery: 'Zoek over alle dimensies...',
        filterLogs: 'Filter logs op activiteitstype of content...',
        customMessage: 'Voer een aangepast bericht in om te testen...',
        shareBeliefs: 'Deel wat er in je opkomt...',
        lifeAreaThoughts: 'Specifieke gedachten over dit levensgebied...',
        testFlowMessage: 'Test bericht voor flow validatie...',
        memoryContent: 'Voer geheugeninhoud in om mee te testen...',
        reminderTitle: 'Voer herinneringstitel in...',
        intentTest: 'Voer intentie in om te testen...',
        sessionId: 'Sessie ID',
        moduleId: 'Module ID...',
        frequencyHz: 'Hz',
        value: 'Waarde...',
        userId: 'Voer gebruikers ID in'
      },
      validation: {
        required: 'Dit veld is verplicht',
        invalidEmail: 'Voer een geldig e-mailadres in',
        minimumLength: 'Minimaal {length} karakters vereist',
        maximumLength: 'Maximaal {length} karakters toegestaan',
        passwordMismatch: 'Wachtwoorden komen niet overeen',
        invalidDate: 'Voer een geldige datum in',
        invalidTime: 'Voer een geldige tijd in',
        invalidLocation: 'Voer een geldige locatie in'
      }
    },
    // Assessment System
    assessment: {
      lifeWheel: {
        title: 'Levenswiel Beoordeling',
        description: 'Evalueer je tevredenheid over belangrijke levensdomeinen',
        currentScore: 'Huidige tevredenheidsniveau',
        desiredScore: 'Gewenste tevredenheidsniveau',
        importanceRating: 'Hoe belangrijk is dit gebied voor je?',
        notes: 'Aanvullende notities of context',
        complete: 'Beoordeling succesvol voltooid',
        saveError: 'Beoordeling opslaan mislukt'
      },
      domains: {
        career: 'Carrière & Werk',
        health: 'Gezondheid & Welzijn', 
        relationships: 'Relaties',
        finances: 'Financiële Zekerheid',
        personal: 'Persoonlijke Groei',
        recreation: 'Recreatie & Plezier',
        environment: 'Fysieke Omgeving',
        contribution: 'Bijdrage & Service'
      }
    },

    // Journey Overview
    journeyOverview: {
      title: 'Je Volledige Reis Overzicht',
      titleShort: 'Reis Overzicht',
      subtitle: 'Speciaal ontworpen voor jouw blauwdruk',
      milestones: 'Mijlpalen',
      milestonesDesc: 'Belangrijke prestatiefasen',
      actionTasks: 'Actie Taken',
      tasks: 'Taken',
      tasksDesc: 'Blauwdruk-geoptimaliseerde stappen',
      timeline: 'Tijdlijn',
      timelineDesc: 'Naar voltooiing'
    },

  }
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => any;
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

  const t = (key: string): any => {
    const value = getNestedValue(translations[language], key);
    
    if (value !== undefined) {
      // Handle arrays by returning first element or joining them
      if (Array.isArray(value)) {
        return value[0] || key;
      }
      // Return value as-is if it's a string OR object (for personality descriptions)
      if (typeof value === 'string' || typeof value === 'object') {
        return value;
      }
      return key;
    }
    
    // Fallback to English if current language doesn't have the key
    const fallbackValue = getNestedValue(translations.en, key);
    if (fallbackValue !== undefined) {
      console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
      if (Array.isArray(fallbackValue)) {
        return fallbackValue[0] || key;
      }
      // Return fallback value as-is if it's a string OR object
      if (typeof fallbackValue === 'string' || typeof fallbackValue === 'object') {
        return fallbackValue;
      }
      return key;
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
