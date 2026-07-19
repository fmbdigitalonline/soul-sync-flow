/**
 * PanelProactivitySettings — the Proactive Intelligence Layer's ONE
 * user-facing control (Constitution v3.0). Two questions, chips not
 * forms: how proactive, and how direct. These govern thresholds,
 * frequency, phrasing register, and whether proactive moments appear
 * at all.
 */

import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  getProactivePrefs,
  setProactivePrefs,
  type ProactivityLevel,
  type DirectnessLevel,
} from '@/services/proactive-insight-guardian';

const PROACTIVITY: Array<{ value: ProactivityLevel; label: string }> = [
  { value: 'only_ask', label: 'Only when I ask' },
  { value: 'important', label: 'When something important repeats' },
  { value: 'observant', label: 'Be actively observant' },
];

const DIRECTNESS: Array<{ value: DirectnessLevel; label: string }> = [
  { value: 'gentle', label: 'Gentle' },
  { value: 'clear', label: 'Clear' },
  { value: 'direct', label: 'Direct' },
];

export const PanelProactivitySettings: React.FC = () => {
  const [prefs, setPrefs] = useState(getProactivePrefs());

  return (
    <div className="space-y-3">
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          How proactive should I be?
        </p>
        <div className="flex flex-col gap-1">
          {PROACTIVITY.map(({ value, label }) => (
            <Chip
              key={value}
              active={prefs.proactivity === value}
              label={label}
              onClick={() => setPrefs(setProactivePrefs({ proactivity: value }))}
            />
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          How direct should I be?
        </p>
        <div className="flex gap-1.5">
          {DIRECTNESS.map(({ value, label }) => (
            <Chip
              key={value}
              active={prefs.directness === value}
              label={label}
              onClick={() => setPrefs(setProactivePrefs({ directness: value }))}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

const Chip: React.FC<{ active: boolean; label: string; onClick: () => void }> = ({
  active,
  label,
  onClick,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={cn(
      'text-left text-xs rounded-lg px-2.5 py-1.5 border transition-colors',
      active
        ? 'border-soul-purple/40 bg-soul-purple/10 text-foreground'
        : 'border-border/50 text-muted-foreground hover:text-foreground hover:bg-muted/40',
    )}
  >
    {label}
  </button>
);

export default PanelProactivitySettings;
