import React, { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

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

  // Simulate breakdown; ideally this comes from task.subtasks or similar
  const breakdown = (task.subtasks && task.subtasks.length > 0)
    ? task.subtasks
    : ["Define requirements", "Create designs", "First implementation"];

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
          <div className="mb-2">
            <strong>{t('tasks.preview.whatHappensNext')}</strong>
            <div className="text-sm text-muted-foreground mt-1">
              {t('tasks.preview.nextDescription')}
            </div>
          </div>
          <div className="mb-2">
            <strong>{t('tasks.preview.outcomeGoal')}</strong>
            <div className="text-sm">{task.goal || t('tasks.preview.defaultGoal')}</div>
          </div>
          <div>
            <strong>{t('tasks.preview.miniSteps')}</strong>
            <ol className="list-decimal ml-6 text-sm">
              {breakdown.map((b: string, i: number) => (
                <li key={i}>{b}</li>
              ))}
            </ol>
          </div>
        </div>
      )}
    </div>
  );
};