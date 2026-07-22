/**
 * SentenceActionModal — the four-intent "Help me…" card, as a popup usable on
 * every screen (founder request, Jul 2026). Selecting any passage anywhere in
 * the app opens this modal; it asks ONE question — "How can I help you with
 * this?" — and offers the same relational intents as the in-chat card:
 *   understand · change_pattern · achieve · remember.
 *
 * Intent, never implementation: no engine names, no mechanism words. Routing
 * is owned by the SentenceActionProvider (the intents that need the
 * conversation carry the passage into the Companion; remember writes in place).
 */

import React from 'react';
import { Loader2 } from 'lucide-react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SentenceAction } from '@/components/coach/SentenceActionButtons';

const COPY = {
  en: {
    heading: 'How can I help you with this?',
    understand: 'Help me understand this',
    change_pattern: 'Help me change this pattern',
    achieve: 'Help me achieve this',
    remember: 'Help me remember this',
    close: 'Close',
  },
  nl: {
    heading: 'Hoe kan ik je hiermee helpen?',
    understand: 'Help me dit begrijpen',
    change_pattern: 'Help me dit patroon veranderen',
    achieve: 'Help me dit bereiken',
    remember: 'Help me dit onthouden',
    close: 'Sluiten',
  },
};

const INTENTS: Array<{ action: SentenceAction; emoji: string }> = [
  { action: 'understand', emoji: '🧠' },
  { action: 'change_pattern', emoji: '🌱' },
  { action: 'achieve', emoji: '🎯' },
  { action: 'remember', emoji: '💭' },
];

export const SentenceActionModal: React.FC<{
  open: boolean;
  text: string;
  busy?: SentenceAction | null;
  onAction: (action: SentenceAction) => void;
  onClose: () => void;
}> = ({ open, text, busy = null, onAction, onClose }) => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent
        data-no-sentence-action
        className="ss max-w-sm p-0 gap-0 overflow-hidden border-0"
        style={{ background: 'var(--ss-card)', borderRadius: 22, boxShadow: 'var(--ss-shadow)' }}
      >
        {/* The selected passage — verbatim, so the user sees what they picked. */}
        <div className="px-5 pt-5">
          <div
            className="text-[13.5px] leading-relaxed rounded-2xl px-4 py-3"
            style={{ background: 'var(--ss-accent-wash)', color: 'var(--ss-ink)' }}
          >
            “{text.length > 220 ? `${text.slice(0, 219).trimEnd()}…` : text}”
          </div>
        </div>

        <div className="px-5 pt-4 pb-5">
          <p className="text-[12.5px] font-medium mb-2.5" style={{ color: 'var(--ss-muted)' }}>{t.heading}</p>
          <div className="flex flex-col gap-2">
            {INTENTS.map(({ action, emoji }) => {
              const thisBusy = busy === action;
              return (
                <button
                  key={action}
                  type="button"
                  disabled={!!busy}
                  onClick={() => onAction(action)}
                  className="w-full flex items-center gap-3 text-left rounded-2xl px-3.5 py-3 border transition-colors"
                  style={{ borderColor: 'var(--ss-line)', background: 'var(--ss-surface)' }}
                >
                  <span className="shrink-0 grid place-items-center" style={{ width: 30, height: 30 }}>
                    {thisBusy ? <Loader2 className="h-4 w-4 animate-spin" style={{ color: 'var(--ss-accent)' }} /> : <span className="text-[17px] leading-none">{emoji}</span>}
                  </span>
                  <span className="text-[13.5px] font-medium" style={{ color: 'var(--ss-ink)' }}>{t[action]}</span>
                </button>
              );
            })}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SentenceActionModal;
