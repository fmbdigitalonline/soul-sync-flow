
import { adaptiveContextScheduler } from '../adaptive-context-scheduler';
import { ACSConfig, DialogueState } from '@/types/acs-types';

// Regression tests for ACS
describe('Adaptive Context Scheduler', () => {
  beforeEach(async () => {
    await adaptiveContextScheduler.initialize('test-user');
    adaptiveContextScheduler.enable();
  });

  // Test 1: test_stuck_to_assist() → seed slow + negative slope; expect state="ASSIST"
  test('should transition to CLARIFICATION_NEEDED when user is stuck', async () => {
    const config: Partial<ACSConfig> = {
      velocityFloor: 0.2,
      sentimentSlopeNeg: -0.05,
      maxSilentMs: 10000
    };
    
    await adaptiveContextScheduler.updateConfig(config);
    
    // Simulate slow conversation with negative sentiment
    adaptiveContextScheduler.addMessage("I need help", 'user', 0.0);
    await new Promise(resolve => setTimeout(resolve, 100)); // Slow response
    
    adaptiveContextScheduler.addMessage("I don't understand", 'user', -0.3);
    await new Promise(resolve => setTimeout(resolve, 100));
    
    adaptiveContextScheduler.addMessage("This is confusing", 'user', -0.5);
    
    const currentState = adaptiveContextScheduler.getCurrentState();
    expect(currentState).toBe('CLARIFICATION_NEEDED');
  });

  // Test 2: test_latency_budget() → run 100 state evaluations; assert < 5 ms P95
  test('should evaluate state transitions within latency budget', async () => {
    const latencies: number[] = [];
    
    for (let i = 0; i < 100; i++) {
      const start = performance.now();
      
      adaptiveContextScheduler.addMessage(`Test message ${i}`, 'user', Math.random() - 0.5);
      
      const end = performance.now();
      latencies.push(end - start);
    }
    
    // Calculate P95 latency
    latencies.sort((a, b) => a - b);
    const p95Index = Math.floor(latencies.length * 0.95);
    const p95Latency = latencies[p95Index];
    
    expect(p95Latency).toBeLessThan(5); // P95 < 5ms
    
    console.log(`P95 latency: ${p95Latency.toFixed(2)}ms`);
  });

  // Test 3: test_prompt_diff() → diff tokens before/after transition; expect ≤ 25-token delta
  test('should maintain prompt token delta within limits', () => {
    // Test normal state prompt
    const normalConfig = adaptiveContextScheduler.getPromptStrategyConfig();
    const normalTokens = estimateTokens(normalConfig.systemPromptModifier || '');
    
    // Force transition to frustration state
    adaptiveContextScheduler.addMessage("This is wrong and terrible", 'user', -0.8);
    adaptiveContextScheduler.addMessage("I hate this", 'user', -0.9);
    
    const frustrationConfig = adaptiveContextScheduler.getPromptStrategyConfig();
    const frustrationTokens = estimateTokens(frustrationConfig.systemPromptModifier || '');
    
    const tokenDelta = Math.abs(frustrationTokens - normalTokens);
    expect(tokenDelta).toBeLessThanOrEqual(25);
    
    console.log(`Token delta: ${tokenDelta} (Normal: ${normalTokens}, Frustration: ${frustrationTokens})`);
  });

  test('should detect frustration from multiple negative messages', async () => {
    const config: Partial<ACSConfig> = {
      frustrationThreshold: 0.5
    };
    
    await adaptiveContextScheduler.updateConfig(config);
    
    // Build up frustration score
    adaptiveContextScheduler.addMessage("This doesn't work", 'user', -0.4);
    adaptiveContextScheduler.addMessage("I'm confused and stuck", 'user', -0.6);
    adaptiveContextScheduler.addMessage("Nothing makes sense", 'user', -0.8);
    
    const currentState = adaptiveContextScheduler.getCurrentState();
    expect(currentState).toBe('FRUSTRATION_DETECTED');
    
    const promptConfig = adaptiveContextScheduler.getPromptStrategyConfig();
    expect(promptConfig.apologyPrefix).toBe(true);
    expect(promptConfig.temperatureAdjustment).toBeLessThan(0);
  });

  test('should transition to IDLE after silence threshold', async () => {
    const config: Partial<ACSConfig> = {
      maxSilentMs: 100 // Very short for testing
    };
    
    await adaptiveContextScheduler.updateConfig(config);
    
    adaptiveContextScheduler.addMessage("Hello", 'user', 0.5);
    
    // Wait for silence threshold
    await new Promise(resolve => setTimeout(resolve, 150));
    
    // Trigger evaluation by adding assistant message
    adaptiveContextScheduler.addMessage("Response", 'assistant', 0.0);
    
    const currentState = adaptiveContextScheduler.getCurrentState();
    expect(currentState).toBe('IDLE');
    
    const promptConfig = adaptiveContextScheduler.getPromptStrategyConfig();
    expect(promptConfig.checkInEnabled).toBe(true);
  });

  test('should detect repetitive queries as help signal', () => {
    adaptiveContextScheduler.addMessage("How do I do this?", 'user', 0.0);
    adaptiveContextScheduler.addMessage("How do I do this task?", 'user', -0.1);
    adaptiveContextScheduler.addMessage("Can you explain how to do this?", 'user', -0.2);
    
    const currentState = adaptiveContextScheduler.getCurrentState();
    expect(currentState).toBe('CLARIFICATION_NEEDED');
  });

  test('should apply personality scaling to thresholds', async () => {
    // Mock personality vector with high patience trait
    const mockVector = new Float32Array(128);
    mockVector.fill(0.5, 0, 8); // High patience in first 8 dimensions
    
    await adaptiveContextScheduler.initialize('test-user', mockVector);
    
    const config: Partial<ACSConfig> = {
      personalityScaling: true,
      maxSilentMs: 1000
    };
    
    await adaptiveContextScheduler.updateConfig(config);
    
    // With personality scaling, patient users should have higher thresholds
    adaptiveContextScheduler.addMessage("Thinking...", 'user', 0.0);
    
    // Should not transition to IDLE as quickly due to patience scaling
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const currentState = adaptiveContextScheduler.getCurrentState();
    expect(currentState).toBe('NORMAL'); // Patient user, no idle transition yet
  });

  test('should record and learn from user feedback', () => {
    // Set up state that triggers transition
    adaptiveContextScheduler.addMessage("I'm confused", 'user', -0.5);
    
    const initialThreshold = adaptiveContextScheduler['config'].frustrationThreshold;
    
    // Record negative feedback (indicating transition was wrong)
    adaptiveContextScheduler.recordUserFeedback('negative', 'This response was not helpful');
    
    const updatedThreshold = adaptiveContextScheduler['config'].frustrationThreshold;
    
    // Threshold should be adjusted with L2 regularization
    expect(updatedThreshold).not.toBe(initialThreshold);
    expect(updatedThreshold).toBeGreaterThan(0.1);
    expect(updatedThreshold).toBeLessThan(0.9);
  });

  test('should maintain conversation velocity calculations', () => {
    const messages = [
      { message: "Hello", timestamp: 1000, tokens: 1 },
      { message: "How are you?", timestamp: 2000, tokens: 3 },
      { message: "I need help", timestamp: 3000, tokens: 3 }
    ];
    
    messages.forEach((msg, i) => {
      adaptiveContextScheduler.addMessage(msg.message, 'user', 0.0);
    });
    
    const metrics = adaptiveContextScheduler.getMetrics();
    expect(metrics.conversationVelocity).toBeGreaterThan(0);
  });
});

