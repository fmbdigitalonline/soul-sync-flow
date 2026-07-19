/**
 * ProactiveMoment — the ONE visible surface of the Proactive Intelligence
 * Layer (Constitution v3.0). One observation, one choice, no dashboard.
 *
 * "I've noticed something… would it be useful to look at that?"
 * Answered with the existing intent grammar:
 *   🧠 Help me understand this → Twin, stays in conversation
 *   🌱 Help me change this pattern → Transformation flow
 *   Not now → suppress, log, respect the cooldown
 */

import React from 'react';
import { cn } from '@/lib/utils';

interface ProactiveMomentProps {
  observation: string;
  onUnderstand: () => void;
  onChange: () => void;
  onNotNow: () => void;
  className?: string;
}

export const ProactiveMoment: React.FC<ProactiveMomentProps> = ({
  observation,
  onUnderstand,
  onChange,
  onNotNow,
  className,
}) => (
  <div
    className={cn(
      'animate-in fade-in-0 slide-in-from-bottom-2 duration-300 rounded-xl border border-soul-purple/25 bg-soul-purple/5 p-3 space-y-2',
      className,
    )}
  >
    <p className="text-[10px] font-semibold uppercase tracking-wider text-soul-purple/80">
      I've noticed something
    </p>
    <p className="text-sm text-foreground leading-relaxed">{observation}</p>
    <p className="text-xs text-muted-foreground">Would it be useful to look at that?</p>
    <div className="flex flex-col gap-1 pt-0.5">
      <MomentButton emoji="🧠" label="Help me understand this" onClick={onUnderstand} />
      <MomentButton emoji="🌱" label="Help me change this pattern" onClick={onChange} />
      <button
        type="button"
        onClick={onNotNow}
        className="self-start text-xs text-muted-foreground hover:text-foreground px-2.5 py-1.5 transition-colors"
      >
        Not now
      </button>
    </div>
  </div>
);

const MomentButton: React.FC<{ emoji: string; label: string; onClick: () => void }> = ({
  emoji,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full flex items-center gap-2 text-left text-xs rounded-lg px-2.5 py-2 border border-border/50 hover:bg-soul-purple/10 hover:border-soul-purple/30 transition-colors"
  >
    <span className="shrink-0">{emoji}</span>
    <span className="text-foreground">{label}</span>
  </button>
);

export default ProactiveMoment;
