import { assertEquals, assertThrows } from 'https://deno.land/std@0.224.0/assert/mod.ts';
import { assertActionCopyPayload, assertPrimaryActionCopyPayload } from './contract.ts';

Deno.test('accepts one fast primary recommendation', () => {
  const result = assertPrimaryActionCopyPayload({
    question: 'Wat helpt je nu verder?',
    action: { action: 'achieve', label: 'Kies nu je eerste leerstap', rank: 1 },
  });
  assertEquals(result.action.action, 'achieve');
});

Deno.test('accepts the four fixed routes in ranked order', () => {
  const result = assertActionCopyPayload({
    question: 'Wat helpt je nu verder?',
    actions: [
      { action: 'remember', label: 'Onthoud deze kern voor later', rank: 4 },
      { action: 'achieve', label: 'Zet dit om in een haalbare eerste stap', rank: 1 },
      { action: 'understand', label: 'Onderzoek waarom dit je raakt', rank: 3 },
      { action: 'change_pattern', label: 'Doorbreek het patroon van blijven vergelijken', rank: 2 },
    ],
  });
  assertEquals(result.actions[0].action, 'achieve');
});

Deno.test('rejects an invented fifth route', () => {
  assertThrows(() => assertActionCopyPayload({
    question: 'What would help?',
    actions: [
      { action: 'achieve', label: 'Take the first practical step', rank: 1 },
      { action: 'change_pattern', label: 'Change the planning loop', rank: 2 },
      { action: 'understand', label: 'Understand what blocks action', rank: 3 },
      { action: 'explore', label: 'Explore another direction', rank: 4 },
    ],
  }));
});