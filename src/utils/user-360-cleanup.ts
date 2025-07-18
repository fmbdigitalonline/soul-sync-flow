
import { user360SyncService } from '@/services/user-360-sync-service';

class User360Cleanup {
  private isRegistered = false;

  registerCleanup() {
    if (this.isRegistered) return;
    
    console.log('🧹 Registering 360° system cleanup handlers');
    
    // Handle page unload
    window.addEventListener('beforeunload', this.cleanup.bind(this));
    
    // Handle app unmount
    window.addEventListener('unload', this.cleanup.bind(this));
    
    this.isRegistered = true;
  }

  cleanup() {
    console.log('🧹 Cleaning up 360° system resources');
    
    try {
      // Cleanup sync service
      user360SyncService.cleanup();
    } catch (error) {
      console.warn('⚠️ Error during 360° cleanup:', error);
    }
  }
}

export const user360Cleanup = new User360Cleanup();
