/**
 * InsightResonanceCard — beat 2 of first contact.
 *
 * The Twin's opening insight used to be followed immediately by a request for
 * a name. The reader had been told something about themselves and was given no
 * chance to say whether it landed — so the first interaction was compliance,
 * not recognition.
 *
 * This asks. Three answers, and none of them is a failure state: "not me" is
 * the most useful of the three, because a mirror that is told it is wrong can
 * correct, and one that is only ever agreed with cannot.
 *
 * The answer is also the product's own question. "That's me" is the last step
 * of the path in THE_PATH.md; this is the first place it can be asked honestly.
 */

import React from 'react';
import { useLanguage } from '@/contexts/LanguageContext';

export type Resonance = 'yes' | 'partly' | 'no';

const COPY = {
  en: {
    prompt: 'Does that land?',
    yes: 'That sounds like me',
    partly: 'Partly',
    no: "That's not me",
  },
  nl: {
    prompt: 'Klopt dit?',
    yes: 'Dit klinkt als ik',
    partly: 'Deels',
    no: 'Dit ben ik niet',
  },
};

/** What the Twin says back. Its own voice, not a confirmation toast. */
export const RESONANCE_REPLY: Record<Resonance, { en: string; nl: string }> = {
  yes: {
    en: "Good. Then I'll build on that.",
    nl: 'Mooi. Daar bouw ik op verder.',
  },
  partly: {
    en: "Useful — I'll hold it lightly until I know you better.",
    nl: 'Nuttig — ik houd het licht tot ik je beter ken.',
  },
  no: {
    en: "Then I'm off, and that's worth more to me than being right. I'll listen closer.",
    nl: 'Dan zit ik ernaast, en dat is me meer waard dan gelijk hebben. Ik luister beter.',
  },
};

export const InsightResonanceCard: React.FC<{ onChoose: (r: Resonance) => void }> = ({ onChoose }) => {
  const { language } = useLanguage();
  const t = COPY[language === 'nl' ? 'nl' : 'en'];

  const options: Array<[Resonance, string]> = [
    ['yes', t.yes],
    ['partly', t.partly],
    ['no', t.no],
  ];

  return (
    <div className="animate-in fade-in-0 slide-in-from-bottom-2 duration-300 ss-r border border-soul-purple/25 bg-soul-purple/5 p-3 space-y-2.5">
      <p className="text-xs font-medium text-soul-purple/80">{t.prompt}</p>
      <div className="flex flex-col gap-1.5">
        {options.map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() => onChoose(key)}
            className="w-full text-left ss-rs px-3 py-2 border border-border/50 hover:bg-soul-purple/10 hover:border-soul-purple/30 transition-colors"
          >
            <span className="text-sm text-foreground">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default InsightResonanceCard;
