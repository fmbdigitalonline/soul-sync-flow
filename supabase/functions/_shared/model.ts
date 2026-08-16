/**
 * The one place that names a model.
 *
 * Until now 56 call sites across 38 files each hardcoded
 * 'gpt-4.1-mini-2025-04-14'. That is not a model choice, it is 56 model
 * choices that happen to agree, and changing them meant changing all of them.
 * The runtime constitution's second law — one canonical owner — applies to
 * this as much as to any table: the model lives here, call sites say what kind
 * of work they are doing, and nothing else names a model at all.
 *
 * Pinned on purpose. `gpt-5.6-luna` rather than the `gpt-5.6` alias, because an
 * alias moves under you and this system's behaviour is judged by reading its
 * prose. A model that silently changes makes every quality comparison
 * meaningless.
 */
export const CHAT_MODEL = 'gpt-5.6-luna';

/**
 * Models whose reasoning is billed as output and which reject `temperature`.
 * Sending it returns a 400, and 37 functions would fail at once.
 */
export function isReasoningModel(model: string): boolean {
  return /^gpt-5/.test(model) || /^o[134]/.test(model);
}

export type ReasoningEffort = 'none' | 'low' | 'medium' | 'high';

/**
 * What kind of work a call is doing. Deliberately not a router — there is no
 * scoring, no fallback chain, no per-request model selection. It is a named
 * default table, so that raising the effort for one kind of work is one edit
 * here rather than a hunt through the functions.
 */
export type TaskKind =
  /** Fixed-shape JSON out. No deliberation wanted; deliberation invents fields. */
  | 'structured'
  /** Classification, routing, intent detection. */
  | 'classify'
  /** Ordinary conversation, including the Twin. */
  | 'chat'
  /** Long-form writing for a reader. */
  | 'narration'
  /** Reading many sources at once and relating them. */
  | 'synthesis';

export const REASONING_BY_TASK: Record<TaskKind, ReasoningEffort> = {
  structured: 'none',
  classify: 'none',
  chat: 'low',
  narration: 'low',
  // The one step that reads all fifty lenses together. Starts at medium on the
  // advisor's instruction: promote to a larger model only if this is measurably
  // flat, never pre-emptively.
  synthesis: 'medium',
};

/** Default for a call that does not say what it is. Chat is the safe middle. */
export const DEFAULT_TASK: TaskKind = 'chat';
