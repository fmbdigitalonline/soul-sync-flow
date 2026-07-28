/**
 * FunctionStack — the cognitive functions of an MBTI type, in order.
 *
 * Dominant on top, inferior at the base; the bar's width encodes its place in
 * the stack. The stacks are the standard ones, so the figure says something
 * true about how the mind is ordered rather than decorating four letters.
 */

import React from 'react';

const STACKS: Record<string, [string, string, string, string]> = {
  INTJ: ['Ni', 'Te', 'Fi', 'Se'], INTP: ['Ti', 'Ne', 'Si', 'Fe'],
  ENTJ: ['Te', 'Ni', 'Se', 'Fi'], ENTP: ['Ne', 'Ti', 'Fe', 'Si'],
  INFJ: ['Ni', 'Fe', 'Ti', 'Se'], INFP: ['Fi', 'Ne', 'Si', 'Te'],
  ENFJ: ['Fe', 'Ni', 'Se', 'Ti'], ENFP: ['Ne', 'Fi', 'Te', 'Si'],
  ISTJ: ['Si', 'Te', 'Fi', 'Ne'], ISFJ: ['Si', 'Fe', 'Ti', 'Ne'],
  ESTJ: ['Te', 'Si', 'Ne', 'Fi'], ESFJ: ['Fe', 'Si', 'Ne', 'Ti'],
  ISTP: ['Ti', 'Se', 'Ni', 'Fe'], ISFP: ['Fi', 'Se', 'Ni', 'Te'],
  ESTP: ['Se', 'Ti', 'Fe', 'Ni'], ESFP: ['Se', 'Fi', 'Te', 'Ni'],
};

export function functionStackFor(type?: string | null): [string, string, string, string] | null {
  if (!type || typeof type !== 'string') return null;
  const k = type.trim().toUpperCase().slice(0, 4);
  return STACKS[k] ?? null;
}

export const FunctionStack: React.FC<{
  type?: string | null;
  size?: number;
  className?: string;
  /** Draw the function abbreviations inside the bars. */
  labelled?: boolean;
}> = ({ type, size = 34, className, labelled = false }) => {
  const fs = functionStackFor(type);
  if (!fs) return null;

  const WIDTHS = [78, 60, 44, 30];
  const accent = 'var(--ss-accent)';

  return (
    <svg viewBox="0 0 100 76" width={size} height={size * 0.76} className={className}
      role="img" aria-label={`Functiestapel ${type}: ${fs.join(' · ')}`} style={{ display: 'block' }}>
      {fs.map((f, i) => {
        const w = WIDTHS[i];
        const y = 6 + i * 17;
        return (
          <g key={f + i}>
            <rect x={50 - w / 2} y={y} width={w} height={12} rx={4.5}
              fill={accent} fillOpacity={0.9 - i * 0.19} />
            {labelled && (
              <text x={50} y={y + 9} textAnchor="middle" fontSize={7.8} fontWeight={700}
                fill={i < 2 ? '#fff' : 'var(--ss-card)'} style={{ fontFamily: 'inherit' }}>{f}</text>
            )}
          </g>
        );
      })}
    </svg>
  );
};

export default FunctionStack;
