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

export type ReportSectionKey =
  | 'core_personality_pattern'
  | 'decision_making_style'
  | 'relationship_style'
  | 'life_path_purpose'
  | 'current_energy_timing'
  | 'integrated_summary';

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

    default:
      return null;
  }
};

/** Whether this section has a symbol of its own. */
export function hasSectionFigure(section: string): boolean {
  return [
    'core_personality_pattern', 'decision_making_style', 'relationship_style',
    'life_path_purpose', 'current_energy_timing', 'integrated_summary',
  ].includes(section);
}

export default ReportSectionFigure;
