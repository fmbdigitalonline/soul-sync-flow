
// Health checker service to validate blueprint calculations without fallbacks
export class BlueprintHealthChecker {
  private static isHealthCheckMode = false;
  
  static enableHealthCheckMode() {
    this.isHealthCheckMode = true;
    console.log('🔍 Starting health check mode - no fallbacks enabled');
  }
  
  static disableHealthCheckMode() {
    this.isHealthCheckMode = false;
    console.log('✅ Health check mode disabled - fallbacks restored');
  }
  
  static isHealthCheck(): boolean {
    return this.isHealthCheckMode;
  }
  
  static failIfHealthCheck(component: string, reason: string): never {
    if (this.isHealthCheckMode) {
      const error = `HEALTH CHECK FAIL: ${component} - ${reason}`;
      console.error(`❌ FAILED: ${error}`);
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
    if (this.isHealthCheckMode) {
      console.log(`📍 ${component}: ${message}`);
    }
  }
}
