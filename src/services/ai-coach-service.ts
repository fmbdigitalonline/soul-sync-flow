
import { supabase } from "@/integrations/supabase/client";
import { PersonalityEngine } from "@/services/personality-engine";

export interface AICoachResponse {
  response: string;
  conversationId: string | null;
}

export type AgentType = "coach" | "guide" | "blend";

// Initialize personality engine
const personalityEngine = new PersonalityEngine();

export const aiCoachService = {
  async sendMessage(
    message: string,
    sessionId: string = "default",
    includeBlueprint: boolean = true,
    agentType: AgentType = "guide",
    language: string = "en"
  ): Promise<AICoachResponse> {
    try {
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      const userId = authData.user.id;

      // Generate personality-driven system prompt
      const systemPrompt = personalityEngine.generateSystemPrompt(agentType);

      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          userId,
          sessionId,
          includeBlueprint,
          agentType,
          systemPrompt, // Pass the generated prompt
          language, // Pass the language
        },
      });

      if (error) {
        console.error("Error calling AI Coach:", error);
        throw new Error(error.message || "Failed to connect to AI Coach");
      }

      return data as AICoachResponse;
    } catch (err) {
      console.error("Error in AI Coach service:", err);
      throw err;
    }
  },

  createNewSession(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  },

  updatePersonalityBlueprint(blueprint: any) {
    personalityEngine.updateBlueprint(blueprint);
  }
};
