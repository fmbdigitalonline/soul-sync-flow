import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blueprint': 'Blueprint',
    'nav.coach': 'Coach',
    'nav.tasks': 'Tasks',
    'nav.profile': 'Profile',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Blueprint Page
    'blueprint.title': 'Soul Blueprint',
    'blueprint.signInRequired': 'You need to sign in to view and edit your Soul Blueprint',
    'blueprint.loading': 'Loading your Soul Blueprint...',
    'blueprint.viewTab': 'View Blueprint',
    'blueprint.editTab': 'Edit Blueprint',
    'blueprint.generatingTab': 'Generating',
    'blueprint.basicView': 'Basic',
    'blueprint.enhancedView': 'Enhanced',
    'blueprint.regenerate': 'Regenerate Blueprint',
    'blueprint.chatWithCoach': 'Chat with Soul Coach',
    'blueprint.generating': 'Generating...',
    'blueprint.calculatedUsing': 'Calculated using',
    'blueprint.templateData': 'Using template data',
    'blueprint.welcome': 'Welcome to SoulSync!',
    'blueprint.onboardingMessage': "Let's create your Soul Blueprint through our onboarding process.",
    'blueprint.saved': 'Blueprint saved',
    'blueprint.savedDescription': 'Your Soul Blueprint has been successfully updated',
    'blueprint.errorSaving': 'Error saving blueprint',
    'blueprint.errorLoading': 'Error loading blueprint',
    'blueprint.regenerating': 'Regenerating Blueprint',
    'blueprint.regeneratingDescription': "We're calculating your cosmic profile. This may take a moment...",
    'blueprint.generated': 'Blueprint generated',
    'blueprint.generatedDescription': 'Your Soul Blueprint has been successfully regenerated and saved',
    'blueprint.errorGenerating': 'Error saving generated blueprint',
    'blueprint.realCalculations': 'Real Calculations',
    'blueprint.partialData': 'Partial Data',
    'blueprint.templateDataBadge': 'Template Data',
    
    // Blueprint Sections
    'blueprint.overview': 'Overview',
    'blueprint.mbti': 'MBTI',
    'blueprint.humanDesign': 'Human Design',
    'blueprint.bashar': 'Bashar Suite',
    'blueprint.numerology': 'Numerology',
    'blueprint.western': 'Western Astrology',
    'blueprint.chinese': 'Chinese Astrology',
    'blueprint.energyIdentity': 'Energy & Identity',
    'blueprint.westernAstrology': 'Western Astrology',
    'blueprint.chineseAstrology': 'Chinese Astrology',
    'blueprint.novice': 'Novice',
    'blueprint.amateur': 'Amateur',
    'blueprint.pro': 'Pro',
    
    // Coach Page
    'coach.title': 'Soul AI',
    'coach.signInRequired': 'You need to sign in to access your personalized AI guidance',
    'coach.soulCoach': 'Soul Coach',
    'coach.soulGuide': 'Soul Guide',
    'coach.soulCompanion': 'Soul Companion',
    'coach.newConversation': 'New Conversation',
    'coach.blueprintSettings': 'Blueprint Settings',
    
    // Agent Selector
    'agent.chooseStyle': 'Choose Your Guidance Style',
    'agent.separatedDomains': 'Separated domains or integrated approach',
    'agent.separated': 'SEPARATED',
    'agent.integrated': 'INTEGRATED',
    'agent.or': 'OR',
    
    // Agent Descriptions
    'agent.coach.name': 'Soul Coach',
    'agent.coach.description': 'Pure productivity focus',
    'agent.coach.details': 'Goals • Tasks • Achievement',
    'agent.guide.name': 'Soul Guide',
    'agent.guide.description': 'Pure personal growth',
    'agent.guide.details': 'Wisdom • Growth • Meaning',
    'agent.blend.name': 'Soul Companion',
    'agent.blend.description': 'Integrated life guidance',
    'agent.blend.details': 'Seamless • Holistic • Unified',
    
    // Coach Interface
    'coach.todaysProgress': "Today's Progress",
    'coach.dayStreak': '{{count}} day streak',
    'coach.dailyGoals': 'Daily goals',
    'coach.complete': '{{completed}}/{{total}} complete',
    'coach.ready': 'Your Soul Coach is ready',
    'coach.readyDescription': "Let's turn your goals into actionable steps. What would you like to achieve?",
    'coach.quickStart': 'Quick Start:',
    'coach.analyzing': 'Analyzing your goals...',
    'coach.inputPlaceholder': "What's your next goal or challenge?",
    'coach.poweredBy': 'Goal-focused coaching powered by your Soul Blueprint',
    'coach.done': 'Done',
    'coach.schedule': 'Schedule',
    
    // Quick Actions
    'quickAction.breakDownGoal': 'Help me break down my goal',
    'quickAction.createRoutine': 'Create a daily routine',
    'quickAction.setupAccountability': 'Set up accountability check-ins',
    'quickAction.planWeek': 'Plan my week',
    
    // Guide Interface
    'guide.innerCompass': 'Inner Compass',
    'guide.reflectionMode': 'Reflection mode',
    'guide.checkIn': 'Check-in',
    'guide.reflect': 'Reflect',
    'guide.journal': 'Journal',
    'guide.description': 'Your Soul Guide is here to help you understand yourself more deeply and navigate life\'s complexities with wisdom.',
    'guide.awaits': 'Your Soul Guide awaits',
    'guide.awaitsDescription': 'Share what\'s on your heart and mind. Let\'s explore the deeper patterns together.',
    'guide.reflecting': 'Reflecting on your soul\'s wisdom...',
    'guide.inputPlaceholder': "What's stirring in your soul today?",
    'guide.poweredBy': 'Compassionate guidance powered by your Soul Blueprint',
    'guide.exploreDeeper': 'Explore deeper',
    'guide.blueprintLink': 'Blueprint link',
    'guide.tellMore': 'Tell me more about this',
    'guide.howConnect': 'How does this connect to my blueprint?',
    
    // Blend Interface
    'blend.soulCompanion': 'Soul Companion',
    'blend.balancedGuidance': 'Balanced guidance',
    'blend.description': 'Your companion for both achieving goals and understanding yourself deeply',
    'blend.awaits': 'Your Soul Companion awaits',
    'blend.awaitsDescription': 'Ask about productivity, goals, personal growth, or reflection. I\'ll help you find the perfect balance.',
    'blend.finding': 'Finding the perfect balance for you...',
    'blend.inputPlaceholder': 'Ask about goals, growth, or anything on your mind...',
    'blend.poweredBy': 'Balanced guidance combining productivity and personal insight',
    'blend.makeActionable': 'Make actionable',
    'blend.goDeeper': 'Go deeper',
    'blend.blueprintWisdom': 'Blueprint wisdom',
    'blend.setGoal': 'Set a goal',
    'blend.reflectToday': 'Reflect on today',
    'blend.findBalance': 'Find balance',
    'blend.breakThrough': 'Break through blocks',
    
    // Action Messages
    'action.setGoalMessage': 'Help me set and track a meaningful goal',
    'action.reflectMessage': 'I want to reflect on my day and understand my feelings',
    'action.balanceMessage': 'Help me find balance between my productivity and personal growth',
    'action.stuckMessage': "I'm feeling stuck and need help moving forward",
    'action.actionableSteps': 'How can I turn this into actionable steps?',
    'action.deeperMeaning': 'Help me understand the deeper meaning here',
    'action.blueprintSays': 'What would my blueprint say about this?',
    
    // General
    'you': 'You',
    'insight': 'Insight',
    'balanced': 'Balanced',
    'newConversationStarted': 'Started a fresh conversation with your {{agent}}',
    'loading': 'Loading...',
    'error': 'Error',
    'retry': 'Retry',
    'cancel': 'Cancel',
    'save': 'Save',
    'close': 'Close',
    'next': 'Next',
    'previous': 'Previous',
    'continue': 'Continue',
    'send': 'Send',
    
    // Tasks Page
    'tasks.title': 'Aligned Tasks',
    'tasks.subtitle': 'Tasks personalized to your Soul Blueprint',
    'tasks.addPlaceholder': 'Add a new aligned task...',
    'tasks.viewList': 'List',
    'tasks.viewKanban': 'Kanban',
    'tasks.tabAll': 'All',
    'tasks.tabActive': 'Active',
    'tasks.tabCompleted': 'Completed',
    'tasks.noTasks': 'No tasks found',
    'tasks.noActiveTasks': 'No active tasks found',
    'tasks.noCompletedTasks': 'No completed tasks found',
    'tasks.statusTodo': 'To Do',
    'tasks.statusInProgress': 'In Progress',
    'tasks.statusStuck': 'Stuck',
    'tasks.statusCompleted': 'Completed',
    'tasks.priorityLow': 'low',
    'tasks.priorityMedium': 'medium',
    'tasks.priorityHigh': 'high',
    'tasks.dueToday': 'Today',
    'tasks.dueTomorrow': 'Tomorrow',
    'tasks.addedToast': 'Task added',
    'tasks.addedDescription': 'Your new aligned task has been created.',
    'tasks.completedToast': 'Task completed',
    'tasks.completedDescription': 'Great job completing this task!',
    'tasks.reopenedToast': 'Task reopened',
    'tasks.reopenedDescription': "You've reopened this task",
    'tasks.deletedToast': 'Task deleted',
    'tasks.deletedDescription': 'Your task has been removed.',
    'tasks.stuckHelp': 'I notice you have a stuck task. Would you like some help or suggestions to move it forward?',
    
    // Productivity Suite
    'productivity.title': 'Productivity Suite',
    'productivity.subtitle': 'Productivity Suite: Tailored to your unique Soul Blueprint',
    'productivity.focusTimer': 'Focus Timer',
    'productivity.habits': 'Habits',
    'productivity.goals': 'Goals',
    'productivity.planning': 'Planning',
    'productivity.loading': 'Loading your personalized focus timer...',
    'productivity.description1': 'Focus timer adjusts to your cognitive patterns',
    'productivity.description2': 'Habits aligned with your energy cycles',
    'productivity.description3': 'Goals framed around your natural strengths',
    
    // Menu Options
    'menu.status': 'Status',
    'menu.delete': 'Delete',
    
    // Pomodoro Timer
    'pomodoro.breakTime': 'Break Time',
    'pomodoro.focusTimer': 'Focus Timer',
    'pomodoro.pomodorosCompleted': 'Pomodoros completed today',
    'pomodoro.standardRhythm': 'Standard 25/5 Pomodoro rhythm',
    'pomodoro.deepFocusRhythm': 'Extended focus for deep work (40/5)',
    'pomodoro.quickBurstsRhythm': 'Quick bursts for enhanced attention (15/5)',
    'pomodoro.breakFinished': 'Break finished!',
    'pomodoro.timeToFocus': 'Time to focus on your task.',
    'pomodoro.pomodoroCompleted': 'Pomodoro completed!',
    'pomodoro.takeBreak': 'Take a short break.',
    
    // Habit Tracker
    'habits.title': 'Habit Tracker',
    'habits.addPlaceholder': 'Add a new habit...',
    'habits.noHabits': 'No habits added yet. Add one to get started!',
    'habits.alignedWithBlueprint': 'Aligned with your blueprint',
    'habits.created': 'Habit created',
    'habits.createdDescription': '{{name}} added to your habit tracker.',
    'habits.suggestedAdded': 'Suggested habit added',
    'habits.suggestedAddedDescription': '{{name}} added to your habit tracker.',
    'habits.deleted': 'Habit deleted',
    'habits.deletedDescription': 'The habit has been removed from your tracker.',
    'habits.daysSingular': 'day',
    'habits.daysPlural': 'days',
    
    // Goal Setting
    'goals.smartGoals': 'SMART Goals',
    'goals.addGoal': 'Add Goal',
    'goals.cancel': 'Cancel',
    'goals.goalTitle': 'Goal Title',
    'goals.goalTitlePlaceholder': 'What do you want to achieve?',
    'goals.description': 'Description',
    'goals.descriptionPlaceholder': 'Be specific about what success looks like',
    'goals.category': 'Category',
    'goals.selectCategory': 'Select a category',
    'goals.targetDate': 'Target Date',
    'goals.milestones': 'Milestones',
    'goals.addMilestone': 'Add a milestone',
    'goals.createGoal': 'Create Goal',
    'goals.noGoals': 'No goals added yet. Add your first SMART goal to get started!',
    'goals.progress': 'Progress',
    'goals.milestonesTitle': 'Milestones',
    'goals.noMilestones': 'No milestones added yet.',
    'goals.noDeadline': 'No deadline',
    'goals.created': 'Goal created',
    'goals.createdDescription': 'New SMART goal has been added.',
    'goals.deleted': 'Goal deleted',
    'goals.deletedDescription': 'The goal has been removed.',
    
    // Goal Categories
    'goals.categoryPersonal': 'Personal Growth',
    'goals.categoryCareer': 'Career & Work',
    'goals.categoryHealth': 'Health & Wellness',
    'goals.categoryRelationships': 'Relationships',
    'goals.categorySpiritual': 'Spiritual Growth',
    'goals.categoryFinancial': 'Financial',
    'goals.categoryCreative': 'Creative Projects',
    
    // Profile Page
    'profile.stats': 'Stats',
    'profile.goals': 'Goals', 
    'profile.settings': 'Settings',
    'profile.growthJourney': 'Your Growth Journey',
    'profile.blueprintCompletion': 'Blueprint Completion',
    'profile.activeGoals': 'Active Goals',
    'profile.tasksCompleted': 'Tasks Completed',
    'profile.coachConversations': 'Coach Conversations',
    'profile.weeklyInsights': 'Weekly Insights',
    'profile.mostProductiveDay': 'Most Productive Day',
    'profile.energyPeaks': 'Energy Peaks',
    'profile.focusSessions': 'Focus Sessions',
    'profile.thisWeek': 'this week',
    'profile.aligned': 'Aligned',
    'profile.wednesday': 'Wednesday',
    'profile.morningPeaks': 'Morning: 9-11am',
    'profile.noGoals': 'No goals found',
    'profile.createFirstGoal': 'Start by creating your first goal to track your progress',
    'profile.viewAllGoals': 'View All Goals',
    'profile.appSettings': 'App Settings',
    'profile.notifications': 'Notifications',
    'profile.darkMode': 'Dark Mode',
    'profile.accountSettings': 'Account Settings',
    'profile.accountSettingsTooltip': 'Configure your account preferences',
    'profile.logoutSuccess': 'You have been successfully logged out.',
    'profile.logoutError': 'Failed to log out. Please try again.',
    'profile.darkModeEnabled': 'Dark mode enabled',
    'profile.lightModeEnabled': 'Light mode enabled',
    'profile.darkModeDescription': 'Switched to dark theme',
    'profile.lightModeDescription': 'Switched to light theme',
    'profile.taskCompleted': 'Task completed!',
    'profile.taskCompletedDescription': 'Great job on completing your task.',
    'profile.errorLoading': 'Error loading profile',
    'profile.progress': 'Progress',
    'profile.complete': 'Complete',
    'profile.onTrack': 'On track',
    'profile.status.completed': 'Completed',
    'profile.status.paused': 'Paused',
    'profile.status.active': 'Active',
    'profile.focusMode': 'Focus Mode',
  },
  
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.blueprint': 'Blauwdruk',
    'nav.coach': 'Coach',
    'nav.tasks': 'Taken',
    'nav.profile': 'Profiel',
    'nav.signIn': 'Inloggen',
    'nav.signOut': 'Uitloggen',
    
    // Blueprint Page
    'blueprint.title': 'Ziel Blauwdruk',
    'blueprint.signInRequired': 'Je moet inloggen om je Ziel Blauwdruk te bekijken en bewerken',
    'blueprint.loading': 'Je Ziel Blauwdruk laden...',
    'blueprint.viewTab': 'Blauwdruk Bekijken',
    'blueprint.editTab': 'Blauwdruk Bewerken',
    'blueprint.generatingTab': 'Genereren',
    'blueprint.basicView': 'Basis',
    'blueprint.enhancedView': 'Uitgebreid',
    'blueprint.regenerate': 'Blauwdruk Regenereren',
    'blueprint.chatWithCoach': 'Chat met Ziel Coach',
    'blueprint.generating': 'Genereren...',
    'blueprint.calculatedUsing': 'Berekend met',
    'blueprint.templateData': 'Gebruikt sjabloongegevens',
    'blueprint.welcome': 'Welkom bij SoulSync!',
    'blueprint.onboardingMessage': 'Laten we je Ziel Blauwdruk maken via ons onboarding proces.',
    'blueprint.saved': 'Blauwdruk opgeslagen',
    'blueprint.savedDescription': 'Je Ziel Blauwdruk is succesvol bijgewerkt',
    'blueprint.errorSaving': 'Fout bij opslaan blauwdruk',
    'blueprint.errorLoading': 'Fout bij laden blauwdruk',
    'blueprint.regenerating': 'Blauwdruk Regenereren',
    'blueprint.regeneratingDescription': 'We berekenen je kosmische profiel. Dit kan even duren...',
    'blueprint.generated': 'Blauwdruk gegenereerd',
    'blueprint.generatedDescription': 'Je Ziel Blauwdruk is succesvol geregenereerd en opgeslagen',
    'blueprint.errorGenerating': 'Fout bij opslaan gegenereerde blauwdruk',
    'blueprint.realCalculations': 'Echte Berekeningen',
    'blueprint.partialData': 'Gedeeltelijke Gegevens',
    'blueprint.templateDataBadge': 'Sjabloon Gegevens',
    
    // Blueprint Sections
    'blueprint.overview': 'Overzicht',
    'blueprint.mbti': 'MBTI',
    'blueprint.humanDesign': 'Human Design',
    'blueprint.bashar': 'Bashar Suite',
    'blueprint.numerology': 'Numerologie',
    'blueprint.western': 'Westerse Astrologie',
    'blueprint.chinese': 'Chinese Astrologie',
    'blueprint.energyIdentity': 'Energie & Identiteit',
    'blueprint.westernAstrology': 'Westerse Astrologie',
    'blueprint.chineseAstrology': 'Chinese Astrologie',
    'blueprint.novice': 'Beginner',
    'blueprint.amateur': 'Amateur',
    'blueprint.pro': 'Pro',
    
    // Coach Page
    'coach.title': 'Ziel AI',
    'coach.signInRequired': 'Je moet inloggen om toegang te krijgen tot je gepersonaliseerde AI-begeleiding',
    'coach.soulCoach': 'Ziel Coach',
    'coach.soulGuide': 'Ziel Gids',
    'coach.soulCompanion': 'Ziel Metgezel',
    'coach.newConversation': 'Nieuw Gesprek',
    'coach.blueprintSettings': 'Blauwdruk Instellingen',
    
    // Agent Selector
    'agent.chooseStyle': 'Kies Je Begeleidingsstijl',
    'agent.separatedDomains': 'Gescheiden domeinen of geïntegreerde aanpak',
    'agent.separated': 'GESCHEIDEN',
    'agent.integrated': 'GEÏNTEGREERD',
    'agent.or': 'OF',
    
    // Agent Descriptions
    'agent.coach.name': 'Ziel Coach',
    'agent.coach.description': 'Pure productiviteitsfocus',
    'agent.coach.details': 'Doelen • Taken • Prestatie',
    'agent.guide.name': 'Ziel Gids',
    'agent.guide.description': 'Pure persoonlijke groei',
    'agent.guide.details': 'Wijsheid • Groei • Betekenis',
    'agent.blend.name': 'Ziel Metgezel',
    'agent.blend.description': 'Geïntegreerde levenswijsheid',
    'agent.blend.details': 'Naadloos • Holistisch • Verenigd',
    
    // Coach Interface
    'coach.todaysProgress': 'Voortgang Van Vandaag',
    'coach.dayStreak': '{{count}} dagen reeks',
    'coach.dailyGoals': 'Dagelijkse doelen',
    'coach.complete': '{{completed}}/{{total}} voltooid',
    'coach.ready': 'Je Ziel Coach is klaar',
    'coach.readyDescription': 'Laten we je doelen omzetten in uitvoerbare stappen. Wat wil je bereiken?',
    'coach.quickStart': 'Snelle Start:',
    'coach.analyzing': 'Je doelen analyseren...',
    'coach.inputPlaceholder': 'Wat is je volgende doel of uitdaging?',
    'coach.poweredBy': 'Doelgerichte coaching aangedreven door je Ziel Blauwdruk',
    'coach.done': 'Klaar',
    'coach.schedule': 'Plannen',
    
    // Quick Actions
    'quickAction.breakDownGoal': 'Help me mijn doel op te splitsen',
    'quickAction.createRoutine': 'Maak een dagelijkse routine',
    'quickAction.setupAccountability': 'Stel verantwoordingscheck-ins in',
    'quickAction.planWeek': 'Plan mijn week',
    
    // Guide Interface
    'guide.innerCompass': 'Innerlijk Kompas',
    'guide.reflectionMode': 'Reflectie modus',
    'guide.checkIn': 'Check-in',
    'guide.reflect': 'Reflecteren',
    'guide.journal': 'Dagboek',
    'guide.description': 'Je Ziel Gids is er om je te helpen jezelf dieper te begrijpen en door de complexiteit van het leven te navigeren met wijsheid.',
    'guide.awaits': 'Je Ziel Gids wacht',
    'guide.awaitsDescription': 'Deel wat er in je hart en geest speelt. Laten we samen de diepere patronen verkennen.',
    'guide.reflecting': 'Reflecteren over je zielwijsheid...',
    'guide.inputPlaceholder': 'Wat roert er vandaag in je ziel?',
    'guide.poweredBy': 'Meelevende begeleiding aangedreven door je Ziel Blauwdruk',
    'guide.exploreDeeper': 'Dieper verkennen',
    'guide.blueprintLink': 'Blauwdruk link',
    'guide.tellMore': 'Vertel me hier meer over',
    'guide.howConnect': 'Hoe verbindt dit met mijn blauwdruk?',
    
    // Blend Interface
    'blend.soulCompanion': 'Ziel Metgezel',
    'blend.balancedGuidance': 'Gebalanceerde begeleiding',
    'blend.description': 'Je metgezel voor zowel het bereiken van doelen als het diep begrijpen van jezelf',
    'blend.awaits': 'Je Ziel Metgezel wacht',
    'blend.awaitsDescription': 'Vraag over productiviteit, doelen, persoonlijke groei, of reflectie. Ik help je de perfecte balans te vinden.',
    'blend.finding': 'De perfecte balans voor je zoeken...',
    'blend.inputPlaceholder': 'Vraag over doelen, groei, of wat er in je opkomt...',
    'blend.poweredBy': 'Gebalanceerde begeleiding die productiviteit en persoonlijk inzicht combineert',
    'blend.makeActionable': 'Maak uitvoerbaar',
    'blend.goDeeper': 'Ga dieper',
    'blend.blueprintWisdom': 'Blauwdruk wijsheid',
    'blend.setGoal': 'Stel een doel',
    'blend.reflectToday': 'Reflecteer op vandaag',
    'blend.findBalance': 'Vind balans',
    'blend.breakThrough': 'Doorbreek blokkades',
    
    // Action Messages
    'action.setGoalMessage': 'Help me een betekenisvol doel stellen en volgen',
    'action.reflectMessage': 'Ik wil reflecteren op mijn dag en mijn gevoelens begrijpen',
    'action.balanceMessage': 'Help me balans vinden tussen mijn productiviteit en persoonlijke groei',
    'action.stuckMessage': 'Ik voel me vastzitten en heb hulp nodig om vooruit te komen',
    'action.actionableSteps': 'Hoe kan ik dit omzetten in uitvoerbare stappen?',
    'action.deeperMeaning': 'Help me de diepere betekenis hiervan begrijpen',
    'action.blueprintSays': 'Wat zou mijn blauwdruk hierover zeggen?',
    
    // General
    'you': 'Jij',
    'insight': 'Inzicht',
    'balanced': 'Gebalanceerd',
    'newConversationStarted': 'Een nieuw gesprek gestart met je {{agent}}',
    'loading': 'Laden...',
    'error': 'Fout',
    'retry': 'Opnieuw proberen',
    'cancel': 'Annuleren',
    'save': 'Opslaan',
    'close': 'Sluiten',
    'next': 'Volgende',
    'previous': 'Vorige',
    'continue': 'Doorgaan',
    'send': 'Versturen',
    
    // Tasks Page
    'tasks.title': 'Afgestemde Taken',
    'tasks.subtitle': 'Taken gepersonaliseerd naar je Ziel Blauwdruk',
    'tasks.addPlaceholder': 'Voeg een nieuwe afgestemde taak toe...',
    'tasks.viewList': 'Lijst',
    'tasks.viewKanban': 'Kanban',
    'tasks.tabAll': 'Alle',
    'tasks.tabActive': 'Actief',
    'tasks.tabCompleted': 'Voltooid',
    'tasks.noTasks': 'Geen taken gevonden',
    'tasks.noActiveTasks': 'Geen actieve taken gevonden',
    'tasks.noCompletedTasks': 'Geen voltooide taken gevonden',
    'tasks.statusTodo': 'Te Doen',
    'tasks.statusInProgress': 'Bezig',
    'tasks.statusStuck': 'Vastgelopen',
    'tasks.statusCompleted': 'Voltooid',
    'tasks.priorityLow': 'laag',
    'tasks.priorityMedium': 'gemiddeld',
    'tasks.priorityHigh': 'hoog',
    'tasks.dueToday': 'Vandaag',
    'tasks.dueTomorrow': 'Morgen',
    'tasks.addedToast': 'Taak toegevoegd',
    'tasks.addedDescription': 'Je nieuwe afgestemde taak is aangemaakt.',
    'tasks.completedToast': 'Taak voltooid',
    'tasks.completedDescription': 'Goed gedaan met het voltooien van deze taak!',
    'tasks.reopenedToast': 'Taak heropend',
    'tasks.reopenedDescription': 'Je hebt deze taak heropend',
    'tasks.deletedToast': 'Taak verwijderd',
    'tasks.deletedDescription': 'Je taak is verwijderd.',
    'tasks.stuckHelp': 'Ik zie dat je een vastgelopen taak hebt. Wil je hulp of suggesties om verder te komen?',
    
    // Productivity Suite
    'productivity.title': 'Productiviteit Suite',
    'productivity.subtitle': 'Productiviteit Suite: Afgestemd op je unieke Ziel Blauwdruk',
    'productivity.focusTimer': 'Focus Timer',
    'productivity.habits': 'Gewoontes',
    'productivity.goals': 'Doelen',
    'productivity.planning': 'Planning',
    'productivity.loading': 'Je gepersonaliseerde focus timer laden...',
    'productivity.description1': 'Focus timer past zich aan je cognitieve patronen aan',
    'productivity.description2': 'Gewoontes afgestemd op je energiecycli',
    'productivity.description3': 'Doelen geformuleerd rond je natuurlijke sterke punten',
    
    // Menu Options
    'menu.status': 'Status',
    'menu.delete': 'Verwijderen',
    
    // Pomodoro Timer
    'pomodoro.breakTime': 'Pauze Tijd',
    'pomodoro.focusTimer': 'Focus Timer',
    'pomodoro.pomodorosCompleted': 'Pomodoro\'s voltooid vandaag',
    'pomodoro.standardRhythm': 'Standaard 25/5 Pomodoro ritme',
    'pomodoro.deepFocusRhythm': 'Uitgebreide focus voor diep werk (40/5)',
    'pomodoro.quickBurstsRhythm': 'Snelle uitbarstingen voor verbeterde aandacht (15/5)',
    'pomodoro.breakFinished': 'Pauze afgelopen!',
    'pomodoro.timeToFocus': 'Tijd om te focussen op je taak.',
    'pomodoro.pomodoroCompleted': 'Pomodoro voltooid!',
    'pomodoro.takeBreak': 'Neem een korte pauze.',
    
    // Habit Tracker
    'habits.title': 'Gewoontetracker',
    'habits.addPlaceholder': 'Voeg een nieuwe gewoonte toe...',
    'habits.noHabits': 'Nog geen gewoontes toegevoegd. Voeg er een toe om te beginnen!',
    'habits.alignedWithBlueprint': 'Afgestemd op je blauwdruk',
    'habits.created': 'Gewoonte aangemaakt',
    'habits.createdDescription': '{{name}} toegevoegd aan je gewoontetracker.',
    'habits.suggestedAdded': 'Voorgestelde gewoonte toegevoegd',
    'habits.suggestedAddedDescription': '{{name}} toegevoegd aan je gewoontetracker.',
    'habits.deleted': 'Gewoonte verwijderd',
    'habits.deletedDescription': 'De gewoonte is verwijderd uit je tracker.',
    'habits.daysSingular': 'dag',
    'habits.daysPlural': 'dagen',
    
    // Goal Setting
    'goals.smartGoals': 'SMART Doelen',
    'goals.addGoal': 'Doel Toevoegen',
    'goals.cancel': 'Annuleren',
    'goals.goalTitle': 'Doeltitel',
    'goals.goalTitlePlaceholder': 'Wat wil je bereiken?',
    'goals.description': 'Beschrijving',
    'goals.descriptionPlaceholder': 'Wees specifiek over hoe succes eruit ziet',
    'goals.category': 'Categorie',
    'goals.selectCategory': 'Selecteer een categorie',
    'goals.targetDate': 'Streefdatum',
    'goals.milestones': 'Mijlpalen',
    'goals.addMilestone': 'Voeg een mijlpaal toe',
    'goals.createGoal': 'Doel Aanmaken',
    'goals.noGoals': 'Nog geen doelen toegevoegd. Voeg je eerste SMART doel toe om te beginnen!',
    'goals.progress': 'Voortgang',
    'goals.milestonesTitle': 'Mijlpalen',
    'goals.noMilestones': 'Nog geen mijlpalen toegevoegd.',
    'goals.noDeadline': 'Geen deadline',
    'goals.created': 'Doel aangemaakt',
    'goals.createdDescription': 'Nieuw SMART doel is toegevoegd.',
    'goals.deleted': 'Doel verwijderd',
    'goals.deletedDescription': 'Het doel is verwijderd.',
    
    // Goal Categories
    'goals.categoryPersonal': 'Persoonlijke Groei',
    'goals.categoryCareer': 'Carrière & Werk',
    'goals.categoryHealth': 'Gezondheid & Welzijn',
    'goals.categoryRelationships': 'Relaties',
    'goals.categorySpiritual': 'Spirituele Groei',
    'goals.categoryFinancial': 'Financieel',
    'goals.categoryCreative': 'Creatieve Projecten',
    
    // Profile Page
    'profile.stats': 'Statistieken',
    'profile.goals': 'Doelen',
    'profile.settings': 'Instellingen',
    'profile.growthJourney': 'Je Groeireis',
    'profile.blueprintCompletion': 'Blauwdruk Voltooiing',
    'profile.activeGoals': 'Actieve Doelen',
    'profile.tasksCompleted': 'Voltooide Taken',
    'profile.coachConversations': 'Coach Gesprekken',
    'profile.weeklyInsights': 'Wekelijkse Inzichten',
    'profile.mostProductiveDay': 'Meest Productieve Dag',
    'profile.energyPeaks': 'Energie Pieken',
    'profile.focusSessions': 'Focus Sessies',
    'profile.thisWeek': 'deze week',
    'profile.aligned': 'Afgestemd',
    'profile.wednesday': 'Woensdag',
    'profile.morningPeaks': 'Ochtend: 9-11u',
    'profile.noGoals': 'Geen doelen gevonden',
    'profile.createFirstGoal': 'Begin door je eerste doel aan te maken om je voortgang te volgen',
    'profile.viewAllGoals': 'Bekijk Alle Doelen',
    'profile.appSettings': 'App Instellingen',
    'profile.notifications': 'Meldingen',
    'profile.darkMode': 'Donkere Modus',
    'profile.accountSettings': 'Account Instellingen',
    'profile.accountSettingsTooltip': 'Configureer je account voorkeuren',
    'profile.logoutSuccess': 'Je bent succesvol uitgelogd.',
    'profile.logoutError': 'Uitloggen mislukt. Probeer opnieuw.',
    'profile.darkModeEnabled': 'Donkere modus ingeschakeld',
    'profile.lightModeEnabled': 'Lichte modus ingeschakeld',
    'profile.darkModeDescription': 'Overgeschakeld naar donker thema',
    'profile.lightModeDescription': 'Overgeschakeld naar licht thema',
    'profile.taskCompleted': 'Taak voltooid!',
    'profile.taskCompletedDescription': 'Goed gedaan met het voltooien van je taak.',
    'profile.errorLoading': 'Fout bij laden profiel',
    'profile.progress': 'Voortgang',
    'profile.complete': 'Voltoien',
    'profile.onTrack': 'Op koers',
    'profile.status.completed': 'Voltooid',
    'profile.status.paused': 'Gepauzeerd',
    'profile.status.active': 'Actief',
    'profile.focusMode': 'Focus Modus',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem('language');
    return (stored as Language) || 'en';
  });

  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  const t = (key: string, params?: Record<string, string>): string => {
    let translation = translations[language][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(`{{${param}}}`, value);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export default LanguageProvider;
