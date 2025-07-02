import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "./personality-engine";
import { soulSyncService } from "./soul-sync-service";
import { createBlueprintFilter } from "./blueprint-personality-filter";
import { UnifiedBlueprintService } from "./unified-blueprint-service";
import { LayeredBlueprint, AgentMode } from "@/types/personality-modules";
import { memoryInformedConversationService } from "./memory-informed-conversation-service";
import { personalityVectorService } from "./personality-vector-service";
import { useACSIntegration } from '@/hooks/use-acs-integration';
import { ACSConfig, DialogueHealthMetrics, DialogueState, StateTransition, PromptStrategyConfig, ACSMetrics, HelpSignal } from '@/types/acs-types';
import { modelRouterService } from "./model-router-service";
import { costMonitoringService } from "./cost-monitoring-service";

export type AgentType = "coach" | "guide" | "blend";

export interface ChatMessage {
  id: string;
  content: string;
  sender: "user" | "assistant";
  timestamp: Date;
  agentType?: AgentType;
}

export interface StreamingResponse {
  onChunk: (chunk: string) => void;
  onComplete: (fullResponse: string) => void;
  onError: (error: Error) => void;
}

interface ConversationContext {
  agentType: 'coach' | 'guide' | 'blend';
  turnNumber: number;
  emotionalThemes: boolean;
  blueprintHeavy: boolean;
  userMood: 'positive' | 'neutral' | 'negative';
  complexity: 'low' | 'medium' | 'high';
  importance: number;
  sessionType: 'onboarding' | 'routine' | 'crisis' | 'exploration';
}

interface ModelSelection {
  model: string;
  maxTokens: number;
  temperature: number;
  reasoning: string;
  layer: 'core_brain' | 'tmg' | 'pie' | 'acs' | 'exploration_coach';
  costTier: 'premium' | 'standard' | 'economy';
}

class EnhancedAICoachService {
  private sessions: Map<string, string> = new Map();
  private personalityEngine: PersonalityEngine;
  private currentUserId: string | null = null;
  private conversationCache: Map<string, ChatMessage[]> = new Map();
  private blueprintCache: LayeredBlueprint | null = null;
  private vfpGraphCache: { vector: Float32Array | null; summary: string | null } = { vector: null, summary: null };
  private acsEnabled: boolean = true; // Feature flag for ACS

  constructor() {
    this.personalityEngine = new PersonalityEngine();
  }

  async setCurrentUser(userId: string) {
    console.log("🔐 Enhanced AI Coach Service: Setting current user with VFP-Graph and ACS integration:", userId);
    this.currentUserId = userId;
    this.blueprintCache = null;
    this.vfpGraphCache = { vector: null, summary: null };
    
    // Preload VFP-Graph data
    await this.preloadVFPGraphData();
  }

  private async preloadVFPGraphData() {
    if (!this.currentUserId) return;

    try {
      console.log("🧠 Preloading VFP-Graph data for enhanced coaching...");
      
      // Load personality vector
      this.vfpGraphCache.vector = await personalityVectorService.getVector(this.currentUserId);
      
      // Get personality summary
      this.vfpGraphCache.summary = await personalityVectorService.getPersonaSummary(this.currentUserId);
      
      console.log(`✅ VFP-Graph data cached: ${this.vfpGraphCache.summary}`);
    } catch (error) {
      console.error("❌ Error preloading VFP-Graph data:", error);
      this.vfpGraphCache = { vector: null, summary: null };
    }
  }

