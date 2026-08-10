/**
 * BlueprintGrowingNote — step 3 of first contact.
 *
 * The deep blueprint takes 15-30 minutes and is woven in the background while
 * the user is already talking. Nothing on screen says so, and the ring that
 * shows it is deliberately quiet — quiet enough that nobody would work out what
 * it means unaided.
 *
 * So it gets explained exactly once, here, at the only moment it is genuinely
 * interesting: after the Twin has said something true and been given a name,
 * before the conversation proper begins. After this it is never explained
 * again; the ring simply stays, and later means "in place".
 *
 * This lived inside TwinNamingCard as one line. It is its own step because
 * naming and this are two different things to take in, and stacking them was
 * part of what made first contact feel like being handed four things at once.
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

const COPY = {
  en: {
    lead: "One more thing while we talk: I'm still weaving the deeper layers of your blueprint together — the frameworks take a while to settle into something I can actually use.",
    ring: 'You can watch it fill. The ring around the message box below closes as it goes, and once it is complete it stays there — so you always know it is in place.',
    cta: 'Got it',
  },
  nl: {
    lead: 'Nog één ding terwijl we praten: ik weef de diepere lagen van je blauwdruk nog samen — de frameworks hebben even nodig om tot iets te komen waar ik echt mee kan werken.',
    ring: 'Je kunt het zien vullen. De ring om het berichtveld hieronder sluit zich onderweg, en zodra hij compleet is blijft hij staan — zo weet je altijd dat het er is.',
    cta: 'Duidelijk',
  },
};

export const BlueprintGrowingNote: React.FC<{ onAcknowledge: () => void }> = ({ onAcknowledge }) => {
  const { language } = useLanguage();
  const t = COPY[language === 'nl' ? 'nl' : 'en'];

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ss-r border border-soul-purple/25 bg-soul-purple/5 p-3 space-y-2.5">
      <p className="text-sm text-foreground leading-relaxed">{t.lead}</p>
      <p className="text-xs leading-relaxed" style={{ color: 'var(--ss-muted)' }}>{t.ring}</p>
      <button
        type="button"
        onClick={onAcknowledge}
        className="text-xs ss-rs px-3 py-2 border border-soul-purple/40 bg-soul-purple/10 text-foreground"
      >
        {t.cta}
      </button>
    </div>
  );
};

export default BlueprintGrowingNote;
