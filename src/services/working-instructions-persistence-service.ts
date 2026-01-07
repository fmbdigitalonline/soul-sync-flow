/**
 * Working Instructions Persistence Service
 * 
 * Manages storage and retrieval of task working instructions in the database.
 * Ensures instructions are accessible even after task completion or navigation away.
 * 
 * Protocol Compliance:
 * - Principle #2: No hardcoded data - all instructions from real database
 * - Principle #3: No silent fallbacks - errors surface explicitly
 * - Principle #6: Respects data pathways - integrates with existing task system
 */

import { supabase } from "@/integrations/supabase/client";

export interface WorkingInstruction {
  id: string;
  title: string;
  description: string;
  timeEstimate?: string;
  toolsNeeded?: string[];
}

export interface StoredWorkingInstruction {
  id: string;
  user_id: string;
  task_id: string;
  instruction_id: string;
  title: string;
  description: string;
  time_estimate: string | null;
  tools_needed: any; // Json type from Supabase
  order_index: number;
  created_at: string;
  updated_at: string;
}

class WorkingInstructionsPersistenceService {
  /**
   * Save working instructions to database
   * @throws Error if save fails - no silent fallbacks
   */
  async saveWorkingInstructions(
    goalId: string,
    taskId: string,
    instructions: WorkingInstruction[]
  ): Promise<void> {
    // ADD VALIDATION - Ensure valid task IDs before saving
    if (!goalId || goalId === 'unknown' || goalId.trim() === '') {
      throw new Error(`Invalid goalId: "${goalId}". Cannot save working instructions without valid goal ID.`);
    }
    
    if (!taskId || taskId.trim() === '') {
      throw new Error(`Invalid taskId: "${taskId}". Cannot save working instructions without valid task ID.`);
    }

    console.log('🔍 SAVE VALIDATION:', {
      goalId,
      taskId,
      instructionCount: instructions.length,
      instructionTitles: instructions.map(i => i.title)
    });

    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to save working instructions");
    }

    // Convert to database format
    const instructionsToSave = instructions.map((instruction, index) => ({
      user_id: user.id,
      goal_id: goalId,
      task_id: taskId,
      instruction_id: instruction.id,
      title: instruction.title,
      description: instruction.description,
      time_estimate: instruction.timeEstimate,
      tools_needed: instruction.toolsNeeded || [],
      order_index: index,
    }));

    const { error } = await supabase
      .from('task_working_instructions')
      .upsert(instructionsToSave, {
        onConflict: 'user_id,goal_id,task_id,instruction_id',
      });

    if (error) {
      console.error("❌ Failed to save working instructions:", error);
      throw new Error(`Failed to save working instructions: ${error.message}`);
    }

    console.log(`✅ Saved ${instructions.length} working instructions for task ${taskId}`);
  }

  /**
   * Load working instructions from database
   * @param goalId - The goal ID (required)
   * @param taskId - The task ID (required)
   * @returns Array of instructions or empty array if none found
   * @throws Error if database query fails
   */
  async loadWorkingInstructions(goalId: string, taskId: string): Promise<WorkingInstruction[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to load working instructions");
    }

    if (!goalId || !taskId) {
      console.error("❌ Both goal_id and task_id are required to load working instructions");
      return [];
    }

    // ALWAYS filter by both goal_id AND task_id for uniqueness
    const { data, error } = await supabase
      .from('task_working_instructions')
      .select('*')
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .eq('task_id', taskId)
      .order('order_index', { ascending: true });

    if (error) {
      console.error("❌ Failed to load working instructions:", error);
      throw new Error(`Failed to load working instructions: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log(`ℹ️ No stored instructions found for goal ${goalId}, task ${taskId}`);
      return [];
    }

    // Convert from database format
    const instructions: WorkingInstruction[] = data.map((stored: any) => ({
      id: stored.instruction_id,
      title: stored.title,
      description: stored.description,
      timeEstimate: stored.time_estimate || undefined,
      toolsNeeded: Array.isArray(stored.tools_needed) ? stored.tools_needed : [],
    }));

    console.log(`✅ Loaded ${instructions.length} working instructions for goal ${goalId}, task ${taskId}`);
    return instructions;
  }

  /**
   * Check if instructions exist for a task
   * @param goalId - The goal ID (required)
   * @param taskId - The task ID (required)
   */
  async hasStoredInstructions(goalId: string, taskId: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) return false;

    if (!goalId || !taskId) {
      console.error("❌ Both goal_id and task_id are required to check stored instructions");
      return false;
    }

    // ALWAYS filter by both goal_id AND task_id for uniqueness
    const { data, error } = await supabase
      .from('task_working_instructions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .eq('task_id', taskId)
      .limit(1);

    if (error) {
      console.error("❌ Failed to check for stored instructions:", error);
      return false;
    }

    return data !== null;
  }

  /**
   * Delete all instructions for a task
   * Useful for cleanup when task is deleted
   */
  async deleteInstructions(goalId: string, taskId: string): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to delete working instructions");
    }

    const { error } = await supabase
      .from('task_working_instructions')
      .delete()
      .eq('user_id', user.id)
      .eq('goal_id', goalId)
      .eq('task_id', taskId);

    if (error) {
      console.error("❌ Failed to delete working instructions:", error);
      throw new Error(`Failed to delete working instructions: ${error.message}`);
    }

    console.log(`✅ Deleted working instructions for task ${taskId}`);
  }

  /**
   * Get all tasks that have stored instructions
   * Useful for building history views
   */
  async getTasksWithInstructions(): Promise<string[]> {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("User must be authenticated to get tasks with instructions");
    }

    const { data, error } = await supabase
      .from('task_working_instructions')
      .select('task_id')
      .eq('user_id', user.id);

    if (error) {
      console.error("❌ Failed to get tasks with instructions:", error);
      throw new Error(`Failed to get tasks with instructions: ${error.message}`);
    }

    // Get unique task IDs
    const taskIds = [...new Set(data?.map(row => row.task_id) || [])];
    return taskIds;
  }

  /**
   * Get the most recently updated task instructions context.
   */
  async getMostRecentInstructionContext(): Promise<{ taskId: string; goalId: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be authenticated to get instruction context");
    }

    const { data, error } = await supabase
      .from('task_working_instructions')
      .select('task_id, goal_id, updated_at')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ Failed to get most recent instruction context:", error);
      throw new Error(`Failed to get most recent instruction context: ${error.message}`);
    }

    if (!data?.task_id || !data?.goal_id) {
      return null;
    }

    return {
      taskId: String(data.task_id),
      goalId: String(data.goal_id)
    };
  }

  /**
   * Get goal context for a task if instructions exist.
   */
  async getInstructionContextForTask(taskId: string): Promise<{ taskId: string; goalId: string } | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error("User must be authenticated to get instruction context");
    }

    const { data, error } = await supabase
      .from('task_working_instructions')
      .select('task_id, goal_id, updated_at')
      .eq('user_id', user.id)
      .eq('task_id', taskId)
      .order('updated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("❌ Failed to get instruction context for task:", error);
      throw new Error(`Failed to get instruction context for task: ${error.message}`);
    }

    if (!data?.task_id || !data?.goal_id) {
      return null;
    }

    return {
      taskId: String(data.task_id),
      goalId: String(data.goal_id)
    };
  }
}

export const workingInstructionsPersistenceService = new WorkingInstructionsPersistenceService();
