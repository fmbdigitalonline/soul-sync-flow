
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useEnhancedAICoach } from "./use-enhanced-ai-coach";
import { enhancedTaskCoachIntegrationService } from "@/services/enhanced-task-coach-integration-service";
import { TaskContext, TaskAction } from "@/services/task-coach-integration-service";
import { dreamActivityLogger } from "@/services/dream-activity-logger";

export const useTaskAwareCoach = (initialTask?: TaskContext) => {
  const { messages, isLoading, sendMessage, resetConversation, currentAgent, switchAgent } = useEnhancedAICoach("coach");
  const [currentTask, setCurrentTask] = useState<TaskContext | null>(initialTask || null);
  const [messageCount, setMessageCount] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  
  // Use refs for stable values that don't need to trigger re-renders
  const sessionStartTimeRef = useRef(Date.now());
  const initializedRef = useRef(false);
  const sessionIdRef = useRef(dreamActivityLogger.getCurrentSessionId());

  // Initialize task context only once
  useEffect(() => {
    if (initialTask && !initializedRef.current) {
      console.log('🎯 Initializing task-aware coach with task:', initialTask.title);
      
      dreamActivityLogger.logActivity('task_aware_coach_initialized', {
        task_id: initialTask.id,
        task_title: initialTask.title,
        initial_progress: initialTask.progress
      });

      enhancedTaskCoachIntegrationService.setCurrentTask(initialTask);
      setCurrentTask(initialTask);
      initializedRef.current = true;

      // Log task coach session start
      dreamActivityLogger.logTaskCoachSession({
        session_id: sessionIdRef.current,
        task_id: initialTask.id,
        task_title: initialTask.title,
        session_start: new Date(),
        messages_count: 0,
        actions_executed: 0,
        session_data: {
          initial_task: initialTask,
          coach_agent: 'coach'
        }
      });
    }
  }, [initialTask?.id]); // Only depend on task ID to prevent loops

  // Set up task update callbacks - stable callback
  const handleTaskUpdate = useCallback((updatedTask: TaskContext) => {
    console.log('🔄 Task update received:', updatedTask);
    
    dreamActivityLogger.logActivity('task_state_updated', {
      previous_progress: currentTask?.progress,
      new_progress: updatedTask.progress,
      task_id: updatedTask.id,
      status_change: currentTask?.status !== updatedTask.status,
      subtasks_change: (currentTask?.sub_tasks?.length || 0) !== (updatedTask.sub_tasks?.length || 0)
    });
    
    setCurrentTask(updatedTask);
  }, [currentTask?.progress, currentTask?.status, currentTask?.sub_tasks?.length]);

  // Set up task update listener only once
  useEffect(() => {
    const unsubscribeUpdate = enhancedTaskCoachIntegrationService.onTaskUpdate(handleTaskUpdate);
    return () => {
      unsubscribeUpdate();
    };
  }, []); // Empty dependency array - set up once

  // Enhanced send message with comprehensive logging and loop prevention
  const sendTaskAwareMessage = useCallback(async (message: string) => {
    const messageStartTime = Date.now();
    
    try {
      // Log message attempt
      await dreamActivityLogger.logActivity('coach_message_attempt', {
        message_length: message.length,
        message_number: messageCount + 1,
        has_task_context: !!currentTask,
        task_id: currentTask?.id
      });

      // Check for potential loop patterns
      if (messageCount > 0 && message.toLowerCase().includes('taskplan')) {
        await dreamActivityLogger.logActivity('potential_taskplan_loop_detected', {
          message_content: message.substring(0, 200),
          message_count: messageCount,
          consecutive_taskplan_mentions: true
        });
      }

      const taskContext = enhancedTaskCoachIntegrationService.generateCoachContext();
      
      // Create enhanced message for AI (with task context)
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
      
      // Send only the original user message to be displayed in chat
      await sendMessage(enhancedMessage, true, message);
      
      const messageTime = Date.now() - messageStartTime;
      setMessageCount(prev => prev + 1);

      // Log successful message send
      await dreamActivityLogger.logActivity('coach_message_sent', {
        message_time_ms: messageTime,
        enhanced_message_length: enhancedMessage.length,
        original_message_length: message.length,
        message_number: messageCount + 1
      });
      
      // Disable auto-action detection to prevent loops
      // Actions should only be triggered by explicit user interaction
      
    } catch (error) {
      await dreamActivityLogger.logError('coach_message_error', {
        error: error instanceof Error ? error.message : String(error),
        message_attempt: message.substring(0, 100),
        message_number: messageCount + 1
      });
      
      throw error;
    }
  }, [messageCount, currentTask?.id, sendMessage]); // Stable dependencies only

  // Enhanced action checking with comprehensive logging
  const checkForCoachActionsWithLogging = useCallback(async () => {
    if (messages.length === 0) return;
    
    try {
      const latestMessage = messages[messages.length - 1];
      if (latestMessage.sender === 'assistant') {
        
        await dreamActivityLogger.logActivity('coach_response_analysis', {
          response_length: latestMessage.content.length,
          message_id: latestMessage.id,
          contains_action: latestMessage.content.includes('ACTION:')
        });

        const action = parseCoachResponseWithLogging(latestMessage.content);
        if (action) {
          console.log('🎬 Auto-executing detected coach action:', action);
          
          await dreamActivityLogger.logActivity('auto_action_detected', {
            action_type: action.type,
            action_payload: action.payload,
            detection_source: 'coach_response'
          });
          
          await executeCoachActionWithLogging(action, 'coach_response');
        }
      }
    } catch (error) {
      await dreamActivityLogger.logError('coach_action_check_error', {
        error: error instanceof Error ? error.message : String(error),
        messages_length: messages.length
      });
    }
  }, [messages.length]); // Only depend on messages length

  // Enhanced action execution with comprehensive tracking
  const executeCoachActionWithLogging = useCallback(async (action: TaskAction, triggeredBy: 'user_action' | 'auto_execution' | 'coach_response' = 'user_action') => {
    console.log('🎬 Executing coach action:', action);
    
    try {
      const result = await enhancedTaskCoachIntegrationService.executeTaskAction(action, triggeredBy);
      
      setActionCount(prev => prev + 1);

      // Handle action results silently in UI only - don't send back to AI
      if (result.success) {
        await dreamActivityLogger.logActivity('action_completed_silently', {
          action_type: action.type,
          result_message: result.message
        });
      } else {
        await dreamActivityLogger.logActivity('action_failed_silently', {
          action_type: action.type,
          error_message: result.message
        });
      }
      
      return result;
    } catch (error) {
      await dreamActivityLogger.logError('coach_action_execution_error', {
        action_type: action.type,
        action_payload: action.payload,
        error: error instanceof Error ? error.message : String(error),
        triggered_by: triggeredBy
      });
      
      return {
        success: false,
        message: `Execution failed: ${error instanceof Error ? error.message : String(error)}`,
        data: null
      };
    }
  }, [sendMessage]);

  // Enhanced response parsing with logging
  const parseCoachResponseWithLogging = useCallback((response: string): TaskAction | null => {
    try {
      const actionRegex = /ACTION:\s*(complete_subtask|complete_task|update_progress|add_subtask|get_next_task)\s*(.+)?/i;
      const match = response.match(actionRegex);
      
      if (!match) {
        dreamActivityLogger.logActivity('no_action_found_in_response', {
          response_preview: response.substring(0, 200),
          response_length: response.length
        });
        return null;
      }
      
      const actionType = match[1].toLowerCase();
      const actionPayload = match[2]?.trim();
      
      let action: TaskAction | null = null;
      
      switch (actionType) {
        case 'complete_subtask':
          action = { type: 'complete_subtask', payload: { subTaskId: actionPayload } };
          break;
        case 'complete_task':
          action = { type: 'complete_task', payload: {} };
          break;
        case 'update_progress':
          action = { type: 'update_progress', payload: { progress: parseInt(actionPayload || '0') } };
          break;
        case 'add_subtask':
          action = { type: 'add_subtask', payload: { title: actionPayload } };
          break;
        case 'get_next_task':
          action = { type: 'get_next_task', payload: {} };
          break;
        default:
          dreamActivityLogger.logActivity('unknown_action_type', {
            action_type: actionType,
            action_payload: actionPayload
          });
          return null;
      }

      if (action) {
        dreamActivityLogger.logActivity('action_parsed_successfully', {
          action_type: action.type,
          has_payload: Object.keys(action.payload).length > 0
        });
      }

      return action;
    } catch (error) {
      dreamActivityLogger.logError('action_parsing_error', {
        response_preview: response.substring(0, 200),
        error: error instanceof Error ? error.message : String(error)
      });
      return null;
    }
  }, []);

  // Quick actions with enhanced logging - memoized to prevent re-creation
  const quickTaskActions = useMemo(() => ({
    markSubTaskComplete: async (subTaskId: string) => {
      await dreamActivityLogger.logActivity('quick_action_triggered', {
        action: 'mark_subtask_complete',
        subtask_id: subTaskId,
        trigger_source: 'quick_action_button'
      });
      return executeCoachActionWithLogging({ type: 'complete_subtask', payload: { subTaskId } }, 'user_action');
    },
    
    markTaskComplete: async () => {
      await dreamActivityLogger.logActivity('quick_action_triggered', {
        action: 'mark_task_complete',
        task_id: currentTask?.id,
        trigger_source: 'quick_action_button'
      });
      return executeCoachActionWithLogging({ type: 'complete_task', payload: {} }, 'user_action');
    },
    
    updateProgress: async (progress: number) => {
      await dreamActivityLogger.logActivity('quick_action_triggered', {
        action: 'update_progress',
        progress_value: progress,
        previous_progress: currentTask?.progress,
        trigger_source: 'quick_action_button'
      });
      return executeCoachActionWithLogging({ type: 'update_progress', payload: { progress } }, 'user_action');
    },
    
    addSubTask: async (title: string) => {
      await dreamActivityLogger.logActivity('quick_action_triggered', {
        action: 'add_subtask',
        subtask_title: title,
        current_subtasks_count: currentTask?.sub_tasks?.length || 0,
        trigger_source: 'quick_action_button'
      });
      return executeCoachActionWithLogging({ type: 'add_subtask', payload: { title } }, 'user_action');
    },
    
    getNextTask: async () => {
      await dreamActivityLogger.logActivity('quick_action_triggered', {
        action: 'get_next_task',
        current_task_id: currentTask?.id,
        trigger_source: 'quick_action_button'
      });
      return executeCoachActionWithLogging({ type: 'get_next_task', payload: {} }, 'user_action');
    }
  }), [currentTask?.id, currentTask?.progress, currentTask?.sub_tasks?.length, executeCoachActionWithLogging]);

  // Memoized session stats to prevent re-renders
  const sessionStats = useMemo(() => ({
    messageCount,
    actionCount,
    sessionDuration: Date.now() - sessionStartTimeRef.current,
    sessionId: sessionIdRef.current
  }), [messageCount, actionCount]);

  // Log session stats periodically - stable interval
  useEffect(() => {
    const interval = setInterval(async () => {
      const sessionDuration = Date.now() - sessionStartTimeRef.current;
      
      await dreamActivityLogger.logActivity('session_stats_update', {
        session_duration_ms: sessionDuration,
        messages_sent: messageCount,
        actions_executed: actionCount,
        task_id: currentTask?.id,
        current_progress: currentTask?.progress
      });
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [messageCount, actionCount, currentTask?.id, currentTask?.progress]);

  return {
    messages,
    isLoading,
    sendMessage: sendTaskAwareMessage,
    resetConversation,
    currentAgent,
    switchAgent,
    currentTask,
    executeCoachAction: executeCoachActionWithLogging,
    parseCoachResponse: parseCoachResponseWithLogging,
    quickTaskActions,
    // Debug info
    sessionStats
  };
};
