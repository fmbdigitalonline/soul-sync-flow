
// Health checker service to validate blueprint calculations without fallbacks
export class BlueprintHealthChecker {
  private static isHealthCheckMode = false;
  private static healthCheckResults: Array<{
    component: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    timestamp: string;
  }> = [];
  
  static enableHealthCheckMode() {
    this.isHealthCheckMode = true;
    this.healthCheckResults = [];
    console.log('🔍 HEALTH CHECK MODE ENABLED - No fallbacks, real calculations only');
  }
  
  static disableHealthCheckMode() {
    this.isHealthCheckMode = false;
    console.log('✅ Health check mode disabled');
  }
  
  static isHealthCheck(): boolean {
    return this.isHealthCheckMode;
  }
  
  static logHealthCheck(component: string, status: 'pass' | 'fail' | 'warning', message: string) {
    if (this.isHealthCheckMode) {
      const result = {
        component,
        status,
        message,
        timestamp: new Date().toISOString()
      };
      this.healthCheckResults.push(result);
      
      const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '⚠️';
      // Only log in development or health check mode
      if (import.meta.env.DEV) {
        console.log(`${icon} HEALTH CHECK ${component}: ${message}`);
      }
    }
  }
  
  static getHealthCheckResults() {
    return [...this.healthCheckResults];
  }
  
  static clearHealthCheckResults() {
    this.healthCheckResults = [];
  }
  
  static failIfHealthCheck(component: string, reason: string): never {
    if (this.isHealthCheckMode) {
      const error = `HEALTH CHECK FAIL: ${component} - ${reason}`;
      this.logHealthCheck(component, 'fail', reason);
      if (import.meta.env.DEV) {
        console.error(`❌ FAILED: ${error}`);
      }
      throw new Error(error);
    }
    throw new Error(`${component}: ${reason}`);
  }
  
  static validateRequired<T>(value: T | null | undefined, component: string, field: string): T {
    if (this.isHealthCheckMode && (value === null || value === undefined)) {
      this.failIfHealthCheck(component, `Missing required field: ${field}`);
    }
    return value as T;
  }
  
  static logValidation(component: string, message: string) {
    if (this.isHealthCheckMode && import.meta.env.DEV) {
      console.log(`📍 ${component}: ${message}`);
    }
  }

  static validateCalculationComponent(
    component: string, 
    data: any, 
    requiredFields: string[]
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    if (!data) {
      errors.push(`${component} data is null or undefined`);
      if (this.isHealthCheckMode) {
        this.logHealthCheck(component, 'fail', 'No data returned');
      }
      return { isValid: false, errors };
    }

    for (const field of requiredFields) {
      if (!data[field] || data[field] === 'Unknown' || data[field] === '') {
        errors.push(`${component} missing or invalid field: ${field}`);
      }
    }

    const isValid = errors.length === 0;
    
    if (this.isHealthCheckMode) {
      if (isValid) {
        this.logHealthCheck(component, 'pass', `All required fields present and valid`);
      } else {
        this.logHealthCheck(component, 'fail', `Validation failed: ${errors.join(', ')}`);
      }
    }

    return { isValid, errors };
  }
}
