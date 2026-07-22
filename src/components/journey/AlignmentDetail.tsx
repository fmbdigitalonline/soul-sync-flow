/**
 * AlignmentDetail — the full "Your Alignment" screen (Constitution v3.6).
 * A window toggle (90d / 6m / 1y), the interpreted narrative, the
 * directional trend (no score), the evidence behind it, and a coach
 * reflection. Alignment is interpreted, never scored.
 */

import React, { useState } from 'react';
import { ChevronLeft, Sparkles, Heart, Users, Waves, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlignment } from '@/hooks/use-alignment';
import { alignmentService } from '@/services/alignment-service';

const COPY = {
  en: {
    title: 'Your Alignment',
    w90: '90 Days', w6m: '6 Months', w1y: '1 Year',
    trend: 'Alignment Trend', trendLede: 'Based on your reflections, choices and experiences.',
    less: 'Less aligned', neutral: 'Neutral', more: 'More aligned',
    why: "Why I'm seeing this", whyLede: 'These patterns have the biggest impact on your alignment.',
    coach: 'Coach Reflection',
    coachBody: "Growth isn't always linear. I'm here to help you stay connected to what matters most.",
    talk: 'Talk with echo',
    footer: "Alignment isn't a score. It's a reflection of how closely your daily choices match the person you're becoming.",
    headings: {
      rising: 'Your journey shows a steady movement toward alignment.',
      steady: 'Your journey is holding a steady course.',
      dipping: 'Your journey has felt more effortful lately.',
    },
    subs: {
      rising: "You're increasingly showing up in ways that reflect your strengths, values and deepest intentions.",
      steady: "You're staying close to the values and strengths of your Blueprint.",
      dipping: "Some parts of life have pulled away from what matters most — a gentle place to look.",
    },
  },
  nl: {
    title: 'Jouw Afstemming',
    w90: '90 Dagen', w6m: '6 Maanden', w1y: '1 Jaar',
    trend: 'Afstemmingstrend', trendLede: 'Op basis van je reflecties, keuzes en ervaringen.',
    less: 'Minder', neutral: 'Neutraal', more: 'Meer afgestemd',
    why: 'Waarom ik dit zie', whyLede: 'Deze patronen hebben de grootste invloed op je afstemming.',
    coach: 'Coachreflectie',
    coachBody: 'Groei verloopt niet altijd rechtlijnig. Ik help je verbonden te blijven met wat het belangrijkst is.',
    talk: 'Praat met echo',
    footer: 'Afstemming is geen cijfer. Het weerspiegelt hoe dicht je dagelijkse keuzes bij wie je wordt liggen.',
    headings: {
      rising: 'Je reis toont een gestage beweging richting afstemming.',
      steady: 'Je reis houdt een gestage koers.',
      dipping: 'Je reis voelde de laatste tijd wat zwaarder.',
    },
    subs: {
      rising: 'Je laat je steeds vaker zien op manieren die je sterktes, waarden en diepste intenties weerspiegelen.',
      steady: 'Je blijft dicht bij de waarden en sterktes van je Blauwdruk.',
      dipping: 'Sommige delen van je leven trokken weg van wat het belangrijkst is — een zachte plek om naar te kijken.',
    },
  },
};

const PATTERN_ICONS = [Heart, Sparkles, Users, Waves];

