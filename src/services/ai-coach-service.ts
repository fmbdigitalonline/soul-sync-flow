
import { supabase } from "@/integrations/supabase/client";

export type AICoachResponse = {
  response: string;
  context?: any;
  error?: string;
};

export const aiCoachService = {
  createNewSession(): string {
    return `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
  },

  async sendMessage(
    message: string,
    sessionId: string,
    includeBlueprintContext: boolean = false
  ): Promise<AICoachResponse> {
    try {
      // Get user blueprint if available and requested
      let blueprintContext = null;
      
      if (includeBlueprintContext) {
        try {
          // Get the active blueprint for the user
          const { data: userData } = await supabase.auth.getUser();
          
          if (userData?.user) {
            const { data: blueprintData } = await supabase.rpc(
              'get_active_user_blueprint',
              { user_uuid: userData.user.id }
            );
            
            if (blueprintData) {
              blueprintContext = blueprintData;
              console.log("Including blueprint context in AI Coach conversation");
            }
          }
        } catch (error) {
          console.error("Error retrieving blueprint context:", error);
          // Continue without blueprint context if there's an error
        }
      }

      // Call AI Coach edge function with session ID and blueprint context if available
      const { data, error } = await supabase.functions.invoke(
        "ai-coach",
        {
          body: {
            message,
            sessionId,
            blueprintContext: blueprintContext || null,
          },
        }
      );

      if (error) {
        throw new Error(`AI Coach edge function error: ${error.message}`);
      }

      if (!data) {
        throw new Error("No response data received from AI Coach");
      }

      return {
        response: data.response,
        context: data.context,
      };
    } catch (error) {
      console.error("Error in AI Coach service:", error);
      return {
        response:
          "I'm sorry, I'm having trouble processing your request right now. Please try again in a moment.",
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
  
  // Save conversation to memory
  async saveConversation(
    sessionId: string,
    messages: any[]
  ): Promise<boolean> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        console.log("No authenticated user, storing conversation in local memory only");
        return false;
      }

      // Check if a conversation already exists for this session
      const { data: existingConversation } = await supabase
        .from("conversation_memory")
        .select()
        .eq("session_id", sessionId)
        .eq("user_id", userData.user.id)
        .single();

      if (existingConversation) {
        // Update existing conversation
        const { error } = await supabase
          .from("conversation_memory")
          .update({ messages, updated_at: new Date() })
          .eq("session_id", sessionId);

        if (error) {
          console.error("Error updating conversation memory:", error);
          return false;
        }
      } else {
        // Create new conversation
        const { error } = await supabase.from("conversation_memory").insert({
          user_id: userData.user.id,
          session_id: sessionId,
          messages,
        });

        if (error) {
          console.error("Error creating conversation memory:", error);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Error saving conversation:", error);
      return false;
    }
  },

  // Get previous conversations for a user
  async getConversations(): Promise<
    { session_id: string; created_at: string; updated_at: string }[]
  > {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) return [];

      const { data, error } = await supabase
        .from("conversation_memory")
        .select("session_id, created_at, updated_at")
        .eq("user_id", userData.user.id)
        .order("updated_at", { ascending: false });

      if (error) {
        console.error("Error fetching conversations:", error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error("Error getting conversations:", error);
      return [];
    }
  },

  // Load a specific conversation
  async loadConversation(
    sessionId: string
  ): Promise<{ messages: any[]; error?: string }> {
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) {
        return { messages: [], error: "No authenticated user" };
      }

      const { data, error } = await supabase
        .from("conversation_memory")
        .select("messages")
        .eq("session_id", sessionId)
        .eq("user_id", userData.user.id)
        .single();

      if (error) {
        console.error("Error loading conversation:", error);
        return { messages: [], error: error.message };
      }

      return { messages: data?.messages || [] };
    } catch (error) {
      console.error("Error in loadConversation:", error);
      return {
        messages: [],
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
