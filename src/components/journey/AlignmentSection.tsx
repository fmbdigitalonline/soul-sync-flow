/**
 * AlignmentSection — the Alignment narrative in My Journey (Constitution
 * v3.6). Interpreted, never scored: a story + a directional trend + the
 * patterns behind it + a one-tap weekly self-report. No percentage.
 */

import React, { useState } from 'react';
import { Sparkles, Heart, Users, Waves, ArrowUp, ArrowDown, Minus, ChevronRight, Info } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAlignment } from '@/hooks/use-alignment';
import { alignmentService, type AlignmentValue } from '@/services/alignment-service';

const COPY = {
  en: {
    title: 'Your Alignment', learnMore: 'Learn more',
    trend: 'Alignment Trend', trendLede: 'Based on your reflections, choices and experiences.',
    less: 'Less aligned', neutral: 'Neutral', more: 'More aligned',
    contributing: "What's contributing", contributingLede: "Key patterns I've noticed in your journey.",
    weekly: 'Weekly Reflection', weeklyQ: 'Looking back, how aligned did this week feel with who you want to be?',
    moreAligned: 'More aligned', same: 'About the same', lessAligned: 'Less aligned',
    thanks: 'Thank you — that becomes part of how I understand you.',
    footer: "Alignment isn't a score. It's a reflection of how closely your daily choices match the person you're becoming.",
  },
  nl: {
    title: 'Jouw Afstemming', learnMore: 'Meer weten',
    trend: 'Afstemmingstrend', trendLede: 'Op basis van je reflecties, keuzes en ervaringen.',
    less: 'Minder afgestemd', neutral: 'Neutraal', more: 'Meer afgestemd',
    contributing: 'Wat bijdraagt', contributingLede: 'Patronen die ik in je reis heb opgemerkt.',
    weekly: 'Wekelijkse reflectie', weeklyQ: 'Terugkijkend, hoe afgestemd voelde deze week met wie je wilt zijn?',
    moreAligned: 'Meer afgestemd', same: 'Ongeveer hetzelfde', lessAligned: 'Minder afgestemd',
    thanks: 'Dank je — dat wordt deel van hoe ik je begrijp.',
    footer: 'Afstemming is geen cijfer. Het weerspiegelt hoe dicht je dagelijkse keuzes bij wie je wordt liggen.',
  },
};

const PATTERN_ICONS = [Heart, Sparkles, Users, Waves];

function fmtDate(iso?: string, lang?: string) {
  if (!iso) return '';
  return new Date(iso).toLocaleDateString(lang === 'nl' ? 'nl-NL' : 'en-US', { month: 'short', day: 'numeric' });
}

