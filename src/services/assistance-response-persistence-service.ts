/**
 * Assistance Response Persistence Service
 * 
 * Manages storage and retrieval of assistance responses and step progress in the database.
 * Ensures help panels and step completion persist across sessions.
 * 
 * Protocol Compliance:
 * - Principle #2: No hardcoded data - all responses from real database
 * - Principle #3: No silent fallbacks - errors surface explicitly
 * - Principle #6: Respects data pathways - integrates with existing task system
 */

import { supabase } from "@/integrations/supabase/client";
import { AssistanceResponse } from "@/services/interactive-assistance-service";

export interface StoredAssistanceResponse {
  id: string;
  user_id: string;
  goal_id: string;
  task_id: string;
  instruction_id: string;
  request_id: string;
  assistance_type: string;
  help_type: string;
  content: string;
  actionable_steps: string[];
  tools_needed: string[];
  time_estimate: string | null;
  success_criteria: string[];
  is_follow_up: boolean;
  follow_up_depth: number | null;
  previous_help_context: string | null;
  title: string | null;
  request_context: any;
  created_at: string;
  updated_at: string;
}

export interface StoredStepProgress {
  id: string;
  user_id: string;
  response_id: string;
  step_index: number;
  step_content: string;
  is_completed: boolean;
  created_at: string;
  updated_at: string;
}

class AssistanceResponsePersistenceService {
  /**
   * Save assistance response to database
   * @returns Database ID of saved response
   * @throws Error if save fails - no silent fallbacks
   */
  async saveAssistanceResponse(
    userId: string,
    goalId: string,
    taskId: string,
    instructionId: string,
    response: AssistanceResponse
  ): Promise<string> {
    console.log('💾 ASSISTANCE PERSIST: Saving response', {
      userId,
      goalId,
      taskId,
      instructionId,
      responseId: response.id,
      assistanceType: response.assistanceType
    });

    const responseData = {
      user_id: userId,
      goal_id: goalId,
      task_id: taskId,
      instruction_id: instructionId,
      request_id: response.requestId,
      assistance_type: response.assistanceType || 'how_to',
      help_type: response.helpType,
      content: response.content,
      actionable_steps: response.actionableSteps,
      tools_needed: response.toolsNeeded,
      time_estimate: response.timeEstimate || null,
      success_criteria: response.successCriteria,
      is_follow_up: response.isFollowUp || false,
      follow_up_depth: response.followUpDepth || null,
      previous_help_context: response.previousHelpContext || null,
      title: response.title || null,
      request_context: response.requestContext || null,
    };

    const { data, error } = await supabase
      .from('task_assistance_responses')
      .insert(responseData)
      .select('id')
      .single();

    if (error) {
      console.error("❌ ASSISTANCE PERSIST: Failed to save response:", error);
      throw new Error(`Failed to save assistance response: ${error.message}`);
    }

    console.log(`✅ ASSISTANCE PERSIST: Response saved with ID: ${data.id}`);
    return data.id;
  }

  /**
   * Load all assistance responses for a task, grouped by instruction
   * @returns Map of instruction_id to array of responses
   */
  async loadAllAssistanceResponsesForTask(
    userId: string,
    goalId: string,
    taskId: string
  ): Promise<Map<string, AssistanceResponse[]>> {
    console.log('📖 ASSISTANCE PERSIST: Loading all responses for task', {
      userId,
      goalId,
      taskId
    });

    const { data, error } = await supabase
      .from('task_assistance_responses')
      .select('*')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('task_id', taskId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("❌ ASSISTANCE PERSIST: Failed to load responses:", error);
      throw new Error(`Failed to load assistance responses: ${error.message}`);
    }

    // Group by instruction_id
    const grouped = new Map<string, AssistanceResponse[]>();
    
    if (data) {
      data.forEach((row: any) => {
        const instructionId = row.instruction_id;
        if (!grouped.has(instructionId)) {
          grouped.set(instructionId, []);
        }
        
        const response: AssistanceResponse = {
          id: row.id,
          requestId: row.request_id,
          assistanceType: row.assistance_type,
          helpType: row.help_type,
          content: row.content,
          actionableSteps: row.actionable_steps || [],
          toolsNeeded: row.tools_needed || [],
          timeEstimate: row.time_estimate || undefined,
          successCriteria: row.success_criteria || [],
          timestamp: new Date(row.created_at),
          isFollowUp: row.is_follow_up,
          followUpDepth: row.follow_up_depth || undefined,
          previousHelpContext: row.previous_help_context || undefined,
          dbId: row.id,
          title: row.title || undefined,
          requestContext: row.request_context || undefined,
        };
        
        grouped.get(instructionId)!.push(response);
      });
    }

    console.log(`✅ ASSISTANCE PERSIST: Loaded ${data?.length || 0} responses for ${grouped.size} instructions`);
    return grouped;
  }

