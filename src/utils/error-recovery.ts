/**
 * Standardized error handling and recovery utilities
 * Ensures consistent cleanup across all loading paths
 */

export interface ErrorRecoveryOptions {
  source: string;
  context?: any;
  shouldForceRecovery?: boolean;
}

export const handleLoadingError = (
  error: Error | unknown,
  options: ErrorRecoveryOptions,
  cleanup: () => void
): void => {
  const errorMessage = error instanceof Error ? error.message : 'Unknown error';
  
  console.error(`❌ Loading error from ${options.source}:`, {
    error: errorMessage,
    context: options.context,
    timestamp: new Date().toISOString()
  });
  
  // Always execute cleanup function
  try {
    cleanup();
  } catch (cleanupError) {
    console.error(`❌ Cleanup error for ${options.source}:`, cleanupError);
  }
  
  // Force recovery if requested
  if (options.shouldForceRecovery) {
    console.log(`🔧 Forcing recovery for ${options.source}`);
    // Additional recovery logic can be added here
  }
};

export const createErrorHandler = (
  source: string,
  cleanup: () => void
) => {
  return (error: Error | unknown, context?: any) => {
    handleLoadingError(error, { source, context, shouldForceRecovery: true }, cleanup);
  };
};