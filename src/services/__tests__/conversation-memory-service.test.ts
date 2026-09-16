import { describe, it, expect, vi, beforeEach } from 'vitest';

// Regression suite for the thread-memory bugs (Runtime Constitution §B, bugs 1–2):
//  1. storeMessage upserted WITHOUT `mode` → rows defaulted to 'guide',
//     invisible to the oracle's mode='companion' read.
//  2. getProgressiveIntelligentContext was a stub returning [] → the client
//     sent an empty conversationHistory every turn.
//
// Test case (ground truth, defined before the fix):
//   Input: conversation_memory row for thread T with two validated messages
//          [user "ik twijfel over mijn baan", assistant "wat voelt er zwaar?"].
//   Expected: getProgressiveIntelligentContext(T, q) returns those messages,
//          non-empty, chronological — NOT [].
//   And: storeMessage's upsert payload must carry mode.

const upsertCalls: any[] = [];
let storedRow: any = null;

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: { id: 'user-1' } } }),
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockImplementation(() =>
            Promise.resolve({ data: storedRow, error: storedRow ? null : { message: 'not found' } }),
          ),
        })),
      })),
      upsert: vi.fn((payload: any) => {
        upsertCalls.push(payload);
        return Promise.resolve({ error: null });
      }),
    })),
  },
}));

vi.mock('../blueprint-health-checker', () => ({
  BlueprintHealthChecker: {
    logValidation: vi.fn(),
    logHealthCheck: vi.fn(),
    getHealthSummary: vi.fn().mockReturnValue({}),
  },
}));

// Avoid dynamic import of the semantic service inside the tested code path.
vi.mock('../semantic-memory-service', () => ({
  semanticMemoryService: {
    getSemanticContext: vi.fn().mockResolvedValue({
      semanticMessages: [],
      totalTokens: 0,
      selectionMethod: 'mocked',
    }),
    storeMessageEmbedding: vi.fn().mockResolvedValue(undefined),
  },
}));

import { conversationMemoryService } from '../conversation-memory-service';

describe('ConversationMemoryService thread-memory regressions', () => {
  beforeEach(() => {
    upsertCalls.length = 0;
    storedRow = null;
  });

  it('progressive context returns the thread messages, not []', async () => {
    storedRow = {
      session_id: 'thread-1',
      messages: [
        { id: 'm1', role: 'user', content: 'ik twijfel over mijn baan', timestamp: '2026-09-10T10:00:00Z' },
        { id: 'm2', role: 'assistant', content: 'wat voelt er zwaar aan die twijfel?', timestamp: '2026-09-10T10:01:00Z' },
      ],
      last_activity: '2026-09-10T10:01:00Z',
    };

    const result = await conversationMemoryService.getProgressiveIntelligentContext(
      'thread-1',
      'waarom twijfel ik?',
    );

    expect(result.length).toBeGreaterThan(0);
    expect(result.map(m => m.id)).toEqual(['m1', 'm2']); // chronological
    expect(result.every(m => m.content.trim().length > 0)).toBe(true);
  });

  it('progressive context on an unknown thread returns [] without throwing', async () => {
    storedRow = null;
    const result = await conversationMemoryService.getProgressiveIntelligentContext('missing', 'vraag');
    expect(result).toEqual([]);
  });

  it('storeMessage upsert carries mode (no silent guide default)', async () => {
    const ok = await conversationMemoryService.storeMessage(
      'thread-2',
      { id: 'm1', role: 'user', content: 'hallo', timestamp: new Date() },
      'user-1',
      'companion',
    );

    expect(ok).toBe(true);
    expect(upsertCalls.length).toBeGreaterThan(0);
    expect(upsertCalls[0].mode).toBe('companion');
    expect(upsertCalls[0].session_id).toBe('thread-2');
    expect(upsertCalls[0].user_id).toBe('user-1');
  });

  it('storeMessage defaults to companion mode when not specified', async () => {
    await conversationMemoryService.storeMessage(
      'thread-3',
      { id: 'm1', role: 'user', content: 'hallo', timestamp: new Date() },
      'user-1',
    );
    expect(upsertCalls[0].mode).toBe('companion');
  });
});
