
import { supabase } from "@/integrations/supabase/client";

export interface SessionMemory {
  id: string;
  user_id: string;
  session_id: string;
  memory_type: 'interaction' | 'mood' | 'belief_shift' | 'journal_entry' | 'micro_action';
  memory_data: any;
  context_summary?: string;
  importance_score: number;
  created_at: string;
  last_referenced: string;
}

export interface SessionFeedback {
  id: string;
  user_id: string;
  session_id: string;
  rating: number;
  feedback_text?: string;
  session_summary?: string;
  improvement_suggestions: string[];
  created_at: string;
}

export interface MicroActionReminder {
  id: string;
  user_id: string;
  session_id: string;
  action_title: string;
  action_description?: string;
  reminder_type: 'in_app' | 'email' | 'calendar';
  scheduled_for: string;
  status: 'pending' | 'sent' | 'completed' | 'snoozed' | 'cancelled';
  snooze_until?: string;
  completion_notes?: string;
  created_at: string;
  updated_at: string;
}

export interface UserLifeContext {
  id: string;
  user_id: string;
  context_category: 'career' | 'relationships' | 'health' | 'growth' | 'creative';
  current_focus?: string;
  recent_progress: any[];
  ongoing_challenges: any[];
  celebration_moments: any[];
  next_steps: any[];
  last_updated: string;
  created_at: string;
}

class MemoryService {
  // Session Memory Management
  async saveMemory(memory: Omit<SessionMemory, 'id' | 'created_at' | 'last_referenced'>): Promise<SessionMemory | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      console.log('💾 Saving session memory:', memory.memory_type, memory.context_summary);

      const { data, error } = await supabase
        .from('user_session_memory')
        .insert({
          user_id: user.id,
          session_id: memory.session_id,
          memory_type: memory.memory_type,
          memory_data: memory.memory_data,
          context_summary: memory.context_summary,
          importance_score: memory.importance_score
        })
        .select()
        .single();

      if (error) {
        console.error('Failed to save memory:', error);
        return null;
      }

