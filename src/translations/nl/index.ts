
import { authTranslations } from './auth';
import { navTranslations } from './nav';
import { commonTranslations } from './common';
import { coachTranslations } from './coach';
import { growthTranslations } from './growth';
import { lifeAreasTranslations } from './lifeAreas';
import { moodTrackerTranslations } from './moodTracker';
import { guideTranslations } from './guide';
import { reflectionPromptsTranslations } from './reflectionPrompts';

export const nlTranslations = {
  ...authTranslations,
  ...navTranslations,
  ...commonTranslations,
  ...coachTranslations,
  ...growthTranslations,
  ...lifeAreasTranslations,
  ...moodTrackerTranslations,
  ...guideTranslations,
  ...reflectionPromptsTranslations,
  
  // Quick Actions
  'quickAction.breakDownGoal': 'Mijn doel opdelen in stappen',
  'quickAction.createRoutine': 'Een dagelijkse routine maken',
  'quickAction.setupAccountability': 'Verantwoordelijkheidssysteem opzetten',
  'quickAction.planWeek': 'Mijn week strategisch plannen',
  
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
};
