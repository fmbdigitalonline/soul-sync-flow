
import React, { useState } from "react";

/**
 * Props:
 * - task: the task object containing breakdown, goal, description, etc.
 */
interface TaskPreviewProps {
  task: any;
}

export const TaskPreview: React.FC<TaskPreviewProps> = ({ task }) => {
  const [expanded, setExpanded] = useState(false);

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
            <strong>Mini-steps:</strong>
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
