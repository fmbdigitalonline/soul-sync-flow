/**
 * SentenceActionContext — the four-intent "Help me…" card, made global
 * (founder request, Jul 2026). Selecting any passage ANYWHERE in the app —
 * reports, rapport, headings, subheadlines, body — surfaces a small "Ask
 * about this" cue; tapping it opens the reusable SentenceActionModal.
 *
 * Excluded: interactive chrome and labels (buttons, links, inputs, nav) and
 * anything marked [data-no-sentence-action]. Single words / bare labels are
 * ignored (a real phrase is required), so button and field labels don't
 * trigger it.
 *
 * Routing reuses what already exists — nothing new invented:
 *   understand     → coach-workspace:ask (the app-level bridge queues it and
 *                    carries the passage into the Companion).
 *   change_pattern → Transformation intake (Coach panel) + navigate.
 *   achieve        → Achievement intake (Coach panel) + navigate.
 *   remember       → saveRememberedInsight — a real write, works in place.
 */

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { saveRememberedInsight } from '@/services/insight-memory-service';
import { SentenceActionModal } from '@/components/companion/SentenceActionModal';
import type { SentenceAction } from '@/components/coach/SentenceActionButtons';

interface Cue { text: string; x: number; y: number }

interface SentenceActionContextValue {
  /** Open the card modal for a passage programmatically (e.g. from a tap). */
  openFor: (text: string) => void;
}

const Ctx = createContext<SentenceActionContextValue | undefined>(undefined);

const MIN_LEN = 8;
const EXCLUDE_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT', 'BUTTON', 'A', 'LABEL', 'CODE', 'PRE']);

function isExcluded(node: Node | null): boolean {
  let el: HTMLElement | null =
    node && node.nodeType === Node.TEXT_NODE ? (node.parentElement as HTMLElement | null) : (node as HTMLElement | null);
  while (el) {
    if (EXCLUDE_TAGS.has(el.tagName)) return true;
    if (el.hasAttribute?.('data-no-sentence-action')) return true;
    if (el.isContentEditable) return true;
    const role = el.getAttribute?.('role');
    if (role === 'button' || role === 'link' || role === 'tab' || role === 'menuitem') return true;
    el = el.parentElement;
  }
  return false;
}

/** A real phrase, not a bare label: min length and at least one space. */
function isMeaningful(text: string): boolean {
  const t = text.trim();
  return t.length >= MIN_LEN && /\s/.test(t);
}

export const SentenceActionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const { openPanelWithIntake, openPanelWithTransformIntake } = useWorkspace();

  const [cue, setCue] = useState<Cue | null>(null);
  const [modalText, setModalText] = useState<string | null>(null);
  const [busy, setBusy] = useState<SentenceAction | null>(null);
  const cueRef = useRef<Cue | null>(null);
  cueRef.current = cue;

  // Read the current selection and, if it's a meaningful passage in allowed
  // content, park a cue at its top edge.
  const evaluateSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || sel.rangeCount === 0) { setCue(null); return; }
    const text = sel.toString();
    if (!isMeaningful(text)) { setCue(null); return; }
    if (isExcluded(sel.anchorNode) || isExcluded(sel.focusNode)) { setCue(null); return; }
    let rect: DOMRect;
    try { rect = sel.getRangeAt(0).getBoundingClientRect(); } catch { setCue(null); return; }
    if (!rect || (rect.width === 0 && rect.height === 0)) { setCue(null); return; }
    const x = Math.min(Math.max(rect.left + rect.width / 2, 64), window.innerWidth - 64);
    const y = rect.top > 56 ? rect.top : rect.bottom + 8;
    setCue({ text: text.trim(), x, y });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onEnd = () => window.setTimeout(evaluateSelection, 0);
    const onSelChange = () => {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed) setCue(null);
    };
    const onScroll = () => setCue(null);
    document.addEventListener('mouseup', onEnd);
    document.addEventListener('touchend', onEnd);
    document.addEventListener('selectionchange', onSelChange);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      document.removeEventListener('mouseup', onEnd);
      document.removeEventListener('touchend', onEnd);
      document.removeEventListener('selectionchange', onSelChange);
      window.removeEventListener('scroll', onScroll);
    };
  }, [evaluateSelection]);

  // The cue is dismissed when the modal opens or the route changes.
  useEffect(() => { setCue(null); }, [location.pathname]);

  const openFor = useCallback((text: string) => {
    const t = text.trim();
    if (!t) return;
    setCue(null);
    setModalText(t);
  }, []);

  const closeModal = useCallback(() => { setModalText(null); setBusy(null); }, []);

  const handleAction = useCallback(async (action: SentenceAction) => {
    const text = modalText;
    if (!text) return;
    const onCompanion = location.pathname.startsWith('/companion') || location.pathname.startsWith('/coach');

    if (action === 'remember') {
      setBusy('remember');
      try {
        const result = await saveRememberedInsight(text);
        toast[result.ok ? 'success' : 'error'](
          result.ok
            ? (lang === 'nl' ? 'Onthouden.' : 'Remembered.')
            : (result.error || (lang === 'nl' ? 'Kon dit nu niet onthouden.' : "Couldn't remember this right now.")),
        );
      } finally {
        closeModal();
      }
      return;
    }

    if (action === 'change_pattern') {
      openPanelWithTransformIntake({ pattern: text.slice(0, 200) });
      closeModal();
      if (!onCompanion) navigate('/companion');
      return;
    }

    if (action === 'achieve') {
      openPanelWithIntake({ title: text.slice(0, 80), category: 'personal_growth', timeframe: '3 months', source: 'sentence' });
      closeModal();
      if (!onCompanion) navigate('/companion');
      return;
    }

    // understand → carry the passage into the conversation via the app bridge.
    const hiddenPrompt = `[CONTEXT: User selected this passage from elsewhere in the app and asks to understand it better: "${text}"] Help them understand this more deeply — what it means, where it comes from, and how it shows up in their life. Speak from their blueprint as you always do; do not offer programs or plans on this turn.`;
    closeModal();
    window.dispatchEvent(new CustomEvent('coach-workspace:ask', { detail: { prompt: hiddenPrompt } }));
  }, [modalText, location.pathname, lang, openPanelWithIntake, openPanelWithTransformIntake, navigate, closeModal]);

  return (
    <Ctx.Provider value={{ openFor }}>
      {children}

      {/* The floating "Ask about this" cue — never a badge, never persistent. */}
      {cue && !modalText && (
        <button
          data-no-sentence-action
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => openFor(cue.text)}
          className="fixed z-[70] -translate-x-1/2 -translate-y-full inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12.5px] font-semibold shadow-lg"
          style={{
            left: cue.x, top: cue.y - 8,
            background: 'var(--ss-accent, #8b5cf6)', color: '#fff',
            border: '1px solid rgba(255,255,255,.18)',
          }}
        >
          <span aria-hidden>✨</span>
          {lang === 'nl' ? 'Vraag hierover' : 'Ask about this'}
        </button>
      )}

      <SentenceActionModal
        open={!!modalText}
        text={modalText || ''}
        busy={busy}
        onAction={handleAction}
        onClose={closeModal}
      />
    </Ctx.Provider>
  );
};

export function useSentenceAction(): SentenceActionContextValue {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useSentenceAction must be used within SentenceActionProvider');
  return ctx;
}

export default SentenceActionProvider;
