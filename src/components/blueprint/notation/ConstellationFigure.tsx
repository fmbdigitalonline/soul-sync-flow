/**
 * ConstellationFigure — the sign's real star pattern.
 *
 * Stylised but true to shape: the Teapot for Sagittarius, the Sickle for Leo,
 * the V of the Hyades for Taurus, the long curved tail for Scorpio. The first
 * star of each set is the constellation's brightest and is drawn with a halo.
 *
 * Used for sun, moon and rising, so one page can carry three different skies.
 * Returns null for an unrecognised sign — a sky is never invented.
 */

import React from 'react';

type Pattern = { s: Array<[number, number]>; e: Array<[number, number]> };

/** Keyed by lowercase English sign; Dutch names are mapped in ALIASES. */
const PATTERNS: Record<string, Pattern> = {
  aries:       { s: [[16,44],[36,30],[58,22],[78,26]], e: [[0,1],[1,2],[2,3]] },
  taurus:      { s: [[14,20],[34,34],[52,42],[70,30],[86,16],[50,24]], e: [[0,1],[1,2],[2,3],[3,4],[1,5],[5,3]] },
  gemini:      { s: [[26,14],[26,34],[26,54],[64,14],[64,34],[64,54],[45,26]], e: [[0,1],[1,2],[3,4],[4,5],[0,3],[1,6],[6,4]] },
  cancer:      { s: [[28,16],[48,32],[70,18],[48,54]], e: [[0,1],[1,2],[1,3]] },
  leo:         { s: [[20,50],[26,32],[40,20],[56,22],[62,38],[80,48],[64,56]], e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,0]] },
  virgo:       { s: [[16,22],[34,30],[52,24],[58,42],[76,50],[42,48]], e: [[0,1],[1,2],[2,3],[3,4],[1,5],[5,3]] },
  libra:       { s: [[30,20],[62,18],[22,42],[52,46],[74,38]], e: [[0,1],[0,2],[1,4],[2,3],[3,4]] },
  scorpio:     { s: [[14,18],[26,28],[40,32],[54,36],[66,46],[74,56],[64,62],[52,58]], e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,6],[6,7]] },
  sagittarius: { s: [[22,44],[36,24],[52,22],[64,36],[52,50],[34,48],[78,28],[70,48]], e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0],[2,6],[6,7],[7,3]] },
  capricorn:   { s: [[16,20],[38,28],[60,22],[76,36],[52,52],[28,42]], e: [[0,1],[1,2],[2,3],[3,4],[4,5],[5,0]] },
  aquarius:    { s: [[16,26],[32,18],[46,30],[60,20],[74,32],[52,48],[36,54]], e: [[0,1],[1,2],[2,3],[3,4],[2,5],[5,6]] },
  pisces:      { s: [[16,18],[30,28],[46,36],[62,32],[78,20],[70,48],[54,52]], e: [[0,1],[1,2],[2,3],[3,4],[2,6],[6,5]] },
};

const ALIASES: Record<string, string> = {
  ram: 'aries', stier: 'taurus', tweelingen: 'gemini', kreeft: 'cancer',
  leeuw: 'leo', maagd: 'virgo', weegschaal: 'libra', schorpioen: 'scorpio',
  boogschutter: 'sagittarius', steenbok: 'capricorn', waterman: 'aquarius', vissen: 'pisces',
};

/** Element per sign — drives the atmosphere tint. */
const ELEMENT: Record<string, 'fire' | 'earth' | 'air' | 'water'> = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

/**
 * Element atmospheres read from theme tokens (--ss-el-*), so the dark theme
 * pulls them back rather than inheriting values tuned for a white ground.
 * The first pass was too faint to tell apart in daylight; the tokens carry
 * the stronger values.
 */
export const ELEMENT_TINT: Record<string, { star: string; tint: string; glow: string; ink: string }> = {
  fire:  { star: 'var(--ss-el-fire)',  tint: 'var(--ss-el-fire-tint)',  glow: 'var(--ss-el-fire-glow)',  ink: 'var(--ss-el-fire)' },
  earth: { star: 'var(--ss-el-earth)', tint: 'var(--ss-el-earth-tint)', glow: 'var(--ss-el-earth-glow)', ink: 'var(--ss-el-earth)' },
  air:   { star: 'var(--ss-el-air)',   tint: 'var(--ss-el-air-tint)',   glow: 'var(--ss-el-air-glow)',   ink: 'var(--ss-el-air)' },
  water: { star: 'var(--ss-el-water)', tint: 'var(--ss-el-water-tint)', glow: 'var(--ss-el-water-glow)', ink: 'var(--ss-el-water)' },
};

export function normaliseSign(sign?: string | null): string | null {
  if (!sign || typeof sign !== 'string') return null;
  // "Aquarius 24.0° Sun" → "aquarius"
  const first = sign.trim().toLowerCase().split(/[\s,·]/)[0];
  if (PATTERNS[first]) return first;
  if (ALIASES[first]) return ALIASES[first];
  return null;
}

export function signElement(sign?: string | null): 'fire' | 'earth' | 'air' | 'water' | null {
  const k = normaliseSign(sign);
  return k ? ELEMENT[k] : null;
}

export const ConstellationFigure: React.FC<{
  sign?: string | null;
  size?: number;
  className?: string;
  /** Use the element's colour rather than the system accent. */
  elemental?: boolean;
}> = ({ sign, size = 34, className, elemental = false }) => {
  const key = normaliseSign(sign);
  if (!key) return null;                    // never draw an invented sky
  const p = PATTERNS[key];
  const colour = elemental ? ELEMENT_TINT[ELEMENT[key]].star : 'var(--ss-accent)';

  return (
    <svg viewBox="0 0 100 72" width={size} height={size * 0.72} className={className}
      role="img" aria-label={`Sterrenbeeld ${sign}`} style={{ display: 'block' }}>
      {p.e.map(([a, b], i) => (
        <line key={i} x1={p.s[a][0]} y1={p.s[a][1]} x2={p.s[b][0]} y2={p.s[b][1]}
          stroke={colour} strokeOpacity={0.38} strokeWidth={1} />
      ))}
      {p.s.map(([x, y], i) => (
        <React.Fragment key={i}>
          {i === 0 && <circle cx={x} cy={y} r={5.4} fill={colour} opacity={0.16} />}
          <circle cx={x} cy={y} r={i === 0 ? 2.9 : 2} fill={colour} />
        </React.Fragment>
      ))}
    </svg>
  );
};

export default ConstellationFigure;
