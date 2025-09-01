import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type Language = 'en' | 'nl';

interface Translations {
  [key: string]: string | string[] | Translations;
}

const translations: Record<Language, Translations> = {
  en: {
    // Essential translations for journey components
    guidedTour: {
      soulCoach: 'Soul Coach Guidance',
      stepOf: 'Step {tourStep} of {totalSteps}',
      orientation: 'You\'re being guided through your personalized journey to help you understand how everything works together.',
      skipTour: 'Skip Tour',
      next: 'Next',
      gotIt: 'Got It!'
    },
    journeyOverview: {
      title: 'Your Complete Journey Overview',
      titleShort: 'Journey Overview',
      subtitle: 'Specially designed for your blueprint',
      milestones: 'Milestones',
      milestonesDesc: 'Key achievement phases',
      actionTasks: 'Action Tasks', 
      tasks: 'Tasks',
      tasksDesc: 'Blueprint-optimized steps',
      timeline: 'Timeline',
      timelineDesc: 'To completion'
    },
    habits: {
      dailyHabits: 'Daily Habits',
      today: 'today',
      completedToday: '% completed today',
      dayBestStreak: 'day best streak',
      todayLabel: 'Today',
      bestStreak: 'Best Streak',
      totalHabits: 'Total Habits',
      yourHabits: 'Your Habits',
      doubleTapForDetails: 'Double-tap for details',
      addNewHabit: 'Add New Habit'
    },
    tasks: {
      backToJourney: 'Back to Journey',
      focusingOn: 'Focusing on:',
      tasksCompleted: '{tasks} tasks • {completed} completed',
      flow: 'Flow',
      tasks: 'Tasks',
      calendar: 'Calendar',
      todo: 'To Do',
      inProgress: 'In Progress',
      stuck: 'Stuck',
      completed: 'Completed',
      prev: 'Prev',
      next: 'Next',
      allTasks: 'All Tasks',
      doubleTapForCoaching: 'Double-tap for coaching',
      noTasksFound: 'No tasks found',
      tasksFor: 'Tasks for {date}',
      noTasksScheduled: 'No tasks scheduled for this day',
      dropTasksHere: 'Drop tasks here'
    },
    focusMode: {
      youAreInFocusMode: 'You are now in Focus Mode',
      target: 'Target:',
      focusedTasks: 'focused tasks',
      blueprintAlignment: 'Blueprint Alignment',
      tasksForMilestone: 'Tasks for This Milestone',
      noSpecificTasks: 'No specific tasks found for this milestone.',
      tasksDistributed: 'Tasks may be distributed across milestones.',
      completionCriteria: 'Completion Criteria'
    },
    celebration: {
      dreamReadyTitle: '🎯 Your Dream Journey is Ready!',
      dreamReadyDescription: 'I\'ve transformed "{goalTitle}" into a personalized, step-by-step roadmap that honors your unique soul blueprint'
    }
  },
  nl: {
    guidedTour: {
      soulCoach: 'Ziel Coach Begeleiding',
      stepOf: 'Stap {tourStep} van {totalSteps}',
      orientation: 'Je wordt wegwijs gemaakt in je gepersonaliseerde reis om te helpen begrijpen hoe alles samenwerkt.',
      skipTour: 'Tour Overslaan',
      next: 'Volgende',
      gotIt: 'Begrepen!'
    },
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
    habits: {
      dailyHabits: 'Dagelijkse Gewoontes',
      today: 'vandaag',
      completedToday: '% voltooid vandaag',
      dayBestStreak: 'dagen beste reeks',
      todayLabel: 'Vandaag',
      bestStreak: 'Beste Reeks',
      totalHabits: 'Totaal Gewoontes',
      yourHabits: 'Jouw Gewoontes',
      doubleTapForDetails: 'Dubbeltik voor details',
      addNewHabit: 'Nieuwe Gewoonte Toevoegen'
    },
    tasks: {
      backToJourney: 'Terug naar Reis',
      focusingOn: 'Focus op:',
      tasksCompleted: '{tasks} taken • {completed} voltooid',
      flow: 'Flow',
      tasks: 'Taken',
      calendar: 'Kalender',
      todo: 'Te Doen',
      inProgress: 'In Uitvoering',
      stuck: 'Vastgelopen',
      completed: 'Voltooid',
      prev: 'Vorige',
      next: 'Volgende',
      allTasks: 'Alle Taken',
      doubleTapForCoaching: 'Dubbeltik voor coaching',
      noTasksFound: 'Geen taken gevonden',
      tasksFor: 'Taken voor {date}',
      noTasksScheduled: 'Geen taken gepland voor deze dag',
      dropTasksHere: 'Sleep taken hierheen'
    },
    focusMode: {
      youAreInFocusMode: 'Je bent nu in Focus Modus',
      target: 'Doel:',
      focusedTasks: 'gefocuste taken',
      blueprintAlignment: 'Blauwdruk Afstemming',
      tasksForMilestone: 'Taken voor Deze Mijlpaal',
      noSpecificTasks: 'Geen specifieke taken gevonden voor deze mijlpaal.',
      tasksDistributed: 'Taken kunnen verspreid zijn over mijlpalen.',
      completionCriteria: 'Voltooiingscriteria'
    },
    celebration: {
      dreamReadyTitle: '🎯 Je Droomreis is Klaar!',
      dreamReadyDescription: 'Ik heb "{goalTitle}" getransformeerd in een gepersonaliseerd, stap-voor-stap routekaart die je unieke ziel blauwdruk eert'
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
      if (Array.isArray(value)) {
        return value[0] || key;
      }
      return typeof value === 'string' ? value : key;
    }
    
    const fallbackValue = getNestedValue(translations.en, key);
    if (fallbackValue !== undefined) {
      console.warn(`Translation missing for key "${key}" in language "${language}", using English fallback`);
      if (Array.isArray(fallbackValue)) {
        return fallbackValue[0] || key;
      }
      return typeof fallbackValue === 'string' ? fallbackValue : key;
    }
    
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