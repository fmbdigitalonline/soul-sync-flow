import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { sanitizeCoachContent } from '@/utils/sanitize-coach-content';

interface TaskAssistantData {
  checklistSteps: string[];
  anticipatedBlockers: string[];
  motivationalFraming: string;
  timeOptimization: string;
}

interface UseTaskAssistantResult {
  assistantData: TaskAssistantData | null;
  loading: boolean;
  error: string | null;
}

/**
 * Hook that lazily hydrates cached task breakdowns.
 * Generation now happens on-demand inside the task coach interface,
 * so this hook simply loads existing data when the user asks for it.
 */
export function useTaskAssistant(task: any, enabled = true): UseTaskAssistantResult {
  const [assistantData, setAssistantData] = useState<TaskAssistantData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    if (!enabled) {
      setLoading(false);
      return () => {
        isMounted = false;
      };
    }

    if (!task?.id) {
      setAssistantData(null);
      setLoading(false);
      setError(null);
      return () => {
        isMounted = false;
      };
    }

    const loadCachedAssistant = async () => {
      setLoading(true);
      setError(null);

      try {
        const { data, error: fetchError } = await supabase
          .from('tasks')
          .select('ai_breakdown')
          .eq('id', task.id)
          .single();

        if (!isMounted) {
          return;
        }

        if (fetchError) {
          console.error('❌ TaskAssistant: Failed to load cached breakdown:', fetchError);
          setAssistantData(null);
          setError(fetchError.message);
          setLoading(false);
          return;
        }

        const cached = data?.ai_breakdown;

        if (cached && typeof cached === 'object') {
          const content = typeof cached.content === 'string' ? cached.content : '';
          const sanitizedContent = sanitizeCoachContent(content);
          const checklistSteps = extractChecklistSteps(sanitizedContent);

          setAssistantData({
            checklistSteps,
            anticipatedBlockers: Array.isArray(cached.anticipatedBlockers) ? cached.anticipatedBlockers : [],
            motivationalFraming: typeof cached.motivationalFraming === 'string' ? cached.motivationalFraming : '',
            timeOptimization: typeof cached.timeOptimization === 'string' ? cached.timeOptimization : ''
          });
        } else {
          setAssistantData(null);
        }

        setLoading(false);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        console.error('❌ TaskAssistant: Unexpected error loading cached breakdown:', err);
        setAssistantData(null);
        setError(err instanceof Error ? err.message : 'Failed to load cached breakdown');
        setLoading(false);
      }
    };

    loadCachedAssistant();

    return () => {
      isMounted = false;
    };
  }, [task?.id, enabled]);

  return { assistantData, loading, error };
}

function extractChecklistSteps(content: string): string[] {
  if (!content) {
    return [];
  }

  const lines = content.split(/\n+/);
  const steps: string[] = [];

  for (const line of lines) {
    const match = line.match(/^\s*\d+\.\s*(.*)$/);
    if (match && match[1]) {
      steps.push(match[1].trim());
    }
  }

  if (steps.length === 0) {
    return [content.trim()].filter(Boolean);
  }

  return steps;
}
