/**
 * LifeWheel — the honest life-wheel (Constitution v3.7). The system reads
 * where you are across the five domains from real evidence (the all-seeing
 * read) and draws the wheel itself; you can still adjust it, and your own
 * read overrides the system's. INTERPRETED, NEVER FABRICATED: no evidence,
 * no shape — when the journey is still too thin to read, it says it is still
 * learning rather than drawing a fabricated wheel.
 */

import React, { useState } from 'react';
import { Compass, Sparkles, RefreshCw, ChevronDown } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLifeBalance } from '@/hooks/use-life-balance';
import { useTwinName } from '@/hooks/use-twin-name';
import {
  lifeBalanceService, WHEEL_ORDER, DOMAIN_LABELS, type LifeBalance,
} from '@/services/life-balance-service';

const CX = 150, CY = 138, R = 96;
const pt = (i: number, f: number): [number, number] => {
  const a = ((-90 + i * 72) * Math.PI) / 180;
  return [CX + R * f * Math.cos(a), CY + R * f * Math.sin(a)];
};
const poly = (f: number) => WHEEL_ORDER.map((_, i) => pt(i, f).map((n) => n.toFixed(1)).join(',')).join(' ');

const COPY = {
  en: {
    title: 'Life domains', lede: 'Balance across what matters most.',
    reading: 'Reading your journey…',
    thin: 'Your journey is still early — a few more conversations and I can read where your domains stand. You can also set it yourself.',
    setSelf: 'Set it myself', checkIn: 'Check in', adjust: 'Adjust', save: 'Save', cancel: 'Cancel',
    scale: '0 = depleted · 100 = thriving',
    fromSystem: (name: string) => `${name}'s read of your journey`,
    fromUser: 'Your own read',
    why: 'Why I see it this way', reread: 'Re-read',
  },
  nl: {
    title: 'Levensdomeinen', lede: 'Balans over wat het belangrijkst is.',
    reading: 'Je reis lezen…',
    thin: 'Je reis is nog pril — een paar gesprekken meer en ik kan lezen hoe je domeinen ervoor staan. Je kunt het ook zelf instellen.',
    setSelf: 'Zelf instellen', checkIn: 'Inchecken', adjust: 'Aanpassen', save: 'Opslaan', cancel: 'Annuleren',
    scale: '0 = uitgeput · 100 = bloeiend',
    fromSystem: (name: string) => `${name}'s beeld van je reis`,
    fromUser: 'Jouw eigen beeld',
    why: 'Waarom ik dit zo zie', reread: 'Opnieuw lezen',
  },
};