  /**
   * Save step progress
   */
  async saveStepProgress(
    userId: string,
    responseDbId: string,
    stepIndex: number,
    stepContent: string,
    isCompleted: boolean
  ): Promise<void> {
    console.log('💾 ASSISTANCE PERSIST: Saving step progress', {
      userId,
      responseDbId,
      stepIndex,
      isCompleted
    });

    const { error } = await supabase
      .from('assistance_step_progress')
      .upsert({
        user_id: userId,
        response_id: responseDbId,
        step_index: stepIndex,
        step_content: stepContent,
        is_completed: isCompleted,
      }, {
        onConflict: 'user_id,response_id,step_index',
      });

    if (error) {
      console.error("❌ ASSISTANCE PERSIST: Failed to save step progress:", error);
      throw new Error(`Failed to save step progress: ${error.message}`);
    }

    console.log(`✅ ASSISTANCE PERSIST: Step progress saved`);
  }

  /**
   * Load step progress for all responses in a task
   * @returns Map of response_id to Set of completed step indices
   */
  async loadStepProgressForTask(
    userId: string,
    goalId: string,
    taskId: string
  ): Promise<Map<string, Set<number>>> {
    console.log('📖 ASSISTANCE PERSIST: Loading step progress for task', {
      userId,
      goalId,
      taskId
    });

    // First get all response IDs for this task
    const { data: responses, error: responsesError } = await supabase
      .from('task_assistance_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('task_id', taskId);

    if (responsesError) {
      console.error("❌ ASSISTANCE PERSIST: Failed to load responses for step progress:", responsesError);
      throw new Error(`Failed to load responses: ${responsesError.message}`);
    }

    if (!responses || responses.length === 0) {
      console.log('ℹ️ ASSISTANCE PERSIST: No responses found, returning empty step progress');
      return new Map();
    }

    const responseIds = responses.map(r => r.id);

    // Load step progress for all responses
    const { data: stepData, error: stepError } = await supabase
      .from('assistance_step_progress')
      .select('*')
      .eq('user_id', userId)
      .in('response_id', responseIds)
      .eq('is_completed', true);

    if (stepError) {
      console.error("❌ ASSISTANCE PERSIST: Failed to load step progress:", stepError);
      throw new Error(`Failed to load step progress: ${stepError.message}`);
    }

    // Group by response_id
    const grouped = new Map<string, Set<number>>();
    
    if (stepData) {
      stepData.forEach((row: any) => {
        const responseId = row.response_id;
        if (!grouped.has(responseId)) {
          grouped.set(responseId, new Set());
        }
        grouped.get(responseId)!.add(row.step_index);
      });
    }

    console.log(`✅ ASSISTANCE PERSIST: Loaded step progress for ${grouped.size} responses`);
    return grouped;
  }

  /**
   * Delete all responses for an instruction
   */
  async deleteResponsesForInstruction(
    userId: string,
    goalId: string,
    taskId: string,
    instructionId: string
  ): Promise<void> {
    console.log('🗑️ ASSISTANCE PERSIST: Deleting responses for instruction', {
      userId,
      goalId,
      taskId,
      instructionId
    });

    // First get response IDs to delete associated step progress
    const { data: responses } = await supabase
      .from('task_assistance_responses')
      .select('id')
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('task_id', taskId)
      .eq('instruction_id', instructionId);

    if (responses && responses.length > 0) {
      const responseIds = responses.map(r => r.id);
      
      // Delete step progress first
      await supabase
        .from('assistance_step_progress')
        .delete()
        .eq('user_id', userId)
        .in('response_id', responseIds);
    }

    // Then delete responses
    const { error } = await supabase
      .from('task_assistance_responses')
      .delete()
      .eq('user_id', userId)
      .eq('goal_id', goalId)
      .eq('task_id', taskId)
      .eq('instruction_id', instructionId);

    if (error) {
      console.error("❌ ASSISTANCE PERSIST: Failed to delete responses:", error);
      throw new Error(`Failed to delete responses: ${error.message}`);
    }

    console.log(`✅ ASSISTANCE PERSIST: Responses deleted for instruction ${instructionId}`);
  }
}

export const assistanceResponsePersistenceService = new AssistanceResponsePersistenceService();
