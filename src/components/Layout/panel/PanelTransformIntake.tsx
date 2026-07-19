/**
 * PanelTransformIntake — the "Help me change this pattern" landing state
 * (Constitution v2.6, Step 1 routing skeleton).
 *
 * The selected passage arrives as the pattern seed — input and provenance.
 * The full transformation-program intake (domain inference, belief
 * drilling seeded by the pattern, weekly arc from the growth engine)
 * lands in Step 3. Until then this state is HONEST: it shows the pattern,
 * says what the Coach will build, and offers to start working on it in
 * conversation right now — no fake program, no theater (Directive 1).
 */

import React from 'react';
import { X, MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useWorkspace } from '@/contexts/WorkspaceContext';

export const PanelTransformIntake: React.FC = () => {
  const { pendingTransformIntake, clearPendingTransformIntake } = useWorkspace();

  if (!pendingTransformIntake) return null;

  const askTwin = () => {
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('coach-workspace:ask', {
          detail: {
            prompt: `Help me work on this pattern: "${pendingTransformIntake.pattern}". Where does it come from, and what would changing it ask of me?`,
          },
        }),
      );
    }
  };

  return (
    <Card className="p-3 border-emerald-500/30 bg-emerald-500/5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
            🌱 Transformation
          </p>
          <p className="text-sm font-medium text-foreground mt-1 leading-snug">
            “{pendingTransformIntake.pattern}”
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 flex-shrink-0"
          onClick={clearPendingTransformIntake}
          aria-label="Dismiss"
        >
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed">
        Your Coach will build a transformation program around this pattern —
        belief work, reflections, and exercises over several weeks, shaped by
        your blueprint. The program builder is being connected to this card.
      </p>

      <Button variant="outline" size="sm" className="w-full h-8 text-xs" onClick={askTwin}>
        <MessageCircle className="h-3.5 w-3.5 mr-1.5" />
        Start working on it in conversation
      </Button>
    </Card>
  );
};

export default PanelTransformIntake;
