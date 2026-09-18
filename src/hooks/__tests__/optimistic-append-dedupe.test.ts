import { describe, it, expect } from 'vitest';
import { findRecentDuplicateUserMessage } from '@/utils/duplicate-message-guard';
import type { ConversationMessage } from '@/hooks/use-hacs-conversation';

// Test case (ground truth: the 2026-09-17 duplicate-bubble bug report):
// A user sends "Het gaat goed". The optimistic append puts one user message in
// state. Mid-send, a fallback path appends the SAME content again. Expected:
// the guard returns the existing message so the second append is skipped —
// the user sees exactly one bubble, as confirmed against the screenshot and
// the single persisted user row.

const user = (id: string, content: string, timestamp: string): ConversationMessage => ({
  id,
  role: 'user',
  content,
  timestamp,
});

const hacs = (id: string, timestamp: string): ConversationMessage => ({
  id,
  role: 'hacs',
  content: 'Fijn om te horen dat het goed gaat.',
  timestamp,
});

describe('findRecentDuplicateUserMessage', () => {
  it('detects the same user turn appended twice mid-send (the reported bug)', () => {
    const t0 = 1789679892621;
    const prev = [user('client_1', 'Het gaat goed', new Date(t0).toISOString())];
    const dup = findRecentDuplicateUserMessage(prev, 'Het gaat goed', t0 + 2000);
    expect(dup?.id).toBe('client_1');
  });

  it('ignores whitespace differences when matching', () => {
    const t0 = 1789679892621;
    const prev = [user('client_1', 'Het gaat goed ', new Date(t0).toISOString())];
    expect(findRecentDuplicateUserMessage(prev, 'Het gaat goed', t0 + 1000)?.id).toBe('client_1');
  });

  it('does not swallow a different message mid-send', () => {
    const t0 = 1789679892621;
    const prev = [user('client_1', 'Het gaat goed', new Date(t0).toISOString())];
    expect(findRecentDuplicateUserMessage(prev, 'Andere tekst', t0 + 1000)).toBeUndefined();
  });

  it('allows the same content again once the assistant has replied (new turn)', () => {
    const t0 = 1789679892621;
    const prev = [
      user('client_1', 'ok', new Date(t0).toISOString()),
      hacs('hacs_1', new Date(t0 + 1000).toISOString()),
    ];
    expect(findRecentDuplicateUserMessage(prev, 'ok', t0 + 2000)).toBeUndefined();
  });

  it('allows the same content again after the freshness window expires', () => {
    const t0 = 1789679892621;
    const prev = [user('client_1', 'ok', new Date(t0).toISOString())];
    expect(findRecentDuplicateUserMessage(prev, 'ok', t0 + 6000)).toBeUndefined();
  });

  it('returns undefined for an empty history', () => {
    expect(findRecentDuplicateUserMessage([], 'anything', Date.now())).toBeUndefined();
  });

  it('treats an invalid existing timestamp as not-a-duplicate', () => {
    const prev = [user('client_1', 'ok', 'not-a-date')];
    expect(findRecentDuplicateUserMessage(prev, 'ok', Date.now())).toBeUndefined();
  });
});
