
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
    'continue': 'Continue'
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
    'continue': 'Doorgaan'
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
