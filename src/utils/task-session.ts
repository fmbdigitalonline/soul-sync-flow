import { supabase } from '@/integrations/supabase/client';
import { workingInstructionsPersistenceService, type WorkingInstruction } from '@/services/working-instructions-persistence-service';

export enum TaskSessionType {
  NO_SESSION = 'NO_SESSION',
  BASIC_SESSION = 'BASIC_SESSION',
  WORK_INSTRUCTION_SESSION = 'WORK_INSTRUCTION_SESSION'
}

export interface StoredCoachMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp?: string;
  agentMode?: string;
  suppressDisplay?: boolean;
}

export interface StoredTaskSession {
  taskId: string;
  updatedAt: string;
  coachMessages: StoredCoachMessage[];
  instructionProgress?: Record<string, boolean>;
}

const SESSION_KEY_PREFIX = 'task_coach_session_';
const WORKING_INSTRUCTION_REGEX = /\d+\.\s*\*\*.+?\*\*:/;

function getSessionStorageKey(goalId: string | undefined, taskId: string): string | null {
  if (!goalId) {
    console.warn(`⚠️ Missing goal ID for task ${taskId} - cannot generate scoped session key`);
    return null;
  }

  const encodedGoalId = encodeURIComponent(goalId);
  const encodedTaskId = encodeURIComponent(taskId);
  return `${SESSION_KEY_PREFIX}${encodedGoalId}__${encodedTaskId}`;
}

function getLegacySessionStorageKey(taskId: string): string {
  return `${SESSION_KEY_PREFIX}${taskId}`;
}

type TaskSessionPayload = {
  coachMessages: StoredCoachMessage[];
  instructionProgress?: Record<string, boolean>;
};

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export interface LoadTaskSessionOptions {
  taskTitle?: string;
  goalId?: string;
}

export interface TaskSessionLoadResult {
  session: StoredTaskSession | null;
  source: 'localStorage' | 'database' | 'none';
}

function formatWorkingInstructionsMessage(instructions: WorkingInstruction[], options: LoadTaskSessionOptions = {}): string {
  const introSegments = [
    `Let's resume your task${options.taskTitle ? ` "${options.taskTitle}"` : ''}.`,
    'Here are the working instructions we saved to keep you moving forward.',
    'Follow these working instructions carefully and mark each one complete as you finish it.'
  ];

  const formattedSteps = instructions.map((instruction, index) => {
    const stepNumber = index + 1;
    const lines: string[] = [`${stepNumber}. **${instruction.title}**:`];

    if (instruction.description?.trim()) {
      lines.push(`   ${instruction.description.trim()}`);
    }

    if (instruction.timeEstimate?.trim()) {
      lines.push(`   Time estimate: ${instruction.timeEstimate.trim()}`);
    }

    if (instruction.toolsNeeded && instruction.toolsNeeded.length > 0) {
      const toolList = instruction.toolsNeeded
        .map(tool => {
          if (typeof tool === 'string') return tool;
          if (tool && typeof tool === 'object' && 'name' in tool) {
            return String((tool as { name: string }).name);
          }
          try {
            return JSON.stringify(tool);
          } catch {
            return String(tool);
          }
        })
        .filter(Boolean)
        .join(', ');

      if (toolList.trim().length > 0) {
        lines.push(`   Tools needed: ${toolList}`);
      }
    }

    return lines.join('\n');
  });

  const outro = 'Once you have completed every step, check in so we can wrap this task together.';

  return `${introSegments.join(' ')}\n\n${formattedSteps.join('\n\n')}\n\n${outro}`;
}

async function loadTaskSessionFromDatabase(taskId: string, options: LoadTaskSessionOptions = {}): Promise<StoredTaskSession | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return null;
    }

    // Require goalId for proper instruction isolation
    if (!options.goalId) {
      console.warn(`⚠️ No goal ID provided for task ${taskId}, cannot load specific instructions`);
      return null;
    }

    const instructions = await workingInstructionsPersistenceService.loadWorkingInstructions(
      options.goalId,
      taskId
    );
    if (!instructions || instructions.length === 0) {
      console.log(`ℹ️ No instructions found for goal: ${options.goalId}, task: ${taskId}`);
      return null;
    }

    console.log(`✅ Loaded ${instructions.length} instructions for goal: ${options.goalId}, task: ${taskId}`);

    const { data: progressData, error: progressError } = await supabase
      .from('task_instruction_progress')
      .select('instruction_id, is_completed')
      .eq('user_id', user.id)
      .eq('task_id', taskId);

    if (progressError) {
      throw progressError;
    }

    const instructionProgress: Record<string, boolean> = {};
    progressData?.forEach(entry => {
      if (entry?.instruction_id && entry.is_completed) {
        instructionProgress[entry.instruction_id] = true;
      }
    });

    const messageContent = formatWorkingInstructionsMessage(instructions, options);
    const now = new Date().toISOString();

    const coachMessages: StoredCoachMessage[] = [{
      id: `db-seeded-${taskId}-${Date.now()}`,
      content: messageContent,
      isUser: false,
      timestamp: now,
      agentMode: 'guide'
    }];

    return {
      taskId,
      updatedAt: now,
      coachMessages,
      instructionProgress: Object.keys(instructionProgress).length > 0 ? instructionProgress : undefined
    };
  } catch (error) {
    console.error('Failed to hydrate task session from database', error);
    return null;
  }
}

