/**
 * ChineseSeal — the animal as a seal, ringed by its element.
 *
 * Twelve animals × five elements, from one stored field. The character is the
 * traditional one; the ring colour is the element's own. Returns null for an
 * unrecognised animal rather than stamping an empty seal.
 */

import React from 'react';

const ANIMALS: Record<string, string> = {
  rat: '鼠', ox: '牛', tiger: '虎', rabbit: '兔', dragon: '龍', snake: '蛇',
  horse: '馬', goat: '羊', sheep: '羊', monkey: '猴', rooster: '雞', dog: '狗', pig: '豬', boar: '豬',
};

const ALIASES: Record<string, string> = {
  // Dutch
  rat: 'rat', os: 'ox', tijger: 'tiger', konijn: 'rabbit', haas: 'rabbit', draak: 'dragon',
  slang: 'snake', paard: 'horse', geit: 'goat', schaap: 'goat', aap: 'monkey',
  haan: 'rooster', hond: 'dog', varken: 'pig', zwijn: 'pig',
};

const ELEMENTS: Record<string, string> = {
  wood: '#6fae7d', fire: '#e8845c', earth: '#b3a273', metal: '#9aa4b0', water: '#5eb8b0',
  hout: '#6fae7d', vuur: '#e8845c', aarde: '#b3a273', metaal: '#9aa4b0',
};

function normaliseAnimal(v?: string | null): string | null {
  if (!v || typeof v !== 'string') return null;
  const first = v.trim().toLowerCase().split(/[\s,·]/)[0];
  if (ANIMALS[first]) return first;
  if (ALIASES[first] && ANIMALS[ALIASES[first]]) return ALIASES[first];
  return null;
}

export const ChineseSeal: React.FC<{
  animal?: string | null;
  element?: string | null;
  size?: number;
  className?: string;
}> = ({ animal, element, size = 34, className }) => {
  const key = normaliseAnimal(animal);
  if (!key) return null;
  const glyph = ANIMALS[key];
  const colour = ELEMENTS[String(element ?? '').trim().toLowerCase()] || 'var(--ss-accent)';

  return (
    <svg viewBox="0 0 68 68" width={size} height={size} className={className}
      role="img" aria-label={`${animal}${element ? ` · ${element}` : ''}`} style={{ display: 'block' }}>
      <rect x="4" y="4" width="60" height="60" rx="15" fill={colour} fillOpacity={0.12}
        stroke={colour} strokeOpacity={0.5} strokeWidth={1.6} />
      <rect x="11" y="11" width="46" height="46" rx="10" fill="none"
        stroke={colour} strokeOpacity={0.28} strokeWidth={1} />
      <text x="34" y="45" textAnchor="middle" fontSize="27" fontWeight={600} fill={colour}
        style={{ fontFamily: 'inherit' }}>{glyph}</text>
    </svg>
  );
};

export default ChineseSeal;
