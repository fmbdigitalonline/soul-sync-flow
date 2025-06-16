
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const translations = {
  en: {
    // Navigation
    'nav.home': 'Home',
    'nav.blueprint': 'Blueprint',
    'nav.coach': 'Coach',
    'nav.tasks': 'Tasks',
    'nav.dreams': 'Dreams',
    'nav.growth': 'Growth',
    'nav.profile': 'Profile',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Language
    'language.english': 'English',
    'language.dutch': 'Dutch',
    
    // Auth
    'auth.signIn': 'Sign In',
    'auth.signUp': 'Sign Up',
    'auth.signOut': 'Sign Out',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirmPassword': 'Confirm Password',
    'auth.forgotPassword': 'Forgot Password?',
    'auth.noAccount': "Don't have an account?",
    'auth.hasAccount': 'Already have an account?',
    'auth.signInRequired': 'Please sign in to access this feature',
    'auth.loading': 'Loading...',
    'auth.error': 'Authentication error',
    'auth.success': 'Success!',
    
    // Common
    'save': 'Save',
    'cancel': 'Cancel',
    'delete': 'Delete',
    'edit': 'Edit',
    'close': 'Close',
    'confirm': 'Confirm',
    'back': 'Back',
    'next': 'Next',
    'previous': 'Previous',
    'continue': 'Continue',
    'finish': 'Finish',
    'start': 'Start',
    'stop': 'Stop',
    'pause': 'Pause',
    'resume': 'Resume',
    'complete': 'Complete',
    'incomplete': 'Incomplete',
    'loading': 'Loading...',
    'error': 'Error',
    'success': 'Success',
    'warning': 'Warning',
    'info': 'Info',
    'yes': 'Yes',
    'no': 'No',
    'ok': 'OK',
    'retry': 'Retry',
    'refresh': 'Refresh',
    'search': 'Search',
    'filter': 'Filter',
    'sort': 'Sort',
    'view': 'View',
    'add': 'Add',
    'remove': 'Remove',
    'update': 'Update',
    'create': 'Create',
    'new': 'New',
    'all': 'All',
    'none': 'None',
    'select': 'Select',
    'deselect': 'Deselect',
    'enable': 'Enable',
    'disable': 'Disable',
    'show': 'Show',
    'hide': 'Hide',
    'more': 'More',
    'less': 'Less',
    'today': 'Today',
    'yesterday': 'Yesterday',
    'tomorrow': 'Tomorrow',
    'week': 'Week',
    'month': 'Month',
    'year': 'Year',
    'you': 'You',
    'me': 'Me',
    'streaming': 'Streaming',
    'insight': 'Insight',
    
    // Growth & Spiritual Growth
    'growth.title': 'Growth Mode',
    'growth.headerSubtitle': 'Inner reflection & soul wisdom',
    'growth.exploringArea': 'Exploring {area}',
    'growth.positionLabel': 'Position:',
    'growth.conversationMessages': 'conversation messages',
    'growth.chooseYourTool': 'Choose Your Tool',
    'growth.chooseYourToolDescription': 'Select a tool above to begin your inner journey of growth and reflection.',
    'growth.startSoulCheckIn': 'Start Soul Check-In',
    
    // Growth Tools
    'growth.tools.soulGuide': 'Soul Guide',
    'growth.tools.moodTracker': 'Mood Tracker',
    'growth.tools.reflectionPrompts': 'Reflection Prompts',
    'growth.tools.insightJournal': 'Insight Journal',
    'growth.tools.weeklyInsights': 'Weekly Insights',
    'growth.tools.freeChat': 'Free Chat',
    
    // Life Areas
    'lifeAreas.relationships': 'Relationships',
    'lifeAreas.career': 'Career & Purpose',
    'lifeAreas.health': 'Health & Wellness',
    'lifeAreas.spirituality': 'Spirituality',
    'lifeAreas.creativity': 'Creativity',
    'lifeAreas.finances': 'Finances',
    'lifeAreas.personal': 'Personal Growth',
    'lifeAreas.adventure': 'Adventure & Fun',
    
    // Coach
    'coach.soulCoach': 'Soul Coach',
    'coach.soulGuide': 'Soul Guide',
    'coach.newConversation': 'New Conversation',
    'coach.signInRequired': 'Please sign in to access your personal AI coach',
    'coach.inputPlaceholder': 'Share your thoughts, challenges, or dreams...',
    'coach.poweredBy': 'Powered by advanced AI with your personal blueprint',
    'coach.ready': 'Ready to Begin',
    'coach.readyDescription': 'Your coach is ready to help you achieve your goals with personalized guidance.',
    'coach.quickStart': 'Quick Start Options:',
    'coach.analyzing': 'Analyzing...',
    'coach.preparingPlan': 'Preparing your personalized plan...',
    'coach.fallbackTimeout': 'Taking longer than expected. Your coach is working on something special.',
    'coach.taskSession': 'Task Session',
    'coach.defaultDuration': '~30 mins',
    'coach.motivation.default': 'You\'ve got this! Every step forward is progress.',
    'coach.cta.default': 'Take action now and make progress!',
    
    // Quick Actions
    'quickAction.breakDownGoal': 'Break down my goal into steps',
    'quickAction.createRoutine': 'Create a daily routine',
    'quickAction.setupAccountability': 'Set up accountability system',
    'quickAction.planWeek': 'Plan my week strategically',
    
    // Mood Tracker
    'moodTracker.title': 'Track Your Current State',
    'moodTracker.emotionalState': 'Emotional state:',
    'moodTracker.energyLevel': 'Energy level:',
    'moodTracker.joyful': 'Joyful',
    'moodTracker.content': 'Content',
    'moodTracker.neutral': 'Neutral',
    'moodTracker.reflective': 'Reflective',
    'moodTracker.challenged': 'Challenged',
    'moodTracker.high': 'High',
    'moodTracker.steady': 'Steady',
    'moodTracker.low': 'Low',
    'moodTracker.saveToPatterns': 'Save to Patterns',
    'moodTracker.moodTracked': 'Mood Tracked',
    'moodTracker.moodSaved': 'with {energy} energy saved!',
    'moodTracker.patternsHelp': 'Tracking patterns helps your coach provide better guidance.',
    
    // Reflection Prompts
    'reflectionPrompts.title': 'Reflection Prompts',
    'reflectionPrompts.description': 'Deep questions to explore your inner wisdom and growth patterns.',
    'reflectionPrompts.currentPrompt': 'Current Prompt:',
    'reflectionPrompts.yourResponse': 'Your Response:',
    'reflectionPrompts.responsePlaceholder': 'Take your time to reflect deeply...',
    'reflectionPrompts.saveReflection': 'Save Reflection',
    'reflectionPrompts.newPrompt': 'New Prompt',
    'reflectionPrompts.reflectionSaved': 'Reflection Saved',
    'reflectionPrompts.prompts.values': 'What values are most important to you right now, and how are you honoring them?',
    'reflectionPrompts.prompts.growth': 'What is one area where you feel called to grow, and what small step could you take today?',
    'reflectionPrompts.prompts.gratitude': 'What are you most grateful for in this moment, and how does it shape your perspective?',
    'reflectionPrompts.prompts.challenge': 'What challenge are you facing that might actually be an opportunity in disguise?',
    'reflectionPrompts.prompts.purpose': 'When do you feel most aligned with your true purpose?',
    'reflectionPrompts.prompts.relationships': 'How are your relationships reflecting your inner state back to you?',
    'reflectionPrompts.prompts.intuition': 'What is your intuition trying to tell you that your logical mind might be resisting?',
    'reflectionPrompts.prompts.fear': 'What would you do if you knew you could not fail?',
    
    // Insight Journal
    'insightJournal.title': 'Insight Journal',
    'insightJournal.description': 'Capture and explore your personal insights, realizations, and wisdom.',
    'insightJournal.newInsight': 'New Insight',
    'insightJournal.insightPlaceholder': 'What insight or realization would you like to capture?',
    'insightJournal.addTags': 'Add tags (optional)',
    'insightJournal.tagsPlaceholder': 'growth, relationships, career...',
    'insightJournal.saveInsight': 'Save Insight',
    'insightJournal.recentInsights': 'Recent Insights',
    'insightJournal.noInsights': 'No insights yet',
    'insightJournal.noInsightsDescription': 'Start capturing your realizations and wisdom as they come to you.',
    'insightJournal.insightSaved': 'Insight Saved',
    
    // Weekly Insights
    'weeklyInsights.title': 'Weekly Insights',
    'weeklyInsights.description': 'Patterns and insights from your journey this week.',
    'weeklyInsights.thisWeek': 'This Week',
    'weeklyInsights.moodPatterns': 'Mood Patterns',
    'weeklyInsights.reflectionThemes': 'Reflection Themes',
    'weeklyInsights.keyInsights': 'Key Insights',
    'weeklyInsights.growthAreas': 'Growth Areas',
    'weeklyInsights.noData': 'Not enough data yet',
    'weeklyInsights.noDataDescription': 'Keep using the tools throughout the week to see your patterns emerge.',
    
    // Guide Interface
    'guide.innerCompass': 'Inner Compass',
    'guide.reflectionMode': 'Reflection Mode',
    'guide.checkIn': 'Check In',
    'guide.reflect': 'Reflect',
    'guide.journal': 'Journal',
    'guide.description': 'Your personal guide for soul-level conversations and deep insights.',
    'guide.awaits': 'Your Guide Awaits',
    'guide.awaitsDescription': 'Share what\'s on your heart and mind. Your guide is here to listen and offer wisdom.',
    'guide.inputPlaceholder': 'What\'s stirring in your soul today?',
    'guide.reflecting': 'Reflecting on your words...',
    'guide.poweredBy': 'Powered by intuitive AI with deep wisdom',
    'guide.exploreDeeper': 'Explore Deeper',
    'guide.blueprintLink': 'Blueprint Link',
    'guide.tellMore': 'Tell me more about this insight and how it connects to my deeper patterns.',
    'guide.howConnect': 'How does this connect to my soul blueprint and life purpose?',
    
    // Task/Modal
    'modal.readyToBegin': 'Ready to Begin?',
    'modal.sessionDuration': 'Session Duration: {duration}',
    'modal.coachGuide': 'Your coach will guide you through each step.',
    'modal.readyToFocus': 'Ready to focus and make progress?',
    'modal.letsGo': 'Let\'s Go!',
    
    // Habits
    'habits.streak': '{count} {unit} streak',
    'habits.daysSingular': 'day',
    'habits.daysPlural': 'days',
    'habits.frequency': 'Daily',
    'habits.doubleTapDetails': 'Double-tap for details',
    
    // General New Messages
    'newConversationStarted': 'New conversation started with {agent}',
    
    // Journey Engine
    'journey.yourPath': 'Your Path in {area}',
    'journey.currentPosition': 'Current Position: {position}',
    'journey.nextMilestone': 'Next Milestone: {milestone}',
    'journey.progress': 'Progress: {progress}%',
    'journey.startJourney': 'Start Your Journey',
    'journey.continueJourney': 'Continue Journey',
    'journey.exploreArea': 'Explore This Area',
    'journey.backToAreas': 'Back to Life Areas',
    
    // Blueprint
    'blueprint.title': 'Soul Blueprint',
    'blueprint.generate': 'Generate Blueprint',
    'blueprint.regenerate': 'Regenerate Blueprint',
    'blueprint.loading': 'Generating your blueprint...',
    'blueprint.error': 'Error generating blueprint',
    'blueprint.birthData': 'Birth Data',
    'blueprint.personality': 'Personality',
    'blueprint.humanDesign': 'Human Design',
    'blueprint.astrology': 'Astrology',
    
    // Tasks
    'tasks.title': 'Tasks',
    'tasks.new': 'New Task',
    'tasks.edit': 'Edit Task',
    'tasks.delete': 'Delete Task',
    'tasks.complete': 'Complete Task',
    'tasks.incomplete': 'Mark Incomplete',
    'tasks.priority': 'Priority',
    'tasks.dueDate': 'Due Date',
    'tasks.description': 'Description',
    'tasks.status': 'Status',
    'tasks.assignee': 'Assignee',
    'tasks.created': 'Created',
    'tasks.updated': 'Updated',
    
    // Dreams
    'dreams.title': 'Dreams',
    'dreams.new': 'New Dream',
    'dreams.edit': 'Edit Dream',
    'dreams.delete': 'Delete Dream',
    'dreams.description': 'Description',
    'dreams.vision': 'Vision',
    'dreams.goals': 'Goals',
    'dreams.timeline': 'Timeline',
    'dreams.progress': 'Progress',
    
    // Profile
    'profile.title': 'Profile',
    'profile.edit': 'Edit Profile',
    'profile.save': 'Save Profile',
    'profile.name': 'Name',
    'profile.email': 'Email',
    'profile.bio': 'Bio',
    'profile.location': 'Location',
    'profile.website': 'Website',
    'profile.social': 'Social Links',
    
    // Errors
    'error.general': 'Something went wrong',
    'error.network': 'Network error',
    'error.notFound': 'Not found',
    'error.unauthorized': 'Unauthorized',
    'error.forbidden': 'Forbidden',
    'error.serverError': 'Server error',
    'error.tryAgain': 'Please try again',
    'error.contactSupport': 'Contact support if the problem persists',
  },
  nl: {
    // Navigation
    'nav.home': 'Home',
    'nav.blueprint': 'Blauwdruk',
    'nav.coach': 'Coach',
    'nav.tasks': 'Taken',
    'nav.dreams': 'Dromen',
    'nav.growth': 'Groei',
    'nav.profile': 'Profiel',
    'nav.signIn': 'Inloggen',
    'nav.signOut': 'Uitloggen',
    
    // Language
    'language.english': 'Engels',
    'language.dutch': 'Nederlands',
    
    // Auth
    'auth.signIn': 'Inloggen',
    'auth.signUp': 'Registreren',
    'auth.signOut': 'Uitloggen',
    'auth.email': 'E-mail',
    'auth.password': 'Wachtwoord',
    'auth.confirmPassword': 'Bevestig Wachtwoord',
    'auth.forgotPassword': 'Wachtwoord vergeten?',
    'auth.noAccount': 'Geen account?',
    'auth.hasAccount': 'Al een account?',
    'auth.signInRequired': 'Log in om toegang te krijgen tot deze functie',
    'auth.loading': 'Laden...',
    'auth.error': 'Authenticatiefout',
    'auth.success': 'Succes!',
    
    // Common
    'save': 'Opslaan',
    'cancel': 'Annuleren',
    'delete': 'Verwijderen',
    'edit': 'Bewerken',
    'close': 'Sluiten',
    'confirm': 'Bevestigen',
    'back': 'Terug',
    'next': 'Volgende',
    'previous': 'Vorige',
    'continue': 'Doorgaan',
    'finish': 'Voltooien',
    'start': 'Starten',
    'stop': 'Stoppen',
    'pause': 'Pauzeren',
    'resume': 'Hervatten',
    'complete': 'Voltooien',
    'incomplete': 'Onvolledig',
    'loading': 'Laden...',
    'error': 'Fout',
    'success': 'Succes',
    'warning': 'Waarschuwing',
    'info': 'Info',
    'yes': 'Ja',
    'no': 'Nee',
    'ok': 'OK',
    'retry': 'Opnieuw proberen',
    'refresh': 'Vernieuwen',
    'search': 'Zoeken',
    'filter': 'Filteren',
    'sort': 'Sorteren',
    'view': 'Bekijken',
    'add': 'Toevoegen',
    'remove': 'Verwijderen',
    'update': 'Bijwerken',
    'create': 'Aanmaken',
    'new': 'Nieuw',
    'all': 'Alle',
    'none': 'Geen',
    'select': 'Selecteren',
    'deselect': 'Deselecteren',
    'enable': 'Inschakelen',
    'disable': 'Uitschakelen',
    'show': 'Tonen',
    'hide': 'Verbergen',
    'more': 'Meer',
    'less': 'Minder',
    'today': 'Vandaag',
    'yesterday': 'Gisteren',
    'tomorrow': 'Morgen',
    'week': 'Week',
    'month': 'Maand',
    'year': 'Jaar',
    'you': 'Jij',
    'me': 'Ik',
    'streaming': 'Streaming',
    'insight': 'Inzicht',
    
    // Growth & Spiritual Growth
    'growth.title': 'Groei Modus',
    'growth.headerSubtitle': 'Innerlijke reflectie & zielwijsheid',
    'growth.exploringArea': '{area} verkennen',
    'growth.positionLabel': 'Positie:',
    'growth.conversationMessages': 'gesprekberichten',
    'growth.chooseYourTool': 'Kies Je Tool',
    'growth.chooseYourToolDescription': 'Selecteer hierboven een tool om je innerlijke reis van groei en reflectie te beginnen.',
    'growth.startSoulCheckIn': 'Begin Ziel Check-In',
    
    // Growth Tools
    'growth.tools.soulGuide': 'Ziel Gids',
    'growth.tools.moodTracker': 'Stemmingsmeter',
    'growth.tools.reflectionPrompts': 'Reflectievragen',
    'growth.tools.insightJournal': 'Inzichtenjournal',
    'growth.tools.weeklyInsights': 'Wekelijkse Inzichten',
    'growth.tools.freeChat': 'Vrije Chat',
    
    // Life Areas
    'lifeAreas.relationships': 'Relaties',
    'lifeAreas.career': 'Carrière & Doel',
    'lifeAreas.health': 'Gezondheid & Welzijn',
    'lifeAreas.spirituality': 'Spiritualiteit',
    'lifeAreas.creativity': 'Creativiteit',
    'lifeAreas.finances': 'Financiën',
    'lifeAreas.personal': 'Persoonlijke Groei',
    'lifeAreas.adventure': 'Avontuur & Plezier',
    
    // Coach
    'coach.soulCoach': 'Ziel Coach',
    'coach.soulGuide': 'Ziel Gids',
    'coach.newConversation': 'Nieuw Gesprek',
    'coach.signInRequired': 'Log in om toegang te krijgen tot je persoonlijke AI coach',
    'coach.inputPlaceholder': 'Deel je gedachten, uitdagingen of dromen...',
    'coach.poweredBy': 'Aangedreven door geavanceerde AI met jouw persoonlijke blauwdruk',
    'coach.ready': 'Klaar om te Beginnen',
    'coach.readyDescription': 'Je coach is klaar om je te helpen je doelen te bereiken met persoonlijke begeleiding.',
    'coach.quickStart': 'Snelstart Opties:',
    'coach.analyzing': 'Analyseren...',
    'coach.preparingPlan': 'Je gepersonaliseerde plan voorbereiden...',
    'coach.fallbackTimeout': 'Duurt langer dan verwacht. Je coach werkt aan iets speciaals.',
    'coach.taskSession': 'Taak Sessie',
    'coach.defaultDuration': '~30 min',
    'coach.motivation.default': 'Je kunt dit! Elke stap vooruit is vooruitgang.',
    'coach.cta.default': 'Onderneem nu actie en maak vooruitgang!',
    
    // Quick Actions
    'quickAction.breakDownGoal': 'Mijn doel opdelen in stappen',
    'quickAction.createRoutine': 'Een dagelijkse routine maken',
    'quickAction.setupAccountability': 'Verantwoordelijkheidssysteem opzetten',
    'quickAction.planWeek': 'Mijn week strategisch plannen',
    
    // Mood Tracker
    'moodTracker.title': 'Volg Je Huidige Status',
    'moodTracker.emotionalState': 'Emotionele status:',
    'moodTracker.energyLevel': 'Energieniveau:',
    'moodTracker.joyful': 'Vrolijk',
    'moodTracker.content': 'Tevreden',
    'moodTracker.neutral': 'Neutraal',
    'moodTracker.reflective': 'Reflectief',
    'moodTracker.challenged': 'Uitgedaagd',
    'moodTracker.high': 'Hoog',
    'moodTracker.steady': 'Stabiel',
    'moodTracker.low': 'Laag',
    'moodTracker.saveToPatterns': 'Opslaan in Patronen',
    'moodTracker.moodTracked': 'Stemming Bijgehouden',
    'moodTracker.moodSaved': 'met {energy} energie opgeslagen!',
    'moodTracker.patternsHelp': 'Patronen bijhouden helpt je coach betere begeleiding te bieden.',
    
    // Reflection Prompts
    'reflectionPrompts.title': 'Reflectievragen',
    'reflectionPrompts.description': 'Diepe vragen om je innerlijke wijsheid en groeipatronen te verkennen.',
    'reflectionPrompts.currentPrompt': 'Huidige Vraag:',
    'reflectionPrompts.yourResponse': 'Jouw Antwoord:',
    'reflectionPrompts.responsePlaceholder': 'Neem je tijd om diep na te denken...',
    'reflectionPrompts.saveReflection': 'Reflectie Opslaan',
    'reflectionPrompts.newPrompt': 'Nieuwe Vraag',
    'reflectionPrompts.reflectionSaved': 'Reflectie Opgeslagen',
    'reflectionPrompts.prompts.values': 'Welke waarden zijn op dit moment het belangrijkst voor je, en hoe eer je ze?',
    'reflectionPrompts.prompts.growth': 'Wat is een gebied waar je je geroepen voelt om te groeien, en welke kleine stap zou je vandaag kunnen zetten?',
    'reflectionPrompts.prompts.gratitude': 'Waar ben je op dit moment het meest dankbaar voor, en hoe vormt dat je perspectief?',
    'reflectionPrompts.prompts.challenge': 'Welke uitdaging sta je voor die eigenlijk een vermomde kans zou kunnen zijn?',
    'reflectionPrompts.prompts.purpose': 'Wanneer voel je je het meest in lijn met je ware doel?',
    'reflectionPrompts.prompts.relationships': 'Hoe weerspiegelen je relaties je innerlijke staat naar je terug?',
    'reflectionPrompts.prompts.intuition': 'Wat probeert je intuïtie je te vertellen waar je logische geest weerstand tegen zou kunnen hebben?',
    'reflectionPrompts.prompts.fear': 'Wat zou je doen als je wist dat je niet kon falen?',
    
    // Insight Journal
    'insightJournal.title': 'Inzichtenjournal',
    'insightJournal.description': 'Leg je persoonlijke inzichten, realisaties en wijsheid vast en verken ze.',
    'insightJournal.newInsight': 'Nieuw Inzicht',
    'insightJournal.insightPlaceholder': 'Welk inzicht of realisatie wil je vastleggen?',
    'insightJournal.addTags': 'Tags toevoegen (optioneel)',
    'insightJournal.tagsPlaceholder': 'groei, relaties, carrière...',
    'insightJournal.saveInsight': 'Inzicht Opslaan',
    'insightJournal.recentInsights': 'Recente Inzichten',
    'insightJournal.noInsights': 'Nog geen inzichten',
    'insightJournal.noInsightsDescription': 'Begin met het vastleggen van je realisaties en wijsheid zoals ze bij je opkomen.',
    'insightJournal.insightSaved': 'Inzicht Opgeslagen',
    
    // Weekly Insights
    'weeklyInsights.title': 'Wekelijkse Inzichten',
    'weeklyInsights.description': 'Patronen en inzichten van je reis deze week.',
    'weeklyInsights.thisWeek': 'Deze Week',
    'weeklyInsights.moodPatterns': 'Stemmingspatronen',
    'weeklyInsights.reflectionThemes': 'Reflectiethema\'s',
    'weeklyInsights.keyInsights': 'Belangrijke Inzichten',
    'weeklyInsights.growthAreas': 'Groeigebieden',
    'weeklyInsights.noData': 'Nog niet genoeg gegevens',
    'weeklyInsights.noDataDescription': 'Blijf de tools gebruiken gedurende de week om je patronen te zien ontstaan.',
    
    // Guide Interface
    'guide.innerCompass': 'Innerlijk Kompas',
    'guide.reflectionMode': 'Reflectiemodus',
    'guide.checkIn': 'Check In',
    'guide.reflect': 'Reflecteren',
    'guide.journal': 'Journaal',
    'guide.description': 'Je persoonlijke gids voor gesprekken op zielniveau en diepe inzichten.',
    'guide.awaits': 'Je Gids Wacht',
    'guide.awaitsDescription': 'Deel wat er in je hart en geest speelt. Je gids is hier om te luisteren en wijsheid te bieden.',
    'guide.inputPlaceholder': 'Wat roert er vandaag in je ziel?',
    'guide.reflecting': 'Reflecterend op je woorden...',
    'guide.poweredBy': 'Aangedreven door intuïtieve AI met diepe wijsheid',
    'guide.exploreDeeper': 'Verken Dieper',
    'guide.blueprintLink': 'Blauwdruk Link',
    'guide.tellMore': 'Vertel me meer over dit inzicht en hoe het verbindt met mijn diepere patronen.',
    'guide.howConnect': 'Hoe verbindt dit met mijn zielblauwdruk en levensdoel?',
    
    // Task/Modal
    'modal.readyToBegin': 'Klaar om te Beginnen?',
    'modal.sessionDuration': 'Sessieduur: {duration}',
    'modal.coachGuide': 'Je coach begeleidt je door elke stap.',
    'modal.readyToFocus': 'Klaar om te focussen en vooruitgang te maken?',
    'modal.letsGo': 'Laten we gaan!',
    
    // Habits
    'habits.streak': '{count} {unit} reeks',
    'habits.daysSingular': 'dag',
    'habits.daysPlural': 'dagen',
    'habits.frequency': 'Dagelijks',
    'habits.doubleTapDetails': 'Dubbeltik voor details',
    
    // General New Messages
    'newConversationStarted': 'Nieuw gesprek gestart met {agent}',
    
    // Journey Engine
    'journey.yourPath': 'Jouw Pad in {area}',
    'journey.currentPosition': 'Huidige Positie: {position}',
    'journey.nextMilestone': 'Volgende Mijlpaal: {milestone}',
    'journey.progress': 'Voortgang: {progress}%',
    'journey.startJourney': 'Begin Je Reis',
    'journey.continueJourney': 'Reis Voortzetten',
    'journey.exploreArea': 'Verken Dit Gebied',
    'journey.backToAreas': 'Terug naar Levensgebieden',
    
    // Blueprint
    'blueprint.title': 'Ziel Blauwdruk',
    'blueprint.generate': 'Blauwdruk Genereren',
    'blueprint.regenerate': 'Blauwdruk Regenereren',
    'blueprint.loading': 'Je blauwdruk genereren...',
    'blueprint.error': 'Fout bij genereren blauwdruk',
    'blueprint.birthData': 'Geboortegegevens',
    'blueprint.personality': 'Persoonlijkheid',
    'blueprint.humanDesign': 'Human Design',
    'blueprint.astrology': 'Astrologie',
    
    // Tasks
    'tasks.title': 'Taken',
    'tasks.new': 'Nieuwe Taak',
    'tasks.edit': 'Taak Bewerken',
    'tasks.delete': 'Taak Verwijderen',
    'tasks.complete': 'Taak Voltooien',
    'tasks.incomplete': 'Markeer als Onvolledig',
    'tasks.priority': 'Prioriteit',
    'tasks.dueDate': 'Vervaldatum',
    'tasks.description': 'Beschrijving',
    'tasks.status': 'Status',
    'tasks.assignee': 'Toegewezen aan',
    'tasks.created': 'Aangemaakt',
    'tasks.updated': 'Bijgewerkt',
    
    // Dreams
    'dreams.title': 'Dromen',
    'dreams.new': 'Nieuwe Droom',
    'dreams.edit': 'Droom Bewerken',
    'dreams.delete': 'Droom Verwijderen',
    'dreams.description': 'Beschrijving',
    'dreams.vision': 'Visie',
    'dreams.goals': 'Doelen',
    'dreams.timeline': 'Tijdlijn',
    'dreams.progress': 'Voortgang',
    
    // Profile
    'profile.title': 'Profiel',
    'profile.edit': 'Profiel Bewerken',
    'profile.save': 'Profiel Opslaan',
    'profile.name': 'Naam',
    'profile.email': 'E-mail',
    'profile.bio': 'Bio',
    'profile.location': 'Locatie',
    'profile.website': 'Website',
    'profile.social': 'Sociale Links',
    
    // Errors
    'error.general': 'Er is iets misgegaan',
    'error.network': 'Netwerkfout',
    'error.notFound': 'Niet gevonden',
    'error.unauthorized': 'Niet geautoriseerd',
    'error.forbidden': 'Verboden',
    'error.serverError': 'Serverfout',
    'error.tryAgain': 'Probeer het opnieuw',
    'error.contactSupport': 'Neem contact op met support als het probleem aanhoudt',
  }
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  useEffect(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    if (savedLanguage && ['en', 'nl'].includes(savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string, params?: Record<string, string>): string => {
    console.log(`[i18n] language: ${language}, key: ${key}, translation: ${translations[language][key] || key}`);
    let translation = translations[language][key] || translations['en'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(new RegExp(`\\{${paramKey}\\}`, 'g'), paramValue);
      });
    }
    
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
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
