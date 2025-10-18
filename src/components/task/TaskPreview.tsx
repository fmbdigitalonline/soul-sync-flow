import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useTaskAssistant } from "@/hooks/use-task-assistant";
import { Loader2 } from "lucide-react";

/**
 * Props:
 * - task: the task object containing breakdown, goal, description, etc.
 */
interface TaskPreviewProps {
  task: any;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);
  const { t } = useLanguage();
  
  // Use the task assistant hook to get personalized breakdown
  const { assistantData, loading } = useTaskAssistant(task);

  // Use database subtasks if available, otherwise use generated data, with loading fallback
  const breakdown = task.sub_tasks?.map((st: any) => st.title) 
    || assistantData?.checklistSteps 
    || (loading ? [t('tasks.preview.generatingSteps') || "Personalizing your breakdown..."] : []);
    
  const goal = assistantData?.motivationalFraming 
    || task.goal 
    || t('tasks.preview.defaultGoal');

  return (
    <div className="my-2">
      <button
        className="flex items-center text-soul-purple font-medium focus:outline-none hover:underline"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="mr-2">{expanded ? t('tasks.preview.hideInfo') : t('tasks.preview.showInfo')}</span>
        <span className="text-xl">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="bg-slate-50 rounded-xl p-4 mt-2 animate-fade-in border border-slate-200">
          {loading && (
            <div className="flex items-center gap-2 text-sm text-soul-purple mb-3">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Generating your personalized breakdown...</span>
            </div>
          )}
          
          <div className="mb-2">
            <strong>{t('tasks.preview.whatHappensNext')}</strong>
            <div className="text-sm text-muted-foreground mt-1">
              {t('tasks.preview.nextDescription')}
            </div>
          </div>
          <div className="mb-2">
            <strong>{t('tasks.preview.outcomeGoal')}</strong>
            <div className="text-sm">{goal}</div>
          </div>
          <div>
            <strong>{t('tasks.preview.miniSteps')}</strong>
            <ol className="list-decimal ml-6 text-sm">
              {breakdown.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ol>
          </div>
          
          {assistantData?.timeOptimization && (
            <div className="mt-3 p-2 bg-soul-purple/10 rounded-lg">
              <div className="text-xs font-medium text-soul-purple mb-1">⏰ Optimal Timing</div>
              <div className="text-sm text-muted-foreground">{assistantData.timeOptimization}</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};