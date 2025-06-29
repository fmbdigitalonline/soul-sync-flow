
import { supabase } from "@/integrations/supabase/client";
import { ACSConfig, DialogueHealthMetrics, DialogueState, PromptStrategyConfig } from "@/types/acs-types";

export interface ACSRealAIIntegration {
  sendMessage: (message: string, config: ACSConfig, currentState: DialogueState) => Promise<{
    response: string;
    newState: DialogueState;
    metrics: DialogueHealthMetrics;
    promptModifications: PromptStrategyConfig;
    evidence: any;
  }>;
  generateModifiedSystemPrompt: (basePrompt: string, config: PromptStrategyConfig, userMessage: string) => string;
  detectFrustrationPatterns: (message: string, conversationHistory: any[]) => Promise<number>;
  calculateSentimentSlope: (messages: any[]) => number;
  measureResponseTime: () => Promise<number>;
}

class ACSRealAIIntegrationService implements ACSRealAIIntegration {
  private conversationHistory: any[] = [];
  private lastMessageTime: number = Date.now();
  private sentimentHistory: number[] = [];

  async sendMessage(
    message: string, 
    config: ACSConfig, 
    currentState: DialogueState
  ) {
    const startTime = performance.now();
    
    // Calculate real-time metrics
    const metrics = await this.calculateRealTimeMetrics(message);
    
    // Generate state-aware prompt modifications
    const promptModifications = this.generatePromptModifications(currentState, config, metrics);
    
    // Create modified system prompt
    const basePrompt = "You are a helpful AI assistant. Respond naturally and helpfully to user questions.";
    const modifiedPrompt = this.generateModifiedSystemPrompt(basePrompt, promptModifications, message);
    
    console.log(`🤖 ACS Real AI Integration - Sending message with state: ${currentState}`);
    console.log(`📊 Current metrics:`, metrics);
    console.log(`🔧 Prompt modifications:`, promptModifications);
    
    try {
      // Call real AI coach service with ACS-enhanced prompts
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId: `acs_test_${Date.now()}`,
          systemPrompt: modifiedPrompt,
          temperature: promptModifications.temperatureAdjustment || 0.7,
          maxTokens: promptModifications.maxTokens || 150,
          includeBlueprint: false,
          agentType: "guide",
          language: "en"
        },
      });

      if (error) throw error;

      const response = data.response;
      const responseTime = performance.now() - startTime;
      
      // Update conversation history
      this.conversationHistory.push({
        user: message,
        assistant: response,
        timestamp: Date.now(),
        state: currentState,
        metrics,
        responseTime
      });
      
      // Determine new state based on response and metrics
      const newState = await this.determineNewState(response, metrics, config);
      
      // Collect evidence
      const evidence = {
        originalMessage: message,
        modifiedPrompt: modifiedPrompt,
        response,
        responseTime,
        stateTransition: { from: currentState, to: newState },
        metrics,
        promptModifications,
        timestamp: new Date().toISOString()
      };
      
      console.log(`✅ ACS Real AI Response generated in ${responseTime.toFixed(2)}ms`);
      console.log(`🔄 State transition: ${currentState} → ${newState}`);
      
      return {
        response,
        newState,
        metrics: {
          ...metrics,
          timestamp: Date.now()
        },
        promptModifications,
        evidence
      };
      
    } catch (error) {
      console.error("❌ ACS Real AI Integration error:", error);
      
      // Fallback response with evidence of failure
      const fallbackResponse = currentState === 'FRUSTRATION_DETECTED' 
        ? "I apologize for the confusion. Let me try to help you better. Could you please rephrase your question?"
        : "I understand your question. Let me help you with that.";
        
      return {
        response: fallbackResponse,
        newState: 'NORMAL' as DialogueState,
        metrics: {
          ...metrics,
          timestamp: Date.now()
        },
        promptModifications,
        evidence: {
          error: error.message,
          fallbackUsed: true,
          timestamp: new Date().toISOString()
        }
      };
    }
  }

  generateModifiedSystemPrompt(basePrompt: string, config: PromptStrategyConfig, userMessage: string): string {
    let modifiedPrompt = basePrompt;
    
    // Apply apology prefix for frustration states
    if (config.apologyPrefix) {
      modifiedPrompt = "I apologize for any confusion. " + modifiedPrompt;
    }
    
    // Modify persona style
    switch (config.personaStyle) {
      case 'empathetic':
        modifiedPrompt += " Be especially empathetic and understanding in your response.";
        break;
      case 'clarifying':
        modifiedPrompt += " Focus on clarifying any confusion and asking helpful questions.";
        break;
      case 'encouraging':
        modifiedPrompt += " Be encouraging and supportive in your response.";
        break;
      case 'direct':
        modifiedPrompt += " Be direct and concise in your response.";
        break;
    }
    
    // Add check-in functionality
    if (config.checkInEnabled) {
      modifiedPrompt += " If appropriate, check in with the user about their needs.";
    }
    
    // Add system prompt modifier
    if (config.systemPromptModifier) {
      modifiedPrompt += " " + config.systemPromptModifier;
    }
    
    return modifiedPrompt;
  }

  private async calculateRealTimeMetrics(message: string): Promise<DialogueHealthMetrics> {
    const currentTime = Date.now();
    const timeSinceLastMessage = currentTime - this.lastMessageTime;
    
    // Calculate conversation velocity (simplified as words per second)
    const wordCount = message.split(' ').length;
    const conversationVelocity = timeSinceLastMessage > 0 ? (wordCount / (timeSinceLastMessage / 1000)) : 0;
    
    // Simple sentiment analysis (negative words detection)
    const negativeWords = ['stupid', 'bad', 'hate', 'wrong', 'terrible', 'awful', 'frustrated', 'angry', 'cant', 'dont', 'wont', 'not working'];
    const sentiment = negativeWords.some(word => message.toLowerCase().includes(word)) ? -0.8 : 0.2;
    this.sentimentHistory.push(sentiment);
    
    // Calculate sentiment slope
    const sentimentSlope = this.calculateSentimentSlope(this.sentimentHistory);
    
    // Detect frustration patterns
    const frustrationScore = await this.detectFrustrationPatterns(message, this.conversationHistory);
    
    // Detect help signals
    const helpSignals = this.detectHelpSignals(message);
    
    this.lastMessageTime = currentTime;
    
    return {
      conversationVelocity,
      sentimentSlope,
      silentDuration: 0, // Will be calculated separately for idle detection
      frustrationScore,
      helpSignals,
      timestamp: currentTime
    };
  }

  async detectFrustrationPatterns(message: string, conversationHistory: any[]): Promise<number> {
    let frustrationScore = 0;
    
    // Direct frustration indicators
    const frustrationKeywords = [
      'stupid', 'dumb', 'not working', 'dont understand', 'bad advice', 
      'not helping', 'frustrated', 'annoying', 'useless', 'terrible'
    ];
    
    const messageLower = message.toLowerCase();
    frustrationKeywords.forEach(keyword => {
      if (messageLower.includes(keyword)) {
        frustrationScore += 0.3;
      }
    });
    
    // Repetitive patterns
    const recentMessages = conversationHistory.slice(-5);
    const duplicates = recentMessages.filter(msg => 
      msg.user && msg.user.toLowerCase().trim() === messageLower.trim()
    );
    if (duplicates.length > 1) {
      frustrationScore += 0.4;
    }
    
    // Short, negative responses
    if (message.length < 10 && (messageLower.includes('no') || messageLower.includes('why'))) {
      frustrationScore += 0.2;
    }
    
    return Math.min(frustrationScore, 1.0);
  }

  calculateSentimentSlope(sentimentHistory: number[]): number {
    if (sentimentHistory.length < 3) return 0;
    
    const recent = sentimentHistory.slice(-3);
    const slope = (recent[recent.length - 1] - recent[0]) / recent.length;
    return slope;
  }

  private detectHelpSignals(message: string): any[] {
    const signals = [];
    const messageLower = message.toLowerCase();
    
    // Confusion patterns
    if (messageLower.includes('what') || messageLower.includes('how') || messageLower.includes('why')) {
      signals.push({
        type: 'confusion_pattern',
        confidence: 0.7,
        message: 'User asking clarification questions',
        timestamp: Date.now()
      });
    }
    
    // Negative feedback
    if (messageLower.includes('not') || messageLower.includes('dont') || messageLower.includes('cant')) {
      signals.push({
        type: 'negative_feedback',
        confidence: 0.8,
        message: 'User expressing negative sentiment',
        timestamp: Date.now()
      });
    }
    
    return signals;
  }

  private generatePromptModifications(
    currentState: DialogueState, 
    config: ACSConfig, 
    metrics: DialogueHealthMetrics
  ): PromptStrategyConfig {
    const modifications: PromptStrategyConfig = {};
    
    switch (currentState) {
      case 'FRUSTRATION_DETECTED':
        modifications.apologyPrefix = true;
        modifications.personaStyle = 'empathetic';
        modifications.temperatureAdjustment = 0.3; // More focused responses
        modifications.checkInEnabled = true;
        modifications.systemPromptModifier = "The user seems frustrated. Be extra helpful and apologetic.";
        break;
        
      case 'CLARIFICATION_NEEDED':
        modifications.personaStyle = 'clarifying';
        modifications.temperatureAdjustment = 0.5;
        modifications.checkInEnabled = true;
        modifications.systemPromptModifier = "Ask clarifying questions to better understand the user's needs.";
        break;
        
      case 'IDLE':
        modifications.personaStyle = 'encouraging';
        modifications.checkInEnabled = true;
        modifications.systemPromptModifier = "The user has been inactive. Gently check in and offer assistance.";
        break;
        
      case 'HIGH_ENGAGEMENT':
        modifications.personaStyle = 'encouraging';
        modifications.temperatureAdjustment = 0.8; // More creative responses
        break;
        
      default:
        modifications.personaStyle = 'neutral';
        modifications.temperatureAdjustment = 0.7;
    }
    
    return modifications;
  }

  private async determineNewState(
    response: string, 
    metrics: DialogueHealthMetrics, 
    config: ACSConfig
  ): Promise<DialogueState> {
    // State transition logic based on real metrics
    if (metrics.frustrationScore >= config.frustrationThreshold) {
      return 'FRUSTRATION_DETECTED';
    }
    
    if (metrics.sentimentSlope <= config.sentimentSlopeNeg) {
      return 'CLARIFICATION_NEEDED';
    }
    
    if (metrics.conversationVelocity >= config.velocityFloor * 2) {
      return 'HIGH_ENGAGEMENT';
    }
    
    if (metrics.helpSignals.length > 0) {
      return 'CLARIFICATION_NEEDED';
    }
    
    return 'NORMAL';
  }

  async measureResponseTime(): Promise<number> {
    const startTime = performance.now();
    
    // Simulate a minimal AI call to measure baseline response time
    try {
      const { data } = await supabase.functions.invoke("ai-coach", {
        body: {
          message: "test",
          sessionId: `timing_test_${Date.now()}`,
          systemPrompt: "Respond with just 'ok'",
          maxTokens: 5
        },
      });
      
      return performance.now() - startTime;
    } catch (error) {
      return performance.now() - startTime; // Return time even if failed
    }
  }
}

export const acsRealAIIntegrationService = new ACSRealAIIntegrationService();