export const LifeWheel: React.FC = () => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];
  const labels = DOMAIN_LABELS[lang];
  const { balance, source, rationale, analyzing, loading, refresh } = useLifeBalance();
  const { twinName } = useTwinName();
  const twin = twinName?.name || (lang === 'nl' ? 'je Twin' : 'your Twin');
  const hasData = !!balance && Object.keys(balance).length > 0;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LifeBalance>({});
  const [saving, setSaving] = useState(false);
  const [showWhy, setShowWhy] = useState(false);

  const startEdit = () => {
    const seed: LifeBalance = {};
    WHEEL_ORDER.forEach((d) => { seed[d] = balance?.[d] ?? 50; });
    setDraft(seed);
    setEditing(true);
  };
  const save = async () => {
    setSaving(true);
    await lifeBalanceService.setLifeBalance(draft);
    setSaving(false);
    setEditing(false);
  };

  if (editing) {
    return (
      <div className="ss-card">
        <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {t.title}</span>
        <p className="text-[11px] mt-1" style={{ color: 'var(--ss-faint)' }}>{t.scale}</p>
        <div className="flex flex-col gap-3 mt-3">
          {WHEEL_ORDER.map((d) => (
            <div key={d}>
              <div className="flex justify-between text-xs mb-1">
                <span style={{ color: 'var(--ss-ink)' }}>{labels[d]}</span>
                <span className="tabular-nums font-semibold" style={{ color: 'var(--ss-accent-ink)' }}>{draft[d] ?? 50}</span>
              </div>
              <input
                type="range" min={0} max={100} step={5} value={draft[d] ?? 50}
                onChange={(e) => setDraft((p) => ({ ...p, [d]: Number(e.target.value) }))}
                className="w-full"
                style={{ accentColor: 'var(--ss-accent)' }}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-2 mt-4">
          <button onClick={save} disabled={saving}
            className="text-[13px] font-semibold rounded-full px-4 py-2"
            style={{ background: 'var(--ss-accent)', color: '#fff' }}>{t.save}</button>
          <button onClick={() => setEditing(false)} disabled={saving}
            className="text-[13px] font-semibold rounded-full px-4 py-2"
            style={{ color: 'var(--ss-muted)' }}>{t.cancel}</button>
        </div>
      </div>
    );
  }

  // No shape yet: reading (the system is analysing), or still too thin to read.
  if (!hasData) {
    return (
      <div className="ss-card">
        <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {t.title}</span>
        {analyzing || loading ? (
          <div className="flex items-center gap-2.5 mt-3">
            <span className="ss-orb" style={{ width: 24, height: 24 }} />
            <span className="text-sm" style={{ color: 'var(--ss-muted)' }}>{t.reading}</span>
          </div>
        ) : (
          <>
            <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--ss-muted)' }}>{t.thin}</p>
            <button onClick={startEdit}
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2"
              style={{ background: 'var(--ss-accent)', color: '#fff' }}>{t.setSelf}</button>
          </>
        )}
      </div>
    );
  }

  const whyRows = source === 'system'
    ? WHEEL_ORDER.filter((d) => rationale[d]).map((d) => ({ d, label: labels[d], why: rationale[d]! }))
    : [];

  return (
    <div className="ss-card">
      <div className="flex items-center justify-between">
        <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {t.title}</span>
        <button onClick={startEdit} className="text-[12px] font-semibold" style={{ color: 'var(--ss-accent-ink)' }}>{t.adjust}</button>
      </div>
      <p className="text-sm mt-1" style={{ color: 'var(--ss-muted)' }}>{t.lede}</p>

      <svg viewBox="0 0 300 252" className="w-full" style={{ height: 'auto' }}>
        <g stroke="var(--ss-line)" strokeWidth={1} fill="none">
          {[0.33, 0.66, 1].map((f) => <polygon key={f} points={poly(f)} />)}
          {WHEEL_ORDER.map((_, i) => {
            const [x, y] = pt(i, 1);
            return <line key={i} x1={CX} y1={CY} x2={x} y2={y} />;
          })}
        </g>
        <polygon
          points={WHEEL_ORDER.map((d, i) => pt(i, (balance![d] ?? 0) / 100).map((n) => n.toFixed(1)).join(',')).join(' ')}
          fill="var(--ss-accent-wash-2)" stroke="var(--ss-accent)" strokeWidth={1.8}
        />
        {WHEEL_ORDER.map((d, i) => {
          const [x, y] = pt(i, (balance![d] ?? 0) / 100);
          return <circle key={d} cx={x} cy={y} r={3.2} fill="var(--ss-accent)" />;
        })}
        {WHEEL_ORDER.map((d, i) => {
          const [x, y] = pt(i, 1.22);
          const anchor = x < CX - 12 ? 'end' : x > CX + 12 ? 'start' : 'middle';
          return (
            <g key={`l-${d}`}>
              <text x={x} y={y} textAnchor={anchor} fontSize={12} fontWeight={600} fill="var(--ss-ink)">{labels[d]}</text>
              <text x={x} y={y + 13} textAnchor={anchor} fontSize={10.5} fill="var(--ss-muted)">{balance![d] ?? 0}</text>
            </g>
          );
        })}
      </svg>

      {/* Whose read this is — the Twin's read of your journey, or your own. */}
      <div className="flex items-center justify-between mt-1">
        <span className="inline-flex items-center gap-1.5 text-[11.5px]" style={{ color: 'var(--ss-faint)' }}>
          <Sparkles className="h-3 w-3" />
          {source === 'user' ? t.fromUser : t.fromSystem(twin)}
        </span>
        {source === 'system' && (
          <button onClick={refresh} disabled={analyzing}
            className="inline-flex items-center gap-1 text-[11.5px] font-medium" style={{ color: 'var(--ss-accent-ink)' }}>
            <RefreshCw className={`h-3 w-3 ${analyzing ? 'animate-spin' : ''}`} /> {t.reread}
          </button>
        )}
      </div>

      {/* Transparent read: why each domain sits where it does. */}
      {whyRows.length > 0 && (
        <div className="mt-3">
          <button onClick={() => setShowWhy((v) => !v)}
            className="inline-flex items-center gap-1 text-[12.5px] font-semibold" style={{ color: 'var(--ss-accent-ink)' }}>
            {t.why} <ChevronDown className={`h-3.5 w-3.5 transition-transform ${showWhy ? 'rotate-180' : ''}`} />
          </button>
          {showWhy && (
            <div className="mt-2.5 flex flex-col gap-2">
              {whyRows.map(({ d, label, why }) => (
                <div key={d} className="flex items-baseline gap-2">
                  <span className="text-[12px] font-semibold shrink-0" style={{ color: 'var(--ss-ink)', minWidth: 84 }}>{label}</span>
                  <span className="text-[12.5px] leading-snug" style={{ color: 'var(--ss-muted)' }}>{why}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LifeWheel;
