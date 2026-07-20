/**
 * PanelEpisodeHistory — closed conversation episodes in the panel's History
 * (Constitution v3.2 Slice 2). Episodes as the user thinks of them, newest
 * first, each opening to a read-only transcript. No session IDs, no
 * lifecycle jargon — perspective, not infrastructure. This is also the
 * first brick of the eventual "My Journey" horizon.
 */

import React, { useEffect, useState } from 'react';
import { ChevronRight, MessageSquare } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  conversationEpisodeService,
  type EpisodeSummary,
  type EpisodeMessage,
} from '@/services/conversation-episode-service';

function relativeDay(iso: string, lang: 'en' | 'nl'): string {
  const then = new Date(iso);
  const now = new Date();
  const days = Math.floor((now.getTime() - then.getTime()) / 86_400_000);
  if (days <= 0) return lang === 'nl' ? 'Vandaag' : 'Today';
  if (days === 1) return lang === 'nl' ? 'Gisteren' : 'Yesterday';
  if (days < 7) return lang === 'nl' ? `${days} dagen geleden` : `${days} days ago`;
  return then.toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', { month: 'short', day: 'numeric' });
}

export const PanelEpisodeHistory: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const [episodes, setEpisodes] = useState<EpisodeSummary[] | null>(null);
  const [open, setOpen] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<EpisodeMessage[] | null>(null);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    conversationEpisodeService.listEpisodes(user.id).then((e) => {
      if (!cancelled) setEpisodes(e);
    });
    return () => {
      cancelled = true;
    };
  }, [user]);

  const toggle = async (sessionId: string) => {
    if (open === sessionId) {
      setOpen(null);
      setTranscript(null);
      return;
    }
    setOpen(sessionId);
    setTranscript(null);
    if (user) {
      const t = await conversationEpisodeService.getEpisodeTranscript(user.id, sessionId);
      setTranscript(t);
    }
  };

  if (!episodes) {
    return <p className="text-[11px] text-muted-foreground px-1 py-2">Loading conversations…</p>;
  }
  if (episodes.length === 0) {
    return (
      <p className="text-[11px] text-muted-foreground px-1 py-2">
        {lang === 'nl' ? 'Nog geen gesprekken.' : 'No conversations yet.'}
      </p>
    );
  }

  return (
    <div className="space-y-1">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-1">
        {lang === 'nl' ? 'Gesprekken' : 'Conversations'}
      </p>
      {episodes.map((ep) => (
        <div key={ep.sessionId} className="rounded-lg border border-border/40 overflow-hidden">
          <button
            type="button"
            onClick={() => toggle(ep.sessionId)}
            className="w-full flex items-center gap-2 px-2.5 py-2 text-left hover:bg-muted/40 transition-colors"
          >
            <MessageSquare className="h-3.5 w-3.5 shrink-0 text-soul-purple/70" />
            <span className="min-w-0 flex-1">
              <span className="block text-xs text-foreground truncate">{ep.title}</span>
              <span className="block text-[10px] text-muted-foreground">
                {relativeDay(ep.lastActivity, lang)}
                {ep.isCurrent && (lang === 'nl' ? ' · huidig' : ' · current')}
                {ep.messageCount > 0 ? ` · ${ep.messageCount}` : ''}
              </span>
            </span>
            <ChevronRight
              className={cn(
                'h-3.5 w-3.5 shrink-0 text-muted-foreground transition-transform',
                open === ep.sessionId && 'rotate-90',
              )}
            />
          </button>
          {open === ep.sessionId && (
            <div className="px-2.5 py-2 border-t border-border/40 bg-muted/20 max-h-64 overflow-y-auto space-y-1.5">
              {!transcript ? (
                <p className="text-[10px] text-muted-foreground italic">…</p>
              ) : transcript.length === 0 ? (
                <p className="text-[10px] text-muted-foreground italic">
                  {lang === 'nl' ? 'Geen berichten.' : 'No messages.'}
                </p>
              ) : (
                transcript.map((m, i) => (
                  <div
                    key={i}
                    className={cn(
                      'text-[11px] leading-relaxed',
                      m.role === 'user' ? 'text-foreground' : 'text-muted-foreground',
                    )}
                  >
                    <span className="font-medium">{m.role === 'user' ? '›' : '·'} </span>
                    {m.content}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default PanelEpisodeHistory;
