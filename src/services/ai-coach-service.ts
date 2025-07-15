import { AgentMode } from "@/types/personality-modules";
import { supabase } from "@/integrations/supabase/client";
import { unifiedBrainService } from "./unified-brain-service";

export class AICoachService {
  private messages: { role: string; content: string }[] = [];

  async sendMessage(
    message: string, 
    agentMode: AgentMode, 
    usePersonalization: boolean = true
  ): Promise<string> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await unifiedBrainService.initialize(user.id);

      // Map AgentMode to valid mode types for UnifiedBrainService
      const validMode = this.mapAgentModeToValidMode(agentMode);
      
      const brainResponse = await unifiedBrainService.processMessage(
        user.id,
        message,
        validMode
      );

      const response = brainResponse.response || brainResponse.systemPrompt;

      this.messages.push({ role: 'user', content: message });
      this.messages.push({ role: 'coach', content: response });
      
      return response;

    } catch (error) {
      console.error('❌ AI Coach Service error:', error);
      throw error;
    }
  }

  private mapAgentModeToValidMode(agentMode: AgentMode): 'guide' | 'coach' | 'dream' {
    switch (agentMode) {
      case 'coach':
        return 'coach';
      case 'dream':
        return 'dream';
      case 'guide':
      case 'blend':
      default:
        return 'guide'; // Default fallback for 'blend' and unknown modes
    }
  }

  async streamMessage(
    message: string, 
    agentMode: AgentMode, 
    onChunk: (chunk: string) => void,
    usePersonalization: boolean = true
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      await unifiedBrainService.initialize(user.id);

      // Map AgentMode to valid mode types
      const validMode = this.mapAgentModeToValidMode(agentMode);
      
      const brainResponse = await unifiedBrainService.processMessage(
        user.id,
        message,
        validMode
      );

      const response = brainResponse.response || brainResponse.systemPrompt;

      this.messages.push({ role: 'user', content: message });
      this.messages.push({ role: 'coach', content: response });

      // Simulate streaming by sending the response in chunks
      const chunks = response.match(/.{1,50}/g) || [response];
      for (const chunk of chunks) {
        onChunk(chunk);
        await new Promise(resolve => setTimeout(resolve, 50));
      }

    } catch (error) {
      console.error('❌ AI Coach Service streaming error:', error);
      throw error;
    }
  }

  getMessages() {
    return this.messages;
  }

  clearMessages() {
    this.messages = [];
  }
}

export const aiCoachService = new AICoachService();