export const AlignmentDetail: React.FC<{
  patterns?: Array<{ text: string }>;
  onBack: () => void;
  onTalk: () => void;
}> = ({ patterns = [], onBack, onTalk }) => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];
  const [windowDays, setWindowDays] = useState(90);
  const { trend } = useAlignment(windowDays);
  const dir = trend.direction;

  const narrative = alignmentService.narrative(trend, windowDays, lang);

  const W = 320, H = 150, PAD = 10;
  const sx = (x: number) => PAD + x * (W - 2 * PAD);
  const sy = (y: number) => (H - PAD) - y * (H - 2 * PAD);
  const pts = trend.points;
  const line = pts.length ? pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ') : '';
  const area = pts.length ? `${line} L${sx(pts[pts.length - 1].x).toFixed(1)},${H - PAD} L${sx(pts[0].x).toFixed(1)},${H - PAD} Z` : '';

  const months = (() => {
    if (!trend.from || !trend.to) return [];
    const a = new Date(trend.from).getTime(), b = new Date(trend.to).getTime();
    return [0, 0.33, 0.66, 1].map((f) =>
      new Date(a + f * (b - a)).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', { month: 'short' }),
    );
  })();

  return (
    <div className="ss flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button onClick={onBack} className="inline-flex items-center gap-1 text-sm font-medium" style={{ color: 'var(--ss-muted)' }}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <div className="text-[17px] font-bold tracking-tight" style={{ color: 'var(--ss-ink)' }}>{t.title}</div>
        <span style={{ width: 20 }} />
      </div>

      {/* Window toggle */}
      <div className="ss-seg">
        {([[90, t.w90], [180, t.w6m], [365, t.w1y]] as Array<[number, string]>).map(([d, label]) => (
          <button key={d} data-on={windowDays === d} onClick={() => setWindowDays(d)}>{label}</button>
        ))}
      </div>

      {/* Narrative */}
      <div className="ss-twin">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[17px] font-semibold leading-snug tracking-tight" style={{ color: 'var(--ss-ink)' }}>
              {t.headings[dir]}
            </p>
            <p className="text-[13.5px] leading-relaxed mt-2" style={{ color: 'var(--ss-muted)' }}>{t.subs[dir]}</p>
          </div>
          <div className="ss-orb shrink-0" style={{ width: 56, height: 56 }} />
        </div>
      </div>

      {/* Trend */}
      <div>
        <div className="text-[16px] font-bold tracking-tight" style={{ color: 'var(--ss-ink)' }}>{t.trend}</div>
        <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--ss-muted)' }}>{t.trendLede}</p>
        {trend.hasData ? (
          <>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: 'auto' }}>
              <defs>
                <linearGradient id="alignFillDetail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0" stopColor="var(--ss-accent)" stopOpacity="0.28" />
                  <stop offset="1" stopColor="var(--ss-accent)" stopOpacity="0" />
                </linearGradient>
              </defs>
              {area && <path d={area} fill="url(#alignFillDetail)" />}
              {line && <path d={line} fill="none" stroke="var(--ss-accent)" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />}
              {pts.map((p, i) => (i % Math.max(1, Math.round(pts.length / 7)) === 0 || i === pts.length - 1) && (
                <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === pts.length - 1 ? 5 : 3} fill="var(--ss-accent)"
                  stroke={i === pts.length - 1 ? 'var(--ss-surface)' : 'none'} strokeWidth={i === pts.length - 1 ? 2 : 0} />
              ))}
            </svg>
            <div className="flex justify-between text-[10.5px] mt-1" style={{ color: 'var(--ss-faint)' }}>
              <span>{t.less}</span><span>{t.neutral}</span><span>{t.more}</span>
            </div>
            {months.length > 0 && (
              <div className="flex justify-between text-[10.5px] mt-1" style={{ color: 'var(--ss-faint)' }}>
                {months.map((m, i) => <span key={i}>{m}</span>)}
              </div>
            )}
          </>
        ) : (
          <p className="text-[13px] mt-3" style={{ color: 'var(--ss-faint)' }}>
            {lang === 'nl' ? 'Nog te weinig reflecties voor een trend — kijk wekelijks even terug.' : 'Not enough reflections yet for a trend — check in weekly.'}
          </p>
        )}
      </div>

      {/* Why I'm seeing this */}
      {patterns.length > 0 && (
        <div className="ss-card">
          <div className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--ss-ink)' }}>{t.why}</div>
          <p className="text-[12.5px] mt-0.5 mb-3" style={{ color: 'var(--ss-muted)' }}>{t.whyLede}</p>
          <div className="flex flex-col gap-3">
            {patterns.slice(0, 4).map((p, i) => {
              const Icon = PATTERN_ICONS[i % PATTERN_ICONS.length];
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center" style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--ss-accent-wash)', color: 'var(--ss-accent)' }}>
                    <Icon className="h-[16px] w-[16px]" />
                  </span>
                  <p className="text-[13px] leading-relaxed flex-1" style={{ color: 'var(--ss-ink)' }}>{p.text}</p>
                  <ChevronRight className="h-[16px] w-[16px] shrink-0 mt-0.5" style={{ color: 'var(--ss-faint)' }} />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Coach Reflection */}
      <div className="ss-twin">
        <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {t.coach}</span>
        <p className="text-[13.5px] leading-relaxed mt-2" style={{ color: 'var(--ss-ink)' }}>{t.coachBody}</p>
        <button onClick={onTalk} className="mt-3 inline-flex items-center gap-2 text-[13.5px] font-semibold rounded-full pl-4 pr-2.5 py-2 border"
          style={{ color: 'var(--ss-accent-ink)', background: 'var(--ss-card)', borderColor: 'var(--ss-line)' }}>
          {t.talk} <span className="ss-orb" style={{ width: 22, height: 22 }} />
        </button>
      </div>

      {/* Footer law */}
      <div className="ss-card flex items-start justify-between gap-3" style={{ background: 'var(--ss-accent-wash)' }}>
        <p className="text-[12.5px] leading-relaxed" style={{ color: 'var(--ss-muted)' }}>{t.footer}</p>
        <Heart className="h-4 w-4 shrink-0 mt-0.5" style={{ color: 'var(--ss-accent)' }} />
      </div>
    </div>
  );
};

export default AlignmentDetail;
