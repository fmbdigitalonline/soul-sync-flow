/**
 * PanelMyJourney — the perspective level (Constitution v3.4). ONE coherent
 * reflection, not a grid of widgets: who you are, the domains you're living
 * in, patterns that keep appearing, work in motion, turning points, and the
 * trajectory those suggest. Entered deliberately (collapsed by default),
 * reached from the Coach OS — perspective requires distance.
 */

import React, { useEffect, useState } from 'react';
import { Compass, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import { myJourneyService, type MyJourney } from '@/services/my-journey-service';

const COPY = {
  en: {
    entry: 'My Journey',
    entrySub: 'Step back and see the larger story',
    you: 'You',
    domains: 'Where you\'re living',
    patterns: 'What keeps appearing',
    programs: 'In motion',
    turningPoints: 'Turning points',
    trajectory: 'Trajectory',
    empty: 'Your journey is still early — as you talk, reflect, and work, the larger story will take shape here.',
    loading: 'Gathering the larger picture…',
  },
  nl: {
    entry: 'Mijn Reis',
    entrySub: 'Stap terug en zie het grotere verhaal',
    you: 'Jij',
    domains: 'Waar je leeft',
    patterns: 'Wat steeds terugkeert',
    programs: 'In beweging',
    turningPoints: 'Keerpunten',
    trajectory: 'Richting',
    empty: 'Je reis is nog pril — naarmate je praat, reflecteert en werkt, krijgt het grotere verhaal hier vorm.',
    loading: 'Het grotere beeld verzamelen…',
  },
};

export const PanelMyJourney: React.FC = () => {
  const { user } = useAuth();
  const { language } = useLanguage();
  const lang = language === 'nl' ? 'nl' : 'en';
  const t = COPY[lang];

  const [open, setOpen] = useState(false);
  const [journey, setJourney] = useState<MyJourney | null>(null);
  const [loaded, setLoaded] = useState(false);

  // Composed only when the user chooses to step back — cadence is the design.
  useEffect(() => {
    if (!open || loaded || !user) return;
    let cancelled = false;
    myJourneyService.getMyJourney(user.id, lang).then((j) => {
      if (!cancelled) {
        setJourney(j);
        setLoaded(true);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [open, loaded, user, lang]);

  const isEmpty =
    journey &&
    !journey.essence &&
    journey.domains.length === 0 &&
    journey.patterns.length === 0 &&
    journey.programs.length === 0 &&
    journey.turningPoints.length === 0;

  return (
    <div className="rounded-xl border border-soul-purple/20 bg-soul-purple/[0.03] overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-left hover:bg-soul-purple/[0.06] transition-colors"
      >
        <Compass className="h-4 w-4 shrink-0 text-soul-purple" />
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-foreground">{t.entry}</span>
          <span className="block text-[11px] text-muted-foreground">{t.entrySub}</span>
        </span>
        <ChevronRight
          className={cn('h-4 w-4 shrink-0 text-muted-foreground transition-transform', open && 'rotate-90')}
        />
      </button>

      {open && (
        <div className="px-3 pb-3 pt-1 border-t border-soul-purple/15 space-y-3">
          {!loaded ? (
            <p className="text-[11px] text-muted-foreground italic py-1">{t.loading}</p>
          ) : isEmpty ? (
            <p className="text-xs text-muted-foreground leading-relaxed py-1">{t.empty}</p>
          ) : (
            journey && (
              <>
                {journey.essence && (
                  <Block label={t.you}>
                    <p className="text-xs text-foreground">{journey.essence}</p>
                  </Block>
                )}
                {journey.domains.length > 0 && (
                  <Block label={t.domains}>
                    <div className="flex flex-wrap gap-1">
                      {journey.domains.map((d) => (
                        <span
                          key={d}
                          className="text-[10px] rounded-full px-2 py-0.5 bg-muted/60 text-muted-foreground capitalize"
                        >
                          {d.replace(/_/g, ' ')}
                        </span>
                      ))}
                    </div>
                  </Block>
                )}
                {journey.patterns.length > 0 && (
                  <Block label={t.patterns}>
                    <ul className="space-y-1">
                      {journey.patterns.map((p, i) => (
                        <li key={i} className="text-xs text-muted-foreground leading-relaxed">
                          · {p.text}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                {journey.programs.length > 0 && (
                  <Block label={t.programs}>
                    <ul className="space-y-1">
                      {journey.programs.map((p, i) => (
                        <li key={i} className="text-xs text-foreground">
                          {p.title}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                {journey.turningPoints.length > 0 && (
                  <Block label={t.turningPoints}>
                    <ul className="space-y-1">
                      {journey.turningPoints.map((e) => (
                        <li key={e.sessionId} className="text-xs text-muted-foreground truncate">
                          {e.title}
                        </li>
                      ))}
                    </ul>
                  </Block>
                )}
                {journey.trajectory && (
                  <Block label={t.trajectory}>
                    <p className="text-xs text-foreground/90 italic leading-relaxed">{journey.trajectory}</p>
                  </Block>
                )}
              </>
            )
          )}
        </div>
      )}
    </div>
  );
};

const Block: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <p className="text-[10px] font-semibold uppercase tracking-wider text-soul-purple/70">{label}</p>
    {children}
  </div>
);

export default PanelMyJourney;
