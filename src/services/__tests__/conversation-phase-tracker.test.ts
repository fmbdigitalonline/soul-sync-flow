import { describe, it, expect } from 'vitest';
import { ConversationPhaseTracker } from '../../../supabase/functions/_shared/conversation-phase-tracker';

// Regression suite for the Dutch phase-detection defect.
// Every case asserts a real pattern match, i.e. the turn-count fallback is NOT reached.
const CASES: Array<[string, string, string]> = [
  // [message, language, expected cluster]
  ['hey there', 'en', 'engagement'],
  ['hoi, goedemorgen', 'nl', 'engagement'],
  ['what if we tried something else', 'en', 'exploration'],
  ['wat als we iets anders proberen', 'nl', 'exploration'],
  ['why does this keep happening', 'en', 'clarification'],
  ['waarom gebeurt dit steeds', 'nl', 'clarification'],
  ['give me the steps', 'en', 'decision'],
  ['hoe verzilver ik het concreet?', 'nl', 'decision'],
  ['ok I get it now', 'en', 'reflection'],
  ['ok ik snap het', 'nl', 'reflection'],
  ['i feel stuck', 'en', 'validation'],
  ['ik ben terug getrokken', 'nl', 'validation'],
  ['no budget and no time this week', 'en', 'constraint'],
  ['klinkt als veel werk', 'nl', 'constraint'],
  ['this is not working, useless', 'en', 'frustration'],
  ['dit werkt niet, waardeloos', 'nl', 'frustration'],
  ['just facts, be direct', 'en', 'meta_dialogue'],
  ['alleen feiten, wees direct', 'nl', 'meta_dialogue'],
  ['thanks, talk later', 'en', 'closure'],
  ['bedankt, tot later', 'nl', 'closure'],
];

describe('ConversationPhaseTracker bilingual detection', () => {
  for (const [msg, lang, cluster] of CASES) {
    it(`[${lang}] "${msg}" -> ${cluster}`, () => {
      const r = ConversationPhaseTracker.detectState(msg, []);
      expect(r.cluster).toBe(cluster);
    });
  }

  it('recognised Dutch phrases never reach the turn-count fallback (confidence 0.3 floor)', () => {
    for (const [msg, lang] of CASES) {
      if (lang !== 'nl') continue;
      const b = ConversationPhaseTracker.getSignalBreakdown(msg);
      const total =
        b.paralinguistic.length + b.sentenceForm.length + b.discourseMarkers.length + b.clusterPatterns.length;
      expect(total, `no signal for "${msg}"`).toBeGreaterThan(0);
    }
  });

  it('Dutch transcript produces the same cluster sequence as its English translation', () => {
    const nl = ['hoi, waar ik nu sta is lastig', 'ok ik snap het', 'ik ben terug getrokken', 'klinkt als veel werk', 'hoe verzilver ik het concreet?'];
    const en = ['hi, here where im at is hard', 'ok I get it now', 'i feel stuck', 'sounds like a lot of work', 'how do i start concretely?'];
    const seq = (msgs: string[]) => {
      const hist: any[] = [];
      return msgs.map((m) => {
        const r = ConversationPhaseTracker.detectState(m, hist);
        hist.push({ role: 'user', content: m }, { role: 'assistant', content: '...' });
        return r.cluster;
      });
    };
    expect(seq(nl)).toEqual(seq(en));
  });
});
