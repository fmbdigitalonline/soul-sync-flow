/**
 * TwinNamingCard — the birth of the relationship (Constitution v3.3).
 *
 * Appears in-conversation immediately AFTER the Twin's first message —
 * never before. The Twin itself asks for a name (conversational, not a
 * settings screen), offers three blueprint-informed suggestions each with
 * a one-line reason, and a path to choose your own. Framed for
 * recognition — "What name feels right for me?" — not invention.
 */

import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { useLanguage } from '@/contexts/LanguageContext';
import { twinNamingService, type TwinNameSuggestion } from '@/services/twin-naming-service';

interface TwinNamingCardProps {
  onNamed: (name: string) => void;
  onLater: () => void;
}

const COPY = {
  en: {
    lead: "Since we'll be spending time together, I'd like a name. Looking at your blueprint, a few came to mind —",
    prompt: 'Which one feels right for me?',
    own: "I'd rather choose my own",
    ownPlaceholder: 'A name that feels right…',
    confirm: 'This one',
    thinking: 'Thinking of a few names…',
    later: 'Maybe later',
  },
  nl: {
    lead: 'Nu we tijd samen gaan doorbrengen, wil ik graag een naam. Kijkend naar je blauwdruk kwamen er een paar op —',
    prompt: 'Welke voelt goed voor mij?',
    own: 'Ik kies liever zelf',
    ownPlaceholder: 'Een naam die goed voelt…',
    confirm: 'Deze',
    thinking: 'Ik denk aan een paar namen…',
    later: 'Misschien later',
  },
};

export const TwinNamingCard: React.FC<TwinNamingCardProps> = ({ onNamed, onLater }) => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];

  const [suggestions, setSuggestions] = useState<TwinNameSuggestion[] | null>(null);
  const [ownMode, setOwnMode] = useState(false);
  const [ownValue, setOwnValue] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    twinNamingService.generateNames(lang).then((s) => {
      if (!cancelled) setSuggestions(s);
    });
    return () => {
      cancelled = true;
    };
  }, [lang]);

  const choose = async (name: string, origin: 'blueprint' | 'user', reason?: string) => {
    if (saving || !name.trim()) return;
    setSaving(true);
    await twinNamingService.setTwinName({ name: name.trim(), origin, reason });
    onNamed(name.trim());
  };

  return (
    <div
      className={cn(
        'animate-in fade-in-0 slide-in-from-bottom-2 duration-300',
        'rounded-xl border border-soul-purple/25 bg-soul-purple/5 p-3 space-y-3',
      )}
    >
      <p className="text-sm text-foreground leading-relaxed">{t.lead}</p>

      {!suggestions ? (
        <p className="text-xs text-muted-foreground italic animate-pulse">{t.thinking}</p>
      ) : (
        <>
          <p className="text-xs font-medium text-soul-purple/80">{t.prompt}</p>
          {!ownMode && (
            <div className="flex flex-col gap-1.5">
              {suggestions.map((s) => (
                <button
                  key={s.name}
                  type="button"
                  disabled={saving}
                  onClick={() => choose(s.name, 'blueprint', s.reason)}
                  className="w-full text-left rounded-lg px-3 py-2 border border-border/50 hover:bg-soul-purple/10 hover:border-soul-purple/30 transition-colors disabled:opacity-50"
                >
                  <span className="text-sm font-semibold text-foreground">{s.name}</span>
                  {s.reason && (
                    <span className="block text-xs text-muted-foreground mt-0.5">{s.reason}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {ownMode ? (
            <div className="flex items-center gap-1.5">
              <input
                autoFocus
                value={ownValue}
                onChange={(e) => setOwnValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') choose(ownValue, 'user');
                }}
                placeholder={t.ownPlaceholder}
                maxLength={24}
                className="flex-1 text-sm rounded-lg px-3 py-2 bg-background border border-border/60 focus:border-soul-purple/40 outline-none"
              />
              <button
                type="button"
                disabled={saving || !ownValue.trim()}
                onClick={() => choose(ownValue, 'user')}
                className="text-xs rounded-lg px-3 py-2 border border-soul-purple/40 bg-soul-purple/10 text-foreground disabled:opacity-40"
              >
                {t.confirm}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setOwnMode(true)}
              className="self-start text-xs text-muted-foreground hover:text-foreground underline underline-offset-2"
            >
              {t.own}
            </button>
          )}

          <button
            type="button"
            onClick={onLater}
            className="block text-xs text-muted-foreground/70 hover:text-muted-foreground pt-0.5"
          >
            {t.later}
          </button>
        </>
      )}
    </div>
  );
};

export default TwinNamingCard;
