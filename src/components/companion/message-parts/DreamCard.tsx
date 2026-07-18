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

  // v2.5: milestones live in the workspace panel, not in the conversation.
  // The chat card is a compressed glance — title, progress, and the count —
  // and the roadmap/details are the panel's job (two surfaces, one brain).
  return (
    <CardShell summary={summary}>
      <p className="text-xs text-muted-foreground">
        {milestones.length > 0
          ? `${done}/${milestones.length} milestones — open your workspace to see the roadmap.`
          : "No milestones yet — your workspace builds the roadmap."}
      </p>
    </CardShell>
  );
};
