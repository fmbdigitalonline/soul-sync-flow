/**
 * DISK I/O PROTECTION: Environment checks for production mode
 * 
 * Disables debug components and aggressive polling in production
 * to prevent disk I/O bottlenecks and CPU spikes.
 */

export const isProductionMode = (): boolean => {
  // Check if running in production environment
  return import.meta.env.PROD || 
         window.location.hostname !== 'localhost' && 
         window.location.hostname !== '127.0.0.1';
};

export const isDevelopmentMode = (): boolean => {
  return !isProductionMode();
};

export const shouldEnableDebugPolling = (): boolean => {
  // Only enable aggressive debug polling in development
  return isDevelopmentMode();
};

export const getPollingInterval = (baseInterval: number): number => {
  // In production, multiply polling intervals by 10 to reduce I/O
  return isProductionMode() ? baseInterval * 10 : baseInterval;
};

export const shouldRunDebugComponent = (componentName: string): boolean => {
  if (isDevelopmentMode()) {
    return true;
  }
  
  // In production, log warning about debug component usage
  console.warn(`⚠️ Debug component ${componentName} is disabled in production to prevent I/O overload`);
  return false;
};
