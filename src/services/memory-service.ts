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
  // Enhanced auth check with retry logic for session stability
  private async getAuthenticatedUser(retryCount = 0): Promise<any> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('🔐 Authentication error:', error.message);
        // If auth error and we haven't retried, try once more after a brief delay
        if (retryCount === 0 && error.message?.includes('session')) {
          console.log('🔐 Retrying auth check after session error...');
          await new Promise(resolve => setTimeout(resolve, 500));
          return this.getAuthenticatedUser(1);
        }
        return null;
      }
      
      if (!user) {
        console.error('🔐 No authenticated user found (session may be transitioning)');
        return null;
      }
      
      console.log('✅ Authenticated user verified:', user.id);
      return user;
    } catch (error) {
      console.error('🔐 Unexpected auth error:', error);
      return null;
    }
  }

  // Session Memory Management with enhanced error handling
  async saveMemory(memory: Omit<SessionMemory, 'id' | 'created_at' | 'last_referenced'>): Promise<SessionMemory | null> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot save memory: No authenticated user');
        return null;
      }

      console.log('💾 Saving session memory:', memory.memory_type, memory.context_summary);

      // Ensure all required fields are present and valid
      const memoryData = {
        user_id: user.id,
        session_id: memory.session_id,
        memory_type: memory.memory_type,
        memory_data: memory.memory_data || {},
        context_summary: memory.context_summary || null,
        importance_score: Math.max(1, Math.min(10, memory.importance_score || 5)) // Ensure valid range
      };

      const { data, error } = await supabase
        .from('user_session_memory')
        .insert(memoryData)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to save memory:', error.message, error.details);
        return null;
      }

      console.log('✅ Memory saved successfully:', data.id);
      return data as SessionMemory;
    } catch (error) {
      console.error('❌ Error saving memory:', error);
      return null;
    }
  }

  async getRecentMemories(limit = 10): Promise<SessionMemory[]> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) return [];

      console.log('🧠 Fetching recent memories for user:', user.id);

      const { data, error } = await supabase
        .from('user_session_memory')
        .select('*')
        .eq('user_id', user.id)
        .order('importance_score', { ascending: false })
        .order('last_referenced', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Failed to fetch memories:', error.message, error.details, error.hint);
        return [];
      }

      // Update last_referenced timestamp for retrieved memories
      if (data && data.length > 0) {
        const memoryIds = data.map(m => m.id);
        const { error: updateError } = await supabase
          .from('user_session_memory')
          .update({ last_referenced: new Date().toISOString() })
          .in('id', memoryIds);

        if (updateError) {
          console.warn('⚠️ Failed to update last_referenced timestamps:', updateError);
        }
      }

      console.log(`✅ Retrieved ${data?.length || 0} memories for context`);
      return (data as SessionMemory[]) || [];
    } catch (error) {
      console.error('❌ Error fetching memories:', error);
      return [];
    }
  }

  async searchMemories(query: string, limit = 5): Promise<SessionMemory[]> {
    try {
      const user = await this.getAuthenticatedUser();
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

  // Session Feedback Management with enhanced stability
  async saveFeedback(feedback: Omit<SessionFeedback, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot save feedback: No authenticated user');
        return false;
      }

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
        console.error('❌ Failed to save feedback:', error.message);
        return false;
      }

      // Create feedback memory entry with improved error handling and independence
      try {
        console.log('🧠 Creating feedback memory integration...');
        
        const memoryResult = await this.saveMemory({
          user_id: user.id,
          session_id: feedback.session_id,
          memory_type: 'interaction',
          memory_data: {
            type: 'session_feedback',
            rating: feedback.rating,
            feedback_text: feedback.feedback_text,
            suggestions: feedback.improvement_suggestions,
            timestamp: new Date().toISOString()
          },
          context_summary: `Session rated ${feedback.rating}/5 stars`,
          importance_score: feedback.rating >= 4 ? 8 : 6
        });
        
        if (memoryResult) {
          console.log('✅ Feedback memory integration successful:', memoryResult.id);
        } else {
          console.warn('⚠️ Feedback memory integration failed but feedback saved');
        }
      } catch (memoryError) {
        console.error('❌ Feedback memory integration error:', memoryError);
        // Don't fail feedback saving if memory creation fails
      }

      console.log('✅ Feedback saved successfully');
      return true;
    } catch (error) {
      console.error('❌ Error saving feedback:', error);
      return false;
    }
  }

  async getFeedbackHistory(limit = 20): Promise<SessionFeedback[]> {
    try {
      const user = await this.getAuthenticatedUser();
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

  // Enhanced reminder creation with better session handling
  async createReminder(reminder: Omit<MicroActionReminder, 'id' | 'created_at' | 'updated_at'>): Promise<MicroActionReminder | null> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot create reminder: No authenticated user (session may be transitioning)');
        return null;
      }

      console.log('⏰ Creating micro-action reminder:', reminder.action_title);

      // Enhanced validation
      if (!reminder.action_title?.trim()) {
        console.error('❌ Missing action_title');
        return null;
      }
      
      if (!reminder.session_id?.trim()) {
        console.error('❌ Missing session_id');
        return null;
      }
      
      if (!reminder.scheduled_for) {
        console.error('❌ Missing scheduled_for');
        return null;
      }

      const scheduledDate = new Date(reminder.scheduled_for);
      if (isNaN(scheduledDate.getTime())) {
        console.error('❌ Invalid scheduled_for date');
        return null;
      }

      const reminderData = {
        user_id: user.id,
        session_id: reminder.session_id.trim(),
        action_title: reminder.action_title.trim(),
        action_description: reminder.action_description?.trim() || null,
        reminder_type: reminder.reminder_type || 'in_app',
        scheduled_for: scheduledDate.toISOString(),
        status: reminder.status || 'pending'
      };

      const { data, error } = await supabase
        .from('micro_action_reminders')
        .insert(reminderData)
        .select()
        .single();

      if (error) {
        console.error('❌ Failed to create reminder:', error.message);
        return null;
      }

      console.log('✅ Reminder created successfully:', data.id);
      return data as MicroActionReminder;
    } catch (error) {
      console.error('❌ Unexpected error creating reminder:', error);
      return null;
    }
  }

  async getActiveReminders(): Promise<MicroActionReminder[]> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) return [];

      console.log('⏰ Fetching active reminders for user:', user.id);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('micro_action_reminders')
        .select('*')
        .eq('user_id', user.id)
        .in('status', ['pending', 'sent'])
        .lte('scheduled_for', now)
        .order('scheduled_for', { ascending: true });

      if (error) {
        console.error('❌ Failed to fetch active reminders:', error.message, error.details, error.hint);
        return [];
      }

      console.log(`✅ Found ${data?.length || 0} active reminders`);
      return (data as MicroActionReminder[]) || [];
    } catch (error) {
      console.error('❌ Error fetching active reminders:', error);
      return [];
    }
  }

  async updateReminderStatus(id: string, status: MicroActionReminder['status'], completion_notes?: string): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot update reminder: No authenticated user');
        return false;
      }

      console.log(`⏰ Updating reminder ${id} status to: ${status}`);

      if (!id?.trim()) {
        console.error('❌ Missing reminder ID');
        return false;
      }

      // Validate the reminder exists and belongs to the user
      const { data: existingReminder, error: fetchError } = await supabase
        .from('micro_action_reminders')
        .select('id, user_id, action_title, action_description, session_id, status')
        .eq('id', id.trim())
        .eq('user_id', user.id)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Failed to fetch reminder for validation:', fetchError.message);
        return false;
      }

      if (!existingReminder) {
        console.error('❌ Reminder not found or access denied');
        return false;
      }

      console.log('✅ Reminder validated:', existingReminder.action_title);

      const updateData: any = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (completion_notes !== undefined) {
        updateData.completion_notes = completion_notes;
      }

      const { error: updateError } = await supabase
        .from('micro_action_reminders')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id);

      if (updateError) {
        console.error('❌ Failed to update reminder status:', updateError.message);
        return false;
      }

      console.log('✅ Reminder status updated successfully');

      // Create memory entry when reminder is completed - with improved isolation
      if (status === 'completed') {
        console.log('🧠 Creating memory entry for completed reminder...');
        
        try {
          // Add small delay to avoid any potential race conditions
          await new Promise(resolve => setTimeout(resolve, 100));
          
          const memoryResult = await this.saveMemory({
            user_id: user.id,
            session_id: existingReminder.session_id,
            memory_type: 'micro_action',
            memory_data: {
              action_title: existingReminder.action_title,
              action_description: existingReminder.action_description,
              status: 'completed',
              completion_notes: completion_notes,
              reminder_id: existingReminder.id,
              completed_at: new Date().toISOString(),
              source: 'reminder_completion'
            },
            context_summary: `Completed micro-action: ${existingReminder.action_title}`,
            importance_score: 7
          });

          if (memoryResult) {
            console.log('✅ Reminder completion memory created successfully:', memoryResult.id);
          } else {
            console.warn('⚠️ Failed to create reminder completion memory');
          }
        } catch (memoryError) {
          console.error('❌ Error creating reminder completion memory:', memoryError);
          // Don't fail the reminder update if memory creation fails
        }
      }

      return true;
    } catch (error) {
      console.error('❌ Unexpected error updating reminder status:', error);
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

  // Find next bedtime action
  async getNextBedtimeAction(): Promise<MicroActionReminder | null> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot get bedtime action: No authenticated user');
        return null;
      }

      console.log('🌙 Finding next bedtime action for user:', user.id);

      const now = new Date().toISOString();
      const { data, error } = await supabase
        .from('micro_action_reminders')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .or(`action_title.ilike.%bedtime%,action_title.ilike.%sleep%,action_title.ilike.%night%`)
        .gte('scheduled_for', now)
        .order('scheduled_for', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Failed to fetch bedtime action:', error.message);
        return null;
      }

      if (data) {
        console.log('✅ Found next bedtime action:', data.action_title);
      } else {
        console.log('ℹ️ No upcoming bedtime actions found');
      }

      return data as MicroActionReminder | null;
    } catch (error) {
      console.error('❌ Error fetching bedtime action:', error);
      return null;
    }
  }

  // Life Context Management with enhanced auth handling
  async updateLifeContext(context: Omit<UserLifeContext, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot update life context: No authenticated user');
        return false;
      }

      console.log('🌱 Updating life context:', context.context_category);

      const { data: existing, error: fetchError } = await supabase
        .from('user_life_context')
        .select('id')
        .eq('user_id', user.id)
        .eq('context_category', context.context_category)
        .maybeSingle();

      if (fetchError) {
        console.error('❌ Failed to check existing life context:', fetchError.message);
        return false;
      }

      if (existing) {
        const { error } = await supabase
          .from('user_life_context')
          .update({
            current_focus: context.current_focus,
            recent_progress: context.recent_progress,
            ongoing_challenges: context.ongoing_challenges,
            celebration_moments: context.celebration_moments,
            next_steps: context.next_steps,
            last_updated: new Date().toISOString()
          })
          .eq('id', existing.id);

        if (error) {
          console.error('❌ Failed to update life context:', error.message);
          return false;
        }
      } else {
        const { error } = await supabase
          .from('user_life_context')
          .insert({
            user_id: user.id,
            context_category: context.context_category,
            current_focus: context.current_focus,
            recent_progress: context.recent_progress,
            ongoing_challenges: context.ongoing_challenges,
            celebration_moments: context.celebration_moments,
            next_steps: context.next_steps,
            last_updated: new Date().toISOString()
          });

        if (error) {
          console.error('❌ Failed to insert life context:', error.message);
          return false;
        }
      }

      console.log('✅ Life context updated successfully');
      return true;
    } catch (error) {
      console.error('❌ Error updating life context:', error);
      return false;
    }
  }

  async getLifeContext(): Promise<UserLifeContext[]> {
    try {
      const user = await this.getAuthenticatedUser();
      if (!user) {
        console.warn('⚠️ Cannot get life context: No authenticated user');
        return [];
      }

      console.log('🌱 Retrieving life context for user:', user.id);

      const { data, error } = await supabase
        .from('user_life_context')
        .select('*')
        .eq('user_id', user.id)
        .order('last_updated', { ascending: false });

      if (error) {
        console.error('❌ Failed to fetch life context:', error.message);
        return [];
      }

      console.log(`✅ Retrieved life context for ${data?.length || 0} categories`);
      return (data as UserLifeContext[]) || [];
    } catch (error) {
      console.error('❌ Error fetching life context:', error);
      return [];
    }
  }

  async generateWelcomeMessage(userName: string): Promise<string> {
    try {
      console.log('👋 Generating welcome message for:', userName);
      
      const [memoriesResult, lifeContextResult, activeRemindersResult] = await Promise.allSettled([
        this.getRecentMemories(5),
        this.getLifeContext(),
        this.getActiveReminders()
      ]);

      const memoriesData = memoriesResult.status === 'fulfilled' ? memoriesResult.value : [];
      const lifeContextData = lifeContextResult.status === 'fulfilled' ? lifeContextResult.value : [];
      const activeRemindersData = activeRemindersResult.status === 'fulfilled' ? activeRemindersResult.value : [];

      console.log('👋 Context data summary:', {
        memories: memoriesData.length,
        lifeContext: lifeContextData.length,
        activeReminders: activeRemindersData.length
      });

      if (memoriesData.length === 0 && lifeContextData.length === 0 && activeRemindersData.length === 0) {
        return `Welcome, ${userName}! I'm excited to start our journey together. What would you like to explore today?`;
      }

      let welcomeMessage = `Welcome back, ${userName}! `;

      const recentInteraction = memoriesData.find(m => m.memory_type === 'interaction');
      if (recentInteraction?.context_summary) {
        welcomeMessage += `Last time we spoke about ${recentInteraction.context_summary.toLowerCase()}. `;
      }

      const pendingAction = memoriesData.find(m => 
        m.memory_type === 'micro_action' && 
        m.memory_data?.action_title
      );
      if (pendingAction?.memory_data?.action_title) {
        welcomeMessage += `I'm curious to know how your "${pendingAction.memory_data.action_title}" action went. `;
      }

      if (activeRemindersData.length > 0) {
        welcomeMessage += `You have ${activeRemindersData.length} action${activeRemindersData.length > 1 ? 's' : ''} coming up. `;
      }

      if (lifeContextData.length > 0) {
        const recentContext = lifeContextData[0];
        if (recentContext?.current_focus) {
          welcomeMessage += `I see you're focusing on ${recentContext.current_focus} in your ${recentContext.context_category} area. `;
        }
      }

      welcomeMessage += `What would you like to focus on today?`;

      console.log('✅ Generated personalized welcome message with context');
      return welcomeMessage;
    } catch (error) {
      console.error('❌ Error generating welcome message:', error);
      return `Welcome back, ${userName}! What would you like to explore today?`;
    }
  }
}

export const memoryService = new MemoryService();