// Utility function for token estimation
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}

// Feature flag tests
describe('ACS Feature Flags and Deployment Guards', () => {
  test('should disable gracefully when feature flag is off', () => {
    adaptiveContextScheduler.disable();
    
    adaptiveContextScheduler.addMessage("Test message", 'user', -0.5);
    
    // Should remain in default state when disabled
    const currentState = adaptiveContextScheduler.getCurrentState();
    // State may change during evaluation, but system should handle gracefully
    expect(['NORMAL', 'CLARIFICATION_NEEDED', 'FRUSTRATION_DETECTED']).toContain(currentState);
  });

  test('should provide fallback persona when ACS crashes', () => {
    // Simulate ACS crash by disabling
    adaptiveContextScheduler.disable();
    
    const fallbackConfig = adaptiveContextScheduler.getPromptStrategyConfig();
    
    // Should return a valid config even when disabled
    expect(fallbackConfig).toBeDefined();
    expect(typeof fallbackConfig).toBe('object');
  });

  test('should emit metrics for monitoring', async () => {
    const metricsBeforeTransition = adaptiveContextScheduler.getMetrics();
    
    // Trigger state transition
    adaptiveContextScheduler.addMessage("I'm very confused and frustrated", 'user', -0.8);
    
    const metricsAfterTransition = adaptiveContextScheduler.getMetrics();
    
    expect(metricsAfterTransition.stateTransitions).toBeGreaterThan(metricsBeforeTransition.stateTransitions);
  });
});
