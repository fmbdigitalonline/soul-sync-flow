import { useEffect } from 'react';

export const useDiagnosticLogger = (componentName: string) => {
  useEffect(() => {
    const startTime = Date.now();
    console.log(`🔵 ${componentName} - MOUNTED`, {
      timestamp: new Date().toISOString(),
      startTime
    });

    return () => {
      const endTime = Date.now();
      const duration = endTime - startTime;
      console.log(`🔴 ${componentName} - UNMOUNTED`, {
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      });
    };
  }, [componentName]);

  return {
    logEvent: (eventName: string, data?: any) => {
      console.log(`📊 ${componentName} - ${eventName}`, {
        ...data,
        timestamp: new Date().toISOString()
      });
    },
    logError: (errorName: string, error: any, context?: any) => {
      console.error(`❌ ${componentName} - ${errorName}`, {
        error: error instanceof Error ? {
          message: error.message,
          stack: error.stack,
          name: error.name
        } : error,
        context,
        timestamp: new Date().toISOString()
      });
    }
  };
};
