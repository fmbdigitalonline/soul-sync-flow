/**
 * BlueprintFigure — picks the notation a facet belongs to.
 *
 * Each system draws in its own language: astrology as constellations,
 * numerology as geometry, Human Design as the bodygraph, personality as the
 * function stack, the generational code as a seal. A facet outside those
 * systems, or a value we cannot read, renders nothing — the caller then falls
 * back to today's plain icon tile rather than showing an invented figure.
 */

import React from 'react';
import { ConstellationFigure, normaliseSign } from './ConstellationFigure';
import { NumerologyFigure } from './NumerologyFigure';
import { Bodygraph, normaliseHdType } from './Bodygraph';
import { FunctionStack, functionStackFor } from './FunctionStack';
import { ChineseSeal } from './ChineseSeal';

/** The description-category names BlueprintOverview already uses. */
const SIGN_CATEGORIES = new Set([
  'sunSignDescriptions', 'moonSignDescriptions', 'risingSignDescriptions',
]);
const NUMBER_CATEGORIES = new Set([
  'lifePathDescriptions', 'expressionNumberDescriptions', 'soulUrgeDescriptions',
  'personalityNumberDescriptions', 'birthdayNumberDescriptions',
]);

/**
 * Whether a facet has a notation we can honestly draw. Callers use this to
 * decide between the figure and the plain icon tile — a rendered
 * <BlueprintFigure> element is always truthy, so it cannot be tested directly.
 */
export function hasFigure(category: string, value: string | number): boolean {
  const v = String(value ?? '').trim();
  if (!v) return false;
  if (SIGN_CATEGORIES.has(category)) return !!normaliseSign(v);
  if (NUMBER_CATEGORIES.has(category)) {
    const n = Number(v);
    return Number.isFinite(n) && n > 0;
  }
  if (category === 'humanDesignDescriptions') return !!normaliseHdType(v);
  if (category === 'mbtiDescriptions') return !!functionStackFor(v);
  if (category === 'chineseZodiacDescriptions') return true;
  return false;
}

export interface BlueprintFigureProps {
  category: string;
  value: string | number;
  /** Second half of a compound value, e.g. the Chinese element. */
  detail?: string | null;
  size?: number;
  className?: string;
}

export const BlueprintFigure: React.FC<BlueprintFigureProps> = ({
  category, value, detail, size = 34, className,
}) => {
  const v = String(value ?? '').trim();
  if (!v) return null;

  if (SIGN_CATEGORIES.has(category) && normaliseSign(v)) {
    return <ConstellationFigure sign={v} size={size} className={className} elemental />;
  }

  if (NUMBER_CATEGORIES.has(category)) {
    const n = Number(v);
    if (Number.isFinite(n) && n > 0) {
      return <NumerologyFigure value={n} size={size} className={className} />;
    }
    return null;
  }

  if (category === 'humanDesignDescriptions' && normaliseHdType(v)) {
    return <Bodygraph type={v} size={size} className={className} />;
  }

  if (category === 'mbtiDescriptions' && functionStackFor(v)) {
    return <FunctionStack type={v} size={size} className={className} />;
  }

  if (category === 'chineseZodiacDescriptions') {
    // The row shows "Dragon Earth"; the animal is the first word.
    const [animal, ...rest] = v.split(/\s+/);
    return <ChineseSeal animal={animal} element={detail ?? rest.join(' ')} size={size} className={className} />;
  }

  return null;
};

export default BlueprintFigure;
