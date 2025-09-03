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
      console.log(`🚀 Attempting background hermetic generation for job: ${jobId}`);
      
      // ENHANCED VALIDATION: Comprehensive pre-flight checks
      const validationResult = await this.performPreFlightValidation(jobId, blueprint);
      if (!validationResult.valid) {
        return { 
          success: false, 
          error: `Pre-flight validation failed: ${validationResult.error}`,
          retryRecommended: validationResult.retryable
        };
      }
      
      console.log('✅ Pre-flight validation passed');
      
      // ENHANCED INVOCATION: Multiple attempt strategy with detailed logging
      const invocationResult = await this.performEnhancedInvocation(jobId, blueprint);
      
      if (!invocationResult.success) {
        console.error('❌ Enhanced invocation failed:', invocationResult.error);
        return invocationResult;
      }

      console.log('✅ Background processing confirmed started with enhanced validation');
      return { success: true };

    } catch (error: any) {
      console.error('❌ Background processing initiation failed:', {
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

      return { valid: true };

    } catch (error: any) {
      return { 
        valid: false, 
        error: `Validation failed: ${error.message}`,
        retryable: true 
      };
    }
  }

  /**
   * ENHANCED INVOCATION WITH RETRY LOGIC
   */
  private static async performEnhancedInvocation(jobId: string, blueprint: BlueprintData): Promise<{
    success: boolean;
    error?: string;
    retryRecommended?: boolean;
  }> {
    const maxRetries = 3;
    const retryDelays = [0, 2000, 5000]; // 0ms, 2s, 5s

    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        if (attempt > 0) {
          console.log(`🔄 Retry attempt ${attempt + 1}/${maxRetries} after ${retryDelays[attempt]}ms delay`);
          await new Promise(resolve => setTimeout(resolve, retryDelays[attempt]));
        }

        const { data, error } = await supabase.functions.invoke('hermetic-background-processor', {
          body: {
            jobId,
            blueprint,
            attempt: attempt + 1,
            timestamp: new Date().toISOString()
          }
        });

        // Enhanced error analysis
        if (error) {
          console.error(`❌ Invocation attempt ${attempt + 1} failed:`, {
            message: error.message,
            details: error.details,
            hint: error.hint,
            code: error.code,
            context: error.context
          });

          // Determine if retry is worthwhile
          if (attempt < maxRetries - 1 && this.isRetryableInvocationError(error)) {
            continue; // Try again
          }

          return { 
            success: false, 
            error: `Function invocation failed after ${attempt + 1} attempts: ${error.message}${error.details ? ` - ${error.details}` : ''}`,
            retryRecommended: this.isRetryableInvocationError(error) && attempt >= maxRetries - 1
          };
        }

        // Validate response structure and content
        if (!data || typeof data !== 'object') {
          if (attempt < maxRetries - 1) {
            console.warn(`⚠️ Invalid response structure on attempt ${attempt + 1}, retrying...`);
            continue;
          }
          return { success: false, error: 'Function returned invalid response structure' };
        }

        if (!data.success) {
          const errorMsg = data.error || 'Function returned unsuccessful response';
          console.error(`❌ Function returned failure on attempt ${attempt + 1}:`, errorMsg);
          
          if (attempt < maxRetries - 1 && data.retryable !== false) {
            continue; // Try again unless explicitly marked as non-retryable
          }
          
          return { 
            success: false, 
            error: errorMsg,
            retryRecommended: data.retryable !== false
          };
        }

        console.log(`✅ Successful invocation on attempt ${attempt + 1}:`, data);
        return { success: true };

      } catch (error: any) {
        console.error(`❌ Invocation attempt ${attempt + 1} exception:`, error);
        
        if (attempt < maxRetries - 1 && this.isRetryableError(error)) {
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
   * ADVANCED FUNCTION HEALTH VALIDATION
   * Comprehensive verification of edge function deployment and capabilities
   */
  private static async verifyAdvancedFunctionHealth(): Promise<{ 
    healthy: boolean; 
    error?: string;
    retryable?: boolean;
    details?: any;
  }> {
    try {
      const startTime = Date.now();
      
      // Enhanced health check with timeout
      const healthPromise = supabase.functions.invoke('hermetic-background-processor', {
        body: { 
          healthCheck: true,
          timestamp: new Date().toISOString(),
          validateCapabilities: true
        }
      });

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout after 10 seconds')), 10000)
      );

      const { data, error } = await Promise.race([healthPromise, timeoutPromise]) as any;
      const responseTime = Date.now() - startTime;

      if (error) {
        console.error('❌ Advanced health check failed:', error);
        return { 
          healthy: false, 
          error: `Function not accessible: ${error.message}`,
          retryable: this.isRetryableInvocationError(error),
          details: { responseTime, errorCode: error.code }
        };
      }

      // Validate health response structure
      if (!data || typeof data !== 'object' || !data.success) {
        return {
          healthy: false,
          error: 'Function health check returned invalid response',
          retryable: true,
          details: { responseTime, responseData: data }
        };
      }

      console.log(`✅ Advanced health check passed in ${responseTime}ms:`, data);
      return { 
        healthy: true,
        details: { responseTime, capabilities: data.capabilities }
      };

    } catch (error: any) {
      console.error('❌ Advanced health check exception:', error);
      return { 
        healthy: false, 
        error: `Health check failed: ${error.message}`,
        retryable: this.isRetryableError(error)
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
      const { data: job, error } = await supabase
        .from('generation_jobs')
        .select('id, status, created_at, expires_at')
        .eq('id', jobId)
        .single();

      if (error || !job) {
        return { 
          valid: false, 
          error: `Job ${jobId} not found: ${error?.message || 'Not found'}`,
          retryable: false 
        };
      }

      if (job.status !== 'pending') {
        return { 
          valid: false, 
          error: `Job ${jobId} is not in pending status (current: ${job.status})`,
          retryable: false 
        };
      }

      // Check if job has expired
      if (new Date(job.expires_at) < new Date()) {
        return {
          valid: false,
          error: `Job ${jobId} has expired (expired at: ${job.expires_at})`,
          retryable: false
        };
      }

      return { valid: true };

    } catch (error: any) {
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
      // Check for too many concurrent jobs
      const { data: activeJobs, error } = await supabase
        .from('generation_jobs')
        .select('id')
        .in('status', ['pending', 'running']);

      if (error) throw error;

      const activeCount = activeJobs?.length || 0;
      const maxConcurrent = 5; // Reasonable limit

      if (activeCount >= maxConcurrent) {
        return {
          available: false,
          reason: `Too many concurrent jobs (${activeCount}/${maxConcurrent})`
        };
      }

      return { available: true };

    } catch (error: any) {
      // On error, assume capacity is available to not block legitimate requests
      console.warn('⚠️ Capacity check failed, assuming available:', error.message);
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