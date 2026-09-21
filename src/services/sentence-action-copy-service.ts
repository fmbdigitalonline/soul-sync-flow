import { supabase } from '@/integrations/supabase/client';
import type { SentenceAction } from '@/components/coach/SentenceActionButtons';

export type SentenceActionCopy = {
  action: SentenceAction;
  label: string;
  rank: number;
};

export type SentenceActionCopyResult = {
  question: string;
  actions: SentenceActionCopy[];
};

const ACTIONS: SentenceAction[] = ['understand', 'change_pattern', 'achieve', 'remember'];

export function validateSentenceActionCopy(value: unknown): SentenceActionCopyResult {
  if (!value || typeof value !== 'object') throw new Error('No action wording was returned.');
  const candidate = value as { question?: unknown; actions?: unknown };
  if (typeof candidate.question !== 'string' || !candidate.question.trim() || candidate.question.length > 120) {
    throw new Error('The follow-up question was invalid.');
  }
  if (!Array.isArray(candidate.actions) || candidate.actions.length !== ACTIONS.length) {
    throw new Error('The four follow-up actions were not returned.');
  }

  const actions = candidate.actions.map((item) => {
    if (!item || typeof item !== 'object') throw new Error('A follow-up action was invalid.');
    const action = (item as { action?: unknown }).action;
    const label = (item as { label?: unknown }).label;
    const rank = (item as { rank?: unknown }).rank;
    if (!ACTIONS.includes(action as SentenceAction)) throw new Error('An unknown follow-up route was returned.');
    if (typeof label !== 'string' || label.trim().length < 4 || label.length > 110) {
      throw new Error('A follow-up label was invalid.');
    }
    if (!Number.isInteger(rank) || Number(rank) < 1 || Number(rank) > 4) {
      throw new Error('A follow-up ranking was invalid.');
    }
    return { action: action as SentenceAction, label: label.trim(), rank: Number(rank) };
  });

  if (new Set(actions.map((item) => item.action)).size !== ACTIONS.length) {
    throw new Error('A follow-up route was duplicated.');
  }
  if (new Set(actions.map((item) => item.label.toLocaleLowerCase())).size !== ACTIONS.length) {
    throw new Error('Follow-up wording was duplicated.');
  }
  if (new Set(actions.map((item) => item.rank)).size !== ACTIONS.length) {
    throw new Error('Follow-up ranking was duplicated.');
  }

  return { question: candidate.question.trim(), actions: actions.sort((a, b) => a.rank - b.rank) };
}

export async function generateSentenceActionCopy(input: {
  selectedSentence: string;
  context: string[];
  language: 'nl' | 'en';
}): Promise<SentenceActionCopyResult> {
  const { data, error } = await supabase.functions.invoke('sentence-action-copy', { body: input });
  if (error) {
    console.error('❌ NBA COPY REQUEST FAILED', { name: error.name, message: error.message });
    throw new Error(error.message);
  }
  const result = validateSentenceActionCopy(data);
  console.info('✅ NBA COPY READY', { actions: result.actions.map((item) => item.action) });
  return result;
}