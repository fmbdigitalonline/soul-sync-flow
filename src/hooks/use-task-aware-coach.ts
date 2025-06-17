
import { useState, useEffect } from "react";
import { useEnhancedAICoach } from "./use-enhanced-ai-coach";
import { taskCoachIntegrationService, TaskContext, TaskAction } from "@/services/task-coach-integration-service";

export const useTaskAwareCoach = (initialTask?: TaskContext) => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("coach");
  const [currentTask, setCurrentTask] = useState<TaskContext | null>(initialTask || null);

  // Initialize task context
  useEffect(() => {
    if (initialTask) {
      taskCoachIntegrationService.setCurrentTask(initialTask);
      setCurrentTask(initialTask);
    }
  }, [initialTask]);

  // Set up task update callbacks
  useEffect(() => {
    taskCoachIntegrationService.onTaskUpdate((updatedTask) => {
      console.log('🔄 Task update received:', updatedTask);
      setCurrentTask(updatedTask);
    });

    return () => {
      // Cleanup callbacks if needed
    };
  }, []);

  // Enhanced send message with task context
  const sendTaskAwareMessage = async (message: string) => {
    const taskContext = taskCoachIntegrationService.generateCoachContext();
    
    const enhancedMessage = `${message}

CURRENT TASK CONTEXT:
${taskContext}

As my productivity coach with access to my task management system, please help me with this request. You can execute task actions by responding with specific action commands:
- To complete a sub-task: "ACTION: complete_subtask [subtask_id]"
- To complete the current task: "ACTION: complete_task"
- To update progress: "ACTION: update_progress [percentage]"
- To add a sub-task: "ACTION: add_subtask [title]"
- To get next task: "ACTION: get_next_task"

Please provide guidance while being aware of my current task state and progress.`;

    console.log('📤 Sending task-aware message to coach');
    
    // Send the message and wait for response
    await sendMessage(enhancedMessage);
    
    // After sending, check the latest assistant message for actions
    setTimeout(() => {
      checkForCoachActions();
    }, 1000);
  };

  // Check recent messages for coach actions
  const checkForCoachActions = () => {
    if (messages.length === 0) return;
    
    const latestMessage = messages[messages.length - 1];
    if (latestMessage.sender === 'assistant') {
      const action = parseCoachResponse(latestMessage.content);
      if (action) {
        console.log('🎬 Auto-executing detected coach action:', action);
        executeCoachAction(action);
      }
    }
  };

  // Execute coach-initiated task actions
  const executeCoachAction = async (action: TaskAction) => {
    console.log('🎬 Executing coach action:', action);
    const result = await taskCoachIntegrationService.executeTaskAction(action);
    
    if (result.success) {
      // Send confirmation message to coach
      await sendMessage(`ACTION COMPLETED: ${result.message}${result.data ? ` Data: ${JSON.stringify(result.data)}` : ''}`);
    } else {
      // Send error message to coach
      await sendMessage(`ACTION FAILED: ${result.message}`);
    }
    
    return result;
  };

  // Parse coach responses for action commands
  const parseCoachResponse = (response: string): TaskAction | null => {
    const actionRegex = /ACTION:\s*(complete_subtask|complete_task|update_progress|add_subtask|get_next_task)\s*(.+)?/i;
    const match = response.match(actionRegex);
    
    if (!match) return null;
    
    const actionType = match[1].toLowerCase();
    const actionPayload = match[2]?.trim();
    
    switch (actionType) {
      case 'complete_subtask':
        return { type: 'complete_subtask', payload: { subTaskId: actionPayload } };
      case 'complete_task':
        return { type: 'complete_task', payload: {} };
      case 'update_progress':
        return { type: 'update_progress', payload: { progress: parseInt(actionPayload || '0') } };
      case 'add_subtask':
        return { type: 'add_subtask', payload: { title: actionPayload } };
      case 'get_next_task':
        return { type: 'get_next_task', payload: {} };
      default:
        return null;
    }
  };

  // Quick actions for common task operations
  const quickTaskActions = {
    markSubTaskComplete: (subTaskId: string) => 
      executeCoachAction({ type: 'complete_subtask', payload: { subTaskId } }),
    
    markTaskComplete: () => 
      executeCoachAction({ type: 'complete_task', payload: {} }),
    
    updateProgress: (progress: number) => 
      executeCoachAction({ type: 'update_progress', payload: { progress } }),
    
    addSubTask: (title: string) => 
      executeCoachAction({ type: 'add_subtask', payload: { title } }),
    
    getNextTask: () => 
      executeCoachAction({ type: 'get_next_task', payload: {} })
  };

  return {
    messages,
    isLoading,
    sendMessage: sendTaskAwareMessage,
    resetConversation,
    currentAgent,
    switchAgent,
    currentTask,
    executeCoachAction,
    parseCoachResponse,
    quickTaskActions
  };
};
