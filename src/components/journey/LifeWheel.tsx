/**
 * LifeWheel — the honest life-wheel (Constitution v3.4). Draws a radar from
 * the user's OWN domain ratings (never fabricated). When there are no
 * ratings yet, it invites a short check-in; the radar appears once the user
 * has spoken. "Adjust" reopens the check-in — a relationship with your own
 * balance, not a score handed to you.
 */

import React, { useState } from 'react';
import { Compass } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useLifeBalance } from '@/hooks/use-life-balance';
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
    title: 'Life balance', lede: 'How balanced does each part of your life feel?',
    empty: 'A quick check-in draws your life wheel — your own read, not a score we assign.',
    checkIn: 'Check in', adjust: 'Adjust', save: 'Save', cancel: 'Cancel',
    scale: '0 = depleted · 100 = thriving',
  },
  nl: {
    title: 'Levensbalans', lede: 'Hoe in balans voelt elk deel van je leven?',
    empty: 'Een korte check-in tekent je levenswiel — jouw eigen beeld, geen cijfer dat wij toekennen.',
    checkIn: 'Inchecken', adjust: 'Aanpassen', save: 'Opslaan', cancel: 'Annuleren',
    scale: '0 = uitgeput · 100 = bloeiend',
  },
};

export const LifeWheel: React.FC = () => {
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];
  const labels = DOMAIN_LABELS[lang];
  const { balance } = useLifeBalance();
  const hasData = !!balance && Object.keys(balance).length > 0;

  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<LifeBalance>({});
  const [saving, setSaving] = useState(false);

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

  if (!hasData) {
    return (
      <div className="ss-card">
        <span className="ss-eyebrow"><Compass className="h-3.5 w-3.5" /> {t.title}</span>
        <p className="text-sm mt-2 leading-relaxed" style={{ color: 'var(--ss-muted)' }}>{t.empty}</p>
        <button onClick={startEdit}
          className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold rounded-full px-4 py-2"
          style={{ background: 'var(--ss-accent)', color: '#fff' }}>{t.checkIn}</button>
      </div>
    );
  }

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
    </div>
  );
};

export default LifeWheel;
