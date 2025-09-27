/**
 * Shared utilities for consistent error handling across edge functions
 */

/**
 * Safely extracts error message from unknown error type
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}

/**
 * Creates a standardized error response for edge functions
 */
export function createErrorResponse(error: unknown, status: number = 500): Response {
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  };

  return new Response(
    JSON.stringify({ 
      error: getErrorMessage(error),
      timestamp: new Date().toISOString()
    }),
    {
      status,
      headers: { 
        "Content-Type": "application/json",
        ...corsHeaders 
      }
    }
  );
}

/**
 * Safely extracts error details including stack for debugging
 */
export function getErrorDetails(error: unknown): {
  message: string;
  name?: string;
  stack?: string;
} {
  if (error instanceof Error) {
    return {
      message: error.message,
      name: error.name,
      stack: error.stack
    };
  }
  return {
    message: String(error)
  };
}