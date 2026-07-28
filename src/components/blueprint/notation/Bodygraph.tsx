/**
 * Bodygraph — the nine Human Design centres, in their real positions.
 *
 * The centres a type defines are filled; the rest are open outlines. This is
 * the chart Human Design already draws, rendered calmly: a Projector and a
 * Generator read as different at a glance, which is the point.
 *
 * Deliberately simplified — the centres and their defining relationships, not
 * the 64 gates and 36 channels. Claiming gate-level accuracy from a stored
 * type string would be fabrication.
 */

import React from 'react';

type Shape = 'tri' | 'itri' | 'sq' | 'dia';
interface Centre { t: Shape; x: number; y: number; s: number }

const CENTRES: Record<string, Centre> = {
  head:   { t: 'tri',  x: 50, y: 10, s: 9 },
  ajna:   { t: 'itri', x: 50, y: 26, s: 9 },
  throat: { t: 'sq',   x: 50, y: 41, s: 9 },
  g:      { t: 'dia',  x: 50, y: 56, s: 9 },
  heart:  { t: 'tri',  x: 73, y: 54, s: 6.5 },
  spleen: { t: 'tri',  x: 23, y: 65, s: 7.5 },
  solar:  { t: 'tri',  x: 77, y: 65, s: 7.5 },
  sacral: { t: 'sq',   x: 50, y: 72, s: 9 },
  root:   { t: 'sq',   x: 50, y: 89, s: 9 },
};

const WIRES: Array<[string, string]> = [
  ['head', 'ajna'], ['ajna', 'throat'], ['throat', 'g'], ['g', 'sacral'],
  ['sacral', 'root'], ['throat', 'heart'], ['g', 'spleen'], ['g', 'solar'],
];

/** The centres each type characteristically defines. */
const DEFINED: Record<string, string[]> = {
  projector: ['ajna', 'throat', 'spleen'],
  generator: ['sacral', 'root', 'g'],
  'manifesting generator': ['sacral', 'throat', 'root', 'g'],
  manifestor: ['throat', 'heart', 'root'],
  reflector: [],
};

const ALIASES: Record<string, string> = {
  'manifesterende generator': 'manifesting generator',
  'mani-gen': 'manifesting generator',
  manigen: 'manifesting generator',
  reflectant: 'reflector',
};

export function normaliseHdType(type?: string | null): string | null {
  if (!type || typeof type !== 'string') return null;
  const k = type.trim().toLowerCase();
  if (DEFINED[k]) return k;
  if (ALIASES[k] && DEFINED[ALIASES[k]]) return ALIASES[k];
  // "Generator (Sacral)" → "generator"
  const head = k.split(/[\s(·,]/)[0];
  if (DEFINED[head]) return head;
  return null;
}

function shapePath(c: Centre, on: boolean) {
  const { x, y, s, t } = c;
  const fill = on ? 'var(--ss-accent)' : 'none';
  const fillOpacity = on ? 0.8 : 0;
  const stroke = on ? 'var(--ss-accent)' : 'var(--ss-line)';
  const common = { fill, fillOpacity, stroke, strokeWidth: 1.3 };
  if (t === 'sq') return <rect x={x - s} y={y - s} width={s * 2} height={s * 2} rx={1.5} {...common} />;
  if (t === 'dia') return <polygon points={`${x},${y - s} ${x + s},${y} ${x},${y + s} ${x - s},${y}`} {...common} />;
  if (t === 'tri') return <polygon points={`${x},${y - s} ${x + s},${y + s * 0.85} ${x - s},${y + s * 0.85}`} {...common} />;
  return <polygon points={`${x},${y + s} ${x + s},${y - s * 0.85} ${x - s},${y - s * 0.85}`} {...common} />;
}

export const Bodygraph: React.FC<{
  type?: string | null;
  size?: number;
  className?: string;
}> = ({ type, size = 34, className }) => {
  const key = normaliseHdType(type);
  if (!key) return null;
  const defined = DEFINED[key];

  return (
    <svg viewBox="0 0 100 100" width={size} height={size} className={className}
      role="img" aria-label={`Bodygraph ${type}`} style={{ display: 'block' }}>
      {WIRES.map(([a, b], i) => {
        const p = CENTRES[a], q = CENTRES[b];
        const on = defined.includes(a) && defined.includes(b);
        return (
          <line key={i} x1={p.x} y1={p.y} x2={q.x} y2={q.y}
            stroke={on ? 'var(--ss-accent)' : 'var(--ss-line)'}
            strokeOpacity={on ? 0.55 : 1} strokeWidth={1} />
        );
      })}
      {Object.entries(CENTRES).map(([k, c]) => (
        <React.Fragment key={k}>{shapePath(c, defined.includes(k))}</React.Fragment>
      ))}
    </svg>
  );
};

export default Bodygraph;
