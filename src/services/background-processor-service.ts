import { supabase } from "@/integrations/supabase/client";
import { BlueprintData } from "./blueprint-service";

export class BackgroundProcessorService {
  /**
   * PRINCIPLE #2: NO MASKING ERRORS - Surface real invocation failures
   * PRINCIPLE #7: BUILD TRANSPARENTLY - Comprehensive logging and validation
   */
  static async startHermeticGeneration(blueprint: BlueprintData, jobId: string): Promise<{
    success: boolean;
    error?: string;
    retryRecommended?: boolean;
  }> {
    try {
      console.log(`🚀 GENERATION START: Attempting background hermetic generation for job: ${jobId}`);
      
      // ENHANCED VALIDATION: Comprehensive pre-flight checks
      const validationResult = await this.performPreFlightValidation(jobId, blueprint);
      if (!validationResult.valid) {
        console.error(`❌ PRE-FLIGHT FAILED:`, validationResult);
        return { 
          success: false, 
          error: `Pre-flight validation failed: ${validationResult.error}`,
          retryRecommended: validationResult.retryable
        };
      }
      
      console.log('✅ PRE-FLIGHT PASSED: All validation checks successful');
      
      // ENHANCED INVOCATION: Multiple attempt strategy with detailed logging
      const invocationResult = await this.performEnhancedInvocation(jobId, blueprint);
      
      if (!invocationResult.success) {
        console.error('❌ INVOCATION FAILED:', invocationResult.error);
        return invocationResult;
      }

      console.log(`✅ GENERATION CONFIRMED: Background processing started successfully for job ${jobId}`);
      return { success: true };

    } catch (error: any) {
      console.error('❌ CRITICAL ERROR: Background processing initiation failed:', {
        error: error.message,
        stack: error.stack,
        jobId,
        timestamp: new Date().toISOString()
      });
      return { 
        success: false, 
        error: `Processing failed to start: ${error.message}`,
        retryRecommended: this.isRetryableError(error)
      };
    }
  }

  /**
   * COMPREHENSIVE PRE-FLIGHT VALIDATION
   * Validates all prerequisites before attempting invocation
   */
  private static async performPreFlightValidation(jobId: string, blueprint: BlueprintData): Promise<{
    valid: boolean;
    error?: string;
    retryable?: boolean;
  }> {
    try {
      console.log(`🔍 PRE-FLIGHT START: Validating job ${jobId} readiness...`);

      // 1. Verify edge function deployment and accessibility
      const functionHealth = await this.verifyAdvancedFunctionHealth();
      if (!functionHealth.healthy) {
        return { 
          valid: false, 
          error: `Function not ready: ${functionHealth.error}`,
          retryable: functionHealth.retryable 
        };
      }

      // 2. Validate job exists and is in correct state
      const jobValidation = await this.validateJobState(jobId);
      if (!jobValidation.valid) {
        return jobValidation;
      }

      // 3. Validate blueprint data integrity
      if (!blueprint || typeof blueprint !== 'object') {
        return { 
          valid: false, 
          error: 'Invalid blueprint data provided',
          retryable: false 
        };
      }

      // 4. Check system resources and capacity
      const capacityCheck = await this.checkSystemCapacity();
      if (!capacityCheck.available) {
        return {
          valid: false,
          error: `System capacity exceeded: ${capacityCheck.reason}`,
          retryable: true
        };
      }

      console.log(`✅ PRE-FLIGHT COMPLETE: All validations passed for job ${jobId}`);
      return { valid: true };

    } catch (error: any) {
      console.error('❌ PRE-FLIGHT EXCEPTION:', error);
      return { 
        valid: false, 
        error: `Validation failed: ${error.message}`,
        retryable: true 
      };
    }
  }

  /**
   * ENHANCED INVOCATION WITH RETRY LOGIC AND FULL TRANSPARENCY
   */
  private static async performEnhancedInvocation(jobId: string, blueprint: BlueprintData): Promise<{
    success: boolean;
    error?: string;
    retryRecommended?: boolean;
  }> {
    console.log(`🎯 INVOCATION START: Job ${jobId} - Background processor invocation initiated`);
    
    const maxRetries = 3;
    const retryDelays = [0, 2000, 5000]; // 0ms, 2s, 5s

    // PRINCIPLE #7: BUILD TRANSPARENTLY - Pre-flight function health check
    try {
      console.log('🏥 ACCESSIBILITY TEST: Testing Edge Function accessibility...');
      const healthCheck = await supabase.functions.invoke('hermetic-background-processor', {
        body: { healthCheck: true, validateCapabilities: true }
      });
      
      if (healthCheck.error) {
        console.error('❌ CRITICAL: Edge Function not accessible:', healthCheck.error);
        return {
          success: false,
          error: `Edge Function inaccessible: ${healthCheck.error.message} (Code: ${healthCheck.error.code})`,
          retryRecommended: false
        };
      }
      
      console.log('✅ ACCESSIBILITY CONFIRMED: Edge Function is accessible and healthy');
    } catch (healthError: any) {
      console.error('❌ CRITICAL: Pre-flight health check failed:', healthError);
      return {
        success: false,
        error: `Function deployment issue: ${healthError.message}`,
        retryRecommended: false
      };
    }

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 RETRY ${attempt + 1}/${maxRetries}: Waiting ${retryDelays[attempt]}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
        }

