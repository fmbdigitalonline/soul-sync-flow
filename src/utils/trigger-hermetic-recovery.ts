import { hermeticRecoveryService } from '@/services/hermetic-recovery-service';

// Utility to trigger hermetic recovery for the current user
export const triggerHermeticRecoveryForCurrentUser = async () => {
  try {
    const result = await hermeticRecoveryService.triggerRecoveryForUser('9a3ece38-3181-475c-9f5d-ac6f4c1f8a93');
    
    if (result.success) {
      console.log('✅ Hermetic recovery successful:', result.message);
      // Trigger a page refresh to reload the report data
      window.location.reload();
    } else {
      console.error('❌ Hermetic recovery failed:', result.error);
    }
    
    return result;
  } catch (error) {
    console.error('❌ Unexpected error during recovery:', error);
    return { success: false, error: 'Unexpected error' };
  }
};

// Auto-trigger recovery on import for immediate execution
triggerHermeticRecoveryForCurrentUser();

export default triggerHermeticRecoveryForCurrentUser;