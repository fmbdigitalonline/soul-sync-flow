/**
 * PanelCoachDock — the Coach OS's own dialogue, inside the panel
 * (Constitution v2.7: twin-chat-clean law).
 *
 * The operational conversation happens HERE, context-bound to whatever is
 * open (a program's week, a milestone, a task), powered by the built
 * program-aware coach engine in its own register (guide mode, session
 * isolation, persistence). The Twin's stream never receives operational
 * prompts — the two dialogues connect through state and memory, not
 * prompt-pasting.
 *
 * Wired to programAwareCoachService directly — deliberately NOT via
 * use-program-aware-coach (its fake per-character typewriter pacing is an
 * audited discard, INTELLIGENCE map).
 */

import React, { useEffect, useRef, useState } from 'react';
import { Loader2, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { programAwareCoachService, type Message } from '@/services/program-aware-coach-service';
import { cn } from '@/lib/utils';

interface PanelCoachDockProps {
  /** Stable context key — one coach session per open context. */
  contextKey: string;
  /** Sent automatically as the opening message when this context has no history. */
  seedPrompt?: string;
  placeholder?: string;
  className?: string;
}

const PAGE_CONTEXT = 'coach-panel';

export const PanelCoachDock: React.FC<PanelCoachDockProps> = ({
  contextKey,
  seedPrompt,
  placeholder = 'Talk with your coach…',
  className,
}) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);
  const seedSentRef = useRef(false);

  const sessionId = user ? `panel_${contextKey}_${user.id}` : null;

  // Load persisted history for this context; auto-send the seed once when
  // the context is fresh.
  useEffect(() => {
    let cancelled = false;
    setInitialized(false);
    seedSentRef.current = false;
    setMessages([]);
    if (!user || !sessionId) return;
    (async () => {
      const history = await programAwareCoachService.loadConversationHistory(sessionId, user.id);
      if (cancelled) return;
      setMessages(history);
      setInitialized(true);
      if (history.length === 0 && seedPrompt && !seedSentRef.current) {
        seedSentRef.current = true;
        void send(seedPrompt, true);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, user?.id]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [messages, isLoading]);

  const send = async (content: string, isSeed = false) => {
    if (!user || !sessionId || !content.trim() || isLoading) return;
    const userMessage: Message = {
      id: `${sessionId}_u_${Date.now()}`,
      content: content.trim(),
      sender: 'user',
      timestamp: new Date(),
    };
    // The seed reads as context-setting, so it shows like any user turn —
    // provenance visible, nothing hidden.
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const res = await programAwareCoachService.sendProgramAwareMessage(
        content.trim(),
        sessionId,
        user.id,
        true,
        PAGE_CONTEXT,
      );
      setMessages((prev) => [
        ...prev,
        {
          id: `${sessionId}_a_${Date.now()}`,
          content: res.response,
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error('❌ Panel coach message failed:', e);
      setMessages((prev) => [
        ...prev,
        {
          id: `${sessionId}_err_${Date.now()}`,
          content: 'The coach hit a connection issue — try that again.',
          sender: 'assistant',
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={cn('rounded-lg border border-border/60 bg-background/60 overflow-hidden', className)}>
      <div className="max-h-56 overflow-y-auto p-2.5 space-y-2">
        {!initialized && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground py-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Opening your coach…</span>
          </div>
        )}
        {messages.map((m) => (
          <div
            key={m.id}
            className={cn(
              'text-xs leading-relaxed rounded-lg px-2.5 py-1.5 max-w-[92%] whitespace-pre-wrap',
              m.sender === 'user'
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
            <span>Coach is thinking…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <form
        className="flex items-center gap-1.5 border-t border-border/60 p-1.5"
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder}
          disabled={isLoading || !initialized}
          className="flex-1 bg-transparent text-xs px-2 py-1.5 outline-none placeholder:text-muted-foreground/60"
        />
        <Button type="submit" size="icon" className="h-7 w-7" disabled={isLoading || !input.trim()}>
          <Send className="h-3.5 w-3.5" />
        </Button>
      </form>
    </div>
  );
};

export default PanelCoachDock;
