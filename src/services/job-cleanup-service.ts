import { JobControlService } from './job-control-service';

/**
 * AUTOMATED JOB CLEANUP SERVICE
 * Handles background job maintenance and recovery operations
 */
export class JobCleanupService {
  private static cleanupInterval: NodeJS.Timeout | null = null;
  private static isRunning = false;

  /**
   * START AUTOMATED CLEANUP MONITORING
   * Runs cleanup operations at regular intervals
   */
  static startAutomatedCleanup(intervalMinutes: number = 15): void {
    if (this.isRunning) {
      console.log('⚠️ Automated cleanup already running');
      return;
    }

    console.log(`🤖 Starting automated job cleanup every ${intervalMinutes} minutes`);
    
    this.isRunning = true;
    
    // Run initial cleanup
    this.performMaintenanceCycle();
    
    // Schedule recurring cleanup
    this.cleanupInterval = setInterval(() => {
      this.performMaintenanceCycle();
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * STOP AUTOMATED CLEANUP
   */
  static stopAutomatedCleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    
    this.isRunning = false;
    console.log('⏹️ Automated job cleanup stopped');
  }

  /**
   * COMPREHENSIVE MAINTENANCE CYCLE
   * Performs all cleanup and recovery operations
   */
  private static async performMaintenanceCycle(): Promise<void> {
    try {
      console.log('🔧 Starting job maintenance cycle...');
      
      // 1. Recover stuck jobs
      const recoveryResult = await JobControlService.recoverStuckJobs();
      
      if (recoveryResult.recovered > 0) {
        console.log(`✅ Recovered ${recoveryResult.recovered} stuck jobs`);
      }
      
      if (recoveryResult.errors.length > 0) {
        console.warn('⚠️ Recovery errors:', recoveryResult.errors);
      }
      
      // 2. Clean up expired jobs
      await JobControlService.cleanupExpiredJobs();
      
      // 3. System health check
      const health = await JobControlService.getJobSystemHealth();
      
      if (!health.healthy) {
        console.warn('⚠️ Job system health issues detected:', {
          activeJobs: health.activeJobs,
          stuckJobs: health.stuckJobs,
          errors: health.errors,
          recommendations: health.recommendations
        });
      } else {
        console.log(`✅ Job system healthy - ${health.activeJobs} active jobs, ${health.stuckJobs} stuck jobs`);
      }
      
      console.log('🏁 Maintenance cycle complete');
      
    } catch (error) {
      console.error('❌ Maintenance cycle failed:', error);
    }
  }

  /**
   * MANUAL EMERGENCY CLEANUP
   * Force cleanup of all stuck jobs immediately
   */
  static async performEmergencyCleanup(): Promise<{
    success: boolean;
    recovered: number;
    errors: string[];
  }> {
    try {
      console.log('🚨 Performing emergency job cleanup...');
      
      const result = await JobControlService.recoverStuckJobs();
      await JobControlService.cleanupExpiredJobs();
      
      console.log(`🚑 Emergency cleanup complete: ${result.recovered} jobs recovered`);
      
      return {
        success: true,
        recovered: result.recovered,
        errors: result.errors
      };
      
    } catch (error: any) {
      console.error('❌ Emergency cleanup failed:', error);
      return {
        success: false,
        recovered: 0,
        errors: [error.message]
      };
    }
  }

  /**
   * GET CLEANUP SERVICE STATUS
   */
  static getServiceStatus(): {
    running: boolean;
    intervalSet: boolean;
    lastRun?: Date;
  } {
    return {
      running: this.isRunning,
      intervalSet: this.cleanupInterval !== null,
      // Note: We don't track lastRun in this simple implementation
      // but it could be added with additional state management
    };
  }
}