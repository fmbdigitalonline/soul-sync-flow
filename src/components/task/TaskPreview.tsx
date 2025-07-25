
import React, { useState } from "react";

/**
 * Props:
 * - task: the task object containing breakdown, goal, description, etc.
 * - onCreateSubTasks: callback to convert preview steps into actual subtasks
 */
interface TaskPreviewProps {
  task: any;
  onCreateSubTasks?: (subtasks: string[]) => void;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task, onCreateSubTasks }) => {
  const [expanded, setExpanded] = useState(false);

  // Get breakdown from task or use defaults
  const breakdown = (task.subtasks && task.subtasks.length > 0)
    ? task.subtasks.map((st: any) => typeof st === 'string' ? st : st.title)
    : ["Define requirements", "Create designs", "First implementation"];

  const hasActualSubTasks = task.subtasks && task.subtasks.length > 0;

  const handleCreateSubTasks = () => {
    if (onCreateSubTasks && !hasActualSubTasks) {
      onCreateSubTasks(breakdown);
    }
  };

  return (
    <div className="my-2">
      <button
        className="flex items-center text-soul-purple font-medium focus:outline-none hover:underline"
        onClick={() => setExpanded((e) => !e)}
        aria-expanded={expanded}
      >
        <span className="mr-2">{expanded ? "Hide Info" : "Preview / More Info"}</span>
        <span className="text-xl">{expanded ? "−" : "+"}</span>
      </button>
      {expanded && (
        <div className="bg-slate-50 rounded-xl p-4 mt-2 animate-fade-in border border-slate-200">
          <div className="mb-2">
            <strong>What happens next:</strong>
            <div className="text-sm text-muted-foreground mt-1">
              You’ll work side-by-side with your Soul Coach to break this task into manageable, motivating mini-steps.
            </div>
          </div>
          <div className="mb-2">
            <strong>Outcome / Goal:</strong>
            <div className="text-sm">{task.goal || "See this task through to completion"}</div>
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <strong>Mini-steps:</strong>
              {!hasActualSubTasks && onCreateSubTasks && (
                <button
                  onClick={handleCreateSubTasks}
                  className="text-xs px-2 py-1 bg-soul-purple text-white rounded hover:bg-soul-purple/90 transition-colors"
                >
                  Create as SubTasks
                </button>
              )}
            </div>
            <ol className="list-decimal ml-6 text-sm">
              {breakdown.map((b: string, i: number) => (
                <li key={i} className={hasActualSubTasks ? "text-green-700" : ""}>{b}</li>
              ))}
            </ol>
            {hasActualSubTasks && (
              <p className="text-xs text-green-600 mt-1">✓ These steps are now active subtasks</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
