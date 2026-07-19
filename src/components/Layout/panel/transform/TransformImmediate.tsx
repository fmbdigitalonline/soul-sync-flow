/**
 * TransformImmediate — the lightweight "Help me with this now" route (v2.8).
 *
 * The user is not enrolling in a program; they are processing one pattern
 * in the present moment. The Coach reflects it via the panel's own dock
 * (Twin stream stays clean), and a small "What would help now?" chip row
 * mounts existing tools contextually — never as a Tools menu.
 *
 * Micro-action is deliberately NOT persisted through InsightJournal — a
 * realization and a behavioural commitment are different objects.
 * Reflection → ReflectionPrompts; Realization → InsightJournal; Feeling →
 * MoodTracker. That's the whole surface.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { useWorkspace } from '@/contexts/WorkspaceContext';
import { useJourneyTracking } from '@/hooks/use-journey-tracking';
import { MoodTracker } from '@/components/coach/MoodTracker';
import { ReflectionPrompts } from '@/components/coach/ReflectionPrompts';
import { InsightJournal } from '@/components/coach/InsightJournal';
import { PanelCoachDock } from '../PanelCoachDock';

export const TransformImmediate: React.FC = () => {
  const { pendingTransformIntake, transformFlow, patchTransformFlow } = useWorkspace();
  const { addMoodEntry, addReflectionEntry, addInsightEntry } = useJourneyTracking();

  const pattern = pendingTransformIntake?.pattern ?? '';
  if (!pattern) return null;

  const stage = transformFlow.stage;

  const back = () => patchTransformFlow({ stage: 'help_menu' });

  return (
    <div className="space-y-3">
      {/* Container 1 — Coach reflects and asks one focused question. Uses
          the panel's own coach dock (guide-mode register), never the Twin. */}
      {(stage === 'chooser' || stage === 'reflect') && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            What is happening?
          </p>
          <PanelCoachDock
            contextKey={`transform_now_${pattern.slice(0, 40)}`}
            seedPrompt={`I want to work through this pattern right now, in the moment: "${pattern}". Reflect it back to me, then ask me one focused question — no lists, no menus.`}
            placeholder="Answer, or say 'I'm not sure'…"
          />
          <Button
            size="sm"
            variant="outline"
            className="w-full h-8 text-xs"
            onClick={() => patchTransformFlow({ stage: 'help_menu' })}
          >
            What would help now?
          </Button>
        </div>
      )}

      {/* Container 2 — max 3 contextual options. No "Tools" label anywhere. */}
      {stage === 'help_menu' && (
        <div className="space-y-2">
          <p className="text-[11px] uppercase tracking-wider text-emerald-700 dark:text-emerald-400 font-semibold">
            What would help now?
          </p>
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'tool_mood' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Name what I feel
            </button>
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'tool_reflection' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Explore the belief underneath
            </button>
            <button
              type="button"
              onClick={() => patchTransformFlow({ stage: 'tool_insight' })}
              className="text-left text-xs rounded-lg px-3 py-2 border border-emerald-500/25 bg-background/60 hover:bg-emerald-500/10"
            >
              Capture a realization
            </button>
          </div>
          <Button
            size="sm"
            variant="ghost"
            className="w-full h-7 text-[11px] text-muted-foreground"
            onClick={() => patchTransformFlow({ stage: 'reflect' })}
          >
            Back to conversation
          </Button>
        </div>
      )}

      {stage === 'tool_mood' && (
        <div className="space-y-2">
          <MoodTracker
            onMoodSave={(mood, energy) => {
              addMoodEntry({ mood, energy, pattern });
              patchTransformFlow({ stage: 'help_menu' });
            }}
          />
          <BackRow onBack={back} />
        </div>
      )}

      {stage === 'tool_reflection' && (
        <div className="space-y-2">
          <ReflectionPrompts
            onReflectionSave={(prompt, response) => {
              addReflectionEntry({ prompt, response, pattern });
              patchTransformFlow({ stage: 'help_menu' });
            }}
          />
          <BackRow onBack={back} />
        </div>
      )}

      {stage === 'tool_insight' && (
        <div className="space-y-2">
          <InsightJournal
            onInsightSave={(insight, tags) => {
              addInsightEntry({ insight, tags, pattern });
              patchTransformFlow({ stage: 'help_menu' });
            }}
          />
          <BackRow onBack={back} />
        </div>
      )}
    </div>
  );
};

const BackRow: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <Button size="sm" variant="ghost" className="w-full h-7 text-[11px] text-muted-foreground" onClick={onBack}>
    Back
  </Button>
);

export default TransformImmediate;