        console.log(`📡 INVOCATION ATTEMPT ${attempt + 1}: Invoking hermetic-background-processor...`);
        const invocationStart = Date.now();
        
        const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
          body: {
            jobId,
            blueprint,
            attempt: attempt + 1,
            timestamp: new Date().toISOString()
          }
        });

        const invocationTime = Date.now() - invocationStart;
        console.log(`⏱️ INVOCATION TIMING: Attempt ${attempt + 1} completed in ${invocationTime}ms`);

        // Enhanced error analysis with full transparency
        if (error) {
          console.error(`❌ INVOCATION FAILED (Attempt ${attempt + 1}):`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            context: error.context,
            invocationTime
          });

          // PRINCIPLE #3: ABSOLUTELY NO FALLBACKS THAT MASK ERRORS
          if (attempt < maxRetries - 1 && this.isRetryableInvocationError(error)) {
            console.log(`🔄 RETRY DECISION: Error is retryable, will attempt retry...`);
            continue;
          } else {
            console.error(`❌ FINAL FAILURE: All attempts exhausted or non-retryable error`);
            return {
              success: false,
              error: `Invocation failed: ${error.message} (Code: ${error.code})`,
              retryRecommended: this.isRetryableInvocationError(error)
            };
          }
        }

        // SUCCESS CASE - Function invoked successfully
        console.log(`✅ INVOCATION SUCCESS (Attempt ${attempt + 1}):`, {
          data,
          invocationTime,
          jobId
        });

        // Verify the response indicates background processing started
        if (data?.success) {
          console.log(`🌟 BACKGROUND PROCESSING CONFIRMED: Job ${jobId} handed off to Edge Function successfully`);
          return { success: true };
        } else {
          console.error(`❌ INVOCATION RESPONSE ERROR:`, data);
          return {
            success: false,
            error: `Function responded with error: ${data?.error || 'Unknown error'}`,
            retryRecommended: false
          };
        }

      } catch (error: any) {
        console.error(`❌ INVOCATION EXCEPTION (Attempt ${attempt + 1}):`, error);
        
        if (attempt < maxRetries - 1 && this.isRetryableError(error)) {
          console.log(`🔄 EXCEPTION RETRY: Will attempt retry for retryable exception`);
          continue;
        }
        
        return { 
          success: false, 
          error: `Invocation failed with exception: ${error.message}`,
          retryRecommended: this.isRetryableError(error)
        };
      }
    }

    return { 
      success: false, 
      error: `All ${maxRetries} invocation attempts failed`,
      retryRecommended: true
    };
  }

  /**
   * ENHANCED FUNCTION HEALTH CHECK - Full diagnostic capability
   */
  private static async verifyAdvancedFunctionHealth(): Promise<{
    healthy: boolean;
    error?: string;
    retryable?: boolean;
    details?: any;
  }> {
    try {
      console.log('🏥 HEALTH CHECK START: Verifying Edge Function deployment and accessibility...');
      const healthStart = Date.now();
      
      // Health check with 30-second timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('TIMEOUT: Health check exceeded 30 seconds')), 30000);
      });
      
      const healthPromise = supabase.functions.invoke('hermetic-background-processor', {
        body: { 
          healthCheck: true, 
          validateCapabilities: true,
          requestId: `health_${Date.now()}`
        }
      });
      
      console.log('📡 HEALTH CHECK: Sending health verification request...');
      const result = await Promise.race([healthPromise, timeoutPromise]) as any;
      const healthTime = Date.now() - healthStart;
      
      console.log(`⏱️ HEALTH CHECK TIMING: ${healthTime}ms`);
      
      if (result.error) {
        console.error('❌ HEALTH CHECK FAILED:', {
          error: result.error,
          code: result.error.code,
          message: result.error.message,
          details: result.error.details,
          healthTime
        });
        
        return {
          healthy: false,
          error: `Function not accessible: ${result.error.message} (Code: ${result.error.code})`,
          retryable: this.isRetryableInvocationError(result.error),
          details: { 
            healthTime, 
            errorCode: result.error.code,
            errorDetails: result.error.details 
          }
        };
      }
      
      if (result.data?.success) {
        console.log('✅ HEALTH CHECK SUCCESS:', {
          healthTime, 
          version: result.data.version,
          capabilities: result.data.capabilities,
          timestamp: result.data.timestamp
        });
        
        return {
          healthy: true,
          details: { 
            healthTime, 
            version: result.data.version,
            capabilities: result.data.capabilities,
            functionDeployed: true
          }
        };
      }
      
      console.error('❌ HEALTH CHECK INVALID RESPONSE:', result.data);
      return {
        healthy: false,
        error: `Invalid health response: ${result.data?.error || 'Function returned unexpected format'}`,
        retryable: true,
        details: { healthTime, invalidResponse: result.data }
      };
      
    } catch (error: any) {
      console.error('❌ HEALTH CHECK EXCEPTION:', error);
      return {
        healthy: false,
        error: `Health check failed: ${error.message}`,
        retryable: error.message.includes('timeout') || error.message.includes('network') || error.message.includes('fetch'),
        details: { 
          exception: error.message,
          stack: error.stack?.substring(0, 500)
        }
      };
    }
  }

  /**
   * JOB STATE VALIDATION
   */
  private static async validateJobState(jobId: string): Promise<{
    valid: boolean;
    error?: string;
    retryable?: boolean;
  }> {
    try {
      console.log(`🔍 JOB VALIDATION: Checking job ${jobId} state...`);
      
      const { data: job, error } = await supabase
        .from('generation_jobs')
        .select('id, status, created_at, expires_at')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        console.error(`❌ JOB NOT FOUND: ${jobId}`, error);
        return { 
          valid: false, 
          error: `Job ${jobId} not found: ${error?.message || 'Not found'}`,
          retryable: false 
        };
      }

      if (job.status !== 'pending') {
        console.error(`❌ JOB WRONG STATUS: ${jobId} is ${job.status}, expected pending`);
        return { 
          valid: false, 
          error: `Job ${jobId} is not in pending status (current: ${job.status})`,
          retryable: false 
        };
      }

      // Check if job has expired
      if (new Date(job.expires_at) < new Date()) {
        console.error(`❌ JOB EXPIRED: ${jobId} expired at ${job.expires_at}`);
        return {
          valid: false,
          error: `Job ${jobId} has expired (expired at: ${job.expires_at})`,
          retryable: false
        };
      }

      console.log(`✅ JOB VALIDATION PASSED: ${jobId} is ready for processing`);
      return { valid: true };

    } catch (error: any) {
      console.error(`❌ JOB VALIDATION EXCEPTION:`, error);
      return { 
        valid: false, 
        error: `Job validation failed: ${error.message}`,
        retryable: true 
      };
    }
  }

  /**
   * SYSTEM CAPACITY CHECK
   */
  private static async checkSystemCapacity(): Promise<{
    available: boolean;
    reason?: string;
  }> {
    try {
      console.log('📊 CAPACITY CHECK: Checking system processing capacity...');
      
      // Check for too many concurrent jobs
      const { data: activeJobs, error } = await supabase
        .from('generation_jobs')
        .select('id')
        .in('status', ['pending', 'running']);

      if (error) throw error;

      const activeCount = activeJobs?.length || 0;
      const maxConcurrent = 5; // Reasonable limit

      if (activeCount >= maxConcurrent) {
        console.warn(`⚠️ CAPACITY EXCEEDED: ${activeCount}/${maxConcurrent} concurrent jobs`);
        return {
          available: false,
          reason: `Too many concurrent jobs (${activeCount}/${maxConcurrent})`
        };
      }

      console.log(`✅ CAPACITY AVAILABLE: ${activeCount}/${maxConcurrent} concurrent jobs`);
      return { available: true };

    } catch (error: any) {
      // On error, assume capacity is available to not block legitimate requests
      console.warn('⚠️ CAPACITY CHECK FAILED: Assuming available:', error.message);
      return { available: true };
    }
  }

  /**
   * ERROR CLASSIFICATION UTILITIES
   */
  private static isRetryableError(error: any): boolean {
    if (!error) return false;
    
    const retryableMessages = [
      'network',
      'timeout',
      'connection',
      'temporary',
      'rate limit',
      'service unavailable'
    ];
    
    const errorMessage = (error.message || '').toLowerCase();
    return retryableMessages.some(msg => errorMessage.includes(msg));
  }

  private static isRetryableInvocationError(error: any): boolean {
    if (!error) return false;
    
    // Specific Supabase edge function error codes that are retryable
    const retryableCodes = ['FUNCTION_NOT_FOUND', 'FUNCTION_TIMEOUT', 'FUNCTION_RUNTIME_ERROR'];
    
    if (error.code && retryableCodes.includes(error.code)) {
      return true;
    }
    
    return this.isRetryableError(error);
  }

  /**
   * LEGACY HEALTH CHECK (for backward compatibility)
   */
  private static async verifyFunctionHealth(): Promise<{ healthy: boolean; error?: string }> {
    const result = await this.verifyAdvancedFunctionHealth();
    return { 
      healthy: result.healthy, 
      error: result.error 
    };
  }
}