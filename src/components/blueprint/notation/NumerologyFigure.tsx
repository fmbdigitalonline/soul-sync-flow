/**
 * NumerologyFigure — a number drawn as its own geometry.
 *
 * Every number in numerology's alphabet gets a figure no other number gets:
 *
 *   1   the monad          a single point held in a ring
 *   2   the duad           two points joined, inside a lens
 *   3   triangle           4  square            5  pentagram   {5/2}
 *   6   hexagon (plain)    7  heptagram {7/2}   8  octagram    {8/3}
 *   9   enneagram {9/4}
 *   11  the duad, doubled — a second concentric ring
 *   22  the square, doubled — a concentric square
 *   33  the hexagon, doubled — the hexagram {6/2} inside it
 *
 * The star chords are the ones each number actually makes: every {n/k} is
 * chosen so gcd(n, k) = 1, which is what makes the figure a single closed
 * path rather than overlapping polygons.
 *
 * Master numbers draw their root's figure with a doubling mark, because that
 * is what a master number is — never the root's figure alone, which would make
 * 11 indistinguishable from 2.
 *
 * Pure geometry from a stored value: nothing fetched, nothing invented.
 */

import React from 'react';

const CX = 50, CY = 50, R = 34;

/** The step that produces a number's characteristic star polygon, or null. */
function chordStep(n: number): number | null {
  switch (n) {
    case 5: return 2;   // pentagram
    case 7: return 2;   // heptagram
    case 8: return 3;   // octagram
    case 9: return 4;   // enneagram
    default: return null;
  }
}

/** Reduce a compound number the way numerology does, keeping masters intact. */
function reduce(n: number): number {
  if (n === 11 || n === 22 || n === 33) return n;
  let v = Math.abs(Math.round(n));
  while (v > 9) {
    const next = String(v).split('').reduce((a, d) => a + Number(d), 0);
    if (next === 11 || next === 22 || next === 33) return next;
    v = next;
  }
  return v;
}

function ring(i: number, count: number, radius = R): [number, number] {
  const a = ((-90 + (i * 360) / count) * Math.PI) / 180;
  return [CX + radius * Math.cos(a), CY + radius * Math.sin(a)];
}

export interface NumerologyFigureProps {
  value: number | string;
  size?: number;
  className?: string;
}

export const NumerologyFigure: React.FC<NumerologyFigureProps> = ({ value, size = 34, className }) => {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return null;

  const n = reduce(raw);
  const A = 'var(--ss-accent)';
  const svg = (children: React.ReactNode) => (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}
      role="img" aria-label={`Getal ${n}`} style={{ display: 'block' }}>
      {children}
    </svg>
  );

  // ── 1 · the monad ──
  if (n === 1) {
    return svg(<>
      <circle cx={CX} cy={CY} r={R} fill={A} fillOpacity={0.07} stroke={A} strokeOpacity={0.5} strokeWidth={1.4} />
      <circle cx={CX} cy={CY} r={6} fill={A} />
    </>);
  }

  // ── 2 and 11 · the duad, and the duad doubled ──
  if (n === 2 || n === 11) {
    const [p, q] = [ring(0, 2), ring(1, 2)];
    return svg(<>
      <ellipse cx={CX} cy={CY} rx={20} ry={R} fill={A} fillOpacity={0.07} stroke={A} strokeOpacity={0.5} strokeWidth={1.4} />
      {n === 11 && <ellipse cx={CX} cy={CY} rx={12.5} ry={21} fill="none" stroke={A} strokeOpacity={0.45} strokeWidth={1} />}
      <line x1={p[0]} y1={p[1]} x2={q[0]} y2={q[1]} stroke={A} strokeOpacity={0.5} strokeWidth={1.2} />
      <circle cx={p[0]} cy={p[1]} r={3} fill={A} />
      <circle cx={q[0]} cy={q[1]} r={3} fill={A} />
    </>);
  }

  // ── 3–9, plus 22 (square doubled) and 33 (hexagon doubled) ──
  const sides = n === 22 ? 4 : n === 33 ? 6 : n;
  const pts = Array.from({ length: sides }, (_, i) => ring(i, sides));
  const outline = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  // 33 draws the hexagram inside its hexagon; 22 a concentric square.
  const step = n === 33 ? 2 : chordStep(sides);
  const chords: Array<[[number, number], [number, number]]> = [];
  if (step) {
    const seen = new Set<string>();
    for (let i = 0; i < sides; i++) {
      const j = (i + step) % sides;
      const key = [Math.min(i, j), Math.max(i, j)].join('-');
      if (seen.has(key)) continue;
      seen.add(key);
      chords.push([pts[i], pts[j]]);
    }
  }

  return svg(<>
    <polygon points={outline} fill={A} fillOpacity={0.07} stroke={A} strokeOpacity={0.5} strokeWidth={1.4} />
    {n === 22 && (
      <polygon
        points={pts.map((p) => `${(CX + (p[0] - CX) * 0.55).toFixed(1)},${(CY + (p[1] - CY) * 0.55).toFixed(1)}`).join(' ')}
        fill="none" stroke={A} strokeOpacity={0.45} strokeWidth={1}
      />
    )}
    {chords.map(([p, q], i) => (
      <line key={i} x1={p[0].toFixed(1)} y1={p[1].toFixed(1)} x2={q[0].toFixed(1)} y2={q[1].toFixed(1)}
        stroke={A} strokeOpacity={0.42} strokeWidth={1} />
    ))}
    {pts.map((p, i) => (
      <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r={2.4} fill={A} />
    ))}
  </>);
};

export default NumerologyFigure;