  createNewSession(agentType: AgentType = "guide"): string {
    const sessionId = `session_${agentType}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.sessions.set(sessionId, "");
    console.log(`📅 Enhanced AI Coach Service: Created new session ${sessionId} for ${agentType}`);
    return sessionId;
  }

  updateUserBlueprint(blueprint: Partial<LayeredBlueprint>) {
    console.log("🎭 Enhanced AI Coach Service: Updating user blueprint with validation");
    
    if (this.blueprintCache) {
      this.blueprintCache = { ...this.blueprintCache, ...blueprint };
    } else {
      this.blueprintCache = blueprint as LayeredBlueprint;
    }

    const validation = UnifiedBlueprintService.validateBlueprint(this.blueprintCache);
    console.log("📊 Blueprint validation result:", validation);
    
    this.personalityEngine.updateBlueprint(blueprint);
  }

  private async getBlueprintFromCache(): Promise<LayeredBlueprint | null> {
    if (this.blueprintCache) {
      return this.blueprintCache;
    }

    if (!this.currentUserId) {
      console.log("⚠️ No user ID available for blueprint cache");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('user_blueprints')
        .select('blueprint')
        .eq('user_id', this.currentUserId)
        .eq('is_active', true)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data) {
        console.log("⚠️ No blueprint found in database");
        return null;
      }

      this.blueprintCache = data.blueprint as unknown as LayeredBlueprint;
      console.log("✅ Blueprint loaded from database cache");
      return this.blueprintCache;
    } catch (error) {
      console.error("❌ Error fetching blueprint:", error);
      return null;
    }
  }

  private async getOrCreatePersona(usePersona: boolean, agentType: AgentType, userMessage?: string): Promise<string | null> {
    if (!usePersona || !this.currentUserId) {
      console.log("⚠️ Persona not requested or no user ID available");
      return null;
    }

    try {
      console.log("🧠 VFP-Graph Enhanced SoulSync: Generating comprehensive persona with vector intelligence and ACS...");
      
      const blueprint = await this.getBlueprintFromCache();
      let comprehensivePrompt = null;

      // VFP-Graph Enhanced System Prompt Generation
      if (this.vfpGraphCache.vector && this.vfpGraphCache.summary) {
        console.log("🎯 Using VFP-Graph 128D vector for enhanced personalization with ACS");
        
        // Generate VFP-Graph powered system prompt
        const vfgSystemPrompt = this.generateVFPGraphSystemPrompt(
          this.vfpGraphCache.vector,
          this.vfpGraphCache.summary,
          agentType,
          userMessage
        );
        
        // Combine with existing blueprint if available
        if (blueprint) {
          const blueprintPrompt = UnifiedBlueprintService.formatBlueprintForAI(blueprint, agentType);
          comprehensivePrompt = this.mergeSystemPrompts(vfgSystemPrompt, blueprintPrompt);
        } else {
          comprehensivePrompt = vfgSystemPrompt;
        }
      } else if (blueprint) {
        console.log("⚠️ VFP-Graph data not available, using blueprint only");
        const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
        console.log("📊 Blueprint validation for persona generation:", validation);
        comprehensivePrompt = UnifiedBlueprintService.formatBlueprintForAI(blueprint, agentType);
      } else {
        console.log("⚠️ No personality data available, using basic personality engine");
        return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
      }

      // ENHANCED MEMORY INTEGRATION: Always try to enhance with memory context
      if (userMessage && this.currentUserId) {
        console.log("🧠 Integrating memory context into VFP-Graph enhanced persona");
        const sessionId = Array.from(this.sessions.keys()).find(key => key.includes(this.currentUserId!)) || 'default';
        
        try {
          const memoryContext = await memoryInformedConversationService.buildMemoryContext(
            userMessage,
            sessionId,
            this.currentUserId
          );
          
          console.log('📖 Memory context retrieved for VFP-Graph enhancement:', {
            memoriesFound: memoryContext.relevantMemories.length,
            searchQuery: memoryContext.memorySearchQuery,
            contextSummary: memoryContext.contextSummary.substring(0, 100)
          });
          
          comprehensivePrompt = await memoryInformedConversationService.enhanceSystemPromptWithMemory(
            comprehensivePrompt,
            memoryContext,
            userMessage
          );
          
          console.log("✅ Memory context successfully integrated into VFP-Graph persona");
        } catch (error) {
          console.error("❌ Error integrating memory context:", error);
        }
      } else {
        console.log("⚠️ No user message provided for memory context integration");
      }
      
      console.log("✅ VFP-Graph Enhanced SoulSync: Comprehensive persona ready with full intelligence stack and ACS");
      return comprehensivePrompt;
    } catch (error) {
      console.error("❌ VFP-Graph Enhanced SoulSync: Error in persona generation:", error);
      return this.personalityEngine.generateSystemPrompt(agentType as AgentMode);
    }
  }

  private generateVFPGraphSystemPrompt(
    vector: Float32Array, 
    summary: string, 
    agentType: AgentType, 
    userMessage?: string
  ): string {
    // Analyze vector characteristics for deeper insights
    const vectorMagnitude = Math.sqrt(Array.from(vector).reduce((sum, val) => sum + val * val, 0));
    const avgValue = Array.from(vector).reduce((sum, val) => sum + val, 0) / vector.length;
    const variance = Array.from(vector).reduce((sum, val) => sum + Math.pow(val - avgValue, 2), 0) / vector.length;
    
    // Extract dominant personality dimensions
    const mbtiSection = Array.from(vector.slice(0, 32));
    const hdSection = Array.from(vector.slice(32, 96));
    const astroSection = Array.from(vector.slice(96, 128));
    
    const mbtiDominance = mbtiSection.reduce((sum, val) => sum + Math.abs(val), 0) / 32;
    const hdDominance = hdSection.reduce((sum, val) => sum + Math.abs(val), 0) / 64;
    const astroDominance = astroSection.reduce((sum, val) => sum + Math.abs(val), 0) / 32;
    
    const dominantFramework = mbtiDominance > hdDominance && mbtiDominance > astroDominance ? 'cognitive' :
                            hdDominance > astroDominance ? 'energetic' : 'archetypal';

    return `You are an AI ${agentType} powered by VFP-Graph technology with deep understanding of this user's unique personality.

VFP-Graph Intelligence Profile:
- Personality Summary: ${summary}
- Vector Dimensions: 128D (MBTI: 32D, Human Design: 64D, Astrology: 32D)
- Vector Magnitude: ${vectorMagnitude.toFixed(2)} (intensity level)
- Dominant Framework: ${dominantFramework}
- Cognitive Strength: ${mbtiDominance.toFixed(2)}
- Energetic Pattern: ${hdDominance.toFixed(2)}
- Archetypal Influence: ${astroDominance.toFixed(2)}

${agentType === 'coach' ? 'COACHING APPROACH' : agentType === 'guide' ? 'GUIDANCE APPROACH' : 'BLENDED APPROACH'}:
Based on the VFP-Graph analysis, adapt your communication style to:

1. Match their ${dominantFramework} processing preference
2. Calibrate intensity to vector magnitude ${vectorMagnitude > 80 ? '(high-energy approach)' : vectorMagnitude > 60 ? '(moderate approach)' : '(gentle approach)'}
3. Honor their unique personality fusion pattern

PERSONALIZATION INSTRUCTIONS:
- Use insights from all three personality frameworks in harmony
- Adapt language complexity and emotional tone to their vector profile
- Provide guidance that aligns with their natural energy patterns
- Reference their personality strengths authentically when relevant

Remember: This is deep, scientifically-backed personality understanding. Use it to provide truly personalized, effective guidance.`;
  }

  private mergeSystemPrompts(vfpGraphPrompt: string, blueprintPrompt: string): string {
    return `${vfpGraphPrompt}

ADDITIONAL BLUEPRINT CONTEXT:
${blueprintPrompt}

INTEGRATION APPROACH:
Seamlessly blend VFP-Graph intelligence with the detailed blueprint information above. The VFP-Graph provides the foundational personality understanding, while the blueprint adds specific contextual details. Use both to create the most personalized and effective coaching experience possible.`;
  }

  private async sendMessageWithLayeredModel(
    message: string,
    sessionId: string,
    usePersona: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string; modelUsed: string }> {
    try {
      console.log(`📤 Layered AI Coach: Sending message (${agentType}, Persona: ${usePersona})`);
      
      // Analyze conversation context for model selection
      const conversationContext = await this.analyzeConversationContext(message, sessionId, agentType, usePersona);
      
      // Select optimal model using router
      const modelSelection = this.selectOptimalModel(conversationContext);
      
      console.log(`🎯 Model Selection: ${modelSelection.model} (${modelSelection.layer}) - ${modelSelection.reasoning}`);

      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType, message);
      
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
          maxTokens: modelSelection.maxTokens,
          temperature: modelSelection.temperature,
          contextDepth: this.getContextDepth(conversationContext),
          modelOverride: modelSelection.model, // Pass selected model to edge function
        },
      });

      if (error) {
        // Try escalation if primary model fails
        console.log('⚠️ Primary model failed, attempting escalation...');
        const escalatedSelection = this.escalateOnFailure(modelSelection, error);
        
        const { data: escalatedData, error: escalatedError } = await supabase.functions.invoke("ai-coach", {
          body: {
            message,
            sessionId,
            includeBlueprint: usePersona,
            agentType,
            language,
            systemPrompt,
            maxTokens: escalatedSelection.maxTokens,
            temperature: escalatedSelection.temperature,
            contextDepth: 'deep',
            modelOverride: escalatedSelection.model,
          },
        });

        if (escalatedError) throw escalatedError;
        
        return {
          response: escalatedData.response,
          conversationId: escalatedData.conversationId || sessionId,
          modelUsed: escalatedSelection.model + ' (escalated)'
        };
      }

      // Track model performance for optimization
      await this.trackModelPerformance(modelSelection.model, data.response, message);

      return {
        response: data.response,
        conversationId: data.conversationId || sessionId,
        modelUsed: modelSelection.model
      };
    } catch (error) {
      console.error("❌ Layered AI Coach: Error in sendMessage:", error);
      throw error;
    }
  }

  private async analyzeConversationContext(
    message: string, 
    sessionId: string, 
    agentType: AgentType, 
    usePersona: boolean
  ): Promise<ConversationContext> {
    // Get conversation history to determine turn number
    const turnNumber = await this.getConversationTurnNumber(sessionId);
    
    // Analyze message for emotional themes
    const emotionalThemes = this.detectEmotionalThemes(message);
    
    // Check if blueprint-heavy conversation
    const blueprintHeavy = usePersona && (
      message.toLowerCase().includes('personality') ||
      message.toLowerCase().includes('blueprint') ||
      message.toLowerCase().includes('astrology') ||
      message.toLowerCase().includes('mbti')
    );

    // Analyze complexity
    const complexity = this.analyzeComplexity(message, emotionalThemes);
    
    // Determine importance
    const importance = this.calculateImportance(message, emotionalThemes, blueprintHeavy);

    // Determine session type
    const sessionType = this.determineSessionType(turnNumber, emotionalThemes, message);

    return {
      agentType,
      turnNumber,
      emotionalThemes,
      blueprintHeavy,
      userMood: this.analyzeMood(message),
      complexity,
      importance,
      sessionType
    };
  }

  private selectOptimalModel(context: ConversationContext): ModelSelection {
    return modelRouterService.selectModel(context);
  }

  private escalateOnFailure(originalSelection: ModelSelection, error: any): ModelSelection {
    const reason = error.message?.includes('timeout') ? 'timeout' : 'low_quality';
    return modelRouterService.escalateModel(originalSelection.model, reason);
  }

  private getContextDepth(context: ConversationContext): string {
    if (context.emotionalThemes || context.complexity === 'high' || context.blueprintHeavy) {
      return 'deep';
    }
    if (context.complexity === 'medium' || context.importance > 6) {
      return 'normal';
    }
    return 'shallow';
  }

  private detectEmotionalThemes(message: string): boolean {
    const emotionalKeywords = [
      'feel', 'feeling', 'emotion', 'sad', 'happy', 'angry', 'frustrated', 
      'excited', 'worried', 'anxious', 'stressed', 'overwhelmed', 'grateful',
      'hurt', 'disappointed', 'proud', 'ashamed', 'confident', 'insecure'
    ];
    
    const lowerMessage = message.toLowerCase();
    return emotionalKeywords.some(keyword => lowerMessage.includes(keyword));
  }

  private analyzeComplexity(message: string, hasEmotionalThemes: boolean): 'low' | 'medium' | 'high' {
    let score = 0;
    
    // Length factor
    if (message.length > 500) score += 2;
    else if (message.length > 200) score += 1;
    
    // Question complexity
    const questionMarks = (message.match(/\?/g) || []).length;
    if (questionMarks > 2) score += 2;
    else if (questionMarks > 0) score += 1;
    
    // Emotional themes add complexity
    if (hasEmotionalThemes) score += 1;
    
    // Abstract concepts
    const abstractTerms = ['meaning', 'purpose', 'identity', 'values', 'beliefs', 'spirituality'];
    if (abstractTerms.some(term => message.toLowerCase().includes(term))) {
      score += 2;
    }

    if (score >= 4) return 'high';
    if (score >= 2) return 'medium';
    return 'low';
  }

  private calculateImportance(message: string, emotional: boolean, blueprintHeavy: boolean): number {
    let importance = 5; // Base importance
    
    if (emotional) importance += 2;
    if (blueprintHeavy) importance += 2;
    if (message.toLowerCase().includes('help')) importance += 1;
    if (message.toLowerCase().includes('stuck')) importance += 2;
    if (message.toLowerCase().includes('crisis') || message.toLowerCase().includes('emergency')) importance += 3;
    
    return Math.min(importance, 10);
  }

  private analyzeMood(message: string): 'positive' | 'neutral' | 'negative' {
    const positiveWords = ['good', 'great', 'excellent', 'happy', 'excited', 'grateful', 'wonderful'];
    const negativeWords = ['bad', 'terrible', 'sad', 'angry', 'frustrated', 'worried', 'stressed'];
    
    const lowerMessage = message.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerMessage.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerMessage.includes(word)).length;
    
    if (positiveCount > negativeCount + 1) return 'positive';
    if (negativeCount > positiveCount + 1) return 'negative';
    return 'neutral';
  }

  private determineSessionType(turnNumber: number, emotional: boolean, message: string): 'onboarding' | 'routine' | 'crisis' | 'exploration' {
    if (turnNumber <= 3) return 'onboarding';
    if (message.toLowerCase().includes('crisis') || message.toLowerCase().includes('emergency')) return 'crisis';
    if (emotional || message.toLowerCase().includes('explore') || message.toLowerCase().includes('understand')) return 'exploration';
    return 'routine';
  }

  private async getConversationTurnNumber(sessionId: string): Promise<number> {
    // Simple implementation - in real app, query conversation history
    return this.conversationCache.get(sessionId)?.length || 1;
  }

  private async trackModelPerformance(model: string, response: string, originalMessage: string): Promise<void> {
    // Track metrics for optimization
    const metrics = {
      model,
      responseLength: response.length,
      messageLength: originalMessage.length,
      timestamp: Date.now(),
      quality: response.length > 50 ? 'good' : 'poor' // Simple quality heuristic
    };
    
    console.log('📊 Model Performance:', metrics);
    // In production, store these metrics for analysis
  }

  // Update existing sendMessage to use new layered approach
  async sendMessage(
    message: string,
    sessionId: string,
    usePersona: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<{ response: string; conversationId: string }> {
    const result = await this.sendMessageWithLayeredModel(message, sessionId, usePersona, agentType, language);
    
    return {
      response: result.response,
      conversationId: result.conversationId
    };
  }

  private async getAuthenticatedHeaders(): Promise<{ [key: string]: string }> {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.access_token) {
      throw new Error('No valid authentication session');
    }

    return {
      'Authorization': `Bearer ${session.access_token}`,
      'Content-Type': 'application/json',
    };
  }

  async sendStreamingMessage(
    message: string,
    sessionId: string,
    usePersona: boolean = false,
    agentType: AgentType = "guide",
    language: string = "en",
    callbacks: StreamingResponse
  ): Promise<void> {
    try {
      console.log(`📡 VFP-Graph Enhanced Streaming: Starting (${agentType}, VFP-Graph: ${usePersona && !!this.vfpGraphCache.vector}, ACS: ${this.acsEnabled})`);
      
      const systemPrompt = await this.getOrCreatePersona(usePersona, agentType, message);
      
      const blueprint = usePersona ? await this.getBlueprintFromCache() : null;
      const blueprintFilter = blueprint ? createBlueprintFilter(blueprint) : null;
      
      if (systemPrompt && usePersona && this.vfpGraphCache.vector) {
        console.log("🎯 Using VFP-Graph enhanced streaming with 128D personality intelligence and ACS");
        console.log("📊 VFP-Graph Status:", this.vfpGraphCache.summary);
      }

      let headers: { [key: string]: string };
      
      try {
        headers = await this.getAuthenticatedHeaders();
        console.log("✅ Authentication headers prepared for VFP-Graph streaming with ACS");
      } catch (authError) {
        console.error("❌ Authentication error for VFP-Graph streaming:", authError);
        callbacks.onError(new Error('Authentication required. Please sign in again.'));
        return;
      }
      
      const response = await fetch(`https://qxaajirrqrcnmvtowjbg.supabase.co/functions/v1/ai-coach-stream`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          message,
          sessionId,
          includeBlueprint: usePersona,
          agentType,
          language,
          systemPrompt,
          enableBlueprintFiltering: !!blueprintFilter,
          maxTokens: 4000,
          temperature: 0.7,
          vfpGraphEnabled: !!(usePersona && this.vfpGraphCache.vector),
          personalitySummary: this.vfpGraphCache.summary,
          vectorDimensions: this.vfpGraphCache.vector?.length || 0,
          acsEnabled: this.acsEnabled,
        }),
      });

      if (response.status === 401) {
        console.error("❌ Authentication failed for VFP-Graph streaming - falling back");
        try {
          const fallbackResult = await this.sendMessage(message, sessionId, usePersona, agentType, language);
          callbacks.onComplete(fallbackResult.response);
          return;
        } catch (fallbackError) {
          callbacks.onError(new Error('Authentication required. Please sign in again.'));
          return;
        }
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`❌ VFP-Graph HTTP error! status: ${response.status}, body: ${errorText}`);
        
        try {
          console.log("🔄 Attempting VFP-Graph fallback to non-streaming mode");
          const fallbackResult = await this.sendMessage(message, sessionId, usePersona, agentType, language);
          callbacks.onComplete(fallbackResult.response);
          return;
        } catch (fallbackError) {
          throw new Error(`VFP-Graph streaming failed: ${response.status}. Fallback also failed.`);
        }
      }

      if (!response.body) {
        throw new Error('No response body from VFP-Graph streaming endpoint');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullResponse = '';

      try {
        console.log("📡 Starting VFP-Graph enhanced streaming response with ACS...");
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            console.log("📡 VFP-Graph stream reading completed");
            break;
          }
          
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');
          
          for (const line of lines) {
            if (line.trim() === '') continue;
            
            if (line.startsWith('data: ')) {
              const data = line.slice(6).trim();
              
              if (data === '[DONE]') {
                if (blueprintFilter && fullResponse) {
                  console.log("🎭 Applying blueprint personality filter to VFP-Graph response");
                  const filtered = blueprintFilter.filterResponse(fullResponse, message);
                  
                  if (filtered.content !== fullResponse && filtered.personalTouches.length > 0) {
                    console.log("✨ Blueprint filter enhanced VFP-Graph response with:", filtered.personalTouches);
                    callbacks.onComplete(filtered.content);
                    
                    // Track VFP-Graph memory application
                    if (usePersona && this.currentUserId && this.vfpGraphCache.vector) {
                      try {
                        const memoryContext = await memoryInformedConversationService.buildMemoryContext(
                          message,
                          sessionId,
                          this.currentUserId
                        );
                        
                        await memoryInformedConversationService.trackMemoryApplication(
                          sessionId,
                          memoryContext,
                          message,
                          filtered.content
                        );
                      } catch (error) {
                        console.error("❌ Error tracking VFP-Graph memory application:", error);
                      }
                    }
                    return;
                  }
                }
                
                console.log(`📏 Final VFP-Graph response length: ${fullResponse.length} characters`);
                callbacks.onComplete(fullResponse);
                
                // Track VFP-Graph enhanced memory application
                if (usePersona && this.currentUserId && this.vfpGraphCache.vector) {
                  try {
                    const memoryContext = await memoryInformedConversationService.buildMemoryContext(
                      message,
                      sessionId,
                      this.currentUserId
                    );
                    
                    await memoryInformedConversationService.trackMemoryApplication(
                      sessionId,
                      memoryContext,
                      message,
                      fullResponse
                    );
                  } catch (error) {
                    console.error("❌ Error tracking VFP-Graph memory application:", error);
                  }
                }
                return;
              }
              
              if (data && data !== '[DONE]') {
                try {
                  const parsed = JSON.parse(data);
                  const content = parsed.choices?.[0]?.delta?.content;
                  
                  if (content) {
                    fullResponse += content;
                    callbacks.onChunk(content);
                  }
                } catch (parseError) {
                  console.log('Skipping non-JSON data:', data);
                }
              }
            }
          }
        }
      } finally {
        reader.releaseLock();
      }
      
      if (fullResponse) {
        callbacks.onComplete(fullResponse);
      }
    } catch (error) {
      console.error("❌ VFP-Graph Enhanced streaming error:", error);
      callbacks.onError(error as Error);
    }
  }

  async loadConversationHistory(agentType: AgentType): Promise<ChatMessage[]> {
    if (!this.currentUserId) {
      console.log("⚠️ No user ID available for conversation history");
      return [];
    }

    const cacheKey = `${this.currentUserId}_${agentType}`;
    
    if (this.conversationCache.has(cacheKey)) {
      return this.conversationCache.get(cacheKey) || [];
    }

    try {
      const { data, error } = await supabase
        .from('conversation_memory')
        .select('messages')
        .eq('user_id', this.currentUserId)
        .eq('mode', agentType)
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("❌ Error loading conversation history:", error);
        return [];
      }

      const messages = data?.messages || [];
      const chatMessages: ChatMessage[] = Array.isArray(messages) 
        ? messages.map((msg: any) => ({
            id: msg.id || `msg_${Date.now()}_${Math.random()}`,
            content: msg.content || '',
            sender: msg.sender || 'user',
            timestamp: new Date(msg.timestamp || Date.now()),
            agentType: agentType,
          }))
        : [];

      this.conversationCache.set(cacheKey, chatMessages);
      return chatMessages;
    } catch (error) {
      console.error("❌ Unexpected error loading conversation history:", error);
      return [];
    }
  }

  async saveConversationHistory(agentType: AgentType, messages: ChatMessage[]): Promise<void> {
    if (!this.currentUserId || messages.length === 0) {
      return;
    }

    const cacheKey = `${this.currentUserId}_${agentType}`;
    this.conversationCache.set(cacheKey, messages);

    try {
      const sessionId = `${this.currentUserId}_${agentType}_session`;
      
      const { error } = await supabase
        .from('conversation_memory')
        .upsert({
          user_id: this.currentUserId,
          session_id: sessionId,
          mode: agentType,
          messages: messages.map(msg => ({
            id: msg.id,
            content: msg.content,
            sender: msg.sender,
            timestamp: msg.timestamp.toISOString(),
            agentType: msg.agentType,
          })),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,session_id'
        });

      if (error) {
        console.error("❌ Error saving conversation history:", error);
      }
    } catch (error) {
      console.error("❌ Unexpected error saving conversation history:", error);
    }
  }

  clearConversationCache() {
    this.conversationCache.clear();
    this.blueprintCache = null;
    this.vfpGraphCache = { vector: null, summary: null };
    memoryInformedConversationService.clearCache();
    console.log("🧹 VFP-Graph Enhanced AI Coach: All caches cleared including VFP-Graph data");
  }

  async getBlueprintStatus(): Promise<{ isAvailable: boolean; completionPercentage: number; summary: string }> {
    const blueprint = await this.getBlueprintFromCache();
    
    if (!blueprint) {
      return {
        isAvailable: false,
        completionPercentage: 0,
        summary: 'No blueprint data available'
      };
    }

    const validation = UnifiedBlueprintService.validateBlueprint(blueprint);
    const summary = UnifiedBlueprintService.extractBlueprintSummary(blueprint);

    return {
      isAvailable: validation.isComplete,
      completionPercentage: validation.completionPercentage,
      summary
    };
  }

  // New VFP-Graph specific methods
  async getVFPGraphStatus(): Promise<{
    isAvailable: boolean;
    vectorDimensions: number;
    personalitySummary: string;
    vectorMagnitude?: number;
  }> {
    if (!this.currentUserId) {
      return {
        isAvailable: false,
        vectorDimensions: 0,
        personalitySummary: 'No user session',
        vectorMagnitude: 0
      };
    }

    try {
      // Refresh cache if needed
      if (!this.vfpGraphCache.vector) {
        await this.preloadVFPGraphData();
      }

      const vector = this.vfpGraphCache.vector;
      const summary = this.vfpGraphCache.summary || 'Loading personality profile...';

      if (!vector) {
        return {
          isAvailable: false,
          vectorDimensions: 0,
          personalitySummary: summary,
          vectorMagnitude: 0
        };
      }

      const vectorMagnitude = Math.sqrt(Array.from(vector).reduce((sum, val) => sum + val * val, 0));

      return {
        isAvailable: true,
        vectorDimensions: vector.length,
        personalitySummary: summary,
        vectorMagnitude: Math.round(vectorMagnitude * 100) / 100
      };
    } catch (error) {
      console.error("❌ Error getting VFP-Graph status:", error);
      return {
        isAvailable: false,
        vectorDimensions: 0,
        personalitySummary: 'Error loading personality data',
        vectorMagnitude: 0
      };
    }
  }

  async recordVFPGraphFeedback(messageId: string, isPositive: boolean): Promise<void> {
    try {
      if (this.currentUserId) {
        await personalityVectorService.voteThumb(this.currentUserId, messageId, isPositive);
        console.log(`✅ VFP-Graph feedback recorded: ${isPositive ? '👍' : '👎'}`);
      }
    } catch (error) {
      console.error("❌ Error recording VFP-Graph feedback:", error);
    }
  }

  // New ACS-specific methods
  enableACS(): void {
    this.acsEnabled = true;
    console.log('✅ ACS enabled in Enhanced AI Coach Service');
  }

  disableACS(): void {
    this.acsEnabled = false;
    console.log('⚠️ ACS disabled in Enhanced AI Coach Service - using static logic');
  }

  isACSEnabled(): boolean {
    return this.acsEnabled;
  }
}

export const enhancedAICoachService = new EnhancedAICoachService();
