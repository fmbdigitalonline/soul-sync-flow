/**
 * ReportSectionFigure — a symbol for each section of the report.
 *
 * The blueprint's notation draws SYSTEMS (a bodygraph, a sky, a polygon). A
 * report section is not a system — it is a theme, so borrowing those figures
 * said the wrong thing: a bodygraph next to "how you decide" implies the
 * section is about Human Design rather than about deciding.
 *
 * These are diagrams of the IDEA, drawn in the same grammar as the rest of the
 * notation — thin strokes, nodes, one accent — so they belong to the same
 * world without pretending to be data:
 *
 *   core pattern    a nucleus: rings settling around a centre
 *   decisions       a junction: a path arriving and one way taken
 *   relationships   two fields overlapping, and what they share
 *   life path       an ascent with waypoints toward a distant point
 *   energy & timing a wave, with the phase it is currently in
 *   integration     a confluence: separate lines becoming one
 *
 * The Hermetic report's sections get the same treatment — a fractal, a network,
 * a framework grid, a heptagram for the seven laws, one grammar mapped onto
 * another, a signature. And a section we did not anticipate still draws a
 * figure: the key itself seeds a star polygon, deterministically. Nothing in a
 * report falls back to a stock icon, so the whole surface stays in one
 * geometric/constellation language.
 *
 * Unlike the blueprint figures these carry no user data, so they are honest by
 * construction — they illustrate the section, they never claim a fact.
 */

import React from 'react';

const A = 'var(--ss-accent)';

type Fig = { d: React.ReactNode; label: string };

function frame(children: React.ReactNode, size: number, label: string, animate: boolean) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} role="img" aria-label={label}
      style={{ display: 'block' }} data-animate={animate || undefined}>
      {children}
    </svg>
  );
}

/** Shared node style so every figure reads as one family. */
const dot = (cx: number, cy: number, r = 3, i = 0, animate = false) => (
  <circle key={`d${cx}-${cy}`} cx={cx} cy={cy} r={r} fill={A}
    className={animate ? 'ss-spark' : undefined}
    style={animate ? ({ ['--i' as any]: i } as React.CSSProperties) : undefined} />
);

const line = (x1: number, y1: number, x2: number, y2: number, i = 0, animate = false, op = 0.42) => (
  <line key={`l${x1}-${y1}-${x2}-${y2}`} x1={x1} y1={y1} x2={x2} y2={y2}
    stroke={A} strokeOpacity={op} strokeWidth={1.3} strokeLinecap="round"
    className={animate ? 'ss-draw' : undefined}
    style={animate ? ({ ['--len' as any]: Math.hypot(x2 - x1, y2 - y1).toFixed(1), ['--i' as any]: i } as React.CSSProperties) : undefined} />
);

/** The sections we draw by name. Any other key still gets a derived figure. */
export type ReportSectionKey =
  | 'core_personality_pattern'
  | 'decision_making_style'
  | 'relationship_style'
  | 'life_path_purpose'
  | 'current_energy_timing'
  | 'integrated_summary'
  | 'hermetic_fractal_analysis'
  | 'consciousness_integration_map'
  | 'practical_activation_framework'
  | 'seven_laws_integration'
  | 'system_translations'
  | 'blueprint_signature'
  | 'gate_analyses'
  | 'shadow_work'
  | 'intelligence_analysis';

