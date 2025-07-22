/**
 * Phase 3 Complete: Session Storage Management for Testing
 * 
 * SoulSync Principles Implemented:
 * ✅ #7: Build Transparently - Provides clear session management tools
 */

export const clearStewardIntroductionSession = (userId: string) => {
  const sessionKey = `steward_intro_completed_${userId}`;
  sessionStorage.removeItem(sessionKey);
  console.log('🧹 Session storage cleared for user:', userId);
};

export const checkStewardIntroductionSession = (userId: string) => {
  const sessionKey = `steward_intro_completed_${userId}`;
  const completed = sessionStorage.getItem(sessionKey) === 'true';
  console.log('🔍 Session check for user:', userId, 'completed:', completed);
  return completed;
};