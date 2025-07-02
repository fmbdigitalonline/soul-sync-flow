
import { EnhancedAICoachService } from './enhanced-ai-coach-service';

export interface StreamingTestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
  error?: string;
  details?: any;
  authenticationStatus?: 'authenticated' | 'unauthenticated' | 'error';
}

export interface StreamingTestSuiteResult {
  suiteName: string;
  totalTests: number;
  passed: number;
  failed: number;
  duration: number;
  results: StreamingTestResult[];
  overallAuthStatus: 'passed' | 'failed' | 'partial';
}

class StreamingAuthTestSuite {
  private enhancedAICoach: EnhancedAICoachService;

  constructor() {
    this.enhancedAICoach = new EnhancedAICoachService();
  }

  async runFullTestSuite(): Promise<StreamingTestSuiteResult> {
    const startTime = Date.now();
    console.log('🧪 Starting Streaming Authentication Test Suite...');

    const results: StreamingTestResult[] = [];

    // Test 1: Basic Authentication
    try {
      const testStartTime = Date.now();
      const sessionId = `streaming_auth_test_${Date.now()}`;
      
      const response = await this.enhancedAICoach.sendMessage(
        'Test message for streaming auth',
        sessionId,
        true,
        'guide',
        'en'
      );
      
      results.push({
        testName: 'Basic Authentication Test',
        status: response.response ? 'passed' : 'failed',
        duration: Date.now() - testStartTime,
        authenticationStatus: response.response ? 'authenticated' : 'error',
        details: {
          responseLength: response.response?.length || 0,
          conversationId: sessionId
        }
      });
    } catch (error) {
      results.push({
        testName: 'Basic Authentication Test',
        status: 'failed',
        duration: Date.now() - startTime,
        authenticationStatus: 'error',
        error: String(error)
      });
    }

    // Test 2: Streaming Authentication
    try {
      const testStartTime = Date.now();
      const sessionId = `streaming_test_${Date.now()}`;
      let streamedContent = '';
      
      await this.enhancedAICoach.sendStreamingMessage(
        'Test streaming message',
        sessionId,
        true,
        'guide',
        'en',
        {
          onChunk: (chunk: string) => {
            streamedContent += chunk;
          },
          onComplete: (fullResponse: string) => {
            console.log('Streaming complete:', fullResponse.length);
          },
          onError: (error: Error) => {
            console.error('Streaming error:', error);
          }
        }
      );
      
      results.push({
        testName: 'Streaming Authentication Test',
        status: streamedContent.length > 0 ? 'passed' : 'failed',
        duration: Date.now() - testStartTime,
        authenticationStatus: streamedContent.length > 0 ? 'authenticated' : 'error',
        details: {
          streamedLength: streamedContent.length,
          conversationId: sessionId
        }
      });
    } catch (error) {
      results.push({
        testName: 'Streaming Authentication Test',
        status: 'failed',
        duration: Date.now() - startTime,
        authenticationStatus: 'error',
        error: String(error)
      });
    }

    const passed = results.filter(r => r.status === 'passed').length;
    const failed = results.filter(r => r.status === 'failed').length;
    
    const overallAuthStatus: 'passed' | 'failed' | 'partial' = 
      failed === 0 ? 'passed' : 
      passed === 0 ? 'failed' : 'partial';

    return {
      suiteName: 'Streaming Authentication Test Suite',
      totalTests: results.length,
      passed,
      failed,
      duration: Date.now() - startTime,
      results,
      overallAuthStatus
    };
  }
}

export const streamingAuthTestSuite = new StreamingAuthTestSuite();
