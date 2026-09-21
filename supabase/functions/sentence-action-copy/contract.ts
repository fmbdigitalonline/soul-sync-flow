export const ALLOWED_ACTIONS = ['understand', 'change_pattern', 'achieve', 'remember'] as const;
export type AllowedAction = typeof ALLOWED_ACTIONS[number];

export type ActionCopyPayload = {
  question: string;
  actions: Array<{ action: AllowedAction; label: string; rank: number }>;
};

export function assertActionCopyPayload(value: unknown): ActionCopyPayload {
  if (!value || typeof value !== 'object') throw new Error('Model returned no JSON object');
  const payload = value as ActionCopyPayload;
  if (typeof payload.question !== 'string' || !payload.question.trim() || payload.question.length > 120) {
    throw new Error('Invalid question');
  }
  if (!Array.isArray(payload.actions) || payload.actions.length !== 4) throw new Error('Expected four actions');
  const routes = new Set<string>();
  const labels = new Set<string>();
  const ranks = new Set<number>();
  for (const item of payload.actions) {
    if (!ALLOWED_ACTIONS.includes(item?.action)) throw new Error('Unknown action route');
    if (typeof item.label !== 'string' || item.label.trim().length < 4 || item.label.length > 110) throw new Error('Invalid label');
    if (!Number.isInteger(item.rank) || item.rank < 1 || item.rank > 4) throw new Error('Invalid rank');
    routes.add(item.action);
    labels.add(item.label.trim().toLocaleLowerCase());
    ranks.add(item.rank);
  }
  if (routes.size !== 4 || labels.size !== 4 || ranks.size !== 4) throw new Error('Actions, labels and ranks must be unique');
  return { question: payload.question.trim(), actions: payload.actions.sort((a, b) => a.rank - b.rank) };
}