export async function loadTaskSessionWithDbFallback(taskId: string, options: LoadTaskSessionOptions = {}): Promise<TaskSessionLoadResult> {
  const goalId = options.goalId;
  const localSession = goalId ? loadStoredTaskSession(goalId, taskId) : null;
  if (localSession) {
    return { session: localSession, source: 'localStorage' };
  }

  const dbSession = await loadTaskSessionFromDatabase(taskId, options);
  if (dbSession) {
    return { session: dbSession, source: 'database' };
  }

  return { session: null, source: 'none' };
}

export function loadStoredTaskSession(goalId: string, taskId: string): StoredTaskSession | null {
  if (!isBrowser) return null;

  const scopedKey = getSessionStorageKey(goalId, taskId);
  if (!scopedKey) {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(scopedKey) || window.localStorage.getItem(getLegacySessionStorageKey(taskId));
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;

    const rawMessages = Array.isArray(parsed.coachMessages) ? parsed.coachMessages : [];
    const coachMessages: StoredCoachMessage[] = rawMessages
      .map((message: any) => ({
        id: typeof message?.id === 'string' ? message.id : `local-${Math.random().toString(36).slice(2)}`,
        content: typeof message?.content === 'string' ? message.content : '',
        isUser: Boolean(message?.isUser),
        timestamp: typeof message?.timestamp === 'string' ? message.timestamp : undefined,
        agentMode: typeof message?.agentMode === 'string' ? message.agentMode : undefined,
        suppressDisplay: typeof message?.suppressDisplay === 'boolean' ? message.suppressDisplay : undefined
      }))
      .filter((message: StoredCoachMessage) => message.content.trim().length > 0);

    const instructionProgress = parsed.instructionProgress && typeof parsed.instructionProgress === 'object'
      ? parsed.instructionProgress as Record<string, boolean>
      : undefined;

    const session: StoredTaskSession = {
      taskId,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      coachMessages,
      instructionProgress
    };

    // If we loaded from legacy storage, migrate to scoped key to prevent leakage
    if (!window.localStorage.getItem(scopedKey)) {
      window.localStorage.setItem(scopedKey, JSON.stringify(session));
      window.localStorage.removeItem(getLegacySessionStorageKey(taskId));
    }

    return session;
  } catch (error) {
    console.error('Failed to load stored task session', error);
    return null;
  }
}

export function saveTaskSession(goalId: string, taskId: string, payload: TaskSessionPayload): void {
  if (!isBrowser) return;

  const storageKey = getSessionStorageKey(goalId, taskId);
  if (!storageKey) {
    console.warn(`⚠️ Skipping save for task ${taskId} - missing goal scope`);
    return;
  }

  const session: StoredTaskSession = {
    taskId,
    updatedAt: new Date().toISOString(),
    coachMessages: payload.coachMessages,
    instructionProgress: payload.instructionProgress
  };

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(session));
    // Clean up any legacy keys lingering for this task
    window.localStorage.removeItem(getLegacySessionStorageKey(taskId));
  } catch (error) {
    console.error('Failed to persist task coach session', error);
  }
}

export function clearTaskSession(goalId: string, taskId: string): void {
  if (!isBrowser) return;

  const storageKey = getSessionStorageKey(goalId, taskId);
  const legacyKey = getLegacySessionStorageKey(taskId);

  try {
    if (storageKey) {
      window.localStorage.removeItem(storageKey);
    }
    window.localStorage.removeItem(legacyKey);
  } catch (error) {
    console.error('Failed to clear task coach session', error);
  }
}

export function getTaskSessionType(goalId: string | undefined, taskId: string): TaskSessionType {
  if (!goalId) {
    return TaskSessionType.NO_SESSION;
  }

  const session = loadStoredTaskSession(goalId, taskId);

  if (!session || session.coachMessages.length === 0) {
    return TaskSessionType.NO_SESSION;
  }

  const hasWorkingInstructions = session.coachMessages.some(message =>
    !message.isUser && WORKING_INSTRUCTION_REGEX.test(message.content)
  );

  if (hasWorkingInstructions) {
    return TaskSessionType.WORK_INSTRUCTION_SESSION;
  }

  return TaskSessionType.BASIC_SESSION;
}

export function hasWorkingInstructionMessage(content: string): boolean {
  return WORKING_INSTRUCTION_REGEX.test(content);
}

export async function getTaskSessionTypeAsync(taskId: string, goalId?: string): Promise<TaskSessionType> {
  const localType = getTaskSessionType(goalId, taskId);
  if (localType !== TaskSessionType.NO_SESSION) {
    return localType;
  }

  // Can only check database if we have a goal ID for proper isolation
  if (!goalId) {
    return TaskSessionType.NO_SESSION;
  }

  try {
    const hasStored = await workingInstructionsPersistenceService.hasStoredInstructions(goalId, taskId);
    if (hasStored) {
      return TaskSessionType.WORK_INSTRUCTION_SESSION;
    }
  } catch (error) {
    console.error('Failed to determine task session type from database', error);
  }

  return TaskSessionType.NO_SESSION;
}
