/**
 * GENERATION DIAGNOSTICS SERVICE
 * Provides real-time visibility into background processing state
 * Implements Principle #7: Build Transparently
 */

import { supabase } from '@/integrations/supabase/client';
import { JobControlService, type GenerationJob } from './job-control-service';

export interface SystemHealthDiagnostic {
  overall: 'healthy' | 'degraded' | 'critical';
  edgeFunction: {
    accessible: boolean;
    responseTime?: number;
    version?: string;
    error?: string;
  };
  database: {
    accessible: boolean;
    activeJobs: number;
    stuckJobs: number;
    error?: string;
  };
  processingCapacity: {
    available: boolean;
    reason?: string;
  };
  lastCheck: string;
  recommendations: string[];
}

export interface ProcessingDiagnostic {
  jobId: string;
  status: GenerationJob['status'];
  phase?: string;
  progress?: number;
  processingTime: number;
  stuck: boolean;
  lastUpdate: string;
  error?: string;
  nextAction?: string;
}

export class GenerationDiagnostics {
  /**
   * COMPREHENSIVE SYSTEM HEALTH CHECK
   * Returns full diagnostic of background processing capabilities
   */
  static async getSystemHealth(): Promise<SystemHealthDiagnostic> {
    console.log('🩺 DIAGNOSTIC START: Comprehensive system health check...');
    
    const diagnostic: SystemHealthDiagnostic = {
      overall: 'critical',
      edgeFunction: { accessible: false },
      database: { accessible: false, activeJobs: 0, stuckJobs: 0 },
      processingCapacity: { available: false },
      lastCheck: new Date().toISOString(),
      recommendations: []
    };

    // Test Edge Function
    try {
      console.log('🏥 Testing Edge Function accessibility...');
      const functionStart = Date.now();
      
      const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
        body: { 
          healthCheck: true, 
          validateCapabilities: true,
          diagnostic: true
        }
      });
      
      const responseTime = Date.now() - functionStart;
      
      if (error) {
        diagnostic.edgeFunction = {
          accessible: false,
          responseTime,
          error: `${error.message} (Code: ${error.code})`
        };
        diagnostic.recommendations.push('Edge Function deployment issue - check function logs');
      } else if (data?.success) {
        diagnostic.edgeFunction = {
          accessible: true,
          responseTime,
          version: data.version
        };
      } else {
        diagnostic.edgeFunction = {
          accessible: false,
          responseTime,
          error: 'Function returned invalid response'
        };
      }
    } catch (error: any) {
      diagnostic.edgeFunction = {
        accessible: false,
        error: `Exception: ${error.message}`
      };
      diagnostic.recommendations.push('Critical deployment issue - function not reachable');
    }

    // Test Database & Job System
    try {
      console.log('🗄️ Testing database and job system...');
      const jobHealth = await JobControlService.getJobSystemHealth();
      
      diagnostic.database = {
        accessible: jobHealth.healthy,
        activeJobs: jobHealth.activeJobs,
        stuckJobs: jobHealth.stuckJobs,
        error: jobHealth.healthy ? undefined : jobHealth.errors.join('; ')
      };
      
      diagnostic.recommendations.push(...jobHealth.recommendations);
    } catch (error: any) {
      diagnostic.database = {
        accessible: false,
        activeJobs: 0,
        stuckJobs: 0,
        error: error.message
      };
      diagnostic.recommendations.push('Database connectivity issue');
    }

    // Check Processing Capacity
    try {
      const capacityCheck = await JobControlService.isGenerationAllowed();
      diagnostic.processingCapacity = {
        available: capacityCheck.allowed,
        reason: capacityCheck.reason
      };
      
      if (!capacityCheck.allowed) {
        diagnostic.recommendations.push(`Processing blocked: ${capacityCheck.reason}`);
      }
    } catch (error: any) {
      diagnostic.processingCapacity = {
        available: false,
        reason: `Capacity check failed: ${error.message}`
      };
    }

    // Determine Overall Health
    if (diagnostic.edgeFunction.accessible && diagnostic.database.accessible && diagnostic.processingCapacity.available) {
      diagnostic.overall = 'healthy';
    } else if (diagnostic.database.accessible) {
      diagnostic.overall = 'degraded';
    } else {
      diagnostic.overall = 'critical';
    }

    console.log('🩺 DIAGNOSTIC COMPLETE:', diagnostic);
    return diagnostic;
  }

  /**
   * JOB-SPECIFIC DIAGNOSTIC
   * Analyzes a specific job's processing state
   */
  static async getJobDiagnostic(jobId: string): Promise<ProcessingDiagnostic | null> {
    console.log(`🔍 JOB DIAGNOSTIC: Analyzing job ${jobId}...`);
    
    try {
      const job = await JobControlService.getJobStatus(jobId);
      if (!job) {
        console.log(`❌ Job ${jobId} not found`);
        return null;
      }

      const now = new Date();
      const updatedAt = new Date(job.updated_at);
      const processingTime = now.getTime() - new Date(job.created_at).getTime();
      const timeSinceUpdate = now.getTime() - updatedAt.getTime();
      
      // Determine if job is stuck (no updates for 5+ minutes while running)
      const stuck = (job.status === 'running' || job.status === 'pending') && 
                   timeSinceUpdate > 5 * 60 * 1000;

      let nextAction: string | undefined;
      if (stuck) {
        nextAction = 'Emergency recovery recommended - job appears stuck';
      } else if (job.status === 'pending' && processingTime > 2 * 60 * 1000) {
        nextAction = 'Check Edge Function accessibility - job not starting';
      } else if (job.status === 'running' && timeSinceUpdate > 2 * 60 * 1000) {
        nextAction = 'Monitor for progress updates - may be processing normally';
      }

      const diagnostic: ProcessingDiagnostic = {
        jobId,
        status: job.status,
        phase: job.progress?.phase,
        progress: job.progress?.progress,
        processingTime: Math.round(processingTime / 1000), // seconds
        stuck,
        lastUpdate: job.updated_at,
        error: job.error_message || undefined,
        nextAction
      };

      console.log(`🔍 JOB DIAGNOSTIC COMPLETE:`, diagnostic);
      return diagnostic;
      
    } catch (error: any) {
      console.error(`❌ Job diagnostic failed:`, error);
      return null;
    }
  }

  /**
   * EMERGENCY RECOVERY DIAGNOSTICS
   * Identifies and provides recovery options for stuck jobs
   */
  static async getEmergencyRecoveryOptions(jobId?: string): Promise<{
    canRecover: boolean;
    stuckJobs: GenerationJob[];
    recoveryActions: string[];
    systemHealth: 'healthy' | 'degraded' | 'critical';
  }> {
    console.log('🚨 EMERGENCY RECOVERY: Analyzing system for recovery options...');
    
    const stuckJobs = await JobControlService.getActiveJobs();
    const systemHealth = await this.getSystemHealth();
    
    const recoveryActions: string[] = [];
    
    if (stuckJobs.length > 0) {
      recoveryActions.push(`${stuckJobs.length} stuck job(s) detected - cleanup recommended`);
    }
    
    if (!systemHealth.edgeFunction.accessible) {
      recoveryActions.push('Edge Function not accessible - check deployment');
    }
    
    if (!systemHealth.database.accessible) {
      recoveryActions.push('Database issues detected - check connectivity');
    }
    
    const canRecover = systemHealth.database.accessible;
    
    return {
      canRecover,
      stuckJobs,
      recoveryActions,
      systemHealth: systemHealth.overall
    };
  }
}