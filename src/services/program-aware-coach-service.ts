import { v4 as uuidv4 } from 'uuid';
import { EnhancedAICoachService, AgentType } from "./enhanced-ai-coach-service";
import { MemoryInformedConversationService } from "./memory-informed-conversation-service";
import { UnifiedBlueprintService } from "./unified-blueprint-service";

export interface ProgramState {
  currentModule: string | null;
  currentLesson: string | null;
  completedModules: string[];
  completedLessons: string[];
  engagementScore: number;
  lastInteraction: Date | null;
}

export class ProgramAwareCoachService {
  private programState: ProgramState = {
    currentModule: null,
    currentLesson: null,
    completedModules: [],
    completedLessons: [],
    engagementScore: 0,
    lastInteraction: null,
  };
  private enhancedCoach: EnhancedAICoachService;
  private memoryService: MemoryInformedConversationService;
  private blueprintService: UnifiedBlueprintService;
  private userId: string | null = null;

  constructor(
    enhancedCoach: EnhancedAICoachService,
    memoryService: MemoryInformedConversationService,
    blueprintService: UnifiedBlueprintService
  ) {
    this.enhancedCoach = enhancedCoach;
    this.memoryService = memoryService;
    this.blueprintService = blueprintService;
  }

  async initialize(userId: string): Promise<void> {
    this.userId = userId;
    await this.loadProgramState();
    console.log(`🌱 Program-Aware Coach Service: Initialized for user ${userId}`);
  }

  async loadProgramState(): Promise<void> {
    if (!this.userId) {
      console.warn("No user ID set, cannot load program state.");
      return;
    }

    try {
      // Load program state from database or other storage
      // For now, let's simulate loading the state
      this.programState = {
        currentModule: "Module 1: Introduction to Creative Thinking",
        currentLesson: "Lesson 1.1: Understanding Your Creative Self",
        completedModules: [],
        completedLessons: [],
        engagementScore: 75,
        lastInteraction: new Date(),
      };
      console.log("✅ Program-Aware Coach Service: Program state loaded");
    } catch (error) {
      console.error("❌ Program-Aware Coach Service: Error loading program state:", error);
    }
  }

  async saveProgramState(): Promise<void> {
    if (!this.userId) {
      console.warn("No user ID set, cannot save program state.");
      return;
    }

    try {
      // Save program state to database or other storage
      // For now, let's simulate saving the state
      console.log("💾 Program-Aware Coach Service: Program state saved");
    } catch (error) {
      console.error("❌ Program-Aware Coach Service: Error saving program state:", error);
    }
  }

  async updateProgramState(userMessage: string, aiResponse: string): Promise<void> {
    // Update program state based on user message and AI response
    // For example, check if the user has completed a lesson or module
    // and update the program state accordingly
    this.programState.engagementScore += 1;
    this.programState.lastInteraction = new Date();
    await this.saveProgramState();
    console.log("📈 Program-Aware Coach Service: Program state updated");
  }

  generateProgramAwarePrompt(): string {
    // Generate a program-aware prompt based on the current program state
    const { currentModule, currentLesson } = this.programState;
    let prompt = `You are a program-aware coach, assisting the user in their creative journey.\n`;
    if (currentModule && currentLesson) {
      prompt += `The user is currently in ${currentModule}, specifically in ${currentLesson}.\n`;
    }
    prompt += `Please provide guidance and support based on their current progress in the program.`;
    return prompt;
  }

  getProgramState(): ProgramState {
    return this.programState;
  }

  async sendMessage(
    message: string, 
    sessionId: string, 
    usePersona: boolean, 
    agentType: AgentType,
    language: string = 'en'
  ): Promise<{ response: string; conversationId: string }> {
    // Combine program-aware prompt with the base system prompt
    const programAwarePrompt = this.generateProgramAwarePrompt();
    const enhancedSystemPrompt = `${programAwarePrompt}\n\n`;
    
    // Send message to the enhanced AI coach service
    console.log("📤 Program-Aware Coach Service: Sending message with program context:", {
      messageLength: message.length,
      usePersona,
      agentType,
      programState: this.programState,
    });
    
    const response = await this.enhancedCoach.sendMessage(message, sessionId, usePersona, agentType, language);
    
    // Update program state based on response
    await this.updateProgramState(message, response.response);
    
    return { response: response.response, conversationId: response.conversationId };
  }
}