      return data as SessionMemory;
    } catch (error) {
      console.error('Error saving memory:', error);
      return null;
    }
  }

  async getRecentMemories(limit = 10): Promise<SessionMemory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('importance_score', { ascending: false })
        .order('last_referenced', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch memories:', error);
        return [];
      }

      // Update last_referenced timestamp for retrieved memories
      const memoryIds = data.map(m => m.id);
      if (memoryIds.length > 0) {
        await supabase
          .from('user_session_memory')
          .update({ last_referenced: new Date().toISOString() })
          .in('id', memoryIds);
      }

      console.log(`🧠 Retrieved ${data.length} memories for context`);
      return data as SessionMemory[];
    } catch (error) {
      console.error('Error fetching memories:', error);
      return [];
    }
  }

  async searchMemories(query: string, limit = 5): Promise<SessionMemory[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', user.id)
        .or(`context_summary.ilike.%${query}%,memory_data->>content.ilike.%${query}%`)
        .order('importance_score', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to search memories:', error);
        return [];
      }

      console.log(`🔍 Found ${data.length} memories matching: ${query}`);
      return data as SessionMemory[];
    } catch (error) {
      console.error('Error searching memories:', error);
      return [];
    }
  }

  // Session Feedback Management
  async saveFeedback(feedback: Omit<SessionFeedback, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log('📝 Saving session feedback:', feedback.rating, feedback.feedback_text);

      const { error } = await supabase
        .from('session_feedback')
        .insert({
          user_id: user.id,
          session_id: feedback.session_id,
          rating: feedback.rating,
          feedback_text: feedback.feedback_text,
          session_summary: feedback.session_summary,
          improvement_suggestions: feedback.improvement_suggestions
        });

      if (error) {
        console.error('Failed to save feedback:', error);
        return false;
      }

      // Create feedback memory entry immediately after saving feedback
      try {
        await this.saveMemory({
          user_id: user.id,
          session_id: feedback.session_id,
          memory_type: 'interaction',
          memory_data: {
            type: 'session_feedback',
            rating: feedback.rating,
            feedback_text: feedback.feedback_text,
            suggestions: feedback.improvement_suggestions
          },
          context_summary: `Session rated ${feedback.rating}/5 stars`,
          importance_score: feedback.rating >= 4 ? 8 : 6
        });
        console.log('✅ Feedback memory integration successful');
      } catch (memoryError) {
        console.error('Failed to create feedback memory:', memoryError);
        // Don't fail the whole operation if memory creation fails
      }

      return true;
    } catch (error) {
      console.error('Error saving feedback:', error);
      return false;
    }
  }

  async getFeedbackHistory(limit = 20): Promise<SessionFeedback[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('session_feedback')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Failed to fetch feedback history:', error);
        return [];
      }

      return data as SessionFeedback[];
    } catch (error) {
      console.error('Error fetching feedback history:', error);
      return [];
    }
  }

  // Micro-Action Reminders Management
  async createReminder(reminder: Omit<MicroActionReminder, 'id' | 'created_at' | 'updated_at'>): Promise<MicroActionReminder | null> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for reminder creation');
        return null;
      }

      console.log('⏰ Creating micro-action reminder:', reminder.action_title);

      // Ensure all required fields are properly set
      const reminderData = {
        user_id: user.id,
        session_id: reminder.session_id,
        action_title: reminder.action_title,
        action_description: reminder.action_description || null,
        reminder_type: reminder.reminder_type || 'in_app',
        scheduled_for: reminder.scheduled_for,
        status: reminder.status || 'pending'
      };

      console.log('⏰ Reminder data to insert:', reminderData);

      const { data, error } = await supabase
        .from('micro_action_reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) {
        console.error('Failed to create reminder:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return null;
      }

      console.log('✅ Reminder created successfully:', data.id);
      return data as MicroActionReminder;
    } catch (error) {
      console.error('Error creating reminder:', error);
      return null;
    }
  }

  async getActiveReminders(): Promise<MicroActionReminder[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('micro_action_reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('Failed to fetch active reminders:', error);
        return [];
      }

      console.log(`⏰ Found ${data.length} active reminders`);
      return data as MicroActionReminder[];
    } catch (error) {
      console.error('Error fetching active reminders:', error);
      return [];
    }
  }

  async updateReminderStatus(id: string, status: MicroActionReminder['status'], completion_notes?: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('No authenticated user for reminder update');
        return false;
      }

      console.log(`⏰ Updating reminder ${id} status to: ${status}`);

      // First verify the reminder exists and belongs to the user
      const { data: existingReminder, error: fetchError } = await supabase
        .from('micro_action_reminders')
        .select('id, user_id')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

      if (fetchError || !existingReminder) {
        console.error('Reminder not found or not owned by user:', fetchError);
        return false;
      }

      const { error } = await supabase
        .from('micro_action_reminders')
        .update({ 
          status,
          completion_notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        console.error('Failed to update reminder status:', error);
        console.error('Error details:', error.message, error.details, error.hint);
        return false;
      }

      console.log('✅ Reminder status updated successfully');
      return true;
    } catch (error) {
      console.error('Error updating reminder status:', error);
      return false;
    }
  }

  async snoozeReminder(id: string, snoozeUntil: Date): Promise<boolean> {
    try {
      console.log(`😴 Snoozing reminder ${id} until: ${snoozeUntil.toISOString()}`);

      const { error } = await supabase
        .from('micro_action_reminders')
        .update({ 
          status: 'snoozed',
          snooze_until: snoozeUntil.toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Failed to snooze reminder:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error snoozing reminder:', error);
      return false;
    }
  }

  // Life Context Management
  async updateLifeContext(context: Omit<UserLifeContext, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      console.log('🌱 Updating life context:', context.context_category);

      // Use upsert to handle both insert and update cases
      const { error } = await supabase
        .from('user_life_context')
        .upsert({
          user_id: user.id,
          context_category: context.context_category,
          current_focus: context.current_focus,
          recent_progress: context.recent_progress,
          ongoing_challenges: context.ongoing_challenges,
          celebration_moments: context.celebration_moments,
          next_steps: context.next_steps,
          last_updated: new Date().toISOString()
        }, {
          onConflict: 'user_id,context_category'
        });

      if (error) {
        console.error('Failed to update life context:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error updating life context:', error);
      return false;
    }
  }

  async getLifeContext(): Promise<UserLifeContext[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('user_life_context')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('Failed to fetch life context:', error);
        return [];
      }

      console.log(`🌱 Retrieved life context for ${data.length} categories`);
      return data as UserLifeContext[];
    } catch (error) {
      console.error('Error fetching life context:', error);
      return [];
    }
  }

  // Generate session welcome message with memory context
  async generateWelcomeMessage(userName: string): Promise<string> {
    try {
      console.log('👋 Generating welcome message for:', userName);
      
      // Parallel fetch of all context data with proper error handling
      const [memories, lifeContext, activeReminders] = await Promise.allSettled([
        this.getRecentMemories(5),
        this.getLifeContext(),
        this.getActiveReminders()
      ]);

      const memoriesData = memories.status === 'fulfilled' ? memories.value : [];
      const lifeContextData = lifeContext.status === 'fulfilled' ? lifeContext.value : [];
      const activeRemindersData = activeReminders.status === 'fulfilled' ? activeReminders.value : [];

      console.log('👋 Context data loaded:', {
        memories: memoriesData.length,
        lifeContext: lifeContextData.length,
        activeReminders: activeRemindersData.length
      });

      if (memoriesData.length === 0 && lifeContextData.length === 0 && activeRemindersData.length === 0) {
        return `Welcome, ${userName}! I'm excited to start our journey together. What would you like to explore today?`;
      }

      let welcomeMessage = `Welcome back, ${userName}! `;

      // Add context from recent memories
      const recentInteraction = memoriesData.find(m => m.memory_type === 'interaction');
      if (recentInteraction && recentInteraction.context_summary) {
        welcomeMessage += `Last time we spoke about ${recentInteraction.context_summary.toLowerCase()}. `;
      }

      // Add micro-action follow-up
      const pendingAction = memoriesData.find(m => m.memory_type === 'micro_action');
      if (pendingAction && pendingAction.memory_data.action_title) {
        welcomeMessage += `I'm curious to know how your "${pendingAction.memory_data.action_title}" action went. `;
      }

      // Add active reminders context
      if (activeRemindersData.length > 0) {
        welcomeMessage += `You have ${activeRemindersData.length} action${activeRemindersData.length > 1 ? 's' : ''} coming up. `;
      }

      // Add life context insights
      if (lifeContextData.length > 0) {
        const recentContext = lifeContextData[0];
        if (recentContext.current_focus) {
          welcomeMessage += `I see you're focusing on ${recentContext.current_focus} in your ${recentContext.context_category} area. `;
        }
      }

      welcomeMessage += `What would you like to focus on today?`;

      console.log('👋 Generated personalized welcome message with context awareness');
      return welcomeMessage;
    } catch (error) {
      console.error('Error generating welcome message:', error);
      return `Welcome back, ${userName}! What would you like to explore today?`;
    }
  }
}

export const memoryService = new MemoryService();
