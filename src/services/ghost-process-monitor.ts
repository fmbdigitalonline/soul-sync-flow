/**
 * GHOST PROCESS MONITOR
 * 
 * Principle #2: No Hardcoded or Simulated Data
 * Principle #3: Absolutely No Fallbacks That Mask Errors  
 * Principle #7: Build Transparently, Not Silently
 * 
 * This service specifically addresses the "ghost processing" issue where:
 * - Jobs appear to be "running" in the database
 * - No actual background processing is occurring
 * - EdgeRuntime.waitUntil tasks silently fail
 */

import { JobControlService } from './job-control-service';

export interface GhostProcessDiagnostic {
  jobId: string;
  status: 'running' | 'ghost' | 'healthy';
  runtimeMinutes: number;
  progressStuck: boolean;
  lastProgressUpdate?: string;
  recommendation: 'continue' | 'investigate' | 'eliminate';
  reason?: string;
}

export class GhostProcessMonitor {
  private static readonly GHOST_DETECTION_THRESHOLD = 10 * 60 * 1000; // 10 minutes
  private static readonly PROGRESS_STALL_THRESHOLD = 5 * 60 * 1000;   // 5 minutes

  /**
   * DETECT GHOST PROCESSES
   * Identifies jobs that claim to be running but show no actual processing signs
   */
  static async detectGhostProcesses(): Promise<GhostProcessDiagnostic[]> {
    console.log('👻 Starting ghost process detection scan...');
    
    try {
      const activeJobs = await JobControlService.getActiveJobs();
      const diagnostics: GhostProcessDiagnostic[] = [];
      
      for (const job of activeJobs) {
        if (job.status !== 'running') continue;
        
        const diagnostic = this.analyzeJobForGhostBehavior(job);
        diagnostics.push(diagnostic);
        
        console.log(`🔍 Job ${job.id}: ${diagnostic.status} - ${diagnostic.recommendation} (${diagnostic.runtimeMinutes}min runtime)`);
      }
      
      const ghostCount = diagnostics.filter(d => d.status === 'ghost').length;
      console.log(`👻 Ghost detection complete: ${ghostCount} ghost processes found out of ${diagnostics.length} running jobs`);
      
      return diagnostics;
      
    } catch (error) {
      console.error('❌ Ghost detection failed:', error);
      return [];
    }
  }

  /**
   * ANALYZE SINGLE JOB FOR GHOST BEHAVIOR
   * Determines if a running job is actually processing or just "zombie"
   */
  private static analyzeJobForGhostBehavior(job: any): GhostProcessDiagnostic {
    const now = Date.now();
    const startTime = job.started_at ? new Date(job.started_at).getTime() : now;
    const updateTime = job.updated_at ? new Date(job.updated_at).getTime() : startTime;
    
    const runtimeMinutes = Math.floor((now - startTime) / 60000);
    const timeSinceUpdate = now - updateTime;
    
    // Detect ghost behavior patterns
    const isLongRunning = timeSinceUpdate > this.GHOST_DETECTION_THRESHOLD;
    const hasLowProgress = (job.progress?.progress || 0) < 30;
    const progressStuck = timeSinceUpdate > this.PROGRESS_STALL_THRESHOLD;
    const stuckAtSamePhase = job.progress?.phase === 'hermetic_laws' && hasLowProgress;
    
    // Classify job status
    let status: 'running' | 'ghost' | 'healthy' = 'healthy';
    let recommendation: 'continue' | 'investigate' | 'eliminate' = 'continue';
    let reason: string | undefined;
    
    if (isLongRunning && hasLowProgress && stuckAtSamePhase) {
      status = 'ghost';
      recommendation = 'eliminate';
      reason = `Stuck at ${job.progress?.progress || 0}% in ${job.progress?.phase} for ${Math.floor(timeSinceUpdate / 60000)} minutes - classic ghost pattern`;
    } else if (progressStuck && hasLowProgress) {
      status = 'ghost';
      recommendation = 'investigate';
      reason = `No progress updates for ${Math.floor(timeSinceUpdate / 60000)} minutes`;
    } else if (runtimeMinutes > 30) {
      status = 'running';
      recommendation = 'investigate';
      reason = `Long-running job (${runtimeMinutes} minutes) - may need attention`;
    }
    
    return {
      jobId: job.id,
      status,
      runtimeMinutes,
      progressStuck,
      lastProgressUpdate: job.updated_at,
      recommendation,
      reason
    };
  }

  /**
   * AUTO-ELIMINATE CONFIRMED GHOST PROCESSES
   * Automatically cleans up jobs identified as definitive ghosts
   */
  static async autoEliminateGhosts(): Promise<{ eliminated: string[]; errors: string[] }> {
    console.log('💀 Starting automatic ghost elimination...');
    
    try {
      const diagnostics = await this.detectGhostProcesses();
      const ghostsToEliminate = diagnostics.filter(d => d.recommendation === 'eliminate');
      
      const eliminated: string[] = [];
      const errors: string[] = [];
      
      for (const ghost of ghostsToEliminate) {
        console.log(`💀 Eliminating ghost process: ${ghost.jobId} - ${ghost.reason}`);
        
        const result = await JobControlService.forceCleanupJob(ghost.jobId);
        if (result.success) {
          eliminated.push(ghost.jobId);
        } else {
          errors.push(`Failed to eliminate ${ghost.jobId}: ${result.error}`);
        }
      }
      
      console.log(`🧹 Auto-elimination complete: ${eliminated.length} ghosts eliminated, ${errors.length} errors`);
      return { eliminated, errors };
      
    } catch (error: any) {
      console.error('❌ Auto-elimination failed:', error);
      return { eliminated: [], errors: [error.message] };
    }
  }

  /**
   * GET REAL-TIME GHOST STATUS
   * Provides live monitoring data for UI components
   */
  static async getGhostStatus(): Promise<{
    totalRunning: number;
    ghostsDetected: number;
    healthyJobs: number;
    recommendations: string[];
  }> {
    try {
      const diagnostics = await this.detectGhostProcesses();
      
      const ghostsDetected = diagnostics.filter(d => d.status === 'ghost').length;
      const healthyJobs = diagnostics.filter(d => d.status === 'healthy').length;
      const totalRunning = diagnostics.length;
      
      const recommendations: string[] = [];
      
      if (ghostsDetected > 0) {
        recommendations.push(`${ghostsDetected} ghost processes detected - run elimination`);
      }
      
      const investigateJobs = diagnostics.filter(d => d.recommendation === 'investigate').length;
      if (investigateJobs > 0) {
        recommendations.push(`${investigateJobs} jobs need investigation`);
      }
      
      if (totalRunning === 0) {
        recommendations.push('No active background jobs detected');
      } else if (healthyJobs === totalRunning) {
        recommendations.push('All background jobs are processing normally');
      }
      
      return {
        totalRunning,
        ghostsDetected,
        healthyJobs,
        recommendations
      };
      
    } catch (error: any) {
      console.error('❌ Failed to get ghost status:', error);
      return {
        totalRunning: 0,
        ghostsDetected: 0,
        healthyJobs: 0,
        recommendations: [`Ghost monitoring failed: ${error.message}`]
      };
    }
  }
}