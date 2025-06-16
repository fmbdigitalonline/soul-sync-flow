
import { authTranslations } from './auth';
import { navTranslations } from './nav';
import { commonTranslations } from './common';
import { coachTranslations } from './coach';
import { growthTranslations } from './growth';
import { lifeAreasTranslations } from './lifeAreas';
import { moodTrackerTranslations } from './moodTracker';
import { guideTranslations } from './guide';
import { reflectionPromptsTranslations } from './reflectionPrompts';

export const enTranslations = {
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
  'quickAction.breakDownGoal': 'Break down my goal into steps',
  'quickAction.createRoutine': 'Create a daily routine',
  'quickAction.setupAccountability': 'Set up accountability system',
  'quickAction.planWeek': 'Plan my week strategically',
  
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
};
