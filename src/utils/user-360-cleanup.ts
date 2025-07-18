import { user360SyncService } from '@/services/user-360-sync-service';

// Cleanup utility for the 360° system
class User360Cleanup {
  private static instance: User360Cleanup;
  private isCleanupRegistered = false;

  static getInstance(): User360Cleanup {
    if (!User360Cleanup.instance) {
      User360Cleanup.instance = new User360Cleanup();
    }
    return User360Cleanup.instance;
  }

  // Register cleanup handlers
  registerCleanup(): void {
    if (this.isCleanupRegistered) {
      return;
    }

    console.log('🧹 Registering 360° cleanup handlers');

    // Browser cleanup events
    if (typeof window !== 'undefined') {
      // Before page unload
      window.addEventListener('beforeunload', this.handleCleanup);
      
      // Page visibility change (user switches tabs, etc.)
      document.addEventListener('visibilitychange', this.handleVisibilityChange);
      
      // Browser online/offline events
      window.addEventListener('offline', this.handleOffline);
      window.addEventListener('online', this.handleOnline);
    }

    this.isCleanupRegistered = true;
  }

  // Cleanup handler
  private handleCleanup = (): void => {
    console.log('🧹 Performing 360° system cleanup');
    user360SyncService.cleanup();
  };

  // Handle visibility changes
  private handleVisibilityChange = (): void => {
    if (document.visibilityState === 'hidden') {
      console.log('📱 App going to background - maintaining sync connections');
      // Keep connections alive but log the state change
    } else if (document.visibilityState === 'visible') {
      console.log('📱 App returning to foreground - verifying sync connections');
      // Optionally refresh connections here if needed
    }
  };

  // Handle offline state
  private handleOffline = (): void => {
    console.log('📡 App went offline - sync will resume when online');
  };

  // Handle online state
  private handleOnline = (): void => {
    console.log('📡 App back online - sync connections should resume');
  };

  // Manual cleanup method
  cleanup(): void {
    this.handleCleanup();
    
    // Remove event listeners
    if (typeof window !== 'undefined') {
      window.removeEventListener('beforeunload', this.handleCleanup);
      document.removeEventListener('visibilitychange', this.handleVisibilityChange);
      window.removeEventListener('offline', this.handleOffline);
      window.removeEventListener('online', this.handleOnline);
    }
    
    this.isCleanupRegistered = false;
  }
}

export const user360Cleanup = User360Cleanup.getInstance();
