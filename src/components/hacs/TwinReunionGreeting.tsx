/**
 * TwinReunionGreeting — the Twin speaks first (Constitution v3.1).
 *
 * Rendered in place of the empty-conversation state: one composed
 * reunion, no cards, no widgets. Lines that earned no place that day
 * simply aren't there. The "surprise me" ingredient is intentionally
 * absent — noticed patterns stay with the guardian's ProactiveMoment.
 */

import React from 'react';
import type { TwinReunion } from '@/services/twin-reunion-service';

export const TwinReunionGreeting: React.FC<{ reunion: TwinReunion }> = ({ reunion }) => (
  <div className="w-full py-2 text-left animate-in fade-in-0 duration-500">
    <div className="text-sm leading-relaxed space-y-2.5">
      <p className="text-foreground font-medium">{reunion.greeting}</p>
      {reunion.remember && <p className="text-muted-foreground">{reunion.remember}</p>}
      {reunion.reminder && <p className="text-muted-foreground italic">{reunion.reminder}</p>}
      {reunion.continueLine && <p className="text-muted-foreground">{reunion.continueLine}</p>}
      <p className="text-muted-foreground">How are you today?</p>
    </div>
  </div>
);

export default TwinReunionGreeting;