export const ReportSectionFigure: React.FC<{
  section: string;
  size?: number;
  animate?: boolean;
}> = ({ section, size = 34, animate = false }) => {
  const an = animate;

  switch (section) {
    /* A nucleus — what everything else settles around. */
    case 'core_personality_pattern':
      return frame(<>
        <circle cx={50} cy={50} r={30} fill="none" stroke={A} strokeOpacity={0.22} strokeWidth={1.2} />
        <circle cx={50} cy={50} r={19} fill="none" stroke={A} strokeOpacity={0.34} strokeWidth={1.2} />
        <circle cx={50} cy={50} r={9} fill={A} fillOpacity={0.16} stroke={A} strokeOpacity={0.6} strokeWidth={1.3} />
        {dot(50, 50, 4, 0, an)}
        {dot(50, 20, 2.6, 1, an)}{dot(76, 62, 2.6, 2, an)}{dot(26, 64, 2.6, 3, an)}
      </>, size, 'Kernpatroon', an);

    /* A junction — a path arrives, and one way is taken. */
    case 'decision_making_style':
      return frame(<>
        {line(14, 50, 46, 50, 0, an, 0.5)}
        {line(46, 50, 84, 26, 1, an, 0.62)}
        {line(46, 50, 84, 74, 2, an, 0.2)}
        {dot(46, 50, 4.2, 0, an)}
        {dot(84, 26, 3.4, 1, an)}
        <circle cx={84} cy={74} r={3} fill="none" stroke={A} strokeOpacity={0.35} strokeWidth={1.2} />
        <circle cx={84} cy={26} r={7.5} fill={A} fillOpacity={0.14} />
      </>, size, 'Besluitvorming', an);

    /* Two fields overlapping — and the part they share. */
    case 'relationship_style':
      return frame(<>
        <circle cx={38} cy={50} r={24} fill={A} fillOpacity={0.08} stroke={A} strokeOpacity={0.42} strokeWidth={1.3} />
        <circle cx={62} cy={50} r={24} fill={A} fillOpacity={0.08} stroke={A} strokeOpacity={0.42} strokeWidth={1.3} />
        <path d="M50 28.5 A24 24 0 0 1 50 71.5 A24 24 0 0 1 50 28.5 Z" fill={A} fillOpacity={0.16} />
        {dot(38, 50, 3, 0, an)}{dot(62, 50, 3, 1, an)}
      </>, size, 'Relatiestijl', an);

    /* An ascent with waypoints toward a point still ahead. */
    case 'life_path_purpose':
      return frame(<>
        {line(16, 82, 38, 64, 0, an)}
        {line(38, 64, 56, 52, 1, an)}
        {line(56, 52, 74, 32, 2, an)}
        {dot(16, 82, 2.6, 0, an)}{dot(38, 64, 2.6, 1, an)}{dot(56, 52, 2.6, 2, an)}
        <circle cx={78} cy={26} r={9} fill={A} fillOpacity={0.14} />
        {dot(78, 26, 4.4, 3, an)}
      </>, size, 'Levenspad', an);

    /* A wave, and the phase it is in. */
    case 'current_energy_timing':
      return frame(<>
        <path d="M12 62 C26 30, 38 30, 50 50 S74 70, 88 38"
          fill="none" stroke={A} strokeOpacity={0.5} strokeWidth={1.6} strokeLinecap="round"
          className={an ? 'ss-draw' : undefined}
          style={an ? ({ ['--len' as any]: 130, ['--i' as any]: 0 } as React.CSSProperties) : undefined} />
        <line x1={50} y1={22} x2={50} y2={78} stroke={A} strokeOpacity={0.16} strokeWidth={1} strokeDasharray="3 4" />
        {dot(50, 50, 4.2, 1, an)}
        <circle cx={50} cy={50} r={9} fill={A} fillOpacity={0.13} />
      </>, size, 'Energie & timing', an);

    /* A confluence — separate lines becoming one. */
    case 'integrated_summary':
      return frame(<>
        {line(14, 24, 48, 50, 0, an)}
        {line(14, 50, 48, 50, 1, an)}
        {line(14, 76, 48, 50, 2, an)}
        {line(48, 50, 86, 50, 3, an, 0.6)}
        {dot(14, 24, 2.4, 0, an)}{dot(14, 50, 2.4, 1, an)}{dot(14, 76, 2.4, 2, an)}
        <circle cx={48} cy={50} r={8} fill={A} fillOpacity={0.15} />
        {dot(86, 50, 4, 3, an)}
      </>, size, 'Integratie', an);


    /* ── Hermetic sections ── */

    /* A fractal — the same shape repeating at every scale. */
    case 'hermetic_fractal_analysis':
      return frame(<>
        <polygon points="50,14 84,74 16,74" fill="none" stroke={A} strokeOpacity={0.5} strokeWidth={1.3}
          className={an ? 'ss-draw' : undefined} style={an ? ({ ['--len' as any]: 200 } as React.CSSProperties) : undefined} />
        <polygon points="50,44 67,74 33,74" fill={A} fillOpacity={0.10} stroke={A} strokeOpacity={0.4} strokeWidth={1.1} />
        <polygon points="50,59 58.5,74 41.5,74" fill={A} fillOpacity={0.18} stroke={A} strokeOpacity={0.35} strokeWidth={1} />
        {dot(50, 14, 2.4, 0, an)}{dot(84, 74, 2.4, 1, an)}{dot(16, 74, 2.4, 2, an)}
      </>, size, 'Fractale analyse', an);

    /* A map — separate nodes discovered to be one network. */
    case 'consciousness_integration_map':
      return frame(<>
        {line(24, 28, 50, 50, 0, an)}{line(76, 28, 50, 50, 1, an)}
        {line(20, 68, 50, 50, 2, an)}{line(80, 68, 50, 50, 3, an)}
        {line(24, 28, 76, 28, 4, an, 0.2)}{line(20, 68, 80, 68, 5, an, 0.2)}
        <circle cx={50} cy={50} r={9} fill={A} fillOpacity={0.16} />
        {dot(50, 50, 4, 0, an)}
        {dot(24, 28, 2.6, 1, an)}{dot(76, 28, 2.6, 2, an)}{dot(20, 68, 2.6, 3, an)}{dot(80, 68, 2.6, 4, an)}
      </>, size, 'Bewustzijnskaart', an);

    /* A framework — a structure you can actually stand something on. */
    case 'practical_activation_framework':
      return frame(<>
        <rect x={20} y={24} width={60} height={52} rx={4} fill="none" stroke={A} strokeOpacity={0.42} strokeWidth={1.3} />
        {line(20, 42, 80, 42, 0, an, 0.28)}{line(20, 60, 80, 60, 1, an, 0.28)}
        {line(40, 24, 40, 76, 2, an, 0.28)}{line(60, 24, 60, 76, 3, an, 0.28)}
        <rect x={40} y={42} width={20} height={18} fill={A} fillOpacity={0.22} />
        {dot(50, 51, 3, 0, an)}
      </>, size, 'Activatiekader', an);

    /* Seven laws — a heptagram, the figure seven actually makes. */
    case 'seven_laws_integration': {
      const pts = Array.from({ length: 7 }, (_, i) => {
        const a2 = ((-90 + (i * 360) / 7) * Math.PI) / 180;
        return [50 + 32 * Math.cos(a2), 50 + 32 * Math.sin(a2)] as [number, number];
      });
      return frame(<>
        <polygon points={pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
          fill={A} fillOpacity={0.06} stroke={A} strokeOpacity={0.32} strokeWidth={1.1} />
        {pts.map((q, i) => {
          const r = pts[(i + 2) % 7];
          return line(q[0], q[1], r[0], r[1], i, an, 0.4);
        })}
        {pts.map((q, i) => dot(q[0], q[1], 2.4, i, an))}
      </>, size, 'Zeven wetten', an);
    }

    /* Translation — one grammar mapped onto another. */
    case 'system_translations':
      return frame(<>
        {[30, 50, 70].map((y, i) => (
          <circle key={`a${y}`} cx={22} cy={y} r={4} fill="none" stroke={A} strokeOpacity={0.5} strokeWidth={1.2} />
        ))}
        {[30, 50, 70].map((y, i) => (
          <rect key={`b${y}`} x={74} y={y - 4} width={8} height={8} rx={1.5} fill={A} fillOpacity={0.5} />
        ))}
        {line(26, 30, 74, 50, 0, an)}{line(26, 50, 74, 30, 1, an)}{line(26, 70, 74, 70, 2, an)}
      </>, size, 'Systeemvertaling', an);

    /* A signature — one closed path no one else draws. */
    case 'blueprint_signature':
      return frame(<>
        <path d="M22 66 C30 34, 44 30, 50 46 S64 74, 74 40"
          fill="none" stroke={A} strokeOpacity={0.6} strokeWidth={1.8} strokeLinecap="round"
          className={an ? 'ss-draw' : undefined}
          style={an ? ({ ['--len' as any]: 140 } as React.CSSProperties) : undefined} />
        <circle cx={50} cy={50} r={30} fill="none" stroke={A} strokeOpacity={0.18} strokeWidth={1} />
        {dot(74, 40, 3.4, 1, an)}
      </>, size, 'Blauwdruk-signatuur', an);

    /* Gates — marked positions on a ring. */
    case 'gate_analyses': {
      const marks = Array.from({ length: 12 }, (_, i) => {
        const a2 = ((-90 + i * 30) * Math.PI) / 180;
        return [50 + 31 * Math.cos(a2), 50 + 31 * Math.sin(a2)] as [number, number];
      });
      return frame(<>
        <circle cx={50} cy={50} r={31} fill="none" stroke={A} strokeOpacity={0.3} strokeWidth={1.2} />
        {marks.map((q, i) => (
          <circle key={i} cx={q[0]} cy={q[1]} r={i % 3 === 0 ? 3.2 : 1.8}
            fill={A} fillOpacity={i % 3 === 0 ? 1 : 0.45}
            className={an ? 'ss-spark' : undefined}
            style={an ? ({ ['--i' as any]: i } as React.CSSProperties) : undefined} />
        ))}
        <circle cx={50} cy={50} r={7} fill={A} fillOpacity={0.14} />
      </>, size, 'Poorten', an);
    }

    /* Shadow — the same form, half in light. */
    case 'shadow_work':
      return frame(<>
        <circle cx={50} cy={50} r={30} fill="none" stroke={A} strokeOpacity={0.45} strokeWidth={1.3} />
        <path d="M50 20 A30 30 0 0 1 50 80 Z" fill={A} fillOpacity={0.30} />
        <path d="M50 20 A30 30 0 0 0 50 80 Z" fill={A} fillOpacity={0.06} />
        {dot(50, 50, 3, 0, an)}
      </>, size, 'Schaduwwerk', an);

    /* Layers of analysis — strata read together. */
    case 'intelligence_analysis':
      return frame(<>
        {[0, 1, 2, 3].map((i) => (
          <ellipse key={i} cx={50} cy={34 + i * 11} rx={30 - i * 2} ry={7}
            fill="none" stroke={A} strokeOpacity={0.22 + i * 0.08} strokeWidth={1.2}
            className={an ? 'ss-spark' : undefined}
            style={an ? ({ ['--i' as any]: i } as React.CSSProperties) : undefined} />
        ))}
        {dot(50, 67, 3.4, 4, an)}
      </>, size, 'Intelligentie-analyse', an);

    /* Anything else still stays geometric — a figure derived from the key
       itself, so a section we did not anticipate never falls back to a stock
       icon. Deterministic: the same section always draws the same shape. */
    default: {
      let h = 0;
      for (let i = 0; i < section.length; i++) h = (h * 31 + section.charCodeAt(i)) >>> 0;
      const sides = 5 + (h % 5);                 // 5–9
      const step = 2 + (h >> 3) % Math.max(1, Math.floor((sides - 1) / 2));
      const rot = (h >> 7) % 60;
      const pts = Array.from({ length: sides }, (_, i) => {
        const a2 = ((-90 + rot + (i * 360) / sides) * Math.PI) / 180;
        return [50 + 31 * Math.cos(a2), 50 + 31 * Math.sin(a2)] as [number, number];
      });
      const seen = new Set<string>();
      const chords: Array<[number, number]> = [];
      for (let i = 0; i < sides; i++) {
        const j = (i + step) % sides;
        const k = [Math.min(i, j), Math.max(i, j)].join('-');
        if (seen.has(k)) continue;
        seen.add(k);
        chords.push([i, j]);
      }
      return frame(<>
        <polygon points={pts.map((q) => `${q[0].toFixed(1)},${q[1].toFixed(1)}`).join(' ')}
          fill={A} fillOpacity={0.07} stroke={A} strokeOpacity={0.42} strokeWidth={1.2} />
        {chords.map(([i, j], n) => line(pts[i][0], pts[i][1], pts[j][0], pts[j][1], n, an, 0.34))}
        {pts.map((q, i) => dot(q[0], q[1], 2.2, i, an))}
      </>, size, section.replace(/_/g, ' '), an);
    }
  }
};

export default ReportSectionFigure;
