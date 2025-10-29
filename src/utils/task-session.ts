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
}

export interface StoredTaskSession {
  taskId: string;
  updatedAt: string;
  coachMessages: StoredCoachMessage[];
  instructionProgress?: Record<string, boolean>;
}

const SESSION_KEY_PREFIX = 'task_coach_session_';
const WORKING_INSTRUCTION_REGEX = /\d+\.\s*\*\*.+?\*\*:/;

type TaskSessionPayload = {
  coachMessages: StoredCoachMessage[];
  instructionProgress?: Record<string, boolean>;
};

const isBrowser = typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';

export function loadStoredTaskSession(taskId: string): StoredTaskSession | null {
  if (!isBrowser) return null;

  try {
    const raw = window.localStorage.getItem(`${SESSION_KEY_PREFIX}${taskId}`);
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
        agentMode: typeof message?.agentMode === 'string' ? message.agentMode : undefined
      }))
      .filter((message: StoredCoachMessage) => message.content.trim().length > 0);

    const instructionProgress = parsed.instructionProgress && typeof parsed.instructionProgress === 'object'
      ? parsed.instructionProgress as Record<string, boolean>
      : undefined;

    return {
      taskId,
      updatedAt: typeof parsed.updatedAt === 'string' ? parsed.updatedAt : new Date().toISOString(),
      coachMessages,
      instructionProgress
    };
  } catch (error) {
    console.error('Failed to load stored task session', error);
    return null;
  }
}

export function saveTaskSession(taskId: string, payload: TaskSessionPayload): void {
  if (!isBrowser) return;

  const session: StoredTaskSession = {
    taskId,
    updatedAt: new Date().toISOString(),
    coachMessages: payload.coachMessages,
    instructionProgress: payload.instructionProgress
  };

  try {
    window.localStorage.setItem(`${SESSION_KEY_PREFIX}${taskId}`, JSON.stringify(session));
  } catch (error) {
    console.error('Failed to persist task coach session', error);
  }
}

export function clearTaskSession(taskId: string): void {
  if (!isBrowser) return;

  try {
    window.localStorage.removeItem(`${SESSION_KEY_PREFIX}${taskId}`);
  } catch (error) {
    console.error('Failed to clear task coach session', error);
  }
}

export function getTaskSessionType(taskId: string): TaskSessionType {
  const session = loadStoredTaskSession(taskId);

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
