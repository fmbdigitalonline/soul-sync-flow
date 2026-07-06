import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { CardShell } from "./CardShell";

/**
 * DreamCard — the living card for one dream. Reference-based: receives a
 * goal_id and hydrates live (never renders a frozen snapshot), so history
 * always shows current truth. Milestone taps speak INTO the conversation
 * rather than navigating away.
 */
export const DreamCard: React.FC<{
  goalId: string;
  fossil?: boolean;
  onSpeak?: (text: string) => void; // sends a visible user message to the twin
}> = ({ goalId, fossil, onSpeak }) => {
  const { data: goal, isError } = useQuery({
    queryKey: ["dream-card", goalId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("user_goals")
        .select("*")
        .eq("id", goalId)
        .single();
      if (error) throw error;
      return data;
    },
  });

  if (isError) {
    return <CardShell fossil summary={<>🎯 This dream is no longer available</>} />;
  }
  if (!goal) return null;

  const milestones: any[] = Array.isArray(goal.milestones) ? goal.milestones : [];
  const done = milestones.filter((m) => m?.completed).length;
  const pct = goal.progress ?? (milestones.length ? Math.round((done / milestones.length) * 100) : 0);

  const summary = (
    <div>
      <div className="flex items-baseline justify-between gap-2">
        <span className="text-sm font-semibold truncate">🎯 {goal.title}</span>
        <span className="text-xs text-muted-foreground shrink-0">{pct}%</span>
      </div>
      <div className="h-1 rounded-full bg-muted mt-2 overflow-hidden">
        <div className="h-full rounded-full bg-soul-purple transition-all" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );

  if (fossil) return <CardShell fossil summary={<>🎯 {goal.title} — {pct}%</>} />;

  return (
    <CardShell summary={summary}>
      <ul className="space-y-1.5">
        {milestones.slice(0, 6).map((m, i) => (
          <li key={i}>
            <button
              type="button"
              onClick={() => onSpeak?.(`Let's work on: ${m?.title || `milestone ${i + 1}`}`)}
              className={`w-full text-left text-xs rounded-lg px-2.5 py-1.5 border transition-colors ${
                m?.completed
                  ? "border-muted text-muted-foreground line-through"
                  : "border-soul-purple/20 hover:bg-soul-purple/10"
              }`}
            >
              {m?.completed ? "✓ " : ""}{m?.title || `Milestone ${i + 1}`}
            </button>
          </li>
        ))}
        {milestones.length === 0 && (
          <li className="text-xs text-muted-foreground">
            No milestones yet — ask your companion to break it down with you.
          </li>
        )}
      </ul>
    </CardShell>
  );
};
