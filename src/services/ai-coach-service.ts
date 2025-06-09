
import { supabase } from "@/integrations/supabase/client";

export interface AICoachResponse {
  response: string;
  conversationId: string | null;
}

export type AgentType = "coach" | "guide" | "blend";

export const aiCoachService = {
  /**
   * Sends a message to the AI Coach and gets a response
   * @param message The user's message
   * @param sessionId A unique identifier for the conversation session
   * @param includeBlueprint Whether to include blueprint data for personalization
   * @param agentType The type of agent to use (coach, guide, or blend)
   */
  async sendMessage(
    message: string,
    sessionId: string = "default",
    includeBlueprint: boolean = true,
    agentType: AgentType = "guide"
  ): Promise<AICoachResponse> {
    try {
      // Get current user
      const { data: authData } = await supabase.auth.getUser();
      if (!authData.user) {
        throw new Error("User not authenticated");
      }

      const userId = authData.user.id;

      // Call the AI Coach edge function
      const { data, error } = await supabase.functions.invoke("ai-coach", {
        body: {
          message,
          userId,
          sessionId,
          includeBlueprint,
          agentType,
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

  /**
   * Create a new session ID for a fresh conversation
   */
  createNewSession(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }
};
