/**
 * PanelDiscoveryFlow — the "I don't know my goal yet" door (Wave 2).
 *
 * Surfaces the built blueprint-aware discovery engine
 * (use-blueprint-aware-dream-discovery-coach): a phased coach
 * conversation that generates DREAM SUGGESTIONS from the user's
 * blueprint. Selecting a suggestion hands off to the existing
 * achievement intake (openPanelWithIntake) — discovery ends where the
 * build flow begins, one continuous journey.
 *
 * v2.7: this dialogue is the Coach's, in the panel. Three-Pieces:
 * suggestions capped at 3; one primary action per stage.
 */

import React, { useEffect, useRef, useState } from 'react';
import { X, Loader2, Send, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useBlueprintAwareDreamDiscoveryCoach } from '@/hooks/use-blueprint-aware-dream-discovery-coach';
import { useWorkspace } from '@/contexts/WorkspaceContext';

interface PanelDiscoveryFlowProps {
  onClose: () => void;
}

export const PanelDiscoveryFlow: React.FC<PanelDiscoveryFlowProps> = ({ onClose }) => {
  const {
    messages,
    isLoading,
    sendMessage,
    dreamSuggestions,
    selectDreamSuggestion,
  } = useBlueprintAwareDreamDiscoveryCoach();
  const { openPanelWithIntake } = useWorkspace();
  const [input, setInput] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const startedRef = useRef(false);

  // Open the conversation with an honest invitation once.
  useEffect(() => {
    if (startedRef.current || messages.length > 0) return;
    startedRef.current = true;
    void sendMessage(
      "I don't know exactly what I want yet — help me discover a dream that fits who I am.",
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading, dreamSuggestions]);

  const adoptSuggestion = (s: { id: string; title: string; category: string }) => {
    selectDreamSuggestion?.(s as any);
    // Hand off to the existing build flow — discovery's exit IS the
    // achievement intake, with the suggestion as the frozen title.
    openPanelWithIntake({
      title: s.title.slice(0, 80),
      category: s.category || 'personal_growth',
      timeframe: '3 months',
      source: 'offer',
    });
    onClose();
  };

  return (
    <Card className="p-3 border-primary/30 bg-primary/5 space-y-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary/80">
            ✨ Discover your dream
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Your coach reads your blueprint and explores with you.
          </p>
        </div>
        <Button variant="ghost" size="icon" className="h-6 w-6 flex-shrink-0" onClick={onClose} aria-label="Close discovery">
          <X className="h-3.5 w-3.5" />
        </Button>
      </div>

      <div className="max-h-56 overflow-y-auto space-y-2">
        {messages.map((m: any) => (
          <div
            key={m.id}
            className={cn(
              'text-xs leading-relaxed rounded-lg px-2.5 py-1.5 max-w-[92%] whitespace-pre-wrap',
              (m.sender === 'user' || m.isUser)
                ? 'ml-auto bg-primary/10 text-foreground'
                : 'mr-auto bg-muted/50 text-foreground',
            )}
          >
            {m.content}
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Your coach is reading your blueprint…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Blueprint-born suggestions — pick one, land in the build flow */}
      {dreamSuggestions.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Suggestions from your blueprint
          </p>
          {dreamSuggestions.slice(0, 3).map((s: any) => (
            <button
              key={s.id}
              type="button"
              onClick={() => adoptSuggestion(s)}
              className="w-full text-left rounded-lg px-2.5 py-2 border border-primary/25 bg-background/60 hover:bg-primary/10 transition-colors"
            >
              <div className="flex items-center gap-1.5">
                <Sparkles className="h-3 w-3 text-primary shrink-0" />
                <p className="text-xs font-semibold text-foreground truncate">{s.title}</p>
              </div>
              {s.blueprintReason && (
                <p className="text-[11px] text-muted-foreground leading-snug mt-0.5 line-clamp-2">
                  {s.blueprintReason}
                </p>
              )}
            </button>
          ))}
        </div>
      )}

      <form
        className="flex items-center gap-1.5 border-t border-border/60 pt-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          if (input.trim() && !isLoading) {
            void sendMessage(input.trim());
            setInput('');
          }
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Tell your coach what stirs you…"
          disabled={isLoading}
          className="flex-1 bg-transparent text-xs px-2 py-1.5 outline-none placeholder:text-muted-foreground/60"
        />
        <Button type="submit" size="icon" className="h-7 w-7" disabled={isLoading || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </Card>
  );
};

export default PanelDiscoveryFlow;