export const AlignmentSection: React.FC<{ patterns?: Array<{ text: string }>; onLearnMore?: () => void }> = ({
  patterns = [], onLearnMore,
}) => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];
  const { trend, windowDays } = useAlignment(90);
  const [justRecorded, setJustRecorded] = useState(false);

  const narrative = alignmentService.narrative(trend, windowDays, lang);
  const record = async (v: AlignmentValue) => {
    await alignmentService.recordReflection(v);
    setJustRecorded(true);
  };

  // Line + area path from the normalised points (no axis numbers).
  const W = 300, H = 116, PAD = 8;
  const sx = (x: number) => PAD + x * (W - 2 * PAD);
  const sy = (y: number) => (H - PAD) - y * (H - 2 * PAD);
  const pts = trend.points;
  const linePath = pts.length ? pts.map((p, i) => `${i ? 'L' : 'M'}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(' ') : '';
  const areaPath = pts.length ? `${linePath} L${sx(pts[pts.length - 1].x).toFixed(1)},${H - PAD} L${sx(pts[0].x).toFixed(1)},${H - PAD} Z` : '';

  return (
    <div className="ss flex flex-col gap-4">
      {/* Your Alignment — the narrative */}
      <div className="ss-twin">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {t.title}</span>
            <p className="text-[14px] leading-relaxed mt-2" style={{ color: 'var(--ss-ink)' }}>{narrative}</p>
            {onLearnMore && (
              <button onClick={onLearnMore} className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold" style={{ color: 'var(--ss-accent-ink)' }}>
                {t.learnMore} <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
          <div className="ss-orb shrink-0" style={{ width: 56, height: 56 }} />
        </div>
      </div>

      {/* Alignment Trend — direction, no score */}
      {trend.hasData && (
        <div className="ss-card">
          <div className="flex items-center justify-between">
            <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--ss-ink)' }}>{t.trend}</span>
            <Info className="h-4 w-4" style={{ color: 'var(--ss-faint)' }} />
          </div>
          <p className="text-[12.5px] mt-0.5" style={{ color: 'var(--ss-muted)' }}>{t.trendLede}</p>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full mt-3" style={{ height: 'auto' }}>
            <defs>
              <linearGradient id="alignFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="var(--ss-accent)" stopOpacity="0.28" />
                <stop offset="1" stopColor="var(--ss-accent)" stopOpacity="0" />
              </linearGradient>
            </defs>
            {areaPath && <path d={areaPath} fill="url(#alignFill)" />}
            {linePath && <path d={linePath} fill="none" stroke="var(--ss-accent)" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />}
            {pts.map((p, i) => (i % Math.max(1, Math.round(pts.length / 6)) === 0 || i === pts.length - 1) && (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={i === pts.length - 1 ? 4 : 2.6} fill="var(--ss-accent)" />
            ))}
          </svg>
          <div className="flex justify-between text-[10.5px] mt-1" style={{ color: 'var(--ss-faint)' }}>
            <span>{t.less}</span><span>{t.neutral}</span><span>{t.more}</span>
          </div>
          <div className="flex justify-between text-[10.5px] mt-1" style={{ color: 'var(--ss-faint)' }}>
            <span>{fmtDate(trend.from, lang)}</span><span>{fmtDate(trend.to, lang)}</span>
          </div>
        </div>
      )}

      {/* What's contributing — real patterns from the ledger */}
      {patterns.length > 0 && (
        <div className="ss-card">
          <span className="text-[15px] font-bold tracking-tight" style={{ color: 'var(--ss-ink)' }}>{t.contributing}</span>
          <p className="text-[12.5px] mt-0.5 mb-3" style={{ color: 'var(--ss-muted)' }}>{t.contributingLede}</p>
          <div className="flex flex-col gap-2.5">
            {patterns.slice(0, 4).map((p, i) => {
              const Icon = PATTERN_ICONS[i % PATTERN_ICONS.length];
              return (
                <div key={i} className="flex items-start gap-3">
                  <span className="shrink-0 grid place-items-center" style={{ width: 34, height: 34, borderRadius: 11, background: 'var(--ss-accent-wash)', color: 'var(--ss-accent)' }}>
                    <Icon className="h-[16px] w-[16px]" />
                  </span>
                  <p className="text-[13px] leading-relaxed flex-1" style={{ color: 'var(--ss-ink)' }}>{p.text}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly Reflection — the user's own self-report */}
      <div className="ss-card">
        <span className="ss-eyebrow"><Sparkles className="h-3.5 w-3.5" /> {t.weekly}</span>
        {justRecorded ? (
          <p className="text-[13.5px] leading-relaxed mt-2" style={{ color: 'var(--ss-muted)' }}>{t.thanks}</p>
        ) : (
          <>
            <p className="text-[13.5px] leading-relaxed mt-2 mb-3" style={{ color: 'var(--ss-ink)' }}>{t.weeklyQ}</p>
            <div className="grid grid-cols-3 gap-2">
              <ReflectBtn label={t.moreAligned} icon={<ArrowUp className="h-4 w-4" />} tone="up" onClick={() => record('more')} />
              <ReflectBtn label={t.same} icon={<Minus className="h-4 w-4" />} tone="neutral" onClick={() => record('same')} />
              <ReflectBtn label={t.lessAligned} icon={<ArrowDown className="h-4 w-4" />} tone="down" onClick={() => record('less')} />
            </div>
          </>
        )}
      </div>

      {/* The design law, gently stated */}
      <p className="text-[12px] leading-relaxed px-1" style={{ color: 'var(--ss-faint)' }}>{t.footer}</p>
    </div>
  );
};

const ReflectBtn: React.FC<{ label: string; icon: React.ReactNode; tone: 'up' | 'neutral' | 'down'; onClick: () => void }> = ({ label, icon, tone, onClick }) => {
  const color = tone === 'up' ? 'var(--ss-green)' : tone === 'down' ? 'var(--ss-danger)' : 'var(--ss-muted)';
  const bg = tone === 'up' ? 'rgba(52,201,138,.10)' : tone === 'down' ? 'rgba(224,103,103,.10)' : 'var(--ss-line-2)';
  return (
    <button onClick={onClick} className="flex flex-col items-center gap-1.5 rounded-xl py-3 px-1 border" style={{ borderColor: 'var(--ss-line)' }}>
      <span className="grid place-items-center rounded-full" style={{ width: 30, height: 30, background: bg, color }}>{icon}</span>
      <span className="text-[11px] font-medium text-center leading-tight" style={{ color: 'var(--ss-ink)' }}>{label}</span>
    </button>
  );
};

export default AlignmentSection;
