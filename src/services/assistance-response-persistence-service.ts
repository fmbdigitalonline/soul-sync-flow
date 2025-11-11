import { supabase } from '@/integrations/supabase/client';
import { AssistanceResponse } from './interactive-assistance-service';

interface StoredAssistanceResponse {
  id: string;
  user_id: string;
  task_id: string;
  instruction_id: string;
  response_id: string;
  assistance_type: string;
  help_type: string | null;
  content: string;
  actionable_steps: string[];
  tools_needed: string[];
  time_estimate: string | null;
  success_criteria: string[];
  request_context: Record<string, any>;
  is_follow_up: boolean;
  follow_up_depth: number;
  previous_help_context: string | null;
  created_at: string;
  updated_at: string;
}

class AssistanceResponsePersistenceService {
  /**
   * Save a new assistance response to the database
   */
  async saveAssistanceResponse(
    userId: string,
    taskId: string,
    instructionId: string,
    response: AssistanceResponse
  ): Promise<string> {
    console.log('[AssistanceResponsePersistence] Saving response:', {
      userId,
      taskId,
      instructionId,
      responseId: response.id
    });

    try {
      const { data, error } = await supabase
        .from('task_assistance_responses')
        .insert({
          user_id: userId,
          task_id: taskId,
          instruction_id: instructionId,
          response_id: response.id,
          assistance_type: response.assistanceType || 'stuck',
          help_type: response.helpType || null,
          content: response.content,
          actionable_steps: response.actionableSteps || [],
          tools_needed: response.toolsNeeded || [],
          time_estimate: response.timeEstimate || null,
          success_criteria: response.successCriteria || [],
          request_context: response.requestContext || {},
          is_follow_up: response.isFollowUp || false,
          follow_up_depth: response.followUpDepth || 0,
          previous_help_context: response.previousHelpContext || null
        })
        .select('id')
        .single();

      if (error) {
        console.error('[AssistanceResponsePersistence] Save error:', error);
        throw error;
      }

      console.log('[AssistanceResponsePersistence] Saved successfully:', data.id);
      return data.id;
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to save:', error);
      throw error;
    }
  }

  /**
   * Load all assistance responses for a specific instruction
   */
  async loadAssistanceResponses(
    userId: string,
    taskId: string,
    instructionId: string
  ): Promise<AssistanceResponse[]> {
    console.log('[AssistanceResponsePersistence] Loading responses:', {
      userId,
      taskId,
      instructionId
    });

    try {
      const { data, error } = await supabase
        .from('task_assistance_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('instruction_id', instructionId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[AssistanceResponsePersistence] Load error:', error);
        throw error;
      }

      const responses = data.map(this.mapToAssistanceResponse);
      console.log('[AssistanceResponsePersistence] Loaded responses:', responses.length);
      return responses;
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to load:', error);
      throw error;
    }
  }

  /**
   * Load all assistance responses for an entire task
   */
  async loadAllAssistanceResponsesForTask(
    userId: string,
    taskId: string
  ): Promise<Map<string, AssistanceResponse[]>> {
    console.log('[AssistanceResponsePersistence] Loading all responses for task:', {
      userId,
      taskId
    });

    try {
      const { data, error } = await supabase
        .from('task_assistance_responses')
        .select('*')
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('[AssistanceResponsePersistence] Load all error:', error);
        throw error;
      }

      // Group by instruction_id
      const responsesByInstruction = new Map<string, AssistanceResponse[]>();
      
      data.forEach((stored) => {
        const response = this.mapToAssistanceResponse(stored);
        const instructionResponses = responsesByInstruction.get(stored.instruction_id) || [];
        instructionResponses.push(response);
        responsesByInstruction.set(stored.instruction_id, instructionResponses);
      });

      console.log('[AssistanceResponsePersistence] Loaded responses for instructions:', 
        responsesByInstruction.size);
      
      return responsesByInstruction;
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to load all:', error);
      throw error;
    }
  }

  /**
   * Check if there are stored responses for an instruction
   */
  async hasStoredResponses(
    userId: string,
    taskId: string,
    instructionId: string
  ): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('task_assistance_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('instruction_id', instructionId);

      if (error) {
        console.error('[AssistanceResponsePersistence] Check error:', error);
        return false;
      }

      return (count || 0) > 0;
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to check:', error);
      return false;
    }
  }

  /**
   * Delete all responses for an instruction
   */
  async deleteResponsesForInstruction(
    userId: string,
    taskId: string,
    instructionId: string
  ): Promise<void> {
    console.log('[AssistanceResponsePersistence] Deleting responses:', {
      userId,
      taskId,
      instructionId
    });

    try {
      const { error } = await supabase
        .from('task_assistance_responses')
        .delete()
        .eq('user_id', userId)
        .eq('task_id', taskId)
        .eq('instruction_id', instructionId);

      if (error) {
        console.error('[AssistanceResponsePersistence] Delete error:', error);
        throw error;
      }

      console.log('[AssistanceResponsePersistence] Deleted successfully');
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to delete:', error);
      throw error;
    }
  }

  /**
   * Delete a specific response by its database ID
   */
  async deleteResponse(
    userId: string,
    dbId: string
  ): Promise<void> {
    console.log('[AssistanceResponsePersistence] Deleting specific response:', {
      userId,
      dbId
    });

    try {
      const { error } = await supabase
        .from('task_assistance_responses')
        .delete()
        .eq('user_id', userId)
        .eq('id', dbId);

      if (error) {
        console.error('[AssistanceResponsePersistence] Delete specific error:', error);
        throw error;
      }

      console.log('[AssistanceResponsePersistence] Deleted specific response successfully');
    } catch (error) {
      console.error('[AssistanceResponsePersistence] Failed to delete specific:', error);
      throw error;
    }
  }

  /**
   * Map stored database record to AssistanceResponse
   */
  private mapToAssistanceResponse(stored: any): AssistanceResponse {
    return {
      id: stored.response_id,
      dbId: stored.id, // Store the database ID for step progress tracking
      requestId: stored.response_id, // Use response_id as requestId for compatibility
      title: this.generateTitle(stored),
      content: stored.content,
      actionableSteps: stored.actionable_steps || [],
      toolsNeeded: stored.tools_needed || [],
      timeEstimate: stored.time_estimate || undefined,
      successCriteria: stored.success_criteria || [],
      assistanceType: stored.assistance_type,
      helpType: stored.help_type || undefined,
      requestContext: stored.request_context || {},
      isFollowUp: stored.is_follow_up,
      followUpDepth: stored.follow_up_depth,
      previousHelpContext: stored.previous_help_context || undefined,
      timestamp: new Date(stored.created_at)
    };
  }

  /**
   * Generate a title based on assistance type and help type
   */
  private generateTitle(stored: any): string {
    const typeLabels: Record<string, string> = {
      stuck: "I'm Stuck",
      need_details: 'Need More Details',
      how_to: 'How To',
      examples: 'Show Examples'
    };

    const helpLabels: Record<string, string> = {
      concrete_steps: 'Concrete Steps',
      examples: 'Examples',
      tools_needed: 'Tools Needed',
      time_breakdown: 'Time Breakdown'
    };

    const baseTitle = typeLabels[stored.assistance_type] || 'Help';
    const helpSuffix = stored.help_type ? ` - ${helpLabels[stored.help_type]}` : '';
    
    return `${baseTitle}${helpSuffix}`;
  }
}

export const assistanceResponsePersistenceService = new AssistanceResponsePersistenceService();
