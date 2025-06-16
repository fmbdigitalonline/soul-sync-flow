import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
  en: {
    // Common
    you: 'You',
    streaming: 'Streaming',
    insight: 'Insight',
    save: 'Save',
    back: 'Back',
    
    // Navigation
    'nav.home': 'Home',
    'nav.growth': 'Growth',
    'nav.coach': 'Coach',
    'nav.signIn': 'Sign In',
    'nav.signOut': 'Sign Out',
    
    // Language
    'language.english': 'English',
    'language.dutch': 'Dutch',
    
    // Auth
    'coach.signInRequired': 'Please sign in to access your personal AI coach and growth tools.',
    
    // Coach
    'coach.soulGuide': 'Soul Guide',
    'coach.newConversation': 'New Conversation',
    'newConversationStarted': 'New conversation started with {{agent}}',
    
    // Growth
    'growth.title': 'Growth Mode',
    'growth.headerSubtitle': 'Inner reflection & soul wisdom',
    'growth.positionLabel': 'Position:',
    'growth.conversationMessages': 'conversation messages',
    'growth.chooseYourTool': 'Choose Your Soul Tool',
    'growth.chooseYourToolDescription': 'Select from the tools above to begin your inner journey.',
    'growth.startSoulCheckIn': 'Start Soul Check-in',
    'growth.exploringArea': 'Exploring {{area}}',
    
    // Growth Tools
    'growth.tools.soulGuide': 'Soul Guide',
    'growth.tools.moodTracker': 'Mood Tracker',
    'growth.tools.reflectionPrompts': 'Reflection Prompts',
    'growth.tools.insightJournal': 'Insight Journal',
    'growth.tools.weeklyInsights': 'Weekly Insights',
    'growth.tools.freeChat': 'Free Chat',
    
    // Life Areas
    'lifeArea.selector.title': 'Choose Your Life Area',
    'lifeArea.selector.subtitle': 'Select an area of life to explore and grow',
    'lifeArea.home.name': 'Home',
    'lifeArea.home.description': 'Family, living space, domestic harmony',
    'lifeArea.career.name': 'Career',
    'lifeArea.career.description': 'Purpose, professional growth, impact',
    'lifeArea.finances.name': 'Finances',
    'lifeArea.finances.description': 'Abundance, security, money mindset',
    'lifeArea.relationships.name': 'Relationships',
    'lifeArea.relationships.description': 'Love, friendship, community connection',
    'lifeArea.wellbeing.name': 'Wellbeing',
    'lifeArea.wellbeing.description': 'Health, energy, mental clarity',
    'lifeArea.creativity.name': 'Creativity',
    'lifeArea.creativity.description': 'Artistic expression, innovation, imagination',
    'lifeArea.spirituality.name': 'Spirituality',
    'lifeArea.spirituality.description': 'Soul connection, inner wisdom, sacred practices',
    
    // Mood Tracker
    'mood.title': 'Daily Mood & Energy Check-in',
    'mood.subtitle': 'Track your emotional patterns and energy levels',
    'mood.currentMood': 'How are you feeling right now?',
    'mood.energyLevel': 'What\'s your energy like?',
    'mood.saveEntry': 'Save Mood Entry',
    'mood.entrySaved': 'Mood entry saved!',
    'mood.entryDescription': 'Your mood patterns help identify emotional trends and triggers.',
    'mood.moods.joyful': 'Joyful',
    'mood.moods.peaceful': 'Peaceful',
    'mood.moods.grateful': 'Grateful',
    'mood.moods.excited': 'Excited',
    'mood.moods.neutral': 'Neutral',
    'mood.moods.tired': 'Tired',
    'mood.moods.anxious': 'Anxious',
    'mood.moods.frustrated': 'Frustrated',
    'mood.moods.sad': 'Sad',
    'mood.energy.high': 'High Energy',
    'mood.energy.steady': 'Steady Energy',
    'mood.energy.low': 'Low Energy',
    'mood.energy.depleted': 'Depleted',
    
    // MoodTracker specific
    'moodTracker.title': 'Daily Mood & Energy Check-in',
    'moodTracker.emotionalState': 'How are you feeling right now?',
    'moodTracker.energyLevel': 'What\'s your energy like?',
    'moodTracker.joyful': 'Joyful',
    'moodTracker.content': 'Content',
    'moodTracker.neutral': 'Neutral',
    'moodTracker.reflective': 'Reflective',
    'moodTracker.challenged': 'Challenged',
    'moodTracker.high': 'High Energy',
    'moodTracker.steady': 'Steady Energy',
    'moodTracker.low': 'Low Energy',
    'moodTracker.moodTracked': 'Mood tracked',
    'moodTracker.moodSaved': 'mood with {{energy}} energy saved',
    'moodTracker.saveToPatterns': 'Save to Patterns',
    'moodTracker.patternsHelp': 'Your mood patterns help identify emotional trends and triggers.',
    
    // Guide Interface
    'guide.innerCompass': 'Inner Compass',
    'guide.reflectionMode': 'Reflection Mode',
    'guide.checkIn': 'Check In',
    'guide.reflect': 'Reflect',
    'guide.journal': 'Journal',
    'guide.description': 'Your personal toolkit for deep soul exploration and authentic growth.',
    'guide.awaits': 'Your Soul Guide Awaits',
    'guide.awaitsDescription': 'Share what\'s in your heart, and let\'s explore your inner wisdom together.',
    'guide.reflecting': 'Reflecting on your soul\'s wisdom...',
    'guide.inputPlaceholder': 'Share what\'s in your heart...',
    'guide.poweredBy': 'Powered by soul wisdom & authentic guidance',
    'guide.exploreDeeper': 'Explore Deeper',
    'guide.blueprintLink': 'Blueprint Link',
    'guide.tellMore': 'Tell me more about this insight and how it connects to my personal growth.',
    'guide.howConnect': 'How does this connect to my blueprint and authentic self?',
    
    // Insight Journal
    'journal.title': 'Soul Insights Journal',
    'journal.placeholder': 'Capture your insights, realizations, or aha moments...',
    'journal.tagLabel': 'Tag this insight:',
    'journal.saveButton': 'Save to Journal',
    'journal.saved': 'Insight saved to your journal!',
    'journal.description': 'Your insights create a personal knowledge base for pattern recognition and growth tracking.',
    'journal.tags.breakthrough': 'Breakthrough',
    'journal.tags.pattern': 'Pattern',
    'journal.tags.gratitude': 'Gratitude',
    'journal.tags.challenge': 'Challenge',
    'journal.tags.growth': 'Growth',
    'journal.tags.clarity': 'Clarity',
    'journal.tags.alignment': 'Alignment',
    'journal.tags.wisdom': 'Wisdom',
    
    // Weekly Insights
    'weekly.title': 'Your Weekly Soul Insights',
    'weekly.growthScore': 'Growth Score',
    'weekly.dominantMood': 'Dominant Mood Pattern',
    'weekly.keyReflections': 'Key Reflection Areas',
    'weekly.growthThemes': 'Growth Themes',
    'weekly.observedPatterns': 'Observed Patterns',
    'weekly.patterns.awareness': 'Self-awareness increasing',
    'weekly.patterns.consistency': 'Consistency building',
    
    // Reflection Prompts
    'reflection.title': 'Reflection & Growth Tracking',
    'reflection.dailyReflection': 'Daily Reflection',
    'reflection.deepInsight': 'Deep Insight',
    'reflection.lifeDirection': 'Life Direction',
    'reflection.saveReflection': 'Save Reflection',
    'reflection.saved': 'Reflection saved to your growth patterns!',
    'reflection.description': 'Your reflections build a personal growth database for weekly insights and pattern recognition.',
    'reflection.placeholder': 'Write your thoughts and insights here...',
    'reflection.reflecting': 'Reflecting on:',
    
    // Daily Reflection Prompts
    'reflection.daily.joy': 'What brought me the most joy today?',
    'reflection.daily.challenge': 'What challenged me and what did I learn?',
    'reflection.daily.authentic': 'How did I honor my authentic self today?',
    'reflection.daily.gratitude': 'What am I grateful for right now?',
    
    // Deep Insight Prompts
    'reflection.insight.pattern': 'What pattern keeps showing up in my life?',
    'reflection.insight.soul': 'What is my soul trying to tell me?',
    'reflection.insight.comfort': 'How am I growing beyond my comfort zone?',
    'reflection.insight.blueprint': 'What does my blueprint reveal about this situation?',
    
    // Life Direction Prompts
    'reflection.direction.aligned': 'What feels most aligned with my purpose?',
    'reflection.direction.resisting': 'Where am I resisting my natural flow?',
    'reflection.direction.trust': 'What would I do if I fully trusted myself?',
    'reflection.direction.energy': 'How can I honor my authentic energy today?',
  },
  nl: {
    // Common
    you: 'Jij',
    streaming: 'Streaming',
    insight: 'Inzicht',
    save: 'Opslaan',
    back: 'Terug',
    
    // Navigation
    'nav.home': 'Home',
    'nav.growth': 'Groei',
    'nav.coach': 'Coach',
    'nav.signIn': 'Inloggen',
    'nav.signOut': 'Uitloggen',
    
    // Language
    'language.english': 'Engels',
    'language.dutch': 'Nederlands',
    
    // Auth
    'coach.signInRequired': 'Log in om toegang te krijgen tot je persoonlijke AI coach en groeitools.',
    
    // Coach
    'coach.soulGuide': 'Zielgids',
    'coach.newConversation': 'Nieuw Gesprek',
    'newConversationStarted': 'Nieuw gesprek gestart met {{agent}}',
    
    // Growth
    'growth.title': 'Groei Modus',
    'growth.headerSubtitle': 'Innerlijke reflectie & zielwijsheid',
    'growth.positionLabel': 'Positie:',
    'growth.conversationMessages': 'gesprekberichten',
    'growth.chooseYourTool': 'Kies Je Zieltool',
    'growth.chooseYourToolDescription': 'Selecteer een van de tools hierboven om je innerlijke reis te beginnen.',
    'growth.startSoulCheckIn': 'Start Ziel Check-in',
    'growth.exploringArea': '{{area}} verkennen',
    
    // Growth Tools
    'growth.tools.soulGuide': 'Ziel Gids',
    'growth.tools.moodTracker': 'Stemmingsmeter',
    'growth.tools.reflectionPrompts': 'Reflectievragen',
    'growth.tools.insightJournal': 'Inzichtenjournal',
    'growth.tools.weeklyInsights': 'Wekelijkse Inzichten',
    'growth.tools.freeChat': 'Vrije Chat',
    
    // Life Areas
    'lifeArea.selector.title': 'Kies Je Levensgebied',
    'lifeArea.selector.subtitle': 'Selecteer een levensgebied om te verkennen en te groeien',
    'lifeArea.home.name': 'Thuis',
    'lifeArea.home.description': 'Familie, woonruimte, huiselijke harmonie',
    'lifeArea.career.name': 'Carrière',
    'lifeArea.career.description': 'Doel, professionele groei, impact',
    'lifeArea.finances.name': 'Financiën',
    'lifeArea.finances.description': 'Overvloed, zekerheid, geld mindset',
    'lifeArea.relationships.name': 'Relaties',
    'lifeArea.relationships.description': 'Liefde, vriendschap, gemeenschapsverbinding',
    'lifeArea.wellbeing.name': 'Welzijn',
    'lifeArea.wellbeing.description': 'Gezondheid, energie, mentale helderheid',
    'lifeArea.creativity.name': 'Creativiteit',
    'lifeArea.creativity.description': 'Artistieke expressie, innovatie, verbeelding',
    'lifeArea.spirituality.name': 'Spiritualiteit',
    'lifeArea.spirituality.description': 'Zielverbinding, innerlijke wijsheid, heilige praktijken',
    
    // Mood Tracker
    'mood.title': 'Dagelijkse Stemming & Energie Check-in',
    'mood.subtitle': 'Volg je emotionele patronen en energieniveaus',
    'mood.currentMood': 'Hoe voel je je nu?',
    'mood.energyLevel': 'Hoe is je energie?',
    'mood.saveEntry': 'Stemming Opslaan',
    'mood.entrySaved': 'Stemming opgeslagen!',
    'mood.entryDescription': 'Je stemmingspatronen helpen emotionele trends en triggers te identificeren.',
    'mood.moods.joyful': 'Vreugdevol',
    'mood.moods.peaceful': 'Vredig',
    'mood.moods.grateful': 'Dankbaar',
    'mood.moods.excited': 'Opgewonden',
    'mood.moods.neutral': 'Neutraal',
    'mood.moods.tired': 'Moe',
    'mood.moods.anxious': 'Angstig',
    'mood.moods.frustrated': 'Gefrustreerd',
    'mood.moods.sad': 'Verdrietig',
    'mood.energy.high': 'Hoge Energie',
    'mood.energy.steady': 'Stabiele Energie',
    'mood.energy.low': 'Lage Energie',
    'mood.energy.depleted': 'Uitgeput',
    
    // MoodTracker specific
    'moodTracker.title': 'Dagelijkse Stemming & Energie Check-in',
    'moodTracker.emotionalState': 'Hoe voel je je nu?',
    'moodTracker.energyLevel': 'Hoe is je energie?',
    'moodTracker.joyful': 'Vreugdevol',
    'moodTracker.content': 'Tevreden',
    'moodTracker.neutral': 'Neutraal',
    'moodTracker.reflective': 'Nadenkend',
    'moodTracker.challenged': 'Uitgedaagd',
    'moodTracker.high': 'Hoge Energie',
    'moodTracker.steady': 'Stabiele Energie',
    'moodTracker.low': 'Lage Energie',
    'moodTracker.moodTracked': 'Stemming bijgehouden',
    'moodTracker.moodSaved': 'stemming met {{energy}} energie opgeslagen',
    'moodTracker.saveToPatterns': 'Opslaan in Patronen',
    'moodTracker.patternsHelp': 'Je stemmingspatronen helpen emotionele trends en triggers te identificeren.',
    
    // Guide Interface
    'guide.innerCompass': 'Innerlijk Kompas',
    'guide.reflectionMode': 'Reflectie Modus',
    'guide.checkIn': 'Check In',
    'guide.reflect': 'Reflecteren',
    'guide.journal': 'Journaal',
    'guide.description': 'Je persoonlijke toolkit voor diepe zielverkenning en authentieke groei.',
    'guide.awaits': 'Je Zielgids Wacht',
    'guide.awaitsDescription': 'Deel wat er in je hart leeft, en laten we samen je innerlijke wijsheid verkennen.',
    'guide.reflecting': 'Reflecteren op je zielwijsheid...',
    'guide.inputPlaceholder': 'Deel wat er in je hart leeft...',
    'guide.poweredBy': 'Aangedreven door zielwijsheid & authentieke begeleiding',
    'guide.exploreDeeper': 'Dieper Verkennen',
    'guide.blueprintLink': 'Blauwdruk Link',
    'guide.tellMore': 'Vertel me meer over dit inzicht en hoe het verbonden is met mijn persoonlijke groei.',
    'guide.howConnect': 'Hoe verbindt dit met mijn blauwdruk en authentieke zelf?',
    
    // Insight Journal
    'journal.title': 'Ziel Inzichten Journaal',
    'journal.placeholder': 'Leg je inzichten, realisaties of aha-momenten vast...',
    'journal.tagLabel': 'Label dit inzicht:',
    'journal.saveButton': 'Opslaan in Journaal',
    'journal.saved': 'Inzicht opgeslagen in je journaal!',
    'journal.description': 'Je inzichten creëren een persoonlijke kennisbank voor patroonherkenning en groeivolging.',
    'journal.tags.breakthrough': 'Doorbraak',
    'journal.tags.pattern': 'Patroon',
    'journal.tags.gratitude': 'Dankbaarheid',
    'journal.tags.challenge': 'Uitdaging',
    'journal.tags.growth': 'Groei',
    'journal.tags.clarity': 'Helderheid',
    'journal.tags.alignment': 'Afstemming',
    'journal.tags.wisdom': 'Wijsheid',
    
    // Weekly Insights
    'weekly.title': 'Je Wekelijkse Ziel Inzichten',
    'weekly.growthScore': 'Groei Score',
    'weekly.dominantMood': 'Dominante Stemmingspatroon',
    'weekly.keyReflections': 'Belangrijke Reflectiegebieden',
    'weekly.growthThemes': 'Groei Thema\'s',
    'weekly.observedPatterns': 'Waargenomen Patronen',
    'weekly.patterns.awareness': 'Zelfbewustzijn neemt toe',
    'weekly.patterns.consistency': 'Consistentie opbouwen',
    
    // Reflection Prompts
    'reflection.title': 'Reflectie & Groei Volgen',
    'reflection.dailyReflection': 'Dagelijkse Reflectie',
    'reflection.deepInsight': 'Diep Inzicht',
    'reflection.lifeDirection': 'Levensrichting',
    'reflection.saveReflection': 'Reflectie Opslaan',
    'reflection.saved': 'Reflectie opgeslagen in je groeipatronen!',
    'reflection.description': 'Je reflecties bouwen een persoonlijke groeidatabase voor wekelijkse inzichten en patroonherkenning.',
    'reflection.placeholder': 'Schrijf hier je gedachten en inzichten...',
    'reflection.reflecting': 'Reflecteren op:',
    
    // Daily Reflection Prompts
    'reflection.daily.joy': 'Wat bracht me vandaag het meeste vreugde?',
    'reflection.daily.challenge': 'Wat daagde me uit en wat heb ik geleerd?',
    'reflection.daily.authentic': 'Hoe heb ik vandaag mijn authentieke zelf geëerd?',
    'reflection.daily.gratitude': 'Waar ben ik nu dankbaar voor?',
    
    // Deep Insight Prompts
    'reflection.insight.pattern': 'Welk patroon blijft terugkomen in mijn leven?',
    'reflection.insight.soul': 'Wat probeert mijn ziel me te vertellen?',
    'reflection.insight.comfort': 'Hoe groei ik voorbij mijn comfortzone?',
    'reflection.insight.blueprint': 'Wat onthult mijn blauwdruk over deze situatie?',
    
    // Life Direction Prompts
    'reflection.direction.aligned': 'Wat voelt het meest afgestemd op mijn doel?',
    'reflection.direction.resisting': 'Waar verzet ik me tegen mijn natuurlijke stroom?',
    'reflection.direction.trust': 'Wat zou ik doen als ik mezelf volledig vertrouwde?',
    'reflection.direction.energy': 'Hoe kan ik vandaag mijn authentieke energie eren?',
  }
};

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('en');

  const t = (key: string, params?: Record<string, string>): string => {
    console.log(`[i18n] language: ${language}, key: ${key}, translation: ${translations[language][key] || key}`);
    
    let translation = translations[language][key] || translations['en'][key] || key;
    
    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        translation = translation.replace(`{{${paramKey}}}`, paramValue);
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
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
