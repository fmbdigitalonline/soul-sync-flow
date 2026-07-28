/**
 * PersonalityDescription — the body of the blueprint detail modal, on the
 * design system. Icon tiles and type scale match the rest of the app; the
 * headings are translated rather than hardcoded English.
 */

import React from 'react';
import { Sparkles, Moon, Lightbulb, Brain, Zap, Target } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface PersonalityDescriptionProps {
  light: string;
  shadow: string;
  insight: string;
  think?: string;
  act?: string;
  react?: string;
  compact?: boolean;
}

const COPY = {
  en: {
    light: 'Light side', shadow: 'Shadow side', integration: 'Integration',
    alignment: 'Staying in alignment',
    think: 'How to think', act: 'How to act', react: 'How to react',
  },
  nl: {
    light: 'Lichte kant', shadow: 'Schaduwkant', integration: 'Integratie',
    alignment: 'In afstemming blijven',
    think: 'Hoe te denken', act: 'Hoe te handelen', react: 'Hoe te reageren',
  },
};

const Row: React.FC<{ icon: React.ReactNode; title: string; body: string; emphasis?: boolean }> = ({
  icon, title, body, emphasis = false,
}) => (
  <div className="flex gap-3 items-start">
    <span className="shrink-0 grid place-items-center"
      style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--ss-accent-wash)', color: 'var(--ss-accent)' }}>
      {icon}
    </span>
    <div className="min-w-0 flex-1">
      <h4 className="text-[13.5px] font-semibold mb-0.5" style={{ color: 'var(--ss-ink)' }}>{title}</h4>
      <p className="text-[13px] leading-relaxed" style={{ color: emphasis ? 'var(--ss-ink)' : 'var(--ss-muted)' }}>{body}</p>
    </div>
  </div>
);

export const PersonalityDescription: React.FC<PersonalityDescriptionProps> = ({
  light,
  shadow,
  insight,
  think,
  act,
  react,
  compact = false,
}) => {
  const { language } = useLanguage();
  const t = COPY[language === 'nl' ? 'nl' : 'en'];

  if (compact) {
    // Card overview — the insight alone.
    return (
      <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ss-muted)' }}>
        {insight}
      </p>
    );
  }

  const ic = 'h-[16px] w-[16px]';

  return (
    <div className="flex flex-col gap-3.5 text-left">
      {light && <Row icon={<Sparkles className={ic} />} title={t.light} body={light} />}
      {shadow && <Row icon={<Moon className={ic} />} title={t.shadow} body={shadow} />}
      {insight && <Row icon={<Lightbulb className={ic} />} title={t.integration} body={insight} emphasis />}

      {(think || act || react) && (
        <div className="mt-2 pt-4" style={{ borderTop: '1px solid var(--ss-line-2)' }}>
          <h3 className="text-[15px] font-semibold tracking-tight mb-3" style={{ color: 'var(--ss-ink)' }}>
            {t.alignment}
          </h3>
          <div className="flex flex-col gap-3.5">
            {think && <Row icon={<Brain className={ic} />} title={t.think} body={think} />}
            {act && <Row icon={<Zap className={ic} />} title={t.act} body={act} />}
            {react && <Row icon={<Target className={ic} />} title={t.react} body={react} />}
          </div>
        </div>
      )}
    </div>
  );
};
