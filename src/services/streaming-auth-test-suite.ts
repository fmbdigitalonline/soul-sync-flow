
import { supabase, supabaseUrl } from "@/integrations/supabase/client";
import { enhancedAICoachService } from "./enhanced-ai-coach-service";

export interface StreamingTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  authenticationStatus?: 'authenticated' | 'unauthenticated' | 'expired';
}

export interface StreamingTestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  skipped: number;
  duration: number;
  results: StreamingTestResult[];
  overallAuthStatus: 'healthy' | 'degraded' | 'failed';
}

class StreamingAuthTestSuite {
  private sessionId = `streaming-test-${Date.now()}`;

  async runAuthenticationTests(): Promise<StreamingTestResult[]> {
    const results: StreamingTestResult[] = [];

    // Test 1: Check current auth status
    try {
      const startTime = Date.now();
      const { data: { session }, error } = await supabase.auth.getSession();
      
      results.push({
        testName: 'Current Authentication Status',
        status: session && !error ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: error?.message,
        details: { 
          hasSession: !!session,
          userId: session?.user?.id,
          expiresAt: session?.expires_at 
        },
        authenticationStatus: session ? 'authenticated' : 'unauthenticated'
      });
    } catch (error) {
      results.push({
        testName: 'Current Authentication Status',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    // Test 2: Token freshness check
    try {
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session) {
        const expiresAt = new Date(session.expires_at! * 1000);
        const now = new Date();
        const timeToExpiry = expiresAt.getTime() - now.getTime();
        const hoursToExpiry = timeToExpiry / (1000 * 60 * 60);
        
        results.push({
          testName: 'Token Freshness Check',
          status: hoursToExpiry > 1 ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          details: { 
            hoursToExpiry: hoursToExpiry.toFixed(2),
            expiresAt: expiresAt.toISOString(),
            isNearExpiry: hoursToExpiry < 1
          },
          authenticationStatus: hoursToExpiry > 0 ? 'authenticated' : 'expired'
        });
      } else {
        results.push({
          testName: 'Token Freshness Check',
          status: 'skipped',
          duration: Date.now() - startTime,
          details: { reason: 'No active session' },
          authenticationStatus: 'unauthenticated'
        });
      }
    } catch (error) {
      results.push({
        testName: 'Token Freshness Check',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    // Test 3: Auth headers generation
    try {
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.access_token) {
        const headers = {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        };
        
        results.push({
          testName: 'Auth Headers Generation',
          status: 'passed',
          duration: Date.now() - startTime,
          details: { 
            hasAuthHeader: !!headers.Authorization,
            tokenLength: session.access_token.length,
            tokenPrefix: session.access_token.substring(0, 10) + '...'
          },
          authenticationStatus: 'authenticated'
        });
      } else {
        results.push({
          testName: 'Auth Headers Generation',
          status: 'failed',
          duration: Date.now() - startTime,
          error: 'No access token available',
          authenticationStatus: 'unauthenticated'
        });
      }
    } catch (error) {
      results.push({
        testName: 'Auth Headers Generation',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    return results;
  }

  async runStreamingEndpointTests(): Promise<StreamingTestResult[]> {
    const results: StreamingTestResult[] = [];

    // Test 1: Streaming endpoint authentication
    try {
      const startTime = Date.now();
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        results.push({
          testName: 'Streaming Endpoint Authentication',
          status: 'skipped',
          duration: Date.now() - startTime,
          details: { reason: 'No authenticated session available' },
          authenticationStatus: 'unauthenticated'
        });
        return results;
      }

      const response = await fetch(`${supabaseUrl}/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: `Authentication test message ${Date.now()}`,
          sessionId: this.sessionId,
          includeBlueprint: false,
          agentType: 'guide',
          language: 'en',
          maxTokens: 50,
          temperature: 0.7
        }),
      });

      results.push({
        testName: 'Streaming Endpoint Authentication',
        status: response.ok ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: response.ok ? undefined : `HTTP ${response.status}: ${response.statusText}`,
        details: { 
          statusCode: response.status,
          hasResponseBody: !!response.body,
          contentType: response.headers.get('content-type')
        },
        authenticationStatus: response.status === 401 ? 'unauthenticated' : 'authenticated'
      });

      // Close the response stream to prevent hanging
      if (response.body) {
        await response.body.cancel();
      }

    } catch (error) {
      results.push({
        testName: 'Streaming Endpoint Authentication',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    // Test 2: Full streaming flow test
    try {
      const startTime = Date.now();
      let streamingWorked = false;
      let authenticationWorked = true;
      let chunksReceived = 0;
      let finalResponse = '';

      await enhancedAICoachService.sendStreamingMessage(
        `Real-time streaming test ${Date.now()} - please respond briefly`,
        this.sessionId,
        false,
        'guide',
        'en',
        {
          onChunk: (chunk: string) => {
            chunksReceived++;
            streamingWorked = true;
          },
          onComplete: (fullResponse: string) => {
            finalResponse = fullResponse;
            streamingWorked = true;
          },
          onError: (error: Error) => {
            if (error.message.includes('Authentication') || error.message.includes('sign in')) {
              authenticationWorked = false;
            }
            streamingWorked = false;
          }
        }
      );

      // Wait for streaming to complete (with timeout)
      await new Promise(resolve => setTimeout(resolve, 5000));

      results.push({
        testName: 'Full Streaming Flow Test',
        status: streamingWorked && authenticationWorked ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        error: !streamingWorked ? 'Streaming failed' : (!authenticationWorked ? 'Authentication failed' : undefined),
        details: { 
          chunksReceived,
          responseLength: finalResponse.length,
          streamingWorked,
          authenticationWorked
        },
        authenticationStatus: authenticationWorked ? 'authenticated' : 'unauthenticated'
      });

    } catch (error) {
      results.push({
        testName: 'Full Streaming Flow Test',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    return results;
  }

  async runFallbackMechanismTests(): Promise<StreamingTestResult[]> {
    const results: StreamingTestResult[] = [];

    // Test 1: Non-streaming fallback
    try {
      const startTime = Date.now();
      
      const response = await enhancedAICoachService.sendMessage(
        `Fallback test message ${Date.now()}`,
        this.sessionId,
        false,
        'guide',
        'en'
      );

      results.push({
        testName: 'Non-Streaming Fallback',
        status: response.response ? 'passed' : 'failed',
        duration: Date.now() - startTime,
        details: { 
          responseLength: response.response?.length || 0,
          conversationId: response.conversationId
        },
        authenticationStatus: 'authenticated'
      });

    } catch (error) {
      results.push({
        testName: 'Non-Streaming Fallback',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: error.toString().includes('Authentication') ? 'unauthenticated' : 'authenticated'
      });
    }

    return results;
  }

  async runRealtimeHealthChecks(): Promise<StreamingTestResult[]> {
    const results: StreamingTestResult[] = [];

    // Test 1: User profile accessibility
    try {
      const startTime = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const { data: profile, error } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        results.push({
          testName: 'User Profile Accessibility',
          status: !error ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: error?.message,
          details: { 
            hasProfile: !!profile,
            userId: user.id,
            profileDisplayName: profile?.display_name
          },
          authenticationStatus: 'authenticated'
        });
      } else {
        results.push({
          testName: 'User Profile Accessibility',
          status: 'skipped',
          duration: Date.now() - startTime,
          details: { reason: 'No authenticated user' },
          authenticationStatus: 'unauthenticated'
        });
      }
    } catch (error) {
      results.push({
        testName: 'User Profile Accessibility',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    // Test 2: Real-time conversation storage
    try {
      const startTime = Date.now();
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        const testConversation = {
          user_id: user.id,
          session_id: `test_${this.sessionId}`,
          mode: 'guide',
          messages: [{
            id: `msg_${Date.now()}`,
            content: `Test message ${Date.now()}`,
            sender: 'user',
            timestamp: new Date().toISOString()
          }]
        };

        const { data, error } = await supabase
          .from('conversation_memory')
          .upsert(testConversation)
          .select()
          .maybeSingle();

        results.push({
          testName: 'Real-time Conversation Storage',
          status: !error && data ? 'passed' : 'failed',
          duration: Date.now() - startTime,
          error: error?.message,
          details: { 
            conversationSaved: !!data,
            sessionId: testConversation.session_id,
            messageCount: testConversation.messages.length
          },
          authenticationStatus: 'authenticated'
        });
      } else {
        results.push({
          testName: 'Real-time Conversation Storage',
          status: 'skipped',
          duration: Date.now() - startTime,
          details: { reason: 'No authenticated user' },
          authenticationStatus: 'unauthenticated'
        });
      }
    } catch (error) {
      results.push({
        testName: 'Real-time Conversation Storage',
        status: 'failed',
        duration: Date.now() - Date.now(),
        error: String(error),
        authenticationStatus: 'unauthenticated'
      });
    }

    return results;
  }

  async runFullTestSuite(): Promise<StreamingTestSuiteResult> {
    const startTime = Date.now();
    console.log('🧪 Starting streaming authentication test suite...');

    try {
      const [
        authResults,
        streamingResults,
        fallbackResults,
        healthResults
      ] = await Promise.all([
        this.runAuthenticationTests(),
        this.runStreamingEndpointTests(),
        this.runFallbackMechanismTests(),
        this.runRealtimeHealthChecks()
      ]);

      const allResults = [
        ...authResults,
        ...streamingResults,
        ...fallbackResults,
        ...healthResults
      ];

      const passed = allResults.filter(r => r.status === 'passed').length;
      const failed = allResults.filter(r => r.status === 'failed').length;
      const skipped = allResults.filter(r => r.status === 'skipped').length;

      // Determine overall auth status
      const authFailures = allResults.filter(r => 
        r.status === 'failed' && 
        (r.authenticationStatus === 'unauthenticated' || r.authenticationStatus === 'expired')
      ).length;

      const overallAuthStatus: 'healthy' | 'degraded' | 'failed' = 
        authFailures === 0 ? 'healthy' : 
        authFailures < allResults.length / 2 ? 'degraded' : 'failed';

      const result: StreamingTestSuiteResult = {
        suiteName: 'Streaming Authentication Test Suite',
        totalTests: allResults.length,
        passed,
        failed,
        skipped,
        duration: Date.now() - startTime,
        results: allResults,
        overallAuthStatus
      };

      console.log(`✅ Streaming auth test suite completed: ${passed}/${allResults.length} tests passed, auth status: ${overallAuthStatus}`);
      return result;
    } catch (error) {
      console.error('❌ Streaming auth test suite execution failed:', error);
      return {
        suiteName: 'Streaming Authentication Test Suite',
        totalTests: 0,
        passed: 0,
        failed: 1,
        skipped: 0,
        duration: Date.now() - startTime,
        results: [{
          testName: 'Test Suite Execution',
          status: 'failed',
          duration: Date.now() - startTime,
          error: String(error),
          authenticationStatus: 'unauthenticated'
        }],
        overallAuthStatus: 'failed'
      };
    }
  }
}

export const streamingAuthTestSuite = new StreamingAuthTestSuite();
