/**
 * NumerologyFigure — a number drawn as its own geometry.
 *
 * A number's figure is not decoration: n becomes an n-sided polygon, and the
 * star chords are the ones that number actually makes ({n/k} star polygons).
 * 3 is a triangle, 7 a heptagram, 9 an enneagram. Master numbers (11, 22, 33)
 * draw the figure of their reduced root with a second ring, since that is what
 * a master number is.
 *
 * Pure geometry from a stored value — no data fetched, nothing invented.
 */

import React from 'react';

/** The step that produces a number's characteristic star polygon. */
function chordStep(n: number): number | null {
  if (n < 5) return null;          // triangle and square have no star form
  if (n === 5) return 2;           // pentagram   {5/2}
  if (n === 6) return null;        // hexagon: the ring itself reads
  if (n === 7) return 2;           // heptagram   {7/2}
  if (n === 8) return 3;           // octagram    {8/3}
  if (n === 9) return 4;           // enneagram   {9/4}
  return 2;
}

export interface NumerologyFigureProps {
  value: number | string;
  size?: number;
  className?: string;
  /** Muted rendering for small inline use. */
  subtle?: boolean;
}

export const NumerologyFigure: React.FC<NumerologyFigureProps> = ({
  value, size = 34, className, subtle = false,
}) => {
  const raw = Number(value);
  if (!Number.isFinite(raw) || raw <= 0) return null;

  const isMaster = raw === 11 || raw === 22 || raw === 33;
  // A master number draws its root's figure — 11→2, 22→4, 33→6 — plus a ring.
  const n = isMaster ? raw / 11 * 2 : Math.max(3, Math.min(12, Math.round(raw)));
  const sides = isMaster ? Math.max(3, n) : n;

  const CX = 50, CY = 50, R = 34;
  const pts: Array<[number, number]> = [];
  for (let i = 0; i < sides; i++) {
    const a = ((-90 + (i * 360) / sides) * Math.PI) / 180;
    pts.push([CX + R * Math.cos(a), CY + R * Math.sin(a)]);
  }
  const outline = pts.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(' ');

  const step = chordStep(sides);
  const chords: Array<[number, number]> = [];
  if (step) {
    const seen = new Set<string>();
    for (let i = 0; i < sides; i++) {
      const j = (i + step) % sides;
      const key = [Math.min(i, j), Math.max(i, j)].join('-');
      if (seen.has(key)) continue;
      seen.add(key);
      chords.push([i, j]);
    }
  }

  const stroke = 'var(--ss-accent)';
  const op = subtle ? 0.55 : 1;

  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role="img"
      aria-label={`Getal ${value}`}
      style={{ display: 'block', opacity: op }}
    >
      <polygon points={outline} fill={stroke} fillOpacity={0.07} stroke={stroke} strokeOpacity={0.5} strokeWidth={1.4} />
      {isMaster && (
        <polygon
          points={pts.map((p) => {
            const dx = p[0] - CX, dy = p[1] - CY;
            return `${(CX + dx * 0.62).toFixed(1)},${(CY + dy * 0.62).toFixed(1)}`;
          }).join(' ')}
          fill="none" stroke={stroke} strokeOpacity={0.4} strokeWidth={1}
        />
      )}
      {chords.map(([a, b], i) => (
        <line key={i}
          x1={pts[a][0].toFixed(1)} y1={pts[a][1].toFixed(1)}
          x2={pts[b][0].toFixed(1)} y2={pts[b][1].toFixed(1)}
          stroke={stroke} strokeOpacity={0.42} strokeWidth={1}
        />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={p[0].toFixed(1)} cy={p[1].toFixed(1)} r={2.4} fill={stroke} />
      ))}
    </svg>
  );
};

export default NumerologyFigure;
